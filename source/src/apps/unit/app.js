/* ============================================================
   UNIT ENGINE: draws any unit from src/units/<id>.js
   Pages: home (journey + today's review), each lesson, cards, play, test.
   Learning design (see README "Why it works this way"):
   - retrieval practice: quizzes and games, not just re-reading
   - spaced repetition: wrong answers come back today, right ones after 1, 2, 4, 8, 16 days
   - interleaving: the full test and daily review mix all lessons
   - elaborated feedback: every answer shows a short explanation; misses are re-asked at the end
   - rewards follow mastery (badges at 80% mastery), no leaderboards
   ============================================================ */
const $ = id => document.getElementById(id);
const ar = HS.toAr, esc = HS.esc;
const LETTERS = 'أبجده';
const S = { u: null, id: '', ns: '', fcns: '', page: 'home', timers: [], iv: null };
const later = (f, ms) => S.timers.push(setTimeout(f, ms));
function stopAll() { S.timers.forEach(clearTimeout); S.timers = []; clearInterval(S.iv); S.iv = null; HS.stopSpeak(); }
const M = () => $('uMain');
const D = () => HS.data(S.ns);                       // this child's saved data for this unit
const qIds = l => S.u.questions.filter(q => !l || q.l === l).map(q => q.id);
const mastery = l => HS.srs.mastery(S.ns, qIds(l));
const pct = x => Math.round(x * 100);
const meter = x => `<div class="hs-meter ${x < .4 ? 'low' : x < .8 ? 'mid' : ''}" role="img" aria-label="الإتقان ${pct(x)}٪"><i style="width:${Math.max(3, pct(x))}%"></i></div>`;
const star = (n = 1) => HS.addStars(n);

/* ---------------- shell ---------------- */
function header() {
  $('uTitle').textContent = `${S.u.em} ${S.u.title}`;
  $('uSub').textContent = S.u.subtitle || '';
}

/* unit sections: these change the address (they are pages), so they are links with aria-current, not ARIA tabs */
const SECTIONS = () => [['home', '🗺️ الرحلة'], ...S.u.lessons.map((l, i) => [l.id, `${l.em} الدرس ${ar(i + 1)}`, mastery(l.id) >= .8]),
  ['cards', '🃏 البطاقات'], ['play', '🎮 الألعاب'], ['test', '🏆 الاختبارات']];
function tabs() {
  $('uTabs').innerHTML = SECTIONS().map(([id, label, ok]) => `<li><a class="tab ${id === S.page ? 'on' : ''}" href="#unit-${S.id}-${id}" data-p="${id}"${id === S.page ? ' aria-current="page"' : ''}>${label}${ok ? ' <span class="ck" aria-label="متقن">✓</span>' : ''}</a></li>`).join('');
}
ROOT.addEventListener('click', e => {
  const b = e.target.closest('[data-p]'); if (b) { e.preventDefault(); go(b.dataset.p); return; }
  const a = e.target.closest('[data-act]'); if (a) go(actRoute(a.dataset.act, a.dataset));
});

/* every page and activity is a route: #unit-<id>-<page>[-<activity>]
     pages: home · l1… · cards · play · test
     activities: play-s-<sort id> · play-o-<order id> · play-memory[-<lesson>] · play-speed · play-lab-<lab id> · test-final · test-review · test-<lesson id> */
function actRoute(a, d) {
  if (a === 'quiz') return 'test-' + (d.mode === 'lesson' ? d.l : d.mode);
  if (a === 'sort') return 'play-s-' + d.g;
  if (a === 'order') return 'play-o-' + d.g;
  if (a === 'memory') return 'play-memory' + (d.l ? '-' + d.l : '');
  if (a === 'speed') return 'play-speed';
  if (a === 'lab') return 'play-lab-' + d.g;
  return 'home';
}
/** what an activity route points to, or null */
function findAct(u, page, rest) {
  if (!rest) return null;
  if (page === 'test') {
    if (rest === 'final') return { title: '🏆 الاختبار الشامل', run: () => startQuiz('final') };
    if (rest === 'review') return { title: '📅 مراجعة اليوم', run: () => startQuiz('review') };
    const i = u.lessons.findIndex(l => l.id === rest);
    return i < 0 ? null : { title: `✏️ اختبار الدرس ${ar(i + 1)}`, run: () => startQuiz('lesson', rest) };
  }
  if (page !== 'play') return null;
  let m;
  if ((m = /^s-(.+)$/.exec(rest))) { const g = (u.games.sort || []).find(x => x.id === m[1]); return g && { title: g.title, run: () => gameSort(g) }; }
  if ((m = /^o-(.+)$/.exec(rest))) { const g = (u.games.order || []).find(x => x.id === m[1]); return g && { title: g.title, run: () => gameOrder(g) }; }
  if ((m = /^memory(?:-(.+))?$/.exec(rest))) return { title: '🧠 لعبة الذاكرة', run: () => gameMemory(m[1]) };
  if (rest === 'speed') return { title: '⚡ تحدّي السرعة', run: () => speedRound() };
  if ((m = /^lab-(.+)$/.exec(rest)) && LABS[u.id] && LABS[u.id][m[1]]) { const L = LABS[u.id][m[1]]; return { title: L.title, run: () => L.run(M(), L) }; }
  return null;
}
const PAGES = u => ['home', 'cards', 'play', 'test', ...u.lessons.map(l => l.id)];
function splitSub(u, rest) {
  const m = /^([a-z0-9]+)(?:-(.+))?$/.exec(rest || 'home') || [];
  const page = PAGES(u).includes(m[1]) ? m[1] : 'home';
  return { page, act: page === m[1] ? m[2] || '' : '' };
}
/** go to a page or activity of this unit (adds a history entry; the router then calls render) */
function go(page) { HS.nav.go(`unit-${S.id}-${page}`); }
/** draw a page or start an activity (called by APPS.unit.open on every route change) */
function render(page, actKey) {
  stopAll();
  S.page = page;
  const A = findAct(S.u, page, actKey);
  ROOT.classList.toggle('focus', !!A);   // in a game or quiz only the task shows (the site header keeps Back and the title)
  tabs(); header();
  if (A) A.run();
  else {
    const L = S.u.lessons.find(l => l.id === page);
    if (L) renderLesson(L); else ({ home: renderHome, cards: renderCards, play: renderPlay, test: renderTest })[page]();
  }
  window.scrollTo({ top: 0 });
}

