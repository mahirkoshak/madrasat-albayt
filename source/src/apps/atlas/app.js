/* ============================================================
   WORLD ATLAS (أطلس العالم / World Atlas) – countries, capitals, flags, continents, oceans, seas, mountains, rivers, deserts.
   Two languages: Arabic (right to left) and English (left to right); the switch is on the atlas home page and is saved
   per child. Progress is shared: knowing where Egypt is counts in both languages.
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
const esc = HS.esc;
const M = () => $('aMain');
const C = Object.fromEntries(A.countries.map(c => [c.id, c]));
const PH = Object.fromEntries(A.phys.map(p => [p.id, p]));
const CT = Object.fromEntries(A.conts.map(c => [c.id, c]));
const PK = Object.fromEntries(A.packs.map(p => [p.id, p]));
const NS = 'atlas';

/* pictures in place of emoji: every emoji the atlas shows that has a fitting drawing is swapped for it after each
   render (the emoji stays as the fallback). Picked by hand so a symbol never turns into an unrelated word picture. */
const EM_ART = {
  '🐪': 'dict-camel', '🌿': 'dict-olive', '🏜️': 'dict-desert', '⛰️': 'dict-mountain', '🏯': 'dict-palace',
  '🌴': 'dict-palm-tree', '🦁': 'dict-lion', '🦓': 'dict-zebra', '🏰': 'dict-castle', '❄️': 'dict-snow',
  '🦅': 'dict-eagle', '🏝️': 'dict-island', '🦜': 'dict-parrot', '🦘': 'dict-kangaroo', '🐘': 'dict-elephant',
  '🌍': 'dict-world', '🌊': 'dict-sea', '🏔️': 'dict-mountain', '🏞️': 'dict-river', '💧': 'dict-lake',
  '💦': 'dict-waterfall', '🌋': 'dict-volcano', '🏛️': 'dict-capital', '👪': 'dict-people', '🗺️': 'dict-map',
  '🎯': 'goal-flag', '🛂': 'dict-travel', '👀': 'dict-look', '🔤': 'dict-alphabet', '🚩': 'goal-flag',
  '🎉': 'mascot-cheer', '🏆': 'badge-champion-earned', '🔁': 'dict-repeat', '🔍': 'dict-find', '👍': 'dict-good',
  '✋': 'dict-hand', '📍': 'dict-map',
};
const EM_RE = new RegExp(Object.keys(EM_ART).sort((a, b) => b.length - a.length).map(e => e.replace(/️/g, '') + '️?').join('|'), 'gu');
const emArt = em => { const id = EM_ART[em] || EM_ART[em + '️'] || EM_ART[em.replace(/️/g, '')]; return HS.hasArt(id) ? id : null; };
function swapEmoji(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
  for (let n; (n = w.nextNode());) {
    const v = n.nodeValue; if (!v || !/\p{Extended_Pictographic}/u.test(v)) continue;
    const el = n.parentElement; if (!el || el.closest('svg,input,textarea,option,title,[data-nopic],.a-spk,.a-map')) continue;
    EM_RE.lastIndex = 0; if (!EM_RE.test(v)) continue;
    todo.push(n);
  }
  todo.forEach(n => {
    const v = n.nodeValue, alone = v.trim().length <= 3 && !/[\p{L}\p{N}]/u.test(v);
    const html = HS.esc(v).replace(EM_RE, em => { const id = emArt(em); return id ? HS.art(id, { small: true, eager: true, fb: em, cls: 'hs-pic a-pic' + (alone ? '' : ' inl') }) : em; });
    const t = document.createElement('template'); t.innerHTML = html; n.replaceWith(t.content);
  });
}
let swapQ = 0;
new MutationObserver(() => { if (!swapQ) swapQ = requestAnimationFrame(() => { swapQ = 0; swapEmoji(ROOT); }); }).observe(ROOT, { childList: true, subtree: true, characterData: true });

const D = () => { const d = HS.data(NS); d.seen = d.seen || {}; d.lang = d.lang || 'ar'; return d; };

