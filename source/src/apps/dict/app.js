/* ============================================================
   KIDS' DICTIONARY (قاموسي) – words sorted by difficulty (easy / medium / hard), two directions:
     en: learn ENGLISH words (meaning shown in Arabic)   – progress in namespace "dict"
     ar: learn ARABIC words  (meaning shown in English)  – progress in namespace "dictar"
   Pages: home (search, word of the day + 🎲) · list (topic / letter / search / my words) · word (+ 🎲) · practice
   Learning design (research):
   - student-friendly definitions + meaning in the other language + example + picture (Beck & McKeown)
   - many short exposures spaced over days (Leitner boxes, HS.srs)
   - spelling by RETRIEVAL with immediate corrective feedback (beats copying):
     box 0 meaning → box 1 pick the right spelling → box 2 build it from letters → box 3+ write it from memory
   ============================================================ */
const { TOPICS, POS, RAW } = APPDATA.dict;
const $ = id => document.getElementById(id);
const esc = HS.esc, ar = HS.toAr;
const M = () => $('dMain');

/* ---------- words ---------- */
const stripHarakat = s => s.replace(/[ً-ْـ]/g, '');
/** the one Arabic word the child learns to spell: first meaning before "/", without "(...)" notes */
const arHead = a => a.split('/')[0].replace(/\(.*?\)/g, '').trim();
const WORDS = RAW.trim().split('\n').filter(l => l.split('|').length === 8).map(l => {
  const [w, p, em, a, def, ex, g, t] = l.split('|');
  const ah = arHead(a);
  return { id: w + '|' + t, w, p, em, a, ah, ahs: stripHarakat(ah), def, ex, g: +g, t };
});
const BY_ID = Object.fromEntries(WORDS.map(x => [x.id, x]));
// Arabic search: ignore diacritics and the usual spelling variants (أ إ آ → ا, ة → ه, ى → ي)
const normAr = s => stripHarakat(s).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
const KEY = WORDS.map(x => ({ x, en: x.w.toLowerCase(), ar: normAr(x.a) }));
const AR_ABC = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' ');
const arFirst = x => { const c = normAr(x.ahs)[0]; return c === 'ي' && x.ahs[0] === 'ي' ? 'ي' : c; };

/* ---------- saved data ---------- */
/* diff: 0 = all words, 3 = easy, 4 = medium, 5 = hard (the number in data.js) */
const D = () => { const d = HS.data('dict'); d.mine = d.mine || []; d.diff = d.diff || 0; d.mode = d.mode || 'en'; return d; };
const AR = () => D().mode === 'ar';
const NS = () => AR() ? 'dictar' : 'dict';          // separate progress for each direction
const box = id => HS.srs.box(NS(), id);
const learned = id => box(id) >= 3;
const inLevel = x => !D().diff || x.g === D().diff;
/* what the child is learning (target) and what explains it (source) in the current mode */
const tgt = x => AR() ? x.ah : x.w;
const tgtPlain = x => AR() ? x.ahs : x.w;
const src = x => AR() ? x.w : x.a;
const tDir = () => AR() ? 'rtl' : 'ltr', sDir = () => AR() ? 'ltr' : 'rtl';

/* ---------- small helpers ---------- */
const hiWord = (ex, w) => esc(ex).replace(new RegExp('\\b(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*)', 'i'), '<b>$1</b>');
const pos = x => `${POS[x.p][0]} · ${POS[x.p][1]}`;
const stars = n => '★'.repeat(n) + '☆'.repeat(Math.max(0, 4 - n));
const LEVEL = { 3: '🟢 سهل', 4: '🟡 متوسط', 5: '🔴 صعب' };
function sayEn(t) { HS.speak([[t, 'en']]); }   // the device's English voice, for English words only
function refreshStars() { const s = $('dStars'); if (s) s.textContent = ar(HS.stars()); }
HS.on('stars', refreshStars);
let back = [];   // simple history for the in-app back button
function go(fn, ...args) { back.push([fn, args]); fn(...args); window.scrollTo(0, 0); }
function goBack() { back.pop(); const p = back.pop(); if (p) go(p[0], ...p[1]); else go(home); }
const backBtn = () => `<button type="button" class="d-back" data-a="back">→ رجوع</button>`;
/** question text: Arabic, plus an English line in Arabic mode (these children read English more easily) */
const askT = (a, e) => AR() ? `${a}<small dir="ltr">${e}</small>` : a;
const sayBtn = (t, cls = '') => AR() && /[؀-ۿ]/.test(t) ? '' : `<button type="button" class="d-say ${cls}" data-say="${esc(t)}" aria-label="استمع للنطق">🔊</button>`;

