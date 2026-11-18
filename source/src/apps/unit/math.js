/* ============================================================
   MATHS (same scope as app.js): drawn models, typed number answers, hints that teach a strategy.
   Research behind the choices (see docs/IMPROVEMENTS.md):
   - strategies before speed: hints teach derived facts (×9 = ×10 − one group, ×6 = double ×3, ×8 = double ×4,
     ×7 = ×5 + ×2, swap the factors), never the answer; there is no timer outside the optional challenge;
   - visual models: equal groups, arrays, base-ten blocks and the area model (partial products), drawn exactly
     by the site from one picture per object, so a count is never wrong;
   - a wrong answer is read for the usual mistakes (added instead of multiplied, one group too many or too few,
     forgot the regrouped ten, one zero too many or too few) and gets a matching hint.
   ============================================================ */
const AR = n => HS.toAr(n);
// one emoji per maths object until its picture exists (art id 'math-<name>', from the maths sprite sheets)
const MATH_EMOJI = { apple: '🍎', orange: '🍊', date: '🟤', cookie: '🍪', pencil: '✏️', crayon: '🖍️', egg: '🥚', flower: '🌸', star: '⭐',
  ball: '⚽', toycar: '🚗', bird: '🐦', fish: '🐟', book: '📘', marble: '🔵', balloon: '🎈', plate: '🍽️', bag: '🛍️', box: '📦', cup: '🥤',
  basket: '🧺', tray: '🟫', jar: '🫙', pencilcase: '👝', nest: '🪺', counter: '🔴', 'counter-yellow': '🟡', cube: '🟦', chick: '🐥', seed: '🌱',
  frog: '🐸', bug: '🐞', ring: '💍', seat: '💺', jarbox: '🫙', table: '🪑', face: '🙂' };
const mObj = (k, cls = 'm-o') => {
  const id = 'math-' + k, fb = MATH_EMOJI[k] || '🔵';
  return HS.ART && HS.ART[id] ? HS.art(id, { small: true, eager: true, fb, cls }) : `<span class="${cls} m-em" aria-hidden="true">${fb}</span>`;
};

/* ---------------- models ----------------
   { m:'groups', n, size, obj, box }      n containers with `size` objects each
   { m:'array', r, c, obj?, split? }      r rows × c columns; split = column where the array is cut in two
   { m:'blocks', n }                       base-ten blocks for n (hundreds, tens, ones)
   { m:'area', a, b, show? }               area model for a × b (a split by place value); show: true → products
   { m:'vertical', a, b, carry?, res? }    column multiplication (digits in place, carries above) */
function mathModel(s) {
  if (s.m === 'groups') {
    const one = `<div class="m-grp">${s.box ? `<span class="m-box" aria-hidden="true">${mObj(s.box, 'm-boxi')}</span>` : ''}<div class="m-in">${Array.from({ length: s.size }, () => mObj(s.obj || 'counter')).join('')}</div></div>`;
    return `<div class="m-model m-groups" role="img" aria-label="${AR(s.n)} مجموعات، في كل مجموعة ${AR(s.size)}">${Array.from({ length: s.n }, () => one).join('')}</div>`;
  }
  if (s.m === 'array') {
    const cell = (r, c) => `<span class="m-cell${s.split && c >= s.split ? ' b' : ''}">${s.obj ? mObj(s.obj) : '<i class="m-dot"></i>'}</span>`;
    return `<div class="m-model m-array${s.split ? ' split' : ''}" dir="ltr" role="img" aria-label="${AR(s.r)} صفوف، في كل صف ${AR(s.c)}${s.split ? `، مقسومة إلى ${AR(s.split)} و${AR(s.c - s.split)}` : ''}" style="--c:${s.c}">
      ${Array.from({ length: s.r }, (_, r) => `<div class="m-row">${Array.from({ length: s.c }, (_, c) => (s.split && c === s.split ? '<span class="m-cut" aria-hidden="true"></span>' : '') + cell(r, c)).join('')}</div>`).join('')}</div>`;
  }
  if (s.m === 'blocks') {   // s.parts = [h, t, o] draws them as they are (12 ones before regrouping)
    const [h, t, o] = s.parts || [Math.floor(s.n / 100), Math.floor(s.n % 100 / 10), s.n % 10];
    const flat = '<svg class="m-flat" viewBox="0 0 50 50" aria-hidden="true"><rect x="1" y="1" width="48" height="48" rx="2"/>' + Array.from({ length: 9 }, (_, i) => `<line x1="${5.8 + i * 4.8}" y1="1" x2="${5.8 + i * 4.8}" y2="49"/><line y1="${5.8 + i * 4.8}" x1="1" y2="${5.8 + i * 4.8}" x2="49"/>`).join('') + '</svg>';
    const rod = '<svg class="m-rod" viewBox="0 0 6 50" aria-hidden="true"><rect x=".5" y=".5" width="5" height="49" rx="1"/>' + Array.from({ length: 9 }, (_, i) => `<line x1=".5" x2="5.5" y1="${5.4 + i * 4.9}" y2="${5.4 + i * 4.9}"/>`).join('') + '</svg>';
    const one = '<svg class="m-one" viewBox="0 0 6 6" aria-hidden="true"><rect x=".5" y=".5" width="5" height="5" rx="1"/></svg>';
    return `<div class="m-model m-blocks" dir="ltr" role="img" aria-label="${AR(h)} مئات، ${AR(t)} عشرات، ${AR(o)} آحاد">
      ${h ? `<div class="m-bk">${Array(h).fill(flat).join('')}</div>` : ''}${t ? `<div class="m-bk">${Array(t).fill(rod).join('')}</div>` : ''}${o ? `<div class="m-bk ones">${Array(o).fill(one).join('')}</div>` : ''}</div>`;
  }
  if (s.m === 'area') {
    const parts = placeParts(s.a), tot = parts.reduce((x, y) => x + y, 0);
    return `<div class="m-model m-area" dir="ltr" role="img" aria-label="نموذج المساحة: ${AR(s.b)} × (${parts.map(AR).join(' + ')})">
      <div class="m-ar-top">${parts.map(p => `<span style="flex:${Math.max(p, tot * .24)}">${AR(p)}</span>`).join('')}</div>
      <div class="m-ar-row"><span class="m-ar-side">${AR(s.b)}</span>${parts.map((p, i) => `<div class="m-ar-cell c${i}" style="flex:${Math.max(p, tot * .24)}"><span class="m-ar-e" dir="rtl">${AR(s.b)} × ${AR(p)}</span>${s.show ? `<b>${AR(s.b * p)}</b>` : s.slots ? `<button type="button" class="m-slot" data-k="${i}" aria-label="${AR(s.b)} × ${AR(p)}">؟</button>` : ''}</div>`).join('')}</div></div>`;
  }
  if (s.m === 'vertical') {
    const A = String(s.a), w = Math.max(A.length, String(s.res ?? '').length) + 1;
    const pad = (x, n) => Array(n - x.length).fill('').concat(x.split(''));
    const row = (cells, cls = '') => `<div class="m-v-row ${cls}">${cells.map(c => `<span>${c === '' ? '' : AR(c)}</span>`).join('')}</div>`;
    const carry = s.carry ? pad(String(s.carry).replace(/0/g, ' ').padStart(A.length, ' '), w).map(c => c === ' ' ? '' : c) : null;
    return `<div class="m-model m-vertical" dir="ltr" role="img" aria-label="${AR(s.a)} × ${AR(s.b)}${s.res != null ? ' = ' + AR(s.res) : ''}" style="--w:${w}">
      ${carry ? row(carry, 'carry') : ''}${row(pad(A, w))}<div class="m-v-row op">${pad(String(s.b), w).map((c, i) => `<span>${i === 0 ? '×' : c === '' ? '' : AR(c)}</span>`).join('')}</div>
      <div class="m-v-line"></div>${s.res != null ? row(pad(String(s.res), w), 'res') : ''}</div>`;
  }
  return '';
}
/** 324 → [300, 20, 4] (zeros left out: 305 → [300, 5]) */
function placeParts(n) { const d = String(n).split(''); return d.map((x, i) => +x * 10 ** (d.length - 1 - i)).filter(Boolean); }
/** what a child gets when the regrouped tens are forgotten (each place multiplied on its own, carry dropped) */
function noCarry(a, b) { return +String(a).split('').map(d => String(+d * b % 10)).join(''); }

