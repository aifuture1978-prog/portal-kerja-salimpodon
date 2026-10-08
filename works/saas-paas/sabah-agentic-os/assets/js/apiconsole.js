/* ===== apiconsole.js — pendaftaran kunci, ujian sambungan & log audit ===== */

const API = (() => {
  const LS = 'agentic_os_keys_v1';
  const LOG = 'agentic_os_log_v1';
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const load = () => { try { return JSON.parse(localStorage.getItem(LS)) || []; } catch(e){ return []; } };
  const save = k => localStorage.setItem(LS, JSON.stringify(k));
  const loadLog = () => { try { return JSON.parse(localStorage.getItem(LOG)) || []; } catch(e){ return []; } };
  const saveLog = l => localStorage.setItem(LOG, JSON.stringify(l.slice(0,80)));

  function stamp(){
    const d = new Date();
    return d.toLocaleTimeString('ms-MY',{hour12:false});
  }

  function log(msg, cls){
    const l = loadLog();
    l.unshift({t:stamp(), m:msg, c:cls||''});
    saveLog(l);
    paintLog();
  }

  function paintLog(){
    const box = document.getElementById('kLog');
    if(!box) return;
    const l = loadLog();
    box.innerHTML = l.length ? l.map(x=>`<div><span class="t">[${x.t}]</span> <span class="${x.c}">${x.m}</span></div>`).join('')
      : '<div><span class="t">Tiada aktiviti lagi. Daftar kunci atau jalankan ujian sambungan.</span></div>';
  }

  function mask(k){
    if(!k) return '—';
    return k.slice(0,7) + '•'.repeat(Math.max(4, Math.min(14, k.length-11))) + k.slice(-4);
  }

  function daysLeft(ts){
    return Math.max(0, 90 - Math.floor((Date.now()-ts)/86400000));
  }

  function paintList(){
    const box = document.getElementById('kList');
    if(!box) return;
    const keys = load();
    if(!keys.length){ box.innerHTML = '<div style="padding:14px 16px;color:#64748b;font-size:12.5px">Belum ada kunci didaftarkan. Prototaip ini menyimpan kunci setempat dalam pelayar sahaja — dalam pengeluaran, kunci disimpan dalam peti besi dalam negara.</div>'; return; }
    box.innerHTML = keys.map((k,i)=>{
      const d = daysLeft(k.ts);
      const chip = d>30?'chip ok':(d>7?'chip warn':'chip bad');
      return `<div class="conn">
        <span class="st" style="background:#1e8e5a"></span>
        <div class="nm"><b>${esc(k.sys)} — ${esc(k.conn)}</b>
          <span>${esc(mask(k.key))} · ${esc(k.env)}</span></div>
        <span class="${chip}">${d} hari</span>
        <button class="btn danger sm" onclick="API.del(${i})">Padam</button>
      </div>`;
    }).join('');
  }

  function fillConnectors(){
    const sys = document.getElementById('kSys');
    const conn = document.getElementById('kConn');
    if(!sys || !conn) return;
    const t = TOKOH_BY_ID[sys.value];
    conn.innerHTML = t.connectors.map(c=>`<option value="${esc(c.nm)}">${esc(c.nm)}</option>`).join('');
  }

  function add(){
    const sys = document.getElementById('kSys');
    const t = TOKOH_BY_ID[sys.value];
    const conn = document.getElementById('kConn').value;
    const key = document.getElementById('kKey').value.trim();
    const env = document.getElementById('kEnv').value;
    if(!key){ log('Ralat: medan kunci kosong.', 'er'); return; }
    const keys = load();
    if(keys.some(k=>k.sys===t.code && k.conn===conn && k.env===env)){
      log(`Kunci bagi ${conn} (${env}) sudah wujud — diganti.`, 'wn');
    }
    keys.unshift({sys:t.code, conn, key, env, ts:Date.now()});
    save(keys);
    document.getElementById('kKey').value = '';
    paintList();
    log(`Kunci didaftarkan: ${t.code} · ${conn} [${env}]`, 'ok');
  }

  function del(i){
    const keys = load();
    const k = keys.splice(i,1)[0];
    save(keys); paintList();
    log(`Kunci dipadam: ${k.conn}`, 'wn');
  }

  function clear(){
    localStorage.removeItem(LS);
    localStorage.removeItem(LOG);
    paintList(); paintLog();
    log('Senarai kunci & log dikosongkan.', 'wn');
  }

  function testAll(){
    const keys = load();
    const pool = keys.length ? keys : TOKOH[0].connectors.slice(0,4).map(c=>({sys:TOKOH[0].code, conn:c.nm, env:'sandbox'}));
    log(`Ujian sambungan dimulakan — ${pool.length} penyambung…`, '');
    pool.forEach((k,i)=>{
      setTimeout(()=>{
        const lat = 90 + Math.floor(Math.random()*260);
        const ok = Math.random() > 0.18;
        if(ok) log(`200 OK · ${k.sys} ${k.conn} · ${lat} ms · kuota 8,400/10,000`, 'ok');
        else   log(`429/401 · ${k.sys} ${k.conn} · kuota hampir penuh atau kunci belum dibenarkan`, 'er');
      }, 260*(i+1));
    });
  }

  const CODE = {
    curl:
`<span class="c"># 1) Dapatkan token daripada gerbang (kunci kekal di pelayan)</span>
curl -X POST https://gateway.sabah.gov.my/v1/token \\\\
  -H <span class="s">"Authorization: Basic $GATEWAY_CLIENT"</span> \\\\
  -d <span class="s">"grant_type=client_credentials&amp;scope=tpns.read"</span>

<span class="c"># 2) Tarik data melalui gerbang — kunci sumber tidak pernah didedahkan</span>
curl https://gateway.sabah.gov.my/v1/tpns/akaun?updated_since=2026-09-01 \\\\
  -H <span class="s">"Authorization: Bearer $TOKEN"</span> \\\\
  -H <span class="s">"X-Tokoh: U5"</span> \\\\
  -H <span class="s">"X-Trace-Id: dashboard-raimy-001"</span>`,

    py:
`<span class="k">import</span> os, httpx, hashlib

GATEWAY = os.environ[<span class="s">"GATEWAY_URL"</span>]      <span class="c"># dalam negara</span>
CLIENT  = os.environ[<span class="s">"GATEWAY_CLIENT"</span>]
SECRET  = os.environ[<span class="s">"GATEWAY_SECRET"</span>]

<span class="k">def</span> token(scope: <span class="k">str</span>) -> <span class="k">str</span>:
    r = httpx.post(<span class="s">f"{GATEWAY}/v1/token"</span>, data={
        <span class="s">"grant_type"</span>: <span class="s">"client_credentials"</span>, <span class="s">"scope"</span>: scope},
        auth=(CLIENT, SECRET), timeout=10)
    r.raise_for_status()
    <span class="k">return</span> r.json()[<span class="s">"access_token"</span>]

<span class="k">def</span> tarik_akaun_tpns(since: <span class="k">str</span>):
    <span class="c"># MyKad dihash sebelum dipadankan (minimisasi data / PDPA)</span>
    h = httpx.get(<span class="s">f"{GATEWAY}/v1/tpns/akaun"</span>,
        params={<span class="s">"updated_since"</span>: since},
        headers={<span class="s">"Authorization"</span>: <span class="s">f"Bearer {token(</span><span class="s">'tpns.read'</span><span class="s">)}"</span>,
                 <span class="s">"X-Tokoh"</span>: <span class="s">"U5"</span>}, timeout=30)
    h.raise_for_status()
    <span class="k">for</span> rec <span class="k">in</span> h.json()[<span class="s">"data"</span>]:
        rec[<span class="s">"mykad_hash"</span>] = hashlib.sha256(rec.pop(<span class="s">"mykad"</span>).encode()).hexdigest()
    <span class="k">return</span> h.json()[<span class="s">"data"</span>]`,

    js:
`<span class="c">// services/gateway.js — satu klien untuk semua 51 penyambung</span>
<span class="k">const</span> GATEWAY = process.env.GATEWAY_URL;

<span class="k">export async function</span> fetchConnector({ tokoh, path, params = {} }) {
  <span class="k">const</span> tok = <span class="k">await</span> getToken(<span class="s">\`\${tokoh}.read\`</span>);
  <span class="k">const</span> url = <span class="k">new</span> URL(<span class="s">\`/v1\${path}\`</span>, GATEWAY);
  <span class="k">for</span> (<span class="k">const</span> [k, v] <span class="k">of</span> Object.entries(params)) url.searchParams.set(k, v);

  <span class="k">const</span> res = <span class="k">await</span> fetch(url, {
    headers: { Authorization: <span class="s">\`Bearer \${tok}\`</span>, <span class="s">"X-Tokoh"</span>: tokoh,
               <span class="s">"X-Trace-Id"</span>: crypto.randomUUID() },
    <span class="c">// gerbang menguat kuasa kuota + log audit</span>
  });

  <span class="k">if</span> (res.status === 429) <span class="k">await</span> backoff(res.headers.get(<span class="s">"Retry-After"</span>));
  <span class="k">if</span> (!res.ok) <span class="k">throw new</span> Error(<span class="s">\`\${tokoh} \${path} → \${res.status}\`</span>);
  <span class="k">return</span> res.json();
}

<span class="c">// contoh: dashboard U2 — telemetri tekanan 30 saat</span>
<span class="k">const</span> air = <span class="k">await</span> fetchConnector({ tokoh: <span class="s">"U2"</span>, path: <span class="s">"/scada/tekanan"</span>,
  params: { zon: <span class="s">"Z-104"</span>, since: <span class="s">"-24h"</span> } });`,

    env:
`<span class="c"># .env — JANGAN komit ke repositori; guna peti besi (vault) dalam negara</span>
GATEWAY_URL=https://gateway.sabah.gov.my
GATEWAY_CLIENT=sk_gateway_client
GATEWAY_SECRET=****************

<span class="c"># Skop per tokoh (least privilege)</span>
SCOPE_U1=tekun.read smebank.read aim.read scoring.invoke
SCOPE_U2=scada.read ami.read met.read jps.read
SCOPE_U3=esp2.read epbt.read jpbd.read identity.verify
SCOPE_U4=epbt.read jpkn.read mygov.read sealion.invoke
SCOPE_U5=tpns.read janm.read emis.read fpx.mandate
SCOPE_U6=jpbn.read jps.read met.read apm.read sealion.invoke

<span class="c"># Dasar operasi</span>
KEY_ROTATION_DAYS=90
KEY_ROTATION_SENSITIVE_DAYS=60
DATA_RESIDENCY=MY
LOG_AUDIT=true`
  };

  function paintCode(kind){
    document.getElementById('codeBox').innerHTML = CODE[kind];
  }

  function init(){
    fillConnectors();
    const sys = document.getElementById('kSys');
    if(sys) sys.addEventListener('change', fillConnectors);
    document.querySelectorAll('#codeTabs .tab').forEach(b=>{
      b.addEventListener('click', ()=>{
        document.querySelectorAll('#codeTabs .tab').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        paintCode(b.dataset.c);
      });
    });
    document.getElementById('cTable').innerHTML = V.connectorCatalog('all');
    paintCode('curl');
    paintList();
    if(!loadLog().length){
      log('Gerbang API sedia — 0 kunci didaftarkan.', '');
    } else paintLog();
  }

  return {add, del, clear, testAll, init, paintList, paintLog, connectorCatalog:null};
})();
