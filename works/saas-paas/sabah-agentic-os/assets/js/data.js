/* =========================================================
   data.js — Profil 6 tokoh, KPI, siri carta, jadual,
             katalog penyambung API & cadangan vendor.
   Sumber garis dasar: Laporan Induk Analisis Keperluan
   SaaS/MaaS/PaaS — Enam Tokoh Strategik Sabah & Persekutuan
   (16 September 2026). Angka operasi = data simulasi
   untuk prototaip (ditanda "simulasi" pada UI).
   ========================================================= */

const MONTHS = ['Okt','Nov','Dis','Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep'];

const TOKOH = [
  /* ================= U1 — KUSKOP ================= */
  {
    id:'alamin', code:'U1', akronim:'MA',
    nama:'Datuk Mohamad Alamin',
    jawatan:'Timbalan Menteri Pembangunan Usahawan dan Koperasi (KUSKOP)',
    org:'KUSKOP · 7 agensi pembiayaan',
    warna:'#1d5c96',
    ringkasan:'Penyepaduan data pembiayaan 7 agensi untuk memantau NPF masa nyata, mengesan pertindihan penerima dan memberi amaran awal risiko ingkar.',
    matlamat:'Turunkan NPF agregat & hapuskan pertindihan penerima merentas 7 agensi',
    fasa:'Fasa 2 (6–12 bulan)',
    kpis:[
      {label:'Pembiayaan disalur', value:'25.27', unit:'RM bil', meta:'2024 – 31 Mei 2026 · 847,653 usahawan', trend:[18,19,20,21,22,23,24,24.6,25,25.1,25.2,25.27], pct:96, tone:'#1d5c96'},
      {label:'NPF agregat', value:'5.42', unit:'%', meta:'Sasaran < 4.00% · TEKUN 9.69% tertinggi', trend:[6.4,6.3,6.2,6.1,6.0,5.9,5.8,5.7,5.6,5.55,5.48,5.42], pct:63, tone:'#c0392b', delta:'-0.98 pt', dir:'down'},
      {label:'Pertindihan penerima', value:'12,481', unit:'kes', meta:'PadananMyKad ≥ 2 agensi', trend:[15000,14600,14200,13900,13600,13350,13100,12900,12750,12650,12560,12481], pct:41, tone:'#b7791f', delta:'-2,519', dir:'down'},
      {label:'Amaran awal aktif', value:'3,204', unit:'usahawan', meta:'Skor risiko ≥ 70 / 100', trend:[900,1100,1400,1700,2000,2300,2600,2850,3000,3130,3180,3204], pct:72, tone:'#0e8f8f'}
    ],
    charts:[
      {type:'bar', title:'NPF mengikut agensi pembiayaan', sub:'Garis dasar laporan · % portfolio ingkar',
       labels:['SME Bank','TEKUN','PERNAS','SKM','SME Corp','Bank Rakyat','AIM'],
       series:[{name:'NPF %', color:'#1d5c96', values:[10.49,9.69,6.20,4.80,3.40,1.93,0.01]}],
       suffix:'%'},
      {type:'line', title:'Trend NPF agregat vs sasaran', sub:'12 bulan · simulasi penurunan selepas skor AI diperkenal',
       labels:MONTHS, series:[
         {name:'NPF sebenar', color:'#c0392b', values:[6.40,6.30,6.15,6.02,5.90,5.82,5.70,5.62,5.55,5.48,5.45,5.42]},
         {name:'Sasaran', color:'#94a3b8', values:[6.1,5.95,5.8,5.65,5.5,5.35,5.2,5.05,4.9,4.75,4.6,4.45]}
       ], suffix:'%', area:true},
      {type:'donut', title:'Pendedahan pembiayaan mengikut agensi', sub:'RM bil · jumlah portfolio dipantau',
       items:[
         {label:'SME Bank', value:6.10, color:'#123a63'},
         {label:'TEKUN', value:5.85, color:'#1d5c96'},
         {label:'Bank Rakyat', value:5.20, color:'#3d8ec4'},
         {label:'AIM', value:3.40, color:'#0e8f8f'},
         {label:'PERNAS', value:2.10, color:'#b7791f'},
         {label:'SKM / SME Corp', value:2.62, color:'#94a3b8'}
       ], unit:'RM bil'}
    ],
    tableTitle:'Barisan amaran awal — usahawan berisiko ingkar',
    tableSub:'Dijana enjin skor risiko AI (skor ≥ 70) · 8 teratas',
    cols:['ID','Agensi','Skor risiko','Baki (RM)','Tunggakan','Tindakan'],
    rows:[
      ['U-88214','TEKUN Nasional',92,'184,500','121 hari','Restruktur + lawatan'],
      ['U-77120','SME Bank',89,'512,000','96 hari','Pemantauan mingguan'],
      ['U-65301','TEKUN Nasional',85,'96,300','88 hari','Panggilan kutipan'],
      ['U-64902','PERNAS',82,'240,800','74 hari','Semakan cagaran'],
      ['U-51883','Bank Rakyat',79,'73,400','69 hari','Peringatan automatik'],
      ['U-50771','SKM',76,'41,200','61 hari','Kaunseling kewangan'],
      ['U-49660','AIM',74,'12,900','55 hari','Penjadualan semula'],
      ['U-47418','SME Corp',71,'158,600','48 hari','Notis awal']
    ],
    rowTone:function(r){const s=parseInt(r[2]);return s>=88?'bad':(s>=78?'warn':'ok')},
    connectors:[
      {nm:'EPMS KUSKOP', ep:'/v2/pembiayaan/sekatan', auth:'API Key', freq:'15 min', st:'ok', note:'Sistem sedia ada (data sejarah)'},
      {nm:'TEKUN Nasional', ep:'/v1/akaun/{mykad}', auth:'OAuth2', freq:'Harian', st:'ok', note:'9.69% NPF — keutamaan kalibrasi'},
      {nm:'AIM (Amanah Ikhtiar)', ep:'/v1/pinjaman/aktif', auth:'OAuth2', freq:'Harian', st:'ok', note:'0.01% NPF — model rujukan'},
      {nm:'Bank Rakyat', ep:'/v1/pks/portfolio', auth:'mTLS', freq:'Harian', st:'warn', note:'Perlu kelulusan BNM / PDPA'},
      {nm:'SME Bank', ep:'/v1/npf/snapshot', auth:'mTLS', freq:'Harian', st:'warn', note:'10.49% NPF tertinggi'},
      {nm:'SME Corp', ep:'/v1/geran/penerima', auth:'API Key', freq:'Mingguan', st:'ok', note:'Pertindihan geran'},
      {nm:'PERNAS', ep:'/v1/pembiayaan/ringkas', auth:'API Key', freq:'Mingguan', st:'ok', note:''},
      {nm:'SKM (Koperasi)', ep:'/v1/koperasi/ahli', auth:'API Key', freq:'Mingguan', st:'ok', note:''},
      {nm:'Biro Kredit (CTOS/Experian)', ep:'/v3/skor/kredit', auth:'API Key', freq:'Atas permintaan', st:'warn', note:'Skor luar — kos per panggilan'},
      {nm:'FinbotsAI CreditX (MaaS)', ep:'/v1/score/explainable', auth:'API Key', freq:'Atas permintaan', st:'ok', note:'Explainable AI · selesai AI Verify'}
    ],
    cadangan:[
      ['Enjin skor kredit AI','FinbotsAI CreditX (SG) — SaaS, explainable AI, rujukan KBZ Bank','POC 1 agensi → 7 agensi'],
      ['Platform jaminan bersepadu','Seiko Solutions Loan Cloud (JP) — diguna 33/51 persatuan jaminan','Model integrasi agensi'],
      ['Lapisan dasar jaminan','KODIT / KIBO (KR) — jaminan skor teknologi','Kurangkan NPF & pertindihan'],
      ['Rujukan model risiko','Ant MYbank / Zhima Credit (CN)','Reka bentuk skor alternatif']
    ]
  },

  /* ================= U2 — Kerja Raya & Utiliti ================= */
  {
    id:'ruddy', code:'U2', akronim:'RA',
    nama:'Datuk Ruddy Awah',
    jawatan:'Pembantu Menteri Kerja Raya & Utiliti Sabah',
    org:'KKR & Utiliti · ADUN Pitas · GRS',
    warna:'#0e8f8f',
    ringkasan:'Pemantauan IoT masa nyata bagi rangkaian air: tekanan, aliran, kebocoran, sambungan haram dan NRW mengikut zon.',
    matlamat:'Turunkan NRW 50% → 42% dalam 12 bulan (sasaran 35% menjelang Q1 2027)',
    fasa:'Fasa 3 (12–18 bulan)',
    kpis:[
      {label:'NRW negeri', value:'47.8', unit:'%', meta:'Garis dasar ~50% · sasaran 42%', trend:[50.4,50.2,50.0,49.7,49.4,49.0,48.8,48.4,48.2,48.0,47.9,47.8], pct:63, tone:'#0e8f8f', delta:'-2.6 pt', dir:'down'},
      {label:'Sensor / AMI aktif', value:'1,284', unit:'unit', meta:'Zon rintis KK · 63% liputan', trend:[120,180,260,340,430,540,650,780,900,1010,1150,1284], pct:63, tone:'#1d5c96'},
      {label:'Kebocoran dikesan', value:'342', unit:'kes/bulan', meta:'Pengesanan anomali aliran masa nyata', trend:[520,505,486,470,452,441,430,412,398,376,358,342], pct:58, tone:'#b7791f', delta:'-178', dir:'down'},
      {label:'Gangguan bekalan', value:'2.4', unit:'hari/bln', meta:'Garis dasar: 15 hari satu episod', trend:[9.5,8.8,8.2,7.4,6.9,6.2,5.5,4.8,4.1,3.4,2.8,2.4], pct:80, tone:'#c0392b', delta:'-12.6 hari', dir:'down'}
    ],
    charts:[
      {type:'bar', title:'NRW mengikut daerah', sub:'% kehilangan air tanpa hasil · simulasi',
       labels:['KK','Sandakan','Tawau','Kudat','Lahad Datu','Keningau','Pitas'],
       series:[{name:'NRW %', color:'#0e8f8f', values:[45.2,52.4,55.1,58.6,61.3,57.2,64.8]}],
       suffix:'%'},
      {type:'line', title:'Tekanan & aliran zon Sepanggar (24 jam)', sub:'Ambang normal 2.2–3.4 bar · anomali dikesan 02:00',
       labels:['00','02','04','06','08','10','12','14','16','18','20','22'],
       series:[
         {name:'Tekanan (bar)', color:'#1d5c96', values:[2.9,1.4,1.2,1.6,2.8,3.2,3.1,3.0,3.2,3.3,3.1,3.0]},
         {name:'Aliran (m³/j ×100)', color:'#0e8f8f', values:[42,68,71,58,39,36,40,44,38,37,41,43]}
       ], area:true},
      {type:'donut', title:'Komposisi kehilangan air', sub:'Pecahan NRW 47.8% · simulasi',
       items:[
         {label:'Kebocoran fizikal paip', value:32.0, color:'#0e8f8f'},
         {label:'Kehilangan komersial', value:9.4, color:'#1d5c96'},
         {label:'Sambungan haram', value:4.8, color:'#c0392b'},
         {label:'Meter tidak tepat', value:1.6, color:'#b7791f'}
       ], unit:'%'}
    ],
    tableTitle:'Zon kritikal & tiket penyelenggaraan terbuka',
    tableSub:'Disusun mengikut anomali tekanan · simulasi',
    cols:['Zon','Daerah','Anomali','NRW zon','Tiket','Status'],
    rows:[
      ['Z-104 Sepanggar','Kota Kinabalu','Kejatuhan tekanan 02:00',58.4,14,'Pembaikan'],
      ['Z-088 Inanam','Kota Kinabalu','Aliran malam tinggi',54.9,11,'Siasatan'],
      ['Z-071 Tawau Lama','Tawau','Sambungan haram',61.2,9,'Penguatkuasaan'],
      ['Z-056 Kudat Pekan','Kudat','Kebocoran paip utama',63.7,7,'Pembaikan'],
      ['Z-042 Pitas','Pitas','Tiada telemetri',64.8,5,'Pasang sensor'],
      ['Z-031 Sandakan Mkt','Sandakan','Meter tidak tepat',52.4,6,'Tukar meter'],
      ['Z-018 Lahad Datu','Lahad Datu','Kebocoran berulang',61.3,8,'Ganti paip']
    ],
    rowTone:function(r){return parseFloat(r[3])>=60?'bad':(parseFloat(r[3])>=55?'warn':'ok')},
    connectors:[
      {nm:'SCADA / Telemetri Jabatan Air', ep:'/v1/scada/tekanan', auth:'mTLS', freq:'30 saat', st:'ok', note:'Masa nyata — teras dashboard'},
      {nm:'AMI LoRaWAN / NB-IoT', ep:'v1:/devices/{id}/telemetry', auth:'API Key', freq:'15 minit', st:'ok', note:'Aichi Tokei / Toyo Keiki'},
      {nm:'Platform AMI (Huawei / ST Eng)', ep:'/v2/analytics/leak', auth:'OAuth2', freq:'5 minit', st:'warn', note:'Pengesanan kebocoran prediktif'},
      {nm:'GIS JKR (rangkaian paip)', ep:'/wfs/paip/layer', auth:'API Key', freq:'Harian', st:'ok', note:'Lapisan aset paip'},
      {nm:'JPS — Amaran Banjir', ep:'/publicinfobanjir/v1/stesen', auth:'API Key', freq:'10 minit', st:'ok', note:'Kesan operasi bekalan'},
      {nm:'MET Malaysia — Cuaca', ep:'/v2.1/weather forecast', auth:'API Key', freq:'Jam', st:'ok', note:'Ramalan hujan → NRW'},
      {nm:'SESB — Bekalan elektrik', ep:'/v1/outage/feeder', auth:'API Key', freq:'5 minit', st:'warn', note:'Pam air bergantung kuasa'},
      {nm:'Aduan OneService Sabah', ep:'/v1/aduan/air', auth:'OAuth2', freq:'Masa nyata', st:'ok', note:'Sumber pengesahan lapangan'}
    ],
    cadangan:[
      ['AMI + kebocoran prediktif','ST Engineering BrightCity Water AMI / AGIL Water (SG)','Rintis 50 sensor zon KK'],
      ['Meter pintar pengesan kebocoran','Aichi Tokei Denki ( elektromagnetik ) / Toyo Keiki AXs (JP)','Ganti zon NRW tertinggi'],
      ['Rakan teknikal G2G','K-water (KR) — Smart Water Grid & digital twin','Pemindahan pengetahuan'],
      ['Dashboard GIS infrastruktur','Platform awan + GIS (Huawei / Alibaba / ST)','Satukan JKR, Jabatan Air, utiliti']
    ]
  },

  /* ================= U3 — Perumahan / KKT (Pembantu Menteri) ================= */
  {
    id:'maijol', code:'U3', akronim:'MM',
    nama:'Datuk Dr. Maijol Mahap',
    jawatan:'Pembantu Menteri Kerajaan Tempatan & Perumahan Sabah',
    org:'KKT & Perumahan · ADUN Bandau · GRS',
    warna:'#b7791f',
    ringkasan:'Automasi kelulusan perumahan rakyat, pemetaan risiko setinggan dan pemantauan infrastruktur luar bandar.',
    matlamat:'Pendekkan masa kelulusan 14 → 3 hari; pantau 11 penempatan setinggan berisiko',
    fasa:'Fasa 1 (0–6 bulan) — keutamaan tinggi',
    kpis:[
      {label:'Permohonan aktif', value:'1,842', unit:'permohonan', meta:'Rumah Mesra SMJ · seluruh negeri', trend:[1200,1290,1350,1420,1480,1540,1590,1630,1680,1740,1790,1842], pct:74, tone:'#b7791f'},
      {label:'Masa kelulusan purata', value:'6.2', unit:'hari', meta:'Garis dasar 14 hari · sasaran 3 hari', trend:[14,13.4,12.6,11.8,10.9,10.1,9.4,8.6,7.9,7.2,6.6,6.2], pct:56, tone:'#1d5c96', delta:'-7.8 hari', dir:'down'},
      {label:'Unit dilulus (Bandau)', value:'50', unit:'unit', meta:'+10 unit belia baru kahwin', trend:[0,4,9,14,18,23,28,33,37,42,46,50], pct:83, tone:'#0e8f8f'},
      {label:'Setinggan berisiko', value:'11', unit:'lokasi', meta:'Kapayan · risiko kebakaran tinggi', trend:[11,11,11,11,11,11,11,11,11,11,11,11], pct:38, tone:'#c0392b'}
    ],
    charts:[
      {type:'bar', title:'Masa kelulusan mengikut peringkat', sub:'Hari · sebelum vs selepas automasi (simulasi)',
       labels:['Pendaftaran','Semakan kelayakan','Pengesahan tanah','Kelulusan teknikal','Tawaran'],
       series:[
         {name:'Sebelum (hari)', color:'#94a3b8', values:[2.0,3.5,4.0,3.5,1.0]},
         {name:'Selepas (hari)', color:'#b7791f', values:[0.5,1.2,1.8,1.6,0.4]}
       ], suffix:' h'},
      {type:'line', title:'Permohonan diterima vs diluluskan', sub:'12 bulan · simulasi selepas automasi kelulusan',
       labels:MONTHS, series:[
         {name:'Diterima', color:'#1d5c96', values:[120,132,141,148,156,163,171,178,184,190,196,204]},
         {name:'Diluluskan', color:'#0e8f8f', values:[72,84,96,108,119,131,142,154,166,177,188,199]}
       ], area:true},
      {type:'donut', title:'Status permohonan Rumah Mesra SMJ', sub:'1,842 permohonan aktif · simulasi',
       items:[
         {label:'Diluluskan', value:842, color:'#0e8f8f'},
         {label:'Dalam semakan', value:518, color:'#1d5c96'},
         {label:'Menunggu dokumen', value:314, color:'#b7791f'},
         {label:'Ditolak / tidak layak', value:168, color:'#94a3b8'}
       ], unit:' permohonan'}
    ],
    tableTitle:'11 penempatan setinggan Kapayan — profil risiko',
    tableSub:'Data eSP 2.0 + penilaian risiko kebakaran · simulasi',
    cols:['Lokasi','Isi rumah','Risiko','Kepadatan','Air selamat','Intervensi'],
    rows:[
      ['Kapayan Barat A','412','Tinggi','Sangat padat','Tidak','Pindah berperingkat'],
      ['Kapayan Barat B','368','Tinggi','Sangat padat','Tidak','Rumah Mesra SMJ'],
      ['Kapayan Tengah','295','Tinggi','Padat','Sebahagian','Naik taraf tapak'],
      ['Kapayan Timur 1','254','Sederhana','Padat','Sebahagian','Naik taraf tapak'],
      ['Kapayan Timur 2','231','Tinggi','Sangat padat','Tidak','Pindah berperingkat'],
      ['Kapayan Selatan','198','Sederhana','Sederhana','Ya','Pemantauan'],
      ['Kapayan Ulu','176','Sederhana','Sederhana','Ya','Pemantauan'],
      ['Kapayan Pantai','164','Tinggi','Sangat padat','Tidak','Pindah berperingkat']
    ],
    rowTone:function(r){return r[2]==='Tinggi'?'bad':(r[2]==='Sederhana'?'warn':'ok')},
    connectors:[
      {nm:'eSP 2.0 — Sistem Maklumat Setinggan', ep:'/v2/setinggan/lokasi', auth:'OAuth2', freq:'Harian', st:'ok', note:'Sumber utama profil risiko'},
      {nm:'ePBT — Pelesenan & permit PBT', ep:'/v1/permit/status', auth:'API Key', freq:'15 minit', st:'ok', note:'Kelulusan perumahan'},
      {nm:'JPBD — Perancangan bandar', ep:'/v1/zoning/semakan', auth:'API Key', freq:'Atas permintaan', st:'warn', note:'Kelulusan pembangunan'},
      {nm:'JKR — Pemeriksaan teknikal', ep:'/v1/teknikal/laporan', auth:'API Key', freq:'Harian', st:'ok', note:'Kelulusan teknikal rumah'},
      {nm:'BOMBA — Risiko kebakaran', ep:'/v1/risiko/audit', auth:'API Key', freq:'Mingguan', st:'warn', note:'Templat rumah berisiko'},
      {nm:'JPN — Pengesahan MyKad', ep:'/v2/identity/verify', auth:'mTLS', freq:'Atas permintaan', st:'ok', note:'Elak pertindihan pemohon'},
      {nm:'PTD — Daftar tanah', ep:'/v1/tanah/carian', auth:'mTLS', freq:'Atas permintaan', st:'warn', note:'Pengesahan hak milik'},
      {nm:'Qiyuesuo — e-meterai / e-tandatangan', ep:'/v1/sign/seal', auth:'API Key', freq:'Atas permintaan', st:'warn', note:'Pematuhan e-sig Malaysia perlu disahkan'}
    ],
    cadangan:[
      ['GIS & pemetaan setinggan','SuperMap GIS (CN) — kadaster digital, kes Wuhu','Peta 11 lokasi Kapayan'],
      ['Automasi kelulusan','Qiyuesuo e-signature (CN) + model SEUMTER (KR)','POC Rumah Mesra SMJ'],
      ['Saluran aduan satu pintu','Model OneService (SG)','Aduan setinggan / PBT'],
      ['Templat rumah berisiko','Pangkalan data rumah kosong STS / Marble (JP)','Pemantauan 11 lokasi']
    ]
  },

  /* ================= U4 — Menteri KKT & Perumahan ================= */
  {
    id:'arifin', code:'U4', akronim:'AA',
    nama:'Datuk Dr. Mohd Arifin Mohd Arif',
    jawatan:'Menteri Kerajaan Tempatan & Perumahan Sabah',
    org:'KKT & Perumahan · ADUN Membakut · Naib Presiden GRS',
    warna:'#123a63',
    ringkasan:'Orkestrasi AI negeri untuk PBT: e-permit bersepadu, penyeragaman ePBT dan dashboard KPI SMJ 2.0.',
    matlamat:'Seragamkan pendigitalan PBT & wujudkan dashboard KPI SMJ 2.0',
    fasa:'Fasa 2 (6–12 bulan)',
    kpis:[
      {label:'PBT disepadukan', value:'12', unit:'/ 25 PBT', meta:'Sasaran 25 menjelang Q4 2027', trend:[4,5,6,7,8,8,9,10,10,11,11,12], pct:48, tone:'#123a63'},
      {label:'Masa kelulusan pembangunan', value:'72', unit:'hari', meta:'Garis dasar 96 hari · sasaran 45', trend:[96,94,91,89,86,84,81,79,77,75,73,72], pct:60, tone:'#1d5c96', delta:'-24 hari', dir:'down'},
      {label:'Aduan diselesaikan (SLA)', value:'78', unit:'%', meta:'OneService-style · 14 hari SLA', trend:[54,57,60,62,65,67,69,71,73,75,77,78], pct:78, tone:'#0e8f8f', delta:'+24 pt', dir:'down'},
      {label:'KPI SMJ 2.0 — status hijau', value:'61', unit:'%', meta:'8 daripada 13 petunjuk utama', trend:[42,45,48,50,52,54,55,57,58,59,60,61], pct:61, tone:'#b7791f'}
    ],
    charts:[
      {type:'bar', title:'Tahap pendigitalan PBT', sub:'Skor kematangan digital 0–100 · simulasi',
       labels:['DBKK','Kudat','Sandakan','Tawau','Keningau','Lahad Datu','Ranau'],
       series:[{name:'Skor kematangan', color:'#123a63', values:[86,64,58,55,47,43,38]}],
       suffix:''},
      {type:'line', title:'Masa kelulusan pembangunan & penyelesaian aduan', sub:'12 bulan · simulasi orkestrasi AI',
       labels:MONTHS, series:[
         {name:'Kelulusan (hari)', color:'#1d5c96', values:[96,94,91,89,86,84,81,79,77,75,73,72]},
         {name:'Aduan selesai (%)', color:'#0e8f8f', values:[54,57,60,62,65,67,69,71,73,75,77,78]}
       ], area:true},
      {type:'donut', title:'Aduan PBT mengikut kategori', sub:'30 hari terakhir · simulasi',
       items:[
         {label:'Sampah & kebersihan', value:3420, color:'#123a63'},
         {label:'Jalan & longkang', value:2680, color:'#1d5c96'},
         {label:'Bekalan air', value:1980, color:'#0e8f8f'},
         {label:'Lampu jalan', value:1240, color:'#b7791f'},
         {label:'Lain-lain', value:880, color:'#94a3b8'}
       ], unit:' aduan'}
    ],
    tableTitle:'Projek AI & digitalisasi mengikut agensi — risiko silo',
    tableSub:'Tiada orkestrasi pusat: 7 inisiatif berjalan berasingan',
    cols:['Agensi','Inisiatif','Status','Integrasi','Risiko utama'],
    rows:[
      ['KSTI','Sandbox AI negeri','Berjalan','Tiada','Bertindih dengan JPKN'],
      ['JPKN','Hab data negeri','Berjalan','Sebahagian','Tiada mandat merentas PBT'],
      ['DBKK','ePBT Kota Kinabalu','Sedia ada','Tiada','Sistem proprietari'],
      ['JPBD','e-Perancangan','Pilot','Tiada','Format data tidak seragam'],
      ['JKR','Permit teknikal digital','Pilot','Sebahagian','Tiada API awam'],
      ['Pejabat Daerah','Portal aduan daerah','Berjalan','Tiada','7 daerah berlainan sistem'],
      ['SUK','Sistem surat menyurat','Sedia ada','Sebahagian','Tidak terhubung ke PBT']
    ],
    rowTone:function(r){return r[3]==='Tiada'?'bad':(r[3]==='Sebahagian'?'warn':'ok')},
    connectors:[
      {nm:'ePBT — 25 PBT negeri', ep:'/v1/{pbt}/permit', auth:'API Key', freq:'15 minit', st:'warn', note:'Tidak seragam — perlu adapter'},
      {nm:'DBKK — Permit pembangunan', ep:'/v2/development/status', auth:'OAuth2', freq:'15 minit', st:'ok', note:'PBT paling matang'},
      {nm:'JPBD — Perancangan', ep:'/v1/planning/kelulusan', auth:'API Key', freq:'Harian', st:'warn', note:'Lamanya kelulusan utama'},
      {nm:'JKR — Permit teknikal', ep:'/v1/permit/teknikal', auth:'API Key', freq:'Harian', st:'ok', note:''},
      {nm:'MyGOV / MyGovCloud', ep:'/v1/services/catalog', auth:'OAuth2', freq:'Harian', st:'ok', note:'Identiti & katalog perkhidmatan'},
      {nm:'JPKN — Hab Data Negeri', ep:'/v1/dataset/publish', auth:'mTLS', freq:'Harian', st:'warn', note:'Bakal Sabah Data Hub'},
      {nm:'SEA-LION (MaaS)', ep:'/v1/chat/completions', auth:'API Key', freq:'Atas permintaan', st:'ok', note:'LLM Bahasa Melayu'},
      {nm:'AI Verify (tadbir urus)', ep:'/v1/assessment/run', auth:'API Key', freq:'Suku tahunan', st:'ok', note:'Rangka kerja tadbir urus AI'}
    ],
    cadangan:[
      ['E-permit swakendali','Graffer スマート申請 & Trustbank LoGoフォーム (JP)','POC di 2 PBT'],
      ['Platform AI kerja kerajaan','Samsung SDS Brity Works (KR) — 9+ kementerian Korea','Orkestrasi Agensi × PBT'],
      ['Awan berdaulat & integrasi','NEC Cloud IaaS (ISMAP) / Fujitsu Sovereign AI (JP)','Data kekal dalam negara'],
      ['Cetak biru dashboard KPI','Japan Dashboard (Digital Agency)','Model SMJ 2.0']
    ]
  },

  /* ================= U5 — TSKN / Dana Pendidikan ================= */
  {
    id:'raimy', code:'U5', akronim:'RP',
    nama:'Awangku Raimy Pangiran Abd Rahman',
    jawatan:'Ketua Penolong Setiausaha Kanan, Pejabat Timbalan SKN Sabah',
    org:'TSKN Sabah · Tugas-tugas Khas',
    warna:'#1e8e5a',
    ringkasan:'Pengurusan kitaran hayat dana pendidikan: permohonan, kelayakan, penyaluran, pemulihan pinjaman dan kawalan pertindihan.',
    matlamat:'Pengagihan adil + pencegahan penyelewengan + tingkatkan kadar pemulihan',
    fasa:'Fasa 1 (0–6 bulan) — keutamaan tinggi',
    kpis:[
      {label:'Dana disalur', value:'25.10', unit:'RM juta', meta:'TPNS · 15,629 pelajar', trend:[14.2,15.6,17.0,18.4,19.6,20.8,21.7,22.6,23.4,24.1,24.7,25.1], pct:88, tone:'#1e8e5a'},
      {label:'Pemulihan pinjaman', value:'8.03', unit:'RM juta', meta:'+22.4% · rekod tertinggi', trend:[4.8,5.2,5.6,6.0,6.4,6.7,7.0,7.3,7.6,7.8,7.9,8.03], pct:74, tone:'#0e8f8f', delta:'+22.4%', dir:'down'},
      {label:'Kadar pemulihan', value:'68', unit:'%', meta:'Sasaran 80% · JASSO income-linked', trend:[51,53,55,57,59,61,62,64,65,66,67,68], pct:68, tone:'#1d5c96'},
      {label:'Pertindihan dikesan', value:'214', unit:'kes', meta:'Semakan double-payment automatik', trend:[58,64,71,79,88,98,110,124,140,162,188,214], pct:34, tone:'#b7791f'}
    ],
    charts:[
      {type:'bar', title:'Penyaluran mengikut skim', sub:'RM juta · tahun berjalan (simulasi)',
       labels:['TPNS','BAGUS','SUKSES','BALKIS','Ihsan'],
       series:[{name:'RM juta', color:'#1e8e5a', values:[25.10,8.40,5.20,3.10,2.30]}],
       suffix:' j'},
      {type:'line', title:'Penyaluran vs pemulihan pinjaman', sub:'12 bulan (RM juta) · simulasi automasi pemulihan',
       labels:MONTHS, series:[
         {name:'Penyaluran', color:'#1e8e5a', values:[1.9,2.0,2.1,2.2,2.3,2.3,2.4,2.4,2.5,2.5,2.5,2.6]},
         {name:'Pemulihan', color:'#0e8f8f', values:[0.48,0.52,0.56,0.60,0.64,0.67,0.70,0.73,0.76,0.78,0.79,0.81]}
       ], area:true},
      {type:'donut', title:'Status pemulihan pinjaman pelajar', sub:'Jumlah akaun · simulasi',
       items:[
         {label:'Berjadual / aktif', value:6240, color:'#1e8e5a'},
         {label:'Lewat 1–3 bulan', value:2180, color:'#b7791f'},
         {label:'Lewat > 3 bulan', value:1140, color:'#c0392b'},
         {label:'Diselesaikan', value:3890, color:'#0e8f8f'}
       ], unit:' akaun'}
    ],
    tableTitle:'Akaun tunggakan keutamaan — pemulihan pinjaman',
    tableSub:'Disusun mengikut baki tertunggak · simulasi',
    cols:['ID','Skim','Daerah','Baki (RM)','Lewat','Tindakan'],
    rows:[
      ['P-30214','TPNS','Kota Kinabalu','48,600','14 bulan','Pelan bayaran ansur'],
      ['P-29871','TPNS','Sandakan','41,200','12 bulan','Potongan gaji'],
      ['P-28744','SUKSES','Tawau','33,900','11 bulan','Surat tuntutan'],
      ['P-27690','TPNS','Kudat','28,400','9 bulan','Panggilan automatik'],
      ['P-26531','BAGUS','Keningau','22,100','8 bulan','Kaunseling'],
      ['P-25408','TPNS','Lahad Datu','19,700','7 bulan','Peringatan SMS'],
      ['P-24366','BALKIS','Ranau','15,300','6 bulan','Peringatan SMS']
    ],
    rowTone:function(r){const m=parseInt(r[4]);return m>=12?'bad':(m>=8?'warn':'ok')},
    connectors:[
      {nm:'TPNS — Tabung Pendidikan Negeri Sabah', ep:'/v1/tpns/akaun', auth:'OAuth2', freq:'Harian', st:'ok', note:'Teras U5'},
      {nm:'Yayasan Sabah / Sabah Foundation Group', ep:'/v1/loan/recovery', auth:'OAuth2', freq:'Harian', st:'ok', note:'RM8.03j dipulihkan'},
      {nm:'KPM — APDM / EMIS', ep:'/v1/murid/enrolmen', auth:'mTLS', freq:'Mingguan', st:'warn', note:'Pengesahan status pelajar'},
      {nm:'JPN Sabah', ep:'/v1/sekolah/enrolmen', auth:'mTLS', freq:'Mingguan', st:'warn', note:'PPD Membakut baharu'},
      {nm:'JANM — GFMAS / perbendaharaan', ep:'/v1/bayaran/status', auth:'mTLS', freq:'Harian', st:'ok', note:'Penyaluran & penyesuaian'},
      {nm:'JPN — Pengesahan MyKad', ep:'/v2/identity/verify', auth:'mTLS', freq:'Atas permintaan', st:'ok', note:'Kawalan pertindihan'},
      {nm:'FPX / DuitNow — Bayaran balik', ep:'/v1/mandate/direct-debit', auth:'API Key', freq:'Masa nyata', st:'ok', note:'Pemulihan automatik'},
      {nm:'Gaxi ガクシーAgent (SaaS)', ep:'/v1/scholarship/lifecycle', auth:'API Key', freq:'Harian', st:'warn', note:'Permohonan → pemulihan'}
    ],
    cadangan:[
      ['Sistem biasiswa / geran awan','Gaxi ガクシーAgent (JP) — kitaran hayat penuh','POC 1 skim (BAGUS)'],
      ['Automasi pemulihan','Beveron Smart Debt Collection (SG)','Tingkatkan kadar pemulihan'],
      ['Kawalan pertindihan','Ryobi 給付金システム (JP) — semakan double-payment','Cegah penyelewengan'],
      ['Cetak biru dasar','KOSAF (KR) & JASSO 代理返還 (JP)','Pemulihan berkait pendapatan']
    ]
  },

  /* ================= U6 — SKN Sabah ================= */
  {
    id:'zainudin', code:'U6', akronim:'ZA',
    nama:'Datuk Zainudin Aman',
    jawatan:'Setiausaha Kerajaan Negeri Sabah (SKN) · Pengerusi JPBN',
    org:'SKN Sabah · Pengerusi Jawatankuasa Pengurusan Bencana Negeri',
    warna:'#c0392b',
    ringkasan:'Platform AI negeri: integrasi data 11 kementerian, dashboard KPI SMJ 2.0 masa nyata dan pengurusan krisis / bencana.',
    matlamat:'11 kementerian disepadukan + laporan KPI masa nyata untuk Ketua Menteri',
    fasa:'Fasa 4 (18–24 bulan) — strategik',
    kpis:[
      {label:'Kementerian disepadukan', value:'6', unit:'/ 15', meta:'Sasaran 15 · Fasa 4', trend:[1,2,2,3,3,4,4,5,5,6,6,6], pct:40, tone:'#123a63'},
      {label:'KPI SMJ 2.0 dicapai', value:'68', unit:'%', meta:'9 daripada 13 petunjuk utama', trend:[48,51,54,56,58,60,61,63,64,66,67,68], pct:68, tone:'#1e8e5a', delta:'+20 pt', dir:'down'},
      {label:'Insiden bencana aktif', value:'3', unit:'insiden', meta:'PKOB diaktifkan · banjir & IPU', trend:[1,2,4,6,5,4,7,5,4,3,3,3], pct:30, tone:'#c0392b'},
      {label:'Masa tindak balas purata', value:'42', unit:'minit', meta:'Sasaran < 30 minit · JPBN', trend:[88,84,79,74,70,66,62,58,54,50,46,42], pct:70, tone:'#b7791f', delta:'-46 min', dir:'down'}
    ],
    charts:[
      {type:'bar', title:'Status integrasi data mengikut kementerian', sub:'% dataset diterbitkan ke hab data · simulasi',
       labels:['KKT','KKR','Pendidikan','Kesihatan','Pertanian','Pelancongan','Kewangan'],
       series:[{name:'% disepadukan', color:'#123a63', values:[78,64,52,47,38,31,26]}],
       suffix:'%'},
      {type:'line', title:'IPU harian — Kota Kinabalu (14 hari)', sub:'Ambang tidak sihat > 100 · PKOB diaktifkan pada puncak',
       labels:['1','2','3','4','5','6','7','8','9','10','11','12','13','14'],
       series:[
         {name:'IPU', color:'#c0392b', values:[62,68,74,83,91,104,118,126,141,152,168,178,164,148]},
         {name:'Ambang (100)', color:'#94a3b8', values:[100,100,100,100,100,100,100,100,100,100,100,100,100,100]}
       ], area:true},
      {type:'donut', title:'Insiden bencana mengikut jenis (30 hari)', sub:'Data agregat JPBN · simulasi',
       items:[
         {label:'Banjir', value:24, color:'#123a63'},
         {label:'Kebakaran', value:16, color:'#c0392b'},
         {label:'Tanah runtuh', value:9, color:'#b7791f'},
         {label:'Jerebu / IPU', value:12, color:'#0e8f8f'},
         {label:'Ribut / angin kencang', value:6, color:'#94a3b8'}
       ], unit:' insiden'}
    ],
    tableTitle:'Insiden aktif — pengurusan krisis masa nyata',
    tableSub:'Disusun mengikut tahap · simulasi JPBN',
    cols:['Insiden','Jenis','Daerah','Terjejas','PPS','Status'],
    rows:[
      ['INC-2601','Banjir','Kota Kinabalu','1,842 keluarga','8','PKOB aktif'],
      ['INC-2602','Jerebu / IPU 178','Sandakan','—','0','Pemantauan'],
      ['INC-2603','Tanah runtuh','Ranau','46 keluarga','2','Pemindahan'],
      ['INC-2604','Kebakaran setinggan','Kapayan','112 keluarga','1','Pemadaman'],
      ['INC-2605','Banjir kilat','Beaufort','320 keluarga','3','Pulih'],
      ['INC-2606','Ribut','Kudat','88 keluarga','1','Pulih']
    ],
    rowTone:function(r){return r[5]==='PKOB aktif'?'bad':((r[5]==='Pemindahan'||r[5]==='Pemadaman')?'warn':'ok')},
    connectors:[
      {nm:'MyGOV — Katalog perkhidmatan', ep:'/v1/services/catalog', auth:'OAuth2', freq:'Harian', st:'ok', note:'Teras integrasi persekutuan'},
      {nm:'JPKN / Sabah Data Hub', ep:'/v1/dataset/ingest', auth:'mTLS', freq:'Masa nyata', st:'warn', note:'Hab data 11 kementerian'},
      {nm:'JPBN / PKOB — Bencana', ep:'/v1/insiden/aktif', auth:'OAuth2', freq:'Masa nyata', st:'ok', note:'Pusat kawalan operasi'},
      {nm:'MET Malaysia — Cuaca', ep:'/v2.1/weather forecast', auth:'API Key', freq:'10 minit', st:'ok', note:'Amaran cuaca'},
      {nm:'JPS — Public Info Banjir', ep:'/publicinfobanjir/v1/stesen', auth:'API Key', freq:'10 minit', st:'ok', note:'Aras air sungai'},
      {nm:'APM / NADMA', ep:'/v1/pps/kapasiti', auth:'OAuth2', freq:'15 minit', st:'ok', note:'Pusat pemindahan sementara'},
      {nm:'SEA-LION (MaaS — LLM BM)', ep:'/v1/chat/completions', auth:'API Key', freq:'Atas permintaan', st:'ok', note:'Sokongan Bahasa Melayu'},
      {nm:'Spectee Pro (SNS × AI)', ep:'/v1/events/realtime', auth:'API Key', freq:'Masa nyata', st:'warn', note:'Liputan SNS Sabah perlu disahkan'},
      {nm:'NTT DATA D-Resilio', ep:'/v1/disaster/ops', auth:'OAuth2', freq:'Masa nyata', st:'warn', note:'Platform bencana + automasi'}
    ],
    cadangan:[
      ['Orkestrasi AI berbahasa Melayu','SEA-LION (SG) — LLM terbuka, boleh fine-tune','Teras U6'],
      ['Platform bencana masa nyata','NTT DATA D-Resilio (JP) + Spectee Pro (JP)','Dashboard krisis PKOB'],
      ['Tadbir urus AI','AI Verify (IMDA, SG)','Rangka kerja negeri'],
      ['Integrasi silo 11 kementerian','Model City Data Hub (KR) / Hitachi digital workflow (JP)','Sabah Data Hub']
    ]
  }
];

