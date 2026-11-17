/* ============================================================
   KINDERGARTEN APP: learn cards + 10 voice-led games.
   Design for 4–5 year olds (see README "Why it works this way"):
   - everything is spoken; she never has to read
   - big tap targets; drag also works, and tap-then-tap always works
   - a wrong tap never ends the question: she just tries again
   - difficulty adapts: up a level after a strong round, down if she struggles,
     aiming at about 80% success
   ============================================================ */
const { AR, EN, NUM, COL, SHP, SHPC, ANI, COUNT_EM, OBJ_COL, OBJ_SHP, ANI_Q, GROUPS, GROUPS_N, PAT, SHP_AR_DEF, BASKETS, P } = APPDATA.kg;
const $ = id => document.getElementById(id);
const { shuffle, pick, one } = HS;
const rnd = n => Math.floor(Math.random() * n);
/** next item from a no-repeat shuffle bag for the current game, level and language */
const bag = list => HS.bag(`kg-${G.k}-${G.lv}-${LANG}`, list);
const say = parts => HS.speak(parts);
let LANG = 'ar';
const K = () => HS.data('kg');                 // this child's saved data for this app
const ROUNDS = 5;

function refreshStars() {}   // stars show in the site header

/* ---------- nav ---------- */
let tmr = null;
function show(v) { ROOT.querySelectorAll('.view').forEach(s => s.classList.toggle('on', s.id === 'k-' + v)); window.scrollTo(0, 0); clearTimeout(tmr); HS.stopSpeak(); }
/* the activity language also decides which name the cards show (one language at a time) */
function showLang() { ROOT.classList.toggle('L-en', LANG === 'en'); ROOT.classList.toggle('L-ar', LANG !== 'en'); }
function setLang(l, save) {
  LANG = l === 'en' ? 'en' : 'ar'; if (save) { K().lang = LANG; HS.save(); } showLang();
  ROOT.querySelectorAll('[data-lang]').forEach(x => { x.classList.toggle('on', x.dataset.lang === LANG); x.setAttribute('aria-pressed', x.dataset.lang === LANG); });
  $('gLetEm').textContent = LANG === 'ar' ? 'أ ؟' : 'A ?'; $('gLetEm').style.direction = LANG === 'ar' ? 'rtl' : 'ltr';
}
ROOT.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang, true));
/* every screen is a route: #app-kg · #app-kg-learn-<set> · #app-kg-game-<game> (refresh and Back work) */
ROOT.querySelectorAll('[data-learn]').forEach(b => b.onclick = () => HS.nav.go('app-kg-learn-' + b.dataset.learn));
ROOT.querySelectorAll('[data-game]').forEach(b => b.onclick = () => HS.nav.go('app-kg-game-' + b.dataset.game));
const gameName = k => { const b = ROOT.querySelector(`[data-game="${k}"] b.ar`); return b ? b.textContent : ''; };   // header and parent page: Arabic interface
const LEARN_NAMES = { ar: ['الحروف العربية', 'Arabic Letters'], en: ['الحروف الإنجليزية', 'English Letters'], num: ['الأرقام', 'Numbers'], col: ['الألوان', 'Colors'], shp: ['الأشكال', 'Shapes'], ani: ['الحيوانات', 'Animals'] };
const learnName = (k, l = 'ar') => (LEARN_NAMES[k] || [])[l === 'en' ? 1 : 0];

const swatch = (c, size = 84) => `<div class="swatch" style="width:${size}px;height:${size}px;background:${c[0]};${c[0] === '#fff' ? 'border:3px solid #ddd' : ''}"></div>`;
const shape = (s, i, size = 84) => `<div class="shape"><svg viewBox="0 0 100 100" style="width:${size}px;height:${size}px" fill="${SHPC[i % SHPC.length]}" aria-hidden="true">${s[3]}</svg></div>`;