/* ---------------- home ---------------- */
function badges() {
  const d = D(); const best = (d.best || {}).final;
  return [
    ...S.u.lessons.map((l, i) => [l.em, `إتقان الدرس ${ar(i + 1)}`, mastery(l.id) >= .8]),
    [HS.art('badge-champion-earned', { small: true, fb: '🏆' }), 'بطل الاختبار الشامل', best && best.s / best.t >= .85],
    [HS.art('badge-streak3-earned', { small: true, fb: '🔥' }), '٣ أيام متتالية', HS.dayStreak() >= 3],
    [HS.art('badge-stars100-earned', { small: true, fb: '⭐' }), '١٠٠ نجمة', HS.earned() >= 100]
  ];
}
function renderHome() {
  const p = HS.current() || { name: '', avatar: '🙂' };
  const all = qIds(), due = HS.srs.due(S.ns, all), seen = all.filter(id => HS.srs.seen(S.ns, id)).length, streak = HS.dayStreak();
  let review;
  if (due.length) review = `<div class="card due">${HS.mascot('thinking', { small: true, cls: 'due-art' })}<h3>📅 مراجعة اليوم</h3><p class="lead">${HS.count(due.length, HS.N.q)} ${due.length > 1 ? 'تحتاج' : 'يحتاج'} مراجعة الآن (أخطأت فيها أو حان وقت تذكّرها).</p><button type="button" class="btn" data-act="quiz" data-mode="review">ابدأ المراجعة (${HS.count(Math.min(10, due.length), HS.N.q)})</button></div>`;
  else if (!seen) review = `<div class="card due">${HS.mascot('point', { small: true, cls: 'due-art' })}<h3>🚀 ابدأ من هنا</h3><p class="lead">اقرأ الدرس الأول، ثم أجب عن أسئلته. سنحفظ ما تحتاج مراجعته.</p><button type="button" class="btn" data-p="${S.u.lessons[0].id}">افتح الدرس الأول</button></div>`;
  else review = `<div class="card due ok"><h3>✅ لا توجد مراجعة مطلوبة الآن</h3><p class="lead">أحسنت! جرّب الاختبار الشامل أو تحدّي السرعة.</p><div class="row"><button type="button" class="btn" data-act="quiz" data-mode="final">الاختبار الشامل</button><button type="button" class="btn sky" data-act="speed">⚡ تحدّي السرعة</button></div></div>`;
  const total = mastery();
  M().innerHTML = `
  <div class="card hello"><div class="hello-row"><span class="big-av" aria-hidden="true">${HS.avatar(p)}</span><div><h2>أهلًا ${p.name ? 'يا ' + esc(p.name) : 'يا بطل'}! 👋</h2>
    <p class="lead">${streak ? `🔥 تعلّم متواصل: ${HS.count(streak, HS.N.day)} · ` : ''}إتقان الوحدة ${ar(pct(total))}٪</p></div></div>${meter(total)}</div>
  ${review}
  <div class="path">${S.u.lessons.map((l, i) => { const m = mastery(l.id); return `
    <button type="button" class="step ${m >= .8 ? 'done' : ''}" data-p="${l.id}"><span class="num" aria-hidden="true">${m >= .8 ? '✓' : l.em}</span>
      <span class="txt"><b>${ar(i + 1)}. ${l.title}</b><span>${l.short || ''}</span>${meter(m)}<small>الإتقان ${ar(pct(m))}٪</small></span></button>`; }).join('')}
    <button type="button" class="step" data-p="cards"><span class="num" aria-hidden="true">🃏</span><span class="txt"><b>بطاقات المصطلحات</b><span>${HS.count(S.u.glossary.length, HS.N.term)}</span></span></button>
    <button type="button" class="step" data-p="test"><span class="num" aria-hidden="true">🏆</span><span class="txt"><b>الاختبارات</b><span>اختبار شامل، اختبار لكل درس، تحدّي السرعة</span></span></button>
  </div>
  <div class="card"><h3>🏅 أوسمتك</h3><p class="lead small">الأوسمة تأتي من الإتقان الحقيقي: ٨٠٪ أو أكثر في الدرس.</p><div class="badges">${badges().map(([e, n, g]) => `<div class="badge ${g ? 'got' : ''}"><span class="em" aria-hidden="true">${e}</span><small>${n}</small>${g ? '' : '<span class="sr">لم تحصل عليه بعد</span>'}</div>`).join('')}</div></div>
  ${(S.u.parentTips || []).length ? `<details class="parent"><summary>👨‍👦 نصائح للأب</summary><ul>${S.u.parentTips.map(t => `<li>${t}</li>`).join('')}</ul></details>` : ''}`;
}

/* ---------------- lesson ---------------- */
function block(b) {
  const h = b.h ? `<h3>${b.h}</h3>` : '';
  if (b.t === 'text') return `${h}<p>${b.html}</p>`;
  if (b.t === 'tiles') return `${h}<div class="grid">${b.items.map(t => `<div class="tile t-${t.tone || 'green'}"><span class="em" aria-hidden="true">${t.em}</span><b>${t.b}</b><p>${t.p}</p></div>`).join('')}</div>`;
  if (b.t === 'chain') return `${h}<div class="chain">${b.items.map(([e, n, r], i) => `${i ? '<span class="ar" aria-hidden="true">⬅</span>' : ''}<div class="lnk"><span class="em" aria-hidden="true">${e}</span>${n}<small>${r || ''}</small></div>`).join('')}</div>${b.note ? `<p class="hint">${b.note}</p>` : ''}`;
  if (b.t === 'pyramid') { const n = b.levels.length; return `${h}${b.html ? `<p>${b.html}</p>` : ''}<div class="pyr">${b.levels.slice().reverse().map(([t, c], i) => `<div style="width:${28 + i * (60 / Math.max(1, n - 1))}%;background:${c}">${t}</div>`).join('')}</div>`; }
  if (b.t === 'html') return `${h}${b.html}`;
  if (b.t === 'model') return `${h}${b.html ? `<p>${b.html}</p>` : ''}${mathModel(b)}${b.after ? `<p>${b.after}</p>` : ''}`;   // math.js
  return '';
}
function renderLesson(L) {
  const i = S.u.lessons.indexOf(L), m = mastery(L.id);
  const games = [...S.u.games.sort.filter(g => g.l === L.id).map(g => `<button type="button" class="btn sky" data-act="sort" data-g="${g.id}">🎮 ${g.title}</button>`),
    ...S.u.games.order.filter(g => g.l === L.id).map(g => `<button type="button" class="btn sky" data-act="order" data-g="${g.id}">🎮 ${g.title}</button>`),
    ...Object.values(LABS[S.id] || {}).filter(x => x.lesson === L.id).map(x => `<button type="button" class="btn sky" data-act="lab" data-g="${x.id}">${x.title}</button>`)];
  const cards = []; let cur = null;
  L.blocks.forEach(b => { if (cur && b.t === 'tiles' && !b.h) cur.push(b); else { cur = [b]; cards.push(cur); } });
  M().innerHTML = `
  <div class="card"><h2>${L.em} الدرس ${ar(i + 1)}: ${L.title}</h2>
    <div class="idea"><span class="em" aria-hidden="true">💡</span><div><b>الفكرة الرئيسة:</b> ${L.idea}</div>
</div>
    <div class="m-row"><span>إتقانك لهذا الدرس</span><b>${ar(pct(m))}٪</b></div>${meter(m)}</div>
  ${cards.map(c => `<div class="card">${c.map(block).join('')}</div>`).join('')}
  <div class="remember"><div class="rem-head"><h3>🧠 احفظ هذا</h3></div><ul>${L.remember.map(r => `<li>${r}</li>`).join('')}</ul></div>
  <div class="row"><button type="button" class="btn" data-act="quiz" data-mode="lesson" data-l="${L.id}">✏️ اختبر نفسك في الدرس ${ar(i + 1)}</button>${games.join('')}
    <button type="button" class="btn sec" data-act="memory" data-l="${L.id}">🧠 لعبة الذاكرة</button></div>`;
}

