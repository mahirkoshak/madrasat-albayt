/* ============================================================
   WORLD ATLAS (أطلس العالم) – countries, capitals, flags, continents, oceans, seas, mountains, rivers, deserts.
   Pages (each is a route): home · map (free map) · p-<pack> (a level) · g-<pack>-<mode> (a game) · c-<id> (a country)
   · f-<id> (a physical feature) · passport (my stamps) · quick (mixed review)
   Learning design (research):
   - expanding horizons: start at home (the Arabian Peninsula), then the Arab world, then each continent in small
     chunks of 5–18 countries (the way Seterra-style quizzes split continents into regions)
   - three ways to know a place: WHERE it is (tap it on the map), its CAPITAL, its FLAG; a level shows a star for each
   - learn first (a guided tour with names on the map), then retrieval practice with immediate feedback:
     recognise (pick the name of the highlighted place) → recall the location (find it on the map, no names shown)
   - a wrong tap shows the name of what was tapped and then where the answer is; missed places come back (Leitner boxes)
   - the passport map fills with colour as places are learned (visible progress)
   The map follows Saudi Arabia's view (Natural Earth's Saudi point of view): Palestine, not Israel.
   ============================================================ */
const A = APPDATA.atlas;
const $ = id => document.getElementById(id);
const esc = HS.esc, ar = HS.toAr;
const M = () => $('aMain');
const C = Object.fromEntries(A.countries.map(c => [c.id, c]));
const PH = Object.fromEntries(A.phys.map(p => [p.id, p]));
const CT = Object.fromEntries(A.conts.map(c => [c.id, c]));
const PK = Object.fromEntries(A.packs.map(p => [p.id, p]));
const NS = 'atlas';
const D = () => { const d = HS.data(NS); d.seen = d.seen || {}; return d; };
const item = id => C[id] || PH[id] || CT[id];
const nameOf = id => (item(id) || {}).ar || id;
const kindOf = id => C[id] ? 'دولة' : CT[id] ? 'قارة' : A.kinds[(PH[id] || {}).k] || '';
const flagImg = (c, cls = '') => c && c.flag ? `<img class="a-flag ${cls}" src="assets/flags/${c.flag}.svg" alt="علم ${esc(c.ar)}" loading="lazy" decoding="async">` : '';
const say = t => HS.speak([[t, 'ar']]);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const stripH = s => s.replace(/[ً-ْـ]/g, '');
const normAr = s => stripH(s).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
const popWords = n => !n ? '' : n >= 1e9 ? `حوالي ${ar((n / 1e9).toFixed(1).replace(/\.0$/, ''))} مليار` : n >= 1e6 ? `حوالي ${ar(Math.round(n / 1e6))} مليون` : n >= 1e3 ? `حوالي ${ar(Math.round(n / 1e3))} ألف` : `حوالي ${ar(n)}`;

/* ---------- packs, skills and stars ---------- */
/* skill keys in HS.srs: 'l:<id>' where it is · 'c:<id>' its capital · 'f:<id>' its flag */
const isCountryPack = p => p.kind === 'country';
const skillsOf = p => isCountryPack(p) ? ['l', 'c', 'f'] : ['l'];
const keys = (p, s) => p.ids.map(id => s + ':' + id);
const mastery = (p, s) => HS.srs.mastery(NS, keys(p, s));
function stars(p) {
  if (isCountryPack(p)) return skillsOf(p).filter(s => mastery(p, s) >= 0.75).length;
  const m = mastery(p, 'l'); return m >= 0.75 ? 3 : m >= 0.5 ? 2 : m >= 0.25 ? 1 : 0;
}
const nextPack = () => A.packs.find(p => stars(p) < 3) || A.packs[0];
const packBB = p => p.id === 'world' ? [0, 0, A.W, A.H] : bbUnion(p.ids.map(id => (item(id) || {}).bb).filter(Boolean).filter(b => b[2] - b[0] < A.W * 0.9));
const learned = id => C[id] ? ['l', 'c', 'f'].every(s => HS.srs.box(NS, s + ':' + id) >= 3) : HS.srs.box(NS, 'l:' + id) >= 3;
function visit(id) { const d = D(); if (!d.seen[id]) { d.seen[id] = Date.now(); HS.save(); } }
function contClass(id) { const c = C[id]; return c ? 'ct-' + c.c : ''; }