/* ---------- language ---------- */
const EN = () => D().lang === 'en';
const L = (a, e) => EN() ? e : a;
const N = n => EN() ? String(n) : HS.toAr(n);
const item = id => C[id] || PH[id] || CT[id];
const nm = x => x ? (EN() ? x.en : x.ar) : '';
const nameOf = id => nm(item(id)) || id;
const capN = c => c && c.cap ? (EN() ? c.cap.en : c.cap.ar) : '—';
const factOf = x => x ? (EN() ? x.fact_en : x.fact) || '' : '';
const kindN = k => (EN() ? A.kinds_en : A.kinds)[k] || '';
const contN = c => nm(CT[c]);
const say = t => HS.speak([[t, EN() ? 'en' : 'ar']]);
const lineOf = id => { const c = C[id], x = item(id); return c ? L(`${c.ar}، عاصمتها ${c.cap ? c.cap.ar : ''}`, `${c.en}. The capital is ${c.cap ? c.cap.en : ''}.`) : nm(x); };
const flagImg = (c, cls = '') => c && c.flag ? `<img class="a-flag ${cls}" src="assets/flags/${c.flag}.svg" alt="${esc(L('علم ' + c.ar, 'Flag of ' + c.en))}" loading="lazy" decoding="async">` : '';
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const stripH = s => s.replace(/[ً-ْـ]/g, '');
const normAr = s => stripH(s).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
const popWords = n => {
  if (!n) return '';
  const [v, ua, ue] = n >= 1e9 ? [(n / 1e9).toFixed(1).replace(/\.0$/, ''), 'مليار', 'billion'] : n >= 1e6 ? [Math.round(n / 1e6), 'مليون', 'million'] : n >= 1e3 ? [Math.round(n / 1e3), 'ألف', 'thousand'] : [n, '', ''];
  return L(`حوالي ${HS.toAr(v)} ${ua} نسمة`, `about ${v} ${ue} people`);
};
const countN = (n, cp) => cp ? L(`${HS.toAr(n)} دولة`, `${n} ${n === 1 ? 'country' : 'countries'}`) : L(`${HS.toAr(n)} معلمًا`, `${n} places`);

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
const starRow = (s, cls = '') => `<span class="a-stars ${cls}" aria-label="${esc(L(`${HS.toAr(s)} من ٣ نجوم`, `${s} of 3 stars`))}">${'★'.repeat(s)}<u>${'★'.repeat(3 - s)}</u></span>`;
const nextPack = () => A.packs.find(p => stars(p) < 3) || A.packs[0];
const packBB = p => p.id === 'world' ? [0, 0, A.W, A.H] : bbUnion(p.ids.map(id => (item(id) || {}).bb).filter(Boolean).filter(b => b[2] - b[0] < A.W * 0.9));
const learned = id => C[id] ? ['l', 'c', 'f'].every(s => HS.srs.box(NS, s + ':' + id) >= 3) : HS.srs.box(NS, 'l:' + id) >= 3;
function visit(id) { const d = D(); if (!d.seen[id]) { d.seen[id] = Date.now(); HS.save(); } }
function contClass(id) { const c = C[id]; return c ? 'ct-' + c.c : ''; }
const contOf = id => C[id] ? C[id].c : A.landc[id] || null;

/* ---------- routes ---------- */
const R = sub => 'app-atlas' + (sub ? '-' + sub : '');
function go(sub) { HS.nav.go(R(sub)); }
let mapApi = null;
function show(sub) {
  HS.stopSpeak(); mapApi = null; let m;
  const main = M(); main.dir = EN() ? 'ltr' : 'rtl'; main.lang = EN() ? 'en' : 'ar';
  if (!sub) return home();
  if (sub === 'map') return freeMap();
  if ((m = /^map-([\w-]+)$/.exec(sub)) && item(m[1])) return freeMap(m[1]);
  if (sub === 'passport') return passport();
  if (sub === 'quick') return game(null, 'quick');
  if ((m = /^p-(\w+)$/.exec(sub)) && PK[m[1]]) return packPage(PK[m[1]]);
  if ((m = /^g-(\w+)-(\w+)$/.exec(sub)) && PK[m[1]]) return game(PK[m[1]], m[2]);
  if ((m = /^c-(\w+)$/.exec(sub)) && (C[m[1]] || CT[m[1]])) return C[m[1]] ? countryPage(C[m[1]]) : contPage(CT[m[1]]);
  if ((m = /^f-([\w-]+)$/.exec(sub)) && PH[m[1]]) return featPage(PH[m[1]]);
  return home();
}
const MODES = () => ({ tour: L('تعرّف', 'Explore'), find: L('أين تقع؟', 'Where is it?'), name: L('ما اسمها؟', "What's it called?"), cap: L('العواصم', 'Capitals'), flag: L('الأعلام', 'Flags'), quick: L('تحدٍّ سريع', 'Quick challenge') });
function chainFor(sub) {
  let m;
  if (!sub) return [];
  if (sub === 'map' || sub.startsWith('map-')) return [{ route: R(sub), title: L('الخريطة', 'Map') }];
  if (sub === 'passport') return [{ route: R(sub), title: L('جواز سفري', 'My passport') }];
  if (sub === 'quick') return [{ route: R(sub), title: MODES().quick, focus: true }];
  if ((m = /^p-(\w+)$/.exec(sub)) && PK[m[1]]) return [{ route: R(sub), title: nm(PK[m[1]]) }];
  if ((m = /^g-(\w+)-(\w+)$/.exec(sub)) && PK[m[1]]) return [{ route: R('p-' + m[1]), title: nm(PK[m[1]]) }, { route: R(sub), title: MODES()[m[2]] || '', focus: m[2] !== 'tour' }];
  if ((m = /^[cf]-([\w-]+)$/.exec(sub)) && item(m[1])) { const pk = packOf(m[1]); return [...(pk ? [{ route: R('p-' + pk.id), title: nm(pk) }] : []), { route: R(sub), title: nameOf(m[1]) }]; }
  return [];
}

