/* ============================================================
   ATLAS MAP – an SVG world map that pans (drag), zooms (pinch, wheel, + −) and reports taps.
   The shapes come from assets/atlas/world.js (built by tools/make_atlas.py), loaded the first time a map is drawn.
   api = atlasMap(host, opts)
     opts.fit:    [x0,y0,x1,y1] area to show first (map units)
     opts.tap:    (id, kind) => …   kind: 'c' country · 'p' physical feature · 'x' other land · 'w' water
     opts.phys:   ids of physical features to draw (seas, rivers, peaks, …)
     opts.labels: 'auto' (country names when there is room) · 'none' · array of {id, t, at:[x,y]}
     opts.caps:   true → capital dots
     opts.paint:  id => class name for a country (colours), default soft map colours
   api.zoomTo(bb), api.cls(id, c, on), api.flash(id, c), api.label(list), api.mark(id, on), api.redraw()
   ============================================================ */
const SVGNS = 'http://www.w3.org/2000/svg';
const GW = A.W, GH = A.H;
let geoState = window.ATLAS_GEO ? 2 : 0, geoWait = [];
function loadGeo(cb) {
  if (geoState === 2) return cb();
  geoWait.push(cb); if (geoState === 1) return;
  geoState = 1;
  const s = document.createElement('script'); s.src = 'assets/atlas/world.js?v=' + A.v;
  s.onload = () => { geoState = 2; const w = geoWait; geoWait = []; w.forEach(f => f()); };
  s.onerror = () => { geoState = 0; geoWait.forEach(f => f(true)); geoWait = []; };
  document.head.appendChild(s);
}
const bbUnion = bbs => bbs.reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])], [1e9, 1e9, -1e9, -1e9]);
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const PEAK = 'M0-7l6.5 11h-13z';