/* ---------------- strategy hints for a × b (never contain the product) ---------------- */
function factStrategy(a, b) {
  const [x, y] = a === 9 || a === 6 || a === 8 || a === 7 || a === 3 ? [a, b] : [b, a];   // x: the factor with a strategy
  if (x === 9) return `ابدأ بـ ${AR(10)} × ${AR(y)}، ثم اطرح مجموعة واحدة من ${AR(y)}.`;
  if (x === 6) return `${AR(6)} × ${AR(y)} هو ضعف ${AR(3)} × ${AR(y)}: احسب ${AR(3)} × ${AR(y)} ثم اجمعه مع نفسه.`;
  if (x === 8) return `${AR(8)} × ${AR(y)} هو ضعف ${AR(4)} × ${AR(y)}: احسب ${AR(4)} × ${AR(y)} ثم ضاعفه.`;
  if (x === 7) return `قسّم ${AR(7)} إلى ${AR(5)} و${AR(2)}: احسب ${AR(5)} × ${AR(y)} و${AR(2)} × ${AR(y)} ثم اجمعهما.`;
  if (x === 3) return `${AR(3)} × ${AR(y)} = ${AR(2)} × ${AR(y)} ثم أضف ${AR(y)} مرة أخرى.`;
  return `بدّل العاملين إن كان أسهل: ${AR(b)} × ${AR(a)} له الناتج نفسه.`;
}
/** what a wrong number says about the child's thinking (empty when nothing matches) */
function readMistake(q, w) {
  const [a, b] = q.f || [], r = q.a;
  if (a != null && w === a + b && a * b !== a + b) return 'يبدو أنك <b>جمعت</b> العددين. الضرب مجموعات متساوية: ' + `${AR(Math.min(a, b))} مجموعات، في كل منها ${AR(Math.max(a, b))}.`;
  if (a != null && (Math.abs(w - r) === a || Math.abs(w - r) === b) && a < 11 && b < 11) return 'قريب جدًا! يبدو أنك زدت أو نقصت <b>مجموعة واحدة</b>. عدّ المجموعات مرة ثانية.';
  if (a != null && Math.max(a, b) >= 10 && w === noCarry(Math.max(a, b), Math.min(a, b)) && w !== r) return 'انتبه لـ<b>إعادة التجميع</b>: هل أضفت العشرة (أو المئة) التي جمّعتها إلى المنزلة التالية؟';
  if (r && (w === r * 10 || w * 10 === r)) return 'عدّ <b>الأصفار</b> مرة ثانية: كم صفرًا في العاملين معًا؟';
  if (w > 0 && String(w).split('').reverse().join('') === String(r)) return 'هل كتبت الأرقام بترتيب معكوس؟ اقرأ الآحاد والعشرات مرة ثانية.';
  return '';
}