/* ---------- routes ---------- */
const R = sub => 'app-atlas' + (sub ? '-' + sub : '');
function go(sub) { HS.nav.go(R(sub)); }
let mapApi = null;
function show(sub) {
  HS.stopSpeak(); mapApi = null; let m;
  if (!sub) return home();
  if (sub === 'map') return freeMap();
  if (sub === 'passport') return passport();
  if (sub === 'quick') return game(null, 'quick');
  if ((m = /^p-(\w+)$/.exec(sub)) && PK[m[1]]) return packPage(PK[m[1]]);
  if ((m = /^g-(\w+)-(\w+)$/.exec(sub)) && PK[m[1]]) return game(PK[m[1]], m[2]);
  if ((m = /^c-(\w+)$/.exec(sub)) && (C[m[1]] || CT[m[1]])) return C[m[1]] ? countryPage(C[m[1]]) : contPage(CT[m[1]]);
  if ((m = /^f-([\w-]+)$/.exec(sub)) && PH[m[1]]) return featPage(PH[m[1]]);
  return home();
}
const MODES = { tour: 'تعرّف', find: 'أين تقع؟', name: 'ما اسمها؟', cap: 'العواصم', flag: 'الأعلام', quick: 'تحدٍّ سريع' };
function chainFor(sub) {
  let m;
  if (!sub) return [];
  if (sub === 'map') return [{ route: R(sub), title: 'الخريطة' }];
  if (sub === 'passport') return [{ route: R(sub), title: 'جواز سفري' }];
  if (sub === 'quick') return [{ route: R(sub), title: 'تحدٍّ سريع', focus: true }];
  if ((m = /^p-(\w+)$/.exec(sub)) && PK[m[1]]) return [{ route: R(sub), title: PK[m[1]].ar }];
  if ((m = /^g-(\w+)-(\w+)$/.exec(sub)) && PK[m[1]]) return [{ route: R('p-' + m[1]), title: PK[m[1]].ar }, { route: R(sub), title: MODES[m[2]] || '', focus: m[2] !== 'tour' }];
  if ((m = /^[cf]-([\w-]+)$/.exec(sub)) && item(m[1])) return [{ route: R(sub), title: nameOf(m[1]) }];
  return [];
}

/* ---------- home ---------- */
function dayPick() { const t = A.countries, d = new Date(), n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate(); return t[(n * 7919) % t.length]; }
function home() {
  const nx = nextPack(), cd = dayPick(), seen = Object.keys(D().seen).filter(id => C[id]).length;
  const due = dueKeys().length;
  M().innerHTML = `<section class="a-hero">
      <div class="a-hero-tx"><h1>أطلس العالم</h1><p>القارات والمحيطات والدول والعواصم والأعلام والجبال والأنهار.</p>
        <label class="a-search"><span aria-hidden="true">🔍</span><input id="aQ" type="search" placeholder="ابحث عن دولة أو عاصمة أو بحر…" aria-label="ابحث في الأطلس" autocomplete="off"></label>
        <div id="aRes" class="a-res" role="list"></div></div>
      <button type="button" class="a-hero-map" data-go="map" aria-label="افتح الخريطة"><div id="aMini" class="a-mini"></div><span class="a-hero-cta">🗺️ افتح الخريطة</span></button>
    </section>
    <div class="a-acts">
      <button type="button" class="a-act" data-go="p-${nx.id}"><b>${nx.em}</b><span>تابع: ${esc(nx.ar)}</span></button>
      <button type="button" class="a-act" data-go="quick"><b>🎯</b><span>تحدٍّ سريع${due ? ` <i>${ar(due)}</i>` : ''}</span></button>
      <button type="button" class="a-act" data-go="passport"><b>🛂</b><span>جواز سفري <i>${ar(seen)}</i></span></button>
    </div>
    <button type="button" class="a-day" data-go="c-${cd.id}">${flagImg(cd, 'big')}<span><small>دولة اليوم</small><b>${esc(cd.ar)}</b><span>العاصمة: ${esc(cd.cap ? cd.cap.ar : '—')} · ${esc(CT[cd.c].ar)}</span></span></button>
    <h2 class="a-h2">المستويات</h2>
    <div class="a-packs">${A.packs.map((p, i) => packCard(p, i, p === nx)).join('')}</div>`;
  const mini = atlasMap($('aMini'), { labels: 'none', only: [], paint: id => learned(id) ? contClass(id) + ' got' : D().seen[id] ? 'seen' : 'plain' });
  $('aMini').querySelector('.am-zoom').remove();
  const q = $('aQ'); q.oninput = () => search(q.value);
}
function packCard(p, i, next) {
  const s = stars(p), m = Math.round(skillsOf(p).reduce((a, k) => a + mastery(p, k), 0) / skillsOf(p).length * 100);
  return `<button type="button" class="a-pack ${next ? 'next' : ''}" data-go="p-${p.id}"><span class="a-pk-em">${p.em}</span>
    <span class="a-pk-tx"><b>${ar(i + 1)}. ${esc(p.ar)}</b><small>${ar(p.ids.length)} ${isCountryPack(p) ? 'دولة' : 'معلمًا'}${next ? ' · <em>ابدأ هنا</em>' : ''}</small>
    <span class="a-bar"><i style="width:${m}%"></i></span></span><span class="a-stars" aria-label="${ar(s)} من ٣ نجوم">${'★'.repeat(s)}<u>${'★'.repeat(3 - s)}</u></span></button>`;
}
function search(q) {
  const box = $('aRes'); q = normAr(q.trim());
  if (q.length < 2) { box.innerHTML = ''; return; }
  const hit = [];
  A.countries.forEach(c => { if (normAr(c.ar).includes(q) || c.en.toLowerCase().includes(q)) hit.push({ id: c.id, t: c.ar, s: 'دولة', go: 'c-' + c.id, c });
    else if (c.cap && (normAr(c.cap.ar).includes(q) || c.cap.en.toLowerCase().includes(q))) hit.push({ id: c.id, t: c.cap.ar, s: 'عاصمة ' + c.ar, go: 'c-' + c.id, c }); });
  A.phys.forEach(p => { if (normAr(p.ar).includes(q) || p.en.toLowerCase().includes(q)) hit.push({ id: p.id, t: p.ar, s: A.kinds[p.k], go: 'f-' + p.id }); });
  A.conts.forEach(p => { if (normAr(p.ar).includes(q)) hit.push({ id: p.id, t: p.ar, s: 'قارة', go: 'c-' + p.id }); });
  box.innerHTML = hit.slice(0, 8).map(h => `<button type="button" class="a-hit" data-go="${h.go}" role="listitem">${h.c ? flagImg(h.c) : ''}<b>${esc(h.t)}</b><small>${esc(h.s)}</small></button>`).join('') || '<p class="a-none">لم أجد شيئًا بهذا الاسم.</p>';
}