/* ---------------- flashcards (spaced repetition too) ---------------- */
let FC = { list: [], i: 0, l: '' };
function renderCards() {
  const all = S.u.glossary.filter(g => !FC.l || g.l === FC.l);
  const box = g => HS.srs.box(S.fcns, g.term), seen = g => HS.srs.seen(S.fcns, g.term);
  const now = Date.now();
  // due first, then never seen, then known ones
  FC.list = all.slice().sort((a, b) => {
    const ra = HS.srs.rec(S.fcns, a.term), rb = HS.srs.rec(S.fcns, b.term);
    const ka = ra ? (ra.due <= now ? 0 : 2) : 1, kb = rb ? (rb.due <= now ? 0 : 2) : 1;
    return ka - kb || box(a) - box(b);
  });
  FC.i = 0;
  const known = all.filter(g => box(g) >= 2).length;
  M().innerHTML = `<div class="card"><h2>🃏 بطاقات المصطلحات</h2><p class="lead">اقرأ المصطلح وحاول تتذكّر معناه قبل أن تقلب البطاقة. البطاقات التي لا تعرفها ستعود لك أكثر.</p>
    <div class="row chips">${['', ...S.u.lessons.map(l => l.id)].map((l, i) => `<button type="button" class="chip ${FC.l === l ? 'on' : ''}" data-fcl="${l}">${l ? 'الدرس ' + ar(i) : 'الكل'}</button>`).join('')}</div>
    <div class="m-row"><span>تعرف ${ar(known)} من ${ar(all.length)}</span></div>${meter(all.length ? known / all.length : 0)}</div>
  <div class="fc" id="uFc" role="button" tabindex="0" aria-label="اقلب البطاقة"><div class="fc-in"><div class="fc-f"><span class="em" id="uFcEm"></span><b id="uFcT"></b><small>اضغط للقلب 👆</small></div><div class="fc-b"><p id="uFcD"></p></div></div></div>
  <p class="hint" id="uFcPos"></p>
  <div class="row center"><button type="button" class="btn sky" id="uFcAgain">🔁 لم أعرفها</button><button type="button" class="btn" id="uFcKnow">👍 عرفتها</button></div>`;
  ROOT.querySelectorAll('[data-fcl]').forEach(b => b.onclick = () => { FC.l = b.dataset.fcl; renderCards(); });
  const fc = $('uFc'); fc.onclick = () => fc.classList.toggle('flip');
  fc.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fc.classList.toggle('flip'); } };
  const answer = ok => { const g = FC.list[FC.i]; if (!g) return; HS.srs.record(S.fcns, g.term, ok); if (ok) { star(); HS.fx('ok'); } FC.i++; if (FC.i >= FC.list.length) { HS.party(); renderCards(); } else showCard(); };
  $('uFcKnow').onclick = () => answer(true); $('uFcAgain').onclick = () => answer(false);
  showCard();
}
function showCard() {
  const g = FC.list[FC.i], fc = $('uFc'); if (!g) return;
  fc.classList.remove('flip');
  later(() => { $('uFcEm').textContent = g.em; $('uFcT').textContent = g.term; $('uFcD').textContent = g.def; }, 120);
  $('uFcPos').textContent = `بطاقة ${ar(FC.i + 1)} من ${ar(FC.list.length)}`;
}

/* ---------------- play menu ---------------- */
function renderPlay() {
  const L = id => { const i = S.u.lessons.findIndex(l => l.id === id); return i < 0 ? '' : 'الدرس ' + ar(i + 1); };
  const all = Object.values(LABS[S.id] || {}), labs = all.filter(x => x.kind !== 'math'), maths = all.filter(x => x.kind === 'math');
  M().innerHTML = `<div class="card"><h2>🎮 الألعاب</h2><p class="lead">${maths.length ? 'في كل لعبة تحسب بنفسك، ومعك تلميح إذا احتجت.' : 'اسحب البطاقة إلى مكانها، أو اضغط عليها ثم اضغط على المكان.'}</p></div>
  ${maths.length ? `<h3 class="gp-h">🔢 ألعاب الضرب <small>نحسب ونفكّر ونفوز</small></h3><div class="game-pick">
    ${maths.map(x => `<button type="button" class="gp lab" data-act="lab" data-g="${x.id}"><span class="em">${x.em}</span><b>${x.title.replace(/^\S+\s/, '')}</b><span>${L(x.lesson)} · ${x.sub}</span></button>`).join('')}</div>` : ''}
  ${labs.length ? `<h3 class="gp-h">🧪 نفكّر ونجرّب <small>نتوقّع ثم نجرّب ونفسّر</small></h3><div class="game-pick">
    ${labs.map(x => `<button type="button" class="gp lab" data-act="lab" data-g="${x.id}"><span class="em">${x.em}</span><b>${x.title.replace(/^\S+\s/, '')}</b><span>${L(x.lesson)} · ${x.sub}</span></button>`).join('')}</div>` : ''}
  <h3 class="gp-h">🎮 نتدرّب <small>نرتّب ونصنّف ونتذكّر</small></h3>
  <div class="game-pick">
    ${S.u.games.sort.map(g => `<button type="button" class="gp" data-act="sort" data-g="${g.id}"><span class="em">${g.em}</span><b>${g.title}</b><span>${L(g.l)} · فرز</span></button>`).join('')}
    ${S.u.games.order.map(g => `<button type="button" class="gp" data-act="order" data-g="${g.id}"><span class="em">${g.em}</span><b>${g.title}</b><span>${L(g.l)} · ترتيب</span></button>`).join('')}
    <button type="button" class="gp" data-act="memory"><span class="em">🧠🃏</span><b>لعبة الذاكرة</b><span>طابق المصطلح بمعناه</span></button>
  </div>
  <h3 class="gp-h">⚡ نتحدّى <small>بسرعة ومن الذاكرة</small></h3>
  <div class="game-pick">
    <button type="button" class="gp" data-act="speed"><span class="em">⚡⏱️</span><b>تحدّي السرعة</b><span>أجب عن أكبر عدد في ٦٠ ثانية</span></button>
  </div>`;
}

/* ---------------- test menu ---------------- */
function renderTest() {
  const d = D(), best = d.best || {}, due = HS.srs.due(S.ns, qIds()).length;
  const b = k => best[k] ? `<small>أفضل نتيجة: ${ar(best[k].s)}/${ar(best[k].t)}</small>` : '';
  M().innerHTML = `<div class="card"><h2>🏆 الاختبارات</h2><p class="lead">الأسئلة تُختار حسب ما تحتاجه: الأضعف أولًا، وكل خطأ يعود لك في آخر الاختبار ثم في الأيام القادمة.</p></div>
  <div class="game-pick">
    <button type="button" class="gp" data-act="quiz" data-mode="review" ${due ? '' : 'disabled'}><span class="em">📅</span><b>مراجعة اليوم</b><span>${due ? HS.count(due, HS.N.q) + ' بانتظارك' : 'لا يوجد الآن'}</span></button>
    <button type="button" class="gp" data-act="quiz" data-mode="final"><span class="em">🏆</span><b>الاختبار الشامل</b><span>١٥ سؤالًا من كل الدروس</span>${b('final')}</button>
    ${S.u.lessons.map((l, i) => `<button type="button" class="gp" data-act="quiz" data-mode="lesson" data-l="${l.id}"><span class="em">${l.em}</span><b>اختبار الدرس ${ar(i + 1)}</b><span>${l.title}</span>${b('l:' + l.id)}</button>`).join('')}
    <button type="button" class="gp" data-act="speed"><span class="em">⚡</span><b>تحدّي السرعة</b><span>٦٠ ثانية</span>${best.speed ? `<small>أفضل نتيجة: ${ar(best.speed.s)}</small>` : ''}</button>
  </div>`;
}