/* ---------------- keypad (one for the screen; it writes into the active slot) ---------------- */
function keypad(onKey) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
  const html = `<div class="m-pad" dir="ltr" role="group" aria-label="لوحة الأرقام">${keys.map(k => `<button type="button" class="m-k ${k === 'ok' ? 'ok' : k === 'del' ? 'del' : ''}" data-k="${k}" aria-label="${k === 'ok' ? 'تحقّق' : k === 'del' ? 'امسح رقمًا' : AR(k)}">${k === 'ok' ? '✓' : k === 'del' ? '⌫' : AR(k)}</button>`).join('')}</div>`;
  const bind = root => {
    root.querySelectorAll('.m-k').forEach(b => b.onclick = () => onKey(b.dataset.k));
    const kb = e => {
      if (!root.isConnected) return document.removeEventListener('keydown', kb);
      const d = '٠١٢٣٤٥٦٧٨٩'.indexOf(e.key); const k = d >= 0 ? String(d) : /^[0-9]$/.test(e.key) ? e.key : e.key === 'Backspace' ? 'del' : e.key === 'Enter' ? 'ok' : null;
      if (!k || (e.target.closest && e.target.closest('input,textarea'))) return;
      e.preventDefault(); onKey(k);
    };
    document.addEventListener('keydown', kb);
  };
  return { html, bind };
}

/* ---------------- typed number question { t:'num', q, a, f?:[a,b], model?, hint1?, hint2?, unit? } ----------------
   1st wrong: what the mistake says, or a strategy · 2nd: second hint + the model drawn · 3rd: the answer. */
function numQuestion(q, el, finish, opt) {
  let val = '', tries = 0;
  const pad = keypad(k => {
    if (k === 'del') val = val.slice(0, -1);
    else if (k === 'ok') return check();
    else if (val.length < 6) val = (val === '0' ? '' : val) + k;
    show();
  });
  el.innerHTML = `<div class="q-line"><div class="q">${q.q}</div></div>${q.model && q.modelFirst ? mathModel(q.model) : ''}
    <div class="m-ans"><output class="m-box-ans" aria-live="polite" aria-label="إجابتك">؟</output>${q.unit ? `<span class="m-unit">${q.unit}</span>` : ''}</div>${pad.html}`;
  pad.bind(el);
  const out = el.querySelector('.m-box-ans');
  const show = () => { out.textContent = val ? AR(val) : '؟'; out.classList.remove('no'); };
  const coach = html => { let b = el.querySelector('.coach'); if (!b) { el.insertAdjacentHTML('beforeend', '<div class="coach" role="status"></div>'); b = el.querySelector('.coach'); }
    b.innerHTML = `<span class="coach-ic" aria-hidden="true">💡</span><div>${html}</div>`; b.classList.remove('hs-pop'); void b.offsetWidth; b.classList.add('hs-pop'); };
  const lock = () => el.querySelectorAll('.m-k').forEach(b => b.disabled = true);
  function check() {
    if (!val) return;
    const w = +val;
    if (w === q.a) { out.classList.add('ok'); lock(); return finish(tries === 0, { tries, fixed: tries > 0 }); }
    tries++; out.classList.add('no'); HS.fx('no'); onCoach(q, w, tries);
    if (!opt.coach || tries >= 3) { lock(); out.textContent = AR(q.a); out.classList.remove('no'); out.classList.add('ok'); return finish(false, { tries, revealed: true }); }
    const why = readMistake(q, w);
    if (tries === 1) coach(why || q.hint1 || (q.f ? factStrategy(q.f[0], q.f[1]) : 'اقرأ السؤال مرة ثانية: ما العددان؟ وما العملية؟'));
    else coach((why ? why + '<br>' : '') + (q.hint2 || 'انظر إلى النموذج وعُدّ.') + (q.model && !q.modelFirst ? mathModel(q.model) : q.f && q.f[0] * q.f[1] <= 100 ? mathModel({ m: 'array', r: Math.min(...q.f), c: Math.max(...q.f) }) : ''));
    later(() => { val = ''; show(); }, 700);
  }
}

/* ============================================================
   MATHS GAMES (registered as LABS with kind 'math'; listed on the games page under «ألعاب الضرب»).
   The maths is the game: every move is a multiplication the child works out, with the strategy hints above.
   ============================================================ */
const mRec = id => labRec(id);
/** one screen per game: title, a short goal, a round counter, the play area */
function mShell(el, lab, goal) {
  el.innerHTML = `<div class="card lab mg"><div class="mg-top"><h2>${lab.title}</h2><span class="mg-round" aria-live="polite"></span></div>
    <p class="lead">${goal}</p><div class="mg-play"></div></div>`;
  return { play: el.querySelector('.mg-play'), round: t => { const r = el.querySelector('.mg-round'); if (r) r.textContent = t; } };
}
function mEnd(el, lab, stars, line, again) {
  const r = mRec(lab.id); r.runs++; r.last = Date.now(); HS.save();
  el.innerHTML = `<div class="card result"><div class="big">${HS.mascot('cheer', { fb: '🏅' })}</div><h2>أحسنت!</h2><p class="lead">${line}</p>
    ${stars ? `<p class="mg-stars">${'⭐'.repeat(Math.min(stars, 10))}</p>` : ''}
    <div class="row center"><button type="button" class="btn" id="mgAgain">العب مرة ثانية</button><button type="button" class="btn sec" id="mgBack">إلى الألعاب</button></div></div>`;
  $('mgAgain').onclick = again; $('mgBack').onclick = () => HS.nav.go('unit-' + S.id + '-play');
}
/** ask one number inside a game; then(okFirst) */
function mAsk(box, q, then) {
  const d = document.createElement('div'); d.className = 'mg-ask'; box.appendChild(d);
  renderQuestion(Object.assign({ t: 'num', id: 'game:' + (q.f || []).join('x') }, q), d, ok => { then(ok); }, { coach: true });
  d.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
  return d;
}
const mDone = (box, html) => box.insertAdjacentHTML('beforeend', `<div class="fb ok mg-fb">${html}</div>`);

