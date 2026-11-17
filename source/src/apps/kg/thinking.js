/* ============================================================
   THINKING GAMES (نفكّر) – loaded after app.js, same scope.
   Levels follow published learning trajectories:
   (puzzle and robot have 8 levels, the others 5)
   - puzzle:  picture guide → more pieces → no guide → 16 pieces → decoy pieces from another picture, 25 pieces
   - compose: shapes on a coloured guide → outlines only → silhouette (Clements & Sarama)
   - where:   in/on/under → beside → behind/in front → between → pick the picture
   - robot:   direct control → plan a straight path → one turn → rocks → a star → detours on 6×6 → two stars → shortest path only
   - story:   3 steps with the first placed → 3 → 4 → 5 → predict what happens next
   Levels adapt like the other games (up after ≥80% first-try, down below 50%).
   ============================================================ */
const { SCENES, DESIGNS, WHERE, STORIES } = APPDATA.kg;
const THINK_ROUNDS = { puzzle: 3, compose: 3, where: 5, robot: 4, story: 4 };
const THINK_MAX = { puzzle: 8, robot: 8, compose: 5, where: 5, story: 5 };   // number of levels
const tl = fn => fn[lang()];
const THINK_GAMES = {};   // filled at the end of this file and by thinking2.js
const fresh = html => { $('gArea').innerHTML = `<div class="tk">${html}</div>`; return $('gArea').firstElementChild; };
const POOLS = {};   // filtered lists kept stable so HS.bag can remember what was shown
let GEN = 0;   // bumps on every new puzzle, so timers from an old puzzle never touch the new one
/** setTimeout that is cancelled when the puzzle changes or the child leaves the game */
const later = (fn, ms) => { const g = GEN; setTimeout(() => { if (g === GEN && $('k-game').classList.contains('on')) fn(); }, ms); };
function thinkStart(k) {
  GEN++; G.max = THINK_MAX[k]; G.roundN = THINK_ROUNDS[k];
  levelBar(); dots(); $('gShow').innerHTML = '';
  THINK_GAMES[k]();
}
/** one puzzle finished: record, then next puzzle (or end of round → level check) */
function thinkDone(firstTry) {
  track(firstTry); say(praise()); G.round++; dots();
  later(() => { if (G.round >= G.roundN) endOfRound(); thinkStart(G.k); }, 2200);
}
function ask(text, l) { $('gQ').textContent = text; $('gQ').style.direction = l === 'ar' ? 'rtl' : 'ltr'; G.sp = [[text, l]]; say(G.sp); }
const shake = el => { el.classList.remove('hs-shake'); void el.offsetWidth; el.classList.add('hs-shake'); };

/* ---------------- 🧩 jigsaw ---------------- */
/* The picture is built from HTML (gradient + big emoji), not a canvas:
   iPad Safari does not draw very large emoji on a canvas, which left only the gradient. */