/* ---------- learn ---------- */
let LD = null, cardI = 0;
const NUMS_1 = [1, 2, 3, 4, 5], NUMS_2 = [3, 4, 5, 6, 7, 8, 9, 10];
const SUMS = []; for (let a = 1; a <= 5; a++) for (let b = 1; b <= Math.min(4, 9 - a); b++) SUMS.push([a, b]);
const PAT_UNITS = { 1: [[0, 1]], 2: [[0, 1, 2], [0, 0, 1], [0, 1, 1]], 3: [[0, 0, 1, 1], [0, 1, 2, 3], [0, 1, 1, 2], [0, 1, 0, 2]] };
const EN_FIRST = EN.filter(x => x[0] !== 'X');
const SETS = { ar: AR, en: EN, num: NUM, col: COL, shp: SHP, ani: ANI };
function learn(k) {
  $('lTitle').textContent = learnName(k, LANG); LD = k;
  const cell = {
    ar: x => `<span class="big">${x[0]}</span><span class="em">${x[3]}</span>`,
    en: x => `<span class="big" style="direction:ltr">${x[0]}${x[0].toLowerCase()}</span><span class="em">${x[2]}</span>`,
    num: x => `<span class="big">${x[1]}</span><small>${x[0]}</small>`,
    col: x => `${swatch(x, 56)}<small>${x[1]}</small><small class="en">${x[2]}</small>`,
    shp: (x, i) => `${shape(x, i, 58)}<small>${x[1]}</small><small class="en">${x[2]}</small>`,
    ani: x => `<span class="em" style="font-size:46px">${x[0]}</span><small>${x[1]}</small><small class="en">${x[2]}</small>`
  }[k];
  $('lGrid').innerHTML = SETS[k].map((x, i) => `<button type="button" class="cell" data-i="${i}">${cell(x, i)}</button>`).join('');
  $('lGrid').querySelectorAll('.cell').forEach(c => c.onclick = () => openCard(+c.dataset.i));
  show('learn');
}
function openCard(i) {
  cardI = i; const k = LD; let top = '', mid = '', w = '', w2 = '', sp = [];
  if (k === 'ar') { const x = AR[i]; top = x[0]; mid = x[3]; w = `${x[0]}… ${x[2]}`; sp = [[x[1], 'ar'], [x[2], 'ar']]; }
  if (k === 'en') { const x = EN[i]; top = x[0] + x[0].toLowerCase(); mid = x[2]; w2 = x[0] === 'X' ? 'bo<b>x</b> ends with X' : `${x[0]} is for ${x[1]}`; sp = x[0] === 'X' ? [['X', 'en'], ['box ends with X', 'en']] : [[x[0], 'en'], [`${x[0]} is for ${x[1]}`, 'en']]; }
  if (k === 'num') { const x = NUM[i]; const em = COUNT_EM[i % COUNT_EM.length]; top = `${x[1]} <span style="font-size:70px;opacity:.6">${x[0]}</span>`; mid = `<div style="font-size:40px;line-height:1.3">${em.repeat(x[0])}</div>`; w = x[2]; w2 = x[3]; sp = [[x[2], 'ar'], [x[3], 'en']]; }
  if (k === 'col') { const x = COL[i]; mid = `<div style="display:flex;justify-content:center">${swatch(x, 150)}</div>`; w = x[1]; w2 = x[2]; sp = [[x[1], 'ar'], [x[2], 'en']]; }
  if (k === 'shp') { const x = SHP[i]; mid = `<div style="display:flex;justify-content:center">${shape(x, i, 160)}</div>`; w = x[1]; w2 = x[2]; sp = [[x[1], 'ar'], [x[2], 'en']]; }
  if (k === 'ani') { const x = ANI[i]; mid = x[0]; w = x[1]; w2 = x[2]; sp = [[x[1], 'ar'], [x[2], 'en']]; }
  const n = SETS[k].length;
  $('bc').innerHTML = `${top ? `<div class="L" ${k === 'en' ? 'style="direction:ltr"' : ''}>${top}</div>` : ''}<div class="E">${mid}</div>${w ? `<div class="W">${w}</div>` : ''}${w2 ? `<div class="W2">${w2}</div>` : ''}
   <div class="row"><button type="button" class="btn gr" id="cPrev" aria-label="السابق">→</button><button type="button" class="btn" id="cSay" aria-label="استمع">🔊</button><button type="button" class="btn gr" id="cNext" aria-label="التالي">←</button><button type="button" class="btn pk" id="cClose" aria-label="إغلاق">✖</button></div>`;
  $('ov').classList.add('on'); say(sp);
  $('cSay').onclick = () => say(sp);
  $('cNext').onclick = () => openCard((cardI + 1) % n);
  $('cPrev').onclick = () => openCard((cardI - 1 + n) % n);
  $('cClose').onclick = () => { $('ov').classList.remove('on'); HS.stopSpeak(); };
}
$('ov').onclick = e => { if (e.target.id === 'ov') { $('ov').classList.remove('on'); HS.stopSpeak(); } };