/* ---------- 🧩 break apart a fact (grade 3: ×6, ×7, ×8, ×9 from facts the child knows) ---------- */
const BREAK = [[7, 4], [6, 4], [8, 3], [7, 6], [9, 4], [8, 6], [6, 7], [9, 7]];
function breakGame(el, lab) {
  const list = HS.shuffle(BREAK.slice()).slice(0, 5); let k = 0, stars = 0;
  const ui = mShell(el, lab, 'حقيقة صعبة؟ نقسمها إلى حقيقتين نعرفهما، ثم نجمع.');
  const round = () => {
    if (k >= list.length) return mEnd(el, lab, stars, `فكّكت ${AR(list.length)} حقائق ضرب بنفسك.`, () => breakGame(el, lab));
    const [x, y] = list[k]; ui.round(`${AR(k + 1)} / ${AR(list.length)}`);
    const P = ui.play;
    P.innerHTML = `<p class="mg-fact">${AR(y)} × ${AR(x)} = ؟</p><div class="mg-model">${mathModel({ m: 'array', r: y, c: x })}</div>
      <p>${AR(y)} صفوف، في كل صف ${AR(x)}. <b>كيف نقسم الأعمدة ${AR(x)}؟</b></p>
      <div class="opts chips-opts mg-splits">${Array.from({ length: x - 1 }, (_, i) => x - 1 - i).filter(a => a >= x - a).map(a => `<button type="button" class="opt" data-a="${a}">${AR(a)} و ${AR(x - a)}</button>`).join('')}
      ${x === 9 ? `<button type="button" class="opt" data-a="10">${AR(10)} ناقص ${AR(1)}</button>` : ''}</div><div class="mg-steps"></div>`;
    P.querySelectorAll('.mg-splits .opt').forEach(b => b.onclick = () => {
      P.querySelectorAll('.mg-splits .opt').forEach(o => o.disabled = true); b.classList.add('ok');
      const a = +b.dataset.a, st = P.querySelector('.mg-steps');
      const smart = a === 10 || a === 5 || a * 2 === x;
      st.innerHTML = `<p class="mg-say">${a === 10 ? `ذكي! نحسب ${AR(10)} أعمدة ثم نطرح عمودًا واحدًا.` : smart ? `اختيار ذكي: ${a === 5 ? `${AR(5)} حقيقة سهلة` : 'نصفان متساويان: ضعف'}.` : 'يصلح! كل تقسيم يعطي الناتج نفسه.'}</p>`;
      if (a === 10) {
        P.querySelector('.mg-model').innerHTML = mathModel({ m: 'array', r: y, c: 10, split: 9 });
        mAsk(st, { q: `${AR(y)} × ${AR(10)} = ؟`, a: y * 10, f: [y, 10] }, ok1 => mAsk(st, { q: `${AR(y * 10)} − ${AR(y)} = ؟ <small>(نطرح العمود الزائد)</small>`, a: y * 9, hint1: `اطرح ${AR(y)} من ${AR(y * 10)}.` }, ok2 => fin(ok1 && ok2)));
        return;
      }
      P.querySelector('.mg-model').innerHTML = mathModel({ m: 'array', r: y, c: x, split: a });
      mAsk(st, { q: `${AR(y)} × ${AR(a)} = ؟ <small>(الجزء الأول)</small>`, a: y * a, f: [y, a] }, ok1 =>
        mAsk(st, { q: `${AR(y)} × ${AR(x - a)} = ؟ <small>(الجزء الثاني)</small>`, a: y * (x - a), f: [y, x - a] }, ok2 =>
          mAsk(st, { q: `${AR(y * a)} + ${AR(y * (x - a))} = ؟`, a: y * x, hint1: 'اجمع ناتجي الجزأين.' }, ok3 => fin(ok1 && ok2 && ok3))));
      function fin(ok) {
        if (ok) { stars++; star(1); } HS.fx('ok');
        mDone(st, `${AR(y)} × ${AR(x)} = <b>${AR(x * y)}</b> ✅`); k++; labNext(st, k < list.length ? 'الحقيقة التالية ←' : 'النتيجة', round);
      }
    });
  };
  round();
}

/* ---------- 🎯 the book's game «ثلاثة على استقامة واحدة» (grade 3, p.151) against the computer ---------- */
const PG_BOARD = [20, 36, 12, 14, 30, 54, 45, 8, 24, 40, 28, 16, 27, 20, 32, 42, 15, 10, 21, 18, 6, 24, 12, 48, 35];
const PG_LINES = (() => { const L = [], at = (r, c) => r * 5 + c;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(([dr, dc]) => {
    const cells = [0, 1, 2].map(i => [r + dr * i, c + dc * i]); if (cells.every(([a, b]) => a >= 0 && a < 5 && b >= 0 && b < 5)) L.push(cells.map(([a, b]) => at(a, b)));
  }); return L; })();