/* ---------------- quiz session ---------------- */
let Q = null;
/** thinking labs per unit: LABS[unitId][labId] = { title, em, sub, kind: 'think', run(el, lab) } (see labs-*.js) */
const LABS = {};
/** written hints per unit: HINTS[unitId][qid] = [hint1, hint2, { option index: misconception }] (hints-<unit>.js) */
const HINTS = {};
function pickQuestions(mode, l) {
  const all = S.u.questions, byId = id => all.find(q => q.id === id);
  if (mode === 'lesson') return HS.srs.choose(S.ns, qIds(l), 8).map(byId);
  if (mode === 'review') {
    let ids = HS.srs.due(S.ns, qIds()).slice(0, 10);
    if (ids.length < 5) ids = ids.concat(qIds().filter(id => HS.srs.seen(S.ns, id) && HS.srs.box(S.ns, id) <= 2 && !ids.includes(id)).slice(0, 5 - ids.length));
    return HS.shuffle(ids).map(byId);
  }
  // final: equal share from each lesson (interleaved), weakest first, then mixed
  const per = Math.ceil(15 / S.u.lessons.length);
  return HS.shuffle(S.u.lessons.flatMap(L => HS.srs.choose(S.ns, qIds(L.id), per))).slice(0, 15).map(byId);
}
function startQuiz(mode, l) {
  stopAll();
  const list = pickQuestions(mode, l).filter(Boolean);
  if (!list.length) { HS.toast('لا توجد أسئلة الآن 🎉'); return; }
  Q = { mode, l, list, i: 0, score: 0, retry: [], phase: 'main', wrong: [], combo: HS.makeCombo() };
  HS.markPractice();
  renderQ();
}
function quizTitle() {
  if (Q.mode === 'review') return '📅 مراجعة اليوم';
  if (Q.mode === 'final') return '🏆 الاختبار الشامل';
  const i = S.u.lessons.findIndex(x => x.id === Q.l); return `✏️ اختبار الدرس ${ar(i + 1)}`;
}
function renderQ() {
  const list = Q.phase === 'main' ? Q.list : Q.retry;
  if (Q.i >= list.length) {
    if (Q.phase === 'main' && Q.retry.length) return retryIntro();
    return quizResult();
  }
  const q = list[Q.i];
  M().innerHTML = `<div class="card quiz">
    <div class="q-top"><h2 class="sr">${quizTitle()}</h2><span class="combo ${Q.combo.n >= 2 ? 'on' : ''}" aria-live="polite">${Q.combo.n >= 2 ? '🔥 ' + ar(Q.combo.n) : ''}</span></div>
    ${Q.phase === 'retry' ? '<p class="retry-tag">🔁 محاولة ثانية: سؤال أخطأت فيه</p>' : ''}
    <div class="meta"><span>سؤال ${ar(Q.i + 1)} من ${ar(list.length)}</span><span>✅ ${ar(Q.score)}</span></div>
    <div class="bar"><i style="width:${Q.i / list.length * 100}%"></i></div>
    <div id="uQ"></div><div class="fb" id="uFb" aria-live="polite"></div></div>`;
  renderQuestion(q, $('uQ'), (ok, info) => onAnswer(q, ok, info), { coach: true });
}
function onAnswer(q, ok, info = {}) {
  // ok = right on the first try. info.fixed = found it after a hint, info.revealed = we showed it after three tries
  const main = Q.phase === 'main';
  trackLearning(q, ok, info);
  if (main) {
    HS.srs.record(S.ns, q.id, ok);
    if (ok) { Q.score++; star(1 + Q.combo.hit()); } else { Q.combo.miss(); Q.retry.push(q); Q.wrong.push(q); if (info.fixed) star(); }
  } else if (ok || info.fixed) star();
  HS.fx(ok || info.fixed ? 'ok' : 'no');
  const fb = $('uFb'); fb.className = 'fb ' + (ok ? 'ok' : info.fixed ? 'ok fixed' : 'no');
  const right = answerText(q);
  const head = ok ? HS.one(HS_PHRASES.praise.ar) : info.fixed ? 'صحّحتها بنفسك! 👏' : 'لنتعلّمها معًا';
  fb.innerHTML = `<b>${head}</b>${info.revealed && right ? `<div class="right">الإجابة الصحيحة: <b>${right}</b></div>` : ''}<div>${q.ex || ''}</div>
    <div class="row"><button type="button" class="btn" id="uNext">${nextLabel()}</button></div>`;
  $('uNext').onclick = () => { Q.i++; renderQ(); };
  $('uNext').focus({ preventScroll: true });
  fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
/* ---------------- learning record (per child, per unit) ----------------
   D().learn = { n, first, fixed, revealed, hints, L: {lessonId: {n, first}}, mis: {qid: {choice: count}}, last } */
function learnRec() { const d = D(); d.learn = d.learn || { n: 0, first: 0, fixed: 0, revealed: 0, hints: 0, L: {}, mis: {} }; return d.learn; }
function onCoach(q, i, tries) {
  const r = learnRec(); r.hints++;
  const k = q.t === 'num' ? HS.toAr(i) : q.t === 'tf' ? (i === 0 ? 'صح' : 'خطأ') : q.t === 'pic' && q.labels ? q.labels[i] : q.o[i];
  const m = r.mis[q.id] = r.mis[q.id] || {}; m[k] = (m[k] || 0) + 1;
}
function trackLearning(q, ok, info) {
  if (Q && Q.phase !== 'main') return;          // second attempts at the end of a quiz are practice, not measurement
  const r = learnRec(); r.n++; if (ok) r.first++; if (info.fixed) r.fixed++; if (info.revealed) r.revealed++;
  const L = r.L[q.l] = r.L[q.l] || { n: 0, first: 0 }; L.n++; if (ok) L.first++;
  r.last = Date.now(); HS.save();
}
function nextLabel() { const list = Q.phase === 'main' ? Q.list : Q.retry; return Q.i + 1 < list.length ? 'التالي ←' : (Q.phase === 'main' && Q.retry.length ? 'التالي ←' : 'النتيجة 🎯'); }
function answerText(q) {
  if (q.t === 'mcq' || q.t === 'fill') return q.o[q.a];
  if (q.t === 'pic') return q.o[q.a] + (q.labels ? ' ' + q.labels[q.a] : '');
  if (q.t === 'tf') return q.a ? 'صح' : 'خطأ';
  if (q.t === 'num') return HS.toAr(q.a);
  return '';
}
function retryIntro() {
  M().innerHTML = `<div class="card result"><div class="big">${HS.mascot('encourage', { fb: '🔁' })}</div><h2>محاولة ثانية</h2><p class="lead">لنُعد الأسئلة التي أخطأت فيها (${ar(Q.retry.length)}). المحاولة الثانية تثبّت المعلومة.</p>
    <div class="row center"><button type="button" class="btn" id="uGoRetry">هيا!</button></div></div>`;
  $('uGoRetry').onclick = () => { Q.phase = 'retry'; Q.i = 0; Q.retry = HS.shuffle(Q.retry); renderQ(); };
}
function quizResult() {
  const t = Q.list.length, s = Q.score, p = s / t, d = D(); d.best = d.best || {};
  const key = Q.mode === 'final' ? 'final' : Q.mode === 'lesson' ? 'l:' + Q.l : null;
  if (key && (!d.best[key] || s / t > d.best[key].s / d.best[key].t)) d.best[key] = { s, t };
  HS.save();
  if (p >= .85) HS.party();
  const face = p === 1 ? '🏆' : p >= .85 ? '🌟' : p >= .7 ? '😊' : '💪';
  const pose = p === 1 ? 'celebrate' : p >= .85 ? 'cheer' : p >= .7 ? 'encourage' : 'sad-soft';   // Koko: big win, success, keep going, kind low score
  const msg = p === 1 ? 'علامة كاملة!' : p >= .85 ? 'ممتاز جدًا!' : p >= .7 ? 'جيد! الأخطاء ستعود لك للمراجعة.' : 'لا بأس: الأسئلة التي أخطأت فيها ستعود لك غدًا لتثبيتها.';
  const ls = [...new Set(Q.list.map(q => q.l))];
  M().innerHTML = `<div class="card result"><div class="big">${HS.mascot(pose, { fb: face })}</div><h2>${ar(s)} من ${ar(t)}</h2><p class="lead">${msg}</p>
    <div class="ml">${ls.map(l => { const L = S.u.lessons.find(x => x.id === l), i = S.u.lessons.indexOf(L), m = mastery(l); return `<div class="m-row"><span>${L.em} الدرس ${ar(i + 1)}</span><b>${ar(pct(m))}٪</b></div>${meter(m)}`; }).join('')}</div>
    <div class="row center"><button type="button" class="btn" id="uAgain">🔁 اختبار جديد</button>${Q.l ? `<button type="button" class="btn sec" data-p="${Q.l}">📖 الدرس</button>` : ''}<button type="button" class="btn sec" data-p="home">🗺️ الرحلة</button></div></div>
  ${Q.wrong.length ? `<div class="card"><h3>📝 للمراجعة</h3>${Q.wrong.map(q => `<div class="review-item"><b>${q.q}</b>${answerText(q) ? `<br>✅ ${answerText(q)}` : ''}<br>${q.ex || ''}</div>`).join('')}</div>` : ''}`;
  $('uAgain').onclick = () => startQuiz(Q.mode, Q.l);
  tabs();
}

/* ---------------- coach: hints instead of answers ----------------
   A wrong first answer never shows the right one. 1st mistake: a hint about the choice the child made
   (authored q.hint1 / q.mis[i], or the unit's own glossary definition of the chosen term). 2nd: one wrong
   option is removed + a second hint. 3rd: the answer and the explanation. Hints made from the glossary are
   dropped if they contain the right answer's words, so a hint never gives the answer away. */
const norm = t => String(t || '').replace(/[\u064B-\u0652\u0640]/g, '').replace(/\([^)]*\)/g, '').replace(/[«»:.،؟?!]/g, '').trim();
const bare = t => norm(t).replace(/^ال/, '');
function termOf(text) {   // the glossary entry an option names, if any
  const t = norm(text); if (!t) return null;
  return S.u.glossary.find(g => norm(g.term) === t || bare(g.term) === bare(t)) || null;
}
function coachHint(q, n, pickedText, used, i) {
  const h = (HINTS[S.id] || {})[q.id];   // written hints fill in what the question itself does not have
  if (h) q = Object.assign({ hint1: h[0], hint2: h[1], mis: h[2] }, q);
  const mis = q.mis && q.mis[i];   // authored: what this wrong choice usually means
  const rightWords = q.t === 'tf' ? '' : bare(q.t === 'pic' && q.labels ? q.labels[q.a] : q.o[q.a]);
  const safe = t => t && (!rightWords || !norm(t).includes(rightWords));
  const lesson = S.u.lessons.find(L => L.id === q.l);
  const inQuestion = S.u.glossary.filter(g => norm(q.q).includes(bare(g.term)) && !used.has(g.term) && safe(g.def));
  if (n === 1) {
    if (mis) return mis;
    if (q.hint1) return q.hint1;
    const g = termOf(pickedText);
    if (g && safe(g.def)) { used.add(g.term); return `اخترت «${pickedText}». تذكّر معنى «${g.term}»: ${g.def} هل هذا ما يصفه السؤال؟`; }
    if (inQuestion[0]) { used.add(inQuestion[0].term); return `تذكّر: ${inQuestion[0].term}: ${inQuestion[0].def} اقرأ السؤال مرة ثانية.`; }
    const where = !lesson ? '' : safe(lesson.title) ? `من درس «${lesson.title}»` : `من الدرس ${ar(S.u.lessons.indexOf(lesson) + 1)}`;   // a lesson title can be the answer itself
    return `فكّر مرة ثانية. هذا السؤال ${where}: اقرأه كلمة كلمة وابحث عن الكلمة المهمة.`;
  }
  if (mis || q.hint2) return [mis, q.hint2 && 'تلميح: ' + q.hint2].filter(Boolean).join(' ');
  if (inQuestion[0]) { used.add(inQuestion[0].term); return `تلميح ثانٍ: ${inQuestion[0].term}: ${inQuestion[0].def}`; }
  return 'تلميح ثانٍ: أبعدنا خيارًا خاطئًا. قارن الخيارات الباقية بالسؤال.';
}

