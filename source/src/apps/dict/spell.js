/* ============================================================
   ✍️ SPELLING CHALLENGE (تحدّي الإملاء): guess how a word is written, one word after another.
   Runs inside the dictionary app (same scope as app.js: WORDS, AR(), tgt(), src(), diffHtml()…).
   Research behind it:
   - writing from memory (retrieval) beats copying, but only with immediate corrective feedback
     (da Silva, Ekuni & Jaeger 2023, grade 5) → every answer is checked at once, letter by letter;
   - cover-copy-compare: look at the right spelling, hide it, write it again from memory, compare
     → after a miss the word is shown, then hidden, and the child writes it again before going on;
   - mixing words (interleaving) helps more than drilling one → a missed word comes back after 3 others,
     between new words, never straight away;
   - a word counts as DONE when it is written right from memory without a hint and without having just
     seen it. Done words go to the "done" list and stop coming up (they can be put back from that list).
   The screen never changes shape: picture and meaning on top, letter boxes, one input, one button.
   Saved per child in HS.data('spell'): { en: { done: [ids] }, ar: { done: [ids] }, best }
   ============================================================ */
const SPN = () => { const d = HS.data('spell'); const k = AR() ? 'ar' : 'en'; d[k] = d[k] || { done: [] }; d.best = d.best || 0; return d; };
const spDone = () => SPN()[AR() ? 'ar' : 'en'].done;
/** words that fit the game: one word, letters only, not too long */
const spellable = x => { const t = tgtPlain(x); return !t.includes(' ') && t.length >= 2 && t.length <= 12 && (AR() || /^[a-z]+$/i.test(t)); };
let SG = null;   // current game
function spellPool() { const done = new Set(spDone()); return WORDS.filter(x => inLevel(x) && spellable(x) && !done.has(x.id)); }
function spellStart() {
  SG = { again: [], seen: 0, streak: 0, n: 0, combo: HS.makeCombo(), last: null };
  HS.markPractice(); spellNext();
}
/** next word: a missed word whose turn has come back, otherwise a new one (never the one just played) */
function spellPick() {
  SG.again.forEach(a => a.wait--);
  const back = SG.again.findIndex(a => a.wait <= 0);
  if (back >= 0) return { x: BY_ID[SG.again.splice(back, 1)[0].id], back: true };
  const pool = spellPool().filter(x => x.id !== SG.last && !SG.again.some(a => a.id === x.id));
  if (!pool.length) return SG.again.length ? { x: BY_ID[SG.again.shift().id], back: true } : null;
  return { x: HS.one(pool), back: false };
}
const spHead = () => `<div class="sp-head"><b>✍️ ${HS.L('تحدّي الإملاء', 'Spelling challenge')}</b>
  <span class="sp-chip" aria-label="${HS.L('كلمات متتالية صحيحة', 'words right in a row')}">🔥 ${HS.num(SG.streak)}</span>
  <button type="button" class="sp-chip sp-donebtn" data-sp="list">✓ ${HS.num(spDone().length)} <span>${HS.L('أتقنتها', 'done')}</span></button>
  <button type="button" class="d-x" data-a="home" aria-label="${HS.L('إنهاء', 'Stop')}">✕</button></div>`;
