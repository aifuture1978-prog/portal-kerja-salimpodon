/* ===== charts.js — pembina carta SVG ringan (tanpa kebergantungan luar) ===== */

const CH = (() => {
  const W = 780, PAD = {l:46, r:18, t:16, b:34};

  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function scaleY(max){
    const pow = Math.pow(10, Math.floor(Math.log10(max||1)));
    const step = pow/2;
    return Math.ceil(max/step)*step;
  }

  function axisY(H, max, ticks=5){
    let out = '';
    for(let i=0;i<=ticks;i++){
      const v = max*i/ticks;
      const y = PAD.t + (H-PAD.t-PAD.b)*(1 - i/ticks);
      out += `<line x1="${PAD.l}" y1="${y.toFixed(1)}" x2="${W-PAD.r}" y2="${y.toFixed(1)}" stroke="#eef2f7" stroke-width="1"/>`;
      out += `<text x="${PAD.l-8}" y="${(y+4).toFixed(1)}" text-anchor="end" font-size="10.5" fill="#64748b">${(+v.toFixed(1))}</text>`;
    }
    return out;
  }

  /* ---- bar chart (menegak, 1 atau lebih siri) ---- */
  function bar(c){
    const H = 290;
    const max = scaleY(Math.max(...c.series.flatMap(s=>s.values))*1.08);
    const n = c.labels.length, m = c.series.length;
    const plotW = W-PAD.l-PAD.r;
    const groupW = plotW/n, barW = Math.min(38, (groupW*0.62)/m);
    let bars='', xlab='';
    c.labels.forEach((lb,i)=>{
      const gx = PAD.l + groupW*i + groupW/2;
      c.series.forEach((s,j)=>{
        const v = s.values[i];
        const h = (H-PAD.t-PAD.b)*(v/max);
        const x = gx - (m*barW)/2 + j*barW + 2;
        const y = H-PAD.b-h;
        bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(barW-4).toFixed(1)}" height="${Math.max(1,h).toFixed(1)}" rx="4" fill="${s.color}" opacity="0.92"><title>${esc(lb)} · ${esc(s.name)}: ${v}${c.suffix||''}</title></rect>`;
        bars += `<text x="${(x+(barW-4)/2).toFixed(1)}" y="${(y-6).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="600" fill="#33475b">${v}</text>`;
      });
      xlab += `<text x="${gx.toFixed(1)}" y="${H-12}" text-anchor="middle" font-size="10.5" fill="#64748b">${esc(lb)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img">
      ${axisY(H,max)}${bars}${xlab}
      <line x1="${PAD.l}" y1="${H-PAD.b}" x2="${W-PAD.r}" y2="${H-PAD.b}" stroke="#dbe3ec" stroke-width="1"/>
    </svg>`;
  }

  /* ---- line chart ---- */
  function line(c){
    const H = 290;
    const max = scaleY(Math.max(...c.series.flatMap(s=>s.values))*1.1);
    const plotW = W-PAD.l-PAD.r, plotH = H-PAD.t-PAD.b;
    const n = c.labels.length;
    const X = i => PAD.l + (plotW/(n-1||1))*i;
    const Y = v => PAD.t + plotH*(1 - v/max);
    let paths='', dots='', xlab='';
    c.series.forEach(s=>{
      let d = s.values.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
      if(c.area){
        paths += `<path d="${d} L${X(n-1).toFixed(1)},${(H-PAD.b)} L${X(0).toFixed(1)},${(H-PAD.b)} Z" fill="${s.color}" opacity="0.08"/>`;
      }
      paths += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
      s.values.forEach((v,i)=>{
        dots += `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3" fill="#fff" stroke="${s.color}" stroke-width="2"><title>${esc(c.labels[i])} · ${esc(s.name)}: ${v}${c.suffix||''}</title></circle>`;
      });
    });
    const step = Math.ceil(n/8);
    c.labels.forEach((lb,i)=>{ if(i%step===0||i===n-1) xlab += `<text x="${X(i).toFixed(1)}" y="${H-12}" text-anchor="middle" font-size="10.5" fill="#64748b">${esc(lb)}</text>`; });
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img">
      ${axisY(H,max)}${paths}${dots}${xlab}
      <line x1="${PAD.l}" y1="${H-PAD.b}" x2="${W-PAD.r}" y2="${H-PAD.b}" stroke="#dbe3ec" stroke-width="1"/>
    </svg>`;
  }

  /* ---- donut ---- */
  function donut(c){
    const total = c.items.reduce((a,b)=>a+b.value,0);
    const cx=230, cy=150, R=104, r=62;
    let a0 = -Math.PI/2, seg='';
    c.items.forEach(it=>{
      const frac = it.value/total;
      const a1 = a0 + frac*Math.PI*2;
      const large = (a1-a0) > Math.PI ? 1 : 0;
      const x0=cx+R*Math.cos(a0), y0=cy+R*Math.sin(a0);
      const x1=cx+R*Math.cos(a1), y1=cy+R*Math.sin(a1);
      const x2=cx+r*Math.cos(a1), y2=cy+r*Math.sin(a1);
      const x3=cx+r*Math.cos(a0), y3=cy+r*Math.sin(a0);
      seg += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} A${r},${r} 0 ${large} 0 ${x3.toFixed(1)},${y3.toFixed(1)} Z" fill="${it.color}" opacity="0.92"><title>${esc(it.label)}: ${it.value}${c.unit||''}</title></path>`;
      a0 = a1;
    });
    const rows = c.items.map(it=>{
      const pct = (it.value/total*100).toFixed(1);
      return `<div class="row"><span class="rk">${esc(it.label)}</span>
        <span class="mini"><i style="width:${pct}%;background:${it.color}"></i></span>
        <span class="rv">${it.value}${c.unit||''}</span></div>`;
    }).join('');
    return `<div style="display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;padding:8px 6px 6px">
      <svg viewBox="0 0 460 300" width="230" height="150" role="img">${seg}
        <text x="230" y="145" text-anchor="middle" font-size="20" font-weight="700" fill="#0d1b2a">${(+total.toFixed(1)).toLocaleString()}</text>
        <text x="230" y="163" text-anchor="middle" font-size="10.5" fill="#64748b">jumlah${c.unit||''}</text>
      </svg>
      <div class="rows" style="padding:0">${rows}</div>
    </div>`;
  }

  /* ---- sparkline untuk kad KPI ---- */
  function spark(vals, color){
    const w=140,h=34,max=Math.max(...vals),min=Math.min(...vals);
    const rng=(max-min)||1;
    const d = vals.map((v,i)=>`${i?'L':'M'}${(i*(w/(vals.length-1))).toFixed(1)},${(h-2-((v-min)/rng)*(h-6)).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none">
      <path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>`;
  }

  function render(c){
    if(c.type==='bar') return bar(c);
    if(c.type==='line') return line(c);
    if(c.type==='donut') return donut(c);
    return '';
  }

  function legend(c){
    if(c.type==='donut') return '';
    return `<div class="legend">${c.series.map(s=>`<span><i style="background:${s.color}"></i>${s.name}</span>`).join('')}</div>`;
  }

  return {render, legend, spark};
})();