function sceneHtml600(i, size, cls = '') {
  const s = SCENES[i], k = size / 600;
  return `<div class="pz-scene ${cls}" style="width:${size}px;height:${size}px;background:linear-gradient(${s.bg[0]},${s.bg[1]})">${
    s.items.map(([e, x, y, f]) => `<span style="left:${x * k}px;top:${y * k}px;font-size:${f * k}px">${e}</span>`).join('')}</div>`;
}
/** one piece of the picture: a window of w×h showing cell i of a cols×rows cut */
function pieceHtml(sc, i, cols, rows, w, h) {
  return `<span class="pz-win" style="width:${w}px;height:${h}px"><span class="pz-shift" style="left:-${(i % cols) * w}px;top:-${Math.floor(i / cols) * h}px">${sceneHtml600(sc, w * cols)}</span></span>`;
}
/** true when cell i shows only the background (no picture touches it) */
function plain(sc, i, cols, rows) {
  const cw = 600 / cols, ch = 600 / rows, x0 = (i % cols) * cw, y0 = Math.floor(i / cols) * ch;
  return SCENES[sc].items.every(([, x, y, f]) => { const r = f * .55; return x + r < x0 || x - r > x0 + cw || y + r < y0 || y - r > y0 + ch; });
}
function puzzleGame() {
  // 1-3: faint picture inside the frame · 4+: no picture · 7-8: extra pieces from another picture mixed in
  const L = G.lv, [cols, rows, extra] = { 1: [2, 2, 0], 2: [3, 2, 0], 3: [3, 3, 0], 4: [3, 3, 0], 5: [4, 3, 0], 6: [4, 4, 0], 7: [4, 4, 3], 8: [5, 5, 4] }[L], guide = L <= 3;
  const sc = SCENES.indexOf(HS.bag('pz', SCENES)), n = cols * rows, other = (sc + 1 + Math.floor(Math.random() * (SCENES.length - 1))) % SCENES.length;
  const W = Math.floor(Math.min(330, window.innerWidth - 60)), cw = W / cols, ch = W / rows;
  const pw = Math.min(cw, 92), ph = pw * ch / cw;
  const root = fresh(`<div class="pz-board" dir="ltr" style="width:${W}px;height:${W}px;grid-template-columns:repeat(${cols},minmax(0,1fr));grid-template-rows:repeat(${rows},minmax(0,1fr))">
      ${guide ? sceneHtml600(sc, W, 'pz-guide') : ''}
      ${Array.from({ length: n }, (_, i) => `<div class="pz-slot" data-i="${i}"></div>`).join('')}</div>
    <div class="pz-pool" dir="ltr">${HS.shuffle([...[...Array(n).keys()].map(i => [i, sc, i]), ...HS.shuffle([...Array(n).keys()]).slice(0, extra).map(i => ['x', other, i])])
      .map(([id, scn, i]) => `<button type="button" class="pz-piece hs-drag" data-i="${id}" style="width:${pw}px;height:${ph}px" aria-label="قطعة">${pieceHtml(scn, i, cols, rows, pw, ph)}</button>`).join('')}</div>`);
  ask(tl(P.puzzle)(), lang());
  let placed = 0, mistakes = 0;
  HS.dnd(root, { item: '.pz-piece', target: '.pz-slot', onDrop(p, slot) {
    if (slot.classList.contains('done')) return false;
    const i = +p.dataset.i, si = +slot.dataset.i;
    // plain background pieces in the same row look identical, so either one fits
    if (si === i || (p.dataset.i !== 'x' && Math.floor(si / cols) === Math.floor(i / cols) && plain(sc, i, cols, rows) && plain(sc, si, cols, rows))) {
      slot.classList.add('done', 'hs-pop'); slot.innerHTML = pieceHtml(sc, si, cols, rows, slot.clientWidth, slot.clientHeight); p.classList.add('hs-done'); p.style.display = 'none'; HS.fx('ok');
      if (++placed === n) later(() => thinkDone(mistakes <= Math.floor(n / 4)), 400);
      return true;
    }
    mistakes++; HS.fx('no'); shake(slot);
    if (p.dataset.i === 'x') { shake(p); say([[tl(P.notMine)(), lang()]]); return false; }   // decoy piece from another picture
    const r = Math.floor(i / cols) / Math.max(1, rows - 1);   // hint in spatial words: top / middle / bottom
    say([[tl(r < .34 ? P.up : r > .66 ? P.down : P.mid)(), lang()]]);
    return false;
  } });
}