/* ---- Seni bina penyepaduan & katalog penyambung global ---- */
const ARCH_LAYERS = [
  {n:'1 · Sumber Data', c:'#94a3b8', items:['Sistem agensi (EPMS, eSP 2.0, ePBT, TPNS)','Peranti IoT / AMI (air, cuaca, SCADA)','API kerajaan persekutuan (MyGOV, JPS, MET)','Perkhidmatan MaaS (skor kredit, LLM BM)']},
  {n:'2 · Gerbang API Berdaulat', c:'#1d5c96', items:['Peti besi kunci (vault) + putaran 90 hari','Kawalan kadar & kuota per agensi','Log audit & jejak akses (PDPA)','Mod sandbox vs pengeluaran']},
  {n:'3 · Lapisan Penyepaduan', c:'#0e8f8f', items:['Adapter / penyesuai per sistem warisan','Penormalan skema & padanan MyKad','ETL berjadual + penstriman masa nyata','Pagar kualiti data & amaran anomali']},
  {n:'4 · Dashboard & Agen AI', c:'#123a63', items:['6 dashboard tokoh (U1–U6)','Agen AI tugas (amaran, ringkasan)','Laporan KPI SMJ 2.0 masa nyata','Eksport ke Ketua Menteri / SKN']}
];

const KEY_POLICY = [
  ['Skop minimum','Setiap kunci terikat 1 sistem + 1 tokoh + kebenaran baca/tulis tertentu'],
  ['Putaran wajib','90 hari (sistem kewangan & data pelajar: 60 hari)'],
  ['Penyimpanan','Dalam negara (awan berdaulat / on-prem) — tiada kunci dalam repo atau pelayar'],
  ['Sandbox','Kunci ujian berasingan; tiada data sebenar dalam persekitaran ujian'],
  ['Audit','Setiap panggilan direkod: masa, kunci, endpoint, volum, status'],
  ['PDPA','Persetujuan & minimisasi data; MyKad dihash (SHA-256) sebelum dipadankan']
];

const TOKOH_BY_ID = Object.fromEntries(TOKOH.map(t => [t.id, t]));