function spellNext() {
  const p = spellPick();
  if (!p) return spellAllDone();
  const x = p.x, T = tgtPlain(x);
  SG.cur = { x, T, back: p.back, tries: 0, hint: 0, phase: 'guess' }; SG.last = x.id; ROOT._dbg = T;
  const hide = s => AR() ? esc(s) : esc(s).replace(new RegExp('\\b' + x.w.slice(0, Math.max(3, x.w.length - 2)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*', 'gi'), '___');
  M().innerHTML = spHead() + `<div class="d-card sp-card">
    <div class="sp-clue"><span class="em" aria-hidden="true">${x.em}</span>
      <div><b dir="${sDir()}">${esc(src(x))}</b><p dir="ltr">${hide(x.def)}</p></div>
      ${AR() ? '' : `<button type="button" class="d-say sp-hear" data-say="${esc(x.w)}" aria-label="${HS.L('استمع للكلمة', 'Hear the word')}">🔊</button>`}</div>
    ${p.back ? `<p class="sp-back">🔁 ${HS.L('عادت لك هذه الكلمة: اكتبها من ذاكرتك', 'This word is back: write it from memory')}</p>` : ''}
    <p class="d-ask" id="spAsk">${AR() ? 'اكتب الكلمة بالعربي <small dir="ltr">Write it in Arabic</small>' : HS.L('كيف تُكتب بالإنجليزي؟', 'How do you spell it?')}</p>
    <div class="sp-boxes" id="spBoxes" dir="${tDir()}" aria-hidden="true">${[...T].map(() => '<i></i>').join('')}</div>
    <form class="sp-form" id="spF" dir="${tDir()}" autocomplete="off">
      <input id="spIn" dir="${tDir()}" lang="${AR() ? 'ar' : 'en'}" maxlength="${T.length}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
        aria-label="${HS.L('اكتب الكلمة هنا', 'Type the word here')} (${HS.num(T.length)} ${HS.L('حروف', 'letters')})" placeholder="${HS.L('اكتب هنا', 'Type here')}">
      <button type="submit" class="d-btn sp-go">${HS.L('تحقّق', 'Check')} ✅</button></form>
    <div class="sp-tools"><button type="button" class="d-btn sec" data-sp="hint">💡 ${HS.L('أعطني حرفًا', 'Give me a letter')}</button></div>
    ${AR() ? '<p class="d-note">على الآيباد: اضغط 🌐 في لوحة المفاتيح لتغيّرها إلى العربية</p>' : ''}
    <div id="spFb" class="d-fb" aria-live="polite"></div></div>`;
  spBind();
  if (!AR()) setTimeout(() => sayEn(x.w), 250);
}
/** the letter boxes mirror what is typed, so it is always clear where the next letter goes */
function spBoxes() {
  const v = $('spIn').value, c = SG.cur, boxes = $('spBoxes').querySelectorAll('i');
  boxes.forEach((b, k) => { b.textContent = v[k] || ''; b.classList.toggle('f', !!v[k]); b.classList.toggle('now', k === v.length); b.classList.toggle('hint', k < c.hint); });
}
function spBind() {
  const inp = $('spIn');
  inp.oninput = spBoxes; spBoxes();
  $('spBoxes').onclick = () => inp.focus();
  $('spF').onsubmit = e => { e.preventDefault(); const v = inp.value.trim(); if (v) spCheck(v); else inp.focus(); };
  setTimeout(() => inp.focus(), 60);
}
function spCheck(v) {
  const c = SG.cur, x = c.x, ok = same(v, c.T);
  c.tries++;
  const fb = $('spFb');
  if (c.phase === 'cover') {   // writing it again from memory after seeing it
    if (ok) {
      HS.fx('ok'); SG.again.push({ id: x.id, wait: 3 });
      fb.innerHTML = `<div class="good">👍 ${HS.L('صح! سترجع لك بعد قليل لتثبت', 'Right! It will come back soon to stick')}</div>`;
      return spAfter(900);
    }
    HS.fx('no');
    fb.innerHTML = `${diffHtml(v, c.T)}<p class="d-note">${HS.L('قارن ثم جرّب مرة أخرى', 'Compare, then try again')}</p>`;
    $('spIn').value = ''; spBoxes(); $('spIn').focus(); return;
  }
  if (ok) {
    const clean = !c.hint && c.tries === 1;
    SG.n++;
    if (clean) {
      spDone().push(x.id); SG.streak++; SPN().best = Math.max(SPN().best, SG.streak);
      HS.addStars(1 + SG.combo.hit()); HS.fx('ok');
      fb.innerHTML = `<div class="good">🎉 ${HS.one(AR() ? ['ممتاز!', 'أحسنت!', 'رائع!'] : ['Great!', 'Well done!', 'Super!', 'Excellent!'])} <span dir="${tDir()}">${esc(tgt(x))}</span> ✓ ${HS.L('أُضيفت إلى «أتقنتها»', 'added to “done”')}</div>`;
      if (SG.n % 10 === 0) { HS.party(); HS.toast(`🎉 ${HS.num(SG.n)} ${HS.L('كلمات!', 'words!')}`); }
    } else {
      HS.fx('ok'); SG.again.push({ id: x.id, wait: 3 });
      fb.innerHTML = `<div class="good">👍 ${HS.L('صح! بمساعدة، لذلك سترجع لك مرة ثانية', 'Right, with help, so it will come back once more')}</div>`;
    }
    HS.save(); return spAfter(clean ? 1100 : 1300);
  }
  // wrong: show the right spelling (look), then hide it and write it again (cover, write, compare)
  SG.streak = 0; SG.combo.miss(); HS.fx('no');
  c.phase = 'cover';
  fb.innerHTML = `<div class="bad">✋ ${HS.L('الصحيح:', 'The right spelling:')}</div>${diffHtml(v, c.T)}
    <p class="d-note">${HS.L('انظر جيدًا… ستختفي بعد لحظة، ثم اكتبها من ذاكرتك', 'Look carefully… it hides in a moment, then write it from memory')}</p>`;
  $('spIn').value = ''; $('spIn').disabled = true; spBoxes(); HS.save();
  setTimeout(() => {
    if (!SG || SG.cur !== c) return;
    fb.innerHTML = `<p class="d-note">🙈 ${HS.L('الآن اكتبها من ذاكرتك', 'Now write it from memory')}</p>`;
    const i = $('spIn'); i.disabled = false; i.focus();
  }, 2600);
}
function spAfter(ms) {
  const c = SG.cur; $('spIn').disabled = true;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'd-btn sp-next'; btn.textContent = HS.L('الكلمة التالية ←', 'Next word →');
  btn.onclick = () => { if (SG && SG.cur === c) spellNext(); };
  $('spFb').appendChild(btn);
  setTimeout(() => { if (SG && SG.cur === c && document.activeElement !== btn) spellNext(); }, ms);   // keeps going by itself
}
function spHint() {
  const c = SG.cur; if (!c || c.phase !== 'guess' || c.hint >= c.T.length - 1) return;
  c.hint++; const inp = $('spIn'); inp.value = c.T.slice(0, c.hint); spBoxes(); inp.focus(); HS.fx('tap');
}
function spellAllDone() {
  HS.party();
  M().innerHTML = spHead() + `<div class="d-card center"><div class="d-bigem">${HS.mascot('celebrate', { fb: '🏆' })}</div><h2>${HS.L('أتقنت كل كلمات هذا المستوى!', 'You spelled every word at this level!')}</h2>
    <p>${HS.L('اختر مستوى أصعب من صفحة القاموس، أو أعد كلمات من قائمة «أتقنتها».', 'Pick a harder level on the dictionary page, or put words back from the “done” list.')}</p>
    <div class="d-actions"><button type="button" class="d-btn" data-sp="list">✓ ${HS.L('أتقنتها', 'Done words')}</button><button type="button" class="d-btn sec" data-a="home">📖 ${HS.L('القاموس', 'Dictionary')}</button></div></div>`;
}
/** the "done" list: every word written right from memory, newest first; any word can go back into the game */
function spellList() {
  const ids = spDone().slice().reverse(), all = WORDS.filter(x => inLevel(x) && spellable(x)).length;
  M().innerHTML = `${backBtn()}<h2 class="d-h2">✓ ${HS.L('كلمات أتقنتها', 'Words I can spell')} <small>(${HS.num(ids.length)})</small></h2>
    <p class="d-note">${HS.L('هذه الكلمات لا تأتي في التحدّي. اضغط ↩️ لتعيد كلمة للتمرين.', 'These words no longer come up. Tap ↩️ to practise one again.')} ${HS.L('في هذا المستوى', 'At this level')}: ${HS.num(Math.min(ids.filter(id => BY_ID[id] && inLevel(BY_ID[id])).length, all))} / ${HS.num(all)}</p>
    ${ids.length ? `<div class="sp-list">${ids.map(id => { const x = BY_ID[id]; if (!x) return '';
      return `<div class="sp-row"><span class="em" aria-hidden="true">${x.em}</span><b dir="${tDir()}">${esc(tgt(x))}</b><span class="sp-src" dir="${sDir()}">${esc(src(x))}</span>
        <button type="button" class="d-btn sec" data-sp-back="${esc(id)}" aria-label="${HS.L('أعدها للتمرين', 'Practise again')}: ${esc(tgt(x))}">↩️</button></div>`; }).join('')}</div>`
      : `<div class="d-card center"><p>${HS.L('لا توجد كلمات بعد. كل كلمة تكتبها صحيحة من أول مرة تظهر هنا.', 'No words yet. Every word you spell right the first time shows up here.')}</p></div>`}
    <div class="d-actions"><button type="button" class="d-btn" data-sp="start">✍️ ${HS.L('العب تحدّي الإملاء', 'Play the spelling challenge')}</button></div>`;
}
ROOT.addEventListener('click', e => {
  const t = e.target.closest('[data-sp],[data-sp-back]'); if (!t || !ROOT.contains(t)) return;
  if (t.dataset.spBack) { const d = spDone(), i = d.indexOf(t.dataset.spBack); if (i >= 0) d.splice(i, 1); HS.save(); HS.toast('↩️ ' + HS.L('عادت للتمرين', 'Back in the game')); return spellList(); }
  const a = t.dataset.sp;
  if (a === 'start') return go(spellStart);
  if (a === 'list') return go(spellList);
  if (a === 'hint') return spHint();
});
/** for the parent page */
const spellReport = pid => { const d = HS.data('spell', pid); return { en: ((d.en || {}).done || []).length, ar: ((d.ar || {}).done || []).length, best: d.best || 0 }; };