/* ---------------- 🏠 build with shapes ---------------- */
function shapeSvg(t, x, y, w, h, attrs) {
  const pts = { triU: `${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`, triD: `${x},${y} ${x + w},${y} ${x + w / 2},${y + h}`,
    triL: `${x},${y + h / 2} ${x + w},${y} ${x + w},${y + h}`, triR: `${x},${y} ${x + w},${y + h / 2} ${x},${y + h}`,
    rtBR: `${x + w},${y} ${x + w},${y + h} ${x},${y + h}`, rtBL: `${x},${y} ${x + w},${y + h} ${x},${y + h}`,
    rtTR: `${x},${y} ${x + w},${y} ${x + w},${y + h}` }[t];   // rtBL + rtTR together cover a rectangle
  if (t === 'rect') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" ${attrs}/>`;
  if (t === 'circle') return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" ${attrs}/>`;
  return `<polygon points="${pts}" ${attrs}/>`;
}
const keyOf = p => p[0] + ':' + p[3] + 'x' + p[4];
function composeGame() {
  const L = G.lv, tier = L <= 2 ? 1 : L <= 3 ? 2 : 3;    // L1-2 coloured guide, L3 outlines, L4-5 silhouette
  const pool = POOLS['cp' + L] = POOLS['cp' + L] || DESIGNS.filter(d => d.lv <= Math.min(3, Math.ceil(L / 1.7))), d = HS.bag('cp' + L, pool);
  const S = Math.min(300, window.innerWidth - 70), k = S / 100;
  // from level 3 there is more than one right answer: one rectangle can also be made from two right triangles
  const rect = L >= 3 ? d.p.find(p => p[0] === 'rect' && p[3] >= 12 && p[4] >= 12) : null;
  const alt = rect ? [{ t: 'rtBL', p: rect }, { t: 'rtTR', p: rect }] : [];
  const slot = (p, i) => shapeSvg(p[0], p[1], p[2], p[3], p[4], `class="cp-slot" data-i="${i}" data-k="${keyOf(p)}" ` +
    (tier === 1 ? `fill="${p[5]}" fill-opacity=".28" stroke="${p[5]}" stroke-width="1" stroke-dasharray="2 1.5"`
      : tier === 2 ? `fill="#ffffff" stroke="#9aa4b2" stroke-width="1" stroke-dasharray="2 1.5"` : `fill="#c9ced6" stroke="#c9ced6" stroke-width=".6"`));
  const root = fresh(`<svg class="cp-board" viewBox="0 0 100 100" style="width:${S}px;height:${S}px">${d.p.map(slot).join('')}<g class="cp-fill"></g></svg>
    <div class="cp-pool">${HS.shuffle([...d.p.map((p, i) => i), ...alt]).map(i => { const p = typeof i === 'number' ? d.p[i] : i.p, t = typeof i === 'number' ? p[0] : i.t;
      return `<button type="button" class="cp-piece hs-drag" ${typeof i === 'number' ? `data-i="${i}" data-k="${keyOf(p)}"` : `data-half="${keyOf(p)}" data-part="${i.t}" data-col="${p[5]}"`} aria-label="${typeof i === 'number' ? 'شكل' : 'مثلث'}"><svg viewBox="${p[1] - 1} ${p[2] - 1} ${p[3] + 2} ${p[4] + 2}" style="width:${(p[3] + 2) * k}px;height:${(p[4] + 2) * k}px">${shapeSvg(t, p[1], p[2], p[3], p[4], `fill="${p[5]}" stroke="rgba(0,0,0,.25)" stroke-width=".8"`)}</svg></button>`; }).join('')}</div>`);
  ask(tl(P.compose)(d), lang());
  let placed = 0, mistakes = 0;
  HS.dnd(root, { item: '.cp-piece', target: '.cp-slot', onDrop(pc, sl) {
    if (sl.classList.contains('done')) return false;
    if (pc.dataset.half && pc.dataset.half === sl.dataset.k && !(sl.dataset.h || '').includes(pc.dataset.part)) {   // half of a rectangle
      const p = d.p[+sl.dataset.i];
      root.querySelector('.cp-fill').insertAdjacentHTML('beforeend', shapeSvg(pc.dataset.part, p[1], p[2], p[3], p[4], `fill="${pc.dataset.col}" stroke="rgba(0,0,0,.25)" stroke-width=".8" class="hs-pop"`));
      sl.dataset.h = (sl.dataset.h || '') + pc.dataset.part; pc.classList.add('hs-done'); pc.style.display = 'none'; HS.fx('ok');
      if (sl.dataset.h.length > 4) {   // both halves: the slot is full
        sl.classList.add('done');
        if (!root.querySelector(`.cp-slot[data-k="${sl.dataset.k}"]:not(.done)`)) root.querySelectorAll(`.cp-piece[data-k="${sl.dataset.k}"]`).forEach(x => { if (!x.classList.contains('hs-done')) { x.classList.add('hs-done'); x.style.display = 'none'; } });
        later(() => say([[tl(P.twoTri)(), lang()]]), 300);
        if (++placed === d.p.length) later(() => thinkDone(mistakes <= 1), 1800);
      }
      return true;
    }
    if (pc.dataset.k === sl.dataset.k && sl.dataset.h) { HS.fx('no'); shake(pc); return false; }   // half built with a triangle: finish with the other one
    if (pc.dataset.k === sl.dataset.k) {             // any slot with the same shape and size fits
      const p = d.p[+sl.dataset.i], col = d.p[+pc.dataset.i][5];
      sl.classList.add('done'); root.querySelector('.cp-fill').insertAdjacentHTML('beforeend', shapeSvg(p[0], p[1], p[2], p[3], p[4], `fill="${col}" stroke="rgba(0,0,0,.25)" stroke-width=".8" class="hs-pop"`));
      pc.classList.add('hs-done'); pc.style.display = 'none'; HS.fx('ok');
      root.querySelectorAll(`.cp-piece[data-half="${sl.dataset.k}"]`).forEach(x => { if (!x.classList.contains('hs-done') && !root.querySelector(`.cp-slot[data-k="${sl.dataset.k}"]:not(.done)`)) { x.classList.add('hs-done'); x.style.display = 'none'; } });
      if (++placed === d.p.length) later(() => thinkDone(mistakes <= 1), 400);
      return true;
    }
    mistakes++; HS.fx('no'); shake(pc); return false;
  } });
}