function productGame(el, lab) {
  const own = Array(25).fill(0);   // 0 free, 1 child, 2 computer
  const clip = [2 + Math.floor(Math.random() * 8), 2 + Math.floor(Math.random() * 8)];
  let sel = 0, busy = false;
  const ui = mShell(el, lab, 'حرّك مشبكًا واحدًا إلى عامل جديد، ثم اكتب ناتج الضرب وغطِّه على اللوحة. أول من يغطي <b>ثلاثة على استقامة واحدة</b> يفوز.');
  const win = who => PG_LINES.find(l => l.every(i => own[i] === who));
  const P = ui.play;
  const draw = (msg = '') => {
    ui.round('أنت 🟢 · الحاسوب 🟣');
    P.innerHTML = `<div class="pg-board" dir="ltr" role="grid" aria-label="لوحة نواتج الضرب">${PG_BOARD.map((n, i) => `<div class="pg-c o${own[i]}" role="gridcell" data-i="${i}">${AR(n)}</div>`).join('')}</div>
      <div class="pg-clips"><span>المشبك المختار:</span>${[0, 1].map(j => `<button type="button" class="pg-clip${sel === j ? ' on' : ''}" data-j="${j}" aria-pressed="${sel === j}">📎 ${AR(clip[j])}</button>`).join('')}</div>
      <div class="pg-strip" dir="ltr" role="group" aria-label="العوامل">${[2, 3, 4, 5, 6, 7, 8, 9].map(f => `<button type="button" class="pg-f${clip.includes(f) ? ' has' : ''}" data-f="${f}">${AR(f)}${clip[0] === f ? '<i>📎</i>' : ''}${clip[1] === f ? '<i>📎</i>' : ''}</button>`).join('')}</div>
      <p class="mg-say" aria-live="polite">${msg}</p><div class="pg-ask"></div>`;
    P.querySelectorAll('.pg-clip').forEach(b => b.onclick = () => { if (!busy) { sel = +b.dataset.j; draw(msg); } });
    P.querySelectorAll('.pg-f').forEach(b => b.onclick = () => { if (!busy) move(+b.dataset.f); });
  };
  const free = n => PG_BOARD.map((x, i) => x === n && !own[i] ? i : -1).filter(i => i >= 0);
  function move(f) {
    if (clip[sel] === f) return;
    clip[sel] = f; busy = true; const [a, b] = clip; draw();
    mAsk(P.querySelector('.pg-ask'), { q: `${AR(a)} × ${AR(b)} = ؟`, a: a * b, f: [a, b] }, ok => {
      if (ok) star(1);
      const cells = free(a * b);
      if (!cells.length) return later(() => cpu(`ناتج ${AR(a * b)} ${PG_BOARD.includes(a * b) ? 'مغطّى' : 'ليس على اللوحة'}. دور الحاسوب.`), 900);
      own[cells[0]] = 1; HS.fx('ok');
      if (win(1)) return later(() => finish(1), 700);
      later(() => cpu(`غطّيت ${AR(a * b)}. دور الحاسوب…`), 700);
    });
  }
  function cpu(msg) {
    draw(msg);
    // try every move of either clip: win > block > any free product
    const moves = []; [0, 1].forEach(j => [2, 3, 4, 5, 6, 7, 8, 9].forEach(f => { if (f === clip[j]) return; const c = clip.slice(); c[j] = f; const fr = free(c[0] * c[1]); if (fr.length) moves.push({ j, f, i: fr[0], c }); }));
    const wins = who => moves.find(m => PG_LINES.some(l => l.includes(m.i) && l.every(i => i === m.i || own[i] === who)));
    const m = wins(2) || wins(1) || HS.shuffle(moves)[0];
    later(() => {
      if (m) { clip[m.j] = m.f; own[m.i] = 2; }
      busy = false;
      if (win(2)) return finish(2);
      if (own.every(Boolean)) return finish(0);
      draw(m ? `الحاسوب حرّك مشبكًا إلى ${AR(m.f)}: ${AR(m.c[0])} × ${AR(m.c[1])} = ${AR(m.c[0] * m.c[1])}. دورك!` : 'لم يجد الحاسوب حركة. دورك!');
    }, 1100);
  }
  function finish(who) {
    const line = win(who) || []; draw(); line.forEach(i => P.querySelector(`.pg-c[data-i="${i}"]`).classList.add('win'));
    if (who === 1) star(2);
    later(() => mEnd(el, lab, who === 1 ? 3 : 1, who === 1 ? 'فزت! ثلاثة على استقامة واحدة 🎉' : who === 2 ? 'فاز الحاسوب هذه المرة. جرّب أن تسدّ طريقه!' : 'تعادل!', () => productGame(el, lab)), 1400);
  }
  draw('ابدأ: اختر مشبكًا، ثم اضغط على عامل جديد.');
}

