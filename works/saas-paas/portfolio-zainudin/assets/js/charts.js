/* ====================================================================
   charts.js — pembina carta SVG ringan (bar, line, donut, radar, spark)
   Tiada kebergantungan luar; dioptimumkan untuk tema gelap & cerah.
   ==================================================================== */
(function(global){
  'use strict';
  const W = 560, PAD = {l:42, r:14, t:14, b:30};
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function scaleY(max){
    const p = Math.pow(10, Math.floor(Math.log10(max || 1)));
    const step = p / 2;
    return Math.ceil(max / step) * step;
  }

  function axisY(H, max, ticks, dark){
    ticks = ticks || 5;
    let o = '';
    for(let i=0;i<=ticks;i++){
      const v = max * i / ticks;
      const y = PAD.t + (H - PAD.t - PAD.b) * (1 - i/ticks);
      o += `<line x1="${PAD.l}" y1="${y.toFixed(1)}" x2="${W-PAD.r}" y2="${y.toFixed(1)}" stroke="${dark?'rgba(255,255,255,.06)':'#eef1f3'}"/>`;
      o += `<text x="${PAD.l-6}" y="${(y+4).toFixed(1)}" text-anchor="end" font-size="10" fill="${dark?'#7a8aa3':'#8b95a5'}">${(+v.toFixed(1))}</text>`;
    }
    return o;
  }

  function bar(c){
    const H = c.height || 260;
    const dark = c.dark !== false;
    const n = c.labels.length, m = c.series.length;
    const max = scaleY(Math.max.apply(null, c.series.reduce((a,s)=>a.concat(s.values), [])) * 1.15);
    const plotW = W - PAD.l - PAD.r, groupW = plotW / n;
    const barW = Math.min(34, (groupW * 0.62) / m);
    let bars = '', xlab = '';
    c.labels.forEach(function(lb, i){
      const gx = PAD.l + groupW*i + groupW/2;
      c.series.forEach(function(s, j){
        const v = s.values[i];
        const h = (H - PAD.t - PAD.b) * (v / max);
        const x = gx - (m*barW)/2 + j*barW + 2;
        const y = H - PAD.b - h;
        bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(barW-4).toFixed(1)}" height="${Math.max(1,h).toFixed(1)}" rx="3" fill="${s.color}" opacity="0.92"><title>${esc(lb)} · ${esc(s.name)}: ${v}${c.suffix||''}</title></rect>`;
        bars += `<text x="${(x+(barW-4)/2).toFixed(1)}" y="${(y-5).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="600" fill="${dark?'#cfd8e7':'#4a5566'}">${v}</text>`;
      });
      xlab += `<text x="${gx.toFixed(1)}" y="${H-10}" text-anchor="middle" font-size="${c.smallLabels?8.6:10}" fill="${dark?'#aebbd0':'#6b7689'}">${esc(lb)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img">${axisY(H,max,5,dark)}${bars}${xlab}
      <line x1="${PAD.l}" y1="${H-PAD.b}" x2="${W-PAD.r}" y2="${H-PAD.b}" stroke="${dark?'rgba(255,255,255,.12)':'#d8dee4'}"/></svg>`;
  }

  function line(c){
    const H = c.height || 260;
    const dark = c.dark !== false;
    const max = scaleY(Math.max.apply(null, c.series.reduce((a,s)=>a.concat(s.values), [])) * 1.1);
    const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
    const n = c.labels.length;
    const X = i => PAD.l + (plotW / (n-1 || 1)) * i;
    const Y = v => PAD.t + plotH * (1 - v/max);
    let paths = '', dots = '', xlab = '';
    c.series.forEach(function(s){
      let d = s.values.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
      if(c.area) paths += `<path d="${d} L${X(n-1).toFixed(1)},${(H-PAD.b)} L${X(0).toFixed(1)},${(H-PAD.b)} Z" fill="${s.color}" opacity="0.12"/>`;
      paths += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
      s.values.forEach(function(v,i){
        dots += `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3" fill="${dark?'#0f2342':'#fff'}" stroke="${s.color}" stroke-width="2"><title>${esc(c.labels[i])} · ${esc(s.name)}: ${v}${c.suffix||''}</title></circle>`;
      });
    });
    const step = Math.ceil(n/8);
    c.labels.forEach(function(lb,i){
      if(i % step === 0 || i === n-1)
        xlab += `<text x="${X(i).toFixed(1)}" y="${H-10}" text-anchor="middle" font-size="10" fill="${dark?'#aebbd0':'#6b7689'}">${esc(lb)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img">${axisY(H,max,5,dark)}${paths}${dots}${xlab}
      <line x1="${PAD.l}" y1="${H-PAD.b}" x2="${W-PAD.r}" y2="${H-PAD.b}" stroke="${dark?'rgba(255,255,255,.12)':'#d8dee4'}"/></svg>`;
  }

  function donut(c){
    const total = c.items.reduce((a,b)=>a+b.value,0);
    const cx = 180, cy = 120, R = 98, r = 58;
    let a0 = -Math.PI/2, seg = '';
    c.items.forEach(function(it){
      const frac = it.value / total;
      const a1 = a0 + frac * Math.PI * 2;
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const x0 = cx + R*Math.cos(a0), y0 = cy + R*Math.sin(a0);
      const x1 = cx + R*Math.cos(a1), y1 = cy + R*Math.sin(a1);
      const x2 = cx + r*Math.cos(a1), y2 = cy + r*Math.sin(a1);
      const x3 = cx + r*Math.cos(a0), y3 = cy + r*Math.sin(a0);
      seg += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} A${r},${r} 0 ${large} 0 ${x3.toFixed(1)},${y3.toFixed(1)} Z" fill="${it.color}" opacity="0.92"><title>${esc(it.label)}: ${it.value.toLocaleString()}</title></path>`;
      a0 = a1;
    });
    const dark = c.dark !== false;
    const rows = c.items.map(function(it){
      const pct = (it.value/total*100).toFixed(1);
      return `<div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid ${dark?'rgba(255,255,255,.06)':'var(--line-2)'};font-size:12px">
        <span style="width:10px;height:10px;border-radius:3px;background:${it.color};flex:0 0 auto"></span>
        <span style="flex:1;color:${dark?'#cfd8e7':'var(--ink-2)'}">${esc(it.label)}</span>
        <b style="color:${dark?'#fff':'var(--navy)'};font-family:'Playfair Display',serif;font-size:14px">${it.value.toLocaleString()}</b>
        <span style="width:48px;text-align:right;color:${dark?'#7a8aa3':'var(--muted)'};font-size:11px">${pct}%</span></div>`;
    }).join('');
    return `<div style="display:grid;grid-template-columns:1fr 1.1fr;gap:14px;align-items:center">
      <svg viewBox="0 0 360 240" style="width:100%;height:auto">${seg}
        <text x="180" y="116" text-anchor="middle" font-size="20" font-weight="700" fill="${dark?'#fff':'var(--navy)'}" font-family="Playfair Display,serif">${total.toLocaleString()}</text>
        <text x="180" y="134" text-anchor="middle" font-size="10.5" fill="${dark?'#aebbd0':'var(--muted)'}">${esc(c.centre||'jumlah')}</text>
      </svg>
      <div>${rows}</div></div>`;
  }

  function radar(c){
    const cx = 170, cy = 170, R = c.radius || 128;
    const N = c.axes.length;
    let grid = '', labels = '';
    for(let k=1;k<=5;k++){
      const pts = [];
      for(let i=0;i<N;i++){
        const ang = -Math.PI/2 + i*2*Math.PI/N;
        pts.push(`${(cx + (R*k/5)*Math.cos(ang)).toFixed(1)},${(cy + (R*k/5)*Math.sin(ang)).toFixed(1)}`);
      }
      grid += `<polygon points="${pts.join(' ')}" fill="none" stroke="#e3dec8" stroke-width="1" opacity="${k===5?0.9:0.5}"/>`;
    }
    for(let i=0;i<N;i++){
      const ang = -Math.PI/2 + i*2*Math.PI/N;
      const lx = cx + (R+20)*Math.cos(ang);
      const ly = cy + (R+20)*Math.sin(ang);
      labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="11" fill="#1f2a3a" font-weight="600">${esc(c.axes[i])}</text>`;
    }
    const polys = c.series.map(function(s){
      const pts = s.values.map(function(v,i){
        const ang = -Math.PI/2 + i*2*Math.PI/N;
        const rr = (v/5) * R;
        return [cx + rr*Math.cos(ang), cy + rr*Math.sin(ang)];
      });
      const p = pts.map(pt=>`${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ');
      const d = pts.map((pt,i)=>`<circle cx="${pt[0].toFixed(1)}" cy="${pt[1].toFixed(1)}" r="3.5" fill="${s.color}" stroke="#fff" stroke-width="1.5"><title>${esc(s.name)} · ${esc(c.axes[i])}: ${s.values[i]}</title></circle>`).join('');
      return `<polygon points="${p}" fill="${s.color}" opacity="0.18"/><polygon points="${p}" fill="none" stroke="${s.color}" stroke-width="2"/><g>${d}</g>`;
    }).join('');
    const legend = c.series.map(s=>`<span style="display:inline-flex;align-items:center;gap:6px;margin-right:12px;font-size:12px;color:#1f2a3a"><span style="width:12px;height:12px;border-radius:3px;background:${s.color}"></span>${esc(s.name)}</span>`).join('');
    return `<div><svg viewBox="0 0 360 360" style="width:100%;height:auto;max-width:360px;display:block;margin:0 auto">${grid}${polys}${labels}</svg>
      <div style="text-align:center;margin-top:8px">${legend}</div></div>`;
  }

  /* sparkline — untuk kad KPI & laporan masa nyata */
  function spark(vals, color, w, h){
    w = w || 140; h = h || 34;
    const max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
    const rng = (max - min) || 1;
    const d = vals.map((v,i)=>`${i?'L':'M'}${(i*(w/(vals.length-1))).toFixed(1)},${(h-2-((v-min)/rng)*(h-6)).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none">
      <path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  }

  function render(c){
    if(!c) return '';
    if(c.type === 'bar')   return bar(c);
    if(c.type === 'line')  return line(c);
    if(c.type === 'donut') return donut(c);
    if(c.type === 'radar') return radar(c);
    return '';
  }

  global.CH = {render:render, spark:spark, esc:esc};
})(window);