/* ---------------- 🧭 where is it? (position words) ---------------- */
/** the thing to place: the ball has a drawn picture, the animals stay as they are */
const tgt = t => t[2] === 'ball' ? HS.art('game-ball', { small: true, eager: true, fb: t[0], cls: 'wt-img' }) : t[0];
const ZONE_POS = {   // where each spot is drawn in the 300×240 scene (centre x,y) and its layer
  table: { on: [150, 62, 3], under: [150, 182, 3], beside: [262, 150, 3] },
  basket: { in: [150, 140, 1], on: [150, 46, 3], beside: [262, 150, 3] },
  box: { on: [150, 52, 3], beside: [262, 150, 3], behind: [150, 92, 0], front: [150, 196, 4] },
  boxes: { between: [150, 158, 3], on: [70, 70, 3], beside: [272, 158, 3] }
};
function sceneHtml(s, mini, extra = '') {
  const ref = {
    table: HS.ART['game-table'] ? `<div class="wt-table art">${HS.art('game-table', { small: true, eager: true, fb: '', cls: 'wt-img' })}</div>` : `<div class="wt-table"><i></i><b class="l"></b><b class="r"></b></div>`,
    basket: `<div class="wt-basket">${HS.art('game-basket', { small: true, eager: true, fb: '🧺', cls: 'wt-img' })}</div>`,
    box: `<div class="wt-box">${HS.art('game-box', { small: true, eager: true, fb: '📦', cls: 'wt-img' })}</div>`,
    boxes: `<div class="wt-box two a">${HS.art('game-box', { small: true, eager: true, fb: '📦', cls: 'wt-img' })}</div><div class="wt-box two b">${HS.art('game-box', { small: true, eager: true, fb: '📦', cls: 'wt-img' })}</div>`
  }[s];
  return `<div class="wt-scene ${mini ? 'mini' : ''}" data-s="${s}">${ref}${extra}</div>`;
}
function whereGame() {
  const L = G.lv, ar = LANG === 'ar', t = HS.bag('wt-t', WHERE.targets);
  if (WHERE.levels[L] === 'pick') return wherePick(t);
  const [s, p] = HS.bag('wt' + L, WHERE.levels[L]), zones = WHERE.scenes[s].zones;
  const root = fresh(`<div class="wt-wrap">${sceneHtml(s)}</div><div class="wt-pool"><button type="button" class="wt-target hs-drag" aria-label="${t[1]}">${tgt(t)}</button></div>`);
  const sc = root.querySelector('.wt-scene');
  zones.forEach(z => { const [x, y, zi] = ZONE_POS[s][z]; sc.insertAdjacentHTML('beforeend', `<div class="wt-zone" data-z="${z}" style="left:${x - 34}px;top:${y - 34}px;z-index:${zi}"></div>`); });
  ROOT._dbg = p;
  ask(tl(P.where)(t, s, p), lang());
  let mistakes = 0;
  HS.dnd(root, { item: '.wt-target', target: '.wt-zone', onDrop(el, zone) {
    if (zone.dataset.z === p) {
      const [x, y, zi] = ZONE_POS[s][p];
      sc.insertAdjacentHTML('beforeend', `<div class="wt-placed hs-pop" style="left:${x - 30}px;top:${y - 30}px;z-index:${zi === 0 ? 0 : 5}">${tgt(t)}</div>`);
      el.classList.add('hs-done'); el.style.visibility = 'hidden'; sc.querySelectorAll('.wt-zone').forEach(z => z.remove()); HS.fx('ok');
      later(() => thinkDone(mistakes === 0), 300); return true;
    }
    mistakes++; HS.fx('no'); shake(zone); say([[LANG === 'ar' ? HS_PHRASES.retryF.ar : HS_PHRASES.retry.en, lang()], ...G.sp]); return false;
  } });
}
function wherePick(t) {
  const all = POOLS.wtAll = POOLS.wtAll || Object.keys(WHERE.scenes).flatMap(s => WHERE.scenes[s].zones.map(p => [s, p]));
  const ans = HS.bag('wt5', all), others = HS.shuffle(all.filter(o => o[0] === ans[0] && o[1] !== ans[1])).slice(0, 2);
  while (others.length < 2) { const o = HS.one(all); if (o !== ans && !others.includes(o)) others.push(o); }
  const opts = HS.shuffle([ans, ...others]);
  const root = fresh(`<div class="wt-pick">${opts.map(([s, p], i) => { const [x, y, zi] = ZONE_POS[s][p]; return `<button type="button" class="wt-opt" data-i="${i}">${sceneHtml(s, true, `<div class="wt-placed" style="left:${x - 30}px;top:${y - 30}px;z-index:${zi === 0 ? 0 : 5}">${t[0]}</div>`)}</button>`; }).join('')}</div>`);
  ask(tl(P.wherePick)(t, ans[0], ans[1]), lang());
  let mistakes = 0;
  root.querySelectorAll('.wt-opt').forEach(b => b.onclick = () => {
    if (opts[+b.dataset.i] === ans) { b.classList.add('ok'); root.querySelectorAll('.wt-opt').forEach(x => x.disabled = true); HS.fx('ok'); thinkDone(mistakes === 0); }
    else { mistakes++; b.classList.add('no'); b.disabled = true; HS.fx('no'); say([[LANG === 'ar' ? HS_PHRASES.retryF.ar : HS_PHRASES.retry.en, lang()], ...G.sp]); }
  });
}