/* ---------------- question renderers ----------------
   Each draws question q into el and calls done(correct) once. */
function renderQuestion(q, el, done, opt = {}) {
  // grade 3–4 units are read, not listened to: no speech buttons (the parent asked for it)
  const head = txt => `<div class="q-line"><div class="q">${txt}</div></div>`;
  let answered = false;
  const finish = (ok, info) => { if (answered) return; answered = true; done(ok, info || {}); };
  const choice = (opts, a, render, cls = '') => {
    const order = opt.keep ? opts.map((_, i) => i) : HS.shuffle(opts.map((_, i) => i));
    el.insertAdjacentHTML('beforeend', `<div class="opts ${cls}">${order.map((i, k) => `<button type="button" class="opt" data-i="${i}">${render(opts[i], i, k)}</button>`).join('')}</div>`);
    let tries = 0; const used = new Set();
    const reveal = () => el.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (+x.dataset.i === a) x.classList.add('ok'); });
    el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (answered || b.disabled) return;
      const i = +b.dataset.i, ok = i === a;
      if (opt.onPick) opt.onPick(i, ok);
      if (!opt.coach) { reveal(); if (!ok) b.classList.add('no'); return finish(ok); }
      if (ok) { reveal(); return finish(tries === 0, { tries, fixed: tries > 0 }); }
      tries++; b.classList.add('no'); b.disabled = true; b.setAttribute('aria-label', b.textContent.trim() + ' (ليست الإجابة)');
      HS.fx('no'); if (opt.onWrong) opt.onWrong(i);
      const left = () => [...el.querySelectorAll('.opt:not([disabled])')];
      if (tries >= 3 || (tries >= 2 && left().length <= 1)) { reveal(); return finish(false, { tries, revealed: true }); }
      if (tries === 2 && left().length >= 3) { const g = left().find(x => +x.dataset.i !== a); g.disabled = true; g.classList.add('gone'); g.setAttribute('aria-label', g.textContent.trim() + ' (أُبعد)'); }
      const pickedText = q.t === 'pic' && q.labels ? q.labels[i] : q.t === 'tf' ? '' : opts[i];
      let box = el.querySelector('.coach'); if (!box) { el.insertAdjacentHTML('beforeend', '<div class="coach" role="status"></div>'); box = el.querySelector('.coach'); }
      box.innerHTML = `<span class="coach-ic" aria-hidden="true">💡</span><span>${coachHint(q, tries, pickedText, used, i)}</span>`;
      box.classList.remove('hs-pop'); void box.offsetWidth; box.classList.add('hs-pop');
      onCoach(q, i, tries);
      const first = left()[0]; if (first) first.focus({ preventScroll: true });
    });
  };
  if (q.t === 'mcq') { el.innerHTML = head(q.q); choice(q.o, q.a, (o, i, k) => `<span class="ltr-badge">${LETTERS[k]}</span>${o}`); }
  else if (q.t === 'tf') { el.innerHTML = head(q.q) + '<p class="hint">هل العبارة صحيحة؟</p>'; opt.keep = true; choice(['صح ✔️', 'خطأ ✖️'], q.a ? 0 : 1, o => o, 'tf'); }
  else if (q.t === 'fill') {
    el.innerHTML = head(q.q.replace('____', '<span class="blank" id="uBlank">؟</span>'));
    opt.onPick = (i, ok) => { const b = $('uBlank'); b.textContent = q.o[i]; b.className = 'blank ' + (ok ? 'ok' : 'no');
      if (!ok) later(() => { if (b.classList.contains('ok')) return; b.textContent = opt.coach ? '؟' : q.o[q.a]; b.className = opt.coach ? 'blank' : 'blank ok'; }, 900); };
    choice(q.o, q.a, o => o, 'chips-opts');
  }
  else if (q.t === 'num') numQuestion(q, el, finish, opt);   // math.js
  else if (q.t === 'pic') { el.innerHTML = head(q.q); choice(q.o, q.a, (o, i) => `<span class="pic">${o}</span>${q.labels ? `<small>${q.labels[i]}</small>` : ''}`, 'pics'); }
  else if (q.t === 'match') {
    const n = q.pairs.length; let mistakes = 0, matched = 0;
    el.innerHTML = head(q.q) + `<p class="hint">اسحب كل بطاقة إلى ما يناسبها، أو اضغط عليها ثم على المكان.</p>
      <div class="mt-pool">${HS.shuffle(q.pairs.map((p, i) => i)).map(i => `<button type="button" class="mt-item hs-drag" data-i="${i}">${q.pairs[i][0]}</button>`).join('')}</div>
      <div class="mt-rows">${HS.shuffle(q.pairs.map((p, i) => i)).map(i => `<div class="mt-row" data-i="${i}" tabindex="0"><span class="mt-slot">؟</span><span>${q.pairs[i][1]}</span></div>`).join('')}</div>`;
    HS.dnd(el, { item: '.mt-item', target: '.mt-row', onDrop(it, row) {
      if (row.classList.contains('done')) return false;
      if (it.dataset.i === row.dataset.i) {
        row.classList.add('done', 'hs-pop'); row.querySelector('.mt-slot').textContent = q.pairs[+it.dataset.i][0]; it.classList.add('hs-done'); HS.fx('ok');
        if (++matched === n) finish(mistakes === 0);
        return true;
      }
      mistakes++; HS.fx('no'); row.classList.remove('hs-shake'); void row.offsetWidth; row.classList.add('hs-shake'); return false;
    } });
  }
  else if (q.t === 'order') {
    const n = q.items.length; let next = 0, mistakes = 0;
    el.innerHTML = head(q.q) + `<p class="hint">اضغط على العناصر بالترتيب الصحيح.</p>
      <div class="slots">${q.items.map((_, i) => `${i ? '<span class="ar" aria-hidden="true">⬅</span>' : ''}<div class="slot">${ar(i + 1)}</div>`).join('')}</div>
      <div class="pool">${HS.shuffle(q.items.map((_, i) => i)).map(i => `<button type="button" data-i="${i}">${q.items[i]}</button>`).join('')}</div>`;
    const slots = el.querySelectorAll('.slot');
    el.querySelectorAll('.pool button').forEach(b => b.onclick = () => {
      if (answered) return;
      if (+b.dataset.i === next) { slots[next].textContent = q.items[next]; slots[next].classList.add('filled', 'hs-pop'); b.disabled = true; HS.fx('tap'); if (++next === n) finish(mistakes === 0); }
      else { mistakes++; HS.fx('no'); b.classList.remove('hs-shake'); void b.offsetWidth; b.classList.add('hs-shake'); }
    });
  }
}