/* ---------- free map ---------- */
function freeMap() {
  const st = D().mapOpt || (D().mapOpt = { caps: false, phys: false });
  M().innerHTML = `<div class="a-mapbar"><button type="button" class="a-chip ${st.caps ? 'on' : ''}" data-opt="caps" aria-pressed="${st.caps}">🏛️ العواصم</button>
      <button type="button" class="a-chip ${st.phys ? 'on' : ''}" data-opt="phys" aria-pressed="${st.phys}">🏔️ التضاريس</button>
      <span class="a-tip">اسحب الخريطة وكبّرها، ثم المس أي مكان.</span></div>
    <div id="aMap" class="a-map big"></div><div id="aSheet" class="a-sheet" aria-live="polite"></div>`;
  const phys = st.phys ? A.phys.map(p => p.id) : [];
  mapApi = atlasMap($('aMap'), { caps: st.caps, phys, labels: 'auto', extra: st.phys ? A.phys.map(p => ({ t: p.ar, at: p.lab, cls: 'lp k-' + p.k, dy: p.p ? -14 : 0, min: p.k === 'ocean' ? 0 : 2.2 })) : [], tap: (id, k) => sheet(id, k) });
}
let sheetId = null;
function sheet(id, k) {
  const s = $('aSheet'); if (!s) return;
  if (sheetId) mapApi.mark(sheetId, false);
  if (!id || (k !== 'c' && k !== 'p')) { s.innerHTML = ''; sheetId = null; return; }
  sheetId = id; mapApi.mark(id, true); HS.fx('tap'); visit(id);
  const c = C[id], f = PH[id];
  say(c ? `${c.ar}، عاصمتها ${c.cap ? c.cap.ar : ''}` : f.ar);
  s.innerHTML = c ? `<div class="a-sh">${flagImg(c, 'mid')}<div><b>${esc(c.ar)}</b><span>العاصمة: ${esc(c.cap ? c.cap.ar : '—')} · ${esc(CT[c.c].ar)}</span></div><button type="button" class="a-btn" data-go="c-${id}">المزيد</button></div>`
    : `<div class="a-sh"><span class="a-sh-em">${kindEm(f.k)}</span><div><b>${esc(f.ar)}</b><span>${esc(A.kinds[f.k])}</span></div><button type="button" class="a-btn" data-go="f-${id}">المزيد</button></div>`;
}
const kindEm = k => ({ ocean: '🌊', sea: '🌊', peak: '🏔️', range: '⛰️', river: '🏞️', lake: '💧', desert: '🏜️', land: '🏝️', falls: '💦', cont: '🌍' })[k] || '📍';