/* ---------- home ---------- */
function dayPick() { const t = A.countries, d = new Date(), n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate(); return t[(n * 7919) % t.length]; }
function home() {
  const nx = nextPack(), cd = dayPick(), seen = Object.keys(D().seen).filter(id => C[id]).length;
  const due = dueKeys().length;
  M().innerHTML = `<div class="a-lang" role="group" aria-label="Language / اللغة"><button type="button" class="a-chip ${EN() ? '' : 'on'}" data-lang="ar" aria-pressed="${!EN()}" lang="ar">عربي</button><button type="button" class="a-chip ${EN() ? 'on' : ''}" data-lang="en" aria-pressed="${EN()}" lang="en">English</button></div>
    <section class="a-hero">
      <div class="a-hero-tx"><h1>${L('أطلس العالم', 'World Atlas')}</h1><p>${L('القارات والمحيطات والدول والعواصم والأعلام والجبال والأنهار.', 'Continents, oceans, countries, capitals, flags, mountains and rivers.')}</p>
        <label class="a-search"><span aria-hidden="true">🔍</span><input id="aQ" type="search" placeholder="${L('ابحث عن دولة أو عاصمة أو بحر…', 'Search for a country, capital or sea…')}" aria-label="${L('ابحث في الأطلس', 'Search the atlas')}" autocomplete="off"></label>
        <div id="aRes" class="a-res" role="list"></div></div>
      <button type="button" class="a-hero-map" data-go="map" aria-label="${L('افتح الخريطة', 'Open the map')}"><div id="aMini" class="a-mini"></div><span class="a-hero-cta">🗺️ ${L('افتح الخريطة', 'Open the map')}</span></button>
    </section>
    <div class="a-acts">
      <button type="button" class="a-act" data-go="p-${nx.id}"><b>${nx.em}</b><span>${L('تابع', 'Next')}: ${esc(nm(nx))}</span></button>
      <button type="button" class="a-act" data-go="quick"><b>🎯</b><span>${MODES().quick}${due ? ` <i>${N(due)}</i>` : ''}</span></button>
      <button type="button" class="a-act" data-go="passport"><b>🛂</b><span>${L('جواز سفري', 'My passport')} <i>${N(seen)}</i></span></button>
    </div>
    <button type="button" class="a-day" data-go="c-${cd.id}">${flagImg(cd, 'big')}<span><small>${L('دولة اليوم', 'Country of the day')}</small><b>${esc(nm(cd))}</b><span>${L('العاصمة', 'Capital')}: ${esc(capN(cd))} · ${esc(contN(cd.c))}</span></span></button>
    <h2 class="a-h2">${L('المستويات', 'Levels')}</h2>
    <div class="a-packs">${A.packs.map((p, i) => packCard(p, i, p === nx)).join('')}</div>`;
  atlasMap($('aMini'), { labels: 'none', only: [], paint: id => learned(id) ? contClass(id) + ' got' : D().seen[id] ? 'seen' : 'plain' });
  const z = $('aMini').querySelector('.am-zoom'); if (z) z.remove();
  const q = $('aQ'); q.oninput = () => search(q.value);
}
function packCard(p, i, next) {
  const m = Math.round(skillsOf(p).reduce((a, k) => a + mastery(p, k), 0) / skillsOf(p).length * 100);
  return `<button type="button" class="a-pack ${next ? 'next' : ''}" data-go="p-${p.id}"><span class="a-pk-em">${p.em}</span>
    <span class="a-pk-tx"><b>${N(i + 1)}. ${esc(nm(p))}</b><small>${countN(p.ids.length, isCountryPack(p))}${next ? ` · <em>${L('ابدأ هنا', 'Start here')}</em>` : ''}</small>
    <span class="a-bar"><i style="width:${m}%"></i></span></span>${starRow(stars(p))}</button>`;
}
function search(q) {
  const box = $('aRes'); q = normAr(q.trim());
  if (q.length < 2) { box.innerHTML = ''; return; }
  const hit = [];
  A.countries.forEach(c => { if (normAr(c.ar).includes(q) || c.en.toLowerCase().includes(q)) hit.push({ t: nm(c), s: L('دولة', 'Country'), go: 'c-' + c.id, c });
    else if (c.cap && (normAr(c.cap.ar).includes(q) || c.cap.en.toLowerCase().includes(q))) hit.push({ t: capN(c), s: L('عاصمة ' + c.ar, 'Capital of ' + c.en), go: 'c-' + c.id, c }); });
  A.phys.forEach(p => { if (normAr(p.ar).includes(q) || p.en.toLowerCase().includes(q)) hit.push({ t: nm(p), s: kindN(p.k), go: 'f-' + p.id }); });
  A.conts.forEach(p => { if (normAr(p.ar).includes(q) || p.en.toLowerCase().includes(q)) hit.push({ t: nm(p), s: kindN('cont'), go: 'c-' + p.id }); });
  box.innerHTML = hit.slice(0, 8).map(h => `<button type="button" class="a-hit" data-go="${h.go}" role="listitem">${h.c ? flagImg(h.c) : ''}<b>${esc(h.t)}</b><small>${esc(h.s)}</small></button>`).join('') || `<p class="a-none">${L('لم أجد شيئًا بهذا الاسم.', 'Nothing found with that name.')}</p>`;
}