/* ---------------- 🤖 guide the robot ---------------- */
const DIRS = { u: [0, -1, '⬆️', 'فوق'], d: [0, 1, '⬇️', 'تحت'], l: [-1, 0, '⬅️', 'يسار'], r: [1, 0, '➡️', 'يمين'] };
function bfs(N, rocks, a, b) {
  const key = p => p[0] + ',' + p[1], seen = new Map([[key(a), 0]]), q = [a];
  while (q.length) { const c = q.shift(); if (c[0] === b[0] && c[1] === b[1]) return seen.get(key(c));
    for (const [dx, dy] of Object.values(DIRS)) { const n = [c[0] + dx, c[1] + dy];
      if (n[0] < 0 || n[1] < 0 || n[0] >= N || n[1] >= N || rocks.has(key(n)) || seen.has(key(n))) continue; seen.set(key(n), seen.get(key(c)) + 1); q.push(n); } }
  return Infinity;
}
let lastBoard = '';
/* Robot levels (Bee-Bot style progression, then more planning):
   [grid, shortest path min, max, rocks, stars, arrow limit]
   1 each arrow moves at once · 2 plan a straight line · 3 one turn · 4 rocks · 5 a star first
   6 bigger board, path must go round rocks · 7 two stars · 8 two stars and only as many arrows as the shortest path */
const ROBOT_LV = { 1: [4, 1, 3, 0, 0], 2: [4, 2, 3, 0, 0], 3: [4, 3, 4, 0, 0], 4: [5, 4, 6, 2, 0], 5: [5, 5, 8, 2, 1],
  6: [6, 7, 10, 5, 1], 7: [6, 9, 13, 5, 2], 8: [6, 10, 14, 6, 2, true] };
function makeLevel(L) {
  const [N, minD, maxD, nRocks, nStars, limit] = ROBOT_LV[L], rnd = n => Math.floor(Math.random() * n), k = p => p[0] + ',' + p[1];
  for (let tries = 0; tries < 3000; tries++) {
    const a = [rnd(N), rnd(N)], b = [rnd(N), rnd(N)];
    if (L <= 2 && a[0] !== b[0] && a[1] !== b[1]) continue;             // straight line only
    if (L === 3 && (a[0] === b[0] || a[1] === b[1])) continue;          // needs a turn
    const rocks = new Set(), used = new Set([k(a), k(b)]);
    for (let i = 0; i < nRocks; i++) { const r = [rnd(N), rnd(N)]; if (!used.has(k(r))) { rocks.add(k(r)); used.add(k(r)); } }
    const stars = [];
    for (let i = 0; i < nStars; i++) { const t = [rnd(N), rnd(N)]; if (!used.has(k(t))) { stars.push(t); used.add(k(t)); } }
    if (stars.length < nStars) continue;
    const D = (x, y) => bfs(N, rocks, x, y), man = (x, y) => Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1]);
    let d, free;   // free = length without rocks, to check that the rocks really get in the way
    if (!stars.length) { d = D(a, b); free = man(a, b); }
    else if (stars.length === 1) { d = D(a, stars[0]) + D(stars[0], b); free = man(a, stars[0]) + man(stars[0], b); }
    else { const [s1, s2] = stars; d = D(a, s1) + D(s1, s2) + D(s2, b); free = man(a, s1) + man(s1, s2) + man(s2, b); }   // two stars: in order (1 then 2)
    if (!(d >= minD && d <= maxD && d < Infinity)) continue;
    if (L >= 6 && d <= free) continue;                                 // from level 6 the rocks force a detour
    const sig = [a, b, stars, [...rocks].sort()].join('|');
    if (sig === lastBoard) continue;
    lastBoard = sig; return { N, a, b, rocks, stars, d, limit: limit ? d : 20 };
  }
  return { N: 4, a: [0, 0], b: [2, 0], rocks: new Set(), stars: [], d: 2, limit: 20 };
}
/* Plan before moving: arrows go into a plan, nothing moves until ▶️. 👣 plays one step, ⌫ removes the last
   command, 🗑️ clears the plan. From level 6 the ×2 button repeats the last arrow (one command, two moves: a
   first loop). Levels 7–8: two numbered stars, taken in order. Level 8: a limited number of commands. */