/* ---------------- speed round ---------------- */
function speedRound() {
  stopAll();
  const pool = HS.shuffle(S.u.questions.filter(q => ['mcq', 'tf', 'pic', 'fill', 'num'].includes(q.t)));
  const G = { i: 0, score: 0, total: 0, end: Date.now() + 60000, combo: HS.makeCombo() };
  HS.markPractice();
  M().innerHTML = `<div class="card quiz"><div class="q-top"><h2>⚡ تحدّي السرعة</h2><span class="combo" id="uCombo"></span></div>
    <div class="meta"><span id="uTime">٦٠ ثانية</span><span id="uSc">✅ ٠</span></div><div class="bar timer"><i id="uTb" style="width:100%"></i></div><div id="uQ"></div></div>`;
  const tick = () => {
    const left = Math.max(0, G.end - Date.now());
    $('uTb').style.width = (left / 600) + '%'; $('uTime').textContent = `${ar(Math.ceil(left / 1000))} ثانية`;
    if (!left) finishSpeed(G);
  };
  S.iv = setInterval(tick, 200);
  const next = () => {
    if (Date.now() >= G.end) return;
    const q = pool[G.i++ % pool.length];
    $('uQ').innerHTML = '';
    renderQuestion(q, $('uQ'), ok => {
      G.total++; HS.srs.record(S.ns, q.id, ok);
      if (ok) { G.score++; star(G.combo.hit()); HS.fx('ok'); } else { G.combo.miss(); HS.fx('no'); }
      $('uSc').textContent = `✅ ${ar(G.score)}`; $('uCombo').textContent = G.combo.n >= 2 ? '🔥 ' + ar(G.combo.n) : '';
      $('uCombo').classList.toggle('on', G.combo.n >= 2);
      later(next, ok ? 450 : 1100);
    }, { noSay: true });
  };
  next();
}
function finishSpeed(G) {
  stopAll();
  const d = D(); d.best = d.best || {}; const prev = d.best.speed ? d.best.speed.s : 0;
  if (G.score > prev) d.best.speed = { s: G.score, t: G.total };
  HS.save(); star(Math.ceil(G.score / 2));
  if (G.score > prev && prev) HS.party();
  M().innerHTML = `<div class="card result"><div class="big">⚡</div><h2>${ar(G.score)} إجابة صحيحة</h2><p class="lead">من ${ar(G.total)} في ٦٠ ثانية${G.score > prev && prev ? ' – رقم قياسي جديد! 🎉' : prev ? ` · رقمك القياسي ${ar(Math.max(prev, G.score))}` : ''}</p>
    <div class="row center"><button type="button" class="btn" data-act="speed">🔁 مرة أخرى</button><button type="button" class="btn sec" data-p="play">🎮 الألعاب</button></div></div>`;
}