/* ---------- free map ---------- */
function freeMap(focus) {
  const st = D().mapOpt || (D().mapOpt = { caps: false, phys: false });
  M().innerHTML = `<div class="a-mapbar"><button type="button" class="a-chip ${st.caps ? 'on' : ''}" data-opt="caps" aria-pressed="${st.caps}">🏛️ ${L('العواصم', 'Capitals')}</button>
      <button type="button" class="a-chip ${st.phys ? 'on' : ''}" data-opt="phys" aria-pressed="${st.phys}">🏔️ ${L('التضاريس', 'Landforms')}</button>
      <span class="a-tip">${L('اسحب الخريطة وكبّرها، ثم المس أي مكان.', 'Drag and zoom the map, then tap any place.')}</span></div>
    <div id="aMap" class="a-map big"></div><div id="aSheet" class="a-sheet" aria-live="polite"></div>`;
  const phys = st.phys ? A.phys.map(p => p.id) : [];
  const fx = focus && item(focus), fit = fx ? (CT[focus] ? fx.bb : [fx.bb[0] - 40, fx.bb[1] - 28, fx.bb[2] + 40, fx.bb[3] + 28]) : undefined;
  if (focus && PH[focus] && !phys.includes(focus)) phys.push(focus);
  mapApi = atlasMap($('aMap'), { fit, caps: st.caps, phys, labels: 'auto', extra: st.phys ? A.phys.map(p => ({ t: nm(p), at: p.lab, cls: 'lp k-' + p.k, dy: p.p ? -14 : 0, min: p.k === 'ocean' ? 0 : 2.2 })) : [], tap: (id, k) => sheet(id, k) });
  if (fx && !CT[focus]) sheet(focus, C[focus] ? 'c' : 'p', true);
}
let sheetId = null;
function sheet(id, k, quiet) {
  const s = $('aSheet'); if (!s) return;
  if (sheetId) mapApi.mark(sheetId, false);
  if (!id || (k !== 'c' && k !== 'p')) { s.innerHTML = ''; sheetId = null; return; }
  sheetId = id; mapApi.mark(id, true); if (!quiet) HS.fx('tap'); visit(id);
  const c = C[id], f = PH[id];
  if (!quiet) say(lineOf(id));
  s.innerHTML = c ? `<div class="a-sh">${flagImg(c, 'mid')}<div><b>${esc(nm(c))}</b><span>${L('العاصمة', 'Capital')}: ${esc(capN(c))} · ${esc(contN(c.c))}</span></div><button type="button" class="a-btn" data-go="c-${id}">${L('المزيد', 'More')}</button></div>`
    : `<div class="a-sh"><span class="a-sh-em">${kindEm(f.k)}</span><div><b>${esc(nm(f))}</b><span>${esc(kindN(f.k))}</span></div><button type="button" class="a-btn" data-go="f-${id}">${L('المزيد', 'More')}</button></div>`;
}
const kindEm = k => ({ ocean: '🌊', sea: '🌊', peak: '🏔️', range: '⛰️', river: '🏞️', lake: '💧', desert: '🏜️', land: '🏝️', falls: '💦', cont: '🌍' })[k] || '📍';
const spk = t => `<button type="button" class="a-spk" data-say="${esc(t)}" aria-label="${L('استمع', 'Listen')}">🔊</button>`;
const other = x => `<p class="a-en" dir="${EN() ? 'rtl' : 'ltr'}" lang="${EN() ? 'ar' : 'en'}">${esc(EN() ? x.ar : x.en)}</p>`;

/* ---------- moving between places: previous / next in the same level, the level, the big map ---------- */
const packOf = id => A.packs.find(p => p.ids.includes(id));
const pageOf = id => (C[id] || CT[id] ? 'c-' : 'f-') + id;
function placeNav(id) {
  const pk = packOf(id); if (!pk) return '';
  const i = pk.ids.indexOf(id), prev = pk.ids[(i - 1 + pk.ids.length) % pk.ids.length], next = pk.ids[(i + 1) % pk.ids.length];
  return `<nav class="a-pnav" aria-label="${L('التنقّل بين الأماكن', 'Move between places')}">
    <button type="button" class="a-btn ghost" data-go="${pageOf(prev)}" data-key="prev" aria-label="${esc(L('السابق: ', 'Previous: ') + nameOf(prev))}">${L('→', '←')} <span>${esc(nameOf(prev))}</span></button>
    <span class="a-pnav-mid"><button type="button" class="a-chip" data-go="p-${pk.id}">${pk.em} ${esc(nm(pk))} <small>${N(i + 1)}/${N(pk.ids.length)}</small></button>
      <button type="button" class="a-chip" data-go="map-${id}">🗺️ ${L('على الخريطة الكبيرة', 'On the big map')}</button></span>
    <button type="button" class="a-btn" data-go="${pageOf(next)}" data-key="next" aria-label="${esc(L('التالي: ', 'Next: ') + nameOf(next))}"><span>${esc(nameOf(next))}</span> ${L('←', '→')}</button></nav>`;
}

/** the map, and right under it the way on: previous · the level · the big map · next (the details card follows) */
const mapCol = id => `<div class="a-place-map"><div id="aMap" class="a-map"></div>${placeNav(id)}</div>`;

/* ---------- country, continent and feature pages ----------
   Layout (map apps such as Google Maps and Apple Maps): the map first, the controls next to it, the details card after.
   The buttons stay between the map and the card on every screen size. */