function robotGame() {
  const L = G.lv, lv = makeLevel(L), direct = L === 1, k = p => p[0] + ',' + p[1], loop = L >= 6;
  const cell = Math.min(64, Math.floor((Math.min(360, window.innerWidth - 50)) / lv.N) - 4);
  const starAt = p => lv.stars.findIndex(t => k(t) === k(p));
  const tile = HS.ART['game-tile'] ? `--tile:url('${HS.ART['game-tile'].sm || HS.ART['game-tile'].src}');` : '';
  const root = fresh(`<div class="rb-board${tile ? ' tiled' : ''}" dir="ltr" style="${tile}grid-template-columns:repeat(${lv.N},${cell}px);grid-auto-rows:${cell}px">
      ${Array.from({ length: lv.N * lv.N }, (_, i) => { const p = [i % lv.N, Math.floor(i / lv.N)], si = starAt(p);
        return `<div class="rb-cell" style="font-size:${cell * .62}px">${lv.rocks.has(k(p)) ? HS.art('game-rock', { small: true, eager: true, fb: '🪨', cls: 'rb-img' }) : si >= 0 ? `<span class="rb-star" data-s="${si}">${HS.art('game-star-pickup', { small: true, eager: true, fb: '⭐', cls: 'rb-img' })}${lv.stars.length > 1 ? `<b>${HS.toAr(si + 1)}</b>` : ''}</span>` : k(p) === k(lv.b) ? HS.art('game-apple-goal', { small: true, eager: true, fb: '🍎', cls: 'rb-img' }) : ''}</div>`; }).join('')}
      <div class="rb-bot" style="width:${cell}px;height:${cell}px;font-size:${cell * .7}px"><span>${HS.art('game-robot-idle', { small: true, eager: true, fb: '🤖', cls: 'rb-img' })}</span></div></div>
    ${direct ? '' : `<div class="rb-prog" dir="ltr" role="list" aria-label="الخطة"></div>${lv.limit < 20 ? `<div class="rb-limit" aria-live="polite"></div>` : ''}`}
    <div class="rb-keys" dir="ltr">${['l', 'u', 'd', 'r'].map(d => `<button type="button" class="rb-k" data-d="${d}" aria-label="${DIRS[d][3]}">${DIRS[d][2]}</button>`).join('')}
      ${loop ? '<button type="button" class="rb-k rep" aria-label="كرّر آخر سهم مرتين">×٢</button>' : ''}</div>
    ${direct ? '' : `<div class="rb-keys rb-run" dir="ltr"><button type="button" class="rb-k del" aria-label="احذف آخر أمر">⌫</button><button type="button" class="rb-k clr" aria-label="امسح الخطة كلها">🗑️</button>
      <button type="button" class="rb-k stp" aria-label="خطوة واحدة">👣</button><button type="button" class="rb-k go" aria-label="شغّل الخطة">▶️</button></div>`}`);
  ROOT._dbg = lv;   // read by the automated tests
  ask(tl(lv.stars.length > 1 ? P.robotStars : lv.stars.length ? P.robotStar : P.robot)(), lang());
  if (lv.limit < 20) later(() => say([[tl(P.robotLimit)(lv.limit), lang()]]), 2500);
  else if (loop && L === 6) later(() => say([[tl(P.robotRepeat)(), lang()]]), 2500);
  const botBox = root.querySelector('.rb-bot'), bot = botBox.firstElementChild, prog = [];   // prog: [{ d: 'l'|'r'|'u'|'d', n: 1|2 }]
  let pos = lv.a.slice(), got = new Set(), runs = 0, busy = false, stepAt = 0;
  const place = (p, anim) => { botBox.style.left = (6 + p[0] * (cell + 4)) + 'px'; botBox.style.top = (6 + p[1] * (cell + 4)) + 'px'; if (anim) { bot.classList.remove('hs-pop'); void bot.offsetWidth; bot.classList.add('hs-pop'); } };
  place(pos);
  // the robot cheers when it reaches the apple
  const cheer = () => { const im = bot.querySelector('img'), a = HS.ART['game-robot-happy']; if (im && a) im.src = a.sm || a.src; };
  const ok = p => p[0] >= 0 && p[1] >= 0 && p[0] < lv.N && p[1] < lv.N && !lv.rocks.has(k(p));
  // stars are taken in order: star 2 does not count before star 1
  const star = p => { const si = starAt(p); if (si < 0 || got.has(si)) return;
    if (si !== got.size) { if (!warned) { warned = true; say([[tl(P.robotOrder)(), lang()]]); } return; }
    got.add(si); root.querySelector(`.rb-star[data-s="${si}"]`).classList.add('got'); HS.fx('combo'); };
  let warned = false;
  const resetStars = () => { got = new Set(); warned = false; root.querySelectorAll('.rb-star').forEach(s => s.classList.remove('got')); };
  const win = p => k(p) === k(lv.b) && got.size === lv.stars.length;
  const progView = () => {
    const el = root.querySelector('.rb-prog'); if (el) el.innerHTML = prog.map((c, j) => `<span role="listitem" aria-label="${DIRS[c.d][3]}${c.n > 1 ? ' مرتين' : ''}" class="${j < stepAt ? 'did' : ''}">${DIRS[c.d][2]}${c.n > 1 ? '<b>×٢</b>' : ''}</span>`).join('') || '<em>…</em>';
    const lim = root.querySelector('.rb-limit'); if (lim) { lim.textContent = `🔢 ${HS.toAr(prog.length)} / ${HS.toAr(lv.limit)}`; lim.classList.toggle('full', prog.length >= lv.limit); }
  };
  progView();
  root.querySelectorAll('.rb-k[data-d]').forEach(b => b.onclick = () => {
    if (busy) return; const d = b.dataset.d;
    if (direct) {                                   // level 1: each arrow moves the robot right away
      const n = [pos[0] + DIRS[d][0], pos[1] + DIRS[d][1]];
      if (!ok(n)) { HS.fx('no'); shake(bot); runs++; return; }
      pos = n; place(pos, true); HS.fx('tap'); runs++;
      if (win(pos)) { busy = true; HS.fx('win'); cheer(); thinkDone(runs <= lv.d + 1); }
      return;
    }
    if (prog.length >= lv.limit) { HS.fx('no'); shake(root.querySelector(lv.limit < 20 ? '.rb-limit' : '.rb-prog')); if (lv.limit < 20) say([[tl(P.robotLimit)(lv.limit), lang()]]); return; }
    rewind(); prog.push({ d, n: 1 }); HS.fx('tap'); progView();
  });
  const btn = c => root.querySelector('.rb-k.' + c);
  const rewind = () => { if (stepAt) { stepAt = 0; pos = lv.a.slice(); resetStars(); place(pos); } };
  if (btn('rep')) btn('rep').onclick = () => {      // ×2: the last arrow runs twice (still one command)
    if (busy) return; const c = prog[prog.length - 1];
    if (!c || c.n > 1) { HS.fx('no'); say([[tl(P.robotRepeat)(), lang()]]); return; }
    rewind(); c.n = 2; HS.fx('tap'); progView();
  };
  if (btn('del')) btn('del').onclick = () => { if (!busy) { rewind(); prog.pop(); progView(); } };
  if (btn('clr')) btn('clr').onclick = () => { if (!busy) { rewind(); prog.length = 0; progView(); } };
  // one command = its moves (×2 → two moves)
  const moves = c => Array(c.n).fill(c.d);
  const fail = msg => { HS.fx('no'); say([[tl(msg)(), lang()]]); later(() => { stepAt = 0; pos = lv.a.slice(); resetStars(); place(pos); progView(); busy = false; }, 900); };
  const end = () => { if (win(pos)) { HS.fx('win'); busy = true; cheer(); thinkDone(runs === 1); } else fail(k(pos) === k(lv.b) ? P.robotMissed : P.robotShort); };
  /** run command j; then(true) when it went fine, after the animation */
  const runCmd = (j, then) => {
    const ms = moves(prog[j]); let m = 0;
    root.querySelectorAll('.rb-prog span').forEach((s, x) => s.classList.toggle('now', x === j));
    const one = () => {
      if (m >= ms.length) return then(true);
      const d = ms[m++], n = [pos[0] + DIRS[d][0], pos[1] + DIRS[d][1]];
      if (!ok(n)) { shake(bot); fail(P.robotBump); return then(false); }
      pos = n; place(pos, true); star(pos); later(one, lv.N > 5 ? 400 : 480);
    };
    one();
  };
  if (btn('go')) btn('go').onclick = () => {
    if (busy || !prog.length) { say([[tl(P.robotRun)(), lang()]]); return; }
    busy = true; runs++; stepAt = 0; pos = lv.a.slice(); resetStars(); place(pos);
    const next = () => { if (stepAt >= prog.length) { busy = false; return end(); } runCmd(stepAt, ok => { if (!ok) return; stepAt++; progView(); next(); }); };
    later(next, 300);
  };
  // 👣: play the plan one command at a time, to find where it goes wrong
  if (btn('stp')) btn('stp').onclick = () => {
    if (busy || !prog.length) { if (!prog.length) say([[tl(P.robotRun)(), lang()]]); return; }
    if (stepAt === 0) { runs++; pos = lv.a.slice(); resetStars(); place(pos); }
    busy = true;
    runCmd(stepAt, ok => { if (!ok) return; stepAt++; progView(); busy = false; if (stepAt >= prog.length) { busy = true; end(); } });
  };
}