/* ---------- 🔢 multiplication table: explore it, then fill the hidden facts (grade 3) ---------- */
function tableGame(el, lab) {
  const ui = mShell(el, lab, 'اضغط على أي مربع لترى الحقيقة مصفوفةً. لاحظ: كل ناتج يظهر مرتين (الخاصية الإبدالية).');
  const P = ui.play; let hidden = new Set(), filled = 0, stars = 0;
  const draw = () => {
    P.innerHTML = `<div class="tb-wrap"><table class="tb" dir="ltr"><tr><th>×</th>${[...Array(10)].map((_, c) => `<th>${AR(c + 1)}</th>`).join('')}</tr>
      ${[...Array(10)].map((_, r) => `<tr><th>${AR(r + 1)}</th>${[...Array(10)].map((_, c) => { const k = (r + 1) + 'x' + (c + 1);
        return `<td><button type="button" class="tb-c${hidden.has(k) ? ' hid' : ''}" data-r="${r + 1}" data-c="${c + 1}" aria-label="${AR(r + 1)} × ${AR(c + 1)}">${hidden.has(k) ? '؟' : AR((r + 1) * (c + 1))}</button></td>`; }).join('')}</tr>`).join('')}</table></div>
      <div class="row center">${hidden.size ? `<span class="mg-say">بقي ${AR(hidden.size)}</span>` : `<button type="button" class="btn sky" id="tbGo">🙈 خبّئ بعض النواتج وامْلأها</button>`}</div><div class="tb-show"></div>`;
    P.querySelectorAll('.tb-c').forEach(b => b.onclick = () => pick(+b.dataset.r, +b.dataset.c, b));
    const go = $('tbGo'); if (go) go.onclick = hide;
    ui.round(hidden.size ? `${AR(filled)} مكتمل` : 'استكشاف');
  };
  function pick(r, c, b) {
    P.querySelectorAll('.tb-c.on,.tb-c.twin').forEach(x => x.classList.remove('on', 'twin'));
    b.classList.add('on'); const tw = P.querySelector(`.tb-c[data-r="${c}"][data-c="${r}"]`); if (tw && tw !== b) tw.classList.add('twin');
    const box = P.querySelector('.tb-show'), k = r + 'x' + c;
    box.innerHTML = r * c <= 100 ? mathModel({ m: 'array', r, c }) : '';
    if (!hidden.has(k)) { box.insertAdjacentHTML('afterbegin', `<p class="mg-fact">${AR(r)} × ${AR(c)} = ${AR(r * c)}${r !== c ? ` <small>و ${AR(c)} × ${AR(r)} = ${AR(r * c)} أيضًا</small>` : ''}</p>`); return; }
    box.innerHTML = '';
    mAsk(box, { q: `${AR(r)} × ${AR(c)} = ؟`, a: r * c, f: [r, c] }, ok => {
      hidden.delete(k); filled++; if (ok) { stars++; star(1); }
      later(() => { if (!hidden.size) return mEnd(el, lab, stars, `ملأت ${AR(filled)} نواتج في جدول الضرب.`, () => tableGame(el, lab)); draw(); }, 900);
    });
  }
  function hide() {
    const cand = []; [3, 6, 7, 8, 9].forEach(f => { for (let o = 2; o <= 9; o++) cand.push(Math.random() < .5 ? f + 'x' + o : o + 'x' + f); });
    hidden = new Set(HS.shuffle([...new Set(cand)]).slice(0, 8)); filled = 0; draw();
  }
  draw();
}

/* ---------- 🤝 choose the easy pair: the associative property (grade 3, lesson 5-7) ---------- */
const PAIRS = [[2, 7, 5], [5, 3, 2], [4, 9, 5], [3, 2, 5], [5, 8, 2], [2, 6, 5], [4, 2, 3], [3, 3, 2]];
function pairGame(el, lab) {
  const list = HS.shuffle(PAIRS.slice()).slice(0, 5); let k = 0, stars = 0;
  const ui = mShell(el, lab, 'ثلاثة أعداد نضربها. نختار العددين اللذين نضربهما أولًا: الترتيب لا يغيّر الناتج، لكن بعضه أسهل!');
  const round = () => {
    if (k >= list.length) return mEnd(el, lab, stars, 'تعرف الآن كيف تختار الزوج السهل.', () => pairGame(el, lab));
    const f = HS.shuffle(list[k].slice()); ui.round(`${AR(k + 1)} / ${AR(list.length)}`);
    const P = ui.play; let picked = [];
    P.innerHTML = `<p class="mg-fact" dir="ltr">${f.map(AR).join(' × ')} = ؟</p><p>اضغط على العددين اللذين تضربهما <b>أولًا</b>.</p>
      <div class="pr-cards">${f.map((n, i) => `<button type="button" class="pr-card" data-i="${i}">${AR(n)}</button>`).join('')}</div><div class="mg-steps"></div>`;
    P.querySelectorAll('.pr-card').forEach(b => b.onclick = () => {
      if (picked.length >= 2 || b.classList.contains('on')) return;
      b.classList.add('on'); picked.push(+b.dataset.i); if (picked.length < 2) return;
      const [x, y] = picked.map(i => f[i]), z = f[[0, 1, 2].find(i => !picked.includes(i))], st = P.querySelector('.mg-steps');
      const best = Math.max(...[[0, 1], [0, 2], [1, 2]].map(([i, j]) => (f[i] * f[j]) % 10 === 0 ? 2 : f[i] * f[j] <= 10 ? 1 : 0));
      const mine = (x * y) % 10 === 0 ? 2 : x * y <= 10 ? 1 : 0;
      st.innerHTML = `<p class="mg-say">${mine === 2 ? `اختيار ذكي! ${AR(x)} × ${AR(y)} = عدد ينتهي بصفر، والضرب فيه سهل.` : mine >= best ? 'اختيار جيد.' : 'يصلح، والناتج نفسه. لكن ابحث في المرة القادمة عن زوج يعطي ١٠ أو ٢٠.'}</p>
        <p class="mg-fact" dir="ltr">(${AR(x)} × ${AR(y)}) × ${AR(z)}</p>`;
      if (mine === 2 || mine >= best) stars++;
      mAsk(st, { q: `${AR(x)} × ${AR(y)} = ؟`, a: x * y, f: [x, y] }, () =>
        mAsk(st, { q: `${AR(x * y)} × ${AR(z)} = ؟`, a: x * y * z, f: [x * y, z] }, ok => {
          if (ok) star(1); HS.fx('ok'); mDone(st, `${f.map(AR).join(' × ')} = <b>${AR(f[0] * f[1] * f[2])}</b> ✅`); k++;
          labNext(st, k < list.length ? 'التالي ←' : 'النتيجة', round);
        }));
    });
  };
  round();
}

