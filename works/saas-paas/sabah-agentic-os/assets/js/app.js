/* ===== app.js — penghala (hash router) & pembina navigasi ===== */

(function(){
  const nav = document.getElementById('nav');
  const view = document.getElementById('view');
  const title = document.getElementById('pageTitle');
  const sub = document.getElementById('pageSub');

  nav.innerHTML =
    `<div class="nav-group">Ringkasan</div>
     <a href="#/" data-r="home"><span class="dot" style="background:#0e8f8f"></span>Ringkasan Eksekutif</a>
     <div class="nav-group">Dashboard Tokoh</div>` +
    TOKOH.map(t=>`<a href="#/t/${t.id}" data-r="t:${t.id}"><span class="dot" style="background:${t.warna}"></span>${t.nama.replace(/^Datuk /,'').replace(/^Datuk Dr\. /,'Dr. ')}<span class="sm">${t.code}</span></a>`).join('') +
    `<div class="nav-group">Penyepaduan</div>
     <a href="#/api" data-r="api"><span class="dot" style="background:#123a63"></span>Integrasi API &amp; Kunci</a>`;

  document.getElementById('today').textContent =
    new Date().toLocaleDateString('ms-MY',{day:'numeric',month:'long',year:'numeric'});

  function render(){
    const h = location.hash || '#/';
    document.querySelectorAll('#nav a').forEach(a=>a.classList.remove('active'));
    let html = '', t = '', s = '', key = '';

    if(h === '#/' || h === ''){
      html = V.home(); t = 'Ringkasan Eksekutif';
      s = 'Enam tokoh strategik · enam dashboard · satu lapisan integrasi data'; key = 'home';
    } else if(h.startsWith('#/t/')){
      const id = h.slice(4);
      const tok = TOKOH_BY_ID[id];
      if(!tok){ location.hash = '#/'; return; }
      html = V.tokoh(tok);
      t = tok.nama; s = tok.jawatan + ' — ' + tok.code; key = 't:' + id;
    } else if(h === '#/api'){
      html = V.integrasi();
      t = 'Integrasi API & Kunci'; s = 'Gerbang berdaulat · 51 penyambung · satu corak penyepaduan'; key = 'api';
    } else { location.hash = '#/'; return; }

    view.innerHTML = html;
    title.textContent = t; sub.textContent = s;
    const a = document.querySelector(`#nav a[data-r="${CSS.escape(key)}"]`);
    if(a) a.classList.add('active');
    window.scrollTo(0,0);

    if(key === 'api') API.init();
  }

  window.addEventListener('hashchange', render);
  render();
})();

function closeModal(){ document.getElementById('modal').classList.add('hidden'); }