/* ---------------- game: sort into boxes (drag or tap-tap) ---------------- */
function gameSort(g) {
  stopAll();
  const items = HS.shuffle(g.items).slice(0, 10); let placed = 0, first = 0; const combo = HS.makeCombo(); const tried = new Set();
  M().innerHTML = `<div class="card">${gameHead(g.title)}<p class="lead">${g.ask}</p><p class="hint">اسحب البطاقة إلى الصندوق، أو اضغط عليها ثم على الصندوق.</p>
    <div class="sg-pool" id="uPool">${items.map((it, k) => `<button type="button" class="sg-item hs-drag" data-k="${k}"><span class="em">${it[0]}</span>${it[1]}</button>`).join('')}</div>
    <div class="sg-bins" style="grid-template-columns:repeat(${g.bins.length},minmax(0,1fr))">${g.bins.map(([lab, col], b) => `<div class="sg-bin" data-b="${b}" tabindex="0"><div class="sg-lab" style="background:${col}">${lab}</div><div class="sg-in"></div></div>`).join('')}</div>
    <div class="meta"><span id="uLeft">${ar(items.length)} متبقية</span><span id="uSc">✅ ${ar(0)}</span></div></div>`;
  bindBack();
  const put = (el, b) => { const it = items[+el.dataset.k]; el.classList.add('hs-done'); el.style.display = 'none'; const bin = ROOT.querySelector(`.sg-bin[data-b="${b}"] .sg-in`); bin.insertAdjacentHTML('beforeend', `<span class="sg-chip hs-pop">${it[0]} ${it[1]}</span>`); placed++; $('uLeft').textContent = `${ar(items.length - placed)} متبقية`; if (placed === items.length) later(() => sortDone(g, first, items.length), 700); };
  HS.dnd(M().querySelector('.card'), { item: '.sg-item', target: '.sg-bin', onDrop(el, bin) {
    const it = items[+el.dataset.k], b = +bin.dataset.b, k = el.dataset.k;
    if (b === it[2]) { if (!tried.has(k)) { first++; star(1 + combo.hit()); } HS.fx('ok'); $('uSc').textContent = `✅ ${ar(first)}`; put(el, b); return true; }
    tried.add(k); combo.miss(); HS.fx('no'); bin.classList.remove('hs-shake'); void bin.offsetWidth; bin.classList.add('hs-shake');
    HS.toast(`${it[0]} ${it[1]} ← ${g.bins[it[2]][0]}`, 2200);
    later(() => { if (!el.classList.contains('hs-done')) put(el, it[2]); }, 1100);
    const why = g.why && g.why[it[2]]; if (why) later(() => HS.toast(`💡 ${why}`, 2200), 1200);
    return false;
  } });
}
function sortDone(g, s, t) {
  if (s === t) HS.party();
  M().innerHTML = `<div class="card result">${gameHead(g.title)}<div class="big">${HS.mascot(s === t ? 'cheer' : 'encourage', { fb: s === t ? '🎉' : '👍' })}</div><h2>${ar(s)} من ${ar(t)} من أول محاولة</h2><p class="lead">${s === t ? 'كلها صحيحة!' : 'العب مرة ثانية لتصل للكامل.'}</p>
    <div class="row center"><button type="button" class="btn" data-act="sort" data-g="${g.id}">🔁 العب مرة أخرى</button></div></div>`;
  bindBack();
}
function gameHead(t) { return `<h2 class="sr">${t}</h2>`; }   // the title shows in the site header; kept here for screen-reader headings   // Back to the games list is in the site header
function bindBack() {}   // the site header's Back returns to the games list

/* ---------------- game: put in order (chains) ---------------- */
function gameOrder(g) {
  stopAll();
  const order = HS.shuffle(g.sets.map((_, i) => i)); let k = 0, perfect = 0;
  const round = () => {
    if (k >= order.length) {
      if (perfect === order.length) HS.party();
      M().innerHTML = `<div class="card result">${gameHead(g.title)}<div class="big">${HS.mascot('cheer', { fb: '🏆' })}</div><h2>${ar(perfect)} من ${ar(order.length)} بدون أخطاء</h2><div class="row center"><button type="button" class="btn" data-act="order" data-g="${g.id}">🔁 العب مرة أخرى</button></div></div>`;
      return bindBack();
    }
    const raw = g.sets[order[k]], set = Array.isArray(raw) ? raw : raw.items, stitle = Array.isArray(raw) ? '' : raw.title; let placed = 0, mistakes = 0;
    M().innerHTML = `<div class="card">${gameHead(g.title)}<div class="meta"><span>${ar(k + 1)} / ${ar(order.length)}</span><span>✅ ${ar(perfect)}</span></div><p class="lead">${g.prompt}</p>${stitle ? `<h3 class="set-title">${stitle}</h3>` : ''}
      <div class="slots">${g.start ? `<div class="slot filled"><span class="em">${g.start[0]}</span>${g.start[1]}</div>` : ''}${set.map((_, i) => `${i || g.start ? '<span class="ar" aria-hidden="true">⬅</span>' : ''}<div class="slot">؟</div>`).join('')}</div>
      <div class="pool">${HS.shuffle(set.map((_, i) => i)).map(i => `<button type="button" data-i="${i}"><span class="em">${set[i][0]}</span>${set[i][1]}</button>`).join('')}</div>
      <div class="fb" id="uFb" aria-live="polite"></div></div>`;
    bindBack();
    const slots = [...ROOT.querySelectorAll('.slots .slot')].slice(g.start ? 1 : 0), fb = $('uFb');
    ROOT.querySelectorAll('.pool button').forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if (i === placed) {
        slots[i].innerHTML = `<span class="em">${set[i][0]}</span>${set[i][1]}`; slots[i].classList.add('filled', 'hs-pop'); b.disabled = true; HS.fx('tap'); fb.className = 'fb';
        if (++placed === set.length) {
          const ok = !mistakes; if (ok) { perfect++; star(2); } else star(1);
          HS.fx(ok ? 'win' : 'ok'); fb.className = 'fb ok';
          fb.innerHTML = `<b>${ok ? HS.one(HS_PHRASES.praise.ar) + ' بدون أي خطأ' : 'أكملتها!'}</b>${g.roles ? '<br>' + set.map((s, j) => `${s[1]}: ${g.roles[j] || ''}`).join(' · ') : ''}<div class="auto" style="--d:2600ms"><i></i></div>`;
          k++; later(round, 2600);
        }
      } else {
        mistakes++; HS.fx('no'); b.classList.remove('hs-shake'); void b.offsetWidth; b.classList.add('hs-shake');
        fb.className = 'fb no'; fb.innerHTML = placed === 0 ? (g.firstHint || 'من يأتي أولًا؟') : (g.nextHint || 'ما التالي؟').replace('{prev}', set[placed - 1][1]);
      }
    });
  };
  round();
}