/* ---------- 🪑 arrange the tables: factors (grade 4, lesson 5-1) ---------- */
const FACTOR_N = [12, 18, 24, 16, 20, 36, 15];
function factorGame(el, lab) {
  const list = HS.shuffle(FACTOR_N.slice()).slice(0, 3); let k = 0, stars = 0;
  const ui = mShell(el, lab, 'نرتّب الطاولات في صفوف متساوية. كل ترتيب ينجح يعطينا زوجًا من القواسم.');
  const round = () => {
    if (k >= list.length) return mEnd(el, lab, stars, 'وجدت كل الترتيبات، أي كل القواسم.', () => factorGame(el, lab));
    const n = list[k], found = new Set(); let rows = 1; ui.round(`${AR(k + 1)} / ${AR(list.length)}`);
    const pairs = []; for (let r = 1; r * r <= n; r++) if (n % r === 0) pairs.push(r);
    const P = ui.play;
    const draw = (msg = '') => {
      const c = Math.ceil(n / rows), full = n % rows === 0;
      P.innerHTML = `<p class="mg-fact">${AR(n)} طاولة</p>
        <div class="fc-ctl"><button type="button" class="btn sec" id="fcM" aria-label="صفوف أقل">−</button><span>عدد الصفوف: <b>${AR(rows)}</b></span><button type="button" class="btn sec" id="fcP" aria-label="صفوف أكثر">+</button></div>
        <div class="m-model m-array fc-arr" dir="ltr" style="--c:${c}">${Array.from({ length: rows }, (_, r) => `<div class="m-row">${Array.from({ length: c }, (_, j) => r * c + j < n ? `<span class="m-cell">${mObj('table')}</span>` : '<span class="m-cell gap"></span>').join('')}</div>`).join('')}</div>
        <p class="mg-say" aria-live="polite">${msg || (full ? `${AR(rows)} صفوف، في كل صف ${AR(n / rows)}: <b>ينجح!</b>` : `الصفوف غير متساوية: آخر صف فيه ${AR(n - (rows - 1) * c)} فقط.`)}</p>
        <div class="row center">${full ? `<button type="button" class="btn" id="fcKeep">✔ سجّل: ${AR(rows)} × ${AR(n / rows)}</button>` : ''}</div>
        <p class="fc-found">القواسم التي وجدتها: ${[...found].sort((a, b) => a - b).map(r => `<span class="chip">${AR(r)} × ${AR(n / r)}</span>`).join(' ') || '—'}</p>`;
      $('fcM').onclick = () => { if (rows > 1) { rows--; draw(); } };
      $('fcP').onclick = () => { if (rows < n) { rows++; draw(); } };
      const kp = $('fcKeep'); if (kp) kp.onclick = () => {
        const r = Math.min(rows, n / rows);
        if (found.has(r)) return draw(`سجّلت ${AR(rows)} × ${AR(n / rows)} من قبل (أو عكسه). جرّب عددًا آخر من الصفوف.`);
        found.add(r); HS.fx('ok');
        if (found.size < pairs.length) return draw(`أحسنت! وجدت ${AR(found.size)} من ${AR(pairs.length)} ترتيبات.`);
        stars++; star(1);
        const facs = [...new Set(pairs.flatMap(r => [r, n / r]))].sort((a, b) => a - b);
        P.innerHTML = `<div class="fb ok mg-fb"><b>وجدت كل الترتيبات!</b><div>قواسم ${AR(n)}: ${facs.map(AR).join('، ')}</div></div>`;
        k++; labNext(P, k < list.length ? 'العدد التالي ←' : 'النتيجة', round);
      };
    };
    draw();
  };
  round();
}

/* ---------- 🟦 area model: partial products (grade 4, lessons 5-5 and 5-8) ---------- */
const AREA_P = [[36, 4], [24, 3], [47, 6], [132, 5], [215, 3], [108, 6], [58, 7]];
function areaGame(el, lab) {
  const list = HS.shuffle(AREA_P.slice()).slice(0, 4); let k = 0, stars = 0;
  const ui = mShell(el, lab, 'نقسم العدد الكبير حسب المنازل، ونضرب كل جزء، ثم نجمع النواتج الجزئية.');
  const round = () => {
    if (k >= list.length) return mEnd(el, lab, stars, 'حللت مسائل الضرب بنموذج المساحة.', () => areaGame(el, lab));
    const [a, b] = list[k], parts = placeParts(a), got = []; let okAll = true; ui.round(`${AR(k + 1)} / ${AR(list.length)}`);
    const P = ui.play;
    const draw = () => {
      P.innerHTML = `<p class="mg-fact">${AR(b)} × ${AR(a)} = ؟</p>
        <p>${AR(a)} = ${parts.map(AR).join(' + ')}. اضغط على كل جزء لتحسبه.</p>
        ${mathModel({ m: 'area', a, b, slots: true })}<div class="mg-steps"></div>`;
      P.querySelectorAll('.m-slot').forEach(s => {
        const i = +s.dataset.k;
        if (got[i] != null) { s.outerHTML = `<b>${AR(got[i])}</b>`; return; }
        s.onclick = () => {
          const st = P.querySelector('.mg-steps'); st.innerHTML = '';
          mAsk(st, { q: `${AR(b)} × ${AR(parts[i])} = ؟`, a: b * parts[i], f: [b, parts[i]], hint1: parts[i] >= 10 ? `احسب ${AR(b)} × ${AR(String(parts[i])[0])} ثم أضف ${parts[i] >= 100 ? 'صفرين' : 'صفرًا'}.` : '' || undefined }, ok => {
            okAll = okAll && ok; got[i] = b * parts[i]; HS.fx('ok');
            later(() => { draw(); if (parts.every((_, j) => got[j] != null)) total(); }, 600);
          });
        };
      });
    };
    const total = () => {
      const st = P.querySelector('.mg-steps');
      mAsk(st, { q: `${got.map(AR).join(' + ')} = ؟ <small>(نجمع النواتج الجزئية)</small>`, a: a * b, hint1: 'اجمع المئات مع المئات، والعشرات مع العشرات.' }, ok => {
        if (ok && okAll) { stars++; star(1); } mDone(st, `${AR(b)} × ${AR(a)} = <b>${AR(a * b)}</b> ✅`); k++;
        labNext(st, k < list.length ? 'المسألة التالية ←' : 'النتيجة', round);
      });
    };
    draw();
  };
  round();
}

