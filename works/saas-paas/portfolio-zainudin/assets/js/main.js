/* ====================================================================
   PORTF·ZA — main.js
   Platform Orkestrasi AI Negeri Sabah · SMJ 2.0
   Termasuk: Simulasi 11 Kementerian (PaaS) & Laporan KPI Masa Nyata KM
   ==================================================================== */
(function(){
  'use strict';
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ---------------- DATA ---------------- */
  const B = ['Okt','Nov','Dis','Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep'];

  const CHARTS = {
    negeri: {type:'bar', smallLabels:true, labels:['KW','KKR','KKT','PEND','PLB','PERT','PKAS','WK','PPI','PBKS','JPKN'],
      series:[{name:'% disepadukan', color:'#c9a227', values:[78,64,71,52,19,38,26,8,31,12,82]}]},
    kpi: {type:'line', area:true, labels:B,
      series:[{name:'% KPI hijau', color:'#1f7a55', values:[48,51,54,56,58,60,61,63,64,66,67,68]}]},
    dataset: {type:'bar', smallLabels:true, labels:['JPKN','KKT','KKR','KW','WK','PERT','PEND','PLB'],
      series:[{name:'Dataset', color:'#3b6ca8', values:[63,58,46,42,39,28,34,24]}]},
    format: {type:'donut', centre:'dataset',
      items:[{label:'API JSON', value:214, color:'#1f7a55'},
             {label:'CSV / XLSX', value:138, color:'#c9a227'},
             {label:'Pangkalan data (ODBC)', value:96, color:'#3b6ca8'},
             {label:'PDF / imbasan', value:62, color:'#b5403b'}]},
    ipu: {type:'line', area:true, labels:['1','2','3','4','5','6','7','8','9','10','11','12','13','14'],
      series:[{name:'IPU', color:'#b5403b', values:[62,68,74,83,91,104,118,126,141,152,168,178,164,148]},
              {name:'Ambang 100', color:'#7a8aa3', values:[100,100,100,100,100,100,100,100,100,100,100,100,100,100]}]},
    insiden: {type:'bar', labels:['KK','Sandakan','Tawau','Ranau','Beaufort','Kudat','Keningau'],
      series:[{name:'Insiden', color:'#b5403b', values:[24,16,14,9,7,6,5]}]},
    maas: {type:'line', area:true, labels:B,
      series:[{name:'Panggilan (ribu)', color:'#3b6ca8', values:[12,18,26,38,52,68,84,102,124,148,172,196]}]},
    agen: {type:'bar', labels:['Ringkasan','Aduan','Terjemahan','Ramalan','Kelasifikasi'],
      series:[{name:'Ribu panggilan', color:'#c9a227', values:[68,52,44,24,8]}]},
    radar: {type:'radar', axes:['Hab Data & API','Orkestrasi AI','Amaran Bencana','Tadbir Urus AI'],
      series:[{name:'SG Singapura', color:'#1f7a55', values:[5.0,4.6,4.2,5.0]},
              {name:'KR Korea', color:'#3b6ca8', values:[4.8,5.0,5.0,4.4]},
              {name:'JP Jepun', color:'#b5403b', values:[4.4,4.4,5.0,4.8]},
              {name:'CN China', color:'#c9a227', values:[5.0,5.0,4.6,3.8]}]}
  };

  /* 11 KEMENTERIAN NEGERI SABAH — struktur Kabinet 2025–2030 (disahkan sabah.gov.my)
     Disertakan dua entiti penyelaras: JPKN (Hab Data Negeri) & SUK (Setiausaha Kerajaan Negeri).
     'k' menandakan kementerian sebenar (dikira dalam 6/11 → 11/11); JPKN & SUK ialah penyelaras (tidak dikira).
     status: on / part / off */
  const KEMENTERIAN = [
    {s:'JPKN', n:'JPKN — Hab Data Negeri', d:63, p:82, st:'on', k:false, ep:'/v1/dataset/ingest', f:'Masa nyata', m:'dataset_id, agensi, skema, baris, kualiti', o:'JPKN', fmt:'API JSON'},
    {s:'KW', n:'Kementerian Kewangan', d:42, p:78, st:'on', k:true, ep:'/v1/kewangan/belanjawan', f:'Harian', m:'kod_vot, peruntukan, belanja, penyerapan', o:'Pejabat Belanjawan Negeri', fmt:'API JSON'},
    {s:'KKT', n:'Kementerian Kerajaan Tempatan & Perumahan', d:58, p:71, st:'on', k:true, ep:'/v1/kkt/perumahan', f:'15 minit', m:'permohonan_id, pbt, status, hari_proses', o:'Bahagian Perumahan', fmt:'API JSON'},
    {s:'KKR', n:'Kementerian Kerja Raya & Utiliti', d:46, p:64, st:'on', k:true, ep:'/v1/kkr/utiliti', f:'30 saat', m:'zon, tekanan_bar, aliran_m3j, status', o:'Jabatan Air Sabah', fmt:'API JSON'},
    {s:'PEND', n:'Kementerian Pendidikan, Sains, Teknologi & Inovasi', d:34, p:52, st:'on', k:true, ep:'/v1/pendidikan/enrolmen', f:'Mingguan', m:'sekolah_id, enrolmen, daerah, aliran', o:'JPN Sabah', fmt:'CSV / XLSX'},
    {s:'PERT', n:'Kementerian Pertanian, Perikanan & Industri Makanan', d:28, p:38, st:'on', k:true, ep:'/v1/pertanian/hasil', f:'Bulanan', m:'tanaman_id, keluaran_tan, daerah, musim', o:'Bahagian Pertanian', fmt:'CSV / XLSX'},
    {s:'SUK', n:'Pejabat Setiausaha Kerajaan Negeri', d:37, p:60, st:'on', k:false, ep:'/v1/suk/surat', f:'Harian', m:'rujukan, tarikh, kementerian, status', o:'SUK (Bahagian ICT)', fmt:'API JSON'},
    {s:'KMSUK', n:'Portfolio Ketua Menteri (SUK & Perancangan Negeri)', d:29, p:23, st:'part', k:true, ep:'/v1/km/perancangan', f:'Harian', m:'program_id, agensi, peruntukan, status', o:'Pejabat Ketua Menteri', fmt:'CSV / XLSX'},
    {s:'PPI', n:'Kementerian Perindustrian, Keusahawanan & Pengangkutan', d:22, p:31, st:'on', k:true, ep:'/v1/perindustrian/lesen', f:'Bulanan', m:'lesen_id, syarikat, sektor, status', o:'Bahagian Perindustrian', fmt:'API JSON'},
    {s:'PKAS', n:'Kementerian Pelancongan, Kebudayaan & Alam Sekitar', d:31, p:26, st:'part', k:true, ep:'/v1/pelancongan/ketibaan', f:'Mingguan', m:'tarikh, ketibaan, negara, pintu_masuk', o:'Lembaga Pelancongan Sabah', fmt:'API JSON'},
    {s:'PLB', n:'Kementerian Pembangunan Luar Bandar', d:24, p:19, st:'part', k:true, ep:'/v1/luarbandar/projek', f:'Bulanan', m:'projek_id, kampung, peruntukan, status', o:'Bahagian Luar Bandar', fmt:'CSV / XLSX'},
    {s:'PBKS', n:'Kementerian Pembangunan Belia, Kemajuan Sukan & Ekonomi Kreatif', d:18, p:12, st:'off', k:true, ep:'/v1/belia/program', f:'Suku tahunan', m:'program_id, peserta, daerah, kategori', o:'Bahagian Belia & Sukan', fmt:'PDF / imbasan'},
    {s:'WK', n:'Kementerian Wanita, Kesihatan & Kesejahteraan Rakyat', d:16, p:8, st:'off', k:true, ep:'/v1/wanita/kesihatan', f:'Suku tahunan', m:'program_id, peserta, daerah, klinik_id', o:'Bahagian Wanita & Kesihatan', fmt:'PDF / imbasan'}
  ];

  /* 13 PETUNJUK SMJ 2.0 — status: g / a / r */
  const PETUNJUK = [
    {n:'Pertumbuhan KDNK negeri', v:'5.2', u:'%', s:'≥ 5.0%', st:'g', pct:104, t:'+0.4'},
    {n:'Kadar kemiskinan tegar', v:'0.9', u:'%', s:'≤ 1.0%', st:'g', pct:90, t:'-0.3'},
    {n:'Pendapatan median isi rumah', v:'5,842', u:'RM', s:'RM 6,500', st:'a', pct:90, t:'+4.1'},
    {n:'Kadar pengangguran', v:'3.2', u:'%', s:'≤ 3.5%', st:'g', pct:91, t:'-0.2'},
    {n:'Liputan air bersih luar bandar', v:'92', u:'%', s:'≥ 95%', st:'g', pct:97, t:'+3.0'},
    {n:'Liputan elektrik', v:'97', u:'%', s:'≥ 98%', st:'g', pct:99, t:'+1.0'},
    {n:'NRW (kehilangan air tanpa hasil)', v:'47.8', u:'%', s:'≤ 42%', st:'r', pct:88, t:'-2.6'},
    {n:'Kelulusan perumahan rakyat', v:'6.2', u:'hari', s:'≤ 3 hari', st:'r', pct:48, t:'-7.8'},
    {n:'Liputan jalur lebar', v:'84', u:'%', s:'≥ 90%', st:'g', pct:93, t:'+6.0'},
    {n:'Pendigitalan PBT', v:'12', u:'/ 25', s:'25 PBT', st:'a', pct:48, t:'+4'},
    {n:'Aduan PBT dalam SLA', v:'78', u:'%', s:'≥ 75%', st:'g', pct:104, t:'+24'},
    {n:'Penglibatan graduan TVET', v:'71', u:'%', s:'≥ 70%', st:'g', pct:101, t:'+5.0'},
    {n:'Bencana dengan amaran ≥ 30 min', v:'84', u:'%', s:'≥ 90%', st:'g', pct:93, t:'+12'}
  ];

  /* ---------------- SEKSYEN ---------------- */
  function hero(){
    return `
      <div class="hero-inner">
        <div class="hero-top">
          <span class="pill">PROTOTAIP KONSEP · PANDUAN PEMULAAN</span>
          <span class="pill-line">SaaS/PaaS v0.1 · Berasaskan kajian penanda aras 4 negara</span>
        </div>
        <h1 class="serif">Dari <em class="gold">Silo</em> kepada <em class="gold">Negeri Berkeputusan</em></h1>
        <p class="lede"><b>PORTF·ZA</b> ialah platform orkestrasi AI negeri Sabah — prototaip konsep SaaS/PaaS yang menyatukan <b>11 kementerian</b> di bawah satu hab data berdaulat dan satu Kokpit KPI <b>SMJ 2.0</b> masa nyata untuk Ketua Menteri. Direka sebagai petunjuk dan panduan kerja pelaksanaan untuk pentadbiran negeri, dipetakan daripada amalan terbaik <em>Singapura, Korea Selatan, Jepun dan China</em>.</p>
        <blockquote class="motto">"Satu negeri. 11 kementerian. Satu rekod. Satu keputusan."</blockquote>
        <div class="hero-cta">
          <a href="#demo" class="btn-gold">Lihat Demo Dashboard</a>
          <a href="#integrasi" class="btn-outline">Simulasi 11 Kementerian</a>
        </div>
        <div class="hero-stats">
          <div><b>11</b><span>Kementerian disasarkan</span></div>
          <div><b>6 / 11</b><span>Telah disepadukan</span></div>
          <div><b>68%</b><span>KPI SMJ 2.0 dicapai</span></div>
          <div><b>3</b><span>Insiden aktif (PKOB)</span></div>
        </div>
      </div>`;
  }

  function jurang(){
    const cards = [
      {n:'01', t:'Data bersilo 11 kementerian', p:'Tiada hab data negeri — setiap kementerian ada pangkalan data, format dan takrif sendiri. KDNK, kemiskinan dan bencana tidak boleh dilihat pada satu skrin.', r:'Korea (City Data Hub), Singapura (data.gov.sg)'},
      {n:'02', t:'KPI SMJ 2.0 dilapor manual', p:'13 petunjuk utama dikumpul melalui spreadsheet &amp; emel — Ketua Menteri menerima angka minggu lepas, bukan hari ini.', r:'Jepun (Digital Agency Dashboard), Korea (KPI berkanun)'},
      {n:'03', t:'Amaran bencana lambat', p:'PKOB bergantung pada panggilan telefon &amp; media sosial; masa tindak balas purata 42 minit berbanding sasaran &lt; 30 minit.', r:'Jepun (NTT DATA D-Resilio + Spectee), Korea (재난문자)'},
      {n:'04', t:'Tadbir urus AI tidak wujud', p:'Tiada rangka kerja penilaian model sebelum ke pengeluaran — setiap agensi membeli AI sendiri tanpa jejak audit.', r:'Singapura (AI Verify), Jepun (AI Guidelines)'},
      {n:'05', t:'Kapasiti AI tempatan rendah', p:'Tiada model bahasa yang benar-benar menguasai Bahasa Melayu &amp; konteks Sabah — LLM global gagal pada istilah pentadbiran negeri.', r:'Singapura (SEA-LION), China (model domestik)'}
    ].map(c=>`
      <div class="card-jurang">
        <div class="num">${c.n}</div>
        <h3>${c.t}</h3>
        <p>${c.p}</p>
        <p class="ref">Penyelesaian rujukan: <b>${c.r}</b></p>
      </div>`).join('');
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold">MASALAH YANG DISAHKAN</span>
          <h2 class="serif">Lima Jurang yang Mesti Ditutup</h2>
          <p class="sec-lede">Dokumen PORTF·ZA mengesahkan lima jurang pelaksanaan — setiap satunya telah menemui penyelesaiannya di keempat-empat negara rujukan. Platform ini direka tepat untuk menutup kelima-limanya.</p>
        </div>
        <div class="jurang-grid">
          ${cards}
          <div class="card-impact">
            <span class="impact-label">Kos tidak bertindak</span>
            <div class="impact-big">32<span>%</span></div>
            <p>Daripada 13 petunjuk utama SMJ 2.0, 4 masih di bawah sasaran — bersamaan RM1.2 bilion perbelanjaan pembangunan tanpa ukuran kesan masa nyata. Inilah sebab orkestrasi AI bukan pilihan — ia tanggungjawab fidusiari.</p>
          </div>
        </div>
      </div>`;
  }

  function demo(){
    const panels = {
      ringkasan: `
        <div class="chart-card"><h3>Status integrasi data mengikut kementerian</h3><p>% dataset diterbitkan ke hab data · simulasi</p><div id="ch-negeri" class="chart-area"></div></div>
        <div class="chart-card"><h3>KPI SMJ 2.0 dicapai (%)</h3><p>12 bulan · 9 daripada 13 petunjuk utama hijau</p><div id="ch-kpi" class="chart-area"></div></div>`,
      integrasi: `
        <div class="chart-card"><h3>Dataset diterbitkan per kementerian</h3><p>jumlah set data tersedia melalui gerbang API · simulasi</p><div id="ch-dataset" class="chart-area"></div></div>
        <div class="chart-card"><h3>Format data yang diterima</h3><p>510 dataset · API JSON paling bersih, PDF paling sukar</p><div id="ch-format" class="chart-area donut"></div></div>`,
      krisis: `
        <div class="chart-card"><h3>IPU harian — Kota Kinabalu (14 hari)</h3><p>ambang tidak sihat &gt; 100 · PKOB diaktifkan pada puncak 178</p><div id="ch-ipu" class="chart-area"></div></div>
        <div class="chart-card"><h3>Insiden bencana mengikut daerah</h3><p>30 hari terakhir · data agregat JPBN · simulasi</p><div id="ch-insiden" class="chart-area"></div></div>`,
      ai: `
        <div class="chart-card"><h3>Panggilan API MaaS (ribu / bulan)</h3><p>penggunaan model bahasa oleh agen AI negeri · simulasi</p><div id="ch-maas" class="chart-area"></div></div>
        <div class="chart-card"><h3>Penggunaan mengikut jenis agen AI</h3><p>ribu panggilan bulan ini · simulasi</p><div id="ch-agen" class="chart-area"></div></div>`
    };
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold-light">BUKTI KONSEP INTERAKTIF</span>
          <h2 class="serif light">Kokpit PORTF·ZA — Dashboard Eksekutif</h2>
          <p class="sec-lede light">Inilah wajah SaaS yang dicadangkan: satu skrin untuk menjawab soalan Kabinet — kementerian mana belum masuk, petunjuk mana merah, bencana mana aktif. Kubahkan tab di bawah untuk mencuba sendiri.</p>
          <p class="note-ilus">Angka portfolio (11 kementerian, 6 disepadukan, 68% KPI) dipetik daripada laporan TSKN; baki titik data adalah <span class="tag-ilus">ILUSTRATIF</span>.</p>
        </div>
        <div class="kpi-row">
          <div class="kpi"><b>6 / 11</b><span>Kementerian disepadukan</span><em>sasaran 11</em></div>
          <div class="kpi"><b>68%</b><span>KPI SMJ 2.0 hijau</span><em>9 / 13 petunjuk</em></div>
          <div class="kpi"><b>3</b><span>Insiden aktif (PKOB)</span><em>banjir · IPU · tanah runtuh</em></div>
          <div class="kpi"><b>42 min</b><span>Masa tindak balas purata</span><em>sasaran &lt; 30 min</em></div>
        </div>
        <div class="tabs" id="tabs-demo">
          <button class="tab active" data-tab="ringkasan">Ringkasan Negeri</button>
          <button class="tab" data-tab="integrasi">Integrasi Kementerian</button>
          <button class="tab" data-tab="krisis">Krisis &amp; Bencana</button>
          <button class="tab" data-tab="ai">Analitik AI</button>
        </div>
        <div class="tab-panel active" data-panel="ringkasan">${panels.ringkasan}</div>
        <div class="tab-panel" data-panel="integrasi">${panels.integrasi}</div>
        <div class="tab-panel" data-panel="krisis">${panels.krisis}</div>
        <div class="tab-panel" data-panel="ai">${panels.ai}</div>
      </div>`;
  }

  /* -------- SIMULASI 11 KEMENTERIAN (PaaS) -------- */
  function integrasi(){
    const chips = KEMENTERIAN.map((k,i)=>`
      <button class="mchip ${k.st} ${i===0?'sel':''}" data-i="${i}">
        <span class="mn">${esc(k.s)} · ${esc(k.n.split(' — ')[0])}</span>
        <span class="mb"><span class="dot"></span><span class="bar"><i style="width:${k.p}%"></i></span><span class="mp">${k.p}%</span></span>
      </button>`).join('');

    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold">SIMULASI PaaS NEGERI</span>
          <h2 class="serif">11 Kementerian Disepadukan dalam Satu PaaS</h2>
          <p class="sec-lede">Klik mana-mana kementerian untuk melihat profil data, endpoint API dan tahap penyepaduan. Tekan <b>Jalankan Simulasi</b> untuk melihat keseluruhan negeri disambungkan ke gerbang berdaulat — daripada 6 kepada 11 kementerian. <span style="opacity:.75">JPKN (Hab Data Negeri) &amp; SUK (Pejabat SUK) ialah entiti penyelaras, tidak dikira dalam 11 kementerian.</span></p>
        </div>

        <div class="sim-console">
          <div class="sim-bar">
            <b>Gerbang API &amp; Hab Data Negeri</b>
            <span class="sim-status" id="simStatus"><i></i> Bersedia</span>
            <span class="sim-count" id="simCount">6<small> / 11 disepadukan</small></span>
          </div>
          <div class="sim-body">
            <div class="ministry-grid" id="mGrid">${chips}</div>
            <div>
              <div class="sim-detail" id="simDetail"></div>
              <div class="sim-log" id="simLog"><div><span class="t">[--:--:--]</span> <span class="hl">Sistem sedia.</span> 6 daripada 11 kementerian telah disepadukan. Tekan "Jalankan Simulasi" untuk meneruskan.</div></div>
            </div>
          </div>
          <div class="sim-foot">
            <button class="btn-gold" id="btnSim" onclick="SIM.run()">▶ Jalankan Simulasi</button>
            <button class="btn-outline" onclick="SIM.reset()">↺ Set Semula</button>
            <div class="sim-legend">
              <span><i style="background:#2ecc71"></i> Disepadukan</span>
              <span><i style="background:#c9a227"></i> Separa</span>
              <span><i style="background:#5a6478"></i> Belum bermula</span>
            </div>
          </div>
        </div>

        <div class="paas-flow">
          <h4>Aliran PaaS — daripada 11 sumber kepada 3 keluaran</h4>
          <p class="pf-sub">Setiap kementerian menghantar ke satu gerbang; gerbang menormalisasi, mengaudit &amp; mengagihkan semula.</p>
          <div id="flowSvg"></div>
        </div>
      </div>`;
  }

  /* -------- LAPORAN KPI MASA NYATA (KETUA MENTERI) -------- */
  function kpiKm(){
    const rows = PETUNJUK.map(p=>`
      <tr>
        <td>${esc(p.n)}</td>
        <td><span class="sc-num">${esc(p.v)}</span> <span style="color:var(--muted);font-size:11.5px">${esc(p.u)}</span></td>
        <td style="color:var(--muted)">${esc(p.s)}</td>
        <td><span class="tl ${p.st}">${p.st==='g'?'Hijau':(p.st==='a'?'Ambar':'Merah')}</span></td>
        <td style="width:110px"><span class="sc-bar"><i style="width:${Math.min(100,p.pct)}%"></i></span></td>
        <td class="sc-trend ${/^-/.test(p.t)?'down':'up'}">${esc(p.t)}</td>
      </tr>`).join('');

    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold">LAPORAN KABINET · MASA NYATA</span>
          <h2 class="serif">Laporan KPI SMJ 2.0 untuk Ketua Menteri</h2>
          <p class="sec-lede">Dijana terus daripada Kokpit PORTF·ZA — setiap angka dikemas kini secara langsung daripada sistem kementerian, bukan spreadsheet. Ketua Menteri melihat keadaan negeri pada saat ini, bukan minggu lepas.</p>
        </div>

        <div class="km-wrap">
          <div class="km-head">
            <div>
              <h4>Laporan Prestasi SMJ 2.0 — Negeri Sabah</h4>
              <div class="km-sub">Disatukan daripada 11 kementerian · 510 dataset · 13 petunjuk utama</div>
            </div>
            <span class="live-badge"><i></i> LANGSUNG</span>
            <div class="km-clock">Dikemas kini <b id="kmAgo">0s</b> lalu · <span id="kmTime">--:--:--</span></div>
          </div>

          <div class="km-kpis">
            <div class="km-kpi"><span class="kk-lab">KPI SMJ 2.0 dicapai</span><span class="kk-val" id="kv1">68<span class="kk-unit">%</span></span><span class="kk-meta">9 hijau · 2 ambar · 2 merah</span><div class="kk-spark" id="ks1"></div></div>
            <div class="km-kpi"><span class="kk-lab">Kementerian disepadukan</span><span class="kk-val" id="kv2">6<span class="kk-unit">/ 11</span></span><span class="kk-meta">+1 bulan ini</span><div class="kk-spark" id="ks2"></div></div>
            <div class="km-kpi"><span class="kk-lab">Insiden aktif</span><span class="kk-val" id="kv3">3</span><span class="kk-meta">PKOB · banjir, IPU, tanah runtuh</span><div class="kk-spark" id="ks3"></div></div>
            <div class="km-kpi"><span class="kk-lab">Masa tindak balas</span><span class="kk-val" id="kv4">42<span class="kk-unit">min</span></span><span class="kk-meta">sasaran &lt; 30 min</span><div class="kk-spark" id="ks4"></div></div>
          </div>

          <div class="scorecard">
            <h5>13 Petunjuk Utama SMJ 2.0</h5>
            <div class="tbl-wrap"><table class="sc-tbl">
              <thead><tr><th>Petunjuk</th><th>Semasa</th><th>Sasaran</th><th>Status</th><th>Kemajuan</th><th>Δ</th></tr></thead>
              <tbody>${rows}</tbody>
            </table></div>
          </div>

          <div class="km-alerts">
            <h5 style="font-family:var(--sans);font-size:13px;color:var(--navy);text-transform:uppercase;letter-spacing:.06em;margin:4px 0 10px">Amaran untuk perhatian segera</h5>
            <div class="km-alert crit"><b>NRW 47.8%</b> — masih 5.8 pt di atas sasaran 42%; zon Pitas (64.8%) dan Kudat (63.7%) paling kritikal.<span class="ka-t">U2 · KKR</span></div>
            <div class="km-alert warn"><b>IPU 178</b> — Kota Kinabalu melepasi ambang tidak sihat; 8 PPS dibuka, 1,842 keluarga terjejas.<span class="ka-t">U6 · JPBN</span></div>
            <div class="km-alert"><b>Pendigitalan PBT 12/25</b> — 13 PBT lagi belum masuk gerbang ePBT.<span class="ka-t">U4 · KKT</span></div>
          </div>

          <div class="km-foot">
            <button class="btn-gold" onclick="KM.refresh()">↻ Muat Semula</button>
            <button class="btn-outline" onclick="KM.export()">⇩ Eksport PDF</button>
            <button class="btn-outline" onclick="KM.share()">✉ Kongsi ke Ketua Menteri</button>
            <span class="km-note">Sumber data: Kokpit PORTF·ZA (simulasi) · Tiada data sebenar negeri digunakan</span>
          </div>
          <div class="refresh-bar"><i id="rfBar"></i></div>
        </div>
      </div>`;
  }

  function benchmark(){
    const countries = [
      {id:'sg', flag:'🇸🇬', name:'Singapura', tag:'Guru hab data terbuka & tadbir urus AI',
        intro:'GovTech · data.gov.sg · AI Verify',
        desc:'Lebih 9,000 dataset daripada 70+ agensi diterbitkan melalui data.gov.sg dengan API piawai. AI Verify (IMDA) ialah rangka kerja ujian AI pertama di dunia yang boleh diaudit — digunakan secara sukarela oleh syarikat sebelum pelancaran.',
        stats:[['9,000+','Dataset awam'],['70+','Agensi menyumbang'],['AI Verify','Rangka tadbir urus'],['APEX','Gerbang API kerajaan']],
        sub:[
          {h:'Satu gerbang untuk semua agensi', p:'APEX (API Exchange) membenarkan agensi berkongsi API secara selamat tanpa dedahkan sistem dalaman — model terus untuk Hab Data Sabah.'},
          {h:'Tadbir urus AI yang boleh diaudit', p:'AI Verify menjalankan ujian kebolehjelasan, keadilan & keteguhan; laporan boleh dikongsi dengan pengawal selia (padanan Z5).'},
          {h:'Identiti digital sebagai asas', p:'Singpass & MyInfo Business membekalkan medan tersahih — tiada pengulangan borang merentas agensi.'}
        ]},
      {id:'kr', flag:'🇰🇷', name:'Korea Selatan', tag:'Guru orkestrasi & amaran bencana berkanun',
        intro:'City Data Hub · Digital Platform Government · 재난문자',
        desc:'City Data Hub menyatukan data 600+ sistem bandar ke satu platform; Sistem Amaran Bencana (재난문자) diwajibkan oleh undang-undang untuk menyampaikan amaran kepada semua telefon di kawasan terjejas dalam 60 saat.',
        stats:[['600+','Sistem disepadukan'],['60 saat','Amaran bencana'],['DPG','Platform kerajaan digital'],['KPI berkanun','Setiap kementerian']],
        sub:[
          {h:'KPI berkanun per kementerian', p:'Setiap kementerian wajib terbitkan KPI berangka tahunan dengan sasaran — Parlimen boleh menuntut (padanan Z3).'},
          {h:'Digital Platform Government (DPG)', p:'Satu platform untuk semua perkhidmatan kerajaan; agensi bina di atas komponen kongsi, bukan sistem berasingan.'},
          {h:'Amaran bencana wajib 60 saat', p:'Penyiar tersedia diwajibkan menyampaikan amaran — liputan hampir 100% populasi (padanan Z4).'}
        ]},
      {id:'jp', flag:'🇯🇵', name:'Jepun', tag:'Guru dashboard kebangsaan & operasi krisis',
        intro:'Digital Agency Dashboard · NTT DATA D-Resilio · Spectee Pro',
        desc:'Digital Agency menerbitkan dashboard KPI kebangsaan yang boleh dilihat sesiapa sahaja; D-Resilio mengautomasikan aliran kerja bencana (pemindahan, bekalan, PPS) manakala Spectee mengesan insiden daripada SNS & kamera dalam masa nyata.',
        stats:[['Digital Agency','Penerbit KPI'],['D-Resilio','Automasi krisis'],['Spectee','Pengesanan SNS × AI'],['~30 min','Tindak balas piawai']],
        sub:[
          {h:'Dashboard KPI yang boleh dilihat awam', p:'Japan Dashboard menunjukkan kemajuan 200+ petunjuk reformasi digital — telus & sentiasa terkini (padanan Z3).'},
          {h:'Automasi aliran kerja bencana', p:'D-Resilio mengurus pemindahan, logistik & laporan secara automatik — mengurangkan beban koordinasi manual (padanan Z4).'},
          {h:'Pengesanan awal berasaskan AI', p:'Spectee Pro menggabung SNS, CCTV & sensor untuk amaran awal sebelum laporan rasmi tiba.'}
        ]},
      {id:'cn', flag:'🇨🇳', name:'China', tag:'Guru skala & orkestrasi bandar',
        intro:'City Brain · 一网通办 · Platform Data Kebangsaan',
        desc:'City Brain (Hangzhou) memproses data daripada 24 jabatan bandar untuk mengoptimumkan trafik, kesihatan & keselamatan; sistem 一网通办 ("satu jaringan untuk semua urusan") membolehkan rakyat selesaikan urusan tanpa hadir ke pejabat.',
        stats:[['24 jabatan','Disepadukan (Hangzhou)'],['1.4 b','Rekod diproses'],['一网通办','Satu jaringan'],['NECIPS','Kredit korporat tunggal']],
        sub:[
          {h:'City Brain — otak bandar berskala', p:'Satu pusat menggabung trafik, perubatan & keselamatan; keputusan dijana secara automatik (padanan Z1 & Z6).'},
          {h:'Satu jaringan untuk semua urusan', p:'一网通办 menghapuskan keperluan hadir fizikal — 90% urusan kerajaan boleh diselesaikan dalam talian.'},
          {h:'Model domestik & kedaulatan data', p:'Model AI dibangunkan dalam negara; data sensitif tidak keluar — rujukan untuk keperluan kedaulatan Sabah.'}
        ]}
    ];

    const tabs = countries.map((c,i)=>`<button class="ctab ${i===0?'active':''}" data-c="${c.id}"><span class="flag">${c.flag}</span>${c.name}</button>`).join('');
    const panels = countries.map((c,i)=>`
      <div class="cpanel ${i===0?'active':''}" data-cpanel="${c.id}">
        <div class="cpanel-head ${c.id}">${c.flag} ${c.name} · ${c.tag}</div>
        <div class="cpanel-grid">
          <div class="card-sumber"><p class="cs-sumber">Profil rujukan ${c.name}</p><h4>${c.intro}</h4><p>${c.desc}</p></div>
          <div class="cs-stats">${c.stats.map(s=>`<div><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div>
        </div>
        <div class="cs-rows">${c.sub.map(x=>`<div><h5>${x.h}</h5><p>${x.p}</p></div>`).join('')}</div>
      </div>`).join('');

    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold">GROUNDING ANTARABANGSA</span>
          <h2 class="serif">Empat Negara, Empat Pendekatan GovTech</h2>
          <p class="sec-lede">Jangan tiru satu negara menyeluruh — tiru bahagian terbaik setiap negara bagi setiap domain. Singapura menguasai hab data terbuka &amp; tadbir urus AI; Korea, orkestrasi &amp; amaran bencana berkanun; Jepun, dashboard KPI awam &amp; automasi krisis; China, skala orkestrasi bandar.</p>
        </div>
        <div class="ctabs" id="ctabs-negara">${tabs}</div>
        ${panels}
        <div class="matrix-card">
          <h3 class="serif">Matriks Amalan Terbaik — 4 Domain × 4 Negara</h3>
          <p class="sec-lede" style="margin-top:0">Pemetaan langsung daripada Bahagian 7 laporan benchmark. Setiap sel ialah amalan tersahkan dengan sitasi penuh.</p>
          <div class="matrix-wrap"><table class="matrix">
            <thead><tr><th>Domain</th><th>SG Singapura</th><th>KR Korea Selatan</th><th>JP Jepun</th><th>CN China</th></tr></thead>
            <tbody>
              <tr><td><b>Hab Data &amp; API</b></td><td>data.gov.sg 9,000+ dataset; APEX gerbang API</td><td>City Data Hub 600+ sistem; DPG komponen kongsi</td><td>Digital Agency; e-Stat satu pintu</td><td>Platform Data Kebangsaan; NECIPS kredit tunggal</td></tr>
              <tr><td><b>Orkestrasi AI</b></td><td>SEA-LION LLM berbilang bahasa; GovTech platform</td><td>DPG satu platform; KPI berkanun per kementerian</td><td>Pusat operasi digital; automasi aliran kerja</td><td>City Brain 24 jabatan; 一网通办 90% dalam talian</td></tr>
              <tr><td><b>Amaran Bencana</b></td><td>SGSecure; amaran myENV/Wildfire</td><td>재난문자 wajib 60 saat; liputan hampir 100%</td><td>Spectee SNS × AI + D-Resilio automasi</td><td>Amaran awal berasaskan satelit &amp; grid</td></tr>
              <tr><td><b>Tadbir Urus AI</b></td><td>AI Verify (IMDA) — kebolehjelasan, keadilan, keteguhan</td><td>Garispanduan AI kebangsaan; PIPC</td><td>AI Guidelines kebangsaan; semakan berperingkat</td><td>Peraturan algoritma; model domestik berdaulat</td></tr>
            </tbody>
          </table></div>
        </div>
        <div class="strategic-card">
          <h3 class="serif">Bacaan Strategik Sabah</h3>
          <p class="sec-lede" style="margin-top:0">Skor keupayaan domain (1–5, penilaian analitik ilustratif) menunjukkan tiada satu negara unggul dalam semua domain. Singapura unggul tadbir urus AI (5.0); Korea &amp; China unggul orkestrasi (5.0); Jepun unggul amaran bencana (5.0).</p>
          <div class="strategic-row">
            <div id="ch-radar" class="radar-area"></div>
            <div class="strategic-notes">
              <div><span class="tag">5.0</span> Singapura · hab data &amp; tadbir urus AI — tetapi skala kecil, sukar diadaptasi 1:1</div>
              <div><span class="tag">5.0</span> Korea · orkestrasi &amp; amaran berkanun — memerlukan akta sokongan</div>
              <div><span class="tag">5.0</span> Jepun · amaran bencana &amp; automasi krisis — kos lesen komersial tinggi</div>
              <div><span class="tag">5.0</span> China · skala &amp; model domestik — isu kedaulatan &amp; ketelusan</div>
              <p style="margin-top:10px;border-top:1px dashed var(--line);padding-top:10px"><b>Sabah boleh jadi pembeda:</b> gabungkan Hab Data corak Korea + tadbir urus AI Verify + SEA-LION untuk Bahasa Melayu — satu-satunya negeri di Malaysia dengan orkestrasi AI berbilang bahasa yang diaudit.</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  function senibina(){
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold">SENIBINA PLATFORM</span>
          <h2 class="serif">Lima Lapisan, Tujuh Modul — Model SaaS/PaaS</h2>
          <p class="sec-lede">Prinsip teras: bina atas sistem sedia ada (MyGOV, JPKN, MyGDX, ePBT), jangan ganti; dan mulakan dengan enam kementerian perintis sebelum skala penuh. Harta intelek platform dimiliki kerajaan negeri — tiada vendor lock-in.</p>
        </div>
        <div class="side-by-side">
          <div class="mode-card">
            <h3 class="serif">Sebagai SaaS</h3>
            <p class="mode-sub">Software as a Service — untuk 11 kementerian &amp; 25 PBT</p>
            <ul>
              <li>Kokpit KPI SMJ 2.0, laporan automatik &amp; penjejak janji diambil sebagai perkhidmatan langganan — kementerian tiada perlu bangunkan sistem sendiri.</li>
              <li>Modul dihidupkan kementerian demi kementerian mengikut jadual yang diterbitkan awam (corak Digital Platform Government Korea).</li>
              <li>Skor Kad Kementerian menjadikan keserasian dan kualiti data setiap kementerian kelihatan — insentif tabiat baik.</li>
            </ul>
          </div>
          <div class="mode-card">
            <h3 class="serif">Sebagai PaaS</h3>
            <p class="mode-sub">Platform as a Service — API &amp; komponen</p>
            <ul>
              <li>API terbuka atas Hab Data Negeri membenarkan kementerian, PBT &amp; universiti membina aplikasi sendiri di atas satu rekod kebenaran.</li>
              <li>Komponen pengesahan identiti, semakan pertindihan &amp; amaran bencana ditawarkan sebagai blok binaan — corak APEX Singapura.</li>
              <li>Membuka ekosistem inovasi tempatan (edtech, agrotech, fintech) di atas data negeri yang selamat &amp; berasaskan persetujuan.</li>
            </ul>
          </div>
        </div>
        <div class="layers-card">
          <h3 class="serif">Senibina Lima Lapisan</h3>
          <p>Setiap lapisan bergantung pada lapisan di bawahnya. Struktur ini sepadan dengan dokumen PORTF·ZA dan corak pembinaan berperingkat Korea/Singapura.</p>
          <ol class="layers">
            <li><b>L1 Lapisan Data Asas</b><span>Fondasi: satu takrif, satu rekod kebenaran.</span><em>Registri Emas Data Negeri · Taksonomi Data Tunggal · Katalog 510 dataset</em></li>
            <li><b>L2 Lapisan Integrasi</b><span>Bina atas sistem sedia ada — jangan ganti, satukan.</span><em>MyGDX &amp; MyGOV (sedia ada) · Gerbang API Berdaulat · Padanan MyKad 360°</em></li>
            <li><b>L3 Lapisan Analitik</b><span>Model &amp; skor berpusat — kesamaan ukuran untuk semua 11 kementerian.</span><em>Enjin KPI SMJ 2.0 · Pengesanan anomali · Ramalan bencana &amp; amaran awal</em></li>
            <li><b>L4 Lapisan Aplikasi</b><span>SaaS per kementerian: langganan modul tanpa bangunkan sistem sendiri.</span><em>Kokpit KPI masa nyata · Pusat Operasi Krisis (PKOB) · Laporan automatik ke Kabinet</em></li>
            <li><b>L5 Lapisan Penyampaian</b><span>Peranan PaaS: agensi membina aplikasi sendiri di atas API tunggal.</span><em>Kokpit Ketua Menteri / SKN · Portal kementerian &amp; PBT · API awam &amp; mobiliti</em></li>
          </ol>
        </div>
        <h3 class="serif" style="text-align:center;margin-top:36px">Tujuh Modul Teras</h3>
        <div class="mods">
          <div class="mod"><b>M1</b><h4>Registri Emas Data Negeri &amp; Taksonomi Tunggal</h4><p>Satu takrif untuk setiap entiti negeri; katalog 510 dataset daripada 11 kementerian.</p></div>
          <div class="mod"><b>M2</b><h4>Hab Data &amp; Gerbang API Berdaulat</h4><p>Satu gerbang dengan vault kunci, kuota, log audit &amp; kedaulatan data dalam negara.</p></div>
          <div class="mod"><b>M3</b><h4>Enjin Integrasi 11 Kementerian</h4><p>Penyesuai per sistem warisan; penormalan skema &amp; padanan MyKad sebelum masuk hab.</p></div>
          <div class="mod"><b>M4</b><h4>Kokpit KPI SMJ 2.0 Masa Nyata</h4><p>13 petunjuk utama dengan lampu isyarat; laporan Kabinet dijana dalam beberapa minit.</p></div>
          <div class="mod"><b>M5</b><h4>Agen AI Tugas (Bahasa Melayu)</h4><p>Ringkasan, terjemahan &amp; klasifikasi menggunakan SEA-LION — LLM yang menguasai BM.</p></div>
          <div class="mod"><b>M6</b><h4>Pusat Operasi Krisis Digital (PKOB)</h4><p>Amaran awal, pemetaan PPS &amp; automasi aliran kerja bencana dalam satu skrin.</p></div>
          <div class="mod"><b>M7</b><h4>Tadbir Urus &amp; Jejak Audit AI</h4><p>Penilaian model (corak AI Verify) sebelum pengeluaran; setiap inferens direkod.</p></div>
        </div>
        <div class="cta-block">
          <div>
            <h4>Laluan Perolehan</h4>
            <p>Fasa 0 → 3 sepadan dengan peta jalan pelaksanaan: prototaip konsep → hab data &amp; taksonomi → enjin &amp; akta → skala penuh 11 kementerian.</p>
          </div>
          <a href="#peta-jalan" class="btn-gold">Lihat peta jalan →</a>
        </div>
      </div>`;
  }

  function cadangan(){
    const items = [
      {c:'Z1', t:'Sabah Data Hub &amp; Taksonomi Data Tunggal', j:'01 · Data bersilo', r:'Korea (City Data Hub), Singapura (data.gov.sg)'},
      {c:'Z2', t:'Gerbang API Berdaulat &amp; PaaS Negeri', j:'01 · Integrasi warisan', r:'Singapura (APEX), Jepun (awan berdaulat)'},
      {c:'Z3', t:'Kokpit KPI SMJ 2.0 Masa Nyata', j:'02 · Pelaporan manual', r:'Jepun (Digital Agency Dashboard), Korea (KPI berkanun)'},
      {c:'Z4', t:'Pusat Operasi Krisis Bersepadu (PKOB Digital)', j:'03 · Amaran lambat', r:'Jepun (D-Resilio + Spectee), Korea (재난문자)'},
      {c:'Z5', t:'Rangka Tadbir Urus AI Negeri', j:'04 · Tiada tadbir urus', r:'Singapura (AI Verify), Jepun (AI Guidelines)'},
      {c:'Z6', t:'Orkestrasi AI Berbahasa Melayu (SEA-LION)', j:'05 · Kapasiti tempatan', r:'Singapura (SEA-LION), China (model domestik)'}
    ];
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold-light">CADANGAN DASAR</span>
          <h2 class="serif light">Z1–Z6: Daripada Bukti Dunia kepada Kabinet Nota</h2>
          <p class="sec-lede light">Setiap cadangan dipetakan satu-satu kepada jurang PORTF·ZA, sasaran Ketua Menteri &amp; model rujukan antarabangsa — disusun dalam format seragam supaya SKN boleh membawanya terus ke meja pelaksanaan.</p>
        </div>
        <div class="dcards">
          ${items.map(i=>`<div class="dcard"><div class="dcode">${i.c}</div><div><h4>${i.t}</h4><p class="dmeta">Jurang: <b>${i.j}</b> · Rujukan: <b>${i.r}</b></p></div></div>`).join('')}
        </div>
      </div>`;
  }

  function petaJalan(){
    const phases = [
      {p:'p0', t:'Taklimat & Prototaip Konsep', w:'Suku 4 2026',
        ul:['Taklimat demo 30 minit kepada YAB Ketua Menteri &amp; SKN','Lantik 6 kementerian perintis (KW, KKT, KKR, PEND, PERT, JPKN)','MoU perkongsian data selaras PDPA'],
        out:'MoU 6 kementerian ditandatangani; peta data selesai',
        ref:'Penanda aras: KESAN Fasa 0; kajian RUN 2026'},
      {p:'p1', t:'Hab Data & Taksonomi', w:'Suku 1–2 2027',
        ul:['Lulus takrif data negeri melalui notis pentadbiran','Siar katalog 510 dataset','Gerbang API berdaulat fasa 1 (6 kementerian)'],
        out:'100% dataset dalam katalog; 6 kementerian disepadukan',
        ref:'Penanda aras: Korea (City Data Hub); Singapura (APEX)'},
      {p:'p2', t:'Enjin & Akta', w:'Suku 3–4 2027',
        ul:['Bawa Rang Undang-Undang Hab Data Sabah ke DUN','Aktifkan Kokpit KPI SMJ 2.0 masa nyata','Aktifkan PKOB Digital dengan amaran ≤30 minit'],
        out:'% KPI hijau diterbitkan mingguan; amaran bencana ≤30 minit',
        ref:'Penanda aras: Jepun (Digital Agency Dashboard); Korea (재난문자)'},
      {p:'p3', t:'Skala Penuh 11 Kementerian', w:'2028',
        ul:['Akta berkuat kuasa (transisi 2 tahun)','Gerbang kementerian demi kementerian sehingga 11/11','Tadbir urus AI Verify + SEA-LION untuk semua agensi'],
        out:'11/11 kementerian; ≥85% KPI hijau; tindak balas ≤30 min',
        ref:'Penanda aras: Korea (DPG 2023→2025); Jepun (2020→2022)'}
    ];
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold">PETA JALAN PELAKSANAAN</span>
          <h2 class="serif">Fasa 0 → 3: Suku 4 2026 hingga 2028</h2>
          <p class="sec-lede">Diselaraskan dengan kajian kebolehlaksanaan RUN yang sedang berjalan sepanjang 2026 dan kitaran Belanjawan 2027 — supaya setiap keputusan dasar jatuh pada tetingkap keputusan yang betul. Setiap fasa mempunyai output terukur.</p>
        </div>
        <div class="phases">
          ${phases.map(p=>`<div class="phase"><div class="ph-badge ${p.p}">Fasa ${p.p[1]}</div><div class="ph-body"><h4>${p.t}</h4><p class="ph-when">${p.w}</p><ul>${p.ul.map(x=>`<li>${x}</li>`).join('')}</ul><p class="ph-out"><b>Output:</b> ${p.out}</p><p class="ph-ref">${p.ref}</p></div></div>`).join('')}
        </div>
      </div>`;
  }

  function kpi(){
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold">TADBIR URUS HASIL</span>
          <h2 class="serif">KPI Berangka &amp; Risiko Terkawal</h2>
          <p class="sec-lede">Mengikut corak "janji berangka" Korea &amp; Jepun: setiap cadangan disertai angka sasaran, tarikh dan populasi penerima. Sumber data KPI ialah sistem PORTF·ZA itu sendiri — setiap angka boleh dijana semula dalam beberapa minit semasa sesi Kabinet.</p>
        </div>
        <div class="kpi-card">
          <h3 class="serif">KPI per Cadangan Dasar</h3>
          <div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Cadangan</th><th>KPI utama</th><th>Garis dasar</th><th>Sasaran 12 bln</th><th>Sasaran 24 bln</th></tr></thead>
            <tbody>
              <tr><td><b>Z1 Hab Data</b></td><td>% dataset negeri dalam katalog dengan takrif seragam</td><td>Rendah (silo)</td><td>80%</td><td>100%</td></tr>
              <tr><td><b>Z2 Gerbang API</b></td><td>Bil. kementerian disepadukan melalui satu gerbang</td><td>0</td><td>6 / 11</td><td>11 / 11</td></tr>
              <tr><td><b>Z3 Kokpit KPI</b></td><td>% petunjuk SMJ 2.0 dilapor masa nyata</td><td>Tiada (manual)</td><td>80%</td><td>100%</td></tr>
              <tr><td><b>Z4 PKOB Digital</b></td><td>Masa tindak balas purata; % insiden dengan amaran ≥30 min</td><td>42 min · 68%</td><td>≤ 35 min · 80%</td><td>≤ 30 min · 90%</td></tr>
              <tr><td><b>Z5 Tadbir Urus AI</b></td><td>Bil. model melalui penilaian sebelum pengeluaran</td><td>0</td><td>100%</td><td>100% + audit tahunan</td></tr>
              <tr><td><b>Z6 SEA-LION</b></td><td>% interaksi kerajaan dijawab dalam Bahasa Melayu</td><td>~40%</td><td>85%</td><td>95%</td></tr>
            </tbody>
          </table></div>
        </div>
        <div class="kpi-card">
          <h3 class="serif">Risiko Utama &amp; Mitigasi Terbukti</h3>
          <div class="risks">
            <div class="risk ih"><b>Impak: Tinggi · Keb.: Sederhana</b><h5>Kementerian enggan berkongsi data</h5><p>Mitigasi: PDPA + arahan SKN sebagai asas; templat perjanjian kerahsiaan; fasa sukarela dahulu; Skor Kad Kementerian diterbitkan.</p></div>
            <div class="risk im"><b>Impak: Sederhana · Keb.: Sederhana</b><h5>Kualiti data warisan rendah (PDF / imbasan)</h5><p>Mitigasi: Penyesuai per sistem; pagar kualiti dengan amaran; keutamaan API JSON dalam perolehan.</p></div>
            <div class="risk ih"><b>Impak: Tinggi · Keb.: Sederhana</b><h5>Kedaulatan data terjejas oleh vendor luar</h5><p>Mitigasi: Awan berdaulat dalam negara; model luar hanya untuk inferens; tiada latihan atas data negeri.</p></div>
            <div class="risk ih"><b>Impak: Tinggi · Keb.: Sederhana</b><h5>Rang Undang-Undang Hab Data terbantah</h5><p>Mitigasi: Rujukan awam corak Singapura; transisi 2 tahun corak Jepun; pembabitan semua EXCO dari rangka awal.</p></div>
            <div class="risk il"><b>Impak: Tinggi · Keb.: Rendah–Sederhana</b><h5>Keletihan politik / perubahan portfolio</h5><p>Mitigasi: Kanunkan KPI dan tinjauan tahunan dalam akta (corak Jepun Perkara 10); IP PORTF·ZA milik kerajaan negeri — tiada vendor lock-in.</p></div>
          </div>
        </div>
      </div>`;
  }

  function langkah(){
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold-light">MULAKAN TANPA MENUNGGU AKTA</span>
          <h2 class="serif light">Tiga Langkah Segera — 30 Hari</h2>
          <p class="sec-lede light">Keseluruhan pakej Z1–Z6 boleh dimulakan tanpa menunggu akta: enam kementerian perintis dan prototaip data sebenar boleh bermula dalam 30 hari. Website konsep ini sendiri ialah contoh Fasa 0: taklimat demo 30 minit kepada YAB Ketua Menteri.</p>
        </div>
        <div class="steps">
          <div class="step"><span class="st-num">1</span><h4>Lantik enam kementerian perintis</h4><p>KW, KKT, KKR, PEND, PERT &amp; JPKN bagi prototaip data sebenar dalam 30 hari — petakan aliran data, format warisan dan kes silo sebagai kemenangan awal yang boleh diukur.</p></div>
          <div class="step"><span class="st-num">2</span><h4>Kanunkan mandat perkongsian data</h4><p>Takrif data tunggal, mandat penerbitan dataset tahunan, semakan semula berkala, dan fasa transisi dua tahun — empat elemen yang disahkan oleh pengalaman Korea, Jepun dan Singapura.</p></div>
          <div class="step"><span class="st-num">3</span><h4>Bawa Kokpit KPI &amp; PKOB Digital ke meja kajian RUN</h4><p>Sebelum keputusan arkitektur dibuat, supaya keputusan Belanjawan 2027 berasaskan prototaip yang sudah berfungsi, bukan sekadar kertas cadangan.</p></div>
        </div>
        <div class="time-window">
          <p><b>Titik tetingkap:</b> kajian RUN berjalan sepanjang 2026 · Belanjawan 2027 dipertahankan Oktober 2026 · Rang Undang-Undang Hab Data Sabah dalam rangka — keputusan <b>berasaskan prototaip yang sudah berfungsi</b>, bukan sekadar kertas cadangan.</p>
        </div>
      </div>`;
  }

  function footer(){
    return `
      <div class="foot-grid">
        <div>
          <div class="brand"><span class="brand-mark">Z</span><span><span class="b1">PORTF <span class="gold">·ZA</span></span><br><span class="b2">Orkestrasi AI Negeri · SMJ 2.0</span></span></div>
          <p class="foot-tag">Platform orkestrasi AI negeri Sabah — "Satu negeri. 11 kementerian. Satu rekod. Satu keputusan."</p>
        </div>
        <div>
          <h6>Konteks</h6>
          <ul>
            <li>Skop: 11 kementerian · 510 dataset · 13 petunjuk SMJ 2.0</li>
            <li>Berasaskan Laporan Analisis Keperluan SaaS/MaaS/PaaS — Enam Tokoh (16 Sept 2026)</li>
            <li>Struktur kementerian menurut Kabinet Negeri Sabah 2025–2030 (sabah.gov.my)</li>
            <li>Benchmark: Singapura, Korea Selatan, Jepun, China</li>
          </ul>
        </div>
        <div>
          <h6>Dokumen sokongan</h6>
          <ul>
            <li>Laporan Induk Analisis Keperluan SaaS/MaaS/PaaS (6 tokoh)</li>
            <li>Laporan Benchmarking Empat Negara KESAN (25 muka, PDF)</li>
            <li>Sumber rasmi: data.gov.sg · digital.go.kr · digital.go.jp · stats.gov.cn</li>
          </ul>
        </div>
      </div>
      <p class="foot-note">© 2026 · Disediakan untuk YB Datuk Zainudin Aman, Setiausaha Kerajaan Negeri Sabah · Pengerusi Jawatankuasa Pengurusan Bencana Negeri. Notis: Website ini ialah prototaip konsep ilustratif untuk perbincangan dasar — ia bukan laman rasmi kerajaan dan tidak mengumpulkan sebarang data sebenar negeri. Simulasi 11 kementerian dan laporan KPI masa nyata dijana secara setempat untuk demonstrasi seni bina. Semua keputusan dasar tertakluk kepada kajian kebolehlaksanaan formal dan kelulusan kerajaan.</p>`;
  }

  /* ---------------- SIMULASI 11 KEMENTERIAN ---------------- */
  const SIM = (function(){
    let state = null, timer = null, running = false;

    function baseState(){
      return KEMENTERIAN.map((k, i) => ({i:i, p:k.p, st:k.st, d:k.d}));
    }

    function chips(){
      const grid = document.getElementById('mGrid');
      if(!grid) return;
      grid.querySelectorAll('.mchip').forEach(function(el, i){
        const s = state[i];
        el.className = 'mchip ' + s.st + (i === selIdx ? ' sel' : '');
        el.querySelector('.bar i').style.width = s.p + '%';
        el.querySelector('.mp').textContent = s.p + '%';
      });
    }

    let selIdx = 0;
    function detail(i){
      const box = document.getElementById('simDetail');
      if(!box) return;
      const k = KEMENTERIAN[i], s = state[i];
      const lab = s.st === 'on' ? 'Disepadukan' : (s.st === 'part' ? 'Separa' : 'Belum bermula');
      const col = s.st === 'on' ? '#2ecc71' : (s.st === 'part' ? '#c9a227' : '#5a6478');
      box.innerHTML = `
        <span class="sd-sub" style="color:${col}">${lab}</span>
        <h4>${esc(k.n)}</h4>
        <dl class="sim-kv">
          <dt>Singkatan</dt><dd>${esc(k.s)}</dd>
          <dt>Dataset</dt><dd>${s.d} set</dd>
          <dt>Tahap padu</dt><dd>${s.p}%</dd>
          <dt>Kekerapan</dt><dd>${esc(k.f)}</dd>
          <dt>Format</dt><dd>${esc(k.fmt)}</dd>
          <dt>Pemilik</dt><dd>${esc(k.o)}</dd>
        </dl>
        <div class="sim-endpoint">GET https://gateway.sabah.gov.my${esc(k.ep)}</div>
        <div style="font-size:11.5px;color:#7a8aa3;margin-top:8px">Medan: ${esc(k.m)}</div>`;
    }

    function log(msg, cls){
      const box = document.getElementById('simLog');
      if(!box) return;
      const d = new Date();
      const t = d.toTimeString().slice(0,8);
      const row = document.createElement('div');
      row.innerHTML = `<span class="t">[${t}]</span> <span class="${cls||''}">${msg}</span>`;
      box.insertBefore(row, box.firstChild);
    }

    function setCount(){
      const on = state.filter(s => s.st === 'on' && KEMENTERIAN[s.i].k).length;
      const el = document.getElementById('simCount');
      if(el) el.innerHTML = on + '<small> / 11 disepadukan</small>';
      const st = document.getElementById('simStatus');
      if(st) st.className = 'sim-status' + (running ? ' live' : '');
      if(st) st.innerHTML = '<i></i> ' + (running ? 'Menyegerak…' : (on >= 11 ? 'Semua 11 disepadukan' : 'Bersedia'));
      // kemas kini KPI laporan KM (kementerian disepadukan)
      const kv2 = document.getElementById('kv2');
      if(kv2) kv2.innerHTML = on + '<span class="kk-unit">/ 11</span>';
      return on;
    }

    function run(){
      if(running) return;
      running = true;
      setCount();
      log('<span class="hl">SIMULASI DIMULAKAN</span> — 11 kementerian disambungkan ke gerbang berdaulat…', 'hl');
      const queue = state.map((s,i)=>i).filter(i => state[i].st !== 'on')
        .sort((a,b)=> state[b].p - state[a].p);
      let step = 0;
      timer = setInterval(function(){
        if(step >= queue.length){
          clearInterval(timer);
          running = false;
          setCount();
          log('<span class="ok">SELESAI</span> — 11/11 kementerian disepadukan · 510 dataset · masa nyata aktif.', 'ok');
          return;        }
        const i = queue[step++];
        state[i].st = 'on';
        state[i].p = 100;
        state[i].d = KEMENTERIAN[i].d;
        chips(); detail(selIdx); setCount();
        const k = KEMENTERIAN[i];
        log(`<span class="ok">200 OK</span> ${esc(k.s)} · ${k.d} dataset · <span class="hl">${esc(k.ep)}</span>`, 'ok');
      }, 550);
    }

    function reset(){
      if(timer) clearInterval(timer);
      running = false;
      state = baseState();
      chips(); detail(selIdx); setCount();
      const box = document.getElementById('simLog');
      if(box) box.innerHTML = '<div><span class="t">[--:--:--]</span> <span class="hl">Set semula.</span> Kembali ke keadaan semasa: 6 daripada 11 kementerian disepadukan.</div>';
    }

    function init(){
      state = baseState();
      const grid = document.getElementById('mGrid');
      if(grid){
        grid.addEventListener('click', function(e){
          const chip = e.target.closest('.mchip');
          if(!chip) return;
          selIdx = parseInt(chip.getAttribute('data-i'), 10);
          chips(); detail(selIdx);
        });
      }
      chips(); detail(0); setCount();
      // lukis rajah aliran PaaS
      const f = document.getElementById('flowSvg');
      if(f) f.innerHTML = flowSvg();
    }
    return {run:run, reset:reset, init:init};
  })();

  function flowSvg(){
    const groups = ['Kewangan','Kerajaan Tempatan','Kerja Raya','Pendidikan','Pertanian','Perindustrian','Pelancongan','… 4 lagi'];
    const left = groups.map(function(g,i){
      const y = 20 + i*34;
      return `<g><rect x="10" y="${y}" width="150" height="26" rx="6" fill="#f8fafc" stroke="#e3e9f0"/>
        <text x="20" y="${y+17}" font-size="11" fill="#33475b">${esc(g)}</text>
        <circle cx="170" cy="${y+13}" r="3" fill="#3b6ca8"/></g>`;
    }).join('');
    const lines = groups.map(function(g,i){
      const y = 20 + i*34 + 13;
      return `<path d="M174,${y} C210,${y} 230,150 262,150" stroke="#c9a227" stroke-width="1.2" fill="none" opacity="0.55"/>`;
    }).join('');
    const outs = ['Kokpit Ketua Menteri','Portal Kementerian / PBT','Agen AI & API Awam'].map(function(o,i){
      const y = 60 + i*50;
      return `<g><rect x="600" y="${y}" width="250" height="36" rx="7" fill="#0a1b33"/>
        <text x="614" y="${y+23}" font-size="11.5" fill="#f6eecf">${esc(o)}</text></g>`;
    }).join('');
    const outlines = [0,1,2].map(function(i){
      const y = 60 + i*50 + 18;
      return `<path d="M448,150 C500,150 520,${y} 596,${y}" stroke="#c9a227" stroke-width="1.2" fill="none" opacity="0.55"/>
        <circle cx="596" cy="${y}" r="3" fill="#c9a227"/>`;
    }).join('');
    return `<svg viewBox="0 0 870 320" style="width:100%;height:auto">
      ${left}${lines}
      <rect x="262" y="112" width="186" height="76" rx="10" fill="#fff" stroke="#c9a227" stroke-width="1.6"/>
      <text x="355" y="140" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0a1b33">Gerbang API</text>
      <text x="355" y="156" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0a1b33">&amp; Hab Data Negeri</text>
      <text x="355" y="174" text-anchor="middle" font-size="10" fill="#6b7689">vault · kuota · audit · PDPA</text>
      ${outlines}${outs}
    </svg>`;
  }

  /* ---------------- LAPORAN KPI MASA NYATA ---------------- */
  const KM = (function(){
    let last = Date.now(), tick = null;
    const series = {
      k1:[61,62,63,64,65,66,66,67,67,68],
      k2:[3,3,4,4,4,5,5,5,6,6],
      k3:[5,4,4,3,4,3,4,3,3,3],
      k4:[58,54,51,49,47,46,45,44,43,42]
    };
    const colors = {k1:'#1f7a55', k2:'#3b6ca8', k3:'#b5403b', k4:'#c9a227'};

    function paintSparks(){
      ['k1','k2','k3','k4'].forEach(function(k){
        const el = document.getElementById('ks' + k[1]);
        if(el) el.innerHTML = CH.spark(series[k], colors[k]);
      });
    }

    function jitter(v, amt){
      return v + (Math.random()*2 - 1) * amt;
    }

    function refresh(){
      const now = new Date().toLocaleTimeString('ms-MY', {hour12:false});
      const t = document.getElementById('kmTime');
      if(t) t.textContent = now;
      // nilai berubah sedikit
      const v1 = (68 + (Math.random()*0.8 - 0.4)).toFixed(1);
      const v4 = Math.max(38, Math.round(42 + (Math.random()*4 - 2)));
      set('kv1', v1 + '<span class="kk-unit">%</span>');
      set('kv4', v4 + '<span class="kk-unit">min</span>');
      series.k1.push(parseFloat(v1)); series.k1.shift();
      series.k4.push(v4); series.k4.shift();
      paintSparks();
      // kelip
      [['kv1'],['kv4']].forEach(function(p){
        const el = document.getElementById(p[0]);
        if(!el) return;
        el.classList.add('flash');
        setTimeout(function(){ el.classList.remove('flash'); }, 600);
      });
      // bar kemajuan
      const bar = document.getElementById('rfBar');
      if(bar){ bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run'); }
      last = Date.now();
    }

    function set(id, html){
      const el = document.getElementById(id);
      if(el) el.innerHTML = html;
    }

    function ago(){
      const el = document.getElementById('kmAgo');
      if(!el) return;
      const s = Math.floor((Date.now() - last)/1000);
      el.textContent = s + 's';
    }

    function exportPdf(){ alert('Eksport PDF (simulasi) — laporan KPI SMJ 2.0 akan dimuat turun.'); }
    function share(){ alert('Kongsi ke Ketua Menteri (simulasi) — pautan laporan masa nyata telah dihantar.'); }

    function init(){
      paintSparks();
      refresh();
      tick = setInterval(refresh, 4500);
      setInterval(ago, 1000);
    }
    return {refresh:refresh, init:init, export:exportPdf, share:share};
  })();

  /* ---------------- INIT ---------------- */
  function setText(id, html){ const el = document.getElementById(id); if(el) el.innerHTML = html; }

  function paintCharts(){
    Object.keys(CHARTS).forEach(function(k){
      const id = 'ch-' + k;
      const el = document.getElementById(id);
      if(el) el.innerHTML = CH.render(CHARTS[k]);
    });
  }

  function wireTabs(){
    const tabs = document.getElementById('tabs-demo');
    if(tabs){
      tabs.querySelectorAll('.tab').forEach(function(b){
        b.addEventListener('click', function(){
          tabs.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          const key = b.getAttribute('data-tab');
          document.querySelectorAll('.tab-panel').forEach(function(p){
            p.classList.toggle('active', p.getAttribute('data-panel') === key);
          });
        });
      });
    }
    const ctabs = document.getElementById('ctabs-negara');
    if(ctabs){
      ctabs.querySelectorAll('.ctab').forEach(function(b){
        b.addEventListener('click', function(){
          ctabs.querySelectorAll('.ctab').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          const key = b.getAttribute('data-c');
          document.querySelectorAll('.cpanel').forEach(function(p){
            p.classList.toggle('active', p.getAttribute('data-cpanel') === key);
          });
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    setText('atas', hero());
    setText('jurang', jurang());
    setText('demo', demo());
    setText('integrasi', integrasi());
    setText('kpi-km', kpiKm());
    setText('benchmark', benchmark());
    setText('senibina', senibina());
    setText('cadangan', cadangan());
    setText('peta-jalan', petaJalan());
    setText('kpi', kpi());
    setText('langkah', langkah());
    const f = document.querySelector('footer.foot');
    if(f) f.innerHTML = footer();

    paintCharts();
    wireTabs();
    SIM.init();
    KM.init();
  });

  window.SIM = SIM;
  window.KM = KM;
})();
