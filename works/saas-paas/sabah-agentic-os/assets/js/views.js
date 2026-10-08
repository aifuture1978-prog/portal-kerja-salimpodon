/* ===== views.js — pembina halaman: ringkasan, dashboard tokoh, integrasi ===== */

const V = (() => {
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ---------------- RINGKASAN ---------------- */
  function home(){
    const cards = TOKOH.map(t=>`
      <a class="card tokoh-card" href="#/t/${t.id}">
        <div class="tc-top">
          <div class="av" style="background:${t.warna}">${t.akronim}</div>
          <div><b>${esc(t.nama)}</b><span>${esc(t.jawatan)}</span></div>
        </div>
        <p>${esc(t.ringkasan)}</p>
        <div class="tc-foot">
          <span class="chip info">${t.code}</span>
          <span class="chip">${esc(t.fasa)}</span>
          <span class="chip ok">${t.connectors.length} penyambung</span>
        </div>
      </a>`).join('');

    const phases = [
      {b:'Fasa 1 · 0–6 bln', c:'#1e8e5a', h:'Perintis kos rendah & ROI pantas', p:'Maijol (U3) & Raimy (U5): GIS 11 setinggan Kapayan + automasi kelulusan Rumah Mesra SMJ; sistem geran pendidikan (BAGUS) + automasi pemulihan.', k:['Kelulusan 14 → 3 hari','1 skim geran berautomasi','Kadar pemulihan ↑']},
      {b:'Fasa 2 · 6–12 bln', c:'#1d5c96', h:'Pembiayaan & aduan bersepadu', p:'Alamin (U1) & Arifin (U4): enjin skor risiko NPF merentas agensi + pengesanan pertindihan; e-permit digital di 2 PBT + integrasi ePBT.', k:['NPF TEKUN ↓ dari 9.69%','Masa permit ↓','2 PBT seragam']},
      {b:'Fasa 3 · 12–18 bln', c:'#0e8f8f', h:'Infrastruktur & utiliti', p:'Ruddy (U2): rintis IoT water management / AMI 50 sensor di zon Kota Kinabalu + dashboard GIS infrastruktur + model G2G K-water.', k:['NRW 50% → 42%','Kebocoran masa nyata','Sambungan haram ↓']},
      {b:'Fasa 4 · 18–24 bln', c:'#123a63', h:'Orkestrasi negeri', p:'Zainudin (U6): platform orkestrasi AI negeri (SEA-LION, Bahasa Melayu) + dashboard KPI SMJ 2.0 + dashboard krisis PKOB + integrasi 11 kementerian.', k:['11 kementerian','KPI masa nyata','Dashboard krisis aktif']}
    ].map(p=>`
      <div class="phase">
        <div class="ph-badge" style="background:${p.c}">${p.b}</div>
        <div>
          <h4>${esc(p.h)}</h4><p>${esc(p.p)}</p>
          <div class="kpis">${p.k.map(k=>`<span class="chip ok">${esc(k)}</span>`).join('')}</div>
        </div>
      </div>`).join('');

    const arch = ARCH_LAYERS.map(l=>`
      <div class="card card-pad" style="border-top:3px solid ${l.c}">
        <h3>${esc(l.n)}</h3>
        <div class="list">${l.items.map(i=>`<div class="list-item"><span class="bullet" style="background:${l.c}"></span><span>${esc(i)}</span></div>`).join('')}</div>
      </div>`).join('');

    return `
      <section class="hero">
        <h2>Enam tokoh · enam dashboard · satu lapisan integrasi data</h2>
        <p>Setiap tokoh diberi satu dashboard operasi yang dijana daripada penyambung API yang sama — dikawal oleh satu gerbang API berdaulat dengan pengurusan kunci, kuota, log audit dan pematuhan PDPA. Tiada lagi data silo, tiada lagi laporan manual.</p>
        <div class="hero-stats">
          <div><b>6</b><span>Dashboard tokoh (U1–U6)</span></div>
          <div><b>51</b><span>Penyambung API dikenal pasti</span></div>
          <div><b>4</b><span>Lapis seni bina penyepaduan</span></div>
          <div><b>24</b><span>Bulan roadmap berfasa</span></div>
        </div>
      </section>

      <div class="section-title"><h2>Dashboard mengikut tokoh</h2><p>Klik untuk membuka dashboard &amp; penyambung API tokoh</p></div>
      <div class="grid g3">${cards}</div>

      <div class="card">
        <div class="chart-head"><h3>Roadmap pelaksanaan berfasa</h3><p>Fasa 1 dahulu (ROI pantas) → Fasa 4 (orkestrasi seluruh negeri)</p></div>
        ${phases}
      </div>

      <div class="section-title"><h2>Seni bina penyepaduan API</h2><p>Berlapis — bukan "one-stop shop" vendor tunggal</p></div>
      <div class="grid g4">${arch}</div>

      <div class="card card-pad">
        <h3>Prinsip silang</h3>
        <div class="list">
          <div class="list-item"><span class="bullet" style="background:#123a63"></span><span><b>Seni bina berlapis</b> — awan berdaulat → MaaS → SaaS domain; vendor terbaik dipilih per kes guna, bukan satu vendor untuk semua.</span></div>
          <div class="list-item"><span class="bullet" style="background:#0e8f8f"></span><span><b>Kedaulatan data</b> — data sensitif kekal dalam negara (on-prem / awan berdaulat); model luar hanya untuk inferens, bukan latihan.</span></div>
          <div class="list-item"><span class="bullet" style="background:#b7791f"></span><span><b>Bahasa Melayu</b> — SEA-LION satu-satunya LLM yang disahkan menyokong Bahasa Melayu; kritikal untuk orkestrasi AI negeri.</span></div>
          <div class="list-item"><span class="bullet" style="background:#1e8e5a"></span><span><b>Tadbir urus AI</b> — AI Verify (IMDA) sebagai rangka kerja; setiap model melalui penilaian sebelum ke pengeluaran.</span></div>
          <div class="list-item"><span class="bullet" style="background:#c0392b"></span><span><b>Harga melalui RFP</b> — hampir semua kontrak B2G tidak didedahkan awam; belanjawan mesti melalui RFI/RFP/POC.</span></div>
        </div>
      </div>`;
  }

  /* ---------------- DASHBOARD TOKOH ---------------- */
  function tokoh(t){
    const kpis = t.kpis.map(k=>`
      <div class="card kpi">
        <div class="label">${esc(k.label)}</div>
        <div class="value" style="color:${k.tone||'#0d1b2a'}">${esc(k.value)}<span class="unit">${esc(k.unit)}</span></div>
        ${k.delta?`<div class="meta"><span class="delta ${k.dir==='down'?'down':'up'}">${esc(k.delta)}</span> vs garis dasar</div>`:`<div class="meta">${esc(k.meta)}</div>`}
        <div class="bar"><i style="width:${k.pct}%;background:${k.tone||'#1d5c96'}"></i></div>
        <div style="margin-top:8px">${CH.spark(k.trend, k.tone||'#1d5c96')}</div>
      </div>`).join('');

    const charts = t.charts.map(c=>`
      <div class="card">
        <div class="chart-head"><h3>${esc(c.title)}</h3><p>${esc(c.sub)}</p></div>
        <div class="chart-body">${CH.render(c)}</div>
        ${CH.legend(c)}
      </div>`);

    const rows = t.rows.map(r=>{
      const tone = t.rowTone ? t.rowTone(r) : 'ok';
      const cls = tone==='bad'?'chip bad':(tone==='warn'?'chip warn':'chip ok');
      const last = r[r.length-1];
      return `<tr>
        ${r.slice(0,r.length-1).map((v,i)=>`<td class="${i>1&&/^[\d.,%]+$/.test(String(v))?'num':''}">${esc(v)}</td>`).join('')}
        <td><span class="${cls}">${esc(last)}</span></td>
      </tr>`;
    }).join('');

    const conns = t.connectors.map(c=>{
      const col = c.st==='ok'?'#1e8e5a':(c.st==='warn'?'#b7791f':'#c0392b');
      return `<div class="conn">
        <span class="st" style="background:${col}"></span>
        <div class="nm"><b>${esc(c.nm)}</b><span>${esc(c.ep)}</span></div>
        <span class="auth">${esc(c.auth)}</span>
      </div>`;
    }).join('');

    const cad = t.cadangan.map(c=>`
      <div class="row"><span class="rk">${esc(c[0])}</span><span style="flex:1;font-size:12.2px">${esc(c[1])}<br><span style="color:#64748b;font-size:11.3px">${esc(c[2])}</span></span></div>`).join('');

    return `
      <div class="card person">
        <div class="avatar" style="background:${t.warna}">${t.akronim}</div>
        <div class="who">
          <strong>${esc(t.nama)}</strong>
          <span>${esc(t.jawatan)}</span>
          <div class="tags">
            <span class="chip info">${t.code}</span>
            <span class="chip">${esc(t.org)}</span>
            <span class="chip warn">${esc(t.fasa)}</span>
          </div>
        </div>
        <div class="goal"><b>Matlamat utama</b>${esc(t.matlamat)}</div>
      </div>

      <div class="grid g4">${kpis}</div>
      <div class="grid g2">${charts.slice(0,2).join('')}</div>
      <div class="grid g21">${charts[2] || ''}
        <div class="card">
          <div class="chart-head"><h3>Penyambung API dashboard ini</h3><p>${t.connectors.length} sumber data · kekerapan &amp; jenis auth</p></div>
          ${conns}
          <div style="padding:12px 16px"><a class="btn ghost sm" href="#/api">Buka konsol kunci API →</a></div>
        </div>
      </div>

      <div class="grid g21">
        <div class="card">
          <div class="chart-head"><h3>${esc(t.tableTitle)}</h3><p>${esc(t.tableSub)}</p></div>
          <div class="table-wrap"><table>
            <thead><tr>${t.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
        </div>
        <div class="card">
          <div class="chart-head"><h3>Cadangan timbunan vendor</h3><p>Daripada matriks penanda aras 4 negara</p></div>
          <div class="rows">${cad}</div>
        </div>
      </div>

      <div class="note"><b>Catatan kaedah:</b> angka garis dasar (NPF agensi, NRW, dana TPNS, pembiayaan RM25.27 bilion, 11 penempatan setinggan) dipetik daripada laporan induk; siri masa, senarai amaran dan status penyambung ialah <b>data simulasi</b> untuk prototaip. Semua harga kontrak B2G kekal "tidak awam" — perolehan mesti melalui RFI/RFP/POC.</div>`;
  }

  /* ---------------- INTEGRASI API ---------------- */
  function archSvg(){
    const lw = 900, lh = 96;
    const layers = ARCH_LAYERS.map((l,i)=>{
      const y = i*lh + 8;
      return `<g>
        <rect x="8" y="${y}" width="${lw-16}" height="${lh-16}" rx="12" fill="#fff" stroke="${l.c}" stroke-width="1.5"/>
        <rect x="8" y="${y}" width="6" height="${lh-16}" rx="3" fill="${l.c}"/>
        <text x="28" y="${y+26}" font-size="13" font-weight="700" fill="#0d1b2a">${l.n}</text>
        ${l.items.map((it,j)=>{
          const bw = (lw-56)/4 - 10;
          const bx = 28 + j*(bw+10);
          return `<g><rect x="${bx}" y="${y+38}" width="${bw}" height="34" rx="8" fill="#f8fafc" stroke="#e3e9f0"/>
          <text x="${bx+bw/2}" y="${y+59}" text-anchor="middle" font-size="10.5" fill="#33475b">${it.length>34?it.slice(0,33)+'…':it}</text></g>`;
        }).join('')}
      </g>`;
    }).join('');
    const arrows = ARCH_LAYERS.slice(0,-1).map((l,i)=>{
      const y = (i+1)*lh + 2;
      return `<path d="M${lw/2},${y-6} l0,10" stroke="#94a3b8" stroke-width="2"/>
              <path d="M${lw/2-5},${y+1} l5,5 l5,-5" fill="none" stroke="#94a3b8" stroke-width="2"/>`;
    }).join('');
    return `<svg class="arch" viewBox="0 0 ${lw} ${ARCH_LAYERS.length*lh+10}" width="100%">
      ${layers}
      ${ARCH_LAYERS.slice(1).map((l,i)=>`<path d="M${lw/2},${(i+1)*lh-8} v14" stroke="#94a3b8" stroke-width="2" marker-end="url(#a)"/>`).join('')}
      <defs><marker id="a" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 z" fill="#94a3b8"/></marker></defs>
    </svg>`;
  }

  function connectorCatalog(filter){
    const rows = TOKOH.flatMap(t => t.connectors.map(c => ({t, c})))
      .filter(x => filter === 'all' || x.t.id === filter)
      .map(x=>{
        const col = x.c.st==='ok'?'#1e8e5a':(x.c.st==='warn'?'#b7791f':'#c0392b');
        const stTxt = x.c.st==='ok'?'Sedia':(x.c.st==='warn'?'Perlu kelulusan':'Tiada');
        return `<tr>
          <td><span class="chip info">${x.t.code}</span></td>
          <td><b>${esc(x.c.nm)}</b><br><span style="color:#64748b;font-family:var(--mono);font-size:11px">${esc(x.c.ep)}</span></td>
          <td><span class="tag">${esc(x.c.auth)}</span></td>
          <td>${esc(x.c.freq)}</td>
          <td style="color:#64748b">${esc(x.c.note||'—')}</td>
          <td><span class="chip ${x.c.st==='ok'?'ok':(x.c.st==='warn'?'warn':'bad')}">${stTxt}</span></td>
        </tr>`;
      }).join('');
    return `<div class="table-wrap"><table>
      <thead><tr><th>Tokoh</th><th>Sumber / endpoint</th><th>Auth</th><th>Kekerapan</th><th>Catatan</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function integrasi(){
    const opts = TOKOH.map(t=>`<option value="${t.id}">${t.code} · ${esc(t.nama)}</option>`).join('');
    return `
      <div class="card card-pad">
        <div class="section-title"><h2>Seni bina penyepaduan API berdaulat</h2><p>Satu gerbang untuk semua 6 dashboard</p></div>
        ${archSvg()}
        <div class="note" style="margin-top:12px">Kunci API <b>tidak pernah</b> disimpan di pelayar atau di dalam kod. Pelayan memanggil gerbang, gerbang mengambil kunci daripada peti besi (vault) dalam negara, dan hanya keputusan yang telah dinormalisasi dikembalikan ke dashboard.</div>
      </div>

      <div class="console-grid">
        <div class="card">
          <div class="chart-head"><h3>Konsol kunci API</h3><p>Daftar kunci, uji sambungan, pantau kuota (persekitaran prototaip — kunci disetempat dalam pelayar sahaja)</p></div>
          <div class="card-pad">
            <div class="field"><label>Nama sistem</label>
              <select id="kSys">${opts}</select></div>
            <div class="field"><label>Penyambung</label>
              <select id="kConn"></select></div>
            <div class="field"><label>Kunci API / token</label>
              <input id="kKey" type="password" placeholder="sk_live_••••••••••••••••"></div>
            <div class="field"><label>Persekitaran</label>
              <select id="kEnv"><option value="sandbox">Sandbox (data ujian)</option><option value="prod">Pengeluaran</option></select></div>
            <div class="btn-row">
              <button class="btn" onclick="API.add()">Daftar kunci</button>
              <button class="btn teal" onclick="API.testAll()">Uji semua sambungan</button>
              <button class="btn ghost" onclick="API.clear()">Kosongkan</button>
            </div>
          </div>
          <div class="chart-head"><h3>Kunci berdaftar</h3><p>Kunci ditopeng · putaran wajib 90 hari</p></div>
          <div id="kList"></div>
        </div>

        <div class="card">
          <div class="chart-head"><h3>Log penyegerakan &amp; audit</h3><p>Setiap panggilan direkod untuk pematuhan PDPA</p></div>
          <div class="log" id="kLog"></div>
          <div class="chart-head"><h3>Dasar kunci</h3><p>Diguna pakai untuk semua 51 penyambung</p></div>
          <div class="rows">${KEY_POLICY.map(p=>`<div class="row"><span class="rk">${esc(p[0])}</span><span style="flex:1;font-size:12.2px">${esc(p[1])}</span></div>`).join('')}</div>
        </div>
      </div>

      <div class="card">
        <div class="chart-head"><h3>Contoh kod penyepaduan</h3><p>Satu corak untuk semua sumber — hanya tukar endpoint &amp; kunci</p></div>
        <div class="card-pad">
          <div class="tabs" id="codeTabs">
            <button class="tab active" data-c="curl">cURL</button>
            <button class="tab" data-c="py">Python</button>
            <button class="tab" data-c="js">Node.js</button>
            <button class="tab" data-c="env">.env</button>
          </div>
          <pre class="code" id="codeBox"></pre>
        </div>
      </div>

      <div class="card">
        <div class="chart-head"><h3>Katalog penyambung API</h3><p>Semua sumber data mengikut tokoh</p></div>
        <div class="card-pad" style="padding-bottom:0">
          <div class="field" style="max-width:340px">
            <label>Tapis mengikut tokoh</label>
            <select id="cFilter" onchange="V.refreshCatalog()">
              <option value="all">Semua tokoh</option>${opts}
            </select>
          </div>
        </div>
        <div id="cTable" style="padding-top:8px"></div>
      </div>`;
  }

  function refreshCatalog(){
    const f = document.getElementById('cFilter').value;
    document.getElementById('cTable').innerHTML = connectorCatalog(f);
  }

  return {home, tokoh, integrasi, refreshCatalog, connectorCatalog, archSvg};
})();