/* ---------- 🧱 regroup with base-ten blocks (grade 4, explore 5-6) ---------- */
const REGROUP = [[16, 2], [13, 5], [24, 3], [18, 4], [45, 3], [27, 4]];
function regroupGame(el, lab) {
  const list = HS.shuffle(REGROUP.slice()).slice(0, 4); let k = 0, stars = 0;
  const ui = mShell(el, lab, 'نضع المجموعات معًا. كل ١٠ آحاد نبدّلها بعشرة واحدة (إعادة التجميع).');
  const round = () => {
    if (k >= list.length) return mEnd(el, lab, stars, 'أتقنت إعادة التجميع بالقطع.', () => regroupGame(el, lab));
    const [a, b] = list[k]; ui.round(`${AR(k + 1)} / ${AR(list.length)}`);
    let st = [0, Math.floor(a / 10) * b, (a % 10) * b];   // hundreds, tens, ones all together, not yet regrouped
    const P = ui.play;
    P.innerHTML = `<p class="mg-fact">${AR(b)} × ${AR(a)} = ؟</p><p>${AR(b)} مجموعات، في كل مجموعة ${AR(a)}:</p>
      <div class="rg-groups">${Array.from({ length: b }, () => mathModel({ m: 'blocks', n: a })).join('')}</div>
      <div class="row center"><button type="button" class="btn" id="rgJoin">نضعها معًا</button></div><div class="rg-all"></div>`;
    $('rgJoin').onclick = () => { $('rgJoin').disabled = true; join(); };
    const join = (msg = '') => {
      const box = P.querySelector('.rg-all'), need = st[2] >= 10 ? 'o' : st[1] >= 10 ? 't' : '';
      box.innerHTML = `${mathModel({ m: 'blocks', parts: st })}
        <p class="rg-count">${AR(st[0])} مئات، ${AR(st[1])} عشرات، ${AR(st[2])} آحاد</p><p class="mg-say" aria-live="polite">${msg}</p>
        <div class="row center">${need === 'o' ? `<button type="button" class="btn sky" id="rgSwap">بدّل ${AR(10)} آحاد بعشرة 🔁</button>` : need === 't' ? `<button type="button" class="btn sky" id="rgSwap">بدّل ${AR(10)} عشرات بمئة 🔁</button>` : ''}</div><div class="rg-ask"></div>`;
      if (need) { $('rgSwap').onclick = () => { if (need === 'o') { st[2] -= 10; st[1]++; } else { st[1] -= 10; st[0]++; } HS.fx('ok'); join(need === 'o' ? 'عشرة جديدة! 🧱' : 'مئة جديدة! 🟩'); }; return; }
      mAsk(box.querySelector('.rg-ask'), { q: 'كم العدد الآن؟', a: a * b, hint1: `${AR(st[0])} مئات و${AR(st[1])} عشرات و${AR(st[2])} آحاد.`, f: [a, b] }, ok => {
        if (ok) { stars++; star(1); } mDone(box, `${AR(b)} × ${AR(a)} = <b>${AR(a * b)}</b> ✅`); k++;
        labNext(box, k < list.length ? 'التالي ←' : 'النتيجة', round);
      });
    };
  };
  round();
}

LABS.g3math5 = {
  table: { id: 'table', title: '🔢 جدول الضرب', em: '🔢', sub: 'استكشف واملأ الفراغات', kind: 'math', lesson: 'l1', run: tableGame, challenges: [] },
  pg: { id: 'pg', title: '🎯 ثلاثة على استقامة واحدة', em: '🎯📎', sub: 'لعبة الكتاب ضد الحاسوب', kind: 'math', lesson: 'l3', run: productGame, challenges: [] },
  break: { id: 'break', title: '🧩 نفكّك الحقيقة', em: '🧩', sub: '٧ = ٥ + ٢، و٩ = ١٠ − ١', kind: 'math', lesson: 'l5', run: breakGame, challenges: BREAK },
  pair: { id: 'pair', title: '🤝 الزوج السهل', em: '🤝', sub: 'الخاصية التجميعية', kind: 'math', lesson: 'l8', run: pairGame, challenges: PAIRS },
};
LABS.g4math5 = {
  factor: { id: 'factor', title: '🪑 نرتّب الطاولات', em: '🪑', sub: 'القواسم والمضاعفات', kind: 'math', lesson: 'l1', run: factorGame, challenges: FACTOR_N },
  area: { id: 'area', title: '🟦 نموذج المساحة', em: '🟦', sub: 'النواتج الجزئية', kind: 'math', lesson: 'l5', run: areaGame, challenges: AREA_P },
  regroup: { id: 'regroup', title: '🧱 نعيد التجميع', em: '🧱', sub: 'بقطع دينز', kind: 'math', lesson: 'l6', run: regroupGame, challenges: REGROUP },
};