function countryPage(c) {
  visit(c.id);
  const nb = c.nb.map(id => `<button type="button" class="a-chip" data-go="c-${id}">${flagImg(C[id], 'sm')} ${esc(nm(C[id]))}</button>`).join('');
  M().innerHTML = `<div class="a-place">${mapCol(c.id)}<section class="a-card">
      <div class="a-card-top">${flagImg(c, 'huge')}<div><h1>${esc(nm(c))} ${spk(lineOf(c.id))}</h1>
        ${other(c)}${c.arab ? `<span class="a-tag">${L('دولة عربية', 'Arab country')}</span>` : ''}</div></div>
      <dl class="a-facts"><div><dt>🏛️ ${L('العاصمة', 'Capital')}</dt><dd>${esc(capN(c))}</dd></div>
        <div><dt>🌍 ${L('القارة', 'Continent')}</dt><dd><button type="button" class="a-link" data-go="c-${c.c}">${esc(contN(c.c))}</button></dd></div>
        ${c.pop ? `<div><dt>👪 ${L('السكان', 'Population')}</dt><dd>${popWords(c.pop)}</dd></div>` : ''}</dl>
      ${nb ? `<h2 class="a-h3">${L('جيرانها', 'Neighbours')}</h2><div class="a-chips">${nb}</div>` : `<p class="a-note">${L('ليس لها جيران على اليابسة: يحيط بها الماء.', 'No neighbours on land: it is surrounded by water.')}</p>`}
    </section></div>`;
  const nbBB = [c.bb, ...c.nb.map(id => C[id].bb)].filter(b => b[2] - b[0] < A.W * 0.5);
  const fit = c.bb[2] - c.bb[0] > A.W * 0.3 ? c.bb : bbUnion(nbBB.length > 1 ? nbBB : [c.bb]);
  mapApi = atlasMap($('aMap'), { fit, tap: (id, k) => { if (k === 'c' && id && id !== c.id) go('c-' + id); },
    labels: [...c.nb.map(id => ({ t: nm(C[id]), at: C[id].lab, cls: 'lc' })), { t: nm(c), at: c.lab, cls: 'lc big', dy: c.cap ? 22 : 0 }, ...(c.cap ? [{ t: '★ ' + capN(c), at: c.cap.p, cls: 'lcap', dy: -14 }] : [])] });
  mapApi.mark(c.id, true);
}
function contPage(t) {
  const list = A.countries.filter(c => c.c === t.id);
  M().innerHTML = `<div class="a-place">${mapCol(t.id)}<section class="a-card"><div class="a-card-top"><span class="a-big-em">🌍</span><div><h1>${esc(nm(t))} ${spk(nm(t))}</h1>${other(t)}</div></div>
    <p class="a-fact">${esc(factOf(t))}</p>${list.length ? `<h2 class="a-h3">${L('دولها', 'Its countries')} (${N(list.length)})</h2><div class="a-chips">${list.map(c => `<button type="button" class="a-chip" data-go="c-${c.id}">${flagImg(c, 'sm')} ${esc(nm(c))}</button>`).join('')}</div>` : ''}</section></div>`;
  mapApi = atlasMap($('aMap'), { fit: t.bb, labels: 'auto', paint: id => contOf(id) === t.id ? 'ct-' + t.id : 'plain', tap: (id, k) => { if (k === 'c' && id) go('c-' + id); } });
}
function featPage(f) {
  visit(f.id);
  M().innerHTML = `<div class="a-place">${mapCol(f.id)}<section class="a-card"><div class="a-card-top"><span class="a-big-em">${kindEm(f.k)}</span><div><h1>${esc(nm(f))} ${spk(nm(f))}</h1>${other(f)}<span class="a-tag">${esc(kindN(f.k))}</span></div></div>
    <p class="a-fact">${esc(factOf(f))}</p></section></div>`;
  const big = f.bb[2] - f.bb[0] > A.W * 0.8;
  mapApi = atlasMap($('aMap'), { fit: big ? [0, 0, A.W, A.H] : f.bb, phys: [f.id], labels: [{ t: nm(f), at: f.lab, cls: 'lp big k-' + f.k, dy: f.p ? -14 : 0 }] });
  mapApi.mark(f.id, true);
}

/* ---------- a level (pack) ---------- */
function packPage(p) {
  const cp = isCountryPack(p);
  const bar = s => `<span class="a-bar sm"><i style="width:${Math.round(mastery(p, s) * 100)}%"></i></span>`;
  M().innerHTML = `<section class="a-phead"><span class="a-pk-em big">${p.em}</span><div><h1>${esc(nm(p))}</h1><p>${countN(p.ids.length, cp)} ${starRow(stars(p), 'sm')}</p></div></section>
    <div id="aMap" class="a-map"></div>
    <div class="a-modes">
      <button type="button" class="a-mode tour" data-go="g-${p.id}-tour"><b>👀</b><span>${MODES().tour}<small>${L('جولة مع الأسماء', 'A tour with the names')}</small></span></button>
      <button type="button" class="a-mode" data-go="g-${p.id}-name"><b>🔤</b><span>${MODES().name}<small>${L('اختر الاسم الصحيح', 'Pick the right name')}</small>${bar('l')}</span></button>
      <button type="button" class="a-mode" data-go="g-${p.id}-find"><b>📍</b><span>${MODES().find}<small>${L('المسها على الخريطة', 'Tap it on the map')}</small>${bar('l')}</span></button>
      ${cp ? `<button type="button" class="a-mode" data-go="g-${p.id}-cap"><b>🏛️</b><span>${MODES().cap}<small>${L('عاصمة كل دولة', 'The capital of each country')}</small>${bar('c')}</span></button>
      <button type="button" class="a-mode" data-go="g-${p.id}-flag"><b>🚩</b><span>${MODES().flag}<small>${L('علم كل دولة', 'The flag of each country')}</small>${bar('f')}</span></button>` : ''}
    </div>
    <div class="a-chips list">${p.ids.map(id => `<button type="button" class="a-chip ${learned(id) ? 'got' : ''}" data-go="${C[id] || CT[id] ? 'c-' : 'f-'}${id}">${C[id] ? flagImg(C[id], 'sm') : kindEm((PH[id] || { k: 'cont' }).k)} ${esc(nameOf(id))}</button>`).join('')}</div>`;
  const phys = p.ids.filter(id => PH[id]);
  mapApi = atlasMap($('aMap'), { fit: packBB(p), phys, only: p.ids, paint: id => paintPack(p, id), labels: labelsOf(p),
    tap: (id, k) => { const t = hitPack(p, id, k); if (t) go((C[t] || CT[t] ? 'c-' : 'f-') + t); } });
}
function paintPack(p, id) {
  if (p.id === 'world') { const k = contOf(id); return k ? 'ct-' + k : 'plain'; }
  return p.ids.includes(id) ? 'mc' + ((C[id] || {}).mc || 1) : 'plain';
}
function labelsOf(p) { return p.ids.map(id => { const x = item(id); return { t: nm(x), at: x.lab, cls: C[id] ? 'lc' : CT[id] ? 'lct' : 'lp k-' + x.k, dy: x.p ? -14 : 0, w: C[id] ? Math.max(x.bb[2] - x.bb[0], x.bb[3] - x.bb[1]) : 0 }; }); }
/** which item of the pack a tap means (continents: any land in it) */
function hitPack(p, id, k) {
  if (!id) return null;
  if (p.id === 'world' && (k === 'c' || k === 'x')) return contOf(id);
  return p.ids.includes(id) ? id : null;
}