/* ---------- country, continent and feature pages ---------- */
function countryPage(c) {
  visit(c.id);
  const nb = c.nb.map(id => `<button type="button" class="a-chip" data-go="c-${id}">${flagImg(C[id], 'sm')} ${esc(C[id].ar)}</button>`).join('');
  M().innerHTML = `<section class="a-card">
      <div class="a-card-top">${flagImg(c, 'huge')}<div><h1>${esc(c.ar)} <button type="button" class="a-spk" data-say="${esc(c.ar)}، عاصمتها ${esc(c.cap ? c.cap.ar : '')}" aria-label="استمع">🔊</button></h1>
        <p class="a-en" dir="ltr" lang="en">${esc(c.en)}</p>${c.arab ? '<span class="a-tag">دولة عربية</span>' : ''}</div></div>
      <dl class="a-facts"><div><dt>🏛️ العاصمة</dt><dd>${esc(c.cap ? c.cap.ar : '—')}</dd></div>
        <div><dt>🌍 القارة</dt><dd><button type="button" class="a-link" data-go="c-${c.c}">${esc(CT[c.c].ar)}</button></dd></div>
        ${c.pop ? `<div><dt>👪 السكان</dt><dd>${popWords(c.pop)} نسمة</dd></div>` : ''}</dl>
      ${nb ? `<h2 class="a-h3">جيرانها</h2><div class="a-chips">${nb}</div>` : c.tiny || !c.nb.length ? '<p class="a-note">ليس لها جيران على اليابسة: يحيط بها الماء.</p>' : ''}
    </section><div id="aMap" class="a-map"></div>`;
  const nbBB = [c.bb, ...c.nb.map(id => C[id].bb)].filter(b => b[2] - b[0] < A.W * 0.5);
  const fit = c.bb[2] - c.bb[0] > A.W * 0.3 ? c.bb : bbUnion(nbBB.length > 1 ? nbBB : [c.bb]);
  mapApi = atlasMap($('aMap'), { fit, caps: false, tap: (id, k) => { if (k === 'c' && id && id !== c.id) go('c-' + id); },
    labels: [...c.nb.map(id => ({ t: C[id].ar, at: C[id].lab, cls: 'lc' })), ...(c.cap ? [{ t: '★ ' + c.cap.ar, at: c.cap.p, cls: 'lcap', dy: -10 }] : [])] });
  mapApi.mark(c.id, true);
}
function contPage(t) {
  const list = A.countries.filter(c => c.c === t.id);
  M().innerHTML = `<section class="a-card"><div class="a-card-top"><span class="a-big-em">🌍</span><div><h1>${esc(t.ar)} <button type="button" class="a-spk" data-say="${esc(t.ar)}" aria-label="استمع">🔊</button></h1><p class="a-en" dir="ltr" lang="en">${esc(t.en)}</p></div></div>
    <p class="a-fact">${esc(t.fact)}</p>${list.length ? `<h2 class="a-h3">دولها (${ar(list.length)})</h2><div class="a-chips">${list.map(c => `<button type="button" class="a-chip" data-go="c-${c.id}">${flagImg(c, 'sm')} ${esc(c.ar)}</button>`).join('')}</div>` : ''}</section>
    <div id="aMap" class="a-map"></div>`;
  mapApi = atlasMap($('aMap'), { fit: t.bb, labels: 'auto', paint: id => C[id] && C[id].c === t.id ? 'ct-' + t.id : 'plain', tap: (id, k) => { if (k === 'c' && id) go('c-' + id); } });
}
function featPage(f) {
  visit(f.id);
  M().innerHTML = `<section class="a-card"><div class="a-card-top"><span class="a-big-em">${kindEm(f.k)}</span><div><h1>${esc(f.ar)} <button type="button" class="a-spk" data-say="${esc(f.ar)}" aria-label="استمع">🔊</button></h1><p class="a-en" dir="ltr" lang="en">${esc(f.en)}</p><span class="a-tag">${esc(A.kinds[f.k])}</span></div></div>
    <p class="a-fact">${esc(f.fact)}</p></section><div id="aMap" class="a-map"></div>`;
  const big = f.bb[2] - f.bb[0] > A.W * 0.8;
  mapApi = atlasMap($('aMap'), { fit: big ? [0, 0, A.W, A.H] : f.bb, phys: [f.id], labels: [{ t: f.ar, at: f.lab, cls: 'lp k-' + f.k, dy: f.p ? -14 : 0 }] });
  mapApi.mark(f.id, true);
}

