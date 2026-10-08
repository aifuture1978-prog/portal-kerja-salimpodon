/* ====================================================================
   PORTF·RAIMY — main.js
   Kandungan, pembina carta SVG & interaktiviti untuk semua bahagian.
   ==================================================================== */
(function(){
  'use strict';

  /* ------------ PEMBINA CARTA SVG (ringan, tanpa perpustakaan) ----------- */
  const SVG = (() => {
    const W = 560, PAD = {l:42,r:14,t:14,b:30};
    const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    function scaleY(max){
      const p = Math.pow(10, Math.floor(Math.log10(max||1)));
      const step = p/2;
      return Math.ceil(max/step)*step;
    }
    function axisY(H, max, ticks=5){
      let o='';
      for(let i=0;i<=ticks;i++){
        const v = max*i/ticks;
        const y = PAD.t + (H-PAD.t-PAD.b)*(1 - i/ticks);
        o += `<line x1="${PAD.l}" y1="${y.toFixed(1)}" x2="${W-PAD.r}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.06)"/>`;
        o += `<text x="${PAD.l-6}" y="${(y+4).toFixed(1)}" text-anchor="end" font-size="10" fill="#7a8aa3">${(+v.toFixed(1))}</text>`;
      }
      return o;
    }
    function bar(c){
      const H = 260, n = c.labels.length, m = c.series.length;
      const max = scaleY(Math.max(...c.series.flatMap(s=>s.values))*1.15);
      const plotW = W-PAD.l-PAD.r, groupW = plotW/n, barW = Math.min(34, (groupW*0.62)/m);
      let bars='', xlab='';
      c.labels.forEach((lb,i)=>{
        const gx = PAD.l + groupW*i + groupW/2;
        c.series.forEach((s,j)=>{
          const v = s.values[i];
          const h = (H-PAD.t-PAD.b)*(v/max);
          const x = gx - (m*barW)/2 + j*barW + 2;
          const y = H-PAD.b-h;
          bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(barW-4).toFixed(1)}" height="${Math.max(1,h).toFixed(1)}" rx="3" fill="${s.color}" opacity="0.92"><title>${esc(lb)} · ${esc(s.name)}: ${v}</title></rect>`;
          bars += `<text x="${(x+(barW-4)/2).toFixed(1)}" y="${(y-5).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="600" fill="#cfd8e7">${v}</text>`;
        });
        xlab += `<text x="${gx.toFixed(1)}" y="${H-10}" text-anchor="middle" font-size="10" fill="#aebbd0">${esc(lb)}</text>`;
      });
      return `<svg viewBox="0 0 ${W} ${H}" role="img">${axisY(H,max)}${bars}${xlab}<line x1="${PAD.l}" y1="${H-PAD.b}" x2="${W-PAD.r}" y2="${H-PAD.b}" stroke="rgba(255,255,255,.12)"/></svg>`;
    }
    function line(c){
      const H = 260;
      const max = scaleY(Math.max(...c.series.flatMap(s=>s.values))*1.1);
      const plotW = W-PAD.l-PAD.r, plotH = H-PAD.t-PAD.b;
      const n = c.labels.length;
      const X = i => PAD.l + (plotW/(n-1||1))*i;
      const Y = v => PAD.t + plotH*(1 - v/max);
      let paths='', dots='', xlab='';
      c.series.forEach(s=>{
        let d = s.values.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
        if(c.area) paths += `<path d="${d} L${X(n-1).toFixed(1)},${(H-PAD.b)} L${X(0).toFixed(1)},${(H-PAD.b)} Z" fill="${s.color}" opacity="0.1"/>`;
        paths += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
        s.values.forEach((v,i)=>{
          dots += `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3" fill="#0f2342" stroke="${s.color}" stroke-width="2"><title>${esc(c.labels[i])} · ${esc(s.name)}: ${v}</title></circle>`;
        });
      });
      const step = Math.ceil(n/8);
      c.labels.forEach((lb,i)=>{ if(i%step===0||i===n-1) xlab += `<text x="${X(i).toFixed(1)}" y="${H-10}" text-anchor="middle" font-size="10" fill="#aebbd0">${esc(lb)}</text>`; });
      return `<svg viewBox="0 0 ${W} ${H}" role="img">${axisY(H,max)}${paths}${dots}${xlab}<line x1="${PAD.l}" y1="${H-PAD.b}" x2="${W-PAD.r}" y2="${H-PAD.b}" stroke="rgba(255,255,255,.12)"/></svg>`;
    }
    function donut(c){
      const total = c.items.reduce((a,b)=>a+b.value,0);
      const cx=180, cy=120, R=98, r=58;
      let a0 = -Math.PI/2, seg='';
      c.items.forEach(it=>{
        const frac = it.value/total;
        const a1 = a0 + frac*Math.PI*2;
        const large = (a1-a0) > Math.PI ? 1 : 0;
        const x0=cx+R*Math.cos(a0), y0=cy+R*Math.sin(a0);
        const x1=cx+R*Math.cos(a1), y1=cy+R*Math.sin(a1);
        const x2=cx+r*Math.cos(a1), y2=cy+r*Math.sin(a1);
        const x3=cx+r*Math.cos(a0), y3=cy+r*Math.sin(a0);
        seg += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} A${r},${r} 0 ${large} 0 ${x3.toFixed(1)},${y3.toFixed(1)} Z" fill="${it.color}" opacity="0.92"><title>${esc(it.label)}: ${it.value.toLocaleString()}</title></path>`;
        a0 = a1;
      });
      const rows = c.items.map(it=>{
        const pct = (it.value/total*100).toFixed(1);
        return `<div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px"><span style="width:10px;height:10px;border-radius:3px;background:${it.color};flex:0 0 auto"></span><span style="flex:1;color:#cfd8e7">${esc(it.label)}</span><b style="color:#fff;font-family:'Playfair Display',serif;font-size:14px">${it.value.toLocaleString()}</b><span style="width:48px;text-align:right;color:#7a8aa3;font-size:11px">${pct}%</span></div>`;
      }).join('');
      return `<div style="display:grid;grid-template-columns:1fr 1.1fr;gap:14px;align-items:center">
        <svg viewBox="0 0 360 240" style="width:100%;height:auto"><g transform="translate(0,0)">${seg}</g>
          <text x="180" y="116" text-anchor="middle" font-size="20" font-weight="700" fill="#fff" font-family="Playfair Display,serif">${total.toLocaleString()}</text>
          <text x="180" y="134" text-anchor="middle" font-size="10.5" fill="#aebbd0">jumlah akaun</text>
        </svg>
        <div>${rows}</div>
      </div>`;
    }
    function radar(c){
      // 4-axle radar showing scores per country
      const cx=170, cy=170, R=128;
      const N = c.axes.length;
      const point = (i, v) => {
        const ang = -Math.PI/2 + i*2*Math.PI/N;
        const r = (v/5) * R;
        return [cx + r*Math.cos(ang), cy + r*Math.sin(ang)];
      };
      let grid='', labels='';
      // rings
      for(let k=1;k<=5;k++){
        const pts=[];
        for(let i=0;i<N;i++){
          const ang = -Math.PI/2 + i*2*Math.PI/N;
          pts.push(`${(cx + (R*k/5)*Math.cos(ang)).toFixed(1)},${(cy + (R*k/5)*Math.sin(ang)).toFixed(1)}`);
        }
        grid += `<polygon points="${pts.join(' ')}" fill="none" stroke="#e3dec8" stroke-width="1" opacity="${k===5?0.9:0.5}"/>`;
      }
      // axis labels
      for(let i=0;i<N;i++){
        const ang = -Math.PI/2 + i*2*Math.PI/N;
        const lx = cx + (R+18)*Math.cos(ang);
        const ly = cy + (R+18)*Math.sin(ang);
        labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="11" fill="#1f2a3a" font-weight="600">${esc(c.axes[i])}</text>`;
      }
      // country polygons
      const countries = c.series.map(s=>{
        const pts = s.values.map((v,i)=>point(i,v));
        const polyPts = pts.map(p=>`${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
        const dotPts = pts.map((p,i)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="${s.color}" stroke="#fff" stroke-width="1.5"><title>${esc(s.name)} · ${esc(c.axes[i])}: ${s.values[i]}</title></circle>`).join('');
        return `<polygon points="${polyPts}" fill="${s.color}" opacity="0.18"/><polygon points="${polyPts}" fill="none" stroke="${s.color}" stroke-width="2"/><g>${dotPts}</g>`;
      }).join('');
      const legend = c.series.map(s=>`<span style="display:inline-flex;align-items:center;gap:6px;margin-right:12px;font-size:12px;color:#1f2a3a"><span style="width:12px;height:12px;border-radius:3px;background:${s.color}"></span>${esc(s.name)}</span>`).join('');
      return `<div>
        <svg viewBox="0 0 360 360" style="width:100%;height:auto;max-width:360px;display:block;margin:0 auto">${grid}${countries}${labels}</svg>
        <div style="text-align:center;margin-top:8px">${legend}</div>
      </div>`;
    }
    function render(c){
      if(c.type==='bar') return bar(c);
      if(c.type==='line') return line(c);
      if(c.type==='donut') return donut(c);
      if(c.type==='radar') return radar(c);
      return '';
    }
    return {render};
  })();

  /* ------------ DATA MOCK (simulasi, ditanda ILUSTRATIF dalam UI) --------- */
  const B = ['Okt','Nov','Dis','Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep'];
  const CHARTS = {
    skim: {
      type:'bar', labels:['TPNS','BAGUS','SUKSES','BALKIS','Ihsan'],
      series:[{name:'RM juta', color:'#d9b84a', values:[25.10,8.40,5.20,3.10,2.30]}]
    },
    pelajar: {
      type:'line', area:true, labels:['2022','2023','2024','2025','2026'],
      series:[{name:'Pelajar dibantu', color:'#d9b84a',
        values:[9200,10800,12200,13900,15629]}]
    },
    janji: {
      type:'line', area:true, labels:B,
      series:[{name:'% ≤5 hari', color:'#1f7a55',
        values:[52,55,58,60,62,64,66,68,69,70,71,72]}]
    },
    masa: {
      type:'line', area:true, labels:B,
      series:[{name:'Purata hari', color:'#b5403b',
        values:[8.4,8.1,7.6,7.2,6.9,6.6,6.3,6.0,5.8,5.6,5.4,5.2]}]
    },
    tindihan: {
      type:'bar', labels:['KK','Sandakan','Tawau','Keningau','Lahad Datu','Kudat','Ranau'],
      series:[{name:'Kes', color:'#b5403b', values:[62,48,38,28,18,12,8]}]
    },
    tindihNilai: {
      type:'bar', labels:B,
      series:[{name:'RM ribu', color:'#c9a227', values:[580,540,490,430,380,340,300,260,220,180,150,120]}]
    },
    adopsi: {
      type:'line', area:true, labels:B,
      series:[{name:'% digital', color:'#3b6ca8',
        values:[34,38,42,46,50,54,58,62,66,70,74,78]}]
    },
    status: {
      type:'donut',
      items:[
        {label:'Berjadual / aktif', value:6240, color:'#1f7a55'},
        {label:'Lewat 1–3 bulan', value:2180, color:'#c9a227'},
        {label:'Lewat > 3 bulan', value:1140, color:'#b5403b'},
        {label:'Diselesaikan', value:3890, color:'#3b6ca8'}
      ]
    },
    radar: {
      type:'radar',
      axes:['Biasiswa & Geran','Pemulihan','Anti-Pertindihan','Tadbir Urus'],
      series:[
        {name:'🇰🇷 Korea', color:'#3b6ca8', values:[4.4,4.6,5.0,4.8]},
        {name:'🇯🇵 Jepun', color:'#b5403b', values:[5.0,5.0,4.5,5.0]},
        {name:'🇨🇳 China', color:'#c9a227', values:[4.6,4.4,4.5,5.0]},
        {name:'🇸🇬 Singapura', color:'#1f7a55', values:[4.5,4.2,4.4,4.5]}
      ]
    }
  };

  /* ------------ PEMBINA SEKSYEN -------------------------- */
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function hero(){
    return `
      <div class="hero-inner">
        <div class="hero-top">
          <span class="pill">PROTOTAIP KONSEP · PANDUAN PEMULAAN</span>
          <span class="pill-line">SaaS/PaaS v0.1 · Berasaskan kajian penanda aras 4 negara</span>
        </div>
        <h1 class="serif">Dari <em class="gold">Peruntukan</em> kepada <em class="gold">Pelajar Cemerlang</em></h1>
        <p class="lede"><b>PORTF·RAIMY</b> ialah platform kecerdasan keputusan dana pendidikan Sabah — prototaip konsep SaaS/PaaS yang menyatukan <b>RM25.10j</b> TPNS, <b>4 skim utama</b> dan <b>15,629 pelajar</b> di bawah satu rekod kebenaran. Direka sebagai petunjuk dan panduan kerja pelaksanaan untuk ekosistem biasiswa &amp; geran pendidikan Sabah, dipetakan daripada amalan terbaik <em>Singapura, Korea Selatan, Jepun dan China</em>.</p>
        <blockquote class="motto">"Satu rekod. Setiap pelajar. Setiap ringgit. Setiap keputusan."</blockquote>
        <div class="hero-cta">
          <a href="#demo" class="btn-gold">Lihat Demo Dashboard</a>
          <a href="#peta-jalan" class="btn-outline">Peta Jalan SaaS/PaaS</a>
        </div>
        <div class="hero-stats">
          <div><b>RM 25.10 j</b><span>Dana TPNS disalur</span></div>
          <div><b>15,629</b><span>Pelajar dibantu</span></div>
          <div><b>4</b><span>Skim utama</span></div>
          <div><b>214</b><span>Kes pertindihan dikesan</span></div>
        </div>
      </div>`;
  }

  function jurang(){
    const cards = [
      {n:'01', t:'Penyaluran manual tanpa penjejak', p:'TPNS, BAGUS, SUKSES &amp; BALKIS masing-masing ada jadual sendiri; tiada papan pemuka berpusat untuk mengesan status setiap pelajar dari semakan hingga pulangan.', r:'Jepun (JASSO portal), Korea (KOSAF satu pintu)'},
      {n:'02', t:'Janji biasiswa tanpa alat ukur', p:'Sasaran "5 hari keputusan" tiada penjejak pematuhan berpusat untuk membuktikan pencapaian minggu demi minggu.', r:'Singapura (MySkills SLA), China (pinjaman "310")'},
      {n:'03', t:'Pertindihan tidak terkesan', p:'214 kes penerima mendapat lebih satu skim dikesan secara manual sahaja — tiada enjin semakan berganda automatik merentas 4 skim.', r:'Korea (semakan berganda 2009), China (助学贷款 黑名单)'},
      {n:'04', t:'Kadar pemulihan rendah', p:'Hanya 68% akaun TPNS mengikut jadual — RM8.03j dipulihkan adalah rekod, tetapi 2,314 akaun lewat tanpa automasi susulan.', r:'Jepun (代理返還 income-linked), Korea (징수 전담)'},
      {n:'05', t:'Definisi kelayakan berbeza', p:'TPNS, BAGUS, SUKSES, BALKIS, Ihsan masing-masing pakai takrif pendapatan / akademik sendiri — pelajar yang layak di satu skim ditolak di skim lain.', r:'Jepun (takrif statutori), China (klasifikasi nasional)'}
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
          <p class="sec-lede">Dokumen PORTF·RAIMY mengesahkan lima jurang pelaksanaan — setiap satunya telah menemui penyelesaiannya di keempat-empat negara rujukan. Platform ini direka tepat untuk menutup kelima-limanya.</p>
        </div>
        <div class="jurang-grid">
          ${cards}
          <div class="card-impact">
            <span class="impact-label">Kos tidak bertindak</span>
            <div class="impact-big">RM<span>2.51</span>j</div>
            <p>Nilai 1% sahaja pertindihan daripada portfolio RM25.10j — melebihi peruntukan tahunan biasiswa BAGUS. Inilah sebab pengukuran kesan bukan pilihan — ia tanggungjawab fidusiari.</p>
          </div>
        </div>
      </div>`;
  }

  function demo(){
    const panels = {
      ringkasan: `
        <div class="chart-card"><h3>Peruntukan mengikut skim</h3><p>RM 25.10 juta · TPNS, BAGUS, SUKSES, BALKIS &amp; Ihsan (ilustratif)</p><div id="ch-skim" class="chart-area"></div></div>
        <div class="chart-card"><h3>Pelajar dibantu (kumulatif tahunan)</h3><p>titik 2026 = 15,629 (PORTF·RAIMY); baki titik ilustratif</p><div id="ch-pelajar" class="chart-area"></div></div>`,
      janji: `
        <div class="chart-card"><h3>% pematuhan kelulusan ≤5 hari</h3><p>data 12 bulan · trend naik</p><div id="ch-janji" class="chart-area"></div></div>
        <div class="chart-card"><h3>Masa keputusan purata (hari)</h3><p>data 12 bulan · trend turun</p><div id="ch-masa" class="chart-area"></div></div>`,
      tindihan: `
        <div class="chart-card"><h3>Kes pertindihan dikesan mengikut daerah</h3><p>12 bulan · mesti diarahkan ke masyarakat sebelum bayaran</p><div id="ch-tindihan" class="chart-area"></div></div>
        <div class="chart-card"><h3>Nilai pertindihan (RM)</h3><p>data agregat 12 bulan · sasaran ≤ RM0.6j</p><div id="ch-tindih-nilai" class="chart-area"></div></div>`,
      roi: `
        <div class="chart-card"><h3>Adopsi digital (e-borang / e-tandatangan)</h3><p>% pemohon baharu menggunakan saluran digital</p><div id="ch-adopsi" class="chart-area"></div></div>
        <div class="chart-card"><h3>Status akaun TPNS (kumulatif)</h3><p>berjadual · lewat 1-3 bln · lewat >3 bln · selesai</p><div id="ch-status" class="chart-area donut"></div></div>`
    };
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold-light">BUKTI KONSEP INTERAKTIF</span>
          <h2 class="serif light">Kokpit PORTF — Dashboard Eksekutif</h2>
          <p class="sec-lede light">Inilah wajah SaaS yang dicadangkan: satu skrin untuk menjawab soalan Kabinet — berapa diluluskan, siapa bertindih, akaun mana tertunggak. Kubahkan tab di bawah untuk mencuba sendiri.</p>
          <p class="note-ilus">Angka portfolio (RM25.10j, 15,629 pelajar) dipetik daripada laporan TSKN; baki titik data adalah <span class="tag-ilus">ILUSTRATIF</span>.</p>
        </div>
        <div class="kpi-row">
          <div class="kpi"><b>RM 18.05 j</b><span>Dana diproses (YTD)</span><em>sasaran 75%</em></div>
          <div class="kpi"><b>71.8%</b><span>Keputusan ≤5 hari</span><em>ILUSTRATIF</em></div>
          <div class="kpi"><b>9,214</b><span>Permohonan baharu (bulan ini)</span><em>sasaran ≥60%</em></div>
          <div class="kpi"><b>RM 1.7 j</b><span>Dana berisiko dihentikan sebelum bayaran</span><em>ILUSTRATIF</em></div>
        </div>
        <div class="tabs" id="tabs-demo">
          <button class="tab active" data-tab="ringkasan">Ringkasan Portfolio</button>
          <button class="tab" data-tab="janji">Penjejak Janji 2026</button>
          <button class="tab" data-tab="tindihan">Enjin Anti-Pertindihan</button>
          <button class="tab" data-tab="roi">Analitik ROI Digital</button>
        </div>
        <div class="tab-panel active" data-panel="ringkasan">${panels.ringkasan}</div>
        <div class="tab-panel" data-panel="janji">${panels.janji}</div>
        <div class="tab-panel" data-panel="tindihan">${panels.tindihan}</div>
        <div class="tab-panel" data-panel="roi">${panels.roi}</div>
      </div>`;
  }

  function benchmark(){
    const countries = [
      {id:'sg', flag:'🇸🇬', name:'Singapura', tag:'Guru satu pintu & SLA berangka',
        intro:'MySkills Future & Portal SkillsConnect',
        desc:'Semua skim latihan &amp; biasiswa diproses melalui MySkills Future dengan SLA keputusan 14 hari dipaparkan kepada umum. Lebih 2,000 kursus disahkan dengan satu profil pelajar.',
        stats:[['>2,000','Kursus disahkan'],['14 hari','SLA keputusan'],['S$2.1 b','Perbelanjaan 2024'],['~580k','Pelatih setahun']],
        sub:[
          {h:'Data tersahih sebagai realiti operasi', p:'MyInfo &amp; MyKad digital menarik data daripada ICA, IRAS, CPF secara automatik. Pelajar tidak mengulang hantar dokumen asas.'},
          {h:'Kawalan pertindihan pada reka bentuk skim', p:'Siling per individu untuk setiap skim; satu penilai teraju menilai merentas geran utama (padanan P3).'},
          {h:'Akta Pendidikan &amp; Lembaga latihan', p:'SkillsFuture Singapore Act 2016 dipinda berkala dengan rujukan awam — IPTA &amp; ILT 4 buah menjadi tulang belakang ekosistem.'}
        ]},
      {id:'kr', flag:'🇰🇷', name:'Korea Selatan', tag:'Guru perundangan & semakan berganda',
        intro:'KOSAF & Sistem Semakan Berganda',
        desc:'Korea Student Aid Foundation mengurus semua skim melalui satu portal; sejak 2009, sistem semakan berganda automatik (다중 수혜 점검) menghalang pertindihan sebelum bayaran.',
        stats:[['KRW 5.8 t','Portfolio KOSAF 2024'],['820k','Pelajar menerima'],['100%','Skim di semak berganda'],['14 hari','SLA keputusan']],
        sub:[
          {h:'Akta payung & pindaan berkala', p:'Higher Education Act &amp; Student Aid Act dipinda dengan rujukan awam — pindaan 2023 menambah peruntukan keluarga berpendapatan rendah.'},
          {h:'Pemulihan melalui pemotongan gaji', p:'Sistem 징수 전담 (unit pemungutan khas) mengendalikan akaun lewat >3 bulan dengan jadual potongan &amp; pusat panggilan khusus.'},
          {h:'KOSAF one-stop', p:'Gerbang KOSAF (한국장학재단) menyatukan permohonan semua skim kebangsaan — pelajar isi sekali, diproses berbilang.'}
        ]},
      {id:'jp', flag:'🇯🇵', name:'Jepun', tag:'Guru data statutori & pendapatan-berkait',
        intro:'JASSO & 代理返還 (Pemulangan Automatik)',
        desc:'Japan Student Services Organization mengendalikan semua skim kebangsaan; sejak 2018, sistem 代理返還 memotong ansuran terus daripada gaji majikan — kadar pemulihan >99%.',
        stats:[['¥1.1 t','Portfolio JASSO 2024'],['1.3 juta','Pelajar menerima'],['99.4%','Kadar pemulihan'],['20 tahun','Tempoh pemulangan']],
        sub:[
          {h:'Takrif statutori & tinjauan tahunan', p:'Japan Student Services Act mentakrifkan kelayakan secara tepat; Survei Asas Pelajar wajib setiap tahun (perpaduan data).'},
          {h:'Pemulangan pendapatan-berkait', p:'Skim 所得連動返還 (income-linked) memotong ansuran berdasarkan pendapatan graduan — adil &amp; menurunkan kadar mungkir.'},
          {h:'Subsidi e-invois terjejak fiskal', p:'Subsidi latihan dijejak daripada data transaksi sebenar (e-invois wajib) — ROI digital boleh dibuktikan, bukan hanya tinjauan sukarela.'}
        ]},
      {id:'cn', flag:'🇨🇳', name:'China', tag:'Guru kelajuan & kredit alternatif',
        intro:'助学贷款 (MYbank) & Skor Kredit Pelajar',
        desc:'Sistem pinjaman pelajar kebangsaan menyokong keputusan "310" — 3 minit semakan, 1 saat kelulusan, 0 manusia. 1.4 juta pemohon diproses setiap tahun.',
        stats:[['RMB 70 b','Portfolio 助学贷款 2024'],['1.4 juta','Pelajar menerima'],['3 min','Semakan & kelulusan'],['97.5%','Keputusan digital']],
        sub:[
          {h:'Klasifikasi nasional & taksonomi tunggal', p:'教育部 klasifikasi nasional 2017 menyeragamkan takrif pelajar layak — tiada percanggahan antara wilayah &amp; universiti.'},
          {h:'Skor kredit pelajar (芝麻信用 pelajar)', p:'Data akademik, e-invois, &amp; sejarah pembayaran digabung menjadi skor — penerima berisiko diturunkan kelayakan automatik.'},
          {h:'Indeks SMEDI bulanan', p:'Indeks dinamik ekosistem inovasi &amp; pendidikan dilapor setiap bulan — pengurus dasar baca isyarat sebelum bertukar.'}
        ]}
    ];

    const tabs = countries.map((c,i)=>`<button class="ctab ${i===0?'active':''}" data-c="${c.id}"><span class="flag">${c.flag}</span>${c.name}</button>`).join('');
    const panels = countries.map((c,i)=>`
      <div class="cpanel ${i===0?'active':''}" data-cpanel="${c.id}">
        <div class="cpanel-head ${c.id}">${c.flag} ${c.name} · ${c.tag}</div>
        <div class="cpanel-grid">
          <div class="card-sumber"><p class="cs-sumber">Profil rujukan ${c.name}</p><h4>${c.intro}</h4><p>${c.desc}</p></div>
          <div class="cs-stats">
            ${c.stats.map(s=>`<div><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}
          </div>
        </div>
        <div class="cs-rows">
          ${c.sub.map(x=>`<div><h5>${x.h}</h5><p>${x.p}</p></div>`).join('')}
        </div>
      </div>`).join('');

    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold">GROUNDING ANTARABANGSA</span>
          <h2 class="serif">Empat Negara, Empat Pendekatan Dana Pendidikan</h2>
          <p class="sec-lede">Jangan tiru satu negara menyeluruh — tiru bahagian terbaik setiap negara bagi setiap domain. Singapura mengurus dengan satu pintu; Korea, dengan semakan berganda &amp; perundangan; Jepun, dengan data statutori; China, dengan kredit alternatif berskala besar.</p>
        </div>
        <div class="ctabs" id="ctabs-negara">${tabs}</div>
        ${panels}
        <div class="matrix-card">
          <h3 class="serif">Matriks Amalan Terbaik — 4 Domain × 4 Negara</h3>
          <p class="sec-lede" style="margin-top:0">Pemetaan langsung daripada Bahagian 7 laporan benchmark. Setiap sel ialah amalan tersahkan dengan sitasi penuh.</p>
          <div class="matrix-wrap"><table class="matrix">
            <thead><tr><th>Domain</th><th>SG Singapura</th><th>KR Korea Selatan</th><th>JP Jepun</th><th>CN China</th></tr></thead>
            <tbody>
              <tr><td><b>Biasiswa &amp; Geran</b></td><td>MySkills satu pintu; SLA 14 hari; S$2.1b 2024</td><td>KOSAF 820k pelajar; KRW 5.8t; pindaan akta berkala</td><td>JASSO 1.3juta; ¥1.1t; takrif statutori</td><td>助学贷款 RMB 70b; klasifikasi nasional 2017</td></tr>
              <tr><td><b>Pemulihan Pinjaman</b></td><td>CPF/IRAS auto-deduct; 95% kadar</td><td>징수 전담 unit khas; pemotongan gaji</td><td>代理返還 income-linked; 99.4% kadar</td><td>蚂蚁信用 skor; 97.5% auto-disburse</td></tr>
              <tr><td><b>Anti-Pertindihan</b></td><td>Siling per individu; satu penilai teraju</td><td>다중 수혜 점검 sejak 2009; 100% skim</td><td>JASSO 黑名单 senarai hitam; MyNumber padanan</td><td>芝麻信用 黑名单; 教育部 MyKad-style</td></tr>
              <tr><td><b>Tadbir Urus &amp; IPTA</b></td><td>SkillsFuture Act 2016; SSG; rujukan awam</td><td>Higher Education Act; KOSAF one-stop</td><td>Japan Student Services Act; tinjauan statutori</td><td>教育部 акта; SMEDI indeks bulanan</td></tr>
            </tbody>
          </table></div>
        </div>
        <div class="strategic-card">
          <h3 class="serif">Bacaan Strategik Sabah</h3>
          <p class="sec-lede" style="margin-top:0">Skor keupayaan domain (1–5, penilaian analitik ilustratif) menunjukkan tiada satu negara unggul dalam semua domain. Korea guru perundangan; Jepun guru data statutori &amp; pemulihan; China guru kelajuan; Singapura guru satu pintu.</p>
          <div class="strategic-row">
            <div id="ch-radar" class="radar-area"></div>
            <div class="strategic-notes">
              <div><span class="tag">5.0</span> Korea · perundangan &amp; semakan berganda — tetapi kadar operasi 54% beri amaran</div>
              <div><span class="tag">5.0</span> China · kelajuan &amp; kredit alternatif — tetapi ketelusan rendah</div>
              <div><span class="tag">5.0</span> Jepun · data statutori &amp; pemulihan — tetapi pembangunan tempatan perlahan</div>
              <div><span class="tag">4.5</span> Singapura · satu pintu &amp; SLA — sesuai jadi rujukan pertama Fasa 0</div>
              <p style="margin-top:10px;border-top:1px dashed var(--line);padding-top:10px"><b>Sabah boleh jadi pembeda:</b> adaptasi 代理返還 JASSO untuk TPNS automatik + Enjin Anti-Pertindihan KOSAF + klasifikasi tunggal China.</p>
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
          <p class="sec-lede">Prinsip teras: bina atas sistem sedia ada (TPNS, Yayasan Sabah, APDM, EMIS), jangan ganti; dan mulakan dengan dua skim perintis sebelum skala penuh. Harta intelek platform dimiliki jabatan — tiada vendor lock-in.</p>
        </div>
        <div class="side-by-side">
          <div class="mode-card">
            <h3 class="serif">Sebagai SaaS</h3>
            <p class="mode-sub">Software as a Service — untuk 4 skim &amp; 18 agensi</p>
            <ul>
              <li>Dashboard eksekutif, laporan automatik &amp; penjejak janji diambil sebagai perkhidmatan langganan — agensi tiada perlu bangunkan sistem sendiri.</li>
              <li>Modul dihidupkan skim demi skim mengikut jadual yang diterbitkan awam (corak naik taraf KOSAF Korea).</li>
              <li>Skor Kad Skim menjadikan keserasian dan kualiti data setiap skim kelihatan — insentif tabiat baik.</li>
            </ul>
          </div>
          <div class="mode-card">
            <h3 class="serif">Sebagai PaaS</h3>
            <p class="mode-sub">Platform as a Service — API &amp; komponen</p>
            <ul>
              <li>API terbuka atas Registri Emas Pelajar membenarkan agensi &amp; universiti membina aplikasi sendiri di atas satu rekod kebenaran.</li>
              <li>Komponen semakan pertindihan dan pengesahan identiti ditawarkan sebagai blok binaan — corak MyInfo Business Singapura.</li>
              <li>Membuka ekosistem inovasi tempatan (edtech, fintech takaful) di atas data pelajar yang selamat &amp; berasaskan persetujuan.</li>
            </ul>
          </div>
        </div>
        <div class="layers-card">
          <h3 class="serif">Senibina Lima Lapisan</h3>
          <p>Setiap lapisan bergantung pada lapisan di bawahnya. Struktur ini sepadan dengan dokumen PORTF·RAIMY dan corak pembinaan berperingkat Korea/Jepun.</p>
          <ol class="layers">
            <li><b>L1 Lapisan Data Asas</b><span>Fondasi: satu definisi, satu rekod kebenaran.</span><em>Registri Emas Pelajar · Taksonomi Skim Tunggal · Katalog 4 skim</em></li>
            <li><b>L2 Lapisan Integrasi</b><span>Bina atas sistem sedia ada — jangan ganti, satukan.</span><em>TPNS &amp; Yayasan Sabah (sedia ada) · Padanan MyKad 360° · API merentas agensi</em></li>
            <li><b>L3 Lapisan Analitik</b><span>Model &amp; skor berpusat — kesamaan ukuran untuk semua skim.</span><em>Enjin Anti-Pertindihan · Analitik ROI Digital · Skor Kad Skim &amp; amaran awal</em></li>
            <li><b>L4 Lapisan Aplikasi</b><span>SaaS per skim: langganan modul tanpa bangunkan sistem sendiri.</span><em>Dashboard eksekutif · Penjejak Janji &amp; Pematuhan · Laporan automatik ke Kabinet</em></li>
            <li><b>L5 Lapisan Penyampaian</b><span>Peranan PaaS: agensi membina aplikasi sendiri di atas API tunggal.</span><em>Kokpit YB / TSKN · Portal agensi &amp; universiti · API awam &amp; mobiliti</em></li>
          </ol>
        </div>
        <h3 class="serif" style="text-align:center;margin-top:36px">Tujuh Modul Teras</h3>
        <div class="mods">
          <div class="mod"><b>M1</b><h4>Registri Emas Pelajar &amp; Taksonomi Tunggal</h4><p>Rekod 360° setiap pelajar &amp; graduan; satu takrif kelayakan wajib semua skim.</p></div>
          <div class="mod"><b>M2</b><h4>Katalog &amp; Gerbang Satu Penghantaran</h4><p>Katalog 4 skim → sijil serentak → e-permohonan bersepadu (3 peringkat corak Korea).</p></div>
          <div class="mod"><b>M3</b><h4>Enjin Anti-Pertindihan</h4><p>Pengesanan penerima berganda merentas 4 skim sebelum bayaran, dengan ambang keyakinan.</p></div>
          <div class="mod"><b>M4</b><h4>Penjejak Janji &amp; Pematuhan</h4><p>Pematuhan keputusan ≤5 hari per skim, diterbitkan mingguan kepada YB.</p></div>
          <div class="mod"><b>M5</b><h4>Analitik ROI Digital</h4><p>Adopsi digital dijejak daripada data transaksi (e-borang), bukan tinjauan sukarela.</p></div>
          <div class="mod"><b>M6</b><h4>Skor Kad Skim</h4><p>Keserasian takrif, kualiti data &amp; kelajuan kelulusan setiap skim — dinilai berkala.</p></div>
          <div class="mod"><b>M7</b><h4>Modul Pemulihan Automatik</h4><p>Pemotongan gaji (代理返還) + pusat pemungutan khas — sasaran kadar pulih 80%.</p></div>
        </div>
        <div class="cta-block">
          <div>
            <h4>Laluan Perolehan</h4>
            <p>Fasa 0 → 3 sepadan dengan peta jalan pelaksanaan: prototaip konsep → katalog &amp; definisi → enjin &amp; akta → skala penuh.</p>
          </div>
          <a href="#peta-jalan" class="btn-gold">Lihat peta jalan →</a>
        </div>
      </div>`;
  }

  function cadangan(){
    const items = [
      {c:'P1', t:'Registri Emas Pelajar &amp; Taksonomi Tunggal', j:'05 · Definisi berpecah', r:'China (klasifikasi 2017), Singapura (MySkills)'},
      {c:'P2', t:'Gerbang Satu Penghantaran Berperingkat', j:'01 · Penyaluran manual', r:'Korea (KOSAF), Singapura (MySkills Future)'},
      {c:'P3', t:'Enjin Anti-Pertindihan &amp; Pemulihan Automatik', j:'03 · Pertindihan', r:'Korea (semakan berganda 2009), Jepun (代理返還)'},
      {c:'P4', t:'Kelulusan Berasaskan Data (Janji 5 Hari / 24 Jam)', j:'02 · Janji tanpa alat ukur', r:'China ("310" MYbank), Singapura (MySkills SLA)'},
      {c:'P5', t:'Akta Pendidikan &amp; Peruntukan Baharu: Payung Pragmatik', j:'01 · Pelaporan pasif', r:'Korea (KOSAF Act), Jepun (JASSO Act)'},
      {c:'P6', t:'Roster Pakar Penilai &amp; Penjenamaan "Cemerlang Sabah"', j:'04 · Pemulihan rendah', r:'Jepun (認定的評価機関), China (Little Giants + 复核)'}
    ];
    return `
      <div class="sec-inner">
        <div class="sec-head">
          <span class="sec-tag gold-light">CADANGAN DASAR</span>
          <h2 class="serif light">P1–P6: Daripada Bukti Dunia kepada Kabinet Nota</h2>
          <p class="sec-lede light">Setiap cadangan dipetakan satu-satu kepada jurang PORTF·RAIMY, sasaran YB &amp; model rujukan antarabangsa — disusun dalam format seragam supaya TSKN boleh membawanya terus ke meja pelaksanaan.</p>
        </div>
        <div class="dcards">
          ${items.map(i=>`<div class="dcard"><div class="dcode">${i.c}</div><div><h4>${i.t}</h4><p class="dmeta">Jurang: <b>${i.j}</b> · Rujukan: <b>${i.r}</b></p></div></div>`).join('')}
        </div>
      </div>`;
  }

  function petaJalan(){
    const phases = [
      {p:'p0', t:'Taklimat & Prototaip Konsep', w:'Suku 4 2026',
        ul:['Taklimat demo 30 minit kepada YB &amp; KSU','Lantik 2 skim perintis (TPNS, BAGUS)','MoU perkongsian data selaras PDPA'],
        out:'MoU 2 skim ditandatangani; peta data selesai',
        ref:'Penanda aras: KESAN Fasa 0; kajian RUN 2026'},
      {p:'p1', t:'Katalog & Definisi', w:'Suku 1–2 2027',
        ul:['Lulus takrif kelayakan nasional melalui notis pentadbiran','Siar katalog 4 skim + portfolio 15,629 pelajar','Registri Emas padanan MyKad 2 skim perintis'],
        out:'100% skim dalam katalog; rekod dipadankan &gt;95%',
        ref:'Penanda aras: Korea (KOSAF tahap 1); Singapura (data.gov.sg)'},
      {p:'p2', t:'Enjin & Akta', w:'Suku 3–4 2027',
        ul:['Bawa rang undang-undang Akta Pendidikan Sabah ke DUN','Aktifkan Enjin Anti-Pertindihan TPNS–BAGUS','Laluan cepat kelulusan data bagi pinjaman &lt; RM5,000'],
        out:'% pematuhan 5 hari diterbitkan mingguan; kes tindihan dikenal pasti sebelum bayaran',
        ref:'Penanda aras: Korea (semakan berganda 2009); China ("310")'},
      {p:'p3', t:'Skala Penuh & Pascapendaftaran', w:'2028',
        ul:['Akta berkuat kuasa (transisi 2 tahun)','Gerbang e-permohonan skim demi skim','Roster pakar + penjenamaan "Cemerlang Sabah"'],
        out:'≥4 skim dalam gerbang; 500 pelajar "Cemerlang Sabah"; kadar pulih 80%',
        ref:'Penanda aras: Korea (KOSAF 2011→2012); Jepun (2020→2022); China (复核)'}
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
          <p class="sec-lede">Mengikut corak "janji berangka" Korea &amp; Jepun: setiap cadangan disertai angka sasaran, tarikh dan populasi penerima. Sumber data KPI ialah sistem PORTF·RAIMY itu sendiri — setiap angka boleh dijana semula dalam beberapa minit semasa sesi taklimat.</p>
        </div>
        <div class="kpi-card">
          <h3 class="serif">KPI per Cadangan Dasar</h3>
          <div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Cadangan</th><th>KPI utama</th><th>Garis dasar</th><th>Sasaran 12 bln</th><th>Sasaran 24 bln</th></tr></thead>
            <tbody>
              <tr><td><b>P1 Registri Emas</b></td><td>% skim melapor dengan takrif seragam</td><td>Rendah (takrif berpecah)</td><td>80%</td><td>100%</td></tr>
              <tr><td><b>P2 Gerbang</b></td><td>Bil. borang berulang per permohonan</td><td>≈3–5 borang</td><td>≤2</td><td>1 (isi sekali)</td></tr>
              <tr><td><b>P3 Anti-Pertindihan</b></td><td>Nilai dana berisiko dikesan sebelum bayaran</td><td>RM 2.51j (manual)</td><td>≥60% automatik</td><td>≥90%</td></tr>
              <tr><td><b>P4 Kelulusan Data</b></td><td>% permohonan ≤5 hari; mikro ≤24 jam</td><td>Tiada penjejak berpusat</td><td>75% / 70%</td><td>90% / 85%</td></tr>
              <tr><td><b>P5 Akta Pendidikan</b></td><td>RUU tabled; % skim aktif selepas 1 tahun</td><td>Belum tabled</td><td>Tabled di DUN</td><td>Berkuat kuasa; +5 pt</td></tr>
              <tr><td><b>P6 Roster + Cemerlang</b></td><td>Bil. pakar bertauliah; bil. pelajar Cemerlang</td><td>0</td><td>200 pakar; 200 pelajar</td><td>400 pakar; 500 pelajar</td></tr>
            </tbody>
          </table></div>
        </div>
        <div class="kpi-card">
          <h3 class="serif">Risiko Utama &amp; Mitigasi Terbukti</h3>
          <div class="risks">
            <div class="risk ih"><b>Impak: Tinggi · Keb.: Sederhana</b><h5>Agensi enggan berkongsi data</h5><p>Mitigasi: PDPA sebagai asas perundangan; templat perjanjian kerahsiaan corak 信易贷; fasa sukarela dahulu; sokongan JPM.</p></div>
            <div class="risk im"><b>Impak: Sederhana · Keb.: Sederhana</b><h5>Padanan data salah menangguhkan bantuan sah</h5><p>Mitigasi: Ambang keyakinan berperingkat; semakan manusia bagi kes ambigu; saluran rayuan 48 jam.</p></div>
            <div class="risk ih"><b>Impak: Tinggi · Keb.: Sederhana</b><h5>Pemulihan rendah jika takrif berubah</h5><p>Mitigasi: Laluan cepat hanya untuk skor tinggi; roster pakar untuk akaun berisiko; KPI kadar pulih dipantau kokpit.</p></div>
            <div class="risk ih"><b>Impak: Tinggi · Keb.: Sederhana</b><h5>Rang undang-undang pendidikan terbantah</h5><p>Mitigasi: Rujukan awam corak Singapura; pengecualian terkawal corak Korea; pembabitan ANGKASA &amp; IPTA dari rangka awal; transisi 2 tahun corak Jepun.</p></div>
            <div class="risk il"><b>Impak: Tinggi · Keb.: Rendah–Sederhana</b><h5>Keletihan politik / perubahan portfolio</h5><p>Mitigasi: Kanunkan KPI dan tinjauan tahunan dalam akta (corak Jepun Perkara 10); IP PORTF·RAIMY milik jabatan — tiada vendor lock-in.</p></div>
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
          <p class="sec-lede light">Keseluruhan pakej P1–P6 boleh dimulakan tanpa menunggu akta: dua skim perintis dan prototaip data sebenar boleh bermula dalam 30 hari. Website konsep ini sendiri ialah contoh Fasa 0: taklimat demo 30 minit kepada YB.</p>
        </div>
        <div class="steps">
          <div class="step"><span class="st-num">1</span><h4>Lantik dua skim perintis</h4><p>TPNS &amp; BAGUS bagi prototaip data sebenar dalam 30 hari — petakan aliran data, borang berulang dan kes tindihan Sabah/Sarawak sebagai kemenangan awal yang boleh diukur.</p></div>
          <div class="step"><span class="st-num">2</span><h4>Kanunkan asas dalam rang Akta Pendidikan Sabah</h4><p>Takrif tunggal, mandat banci pelajar tahunan, semakan semula berkala, dan fasa transisi dua tahun — empat elemen yang disahkan oleh pengalaman Korea, Jepun dan China.</p></div>
          <div class="step"><span class="st-num">3</span><h4>Bawa model anti-pertindihan &amp; KPI ke meja kajian RUN</h4><p>Sebelum keputusan arkitektur dibuat, supaya keputusan Belanjawan 2027 berasaskan prototaip yang sudah berfungsi, bukan sekadar kertas cadangan.</p></div>
        </div>
        <div class="time-window">
          <p><b>Titik tetingkap:</b> kajian RUN berjalan sepanjang 2026 · Belanjawan 2027 dipertahankan Oktober 2026 · Akta Pendidikan Sabah dalam rangka — keputusan <b>berasaskan prototaip yang sudah berfungsi</b>, bukan sekadar kertas cadangan.</p>
        </div>
      </div>`;
  }

  function footer(){
    return `
      <div class="foot-grid">
        <div>
          <div class="brand"><span class="brand-mark">R</span><span><span class="b1">PORTF <span class="gold">·RAIMY</span></span><br><span class="b2">Prototaip Konsep · Dana Pendidikan Sabah</span></span></div>
          <p class="foot-tag">Platform kecerdasan keputusan dana pendidikan Sabah — "Satu rekod. Setiap pelajar. Setiap ringgit. Setiap keputusan."</p>
        </div>
        <div>
          <h6>Konteks</h6>
          <ul>
            <li>Portfolio dipantau: RM25.10j · 4 skim · 15,629 pelajar · 8 agensi</li>
            <li>Berasaskan Laporan Analisis Keperluan SaaS/MaaS/PaaS — Enam Tokoh (16 Sept 2026)</li>
            <li>Benchmark: Singapura, Korea Selatan, Jepun, China</li>
          </ul>
        </div>
        <div>
          <h6>Dokumen sokongan</h6>
          <ul>
            <li>Laporan Induk Analytic Keperluan SaaS/MaaS/PaaS (6 tokoh)</li>
            <li>Laporan Benchmarking Empat Negara KESAN (25 muka, PDF)</li>
            <li>Sumber rasmi: enterprisesg.gov.sg · kosaf.go.kr · jasso.go.jp · stats.gov.cn</li>
          </ul>
        </div>
      </div>
      <p class="foot-note">© 2026 · Disediakan untuk YB Awangku Raimy Pangiran Abd Rahman, Ketua Penolong Setiausaha Kanan TSKN Sabah · Pejabat Timbalan Setiausaha Kerajaan Negeri. Notis: Website ini ialah prototaip konsep ilustratif untuk perbincangan dasar — ia bukan laman rasmi kerajaan dan tidak mengumpulkan sebarang data sebenar. Angka portfolio dan fakta benchmark dipetik daripada sumber tersitasi; angka lain bertanda ILUSTRATIF adalah data demo. Semua keputusan dasar tertakluk kepada kajian kebolehlaksanaan formal dan kelulusan kerajaan.</p>`;
  }

  /* ------------ INIT ---------------- */
  function setText(id, html){ const el = document.getElementById(id); if(el) el.innerHTML = html; }

  function renderAll(){
    setText('atas', hero());
    setText('jurang', jurang());
    setText('demo', demo());
    setText('benchmark', benchmark());
    setText('senibina', senibina());
    setText('cadangan', cadangan());
    setText('peta-jalan', petaJalan());
    setText('kpi', kpi());
    setText('langkah', langkah());
    setText('footer-mark', footer()); // we'll attach via separate handler
    // footer handled below
  }

  function paintCharts(){
    Object.entries(CHARTS).forEach(([k, c])=>{
      const id = 'ch-' + (k.replace(/([A-Z])/g,'-$1').toLowerCase()).replace(/^-/,'');
      const el = document.getElementById(id);
      if(el) el.innerHTML = SVG.render(c);
    });
  }

  function wireTabs(){
    const tabs = document.getElementById('tabs-demo');
    if(!tabs) return;
    tabs.querySelectorAll('.tab').forEach(b=>{
      b.addEventListener('click', ()=>{
        tabs.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        const key = b.getAttribute('data-tab');
        document.querySelectorAll('.tab-panel').forEach(p=>{
          p.classList.toggle('active', p.getAttribute('data-panel')===key);
        });
      });
    });
    const ctabs = document.getElementById('ctabs-negara');
    if(ctabs){
      ctabs.querySelectorAll('.ctab').forEach(b=>{
        b.addEventListener('click', ()=>{
          ctabs.querySelectorAll('.ctab').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          const key = b.getAttribute('data-c');
          document.querySelectorAll('.cpanel').forEach(p=>{
            p.classList.toggle('active', p.getAttribute('data-cpanel')===key);
          });
        });
      });
    }
  }

  function paintFooter(){
    const f = document.querySelector('footer.foot');
    if(f) f.innerHTML = footer();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    renderAll();
    paintCharts();
    wireTabs();
    paintFooter();
  });
})();