/* ---------- game frame: levels, rounds, adapting difficulty ---------- */
let G = null;
const lang = () => LANG === 'ar' ? 'ar' : 'en';
const praise = () => [[one(LANG === 'ar' ? HS_PHRASES.praiseF.ar : HS_PHRASES.praise.en), lang()]];
function startGame(k) {
  const d = K(); d.lv = d.lv || {};
  G = { k, round: 0, lv: d.lv[k] || 1, hist: [], combo: HS.makeCombo(), max: 3, roundN: ROUNDS };
  HS.markPractice(); show('game');
  if (THINK_ROUNDS[k]) return thinkStart(k);
  if (k === 'memory') return memoryGame(); if (k === 'basket') return basketGame();
  nextQ();
}
function setLevel(l, silent) { G.lv = l; K().lv[G.k] = l; HS.save(); G.round = 0; G.hist = []; if (!silent) restart(); }
function restart() { if (THINK_ROUNDS[G.k]) thinkStart(G.k); else if (G.k === 'memory') memoryGame(); else if (G.k === 'basket') basketGame(); else nextQ(); }
/** the child sees how far along the path they are, not level numbers to pick from (levels adapt by themselves;
    a parent can set one on the parent page) */
function levelBar() {
  const max = G.max || 3, n = Math.min(G.lv, max);
  $('gLv').innerHTML = `<span class="kg-path" role="img" aria-label="التحدي ${HS.toAr(n)} من ${HS.toAr(max)}">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'f' : ''}${i === n - 1 ? ' now' : ''}"></i>`).join('')}</span>`;
}
function dots() { $('gDots').innerHTML = Array.from({ length: G.roundN || ROUNDS }, (_, i) => `<i class="${i < G.round ? 'f' : ''}"></i>`).join(''); }
/** record one finished question: firstTry = answered right with no wrong taps */
function track(firstTry) {
  G.hist.push(firstTry ? 1 : 0); if (G.hist.length > (G.roundN || ROUNDS)) G.hist.shift();
  const d = K(); d.stats = d.stats || {}; const s = d.stats[G.k] = d.stats[G.k] || { c: 0, w: 0 };
  firstTry ? s.c++ : s.w++; HS.save();
  if (firstTry) HS.addStars(1 + G.combo.hit()); else { G.combo.miss(); HS.addStars(1); }
}
/** after a round of 5: move up if strong (≥80% first try), down if struggling (<50%) */
function endOfRound() {
  const acc = G.hist.reduce((a, b) => a + b, 0) / Math.max(1, G.hist.length);
  HS.party();
  if (acc >= .8 && G.lv < (G.max || 3)) { setLevel(G.lv + 1, true); setTimeout(() => say([[HS_PHRASES.levelUp[lang()], lang()]]), 400); HS.toast('⭐ تحدٍّ جديد أصعب قليلًا!'); }
  else if (acc < .5 && G.lv > 1) { setLevel(G.lv - 1, true); setTimeout(() => say([[HS_PHRASES.levelDown[lang()], lang()]]), 400); }
  G.round = 0; G.hist = [];
}

/* ---------- question games (one picture/word, pick the answer) ---------- */
function nearNums(ans, n, max) { const s = new Set([ans]); let d = 1; while (s.size < n && d <= max) { [ans + d, ans - d].forEach(x => { if (s.size < n && x >= 1 && x <= max) s.add(x); }); d++; } return shuffle([...s]); }
function nextQ() {
  $('gArea').innerHTML = '<div class="opts" id="gOpts"></div>';
  const k = G.k, ar = LANG === 'ar', L = G.lv, N = L >= 2 ? 4 : 3, l = lang();
  let q = '', showH = '', opts = [], ansIdx = 0, ltr = !ar; G.say2 = null;
  const ask = (fn, ...a) => { q = fn[l](...a); };
  if (k === 'letters') {
    if (ar) { const a = bag(AR), o = pick(AR, N, a); ask(P.letter, a); opts = o.map(x => x[0]); ansIdx = o.indexOf(a); }
    else { const a = bag(EN), o = pick(EN, N, a); ask(P.letter, a); opts = o.map(x => L === 3 && Math.random() < .5 ? x[0].toLowerCase() : x[0]); ansIdx = o.indexOf(a); }
  }
  if (k === 'first') {
    if (ar) { const a = bag(AR), o = pick(AR, N, a); showH = a[3]; ask(P.first, a); opts = o.map(x => x[0]); ansIdx = o.indexOf(a); }
    else { const pool = EN_FIRST, a = bag(pool), o = pick(pool, N, a); showH = a[2]; ask(P.first, a); opts = o.map(x => x[0]); ansIdx = o.indexOf(a); }
  }
  if (k === 'count') {
    const em = HS.bag('kg-count-em', COUNT_EM);
    if (L < 3) {
      const n = bag(L === 1 ? NUMS_1 : NUMS_2), o = nearNums(n, N, 10);
      showH = `<div style="font-size:${n > 6 ? 42 : 54}px;line-height:1.3">${Array.from({ length: n }, () => `<span style="display:inline-block;transform:rotate(${rnd(40) - 20}deg)">${em}</span>`).join(' ')}</div>`;
      ask(P.count); opts = o.map(x => ar ? NUM[x - 1][1] : String(x)); ansIdx = o.indexOf(n); G.say2 = [[ar ? NUM[n - 1][2] : NUM[n - 1][3], l]];
    } else {
      const [a, b] = bag(SUMS), sum = a + b, o = nearNums(sum, N, 10);
      showH = `<div style="font-size:40px;line-height:1.3">${em.repeat(a)} <b style="color:var(--t-purple)">+</b> ${em.repeat(b)}</div>`;
      ask(P.add, a, b); q = ar ? `${NUM[a - 1][1]} + ${NUM[b - 1][1]} = ؟` : `${a} + ${b} = ?`;
      G.sp = [[P.add[l](a, b), l]];
      opts = o.map(x => ar ? NUM[x - 1][1] : String(x)); ansIdx = o.indexOf(sum); G.say2 = [[ar ? NUM[sum - 1][2] : NUM[sum - 1][3], l]];
    }
  }
  if (k === 'col') {
    if (L < 3) { const a = bag(COL), o = pick(COL, N, a); ask(P.color, a); opts = o.map(c => swatch(c)); ansIdx = o.indexOf(a); }
    else { const ob = bag(OBJ_COL), a = COL[ob[3]], o = pick(COL, N, a); showH = ob[0]; ask(P.objColor, ob); opts = o.map(c => swatch(c)); ansIdx = o.indexOf(a); G.say2 = [[ar ? a[1] : a[2], l]]; }
  }
  if (k === 'shp') {
    if (L < 3) { const a = bag(SHP), o = pick(SHP, N, a), c = rnd(6); ask(P.shape, a); opts = o.map((x, i) => shape(x, L === 2 ? c : i + rnd(6))); ansIdx = o.indexOf(a); }
    else { const g = bag(OBJ_SHP), a = SHP[g[0]], others = shuffle(OBJ_SHP.filter(x => x !== g)).slice(0, N - 1).map(x => one(x[1])), ans = one(g[1]), o = shuffle([ans, ...others]); ask(P.objShape, a); opts = o; ansIdx = o.indexOf(ans); }
  }
  if (k === 'ani') {
    if (L < 3) { const a = bag(ANI), o = pick(ANI, N, a); ask(P.animal, a); opts = o.map(x => x[0]); ansIdx = o.indexOf(a); }
    else { const t = bag(ANI_Q), pool = ANI.map(x => x[0]).concat(['🐝']).filter(x => !t[3].includes(x)), o = shuffle([t[2], ...shuffle(pool).slice(0, N - 1)]); q = ar ? t[0] : t[1]; opts = o; ansIdx = o.indexOf(t[2]); }
  }
  if (k === 'odd') {
    const gi = GROUPS.indexOf(bag(GROUPS)); let gj = rnd(GROUPS.length); while (gj === gi) gj = rnd(GROUPS.length);
    const same = shuffle(GROUPS[gi]).slice(0, N - 1), diff = one(GROUPS[gj]), o = shuffle([...same, diff]);
    ask(P.odd); opts = o; ansIdx = o.indexOf(diff); G.say2 = [[P.oddWhy[l](GROUPS_N[gi]), l]];
  }
  if (k === 'pat') {
    const units = PAT_UNITS[L];
    const u = bag(units), k2 = Math.max(...u) + 1, ems = shuffle(PAT).slice(0, k2 + 1);
    const len = u.length * 2 + rnd(u.length), seq = Array.from({ length: len }, (_, i) => ems[u[i % u.length]]);
    const ans = ems[u[len % u.length]]; const o = shuffle([...new Set([ans, ...shuffle(ems)])].slice(0, N)); if (!o.includes(ans)) o[0] = ans;
    showH = `<div style="font-size:${len > 8 ? 34 : 44}px;line-height:1.4;direction:ltr">${seq.join(' ')} <span class="qmark">❓</span></div>`;
    ask(P.pattern); opts = shuffle(o); ansIdx = opts.indexOf(ans);
  }
  G.ans = ansIdx; G.first = true;
  if (!(k === 'count' && L === 3)) G.sp = [[q.replace(/<[^>]+>/g, ''), l]];
  $('gQ').textContent = q; $('gQ').style.direction = ltr ? 'ltr' : 'rtl';
  levelBar(); dots();
  $('gShow').innerHTML = showH;
  $('gOpts').className = 'opts' + (opts.length === 4 ? ' four' : '');
  const optDir = (!ar && (k === 'letters' || k === 'first' || k === 'count')) ? 'style="direction:ltr"' : '';
  $('gOpts').innerHTML = opts.map((o, i) => `<button type="button" class="opt" data-i="${i}" ${optDir}>${o}</button>`).join('');
  $('gOpts').querySelectorAll('.opt').forEach(b => b.onclick = () => answer(b));
  say(G.sp);
}
$('gSpeak').onclick = () => G && say(G.sp);
function answer(b) {
  const i = +b.dataset.i;
  if (i === G.ans) {
    $('gOpts').querySelectorAll('.opt').forEach(x => x.disabled = true);
    b.classList.add('ok'); HS.fx('ok'); track(G.first);
    say([...(G.say2 || []), ...praise()]);
    G.round++; dots();
    clearTimeout(tmr); tmr = setTimeout(() => { if (G.round >= ROUNDS) endOfRound(); nextQ(); }, G.say2 ? 2600 : 1700);
  } else {
    G.first = false; b.classList.add('no'); b.disabled = true; HS.fx('no');
    say([[LANG === 'ar' ? HS_PHRASES.retryF.ar : HS_PHRASES.retry.en, lang()], ...G.sp]);
  }
}

/* ---------- memory game: flip two cards, find pairs ---------- */
function memoryGame() {
  const L = G.lv, ar = LANG === 'ar', l = lang();
  let pairs;   // each: [faceA, faceB, sayA, sayB]
  if (L === 1) pairs = shuffle(ANI).slice(0, 3).map(a => [`<span class="mc-em">${a[0]}</span>`, `<span class="mc-em">${a[0]}</span>`, [ar ? a[1] : a[2], l], [ar ? a[1] : a[2], l]]);
  else if (L === 2) pairs = ar ? shuffle(AR).slice(0, 4).map(a => [`<span class="mc-big">${a[0]}</span>`, `<span class="mc-em">${a[3]}</span>`, [a[1], 'ar'], [a[2], 'ar']])
    : shuffle(EN.filter(x => x[0] !== 'X')).slice(0, 4).map(a => [`<span class="mc-big" style="direction:ltr">${a[0]}</span>`, `<span class="mc-em">${a[2]}</span>`, [a[0], 'en'], [a[1], 'en']]);
  else pairs = shuffle(NUM.slice(0, 6)).map(n => [`<span class="mc-big">${ar ? n[1] : n[0]}</span>`, `<span class="mc-dots">${'●'.repeat(n[0])}</span>`, [ar ? n[2] : n[3], l], [ar ? n[2] : n[3], l]]);
  const cards = shuffle(pairs.flatMap((p, i) => [{ i, face: p[0], sp: p[2] }, { i, face: p[1], sp: p[3] }]));
  let open = [], found = 0, lock = false, misses = 0;
  levelBar(); $('gDots').innerHTML = '';
  $('gQ').textContent = P.memory[l](); $('gQ').style.direction = ar ? 'rtl' : 'ltr'; $('gShow').innerHTML = '';
  G.sp = [[P.memory[l](), l]];
  $('gArea').innerHTML = `<div class="kmem c${cards.length}">${cards.map((c, k) => `<button type="button" class="mc" data-k="${k}" aria-label="بطاقة ${k + 1}"><span class="mc-in"><span class="mc-back" aria-hidden="true">⭐</span><span class="mc-face">${c.face}</span></span></button>`).join('')}</div>`;
  say(G.sp);
  $('gArea').querySelectorAll('.mc').forEach(b => b.onclick = () => {
    if (lock || b.classList.contains('up') || b.classList.contains('got')) return;
    const c = cards[+b.dataset.k]; b.classList.add('up'); open.push(b); HS.fx('tap'); say([c.sp]);
    if (open.length < 2) return;
    const [a, d] = open;
    if (cards[+a.dataset.k].i === cards[+d.dataset.k].i) {
      a.classList.add('got'); d.classList.add('got'); open = []; found++; HS.fx('ok');
      if (found === pairs.length) {
        G.hist = [misses <= pairs.length ? 1 : 0]; track(misses <= pairs.length);
        tmr = setTimeout(() => { say(praise()); G.hist = Array(ROUNDS).fill(misses <= pairs.length ? 1 : 0); endOfRound(); tmr = setTimeout(memoryGame, 2200); }, 600);
      }
    } else { misses++; lock = true; setTimeout(() => { a.classList.remove('up'); d.classList.remove('up'); open = []; lock = false; }, 1100); }
  });
}

/* ---------- basket game: drag (or tap, then tap the basket) ---------- */
function basketGame() {
  const L = G.lv, ar = LANG === 'ar', l = lang();
  const set = bag(BASKETS[L]); const items = shuffle(set.items).slice(0, L === 1 ? 6 : 8);
  let placed = 0, firsts = 0; const missed = new Set();
  levelBar(); $('gDots').innerHTML = '';
  $('gQ').textContent = P.basket[l](); $('gQ').style.direction = ar ? 'rtl' : 'ltr'; $('gShow').innerHTML = '';
  G.sp = [[P.basket[l](), l]];
  const label = b => b[2].startsWith('#') ? `<span class="bk-sw" style="background:${b[2]}"></span>` : `<span class="bk-em">${b[2]}</span>`;
  $('gArea').innerHTML = `<div class="bk-wrap"><div class="bk-pool">${items.map((it, k) => `<button type="button" class="bk-item hs-drag" data-k="${k}">${it[0]}</button>`).join('')}</div>
    <div class="bk-bins" style="grid-template-columns:repeat(${set.bins.length},minmax(0,1fr))">${set.bins.map((b, i) => `<div class="bk-bin" data-b="${i}" tabindex="0">${label(b)}<b>${ar ? b[0] : b[1]}</b><div class="bk-in"></div></div>`).join('')}</div></div>`;
  say(G.sp);
  const area = $('gArea').firstElementChild;   // fresh element each round, so drag handlers never stack up
  // tapping a basket with nothing picked says its name (helps non-readers)
  area.querySelectorAll('.bk-bin').forEach(bin => bin.addEventListener('click', () => { if (!area.querySelector('.hs-picked')) { const b = set.bins[+bin.dataset.b]; say([[ar ? b[0] : b[1], l]]); } }));
  HS.dnd(area, { item: '.bk-item', target: '.bk-bin', onDrop(el, bin) {
    const it = items[+el.dataset.k], b = +bin.dataset.b;
    if (b === it[1]) {
      el.classList.add('hs-done'); el.style.visibility = 'hidden';
      bin.querySelector('.bk-in').insertAdjacentHTML('beforeend', `<span class="hs-pop">${it[0]}</span>`);
      HS.fx('ok'); if (!missed.has(el.dataset.k)) firsts++;
      if (++placed === items.length) {
        const ok = firsts / items.length >= .8; track(ok); say(praise());
        G.hist = Array(ROUNDS).fill(ok ? 1 : 0);
        tmr = setTimeout(() => { endOfRound(); tmr = setTimeout(basketGame, 2200); }, 700);
      }
      return true;
    }
    missed.add(el.dataset.k); HS.fx('no'); bin.classList.remove('hs-shake'); void bin.offsetWidth; bin.classList.add('hs-shake');
    say([[LANG === 'ar' ? HS_PHRASES.retryF.ar : HS_PHRASES.retry.en, l]]);
    return false;
  } });
}

APPS.kg = {
  open(sub) {
    const mx = APPS.kg.levels().map(x => x.max); $('kLvRange').textContent = HS.toAr(Math.min(...mx)) + '–' + HS.toAr(Math.max(...mx));
    setLang(K().lang || LANG);   // each child's last choice
    HS.hydrateArt(ROOT); clearTimeout(tmr); HS.stopSpeak(); $('ov').classList.remove('on');
    const m = /^(learn|game)-([a-z]+)$/.exec(sub || '');
    if (m && m[1] === 'learn' && SETS[m[2]]) return learn(m[2]);
    if (m && m[1] === 'game' && ROOT.querySelector(`[data-game="${m[2]}"]`)) return startGame(m[2]);
    show('home');
  },
  /** pages below the kindergarten menu, for the site header (see src/portal/nav.js) */
  nav(sub) {
    const m = /^(learn|game)-([a-z]+)$/.exec(sub || ''); if (!m) return [];
    if (m[1] === 'learn' && SETS[m[2]]) return [{ route: 'app-kg-' + sub, title: learnName(m[2]) }];
    const n = gameName(m[2]); return n ? [{ route: 'app-kg-' + sub, title: n, focus: true }] : [];
  },
  /** counted from the menu itself, so the card on the home page never goes out of date */
  counts: () => ({ games: ROOT.querySelectorAll('[data-game]').length, learn: ROOT.querySelectorAll('[data-learn]').length }),
  /** the parent can set the level of a game (otherwise it adapts by itself) */
  levels: () => [...ROOT.querySelectorAll('[data-game]')].map(b => ({ k: b.dataset.game, name: b.querySelector('b.ar').textContent, max: THINK_ROUNDS[b.dataset.game] ? THINK_MAX[b.dataset.game] : 3 })),
  setLevel(profileId, k, lv) { const d = HS.data('kg', profileId); d.lv = d.lv || {}; d.lv[k] = lv; HS.save(); },
  close() { HS.stopSpeak(); clearTimeout(tmr); $('ov').classList.remove('on'); },
  report(profileId) {
    const d = HS.data('kg', profileId), names = { puzzle: 'الأحجية 🧩', compose: 'نركّب الشكل 🏠', where: 'أين أضعها؟ 🧭', robot: 'نخطّط ثم نحرّك 🤖', story: 'نرتّب القصة 📖', letters: 'أين الحرف؟', first: 'بأي حرف يبدأ؟', count: 'كم عددها؟', col: 'الألوان', shp: 'الأشكال', ani: 'الحيوانات', odd: 'أيّهم مختلف؟', pat: 'ماذا يأتي بعد؟', memory: 'الذاكرة', basket: 'السلال' };
    return Object.keys(names).map(k => ({ k, name: names[k], max: THINK_ROUNDS[k] ? THINK_MAX[k] : 3, lv: (d.lv || {})[k] || 0, c: ((d.stats || {})[k] || {}).c || 0, w: ((d.stats || {})[k] || {}).w || 0 }));
  }
};