/* ---------------- game: memory (term ↔ meaning) ---------------- */
function gameMemory(l) {
  stopAll();
  const pool = S.u.glossary.filter(g => !l || g.l === l);
  const pairs = HS.shuffle(pool).slice(0, Math.min(6, pool.length));
  const cards = HS.shuffle(pairs.flatMap((g, i) => [{ i, face: `<span class="em">${g.em}</span><b>${g.term}</b>` }, { i, face: `<span class="mean">${g.short || g.def}</span>` }]));
  let open = [], found = 0, moves = 0, lock = false;
  M().innerHTML = `<div class="card">${gameHead('🧠 لعبة الذاكرة')}<p class="lead">اقلب بطاقتين: طابق كل مصطلح مع معناه.</p>
    <div class="meta"><span id="uMoves">المحاولات: ٠</span><span id="uSc">✅ ٠ / ${ar(pairs.length)}</span></div>
    <div class="mem">${cards.map((c, k) => `<button type="button" class="mc" data-k="${k}" aria-label="بطاقة ${ar(k + 1)}"><span class="mc-in"><span class="mc-back" aria-hidden="true">❓</span><span class="mc-face">${c.face}</span></span></button>`).join('')}</div></div>`;
  bindBack();
  ROOT.querySelectorAll('.mc').forEach(b => b.onclick = () => {
    if (lock || b.classList.contains('up') || b.classList.contains('got')) return;
    b.classList.add('up'); open.push(b); HS.fx('tap');
    if (open.length < 2) return;
    moves++; $('uMoves').textContent = `المحاولات: ${ar(moves)}`;
    const [a, c] = open, same = cards[+a.dataset.k].i === cards[+c.dataset.k].i;
    if (same) {
      a.classList.add('got'); c.classList.add('got'); open = []; found++; star(); HS.fx('ok');
      $('uSc').textContent = `✅ ${ar(found)} / ${ar(pairs.length)}`;
      if (found === pairs.length) later(() => { HS.party(); M().innerHTML = `<div class="card result">${gameHead('🧠 لعبة الذاكرة')}<div class="big">${HS.mascot('cheer', { fb: '🧠' })}</div><h2>وجدت كل الأزواج!</h2><p class="lead">في ${ar(moves)} محاولة${moves <= pairs.length + 2 ? ' – ذاكرة ممتازة!' : ''}</p><div class="row center"><button type="button" class="btn" data-act="memory" ${l ? `data-l="${l}"` : ''}>🔁 العب مرة أخرى</button></div></div>`; bindBack(); }, 700);
    } else { lock = true; later(() => { a.classList.remove('up'); c.classList.remove('up'); open = []; lock = false; }, 1000); }
  });
}

/* ---------------- entry ---------------- */
APPS.unit = {
  open(sub) {
    const m = /^([a-z0-9]+)(?:-(.+))?$/.exec(sub || '') || [];
    const u = window.UNITS && UNITS[m[1]];
    if (!u) { $('uMain').innerHTML = '<p style="padding:40px;text-align:center">لم يتم العثور على هذه الوحدة.</p>'; return; }
    if (S.id !== u.id) { FC = { list: [], i: 0, l: '' }; }
    S.u = u; S.id = u.id; S.ns = 'u:' + u.id; S.fcns = 'fc:' + u.id;
    const { page, act } = splitSub(u, m[2]);
    render(page, act);
  },
  /** pages below the unit, for the site header and breadcrumbs (see src/portal/nav.js) */
  nav(sub) {
    const m = /^([a-z0-9]+)(?:-(.+))?$/.exec(sub || '') || [], u = window.UNITS && UNITS[m[1]];
    if (!u) return [];
    const { page, act } = splitSub(u, m[2]), base = 'unit-' + u.id, out = [];
    if (page !== 'home') {
      const i = u.lessons.findIndex(l => l.id === page);
      out.push({ route: `${base}-${page}`, title: i >= 0 ? `الدرس ${ar(i + 1)}: ${u.lessons[i].title}` : { cards: 'البطاقات', play: 'الألعاب', test: 'الاختبارات' }[page] });
    }
    const A = findAct(u, page, act);
    if (A) out.push({ route: `${base}-${page}-${act}`, title: A.title, focus: true });
    return out;
  },
  labCount: id => Object.keys(LABS[id] || {}).length,
  labs: () => LABS,   // read by the automated tests
  renderQ: (unitId, q, el, done, opt) => { S.id = S.id || unitId; S.u = S.u || UNITS[unitId]; renderQuestion(q, el, done, opt || { coach: true }); },   // tests
  mathModel: s => mathModel(s),   // tests
  hintFor(q, n, i) { const t = q.t === 'pic' && q.labels ? q.labels[i] : q.t === 'tf' ? '' : q.o[i]; return coachHint(q, n, t, new Set(), i); },   // tests
  close() { stopAll(); },
  /** for the parent page */
  report(unitId, profileId) {
    const u = UNITS[unitId]; if (!u) return null;
    const ns = 'u:' + unitId, d = HS.data(ns, profileId), ids = l => u.questions.filter(q => !l || q.l === l).map(q => q.id);
    const m = (l) => { if (!ids(l).length) return 0; const s = (d.srs || {}); return ids(l).reduce((a, id) => a + Math.min(4, (s[id] || { b: 0 }).b) / 4, 0) / ids(l).length; };
    const s = d.srs || {};
    const missed = Object.keys(s).filter(id => s[id].w > 0).sort((a, b) => (s[b].w - s[b].c * .5) - (s[a].w - s[a].c * .5)).slice(0, 5).map(id => ({ q: (u.questions.find(q => q.id === id) || {}).q, w: s[id].w, c: s[id].c })).filter(x => x.q);
    // how the child learns, not only what: first-try accuracy, self-corrections, and the wrong ideas chosen most
    const lr = d.learn || null, byQ = id => u.questions.find(q => q.id === id) || {};
    const rightOf = q => q.t === 'num' ? HS.toAr(q.a) : q.t === 'tf' ? (q.a ? 'صح' : 'خطأ') : q.t === 'pic' && q.labels ? q.labels[q.a] : q.o ? q.o[q.a] : '';
    const mis = lr ? Object.entries(lr.mis || {}).flatMap(([id, ch]) => Object.entries(ch).map(([c, n]) => ({ q: byQ(id).q, chose: c, right: rightOf(byQ(id)), n, l: byQ(id).l })))
      .filter(x => x.q).sort((a, b) => b.n - a.n).slice(0, 4) : [];
    const lessons = u.lessons.map(L => { const r = lr && lr.L && lr.L[L.id]; return { title: L.title, em: L.em, m: m(L.id), first: r && r.n ? r.first / r.n : null, n: r ? r.n : 0 }; });
    const weak = lessons.filter(L => L.n >= 3).sort((a, b) => a.first - b.first)[0];
    const next = !Object.keys(s).length ? null : weak && weak.first < .7 ? `ابدؤوا بدرس «${weak.title}»: فيه أقل نسبة صح من أول مرة.`
      : lessons.find(L => L.m < .8) ? `الدرس التالي للتثبيت: «${lessons.find(L => L.m < .8).title}».` : 'جاهز للاختبار الشامل.';
    const learn = lr && lr.n ? { n: lr.n, first: lr.first / lr.n, fixed: lr.fixed, revealed: lr.revealed, hints: lr.hints, last: lr.last } : null;
    const labs = Object.entries(d.labs || {}).map(([id, x]) => ({ title: (LABS[unitId] && LABS[unitId][id] || {}).title || id, ...x, total: ((LABS[unitId] && LABS[unitId][id] || {}).challenges || []).length })).filter(x => x.runs);
    return { title: u.title, em: u.em, total: m(), lessons, best: d.best || {}, missed, mis, learn, next, labs, answered: Object.keys(s).length, count: u.questions.length };
  }
};