/* ---------- a level (pack) ---------- */
function packPage(p) {
  const sk = skillsOf(p), cp = isCountryPack(p);
  const bar = s => `<span class="a-bar sm"><i style="width:${Math.round(mastery(p, s) * 100)}%"></i></span>`;
  M().innerHTML = `<section class="a-phead"><span class="a-pk-em big">${p.em}</span><div><h1>${esc(p.ar)}</h1><p>${ar(p.ids.length)} ${cp ? 'دولة' : 'معلمًا'} · ${'★'.repeat(stars(p))}${'☆'.repeat(3 - stars(p))}</p></div></section>
    <div class="a-modes">
      <button type="button" class="a-mode tour" data-go="g-${p.id}-tour"><b>👀</b><span>تعرّف<small>جولة مع الأسماء</small></span></button>
      <button type="button" class="a-mode" data-go="g-${p.id}-name"><b>🔤</b><span>ما اسمها؟<small>اختر الاسم الصحيح</small>${bar('l')}</span></button>
      <button type="button" class="a-mode" data-go="g-${p.id}-find"><b>📍</b><span>أين تقع؟<small>المسها على الخريطة</small>${bar('l')}</span></button>
      ${cp ? `<button type="button" class="a-mode" data-go="g-${p.id}-cap"><b>🏛️</b><span>العواصم<small>عاصمة كل دولة</small>${bar('c')}</span></button>
      <button type="button" class="a-mode" data-go="g-${p.id}-flag"><b>🚩</b><span>الأعلام<small>علم كل دولة</small>${bar('f')}</span></button>` : ''}
    </div>
    <div id="aMap" class="a-map"></div>
    <div class="a-chips list">${p.ids.map(id => `<button type="button" class="a-chip ${learned(id) ? 'got' : ''}" data-go="${C[id] || CT[id] ? 'c-' : 'f-'}${id}">${C[id] ? flagImg(C[id], 'sm') : kindEm((PH[id] || { k: 'cont' }).k)} ${esc(nameOf(id))}</button>`).join('')}</div>`;
  const phys = p.ids.filter(id => PH[id]);
  mapApi = atlasMap($('aMap'), { fit: packBB(p), phys, only: p.ids, paint: id => paintPack(p, id), labels: labelsOf(p),
    tap: (id, k) => { const t = hitPack(p, id, k); if (t) go((C[t] || CT[t] ? 'c-' : 'f-') + t); } });
}
const contOf = id => C[id] ? C[id].c : A.landc[id] || null;
function paintPack(p, id) {
  if (p.id === 'world') { const k = contOf(id); return k ? 'ct-' + k : 'plain'; }
  return p.ids.includes(id) ? 'mc' + ((C[id] || {}).mc || 1) : 'plain';
}
function labelsOf(p) { return p.ids.map(id => { const x = item(id); return { t: x.ar, at: x.lab, cls: C[id] ? 'lc' : CT[id] ? 'lct' : 'lp k-' + x.k, dy: x.p ? -14 : 0 }; }); }
/** which item of the pack a tap means (continents: any country in it; the ocean shapes: the ocean) */
function hitPack(p, id, k) {
  if (!id) return null;
  if (p.id === 'world' && (k === 'c' || k === 'x')) { const ct = contOf(id) || ((C[id] || {}).c); if (ct) return ct; return id === 'ATA' ? 'AN' : null; }
  return p.ids.includes(id) ? id : null;
}