/* ---------- games ---------- */
let G = null;
function dueKeys() { return HS.srs.due(NS, A.packs.flatMap(p => skillsOf(p).flatMap(s => keys(p, s)))); }
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
  G.qs.forEach(q => { if (!q.m) q.m = q.s === 'c' ? 'cap' : q.s === 'f' ? 'flag' : (HS.srs.box(NS, q.key) >= 2 ? 'find' : 'name'); q.p = p || A.packs.find(pk => pk.ids.includes(q.id)); });
  M().innerHTML = `<div class="a-game"><div class="a-ask" id="aAsk" aria-live="polite"></div><div class="a-dots" id="aDots"></div>
    <div id="aMap" class="a-map game"></div><div id="aOpts" class="a-opts"></div><div id="aFb" class="a-fb" aria-live="polite"></div></div>`;
  nextQ();
}
function dots() { $('aDots').innerHTML = G.qs.map((q, i) => `<i class="${i < G.i ? (q.good ? 'ok' : 'no') : i === G.i ? 'now' : ''}"></i>`).join(''); }
function nextQ() {
  if (G.i >= G.qs.length) return finish();
  const q = G.qs[G.i]; G.tries = 0; G.cur = q; dots(); $('aFb').innerHTML = ''; $('aOpts').innerHTML = '';
  const p = q.p, x = item(q.id), n = nm(x);
  const fit = packBB(p), phys = p.ids.filter(id => PH[id]);
  if (!mapApi || G.mapPack !== p.id) {
    G.mapPack = p.id;
    mapApi = atlasMap($('aMap'), { fit, phys, only: p.ids, labels: [], paint: id => paintPack(p, id), tap: (id, k) => tapAnswer(id, k) });
  } else { mapApi.clsAll('hl'); mapApi.clsAll('ans'); mapApi.clsAll('got'); mapApi.label([]); mapApi.zoomTo(fit); }
  if (q.m === 'find') {
    const t = L(`أين ${n}؟`, `Where is ${n}?`);
    $('aAsk').innerHTML = `<span>${L(`أين <b>${esc(n)}</b>؟`, `Where is <b>${esc(n)}</b>?`)}</span> ${spk(t)}<small>${L('المسها على الخريطة', 'Tap it on the map')}</small>`;
    say(t);
  } else {
    highlight(q.id, true);
    let ask, opts;
    if (q.m === 'name') { ask = C[q.id] ? L('ما اسم هذه الدولة؟', 'What is this country called?') : CT[q.id] ? L('ما اسم هذه القارة؟', 'What is this continent called?') : L('ما اسم هذا المكان؟', 'What is this place called?'); opts = choices(q, id => esc(nameOf(id))); }
    else if (q.m === 'cap') { ask = L(`ما عاصمة ${n}؟`, `What is the capital of ${n}?`); opts = choices(q, id => esc(capN(C[id])), id => C[id] && C[id].cap); }
    else { q.rev = Math.random() < 0.5;
      if (q.rev) { ask = L('أي دولة هذا علمها؟', 'Which country has this flag?'); opts = choices(q, id => esc(nameOf(id)), id => C[id] && C[id].flag); }
      else { ask = L(`ما علم ${n}؟`, `Which flag belongs to ${n}?`); opts = choices(q, id => flagImg(C[id], 'opt'), id => C[id] && C[id].flag); } }
    const shown = esc(ask).replace(esc(n), `<b>${esc(n)}</b>`);
    $('aAsk').innerHTML = `<span>${shown}</span> ${spk(ask)}${q.m === 'flag' && q.rev ? `<span class="a-ask-flag">${flagImg(x, 'huge')}</span>` : ''}`;
    $('aOpts').innerHTML = opts;
    say(ask);
  }
}
function highlight(id, on) {
  if (CT[id]) { A.countries.forEach(c => { if (c.c === id) mapApi.cls(c.id, 'hl', on); }); Object.keys(A.landc).forEach(l => { if (A.landc[l] === id) mapApi.cls(l, 'hl', on); }); }
  else mapApi.cls(id, 'hl', on);
  const x = item(id);
  if (on && x && x.bb && G && G.cur && G.cur.m !== 'find' && !CT[id] && G.cur.p.id !== 'world') {
    const pb = packBB(G.cur.p), small = (x.bb[2] - x.bb[0]) < (pb[2] - pb[0]) * 0.08;
    if (small) mapApi.zoomTo([x.bb[0] - 25, x.bb[1] - 18, x.bb[2] + 25, x.bb[3] + 18]);
  }
}
/** 2 wrong options at first, 3 from the second box on: from the same level, then the same continent */
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
  if (!id || (k === 'w' && !t)) return;
  if (t === q.id) return mark(true);
  G.tries++; HS.fx('no');
  const what = t || id;
  if (item(what)) { highlight(what, true); setTimeout(() => G && G.cur === q && highlight(what, false), 1100); }
  const named = item(what) ? L(`هذه <b>${esc(nameOf(what))}</b>. `, `That is <b>${esc(nameOf(what))}</b>. `) : '';
  $('aFb').innerHTML = `<div class="bad">${named}${G.tries >= 2 ? L('انظر أين هي:', 'Look where it is:') : L('حاول مرة أخرى.', 'Try again.')}</div>`;
  if (G.tries >= 2) { highlight(q.id, true); mapApi.cls(q.id, 'ans', true); mark(false); }
}
function mark(good) {
  const q = G.cur; if (q.done) return; q.done = true;
  const first = good && G.tries === 0;
  q.good = first; HS.srs.record(NS, q.key, first); visit(q.id);
  if (first) { if (G.i < G.n0) G.ok++; HS.addStars(1); HS.fx('ok'); } else if (!good) G.retry.push(q);
  const x = item(q.id), c = C[q.id];
  highlight(q.id, true); mapApi.cls(q.id, good ? 'got' : 'ans', true);
  mapApi.label([{ t: nm(x), at: x.lab, cls: (c ? 'lc' : CT[q.id] ? 'lct' : 'lp k-' + x.k) + ' big', dy: x.p ? -14 : 0 }, ...(c && c.cap && q.m === 'cap' ? [{ t: '★ ' + capN(c), at: c.cap.p, cls: 'lcap', dy: 12 }] : [])]);
  const line = lineOf(q.id), praise = HS.one(EN() ? ['Well done!', 'Great!', 'Excellent!'] : ['أحسنت', 'رائع', 'ممتاز']);
  $('aFb').innerHTML = `<div class="${first ? 'good' : 'bad'}">${first ? '🎉 ' + praise : good ? '👍 ' + L('صحيح بعد محاولة.', 'Right on the second try.') : '✋ ' + L('هذه هي:', 'Here it is:')} <b>${esc(line)}</b>${c ? flagImg(c, 'mid') : ''}</div>
    <button type="button" class="a-btn" id="aNext">${L('التالي ←', 'Next →')}</button>`;
  HS.speak((first ? [[praise, EN() ? 'en' : 'ar']] : []).concat([[line, EN() ? 'en' : 'ar']]));
  $('aNext').focus({ preventScroll: true });
}
function pickAnswer(btn) {
  const q = G && G.cur; if (!q || q.done) return;
  if (btn.dataset.ans === q.id) { btn.classList.add('ok'); M().querySelectorAll('.a-opt').forEach(b => b.disabled = true); return mark(true); }
  G.tries++; btn.classList.add('no'); btn.disabled = true; HS.fx('no');
  if (G.tries >= 2) { M().querySelectorAll('.a-opt').forEach(b => { b.disabled = true; if (b.dataset.ans === q.id) b.classList.add('ok'); }); mark(false); }
  else $('aFb').innerHTML = `<div class="bad">${L('حاول مرة أخرى.', 'Try again.')}</div>`;
}
function finish() {
  if (G.retry.length && !G.retried) { G.retried = true; G.qs = G.qs.concat(G.retry.map(q => ({ key: q.key, s: q.s, id: q.id, m: q.m === 'find' ? 'name' : q.m, p: q.p }))); G.retry = []; return nextQ(); }
  const n = G.n0, s = G.p ? stars(G.p) : 0, great = G.ok >= n * 0.8;
  HS.fx('win'); if (great && HS.party) HS.party();
  M().innerHTML = `<section class="a-done"><div class="a-done-em">${great ? '🏆' : '🌍'}</div><h1>${great ? L('رحلة رائعة!', 'Great trip!') : L('أحسنت المحاولة!', 'Nice try!')}</h1>
    <p>${L(`أجبت ${HS.toAr(G.ok)} من ${HS.toAr(n)} من أول محاولة.`, `You got ${G.ok} of ${n} on the first try.`)}</p>${G.p ? starRow(s, 'big') : ''}
    <div class="a-acts">${G.p ? `<button type="button" class="a-act" data-go="g-${G.p.id}-${G.mode}"><b>🔁</b><span>${L('مرة أخرى', 'Again')}</span></button><button type="button" class="a-act" data-go="p-${G.p.id}"><b>${G.p.em}</b><span>${esc(nm(G.p))}</span></button>` : `<button type="button" class="a-act" data-go="quick"><b>🎯</b><span>${L('تحدٍّ آخر', 'Another challenge')}</span></button>`}
      <button type="button" class="a-act" data-go=""><b>🗺️</b><span>${L('الأطلس', 'Atlas')}</span></button></div></section>`;
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
  const line = lineOf(id);
  $('aTour').innerHTML = `<div class="a-tcard">${c ? flagImg(c, 'mid') : `<span class="a-sh-em">${CT[id] ? '🌍' : kindEm(x.k)}</span>`}<div><b>${esc(nm(x))}</b>
      <span>${c ? `${L('العاصمة', 'Capital')}: ${esc(capN(c))}` : esc(factOf(x))}</span></div>${spk(line)}</div>
    <div class="a-tnav"><button type="button" class="a-btn ghost" id="aPrev" ${G.i ? '' : 'disabled'}>${L('→ السابق', '← Back')}</button><span>${N(G.i + 1)} / ${N(G.ids.length)}</span>
      ${G.i < G.ids.length - 1 ? `<button type="button" class="a-btn" id="aNx">${L('التالي ←', 'Next →')}</button>` : `<button type="button" class="a-btn" data-go="g-${G.p.id}-name">🎯 ${L('اختبر نفسك', 'Test yourself')}</button>`}</div>`;
  say(line);
}