/* word of the day: the same all day for this level; 🎲 swaps it for a random word */
let wodPick = null;
function wordOfDay() {
  if (wodPick && inLevel(BY_ID[wodPick])) return BY_ID[wodPick];
  const pool = WORDS.filter(inLevel), t = HS.today().split('-').join('');
  let h = 0; for (const c of t + D().diff) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return pool[h % pool.length];
}
/** a random word of the child's level, never the one on screen; unlearned words come up more */
function randomWord(not) {
  const pool = WORDS.filter(x => inLevel(x) && x.id !== not);
  const fresh = pool.filter(x => !learned(x.id));
  const from = fresh.length && Math.random() < .8 ? fresh : pool;
  return from[Math.floor(Math.random() * from.length)];
}
const dueIds = () => HS.srs.due(NS(), D().mine);

/* ---------- pages ---------- */
function home() {
  const d = D(), wod = wordOfDay(), n = WORDS.filter(inLevel).length, ln = WORDS.filter(x => inLevel(x) && learned(x.id)).length, due = dueIds().length;
  M().innerHTML = `
  <div class="d-hello">${HS.mascot('read', { small: true, cls: 'd-koko' })}<h1 class="d-h1">${HS.hasArt('mascot-read') ? '' : '📖 '}قاموسي <span dir="ltr">My Dictionary</span></h1></div>
  <div class="d-mode" role="radiogroup" aria-label="ماذا أتعلّم؟">
    <button type="button" role="radio" aria-checked="${!AR()}" class="${AR() ? '' : 'on'}" data-mode="en"><b dir="ltr">🔤 Learn English</b><small>أتعلّم الإنجليزي</small></button>
    <button type="button" role="radio" aria-checked="${AR()}" class="${AR() ? 'on' : ''}" data-mode="ar"><b>📝 أتعلّم العربي</b><small dir="ltr">Learn Arabic</small></button>
  </div>
  <form class="d-search" id="dSearch" role="search"><input id="dQ" type="search" placeholder="ابحث · Search: apple / تفاحة" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="ابحث عن كلمة"><button type="submit" aria-label="بحث">🔎</button></form>
  <div class="d-lv" role="radiogroup" aria-label="الصعوبة">${[[0, '🌈 الكل'], [3, LEVEL[3]], [4, LEVEL[4]], [5, LEVEL[5]]].map(([g, t]) => `<button type="button" role="radio" aria-checked="${d.diff === g}" class="${d.diff === g ? 'on' : ''}" data-lv="${g}">${t}</button>`).join('')}</div>
  <div class="d-wod" data-w="${esc(wod.id)}"><small>${wodPick ? '🎲 كلمة عشوائية · Random word' : '🌟 كلمة اليوم · Word of the day'}</small><span class="em">${wod.em}</span><b dir="${tDir()}">${esc(tgt(wod))}</b><span class="ar" dir="${sDir()}">${esc(src(wod))}</span>
    <button type="button" class="d-dice" data-a="dice" aria-label="كلمة عشوائية أخرى">🎲 كلمة أخرى</button></div>
  <div class="d-progress"><div class="m-row"><span>${AR() ? 'كتبت بالعربي' : 'تعلّمت'} ${ar(ln)} من ${ar(n)} كلمة</span><b>${ar(Math.round(ln / n * 100))}٪</b></div><div class="hs-meter"><i style="width:${Math.max(3, Math.round(ln / n * 100))}%"></i></div></div>
  <button type="button" class="sp-tile" data-sp="start"><span class="em" aria-hidden="true">✍️</span><span class="tx"><b>${HS.L('تحدّي الإملاء', 'Spelling challenge')}</b>
    <small>${AR() ? 'خمّن كيف تُكتب الكلمة بالعربي، كلمة بعد كلمة' : HS.L('خمّن كيف تُكتب الكلمة، كلمة بعد كلمة', 'Guess how each word is spelled, one after another')}</small></span>
    <span class="sp-tile-n" data-sp="list" role="button" tabindex="0" aria-label="${HS.L('الكلمات التي أتقنتها', 'Words I can spell')}">✓ ${HS.num(spDone().length)}</span></button>
  <div class="d-menu">
    <button type="button" class="d-tile" style="background:var(--t-pink-sh)" data-a="practice"><span class="em">🧠</span><b>${AR() ? 'تدرّب على العربي' : 'تدرّب'}</b><small>${due ? `${ar(due)} كلمة حان وقت مراجعتها` : 'معاني وكتابة'}</small></button>
    <button type="button" class="d-tile" style="background:var(--t-gold-sh)" data-a="mine"><span class="em">⭐</span><b>كلماتي</b><small>${ar(d.mine.length)} كلمة</small></button>
    <button type="button" class="d-tile" style="background:var(--t-blue)" data-a="topics"><span class="em">🗂️</span><b>المواضيع</b><small dir="ltr">Topics</small></button>
    <button type="button" class="d-tile" style="background:var(--t-purple)" data-a="az"><span class="em" dir="${tDir()}">${AR() ? 'أ–ي' : 'A–Z'}</span><b>الحروف</b><small dir="ltr">Letters</small></button>
  </div>`;
  $('dSearch').onsubmit = e => { e.preventDefault(); const q = $('dQ').value.trim(); if (q) go(list, 'q', q); };
  $('dQ').oninput = () => { const q = $('dQ').value.trim(); if (q.length >= 2) { back.push([list, ['q', q]]); list('q', q, true); } };
}
function search(q) {
  const en = q.toLowerCase(), a = normAr(q).replace(/^ال/, '');
  const score = k => k.en === en ? 0 : k.en.startsWith(en) ? 1 : k.ar.split(/[\s/،]+/).some(p => p === normAr(q) || p.replace(/^ال/, '') === a) ? 2 : k.en.includes(en) ? 3 : a.length >= 2 && k.ar.includes(a) ? 4 : 9;
  return KEY.map(k => [score(k), k.x]).filter(s => s[0] < 9).sort((p, q2) => p[0] - q2[0] || p[1].w.localeCompare(q2[1].w)).map(s => s[1]);
}
/** a list of words. kind: 'q' search | 't' topic | 'l' letter | 'mine' */
function list(kind, v, keepFocus) {
  const d = D();
  let ws, title;
  if (kind === 'q') { ws = search(v); title = `🔎 «${esc(v)}»`; }
  else if (kind === 't') { ws = WORDS.filter(x => x.t === v && inLevel(x)); title = `${TOPICS[v][0]} ${TOPICS[v][2]} · <span dir="ltr">${TOPICS[v][1]}</span>`; }
  else if (kind === 'l') { ws = WORDS.filter(x => inLevel(x) && (AR() ? arFirst(x) === v : x.w[0].toUpperCase() === v)); title = `<span dir="${tDir()}">${v}</span>`; }
  else { ws = d.mine.map(id => BY_ID[id]).filter(Boolean); title = '⭐ كلماتي'; }
  if (kind === 't' || kind === 'l') ws = ws.slice().sort((a, b) => AR() ? a.ahs.localeCompare(b.ahs, 'ar') : a.w.localeCompare(b.w));
  const ids = ws.map(x => x.id);
  M().innerHTML = `${backBtn()}${kind === 'q' ? `<form class="d-search" id="dSearch" role="search"><input id="dQ" type="search" value="${esc(v)}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="ابحث عن كلمة"><button type="submit" aria-label="بحث">🔎</button></form>` : ''}
    <h2 class="d-h2">${title} <small>(${ar(ws.length)})</small></h2>
    ${kind === 'mine' && ws.length ? `<button type="button" class="d-btn" data-a="practice">🧠 تدرّب على كلماتي</button>` : ''}
    ${ws.length ? `<div class="d-list">${ws.map(x => `<button type="button" class="d-row" data-w="${esc(x.id)}"><span class="em">${x.em}</span><span class="tg" dir="${tDir()}">${esc(tgt(x))}</span><span class="sc" dir="${sDir()}">${esc(src(x))}</span><span class="st" aria-label="مستوى الحفظ">${learned(x.id) ? '✅' : d.mine.includes(x.id) ? '⭐' : ''}</span></button>`).join('')}</div>`
      : `<p class="d-empty">${kind === 'mine' ? 'لم تحفظ كلمات بعد. افتح أي كلمة واضغط ⭐ لتضيفها هنا.' : 'لم أجد هذه الكلمة. جرّب كلمة أخرى أو تأكّد من الكتابة.'}</p>`}`;
  M().dataset.ids = ids.join('\n');
  const f = $('dSearch'); if (f) { f.onsubmit = e => { e.preventDefault(); const q = $('dQ').value.trim(); if (q) { back.pop(); go(list, 'q', q); } };
    $('dQ').oninput = () => { const q = $('dQ').value.trim(); if (q.length >= 2) { back.pop(); back.push([list, ['q', q]]); list('q', q, true); } };
    if (keepFocus) { const i = $('dQ'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
}
function topics() {
  M().innerHTML = `${backBtn()}<h2 class="d-h2">🗂️ المواضيع · <span dir="ltr">Topics</span></h2><div class="d-grid">${Object.keys(TOPICS).map(t => {
    const n = WORDS.filter(x => x.t === t && inLevel(x)).length; return n ? `<button type="button" class="d-topic" data-t="${t}"><span class="em">${TOPICS[t][0]}</span><b>${TOPICS[t][2]}</b><small dir="ltr">${TOPICS[t][1]} · ${n}</small></button>` : ''; }).join('')}</div>`;
}
function az() {
  const lv = WORDS.filter(inLevel);
  const letters = AR() ? AR_ABC.filter(l => lv.some(x => arFirst(x) === l)) : [...new Set(lv.map(x => x.w[0].toUpperCase()))].sort();
  M().innerHTML = `${backBtn()}<h2 class="d-h2">🔤 الحروف · <span dir="ltr">${AR() ? 'Arabic letters' : 'A–Z'}</span></h2><div class="d-az" dir="${tDir()}">${letters.map(l => `<button type="button" data-l="${l}">${l}</button>`).join('')}</div>`;
}
function word(id, ids) {
  const x = BY_ID[id], d = D(), mine = d.mine.includes(id);
  ids = ids || [id]; const i = ids.indexOf(id), prev = ids[i - 1], next = ids[i + 1];
  HS.markPractice();
  const letters = [...tgtPlain(x)].map(c => c === ' ' ? '<i class="sp"></i>' : `<i>${esc(c)}</i>`).join('');
  M().innerHTML = `${backBtn()}
  <article class="d-word">
    <div class="em">${x.em}</div>
    <div class="w" dir="${tDir()}"><span>${esc(tgt(x))}</span>${sayBtn(tgt(x))}</div>
    <div class="pos">${pos(x)} · ${LEVEL[x.g]}</div>
    <div class="spell" dir="${tDir()}" aria-label="الحروف">${letters}</div>
    ${AR() ? `<div class="d-sec" dir="ltr"><small>In English</small><p class="arm">${esc(x.w)} ${sayBtn(x.w, 'sm')}</p></div>
      ${x.a !== x.ah ? `<div class="d-sec"><small>كلمات بنفس المعنى</small><p>${esc(x.a)}</p></div>` : ''}`
      : `<div class="d-sec"><small>المعنى بالعربي</small><p class="arm">${esc(x.a)}</p></div>`}
    <div class="d-sec" dir="ltr"><small>Meaning</small><p>${esc(x.def)}</p></div>
    <div class="d-sec" dir="ltr"><small>Example</small><p class="ex">${hiWord(x.ex, x.w)} ${sayBtn(x.ex, 'sm')}</p></div>
    <div class="d-know">حفظك${AR() ? ' (عربي)' : ''}: <span>${stars(Math.min(4, box(id)))}</span></div>
    <div class="d-actions">
      <button type="button" class="d-btn ${mine ? 'sec' : ''}" data-mine="${esc(id)}">${mine ? '✓ في كلماتي' : '⭐ أضف إلى كلماتي'}</button>
      <button type="button" class="d-btn" data-one="${esc(id)}">✍️ تدرّب على كتابتها</button>
      <button type="button" class="d-btn sec" data-a="dice" aria-label="كلمة عشوائية">🎲 كلمة عشوائية</button>
    </div>
    <div class="d-nav">${next ? `<button type="button" class="d-btn sec" data-nav-w="${esc(next)}">التالية ←</button>` : '<span></span>'}${prev ? `<button type="button" class="d-btn sec" data-nav-w="${esc(prev)}">→ السابقة</button>` : ''}</div>
  </article>`;
  M().dataset.ids = ids.join('\n');
}

/* ---------- practice ---------- */
let P = null;   // current session
function pickSession(onlyId) {
  if (onlyId) return [onlyId];
  const d = D(), due = dueIds();
  const fresh = d.mine.filter(id => !HS.srs.seen(NS(), id));
  let ids = [...due, ...fresh];
  if (ids.length < 8) {   // top up from the child's level: words not learned yet, weaker first
    const pool = WORDS.filter(x => inLevel(x) && !learned(x.id) && !ids.includes(x.id)).map(x => x.id);
    ids = ids.concat(HS.srs.choose(NS(), pool, 8 - ids.length));
  }
  return HS.shuffle(ids.slice(0, 10));
}
function practice(onlyId) {
  const ids = pickSession(onlyId);
  P = { ids, i: 0, ok: 0, retry: [], combo: HS.makeCombo(), one: !!onlyId };
  HS.markPractice(); nextItem();
}
const distractors = (x, n, key) => HS.shuffle(WORDS.filter(y => y.id !== x.id && y[key] !== x[key] && (y.t === x.t || y.g === x.g))).slice(0, n);
/** wrong spellings that look real. English: swap, drop or double a letter.
    Arabic: the letters children really mix up (ة/ه/ت، ا/أ/إ، ي/ى، س/ص، ت/ط، ذ/ز، ض/ظ، ك/ق، ح/ه) or a dropped letter. */
const AR_MIX = [['ة', 'ه'], ['ة', 'ت'], ['ا', 'أ'], ['أ', 'إ'], ['ى', 'ي'], ['س', 'ص'], ['ت', 'ط'], ['ذ', 'ز'], ['ض', 'ظ'], ['ك', 'ق'], ['ح', 'ه'], ['د', 'ض'], ['ث', 'س']];
function misspell(w) {
  const out = new Set(), L = w.length, arabic = /[؀-ۿ]/.test(w);
  for (let k = 0; k < 60 && out.size < 3; k++) {
    let s = w;
    if (arabic && Math.random() < .7) {
      const [a, b] = HS.one(AR_MIX), from = Math.random() < .5 ? a : b, to = from === a ? b : a, i = w.indexOf(from);
      if (i < 0) continue; s = w.slice(0, i) + to + w.slice(i + 1);
    } else {
      const i = 1 + Math.floor(Math.random() * Math.max(1, L - 2)), r = Math.random();
      if (r < .33 && i < L - 1) s = w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2);
      else if (r < .66) s = w.slice(0, i) + w.slice(i + 1);
      else s = w.slice(0, i) + w[i] + w.slice(i);
    }
    if (s !== w && s.length > 1 && !s.includes(' ')) out.add(s);
  }
  return [...out];
}
const same = (a, b) => AR() ? stripHarakat(a).replace(/\s+/g, ' ').trim() === stripHarakat(b).replace(/\s+/g, ' ').trim() : a.trim().toLowerCase() === b.trim().toLowerCase();
function nextItem() {
  if (P.i >= P.ids.length) {
    if (P.retry.length) { P.ids = P.retry; P.retry = []; P.i = 0; P.again = true; }
    else return endPractice();
  }
  const x = BY_ID[P.ids[P.i]], b = P.one ? 3 : box(x.id), T = tgtPlain(x);
  let mode = b === 0 ? (Math.random() < .5 ? 'mean' : 'meanR') : b === 1 ? 'pick' : b === 2 ? 'tiles' : 'type';
  if (mode === 'tiles' && (T.includes(' ') || T.length > 11)) mode = 'type';
  if (mode === 'pick' && T.includes(' ')) mode = 'type';
  if (mode === 'pick' && T.length < (AR() ? 3 : 4)) mode = 'tiles';
  if (mode === 'pick' && misspell(T).length < 2) mode = 'tiles';
  P.cur = { x, mode, first: true }; ROOT._dbg = T;   // read by the automated tests
  const head = `<div class="d-qhead"><span>${ar(P.i + 1)} / ${ar(P.ids.length)}${AR() ? ' · 📝 عربي' : ''}</span>${P.again ? '<span>🔁 مرة ثانية</span>' : ''}<button type="button" class="d-x" data-a="home" aria-label="إنهاء">✕</button></div>`;
  // the clue must not give the spelling away: in English mode hide the word (and its forms) inside the definition
  const hide = s => AR() ? esc(s) : esc(s).replace(new RegExp('\\b' + x.w.split(' ')[0].slice(0, Math.max(3, x.w.split(' ')[0].length - 2)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*', 'gi'), '___');
  const clue = `<div class="d-clue"><span class="em">${x.em}</span><b dir="${sDir()}">${esc(src(x))}</b><p dir="ltr">${hide(x.def)}</p></div>`;
  let body = '';
  if (mode === 'mean') {          // target word → choose its meaning
    const opts = HS.shuffle([x, ...distractors(x, 3, AR() ? 'w' : 'a')]);
    body = `<p class="d-ask">${askT('ما معنى هذه الكلمة؟', 'What does it mean?')}</p><div class="d-big" dir="${tDir()}">${x.em} ${esc(tgt(x))} ${sayBtn(tgt(x), 'sm')}</div>
      <div class="d-opts" dir="${sDir()}">${opts.map(o => `<button type="button" class="d-opt" data-ok="${o.id === x.id}">${esc(AR() ? o.w : o.a)}</button>`).join('')}</div>`;
  } else if (mode === 'meanR') {  // meaning → choose the target word
    const opts = HS.shuffle([x, ...distractors(x, 3, AR() ? 'ah' : 'w')]);
    body = `<p class="d-ask">${AR() ? askT('ما الكلمة بالعربي؟', 'Which Arabic word is it?') : 'ما الكلمة الإنجليزية؟'}</p><div class="d-big" dir="${sDir()}">${x.em} ${esc(src(x))}</div>
      <div class="d-opts" dir="${tDir()}">${opts.map(o => `<button type="button" class="d-opt" data-ok="${o.id === x.id}">${esc(tgt(o))}</button>`).join('')}</div>`;
  } else if (mode === 'pick') {
    const opts = HS.shuffle([T, ...misspell(T).slice(0, 3)]);
    body = `<p class="d-ask">${askT('أيّ كتابة صحيحة؟', 'Which spelling is right?')}</p>${clue}<div class="d-opts" dir="${tDir()}">${opts.map(o => `<button type="button" class="d-opt" data-ok="${o === T}">${esc(o)}</button>`).join('')}</div>`;
  } else if (mode === 'tiles') {
    const lower = AR() ? T : T.toLowerCase();
    const pool = AR() ? 'اوي نلمرتب' : 'aeioustrnl';
    const extra = HS.shuffle([...new Set(pool.split(''))].filter(c => c.trim() && !lower.includes(c))).slice(0, 2);
    const tiles = HS.shuffle([...lower, ...extra]);
    body = `<p class="d-ask">${AR() ? askT('رتّب الحروف لتكتب الكلمة بالعربي', 'Put the letters in order') : 'رتّب الحروف لتكتب الكلمة'}</p>${clue}<div class="d-slots" dir="${tDir()}" id="dSlots">${[...T].map(() => '<i></i>').join('')}</div>
      <div class="d-tiles" dir="${tDir()}">${tiles.map((c, i) => `<button type="button" class="d-tile-l" data-c="${esc(c)}" data-i="${i}">${esc(c)}</button>`).join('')}</div>
      <div class="d-actions"><button type="button" class="d-btn sec" id="dUndo">⌫ تراجع</button><button type="button" class="d-btn" id="dCheck">تحقّق ✅</button></div>`;
  } else {
    const n = T.replace(/ /g, '').length;
    body = `<p class="d-ask">${AR() ? askT('اكتب الكلمة بالعربي من ذاكرتك', 'Write it in Arabic') : 'اكتب الكلمة بالإنجليزي من ذاكرتك'}</p>${clue}<p class="d-hint">${ar(n)} ${n <= 10 ? 'حروف' : 'حرفًا'}${T.includes(' ') ? ' · كلمتان' : ''} · تبدأ بـ <b dir="${tDir()}">${esc(T[0])}</b></p>
      <form id="dTypeF" class="d-type" dir="${tDir()}"><input id="dType" dir="${tDir()}" lang="${AR() ? 'ar' : 'en'}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="اكتب الكلمة"><button type="submit" class="d-btn">✅</button></form>
      ${AR() ? '<p class="d-note">على الآيباد: اضغط 🌐 في لوحة المفاتيح لتغيّرها إلى العربية</p>' : ''}`;
  }
  M().innerHTML = head + `<div class="d-card">${body}<div id="dFb" class="d-fb" aria-live="polite"></div></div>`;
  if (mode === 'tiles') bindTiles(T);
  if (mode === 'type') { const f = $('dTypeF'); f.onsubmit = e => { e.preventDefault(); const v = $('dType').value.trim(); if (v) answer(same(v, T), v); }; setTimeout(() => $('dType').focus(), 50); }
}
function bindTiles(T) {
  const target = AR() ? T : T.toLowerCase(), built = [];
  const view = () => { $('dSlots').querySelectorAll('i').forEach((s, k) => { s.textContent = built[k] ? built[k].c : ''; s.classList.toggle('f', !!built[k]); }); };
  M().querySelectorAll('.d-tile-l').forEach(b => b.onclick = () => {
    if (b.disabled || built.length >= T.length) return;
    built.push({ c: b.dataset.c, b }); b.disabled = true; HS.fx('tap'); view();
    if (built.length === T.length) $('dCheck').click();
  });
  $('dUndo').onclick = () => { const t = built.pop(); if (t && t.b) t.b.disabled = false; view(); };
  $('dCheck').onclick = () => { const v = built.map(t => t.c).join(''); if (v.length < T.length) return; answer(v === target, v); };
}
/** corrective feedback: the right spelling, with the letters the child got wrong marked */
function diffHtml(v, w) {
  const a = AR() ? stripHarakat(v) : v.toLowerCase(), b = AR() ? w : w.toLowerCase();
  return `<div class="d-diff" dir="${tDir()}">${[...w].map((c, i) => `<i class="${(a[i] || '') === b[i] ? '' : 'bad'}">${c === ' ' ? '&nbsp;' : esc(c)}</i>`).join('')}</div>`;
}
function answer(ok, given) {
  const c = P.cur, x = c.x;
  if (c.done) return;
  M().querySelectorAll('.d-opt').forEach(b => { b.disabled = true; if (b.dataset.ok === 'true') b.classList.add('ok'); });
  c.done = true;
  const pair = `<span dir="${tDir()}">${esc(tgt(x))}</span> = <span dir="${sDir()}">${esc(src(x))}</span>`;
  if (ok) {
    HS.srs.record(NS(), x.id, true); P.ok++; HS.addStars(1 + P.combo.hit());
    HS.fx('ok');
    $('dFb').innerHTML = `<div class="good">🎉 ${HS.one(AR() ? ['ممتاز!', 'أحسنت!', 'رائع!', 'Great!'] : ['Great!', 'Well done!', 'Super!', 'Excellent!'])} ${pair}</div><p class="ex" dir="ltr">${hiWord(x.ex, x.w)}</p>
      <button type="button" class="d-btn" id="dNext">التالي ←</button>`;
  } else {
    HS.srs.record(NS(), x.id, false); P.combo.miss(); HS.fx('no'); P.retry.push(x.id);
    $('dFb').innerHTML = `<div class="bad">✋ الصحيح:</div>
      ${given ? `${diffHtml(given, tgtPlain(x))}<p class="d-note">الحروف الحمراء هي التي تحتاج انتباهًا</p>` : `<div class="d-big">${pair}</div>`}
      <p class="d-note">سنعيدها في آخر التدريب 🔁</p><button type="button" class="d-btn" id="dNext">التالي ←</button>`;
  }
  $('dNext').onclick = () => { P.i++; nextItem(); };
  $('dNext').focus();
}
function endPractice() {
  HS.party();
  M().innerHTML = `<div class="d-card center"><div class="d-bigem">🏆</div><h2>أحسنت!</h2><p>تدرّبت على كلمات جديدة. كل كلمة تعود لك بعد أيام حتى تثبت في ذاكرتك.</p>
    <div class="d-actions"><button type="button" class="d-btn" data-a="practice">🔁 تدريب جديد</button><button type="button" class="d-btn sec" data-a="home">🏠 القاموس</button></div></div>`;
  P = null;
}

/* ---------- events ---------- */
ROOT.addEventListener('click', e => {
  const t = e.target.closest('button,[data-w]'); if (!t || !ROOT.contains(t)) return;
  const ds = t.dataset;
  if (ds.say) { e.stopPropagation(); return sayEn(ds.say); }
  if (t.id === 'dHome') { back = []; return go(home); }
  if (ds.a === 'back') return goBack();
  if (ds.a === 'home') { back = []; return go(home); }
  if (ds.a === 'practice') return go(practice);
  if (ds.a === 'mine') return go(list, 'mine');
  if (ds.a === 'topics') return go(topics);
  if (ds.a === 'az') return go(az);
  if (ds.a === 'dice') {          // 🎲 another random word: on the home card it swaps the card, on a word page it opens the new word
    e.stopPropagation(); HS.fx('tap');
    if (t.closest('.d-wod')) { wodPick = randomWord(wordOfDay().id).id; return home(); }
    const cur = M().querySelector('[data-mine]'); back.pop(); return go(word, randomWord(cur && cur.dataset.mine).id);
  }
  if (ds.mode) { D().mode = ds.mode; HS.save(); HS.fx('tap'); return home(); }
  if (ds.lv !== undefined) { D().diff = +ds.lv; wodPick = null; HS.save(); return home(); }
  if (ds.t) return go(list, 't', ds.t);
  if (ds.l) return go(list, 'l', ds.l);
  if (ds.navW) { back.pop(); return go(word, ds.navW, (M().dataset.ids || '').split('\n')); }
  if (ds.w) return go(word, ds.w, t.classList.contains('d-row') ? (M().dataset.ids || '').split('\n') : null);
  if (ds.mine) { const d = D(), i = d.mine.indexOf(ds.mine); if (i >= 0) d.mine.splice(i, 1); else { d.mine.push(ds.mine); HS.toast('⭐ أُضيفت إلى كلماتي'); } HS.save(); return word(ds.mine, (M().dataset.ids || '').split('\n')); }
  if (ds.one) return go(practice, ds.one);
  if (t.classList.contains('d-opt') && P && P.cur && !P.cur.done) {
    if (ds.ok === 'true') answer(true); else { t.classList.add('no'); t.disabled = true; answer(false); }
  }
});

APPS.dict = {
  open() { refreshStars(); back = []; wodPick = null; go(home); },
  close() { HS.stopSpeak(); },
  /** parent page: words seen / learned and accuracy, for each direction */
  report(pid) {
    const one = ns => { const s = (HS.data(ns, pid).srs) || {}, ids = Object.keys(s);
      const c = ids.reduce((a, id) => a + s[id].c, 0), w = ids.reduce((a, id) => a + s[id].w, 0);
      return { seen: ids.length, learned: ids.filter(id => s[id].b >= 3).length, acc: c + w ? c / (c + w) : 0 }; };
    const d = HS.data('dict', pid), en = one('dict'), arr = one('dictar');
    return { ...en, ar: arr, mine: (d.mine || []).length, total: WORDS.length, spell: spellReport(pid) };
  }
};