/* ---------- games ---------- */
let G = null;
function dueKeys() {
  const all = A.packs.flatMap(p => skillsOf(p).flatMap(s => keys(p, s)));
  return HS.srs.due(NS, all);
}
function game(p, mode) {
  const quick = mode === 'quick';
  if (mode === 'tour') return tour(p);
  let qs;
  if (quick) {
    const due = dueKeys();
    const pool = due.length >= 4 ? due : A.packs.slice(0, Math.max(1, A.packs.indexOf(nextPack()) + 1)).flatMap(pk => skillsOf(pk).flatMap(s => keys(pk, s)));
    qs = HS.srs.choose(NS, pool, 8);
  } else {
    const s = mode === 'cap' ? 'c' : mode === 'flag' ? 'f' : 'l';
    qs = HS.srs.choose(NS, keys(p, s), Math.min(8, p.ids.length));
  }
  G = { p, mode, n0: qs.length, qs: qs.map(k => ({ key: k, s: k[0], id: k.slice(2), m: quick ? null : mode })), i: 0, ok: 0, tries: 0, retry: [] };
  G.qs.forEach(q => { if (!q.m) q.m = q.s === 'c' ? 'cap' : q.s === 'f' ? 'flag' : (HS.srs.box(NS, q.key) >= 2 ? 'find' : 'name'); q.p = q.p || A.packs.find(pk => pk.ids.includes(q.id)); });
  M().innerHTML = `<div class="a-game"><div class="a-ask" id="aAsk" aria-live="polite"></div><div class="a-dots" id="aDots"></div>
    <div id="aMap" class="a-map game"></div><div id="aOpts" class="a-opts"></div><div id="aFb" class="a-fb" aria-live="polite"></div></div>`;
  nextQ();
}
function dots() { $('aDots').innerHTML = G.qs.map((q, i) => `<i class="${i < G.i ? (q.good ? 'ok' : 'no') : i === G.i ? 'now' : ''}"></i>`).join(''); }
function nextQ() {
  if (G.i >= G.qs.length) return finish();
  const q = G.qs[G.i]; G.tries = 0; G.cur = q; dots(); $('aFb').innerHTML = ''; $('aOpts').innerHTML = '';
  const p = q.p, x = item(q.id), n = x.ar;
  const fit = p.id === 'world' && CT[q.id] ? [0, 0, A.W, A.H] : packBB(p);
  const phys = p.ids.filter(id => PH[id]);
  if (!mapApi || G.mapPack !== p.id) {
    G.mapPack = p.id;
    mapApi = atlasMap($('aMap'), { fit, phys, only: p.ids, labels: [], paint: id => paintPack(p, id), tap: (id, k) => tapAnswer(id, k) });
  } else { mapApi.clsAll('hl'); mapApi.clsAll('ans'); mapApi.label([]); mapApi.zoomTo(fit); }
  if (q.m === 'find') {
    $('aAsk').innerHTML = `أين <b>${esc(n)}</b>؟ <button type="button" class="a-spk" data-say="أين ${esc(n)}؟" aria-label="استمع">🔊</button><small>المسها على الخريطة</small>`;
    say('أين ' + n + '؟');
  } else {
    highlight(q.id, true);
    let ask, opts;
    if (q.m === 'name') { ask = `ما اسم ${C[q.id] ? 'هذه الدولة' : CT[q.id] ? 'هذه القارة' : 'هذا المكان'}؟`; opts = choices(q, id => esc(nameOf(id))); }
    else if (q.m === 'cap') { ask = `ما عاصمة <b>${esc(n)}</b>؟`; opts = choices(q, id => esc(C[id].cap.ar), id => C[id] && C[id].cap); }
    else { const rev = Math.random() < 0.5; q.rev = rev;
      if (rev) { ask = `أي دولة هذا علمها؟<span class="a-ask-flag">${flagImg(x, 'huge')}</span>`; opts = choices(q, id => esc(nameOf(id)), id => C[id] && C[id].flag); }
      else { ask = `ما علم <b>${esc(n)}</b>؟`; opts = choices(q, id => flagImg(C[id], 'opt'), id => C[id] && C[id].flag); } }
    $('aAsk').innerHTML = ask + ` <button type="button" class="a-spk" data-say="${esc(stripTags(ask))}" aria-label="استمع">🔊</button>`;
    $('aOpts').innerHTML = opts;
    say(stripTags(ask));
  }
}
const stripTags = s => s.replace(/<[^>]+>/g, '').trim();
function highlight(id, on) {
  if (CT[id]) { A.countries.forEach(c => { if (c.c === id) mapApi.cls(c.id, 'hl', on); }); Object.keys(A.landc).forEach(l => { if (A.landc[l] === id) mapApi.cls(l, 'hl', on); }); }
  else mapApi.cls(id, 'hl', on);
  const x = item(id);
  if (on && x && x.bb && G && G.cur && G.cur.m !== 'find' && !CT[id] && G.p && G.p.id !== 'world') {
    const pb = packBB(G.cur.p), small = (x.bb[2] - x.bb[0]) < (pb[2] - pb[0]) * 0.08;
    if (small) mapApi.zoomTo(bbUnion([x.bb, [x.bb[0] - 25, x.bb[1] - 18, x.bb[2] + 25, x.bb[3] + 18]]));
  }
}
/** 3 options (4 from the second box on): the answer and others from the same level */
function choices(q, label, ok = () => true) {
  const pool = q.p.ids.filter(id => id !== q.id && ok(id) && (!CT[q.id] || CT[id]) && (!PH[q.id] || PH[id]));
  const extra = A.countries.filter(c => c.c === (C[q.id] || {}).c && c.id !== q.id && ok(c.id)).map(c => c.id);
  const n = HS.srs.box(NS, q.key) >= 2 ? 3 : 2;
  const others = shuffle(pool).slice(0, n).concat(shuffle(extra.filter(id => !pool.includes(id)))).slice(0, n);
  return shuffle([q.id, ...others]).map(id => `<button type="button" class="a-opt" data-ans="${id}">${label(id)}</button>`).join('');
}
function tapAnswer(id, k) {
  if (!G || !G.cur || G.cur.done || G.cur.m !== 'find') return;
  const q = G.cur, t = hitPack(q.p, id, k);
  if (!id || k === 'w' && !t) return;
  if (t === q.id) return mark(true);
  G.tries++; HS.fx('no');
  const what = t || id;
  if (item(what)) { highlight(what, true); setTimeout(() => G && G.cur === q && highlight(what, false), 1100); }
  $('aFb').innerHTML = `<div class="bad">${item(what) ? `هذه <b>${esc(nameOf(what))}</b>. ` : ''}${G.tries >= 2 ? 'انظر أين هي:' : 'حاول مرة أخرى.'}</div>`;
  if (G.tries >= 2) { highlight(q.id, true); mapApi.cls(q.id, 'ans', true); mark(false); }
}
function mark(good) {
  const q = G.cur; if (q.done) return; q.done = true;
  const first = good && G.tries === 0;
  q.good = first; HS.srs.record(NS, q.key, first); visit(q.id);
  if (first) { if (G.i < G.n0) G.ok++; HS.addStars(1); HS.fx('ok'); } else if (!good) G.retry.push(q);
  const x = item(q.id), c = C[q.id];
  highlight(q.id, true); mapApi.cls(q.id, good ? 'got' : 'ans', true);
  mapApi.label([{ t: x.ar, at: x.lab, cls: (c ? 'lc' : CT[q.id] ? 'lct' : 'lp k-' + x.k) + ' big', dy: x.p ? -14 : 0 }, ...(c && c.cap && q.m === 'cap' ? [{ t: '★ ' + c.cap.ar, at: c.cap.p, cls: 'lcap', dy: 12 }] : [])]);
  const line = c ? `${c.ar}${c.cap ? '، عاصمتها ' + c.cap.ar : ''}` : x.ar;
  $('aFb').innerHTML = `<div class="${first ? 'good' : 'bad'}">${first ? HS.one(['🎉 أحسنت!', '🌟 رائع!', '👏 ممتاز!']) : good ? '👍 صحيح بعد محاولة.' : '✋ هذه هي:'} <b>${esc(line)}</b>${c ? flagImg(c, 'mid') : ''}</div>
    <button type="button" class="a-btn" id="aNext">التالي ←</button>`;
  HS.speak(first ? [[HS.one(['أحسنت', 'رائع', 'ممتاز']), 'ar'], [line, 'ar']] : [[line, 'ar']]);
  $('aNext').focus({ preventScroll: true });
}
function pickAnswer(btn) {
  const q = G.cur; if (!q || q.done) return;
  const ok = btn.dataset.ans === q.id;
  if (ok) { btn.classList.add('ok'); M().querySelectorAll('.a-opt').forEach(b => b.disabled = true); return mark(true); }
  G.tries++; btn.classList.add('no'); btn.disabled = true; HS.fx('no');
  if (G.tries >= 2) { M().querySelectorAll('.a-opt').forEach(b => { b.disabled = true; if (b.dataset.ans === q.id) b.classList.add('ok'); }); mark(false); }
  else $('aFb').innerHTML = '<div class="bad">حاول مرة أخرى.</div>';
}
function finish() {
  if (G.retry.length && !G.retried) { G.retried = true; G.qs = G.qs.concat(G.retry.map(q => ({ key: q.key, s: q.s, id: q.id, m: q.m === 'find' ? 'name' : q.m, p: q.p }))); G.retry = []; return nextQ(); }
  const n = G.n0, s = G.p ? stars(G.p) : 0;
  HS.fx('win'); if (G.ok >= n * 0.8) HS.party && HS.party();
  M().innerHTML = `<section class="a-done"><div class="a-done-em">${G.ok >= n * 0.8 ? '🏆' : '🌍'}</div><h1>${G.ok >= n * 0.8 ? 'رحلة رائعة!' : 'أحسنت المحاولة!'}</h1>
    <p>أجبت ${ar(G.ok)} من ${ar(n)} من أول محاولة.</p>${G.p ? `<p class="a-stars big">${'★'.repeat(s)}<u>${'★'.repeat(3 - s)}</u></p>` : ''}
    <div class="a-acts">${G.p ? `<button type="button" class="a-act" data-go="g-${G.p.id}-${G.mode}"><b>🔁</b><span>مرة أخرى</span></button><button type="button" class="a-act" data-go="p-${G.p.id}"><b>${G.p.em}</b><span>${esc(G.p.ar)}</span></button>` : `<button type="button" class="a-act" data-go="quick"><b>🎯</b><span>تحدٍّ آخر</span></button>`}
      <button type="button" class="a-act" data-go=""><b>🗺️</b><span>الأطلس</span></button></div></section>`;
  G = null;
}