/* ---------- passport ---------- */
function passport() {
  const d = D(), seen = A.countries.filter(c => d.seen[c.id]).length, got = A.countries.filter(c => learned(c.id)).length;
  M().innerHTML = `<section class="a-phead"><span class="a-pk-em big">🛂</span><div><h1>${L('جواز سفري', 'My passport')}</h1><p>${L(`زرت ${HS.toAr(seen)} دولة من ${HS.toAr(A.countries.length)} · أتقنت ${HS.toAr(got)}`, `Visited ${seen} of ${A.countries.length} countries · mastered ${got}`)}</p></div></section>
    <div id="aMap" class="a-map"></div><p class="a-note">${L('الدول الملوّنة أتقنتها: تعرف مكانها وعاصمتها وعلمها. الختم الذهبي للدولة المتقنة.', 'Coloured countries are mastered: you know where they are, their capital and their flag. Mastered ones get a gold stamp.')}</p>
    ${A.conts.filter(t => t.id !== 'AN').map(t => `<h2 class="a-h3">${esc(nm(t))}</h2><div class="a-stamps">${A.countries.filter(c => c.c === t.id).map(c => `<button type="button" class="a-stamp ${learned(c.id) ? 'gold' : d.seen[c.id] ? 'seen' : ''}" data-go="c-${c.id}">${flagImg(c)}<span>${esc(nm(c))}</span></button>`).join('')}</div>`).join('')}`;
  mapApi = atlasMap($('aMap'), { labels: 'none', only: [], paint: id => learned(id) ? contClass(id) + ' got' : d.seen[id] ? 'seen' : 'plain', tap: (id, k) => { if (k === 'c' && id) go('c-' + id); } });
}