/* ---------------- 📖 order the story ---------------- */
function storyGame() {
  const L = G.lv, l = lang(), ar = LANG === 'ar';
  const n = { 1: 3, 2: 3, 3: 4, 4: 5, 5: 0 }[L];
  if (L === 5) return storyPredict();
  const pool = POOLS['st' + n] = POOLS['st' + n] || STORIES.filter(s => s.n === n), st = HS.bag('st' + L, pool), steps = st.steps;
  const pre = L === 1 ? 1 : 0;                      // level 1: the first picture is already placed
  const root = fresh(`<div class="st-slots">${steps.map((s, i) => `<div class="st-slot ${i < pre ? 'filled' : ''}" data-i="${i}"><b>${HS.toAr(i + 1)}</b>${i < pre ? `<span class="em">${s[0]}</span>` : ''}</div>`).join('')}</div>
    <div class="st-pool">${HS.shuffle(steps.map((_, i) => i).filter(i => i >= pre)).map(i => `<button type="button" class="st-card" data-i="${i}"><span class="em">${steps[i][0]}</span><small>${ar ? steps[i][1] : steps[i][2]}</small></button>`).join('')}</div>`);
  ask(tl(P.story)(), l);
  let next = pre, mistakes = 0;
  const slots = root.querySelectorAll('.st-slot');
  root.querySelectorAll('.st-card').forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    if (i === next) {
      slots[i].classList.add('filled', 'hs-pop'); slots[i].insertAdjacentHTML('beforeend', `<span class="em">${steps[i][0]}</span>`);
      b.disabled = true; b.style.visibility = 'hidden'; HS.fx('tap'); say([[ar ? steps[i][1] : steps[i][2], l]]);
      if (++next === steps.length) {
        // retell the whole story: retelling builds narrative skills
        later(() => { say(steps.map(s => [ar ? s[1] : s[2], l])); }, 700);
        later(() => thinkDone(mistakes === 0), 700 + steps.length * 1300);
      }
    } else { mistakes++; HS.fx('no'); shake(b); say([[ar ? steps[i][1] : steps[i][2], l], [tl(P.storyNext)(), l]]); }
  });
}
function storyPredict() {
  const l = lang(), ar = LANG === 'ar', st = HS.bag('st5', STORIES), steps = st.steps.slice(0, Math.min(4, st.steps.length));
  const last = steps[steps.length - 1], shown = steps.slice(0, -1);
  const wrong = HS.shuffle(STORIES.filter(s => s !== st).flatMap(s => s.steps).filter(x => x[0] !== last[0] && !shown.some(y => y[0] === x[0]))).slice(0, 2);
  const opts = HS.shuffle([last, ...wrong]);
  const root = fresh(`<div class="st-slots">${shown.map((s, i) => `<div class="st-slot filled"><b>${HS.toAr(i + 1)}</b><span class="em">${s[0]}</span></div>`).join('')}<div class="st-slot q"><b>${HS.toAr(steps.length)}</b><span class="em">❓</span></div></div>
    <div class="st-pool">${opts.map((o, i) => `<button type="button" class="st-card" data-i="${i}"><span class="em">${o[0]}</span><small>${ar ? o[1] : o[2]}</small></button>`).join('')}</div>`);
  G.sp = [...shown.map(s => [ar ? s[1] : s[2], l]), [tl(P.storyNext)(), l]];
  $('gQ').textContent = tl(P.storyNext)(); $('gQ').style.direction = ar ? 'rtl' : 'ltr'; say(G.sp);
  let mistakes = 0;
  root.querySelectorAll('.st-card').forEach(b => b.onclick = () => {
    if (opts[+b.dataset.i] === last) {
      const q = root.querySelector('.st-slot.q'); q.classList.add('filled', 'hs-pop'); q.querySelector('.em').textContent = last[0];
      root.querySelectorAll('.st-card').forEach(x => x.disabled = true); HS.fx('ok');
      say(steps.map(s => [ar ? s[1] : s[2], l])); later(() => thinkDone(mistakes === 0), steps.length * 1300);
    } else { mistakes++; b.disabled = true; b.classList.add('no'); HS.fx('no'); say([[ar ? opts[+b.dataset.i][1] : opts[+b.dataset.i][2], l], [tl(P.storyNext)(), l]]); }
  });
}