function atlasMap(host, o = {}) {
  host.innerHTML = `<div class="am" dir="ltr"><div class="am-load">🗺️ …</div>
    <div class="am-zoom" data-nopic><button type="button" data-z="in" aria-label="تكبير">+</button><button type="button" data-z="out" aria-label="تصغير">−</button><button type="button" data-z="fit" aria-label="عرض المنطقة كلها">⤢</button></div></div>`;
  const box = host.firstElementChild;
  if (o.fit && !host.classList.contains('big') && (o.fit[2] - o.fit[0]) / Math.max(1, o.fit[3] - o.fit[1]) > 1.5) host.classList.add('wide');   // a wide area gets a wide frame
  if (!o.fit && !host.classList.contains('big')) host.classList.add('wide');
  const api = { ready: false, els: {}, view: null };
  let svg, gLb, gMk, gPh, labels = o.labels || 'auto', markers = [];
  const queue = [];
  const later = (f) => api.ready ? f() : queue.push(f);
  ['zoomTo', 'cls', 'flash', 'label', 'mark', 'redraw', 'clsAll', 'phys'].forEach(k => api[k] = (...a) => later(() => impl[k](...a)));

  const impl = {};

  function el(tag, attrs, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function build() {
    box.querySelector('.am-load').remove();
    svg = el('svg', { class: 'am-svg', viewBox: `0 0 ${GW} ${GH}`, role: 'img', 'aria-label': 'خريطة العالم', preserveAspectRatio: 'xMidYMid meet' });
    box.insertBefore(svg, box.firstChild);
    const G = window.ATLAS_GEO;
    const defs = el('defs', {}, svg), uid = 'am' + Math.random().toString(36).slice(2, 7);
    defs.innerHTML = `<linearGradient id="${uid}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd0f7"/><stop offset=".5" stop-color="#b9def9"/><stop offset="1" stop-color="#9fd0f7"/></linearGradient>`;
    el('rect', { class: 'am-out', x: -GW, y: -GH, width: GW * 3, height: GH * 3, 'data-k': 'w' }, svg);
    el('path', { class: 'am-sea', d: G.edge, fill: `url(#${uid}o)`, 'data-k': 'w' }, svg);
    el('path', { class: 'am-grat', d: G.grat }, svg);
    el('path', { class: 'am-halo', d: G.coast }, svg);
    const gW = el('g', { class: 'am-water' }, svg), gC = el('g', { class: 'am-ct' }, svg);
    gPh = el('g', { class: 'am-ph' }, svg); gMk = el('g', { class: 'am-mk' }, svg); gLb = el('g', { class: 'am-lb', 'aria-hidden': 'true' }, svg);
    el('path', { class: 'am-edge', d: G.edge }, gC.parentNode.insertBefore(el('g', {}), gPh));
    // water features that sit under the land (oceans, seas) and lakes on top
    (o.phys || []).forEach(id => { const f = PH[id]; if (!f || !G.p[id]) return;
      if (f.k === 'ocean' || f.k === 'sea') api.els[id] = el('path', { d: G.p[id], class: 'am-w', 'data-id': id, 'data-k': 'p' }, gW); });
    for (const id in G.c) {
      const c = C[id];
      const p = el('path', { d: G.c[id], class: c ? 'am-c ' + (o.paint ? o.paint(id) : 'mc' + (c.mc || 1)) : 'am-x', 'data-id': id, 'data-k': c ? 'c' : 'x' }, gC);
      api.els[id] = p;
    }
    (o.phys || []).forEach(id => { const f = PH[id]; if (!f) return;
      if (f.k === 'lake' && G.p[id]) api.els[id] = el('path', { d: G.p[id], class: 'am-lake', 'data-id': id, 'data-k': 'p' }, gPh);
      else if ((f.k === 'range' || f.k === 'desert' || f.k === 'land') && G.p[id]) api.els[id] = el('path', { d: G.p[id], class: 'am-rg k-' + f.k, 'data-id': id, 'data-k': 'p' }, gPh);
      else if (f.k === 'river' && G.p[id]) { const g = el('g', { class: 'am-rv', 'data-id': id, 'data-k': 'p' }, gPh); el('path', { d: G.p[id], class: 'am-rv-hit' }, g); el('path', { d: G.p[id], class: 'am-rv-line' }, g); api.els[id] = g; }
      else if (f.p) { markers.push({ id, at: f.p, peak: f.k === 'peak' || f.k === 'range', k: 'p' }); }
    });
    // tiny countries get a dot so they can be seen and tapped
    A.countries.forEach(c => { if (c.tiny && (!o.only || o.only.includes(c.id))) markers.push({ id: c.id, at: c.lab, k: 'c' }); });
    if (o.caps) A.countries.forEach(c => c.cap && markers.push({ id: 'cap-' + c.id, at: c.cap.p, k: 'cap' }));
    markers.forEach(m => {
      const g = el('g', { class: 'am-m k-' + m.k + (m.peak ? ' peak' : ''), 'data-id': m.id, 'data-k': m.k === 'cap' ? 'c' : m.k }, gMk);
      if (m.peak) el('path', { d: PEAK }, g); else el('circle', { r: m.k === 'cap' ? 3 : 5 }, g);
      el('circle', { r: 13, class: 'am-hit' }, g);
      if (m.k !== 'cap') api.els[m.id + '#m'] = g; m.g = g;
    });
    input();
    impl.zoomTo(o.fit || [0, 0, GW, GH], true);
    new ResizeObserver(() => setView(api.view)).observe(box);
  }

  /* ---------- view ---------- */
  const size = () => ({ w: svg.clientWidth || box.clientWidth || 1, h: svg.clientHeight || box.clientHeight || 1 });
  function fitView(bb, pad) {
    if (pad === undefined) pad = bb[2] - bb[0] > GW * 0.8 ? 0.01 : 0.12;
    const { w: cw, h: ch } = size(), ar = cw / ch;
    let w = Math.max(14, (bb[2] - bb[0]) * (1 + pad * 2)), h = Math.max(10, (bb[3] - bb[1]) * (1 + pad * 2));
    if (w / h < ar) w = h * ar; else h = w / ar;
    return { x: (bb[0] + bb[2]) / 2 - w / 2, y: (bb[1] + bb[3]) / 2 - h / 2, w, h };
  }
  function clamp(v) {
    const { w: cw, h: ch } = size(), ar = cw / ch;
    let w = Math.min(Math.max(v.w, 6), GW * 1.5), h = w / ar;
    if (h > GH * 3.5) { h = GH * 3.5; w = h * ar; }
    const cx = Math.min(Math.max(v.x + v.w / 2, 0), GW), cy = Math.min(Math.max(v.y + v.h / 2, 0), GH);
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }
  function setView(v) {
    if (!v) return; v = clamp(v); api.view = v;
    svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    const k = v.w / size().w;                     // map units per screen pixel
    svg.style.setProperty('--k', k);
    markers.forEach(m => m.g.setAttribute('transform', `translate(${m.at[0]} ${m.at[1]}) scale(${k})`));
    drawLabels(k);
  }
  let anim = 0;
  impl.zoomTo = (bb, now) => {
    const to = fitView(bb), from = api.view;
    cancelAnimationFrame(anim);
    if (now || !from || reduceMotion()) return setView(to);
    const t0 = performance.now(), D = 520;
    const step = t => { const p = Math.min(1, (t - t0) / D), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setView({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e });
      if (p < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  };
  function zoomAt(f, px, py) {
    const v = api.view, { w: cw, h: ch } = size();
    const mx = v.x + px / cw * v.w, my = v.y + py / ch * v.h;
    const w = v.w / f, h = v.h / f;
    setView({ x: mx - (mx - v.x) / f, y: my - (my - v.y) / f, w, h });
  }

  /* ---------- labels ---------- */
  function drawLabels(k) {
    gLb.textContent = '';
    let list = [];
    if (labels === 'auto') {
      const v = api.view;
      A.countries.forEach(c => { if (c.tiny) return; const bw = (c.bb[2] - c.bb[0]) / k;
        if (bw > 46 && c.lab[0] > v.x && c.lab[0] < v.x + v.w && c.lab[1] > v.y && c.lab[1] < v.y + v.h) list.push({ t: nm(c), at: c.lab, cls: 'lc' }); });
      if (list.length > 70) list = list.slice(0, 70);
      (o.extra || []).forEach(l => { if (!l.min || api.view.w < GW / l.min) list.push(l); });
    } else if (Array.isArray(labels)) list = labels.filter(l => !l.w || l.w / k > 26);   // small countries get their name once zoomed in
    list.forEach(l => { const t = el('text', { x: l.at[0], y: l.at[1] + (l.dy || 0) * k, class: 'am-t ' + (l.cls || ''), 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, gLb); t.textContent = l.t; });
  }
  impl.label = list => { labels = list; drawLabels(api.view.w / size().w); };
  impl.redraw = () => setView(api.view);

  /* ---------- classes ---------- */
  const nodes = id => [api.els[id], api.els[id + '#m']].filter(Boolean);
  impl.cls = (id, c, on = true) => nodes(id).forEach(n => n.classList.toggle(c, on));
  impl.clsAll = (c, on = false) => svg.querySelectorAll('.' + c).forEach(n => n.classList.toggle(c, on));
  impl.flash = (id, c = 'bad', ms = 900) => { nodes(id).forEach(n => { n.classList.add(c); setTimeout(() => n.classList.remove(c), ms); }); };
  impl.mark = (id, on) => impl.cls(id, 'hl', on);
  impl.phys = () => {};

  /* ---------- input: drag to pan, pinch / wheel / buttons to zoom, tap to choose ---------- */
  function input() {
    const pts = new Map(); let start = null, moved = 0, pinch = null;
    svg.addEventListener('pointerdown', e => {
      svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { start = { x: e.clientX, y: e.clientY, v: api.view, t: Date.now(), target: e.target }; moved = 0; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), v: api.view, m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }; moved = 99; }
    });
    svg.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const r = svg.getBoundingClientRect(), { w: cw } = size();
      if (pts.size === 2 && pinch) {
        const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y), f = d / pinch.d, v = pinch.v;
        const mx = v.x + (pinch.m.x - r.left) / cw * v.w, my = v.y + (pinch.m.y - r.top) / cw * v.w;
        setView({ x: mx - (mx - v.x) / f, y: my - (my - v.y) / f, w: v.w / f, h: v.h / f });
      } else if (start) {
        const dx = e.clientX - start.x, dy = e.clientY - start.y; moved = Math.max(moved, Math.hypot(dx, dy));
        if (moved > 6) { const k = start.v.w / cw; setView({ x: start.v.x - dx * k, y: start.v.y - dy * k, w: start.v.w, h: start.v.h }); box.classList.add('drag'); }
      }
    });
    const up = e => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId); box.classList.remove('drag');
      if (pts.size === 0) {
        if (start && moved <= 6 && o.tap) {
          const t = start.target.closest && start.target.closest('[data-id]');
          const k = t ? t.getAttribute('data-k') : 'w';
          let id = t ? t.getAttribute('data-id') : null;
          if (id && id.startsWith('cap-')) id = id.slice(4);
          o.tap(id, k);
        }
        start = null; pinch = null;
      } else if (pts.size === 1) { const [p] = [...pts.values()]; start = { x: p.x, y: p.y, v: api.view, t: Date.now(), target: svg }; pinch = null; }
    };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    svg.addEventListener('wheel', e => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    const zb = box.querySelector('.am-zoom');
    if (zb) zb.addEventListener('click', e => {
      const b = e.target.closest('[data-z]'); if (!b) return; HS.fx('tap');
      const { w, h } = size();
      if (b.dataset.z === 'fit') return impl.zoomTo(o.fit || [0, 0, GW, GH]);
      zoomAt(b.dataset.z === 'in' ? 1.6 : 1 / 1.6, w / 2, h / 2);
    });
  }
  loadGeo(err => {
    if (err) { box.querySelector('.am-load').textContent = 'تعذّر تحميل الخريطة'; return; }
    build(); api.ready = true; queue.splice(0).forEach(f => f());
  });
  return api;
}