/* ---------- events ---------- */
ROOT.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t || !ROOT.contains(t)) return;
  const ds = t.dataset;
  if (ds.say) { e.stopPropagation(); return say(ds.say); }
  if (ds.lang) { D().lang = ds.lang; HS.save(); HS.fx('tap'); return show(''); }
  if (ds.go !== undefined) { HS.fx('tap'); return go(ds.go); }
  if (ds.ans) return pickAnswer(t);
  if (ds.opt) { const st = D().mapOpt; st[ds.opt] = !st[ds.opt]; HS.save(); return freeMap(); }
  if (t.id === 'aNext' && G) { G.i++; return nextQ(); }
  if (t.id === 'aNx' && G) { G.i = Math.min(G.ids.length - 1, G.i + 1); return tourStep(); }
  if (t.id === 'aPrev' && G) { G.i = Math.max(0, G.i - 1); return tourStep(); }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && ROOT.offsetParent && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) && !e.altKey) {
    const fwd = (e.key === 'ArrowLeft') !== EN();   // Arabic reads right to left: the left arrow goes forward
    const b = M().querySelector(`.a-pnav [data-key=${fwd ? 'next' : 'prev'}]`); if (b) { e.preventDefault(); b.click(); }
  }
});
ROOT.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'aQ') { const b = $('aRes').querySelector('[data-go]'); if (b) b.click(); }
});

APPS.atlas = {
  open(sub) { show(sub || ''); window.scrollTo(0, 0); },
  nav: chainFor,
  close() { HS.stopSpeak(); G = null; mapApi = null; },
  /** for the site-wide games page (#games): the quick challenge and one entry per level (its page lists the games) */
  games: () => [{ route: R('quick'), title: MODES().quick, em: '🎯', sub: L('أماكن من كل المستويات', 'Places from every level'), type: 'challenge' },
    ...A.packs.map(p => ({ route: R('p-' + p.id), title: nm(p), em: p.em, sub: L('مستوى في الأطلس', 'An atlas level'), stars: stars(p), type: 'atlas' }))],
  /** parent page: places visited and learned, accuracy */
  report(pid) {
    const d = HS.data(NS, pid), s = d.srs || {}, ks = Object.keys(s);
    const c = ks.reduce((a, k) => a + s[k].c, 0), w = ks.reduce((a, k) => a + s[k].w, 0);
    return { seen: Object.keys(d.seen || {}).length, learned: ks.filter(k => s[k].b >= 3).length, acc: c + w ? c / (c + w) : 0, total: A.countries.length };
  }
};