/* ---------- guided tour: names on, one place at a time ---------- */
function tour(p) {
  G = { p, mode: 'tour', i: 0, ids: p.ids.slice() };
  M().innerHTML = `<div class="a-game"><div id="aMap" class="a-map game"></div><div id="aTour" class="a-tour" aria-live="polite"></div></div>`;
  const phys = p.ids.filter(id => PH[id]);
  mapApi = atlasMap($('aMap'), { fit: packBB(p), phys, only: p.ids, labels: labelsOf(p), paint: id => paintPack(p, id), tap: (id, k) => { const t = hitPack(p, id, k); if (t) { G.i = G.ids.indexOf(t); tourStep(); } } });
  tourStep();
}
function tourStep() {
  const id = G.ids[G.i], x = item(id), c = C[id];
  mapApi.clsAll('hl'); highlight(id, true); visit(id);
  if (!CT[id] && x.bb && G.p.id !== 'world') { const pb = packBB(G.p), small = (x.bb[2] - x.bb[0]) < (pb[2] - pb[0]) * 0.15; mapApi.zoomTo(small ? [x.bb[0] - 30, x.bb[1] - 20, x.bb[2] + 30, x.bb[3] + 20] : pb); }
  const line = c ? `${c.ar}، عاصمتها ${c.cap ? c.cap.ar : ''}` : x.ar;
  $('aTour').innerHTML = `<div class="a-tcard">${c ? flagImg(c, 'mid') : `<span class="a-sh-em">${CT[id] ? '🌍' : kindEm(x.k)}</span>`}<div><b>${esc(x.ar)}</b>
      <span>${c ? `العاصمة: ${esc(c.cap ? c.cap.ar : '—')}` : esc(x.fact || '')}</span></div><button type="button" class="a-spk" data-say="${esc(line)}" aria-label="استمع">🔊</button></div>
    <div class="a-tnav"><button type="button" class="a-btn ghost" id="aPrev" ${G.i ? '' : 'disabled'}>→ السابق</button><span>${ar(G.i + 1)} / ${ar(G.ids.length)}</span>
      ${G.i < G.ids.length - 1 ? '<button type="button" class="a-btn" id="aNx">التالي ←</button>' : `<button type="button" class="a-btn" data-go="g-${G.p.id}-name">🎯 اختبر نفسك</button>`}</div>`;
  say(line);
}

