/* ====================================================================
   PORTF·AA — main.js
   Platform Orkestrasi PBT & Perumahan Sabah (Datuk Dr. Mohd Arifin)
   Bersekutu dengan PaaS Negeri PORTF·ZA (Datuk Zainudin Aman)
   ==================================================================== */
(function(){
  'use strict';
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const B = ['Okt','Nov','Dis','Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep'];

  /* ---------------- DATA ---------------- */
  const CHARTS = {
    matang: {type:'bar', smallLabels:true, labels:['DBKK','Sandakan','Tawau','Kudat','Keningau','Lahad Datu','Ranau','Beaufort'],
      series:[{name:'Skor kematangan', color:'#c9a227', values:[86,66,62,48,42,38,26,22]}]},
    kelulusan: {type:'line', area:true, labels:B,
      series:[{name:'Hari', color:'#b5403b', values:[96,94,91,89,86,84,81,79,77,75,73,72]}]},
    permit: {type:'bar', smallLabels:true, labels:['DBKK','Sandakan','Tawau','Kudat','Keningau','Ranau'],
      series:[{name:'Permit diproses', color:'#3b6ca8', values:[1248,864,712,486,342,268]}]},
    statuspermit: {type:'donut', centre:'permohonan',
      items:[{label:'Diluluskan', value:2840, color:'#1f7a55'},
             {label:'Dalam semakan', value:1620, color:'#c9a227'},
             {label:'Menunggu dokumen', value:980, color:'#3b6ca8'},
             {label:'Ditolak', value:410, color:'#b5403b'}]},
    aduan: {type:'line', area:true, labels:B,
      series:[{name:'% dalam SLA', color:'#1f7a55', values:[54,57,60,62,65,67,69,71,73,75,77,78]}]},
    kategori: {type:'bar', labels:['Sampah','Jalan','Air','Lampu','Longkang','Lain'],
      series:[{name:'Aduan', color:'#c9a227', values:[3420,2680,1980,1240,880,620]}]},
    masarumah: {type:'bar', labels:['Daftar','Kelayakan','Tanah','Teknikal','Tawaran'],
      series:[{name:'Hari', color:'#3b6ca8', values:[0.5,1.2,1.8,1.6,0.4]}]},
    permohonan: {type:'line', area:true, labels:B,
      series:[{name:'Diterima', color:'#3b6ca8', values:[120,132,141,148,156,163,171,178,184,190,196,204]},
              {name:'Diluluskan', color:'#1f7a55', values:[72,84,96,108,119,131,142,154,166,177,188,199]}]},
    radar: {type:'radar', axes:['Perkhidmatan PBT','Aduan Rakyat','Perumahan Awam','Interoperabiliti'],
      series:[{name:'SG Singapura', color:'#1f7a55', values:[5.0,5.0,5.0,4.8]},
              {name:'KR Korea', color:'#3b6ca8', values:[4.6,4.8,4.4,5.0]},
              {name:'JP Jepun', color:'#b5403b', values:[4.8,4.2,4.0,4.4]},
              {name:'CN China', color:'#c9a227', values:[5.0,4.6,4.4,5.0]}]}
  };

  /* 15 ENTITI PBT & AGENSI — status: on / part / off */
  const ENTITI = [
    {s:'DBKK', n:'Dewan Bandaraya Kota Kinabalu', d:74, p:84, st:'on', ep:'/v1/dbkk/permit', f:'15 minit', m:'permit_id, jenis, status, hari_proses', o:'DBKK (ICT)', fmt:'API JSON'},
    {s:'JKR', n:'Jabatan Kerja Raya Sabah', d:46, p:71, st:'on', ep:'/v1/jkr/teknikal', f:'Harian', m:'permit_id, laporan, kelulusan, pegawai', o:'JKR Bahagian Bangunan', fmt:'API JSON'},
    {s:'JPBD', n:'Jabatan Perancangan Bandar & Desa', d:52, p:68, st:'on', ep:'/v1/jpbd/zoning', f:'Harian', m:'zon_id, kepadatan, guna_tanah, status', o:'JPBD Sabah', fmt:'API JSON'},
    {s:'MPS', n:'Majlis Perbandaran Sandakan', d:38, p:66, st:'on', ep:'/v1/sandakan/permit', f:'15 minit', m:'permit_id, kategori, status, fi', o:'MPS (ICT)', fmt:'API JSON'},
    {s:'MPT', n:'Majlis Perbandaran Tawau', d:34, p:62, st:'on', ep:'/v1/tawau/permit', f:'15 minit', m:'permit_id, kategori, status, fi', o:'MPT (ICT)', fmt:'API JSON'},
    {s:'PTD', n:'Pejabat Tanah & Daerah', d:29, p:61, st:'on', ep:'/v1/tanah/carian', f:'Atas permintaan', m:'hakmilik_id, lot, pemilik, status', o:'PTD Sabah', fmt:'API JSON'},
    {s:'MDK', n:'Majlis Daerah Kudat', d:24, p:48, st:'part', ep:'/v1/kudat/permit', f:'Harian', m:'permit_id, kategori, status', o:'MDK (ICT)', fmt:'CSV / XLSX'},
    {s:'MDKg', n:'Majlis Daerah Keningau', d:22, p:42, st:'part', ep:'/v1/keningau/permit', f:'Harian', m:'permit_id, kategori, status', o:'MDKg (ICT)', fmt:'CSV / XLSX'},
    {s:'MDLD', n:'Majlis Daerah Lahad Datu', d:20, p:38, st:'part', ep:'/v1/lahaddatu/permit', f:'Harian', m:'permit_id, kategori, status', o:'MDLD (ICT)', fmt:'CSV / XLSX'},
    {s:'BOMBA', n:'Jabatan Bomba & Penyelamat', d:26, p:35, st:'part', ep:'/v1/bomba/audit', f:'Mingguan', m:'premis_id, tahap_risiko, tarikh_audit', o:'BOMBA Sabah', fmt:'Pangkalan data (ODBC)'},
    {s:'MDR', n:'Majlis Daerah Ranau', d:16, p:26, st:'part', ep:'/v1/ranau/permit', f:'Mingguan', m:'permit_id, kategori, status', o:'MDR (ICT)', fmt:'CSV / XLSX'},
    {s:'MDB', n:'Majlis Daerah Beaufort', d:15, p:22, st:'part', ep:'/v1/beaufort/permit', f:'Mingguan', m:'permit_id, kategori, status', o:'MDB (ICT)', fmt:'CSV / XLSX'},
    {s:'MDKP', n:'Majlis Daerah Kuala Penyu', d:11, p:14, st:'off', ep:'/v1/kualapenyu/permit', f:'Bulanan', m:'permit_id, kategori', o:'MDKP (ICT)', fmt:'PDF / imbasan'},
    {s:'MDKB', n:'Majlis Daerah Kota Belud', d:13, p:11, st:'off', ep:'/v1/kotabelud/permit', f:'Bulanan', m:'permit_id, kategori', o:'MDKB (ICT)', fmt:'PDF / imbasan'},
    {s:'MDP', n:'Majlis Daerah Papar', d:12, p:8, st:'off', ep:'/v1/papar/permit', f:'Bulanan', m:'permit_id, kategori', o:'MDP (ICT)', fmt:'PDF / imbasan'}
  ];

  /* 12 PETUNJUK PBT & PERUMAHAN */
  const PETUNJUK = [
    {n:'PBT dalam gerbang ePBT', v:'12', u:'/ 25', s:'25 PBT', st:'a', pct:48, t:'+4'},
    {n:'Masa kelulusan pembangunan', v:'72', u:'hari', s:'≤ 45 hari', st:'r', pct:63, t:'-24'},
    {n:'Permit diproses dalam talian', v:'68', u:'%', s:'≥ 80%', st:'a', pct:85, t:'+18'},
    {n:'Aduan diselesaikan dalam SLA', v:'78', u:'%', s:'≥ 75%', st:'g', pct:104, t:'+24'},
    {n:'Masa tindak aduan purata', v:'4.2', u:'hari', s:'≤ 3 hari', st:'a', pct:71, t:'-2.8'},
    {n:'Kelulusan Rumah Mesra SMJ', v:'6.2', u:'hari', s:'≤ 3 hari', st:'r', pct:48, t:'-7.8'},
    {n:'Permohonan perumahan dilulus', v:'842', u:'unit', s:'1,000 unit', st:'g', pct:84, t:'+186'},
    {n:'Setinggan berisiko dipantau', v:'11', u:'lokasi', s:'11 lokasi', st:'g', pct:100, t:'0'},
    {n:'PBT dengan pelan digital', v:'9', u:'/ 25', s:'25 PBT', st:'a', pct:36, t:'+3'},
    {n:'Dataset PBT diterbitkan', v:'214', u:'set', s:'386 set', st:'a', pct:55, t:'+62'},
    {n:'Pematuhan pelan bangunan (BOMBA)', v:'91', u:'%', s:'≥ 95%', st:'g', pct:96, t:'+6'},
    {n:'Kutipan hasil PBT (cukai taksiran)', v:'88', u:'%', s:'≥ 90%', st:'g', pct:98, t:'+4.2'}
  ];

  /* ---------------- SEKSYEN ---------------- */
  function hero(){
    return `
      <div class="hero-inner">
        <div class="hero-top">
          <span class="pill">PROTOTAIP KONSEP · PANDUAN PEMULAAN</span>
          <span class="pill-line">SaaS/PaaS v0.1 · Bersekutu dengan PaaS Negeri PORTF·ZA</span>
        </div>
        <h1 class="serif">Dari <em class="gold">Kaunter</em> kepada <em class="gold">Perbandaran Berkeputusan</em></h1>
        <p class="lede"><b>PORTF·AA</b> ialah platform orkestrasi kerajaan tempatan &amp; perumahan Sabah — prototaip konsep SaaS/PaaS domain yang menyatukan <b>25 PBT</b> dan <b>6 agensi teknikal</b> di bawah satu gerbang, lalu <b>bersekutu ke atas</b> ke PaaS Negeri (Hab Data &amp; Gerbang API Datuk Zainudin Aman) untuk laporan KPI <b>SMJ 2.0</b> masa nyata kepada Ketua Menteri. Dipetakan daripada amalan terbaik <em>Singapura, Korea Selatan, Jepun dan China</em>.</p>
        <blockquote class="motto">"Satu PBT. Satu permit. Satu negeri. Satu keputusan."</blockquote>
        <div class="hero-cta">
          <a href="#demo" class="btn-gold">Lihat Demo Dashboard</a>
          <a href="#integrasi" class="btn-outline">Simulasi PBT &amp; Persekutuan</a>
        </div>
        <div class="hero-stats">
          <div><b>25</b><span>PBT disasarkan</span></div>
          <div><b>12 / 25</b><span>Telah disepadukan</span></div>
          <div><b>72 hari</b><span>Kelulusan pembangunan</span></div>
          <div><b>78%</b><span>Aduan dalam SLA</span></div>
        </div>
      </div>`;
  }

  function jurang(){
    const cards = [
      {n:'01', t:'ePBT tidak seragam', p:'25 PBT, 25 sistem yang berbeza — format, yuran dan proses permit tidak sama. Pemohon yang sama mengisi borang yang berlainan di dua daerah.', r:'Singapura (OneService + GoBusiness), Korea (ePBT berpusat)'},
      {n:'02', t:'Kelulusan pembangunan lambat', p:'Purata 96 hari, kini 72 hari — tetapi tiada penjejak pematuhan berpusat untuk membuktikan pencapaian minggu demi minggu kepada EXCO.', r:'Jepun (Grafter スマート申請), Singapura (BGP satu penilai)'},
      {n:'03', t:'Aduan rakyat tiada SLA berpusat', p:'Setiap PBT ada sistem aduan sendiri; tiada satu papan pemuka yang menunjukkan berapa aduan selesai dalam 14 hari.', r:'Singapura (OneService), Korea (국민신문고)'},
      {n:'04', t:'Kelulusan perumahan rakyat manual', p:'Rumah Mesra SMJ mengambil 14 hari; pengesahan tanah, teknikal & kelayakan dilakukan secara berasingan tanpa jejak digital.', r:'Jepun (Qiyuesuo e-meterai), Korea (model SEUMTER)'},
      {n:'05', t:'Data PBT tidak sampai ke peringkat negeri', p:'Tiada API piawai daripada PBT ke Hab Data Negeri — menyebabkan Kokpit Ketua Menteri kehilangan separuh gambaran negeri.', r:'Korea (City Data Hub), Singapura (data.gov.sg)'}
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
          <p class="sec-lede">Dokumen PORTF·AA mengesahkan lima jurang pelaksanaan — setiap satunya telah menemui penyelesaiannya di keempat-empat negara rujukan. Jurang kelima ialah yang paling strategik: ia memutuskan rantaian data daripada PBT ke Kokpit Ketua Menteri.</p>
        </div>
        <div class="jurang-grid">
          ${cards}
          <div class="card-impact">
            <span class="impact-label">Kos tidak bertindak</span>
            <div class="impact-big">13<span> PBT</span></div>
            <p>Masih beroperasi di luar gerbang ePBT — bersamaan kira-kira 52% rakyat Sabah yang masih berurusan di kaunter. Selagi data PBT tidak bersekutu ke Hab Data Negeri, Kokpit Ketua Menteri hanya melihat separuh negeri.</p>
          </div>
        </div>
      </div>`;
  }

  function demo(){
    const panels = {
      ringkasan: `
        <div class="chart-card"><h3>Skor kematangan digital PBT</h3><p>0–100 · berdasarkan ePBT, API &amp; kualiti data · simulasi</p><div id="ch-matang" class="chart-area"></div></div>
        <div class="chart-card"><h3>Masa kelulusan pembangunan (hari)</h3><p>12 bulan · garis dasar 96 hari, sasaran 45 hari</p><div id="ch-kelulusan" class="chart-area"></div></div>`,
      permit: `
        <div class="chart-card"><h3>Permit diproses mengikut PBT</h3><p>jumlah permohonan 12 bulan · simulasi</p><div id="ch-permit" class="chart-area"></div></div>
        <div class="chart-card"><h3>Status permohonan permit</h3><p>5,850 permohonan aktif · simulasi</p><div id="ch-statuspermit" class="chart-area donut"></div></div>`,
      aduan: `
        <div class="chart-card"><h3>% aduan diselesaikan dalam SLA</h3><p>12 bulan · SLA 14 hari · trend naik</p><div id="ch-aduan" class="chart-area"></div></div>
        <div class="chart-card"><h3>Aduan mengikut kategori</h3><p>30 hari terakhir · simulasi</p><div id="ch-kategori" class="chart-area"></div></div>`,
      perumahan: `
        <div class="chart-card"><h3>Masa kelulusan perumahan per peringkat</h3><p>hari · sebelum automasi vs selepas (simulasi)</p><div id="ch-masarumah" class="chart-area"></div></div>
        <div class="chart-card"><h3>Permohonan diterima vs diluluskan</h3><p>12 bulan · Rumah Mesra SMJ · simulasi</p><div id="ch-permohonan" class="chart-area"></div></div>`
    };
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold-light">BUKTI KONSEP INTERAKTIF</span>
          <h2 class="serif light">Kokpit PORTF·AA — Dashboard Eksekutif</h2>
          <p class="sec-lede light">Inilah wajah SaaS yang dicadangkan: satu skrin untuk menjawab soalan EXCO — PBT mana belum masuk, permit mana terlewat, aduan mana tertunggak. Kubahkan tab di bawah untuk mencuba sendiri.</p>
          <p class="note-ilus">Angka portfolio (25 PBT, 12 disepadukan, 72 hari) dipetik daripada laporan TSKN; baki titik data adalah <span class="tag-ilus">ILUSTRATIF</span>.</p>
        </div>
        <div class="kpi-row">
          <div class="kpi"><b>12 / 25</b><span>PBT dalam gerbang ePBT</span><em>sasaran 25</em></div>
          <div class="kpi"><b>72 hari</b><span>Kelulusan pembangunan</span><em>sasaran ≤ 45</em></div>
          <div class="kpi"><b>78%</b><span>Aduan dalam SLA</span><em>SLA 14 hari</em></div>
          <div class="kpi"><b>6.2 hari</b><span>Kelulusan Rumah Mesra SMJ</span><em>sasaran ≤ 3</em></div>
        </div>
        <div class="tabs" id="tabs-demo">
          <button class="tab active" data-tab="ringkasan">Ringkasan PBT</button>
          <button class="tab" data-tab="permit">ePBT &amp; Permit</button>
          <button class="tab" data-tab="aduan">Aduan &amp; SLA</button>
          <button class="tab" data-tab="perumahan">Perumahan Rakyat</button>
        </div>
        <div class="tab-panel active" data-panel="ringkasan">${panels.ringkasan}</div>
        <div class="tab-panel" data-panel="permit">${panels.permit}</div>
        <div class="tab-panel" data-panel="aduan">${panels.aduan}</div>
        <div class="tab-panel" data-panel="perumahan">${panels.perumahan}</div>
      </div>`;
  }

  /* -------- SIMULASI PBT & AGENSI + PERSEKUTUAN -------- */
  function integrasi(){
    const chips = ENTITI.map((k,i)=>`
      <button class="mchip ${k.st} ${i===0?'sel':''}" data-i="${i}">
        <span class="mn">${esc(k.s)} · ${esc(k.n.split(' — ')[0])}</span>
        <span class="mb"><span class="dot"></span><span class="bar"><i style="width:${k.p}%"></i></span><span class="mp">${k.p}%</span></span>
      </button>`).join('');

    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold">SIMULASI PaaS DOMAIN</span>
          <h2 class="serif">PBT &amp; Agensi Disepadukan dalam Satu PaaS</h2>
          <p class="sec-lede">Klik mana-mana entiti untuk melihat profil data, endpoint API dan tahap penyepaduan. Tekan <b>Jalankan Simulasi</b> untuk menyambungkan kesemua 15 entiti ke gerbang domain — daripada 6 kepada 15.</p>
        </div>

        <div class="sim-console">
          <div class="sim-bar">
            <b>Gerbang ePBT &amp; PaaS KKT</b>
            <span class="sim-status" id="simStatus"><i></i> Bersedia</span>
            <span class="sim-count" id="simCount">6<small> / 15 disepadukan</small></span>
          </div>
          <div class="sim-body">
            <div class="ministry-grid" id="mGrid">${chips}</div>
            <div>
              <div class="sim-detail" id="simDetail"></div>
              <div class="sim-log" id="simLog"><div><span class="t">[--:--:--]</span> <span class="hl">Sistem sedia.</span> 6 daripada 15 entiti telah disepadukan. Tekan "Jalankan Simulasi" untuk meneruskan.</div></div>
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
          <h4>Aliran PaaS domain — daripada PBT ke agensi teknikal</h4>
          <p class="pf-sub">Setiap PBT &amp; agensi menghantar ke satu gerbang domain; gerbang menormalisasi, mengaudit &amp; mengagihkan semula.</p>
          <div id="flowSvg"></div>
        </div>

        <div class="fed-card">
          <h4>Persekutuan PaaS — KKT &amp; Perumahan → PaaS Negeri</h4>
          <p class="fed-sub">PaaS domain ini <b>tidak berdiri sendiri</b>. Ia bersekutu ke atas ke Hab Data &amp; Gerbang API Negeri di bawah <a href="../sabah-portfolio-zainudin/index.html#integrasi" target="_blank">PORTF·ZA · Datuk Zainudin Aman</a> — supaya setiap permit, aduan dan unit perumahan yang diluluskan di peringkat PBT terus mengalir ke Kokpit Ketua Menteri.</p>
          <div class="fed-row">
            <div class="fed-node own">
              <span class="fn-tag">PaaS domain · lapisan bawah</span>
              <h5>PORTF·AA · KKT &amp; Perumahan Sabah</h5>
              <p>Gerbang ePBT, permit pembangunan, aduan OneService-style &amp; automasi perumahan rakyat. Memiliki 15 entiti dan 386 dataset.</p>
              <div class="fn-meta">POST https://paas.kkt.sabah.gov.my/v1/federation/publish</div>
            </div>
            <div class="fed-arrow">
              <div class="fa-line"><span class="fa-dot"></span></div>
              <div class="fa-lab">↑ terbit<br>ke atas</div>
            </div>
            <div class="fed-node up">
              <span class="fn-tag">PaaS negeri · lapisan atas</span>
              <h5>PORTF·ZA · Hab Data &amp; Gerbang API Negeri</h5>
              <p>Menerima dataset terpakai daripada 11 kementerian, menormalisasi takrif, lalu mengisi 13 petunjuk SMJ 2.0 pada Kokpit Ketua Menteri.</p>
              <div class="fn-meta">POST https://gateway.sabah.gov.my/v1/dataset/ingest</div>
            </div>
          </div>
          <div class="fed-meter">
            <span class="fm-lab">Dataset PBT diterbitkan ke Hab Data Negeri</span>
            <span class="fm-bar"><i id="fedBar" style="width:55%"></i></span>
            <span class="fm-val" id="fedVal">214 / 386</span>
            <button class="btn-gold" onclick="FED.publish()">⇧ Terbit sekarang</button>
            <a class="cross-link" href="../sabah-portfolio-zainudin/index.html#kpi-km" target="_blank">↗ Buka Kokpit KM</a>
          </div>
          <div class="fed-log" id="fedLog"><div><span class="t">[--:--:--]</span> <span class="hl">Pautan persekutuan aktif.</span> 214 daripada 386 dataset PBT telah diterbitkan ke Hab Data Negeri.</div></div>
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
          <h2 class="serif">Laporan KPI PBT &amp; Perumahan untuk Ketua Menteri</h2>
          <p class="sec-lede">Dijana terus daripada Kokpit PORTF·AA dan <b>disalurkan ke atas</b> ke PaaS Negeri (PORTF·ZA). Ketua Menteri melihat prestasi 25 PBT pada saat ini — bukan laporan suku tahunan yang dikumpul melalui emel.</p>
        </div>

        <div class="km-wrap">
          <div class="km-head">
            <div>
              <h4>Laporan Prestasi PBT &amp; Perumahan — Negeri Sabah</h4>
              <div class="km-sub">Disatukan daripada 25 PBT · 6 agensi · 386 dataset · 12 petunjuk</div>
            </div>
            <span class="live-badge"><i></i> LANGSUNG</span>
            <div class="km-clock">Dikemas kini <b id="kmAgo">0s</b> lalu · <span id="kmTime">--:--:--</span></div>
          </div>

          <div class="km-kpis">
            <div class="km-kpi"><span class="kk-lab">PBT dalam gerbang</span><span class="kk-val" id="kv1">12<span class="kk-unit">/ 25</span></span><span class="kk-meta">+4 bulan ini</span><div class="kk-spark" id="ks1"></div></div>
            <div class="km-kpi"><span class="kk-lab">Kelulusan pembangunan</span><span class="kk-val" id="kv2">72<span class="kk-unit">hari</span></span><span class="kk-meta">sasaran ≤ 45 hari</span><div class="kk-spark" id="ks2"></div></div>
            <div class="km-kpi"><span class="kk-lab">Aduan dalam SLA</span><span class="kk-val" id="kv3">78<span class="kk-unit">%</span></span><span class="kk-meta">SLA 14 hari</span><div class="kk-spark" id="ks3"></div></div>
            <div class="km-kpi"><span class="kk-lab">Perumahan dilulus</span><span class="kk-val" id="kv4">842<span class="kk-unit">unit</span></span><span class="kk-meta">sasaran 1,000 unit</span><div class="kk-spark" id="ks4"></div></div>
          </div>

          <div class="scorecard">
            <h5>12 Petunjuk PBT &amp; Perumahan</h5>
            <div class="tbl-wrap"><table class="sc-tbl">
              <thead><tr><th>Petunjuk</th><th>Semasa</th><th>Sasaran</th><th>Status</th><th>Kemajuan</th><th>Δ</th></tr></thead>
              <tbody>${rows}</tbody>
            </table></div>
          </div>

          <div class="km-fed">
            <h5>Disumbangkan ke PaaS Negeri (PORTF·ZA)</h5>
            <div class="km-fed-chips">
              <span>Pendigitalan PBT · <b>12 / 25</b></span>
              <span>Aduan PBT dalam SLA · <b>78%</b></span>
              <span>Kelulusan perumahan rakyat · <b>6.2 hari</b></span>
              <span>Liputan jalur lebar PBT · <b>84%</b></span>
            </div>
          </div>

          <div class="km-alerts">
            <h5 style="font-family:var(--sans);font-size:13px;color:var(--navy);text-transform:uppercase;letter-spacing:.06em;margin:4px 0 10px">Amaran untuk perhatian segera</h5>
            <div class="km-alert crit"><b>Kelulusan pembangunan 72 hari</b> — masih 27 hari di atas sasaran 45; JPBD &amp; JKR ialah dua peringkat paling lambat.<span class="ka-t">U4 · KKT</span></div>
            <div class="km-alert warn"><b>Masa tindak aduan 4.2 hari</b> — melebihi SLA 3 hari di 7 PBT; kategori sampah paling tertunggak.<span class="ka-t">U4 · PBT</span></div>
            <div class="km-alert"><b>13 PBT belum masuk gerbang</b> — 172 dataset masih dalam format PDF / imbasan.<span class="ka-t">A5 · Hab Data</span></div>
          </div>

          <div class="km-foot">
            <button class="btn-gold" onclick="KM.refresh()">↻ Muat Semula</button>
            <button class="btn-outline" onclick="KM.export()">⇩ Eksport PDF</button>
            <button class="btn-outline" onclick="KM.share()">✉ Kongsi ke Ketua Menteri</button>
            <span class="km-note">Disalurkan ke PORTF·ZA · Tiada data sebenar PBT digunakan</span>
          </div>
          <div class="refresh-bar"><i id="rfBar"></i></div>
        </div>
      </div>`;
  }

  function benchmark(){
    const countries = [
      {id:'sg', flag:'🇸🇬', name:'Singapura', tag:'Guru perkhidmatan bandar satu pintu',
        intro:'OneService · HDB · GoBusiness',
        desc:'OneService menyatukan aduan daripada 16 agensi bandar ke satu aplikasi dengan SLA yang boleh dijejak; HDB mengurus 80% perumahan awam dengan portal penuh digital — dari permohonan flat hingga penyelenggaraan.',
        stats:[['16 agensi','Satu aplikasi aduan'],['~80%','Perumahan awam (HDB)'],['14 hari','SLA aduan standard'],['GoBusiness','Permit perniagaan']],
        sub:[
          {h:'Satu saluran untuk semua aduan bandar', p:'Rakyat tidak perlu tahu agensi mana yang bertanggungjawab — tiket dihala secara automatik (padanan A3).'},
          {h:'Perumahan awam sebagai platform', p:'HDB Portal mengendalikan permohonan, pemilikan, pembiayaan & penyelenggaraan dalam satu akaun (padanan A4).'},
          {h:'Data bandar terbuka', p:'data.gov.sg menerbitkan dataset PBT untuk pembangun & penyelidik — ekosistem inovasi tempatan.'}
        ]},
      {id:'kr', flag:'🇰🇷', name:'Korea Selatan', tag:'Guru penyampaian digital PBT & interoperabiliti',
        intro:'국민신문고 · ePBT berpusat · City Data Hub',
        desc:'국민신문고 (People\'s Sinmungo) ialah portal aduan kebangsaan yang disambung terus ke semua PBT; kerajaan tempatan mewajibkan penerbitan dataset ke City Data Hub untuk digunakan semula oleh kementerian lain.',
        stats:[['국민신문고','Aduan kebangsaan'],['226 PBT','Disambung berpusat'],['City Data Hub','Data bandar dikongsi'],['100%','PBT dalam portal']],
        sub:[
          {h:'Aduan kebangsaan sampai ke PBT', p:'Satu portal, penghalaan automatik ke 226 kerajaan tempatan, dengan SLA dipantau (padanan A3).'},
          {h:'Interoperabiliti diwajibkan', p:'PBT wajib terbitkan dataset ke City Data Hub — data bandar mengalir ke kementerian (padanan A5).'},
          {h:'Penilaian e-kerajaan tempatan', p:'Setiap PBT dinilai tahap kematangan digital & diterbitkan — insentif penambahbaikan (padanan A6).'}
        ]},
      {id:'jp', flag:'🇯🇵', name:'Jepun', tag:'Guru e-permit swakendali & automasi borang',
        intro:'Graffer スマート申請 · LoGoフォーム · Trustbank',
        desc:'Perbandaran Jepun menggunakan platform スマート申請 (permohonan pintar) yang menjana borang secara automatik daripada perbualan; LoGoフォーム digunakan oleh 400+ perbandaran untuk pendigitalan borang tanpa menulis kod.',
        stats:[['400+','Perbandaran guna LoGo'],['スマート申請','Borang auto-jana'],['3 minit','Isi borang purata'],['Qiyuesuo','E-meterai & e-tandatangan']],
        sub:[
          {h:'Borang yang menjana dirinya sendiri', p:'Pemohon menjawab soalan, sistem membina borang yang sah — menghapuskan ralat isian (padanan A2).'},
          {h:'E-meterai & e-tandatangan', p:'Qiyuesuo membolehkan kelulusan berbilang pihak tanpa cetak — mempercepatkan kelulusan teknikal.'},
          {h:'Perbandaran kecil pun mampu', p:'Platform SaaS kos rendah membolehkan PBT dengan 5,000 penduduk pun berdigital (padanan 25 PBT Sabah).'}
        ]},
      {id:'cn', flag:'🇨🇳', name:'China', tag:'Guru skala & urusan sekali sahaja',
        intro:'一网通办 · 最多跑一次 · Bandar pintar',
        desc:'一网通办 ("satu jaringan untuk semua urusan") membolehkan rakyat selesaikan urusan PBT tanpa hadir; dasar 最多跑一次 ("cukup datang sekali sahaja") mengurangkan lawatan fizikal ke pejabat kerajaan secara mendadak.',
        stats:[['一网通办','Satu jaringan urusan'],['最多跑一次','Dasar lawatan sekali'],['90%+','Urusan dalam talian'],['Bandar pintar','Sensor & orkestrasi']],
        sub:[
          {h:'Cukup datang sekali sahaja', p:'Dasar kebangsaan memaksa agensi mereka semula proses supaya rakyat tidak berulang-alik (padanan A2).'},
          {h:'Satu jaringan untuk semua PBT', p:'Semua perbandaran disambung ke platform kebangsaan — data & proses seragam merentas wilayah (padanan A1).'},
          {h:'Sensor bandar & orkestrasi', p:'Bandar pintar menggabung trafik, sampah & utiliti untuk keputusan operasi harian.'}
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
          <h2 class="serif">Empat Negara, Empat Pendekatan Kerajaan Tempatan</h2>
          <p class="sec-lede">Jangan tiru satu negara menyeluruh — tiru bahagian terbaik setiap negara bagi setiap domain. Singapura menguasai perkhidmatan bandar satu pintu; Korea, interoperabiliti PBT yang diwajibkan; Jepun, e-permit swakendali untuk PBT kecil; China, skala &amp; dasar "cukup datang sekali".</p>
        </div>
        <div class="ctabs" id="ctabs-negara">${tabs}</div>
        ${panels}
        <div class="matrix-card">
          <h3 class="serif">Matriks Amalan Terbaik — 4 Domain × 4 Negara</h3>
          <p class="sec-lede" style="margin-top:0">Pemetaan langsung daripada Bahagian 7 laporan benchmark. Setiap sel ialah amalan tersahkan dengan sitasi penuh.</p>
          <div class="matrix-wrap"><table class="matrix">
            <thead><tr><th>Domain</th><th>SG Singapura</th><th>KR Korea Selatan</th><th>JP Jepun</th><th>CN China</th></tr></thead>
            <tbody>
              <tr><td><b>Perkhidmatan PBT &amp; Permit</b></td><td>GoBusiness satu penilai; OneService</td><td>ePBT berpusat; 226 PBT disambung</td><td>スマート申請 auto-jana; LoGoフォーム 400+ bandar</td><td>一网通办; 最多跑一次</td></tr>
              <tr><td><b>Aduan Rakyat</b></td><td>OneService 16 agensi; SLA 14 hari</td><td>국민신문고 kebangsaan → PBT</td><td>Sistem aduan perbandaran berasingan</td><td>12345 hotline kebangsaan</td></tr>
              <tr><td><b>Perumahan Awam</b></td><td>HDB portal penuh; ~80% populasi</td><td>LH Corporation; pendaftaran digital</td><td>UR &amp; perumahan perbandaran</td><td>Perumahan mampu milik bandar</td></tr>
              <tr><td><b>Data &amp; Interoperabiliti</b></td><td>data.gov.sg; MyInfo padanan</td><td>City Data Hub diwajibkan</td><td>Piawai perbandaran; e-meterai Qiyuesuo</td><td>Platform data kebangsaan; kod bandar</td></tr>
            </tbody>
          </table></div>
        </div>
        <div class="strategic-card">
          <h3 class="serif">Bacaan Strategik Sabah</h3>
          <p class="sec-lede" style="margin-top:0">Skor keupayaan domain (1–5, penilaian analitik ilustratif) menunjukkan tiada satu negara unggul dalam semua domain. Singapura unggul perkhidmatan &amp; aduan; Korea unggul interoperabiliti; China unggul skala; Jepun paling boleh ditiru oleh PBT kecil.</p>
          <div class="strategic-row">
            <div id="ch-radar" class="radar-area"></div>
            <div class="strategic-notes">
              <div><span class="tag">5.0</span> Singapura · perkhidmatan, aduan &amp; perumahan — tetapi skala bandar-negara</div>
              <div><span class="tag">5.0</span> Korea · interoperabiliti PBT diwajibkan — memerlukan akta sokongan</div>
              <div><span class="tag">5.0</span> China · skala satu jaringan — sukar ditiru tanpa sistem kebangsaan</div>
              <div><span class="tag">4.8</span> Jepun · e-permit swakendali — paling praktikal untuk 25 PBT Sabah</div>
              <p style="margin-top:10px;border-top:1px dashed var(--line);padding-top:10px"><b>Sabah boleh jadi pembeda:</b> gabungkan e-permit swakendali Jepun (untuk 25 PBT) + kewajipan interoperabiliti Korea (dataset PBT ke Hab Data Negeri) — negeri pertama di Malaysia dengan PBT yang bersekutu penuh ke Kokpit Ketua Menteri.</p>
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
          <h2 class="serif">Lima Lapisan, Tujuh Modul — PaaS Domain Bersekutu</h2>
          <p class="sec-lede">Prinsip teras: bina atas sistem sedia ada (ePBT, MyGDX, JPBD, JKR), jangan ganti; mulakan dengan PBT perintis sebelum skala penuh; dan <b>terbitkan ke atas</b> ke PaaS Negeri supaya data PBT sampai ke Kokpit Ketua Menteri.</p>
        </div>
        <div class="side-by-side">
          <div class="mode-card">
            <h3 class="serif">Sebagai SaaS</h3>
            <p class="mode-sub">Software as a Service — untuk 25 PBT &amp; 6 agensi</p>
            <ul>
              <li>Kokpit eksekutif, penjejak permit &amp; SLA aduan diambil sebagai perkhidmatan langganan — PBT tiada perlu bangunkan sistem sendiri.</li>
              <li>Modul dihidupkan PBT demi PBT mengikut jadual yang diterbitkan awam (corak ePBT berpusat Korea).</li>
              <li>Skor Kad PBT menjadikan keserasian dan kualiti data setiap PBT kelihatan — insentif tabiat baik.</li>
            </ul>
          </div>
          <div class="mode-card">
            <h3 class="serif">Sebagai PaaS</h3>
            <p class="mode-sub">Platform as a Service — bersekutu ke Hab Data Negeri</p>
            <ul>
              <li>API terbuka atas gerbang domain membenarkan PBT, pemaju &amp; universiti membina aplikasi sendiri di atas satu rekod kebenaran.</li>
              <li>Komponen semakan zon, pengesahan identiti &amp; e-meterai ditawarkan sebagai blok binaan — corak APEX Singapura.</li>
              <li><b>Penyambung persekutuan</b> menormalisasi dataset PBT lalu menerbitkannya ke PaaS Negeri (PORTF·ZA) secara berjadual.</li>
            </ul>
          </div>
        </div>
        <div class="layers-card">
          <h3 class="serif">Senibina Lima Lapisan</h3>
          <p>Tiga lapisan bawah ialah domain KKT; dua lapisan atas dikongsi dengan PaaS Negeri melalui penyambung persekutuan.</p>
          <ol class="layers">
            <li><b>L1 Lapisan Data Asas</b><span>Fondasi: satu takrif perkhidmatan PBT.</span><em>Taksonomi Perkhidmatan PBT Tunggal · Katalog 386 dataset · Daftar premis &amp; tanah</em></li>
            <li><b>L2 Lapisan Integrasi</b><span>Bina atas sistem sedia ada — jangan ganti, satukan.</span><em>ePBT 25 PBT · JPBD &amp; JKR · MyGDX &amp; MyGOV · Padanan MyKad 360°</em></li>
            <li><b>L3 Lapisan Analitik</b><span>Model &amp; skor berpusat — kesamaan ukuran untuk semua PBT.</span><em>Penjejak SLA aduan · Ramalan kelulusan · Skor Kad PBT &amp; amaran awal</em></li>
            <li><b>L4 Lapisan Aplikasi</b><span>SaaS per PBT: langganan modul tanpa bangunkan sistem sendiri.</span><em>Kokpit PBT · Gerbang permit bersepadu · Laporan automatik ke EXCO</em></li>
            <li><b>L5 Lapisan Persekutuan</b><span>PaaS domain → PaaS Negeri: satu rantaian data.</span><em>Penyambung persekutuan · Hab Data Negeri (PORTF·ZA) · Kokpit Ketua Menteri</em></li>
          </ol>
        </div>
        <h3 class="serif" style="text-align:center;margin-top:36px">Tujuh Modul Teras</h3>
        <div class="mods">
          <div class="mod"><b>M1</b><h4>ePBT Seragam &amp; Taksonomi Perkhidmatan</h4><p>Satu takrif untuk setiap perkhidmatan PBT; katalog 386 dataset daripada 25 PBT &amp; 6 agensi.</p></div>
          <div class="mod"><b>M2</b><h4>Gerbang Permit Pembangunan Bersepadu</h4><p>Permohonan swakendali corak Jepun; satu penilai teraju merentas JPBD &amp; JKR.</p></div>
          <div class="mod"><b>M3</b><h4>Pusat Aduan Satu Pintu dengan SLA</h4><p>OneService-style; penghalaan automatik &amp; SLA 14 hari yang boleh dijejak awam.</p></div>
          <div class="mod"><b>M4</b><h4>Automasi Kelulusan Perumahan Rakyat</h4><p>Rumah Mesra SMJ: pendaftaran → kelayakan → teknikal → tawaran dalam 3 hari.</p></div>
          <div class="mod"><b>M5</b><h4>Penyambung Persekutuan ke PaaS Negeri</h4><p>Menormalisasi dataset PBT lalu menerbitkannya ke Hab Data Negeri (PORTF·ZA).</p></div>
          <div class="mod"><b>M6</b><h4>Skor Kad PBT &amp; Penandaarasan Awam</h4><p>Kematangan digital setiap PBT dinilai &amp; diterbitkan — insentif penambahbaikan.</p></div>
          <div class="mod"><b>M7</b><h4>Agen AI Perkhidmatan PBT</h4><p>SEA-LION untuk Bahasa Melayu: semakan borang, ringkasan aduan &amp; bantuan pemohon.</p></div>
        </div>
        <div class="cta-block">
          <div>
            <h4>Laluan Perolehan</h4>
            <p>Fasa 0 → 3 sepadan dengan peta jalan pelaksanaan: prototaip konsep → ePBT &amp; taksonomi → gerbang &amp; akta → skala penuh 25 PBT bersekutu.</p>
          </div>
          <a href="#peta-jalan" class="btn-gold">Lihat peta jalan →</a>
        </div>
      </div>`;
  }

  function cadangan(){
    const items = [
      {c:'A1', t:'ePBT Seragam &amp; Taksonomi Perkhidmatan PBT', j:'01 · ePBT tidak seragam', r:'Singapura (OneService), Korea (ePBT berpusat)'},
      {c:'A2', t:'Gerbang Permit Pembangunan Bersepadu', j:'02 · Kelulusan lambat', r:'Jepun (スマート申請), Singapura (BGP)'},
      {c:'A3', t:'Pusat Aduan Satu Pintu dengan SLA 14 Hari', j:'03 · Tiada SLA berpusat', r:'Singapura (OneService), Korea (국민신문고)'},
      {c:'A4', t:'Automasi Kelulusan Perumahan Rakyat', j:'04 · Perumahan manual', r:'Jepun (Qiyuesuo), Korea (SEUMTER)'},
      {c:'A5', t:'Penyambung Persekutuan ke Hab Data Negeri', j:'05 · Data tak sampai negeri', r:'Korea (City Data Hub), Singapura (data.gov.sg)'},
      {c:'A6', t:'Skor Kad PBT &amp; Penandaarasan Awam', j:'01 · Kematangan tidak diukur', r:'Jepun (penarafan PBT), Korea (penilaian e-gov)'}
    ];
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold-light">CADANGAN DASAR</span>
          <h2 class="serif light">A1–A6: Daripada Bukti Dunia kepada Kabinet Nota</h2>
          <p class="sec-lede light">Setiap cadangan dipetakan satu-satu kepada jurang PORTF·AA, sasaran EXCO &amp; model rujukan antarabangsa. A5 ialah cadangan paling strategik — ia menyambungkan PBT ke PaaS Negeri Datuk Zainudin Aman.</p>
        </div>
        <div class="dcards">
          ${items.map(i=>`<div class="dcard"><div class="dcode">${i.c}</div><div><h4>${i.t}</h4><p class="dmeta">Jurang: <b>${i.j}</b> · Rujukan: <b>${i.r}</b></p></div></div>`).join('')}
        </div>
      </div>`;
  }

  function petaJalan(){
    const phases = [
      {p:'p0', t:'Taklimat & Prototaip Konsep', w:'Suku 4 2026',
        ul:['Taklimat demo 30 minit kepada YB Menteri &amp; KSU','Lantik 6 PBT &amp; agensi perintis (DBKK, MPS, MPT, JPBD, JKR, PTD)','MoU perkongsian data selaras PDPA'],
        out:'MoU 6 entiti ditandatangani; peta data PBT selesai',
        ref:'Penanda aras: KESAN Fasa 0; kajian RUN 2026'},
      {p:'p1', t:'ePBT & Taksonomi', w:'Suku 1–2 2027',
        ul:['Lulus takrif perkhidmatan PBT melalui notis pentadbiran','Siar katalog 386 dataset PBT','Gerbang domain fasa 1 (6 entiti disepadukan)'],
        out:'100% perkhidmatan dalam katalog; 6 entiti disepadukan',
        ref:'Penanda aras: Korea (ePBT berpusat); Singapura (OneService)'},
      {p:'p2', t:'Gerbang & Persekutuan', w:'Suku 3–4 2027',
        ul:['Aktifkan gerbang permit pembangunan bersepadu','Aktifkan penyambung persekutuan ke Hab Data Negeri (PORTF·ZA)','Lancar pusat aduan satu pintu dengan SLA 14 hari'],
        out:'Kelulusan ≤ 60 hari; 214 dataset PBT diterbitkan ke negeri',
        ref:'Penanda aras: Jepun (スマート申請); Korea (City Data Hub)'},
      {p:'p3', t:'Skala Penuh 25 PBT', w:'2028',
        ul:['Gerbang ePBT PBT demi PBT sehingga 25/25','Automasi penuh perumahan rakyat (≤ 3 hari)','Skor Kad PBT diterbitkan awam setiap suku tahun'],
        out:'25/25 PBT; kelulusan ≤ 45 hari; 100% dataset ke negeri',
        ref:'Penanda aras: Korea (226 PBT); China (一网通办)'}
    ];
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold">PETA JALAN PELAKSANAAN</span>
          <h2 class="serif">Fasa 0 → 3: Suku 4 2026 hingga 2028</h2>
          <p class="sec-lede">Diselaraskan dengan peta jalan PaaS Negeri (PORTF·ZA) supaya persekutuan data PBT ke Hab Data Negeri berlaku pada tetingkap yang sama — bukan dua projek yang berasingan.</p>
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
          <p class="sec-lede">Setiap cadangan disertai angka sasaran, tarikh dan populasi penerima. Sumber data KPI ialah sistem PORTF·AA itu sendiri — dan petunjuk terpilih disalurkan terus ke Kokpit Ketua Menteri melalui PaaS Negeri.</p>
        </div>
        <div class="kpi-card">
          <h3 class="serif">KPI per Cadangan Dasar</h3>
          <div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Cadangan</th><th>KPI utama</th><th>Garis dasar</th><th>Sasaran 12 bln</th><th>Sasaran 24 bln</th></tr></thead>
            <tbody>
              <tr><td><b>A1 ePBT Seragam</b></td><td>% PBT dalam satu gerbang dengan takrif seragam</td><td>12 / 25</td><td>18 / 25</td><td>25 / 25</td></tr>
              <tr><td><b>A2 Gerbang Permit</b></td><td>Masa kelulusan pembangunan (hari)</td><td>96 → 72</td><td>≤ 60</td><td>≤ 45</td></tr>
              <tr><td><b>A3 Aduan Satu Pintu</b></td><td>% aduan diselesaikan dalam SLA 14 hari</td><td>54%</td><td>75%</td><td>90%</td></tr>
              <tr><td><b>A4 Perumahan Rakyat</b></td><td>Masa kelulusan Rumah Mesra SMJ (hari)</td><td>14 → 6.2</td><td>≤ 5</td><td>≤ 3</td></tr>
              <tr><td><b>A5 Persekutuan</b></td><td>% dataset PBT diterbitkan ke Hab Data Negeri</td><td>0%</td><td>55%</td><td>100%</td></tr>
              <tr><td><b>A6 Skor Kad PBT</b></td><td>Bil. PBT dengan skor kematangan ≥ 70</td><td>1</td><td>8</td><td>20</td></tr>
            </tbody>
          </table></div>
        </div>
        <div class="kpi-card">
          <h3 class="serif">Risiko Utama &amp; Mitigasi Terbukti</h3>
          <div class="risks">
            <div class="risk ih"><b>Impak: Tinggi · Keb.: Sederhana</b><h5>PBT kecil tiada kapasiti ICT</h5><p>Mitigasi: SaaS kos rendah corak LoGoフォーム; gerbang dihos pusat; PBT hanya perlu sambung, tidak perlu bina.</p></div>
            <div class="risk im"><b>Impak: Sederhana · Keb.: Sederhana</b><h5>Data warisan dalam PDF / imbasan</h5><p>Mitigasi: Penyesuai per PBT; pagar kualiti dengan amaran; keutamaan API JSON dalam perolehan.</p></div>
            <div class="risk ih"><b>Impak: Tinggi · Keb.: Sederhana</b><h5>Persekutuan gagal — takrif PBT tak sepadan negeri</h5><p>Mitigasi: Taksonomi dikongsi dengan PORTF·ZA dari Fasa 1; ujian persekutuan bulanan; ambang keyakinan berperingkat.</p></div>
            <div class="risk ih"><b>Impak: Tinggi · Keb.: Sederhana</b><h5>Kelulusan pantas menaikkan risiko bangunan</h5><p>Mitigasi: Semakan BOMBA automatik; laluan cepat hanya untuk skor tinggi; audit selepas kelulusan.</p></div>
            <div class="risk il"><b>Impak: Tinggi · Keb.: Rendah–Sederhana</b><h5>Keletihan politik / perubahan portfolio</h5><p>Mitigasi: Kanunkan taksonomi &amp; mandat persekutuan dalam akta; IP PORTF·AA milik kerajaan negeri — tiada vendor lock-in.</p></div>
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
          <p class="sec-lede light">Keseluruhan pakej A1–A6 boleh dimulakan tanpa menunggu akta: enam PBT &amp; agensi perintis dan prototaip data sebenar boleh bermula dalam 30 hari — serentak dengan Fasa 0 PaaS Negeri.</p>
        </div>
        <div class="steps">
          <div class="step"><span class="st-num">1</span><h4>Lantik enam PBT &amp; agensi perintis</h4><p>DBKK, MPS, MPT, JPBD, JKR &amp; PTD bagi prototaip data sebenar dalam 30 hari — petakan aliran permit, borang berulang dan kes kelulusan tertunda.</p></div>
          <div class="step"><span class="st-num">2</span><h4>Selaraskan taksonomi dengan PaaS Negeri</h4><p>Takrif perkhidmatan PBT mesti sepadan dengan takrif data negeri (PORTF·ZA) dari hari pertama — supaya persekutuan tidak perlu dibaiki kemudian.</p></div>
          <div class="step"><span class="st-num">3</span><h4>Bawa gerbang permit &amp; penyambung persekutuan ke meja kajian RUN</h4><p>Sebelum keputusan arkitektur dibuat, supaya Belanjawan 2027 berasaskan prototaip yang sudah bersambung ke Hab Data Negeri.</p></div>
        </div>
        <div class="time-window">
          <p><b>Titik tetingkap:</b> kajian RUN berjalan sepanjang 2026 · Belanjawan 2027 dipertahankan Oktober 2026 · Fasa 0 PORTF·ZA berjalan selari — <b>dua PaaS, satu rantaian data</b>, bukan dua projek berasingan.</p>
        </div>
      </div>`;
  }

  function footer(){
    return `
      <div class="foot-grid">
        <div>
          <div class="brand"><span class="brand-mark">A</span><span><span class="b1">PORTF <span class="gold">·AA</span></span><br><span class="b2">PBT &amp; Perumahan · Bersekutu</span></span></div>
          <p class="foot-tag">Platform orkestrasi kerajaan tempatan &amp; perumahan Sabah — "Satu PBT. Satu permit. Satu negeri. Satu keputusan."</p>
        </div>
        <div>
          <h6>Konteks</h6>
          <ul>
            <li>Skop: 25 PBT · 6 agensi · 386 dataset · 12 petunjuk</li>
            <li>Bersekutu ke PaaS Negeri — PORTF·ZA (Datuk Zainudin Aman)</li>
            <li>Benchmark: Singapura, Korea Selatan, Jepun, China</li>
          </ul>
        </div>
        <div>
          <h6>Pautan persekutuan</h6>
          <ul>
            <li><a href="../sabah-portfolio-zainudin/index.html#integrasi">PORTF·ZA · Simulasi 11 Kementerian</a></li>
            <li><a href="../sabah-portfolio-zainudin/index.html#kpi-km">PORTF·ZA · Laporan KPI Ketua Menteri</a></li>
            <li><a href="../sabah-portfolio-raimy/index.html">PORTF·RAIMY · Dana Pendidikan (U5)</a></li>
          </ul>
        </div>
      </div>
      <p class="foot-note">© 2026 · Disediakan untuk YB Datuk Dr. Mohd Arifin Mohd Arif, Menteri Kerajaan Tempatan &amp; Perumahan Sabah · Naib Presiden GRS · ADUN Membakut. Notis: Website ini ialah prototaip konsep ilustratif untuk perbincangan dasar — ia bukan laman rasmi kerajaan dan tidak mengumpulkan sebarang data sebenar PBT. Simulasi PBT dan laporan KPI masa nyata dijana secara setempat untuk demonstrasi seni bina persekutuan PaaS. Semua keputusan dasar tertakluk kepada kajian kebolehlaksanaan formal dan kelulusan kerajaan.</p>`;
  }

  /* ---------------- SIMULASI PBT & AGENSI ---------------- */
  const SIM = (function(){
    let state = null, timer = null, running = false, selIdx = 0;

    function baseState(){ return ENTITI.map(k => ({p:k.p, st:k.st, d:k.d})); }

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

    function detail(i){
      const box = document.getElementById('simDetail');
      if(!box) return;
      const k = ENTITI[i], s = state[i];
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
        <div class="sim-endpoint">GET https://paas.kkt.sabah.gov.my${esc(k.ep)}</div>
        <div style="font-size:11.5px;color:#7a8aa3;margin-top:8px">Medan: ${esc(k.m)}</div>`;
    }

    function log(msg, cls){
      const box = document.getElementById('simLog');
      if(!box) return;
      const t = new Date().toTimeString().slice(0,8);
      const row = document.createElement('div');
      row.innerHTML = `<span class="t">[${t}]</span> <span class="${cls||''}">${msg}</span>`;
      box.insertBefore(row, box.firstChild);
    }

    function setCount(){
      const on = state.filter(s => s.st === 'on').length;
      const el = document.getElementById('simCount');
      if(el) el.innerHTML = on + '<small> / 15 disepadukan</small>';
      const st = document.getElementById('simStatus');
      if(st){
        st.className = 'sim-status' + (running ? ' live' : '');
        st.innerHTML = '<i></i> ' + (running ? 'Menyegerak…' : (on === 15 ? 'Semua 15 disepadukan' : 'Bersedia'));
      }
      return on;
    }

    function run(){
      if(running) return;
      running = true;
      setCount();
      log('<span class="hl">SIMULASI DIMULAKAN</span> — 25 PBT &amp; agensi disambungkan ke gerbang domain…', 'hl');
      const queue = state.map((s,i)=>i).filter(i => state[i].st !== 'on')
        .sort((a,b)=> state[b].p - state[a].p);
      let step = 0;
      timer = setInterval(function(){
        if(step >= queue.length){
          clearInterval(timer);
          running = false;
          setCount();
          log('<span class="ok">SELESAI</span> — 15/15 entiti disepadukan · 386 dataset · sedia diterbitkan ke Hab Data Negeri.', 'ok');
          return;
        }
        const i = queue[step++];
        state[i].st = 'on'; state[i].p = 100; state[i].d = ENTITI[i].d;
        chips(); detail(selIdx); setCount();
        const k = ENTITI[i];
        log(`<span class="ok">200 OK</span> ${esc(k.s)} · ${k.d} dataset · <span class="hl">${esc(k.ep)}</span>`, 'ok');
      }, 550);
    }

    function reset(){
      if(timer) clearInterval(timer);
      running = false;
      state = baseState();
      chips(); detail(selIdx); setCount();
      const box = document.getElementById('simLog');
      if(box) box.innerHTML = '<div><span class="t">[--:--:--]</span> <span class="hl">Set semula.</span> Kembali ke keadaan semasa: 6 daripada 15 entiti disepadukan.</div>';
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
      const f = document.getElementById('flowSvg');
      if(f) f.innerHTML = flowSvg();
    }
    return {run:run, reset:reset, init:init};
  })();

  function flowSvg(){
    const groups = ['DBKK','MP Sandakan','MP Tawau','MD Kudat','MD Ranau','JPBD','JKR','… 8 lagi'];
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
    const outs = ['Kokpit YB Menteri KKT','Portal PBT & pemaju','↑ Hab Data Negeri (PORTF·ZA)'].map(function(o,i){
      const y = 60 + i*50;
      return `<g><rect x="600" y="${y}" width="250" height="36" rx="7" fill="${i===2?'#c9a227':'#0a1b33'}"/>
        <text x="614" y="${y+23}" font-size="11.5" fill="${i===2?'#412402':'#f6eecf'}">${esc(o)}</text></g>`;
    }).join('');
    const outlines = [0,1,2].map(function(i){
      const y = 60 + i*50 + 18;
      return `<path d="M448,150 C500,150 520,${y} 596,${y}" stroke="#c9a227" stroke-width="1.2" fill="none" opacity="0.55"/>
        <circle cx="596" cy="${y}" r="3" fill="#c9a227"/>`;
    }).join('');
    return `<svg viewBox="0 0 870 320" style="width:100%;height:auto">
      ${left}${lines}
      <rect x="262" y="112" width="186" height="76" rx="10" fill="#fff" stroke="#c9a227" stroke-width="1.6"/>
      <text x="355" y="140" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0a1b33">Gerbang ePBT</text>
      <text x="355" y="156" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0a1b33">&amp; PaaS KKT</text>
      <text x="355" y="174" text-anchor="middle" font-size="10" fill="#6b7689">vault · kuota · audit · PDPA</text>
      ${outlines}${outs}
    </svg>`;
  }

  /* ---------------- PERSEKUTUAN KE PaaS NEGERI ---------------- */
  const FED = (function(){
    let published = 214, total = 386, timer = null, busy = false;

    function paint(){
      const bar = document.getElementById('fedBar');
      const val = document.getElementById('fedVal');
      if(bar) bar.style.width = Math.round(published/total*100) + '%';
      if(val) val.textContent = published + ' / ' + total;
    }

    function log(msg, cls){
      const box = document.getElementById('fedLog');
      if(!box) return;
      const t = new Date().toTimeString().slice(0,8);
      const row = document.createElement('div');
      row.innerHTML = `<span class="t">[${t}]</span> <span class="${cls||''}">${msg}</span>`;
      box.insertBefore(row, box.firstChild);
    }

    function publish(){
      if(busy) return;
      busy = true;
      log('<span class="hl">PERSEKUTUAN</span> — memulakan penerbitan ke Hab Data Negeri…', 'hl');
      let step = 0, remaining = total - published;
      const batch = Math.max(1, Math.round(remaining/8));
      timer = setInterval(function(){
        if(published >= total){
          clearInterval(timer); busy = false;
          log('<span class="ok">SELESAI</span> — 386/386 dataset PBT diterbitkan. 4 petunjuk KKT kini mengalir ke Kokpit Ketua Menteri.', 'ok');
          const kv1 = document.getElementById('kv1');
          if(kv1) kv1.innerHTML = '25<span class="kk-unit">/ 25</span>';
          return;
        }
        published = Math.min(total, published + batch);
        step++;
        paint();
        log(`<span class="ok">202 Accepted</span> PORTF·ZA · ${published} dataset · <span class="hl">POST /v1/dataset/ingest</span>`, 'ok');
      }, 500);
    }

    function init(){ paint(); }
    return {publish:publish, init:init};
  })();

  /* ---------------- LAPORAN KPI MASA NYATA ---------------- */
  const KM = (function(){
    let last = Date.now();
    const series = {
      k1:[8,8,9,9,10,10,11,11,12,12],
      k2:[96,94,91,89,86,84,81,79,75,72],
      k3:[54,57,60,62,65,67,69,71,75,78],
      k4:[520,560,610,650,690,720,760,790,820,842]
    };
    const colors = {k1:'#3b6ca8', k2:'#b5403b', k3:'#1f7a55', k4:'#c9a227'};

    function paintSparks(){
      ['k1','k2','k3','k4'].forEach(function(k){
        const el = document.getElementById('ks' + k[1]);
        if(el) el.innerHTML = CH.spark(series[k], colors[k]);
      });
    }

    function refresh(){
      const t = document.getElementById('kmTime');
      if(t) t.textContent = new Date().toLocaleTimeString('ms-MY', {hour12:false});
      const v2 = Math.max(60, Math.round(72 + (Math.random()*3 - 1.5)));
      const v3 = (78 + (Math.random()*1.2 - 0.6)).toFixed(1);
      set('kv2', v2 + '<span class="kk-unit">hari</span>');
      set('kv3', v3 + '<span class="kk-unit">%</span>');
      series.k2.push(v2); series.k2.shift();
      series.k3.push(parseFloat(v3)); series.k3.shift();
      paintSparks();
      ['kv2','kv3'].forEach(function(id){
        const el = document.getElementById(id);
        if(!el) return;
        el.classList.add('flash');
        setTimeout(function(){ el.classList.remove('flash'); }, 600);
      });
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
      el.textContent = Math.floor((Date.now() - last)/1000) + 's';
    }

    function exportPdf(){ alert('Eksport PDF (simulasi) — laporan KPI PBT & Perumahan akan dimuat turun, berserta salinan untuk PORTF·ZA.'); }
    function share(){ alert('Kongsi ke Ketua Menteri (simulasi) — dihantar melalui penyambung persekutuan ke PORTF·ZA.'); }

    function init(){
      paintSparks();
      refresh();
      setInterval(refresh, 4500);
      setInterval(ago, 1000);
    }
    return {refresh:refresh, init:init, export:exportPdf, share:share};
  })();

  /* ---------------- INIT ---------------- */
  function setText(id, html){ const el = document.getElementById(id); if(el) el.innerHTML = html; }

  function paintCharts(){
    Object.keys(CHARTS).forEach(function(k){
      const el = document.getElementById('ch-' + k);
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
    FED.init();
    KM.init();
  });

  window.SIM = SIM;
  window.FED = FED;
  window.KM = KM;
})();