/* ---------------- ⏱️ gentle session timer ----------------
   WHO: at most 1 hour of screen time a day for ages 2–4, less is better.
   After the chosen minutes of play, a break screen appears; a parent can press and hold to continue. */
const SESSION = { sec: 0, iv: null };
function sessionLimit() { const m = HS.settings().kgMinutes; return (m === undefined ? 15 : m) * 60; }
function sessionTick() {
  if (document.visibilityState !== 'visible' || !ROOT.closest('.screen.on')) return;
  const d = K(), today = HS.today(), now = Date.now();
  if (!d.sess || d.sess.day !== today || now - d.sess.last > 45 * 60e3) d.sess = { day: today, sec: 0, last: now };   // new day or a long break → fresh session
  d.sess.sec += 5; d.sess.last = now; HS.save();
  const lim = sessionLimit();
  if (lim && d.sess.sec >= lim && !$('kBreak')) showBreak();
}
function showBreak() {
  clearTimeout(tmr); HS.stopSpeak(); HS.nav.go('app-kg', true);   // back to the menu (replaces the game address)
  ROOT.insertAdjacentHTML('beforeend', `<div class="k-break" id="kBreak" role="dialog" aria-modal="true" aria-label="وقت الاستراحة"><div class="k-break-in">
    <div class="big">${HS.mascot('sleep', { fb: '🧸🌳' })}</div><h2>وقت الاستراحة!</h2><p>عمل رائع اليوم 🌟 هيا نلعب بعيدًا عن الشاشة.</p>
    <button type="button" class="k-hold" id="kHold"><i></i><span>للأب: اضغط مطوّلًا للمتابعة ١٠ دقائق</span></button></div></div>`);
  say([[tl(P.brk)(), lang()]]);
  const btn = $('kHold'); let t = null;
  const start = e => { e.preventDefault(); btn.classList.add('on'); t = setTimeout(() => { const d = K(); d.sess.sec = Math.max(0, sessionLimit() - 600); HS.save(); $('kBreak').remove(); }, 2000); };
  const stop = () => { btn.classList.remove('on'); clearTimeout(t); };
  setTimeout(() => btn.focus(), 50);
  btn.addEventListener('pointerdown', start); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, stop));
}
SESSION.iv = setInterval(sessionTick, 5000);

Object.assign(THINK_GAMES, { puzzle: puzzleGame, compose: composeGame, where: whereGame, robot: robotGame, story: storyGame });