/* ---------- passport ---------- */
function passport() {
  const d = D(), seen = A.countries.filter(c => d.seen[c.id]).length, got = A.countries.filter(c => learned(c.id)).length;
  M().innerHTML = `<section class="a-phead"><span class="a-pk-em big">🛂</span><div><h1>جواز سفري</h1><p>زرت ${ar(seen)} دولة من ${ar(A.countries.length)} · أتقنت ${ar(got)}</p></div></section>
    <div id="aMap" class="a-map"></div><p class="a-note">الدول الملوّنة أتقنتها: تعرف مكانها وعاصمتها وعلمها. الختم الذهبي للدولة المتقنة.</p>
    ${A.conts.filter(t => t.id !== 'AN').map(t => `<h2 class="a-h3">${esc(t.ar)}</h2><div class="a-stamps">${A.countries.filter(c => c.c === t.id).map(c => `<button type="button" class="a-stamp ${learned(c.id) ? 'gold' : d.seen[c.id] ? 'seen' : ''}" data-go="c-${c.id}">${flagImg(c)}<span>${esc(c.ar)}</span></button>`).join('')}</div>`).join('')}`;
  mapApi = atlasMap($('aMap'), { labels: 'none', paint: id => learned(id) ? contClass(id) + ' got' : d.seen[id] ? 'seen' : 'plain', tap: (id, k) => { if (k === 'c' && id) go('c-' + id); } });
}

/* ---------- events ---------- */
ROOT.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t || !ROOT.contains(t)) return;
  const ds = t.dataset;
  if (ds.say) { e.stopPropagation(); return say(ds.say); }
  if (ds.go !== undefined) { HS.fx('tap'); return go(ds.go); }
  if (ds.ans) return pickAnswer(t);
  if (ds.opt) { const st = D().mapOpt; st[ds.opt] = !st[ds.opt]; HS.save(); return freeMap(); }
  if (t.id === 'aNext' && G) { G.i++; return nextQ(); }
  if (t.id === 'aNx' && G) { G.i = Math.min(G.ids.length - 1, G.i + 1); return tourStep(); }
  if (t.id === 'aPrev' && G) { G.i = Math.max(0, G.i - 1); return tourStep(); }
});
ROOT.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'aQ') { const b = $('aRes').querySelector('[data-go]'); if (b) b.click(); }
});

APPS.atlas = {
  open(sub) { show(sub || ''); window.scrollTo(0, 0); },
  nav: chainFor,
  close() { HS.stopSpeak(); G = null; mapApi = null; },
  /** parent page: places visited and learned, accuracy */
  report(pid) {
    const d = HS.data(NS, pid), s = d.srs || {}, ks = Object.keys(s);
    const c = ks.reduce((a, k) => a + s[k].c, 0), w = ks.reduce((a, k) => a + s[k].w, 0);
    return { seen: Object.keys(d.seen || {}).length, learned: ks.filter(k => s[k].b >= 3).length, acc: c + w ? c / (c + w) : 0, total: A.countries.length };
  }
};
