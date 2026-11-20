/* ============================================================
   WORKED EXAMPLES WITH FADING (lesson block t:'worked'), loaded with app.js in the same scope.
   Research: studying a step-by-step solution first, then a similar problem with the LAST step left out
   ("backward fading"), then solving alone, works better for new learners than solving straight away.
   { t:'worked', h:'title', q:'the solved problem', steps:['step 1', 'step 2', …],
     try:{ q:'a similar problem', steps:['step 1', …, 'last step (hidden: the child writes its answer)'], a:'٦٤٨', unit:'optional word after the box' } }
   The steps appear one at a time («الخطوة التالية»); the practice problem appears after the last step.
   ============================================================ */
let WK_N = 0;
const WK = {};
const wkNorm = s => String(s).replace(/[\u064B-\u0652\u0640]/g, '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  .replace(/[٫،,]/g, '.').replace(/[\s٬']/g, '').replace(/^\.+|\.+$/g, '').replace(/\.0+$/, '');
function workedBlock(b) {
  const id = 'wk' + (++WK_N); WK[id] = b;
  const t = b.try;
  return `${b.h ? `<h3>${b.h}</h3>` : ''}<div class="wk" id="${id}">
    <p class="wk-q"><span class="wk-tag">مثال محلول</span> ${b.q}</p>
    <ol class="wk-steps">${b.steps.map((s, i) => `<li${i ? ' hidden' : ''}>${s}</li>`).join('')}</ol>
    ${b.steps.length > 1 ? `<button type="button" class="btn sky wk-next" data-wnext="${id}">الخطوة التالية</button>` : ''}
    ${t ? `<div class="wk-try"${b.steps.length > 1 ? ' hidden' : ''}>
      <p class="wk-q"><span class="wk-tag try">جرّب أنت</span> ${t.q}</p>
      <ol class="wk-steps">${t.steps.slice(0, -1).map(s => `<li>${s}</li>`).join('')}<li class="wk-last">${t.steps[t.steps.length - 1]}
        <span class="wk-in"><input type="text" ${t.text ? 'dir="rtl" class="wk-word"' : 'inputmode="decimal" dir="ltr"'} aria-label="${t.text ? 'اكتب الجواب' : 'اكتب الناتج'}" autocomplete="off" autocapitalize="off" spellcheck="false">${t.unit ? `<span>${t.unit}</span>` : ''}
        <button type="button" class="btn" data-wcheck="${id}">تحقّق</button></span></li></ol>
      <p class="fb" aria-live="polite"></p></div>` : ''}
  </div>`;
}
ROOT.addEventListener('click', e => {
  const nx = e.target.closest('[data-wnext]');
  if (nx) {
    const box = $(nx.dataset.wnext), next = box.querySelector('.wk-steps li[hidden]');
    if (next) { next.hidden = false; next.classList.add('hs-pop'); HS.fx('tap'); }
    if (!box.querySelector('.wk-steps li[hidden]')) { nx.hidden = true; const t = box.querySelector('.wk-try'); if (t) { t.hidden = false; const i = t.querySelector('input'); if (i) i.focus({ preventScroll: true }); } }
    return;
  }
  const ck = e.target.closest('[data-wcheck]');
  if (ck) {
    const box = $(ck.dataset.wcheck), b = WK[ck.dataset.wcheck], inp = box.querySelector('.wk-try input'), fb = box.querySelector('.wk-try .fb');
    const tries = (+box.dataset.tries || 0) + 1; box.dataset.tries = tries;
    if (!inp.value.trim()) { fb.className = 'fb'; fb.textContent = 'اكتب الناتج أولًا.'; inp.focus(); return; }
    if (wkNorm(inp.value) === wkNorm(b.try.a)) { fb.className = 'fb ok'; fb.innerHTML = '✅ صحيح! حللتها بالخطوات نفسها.'; HS.fx('ok'); inp.disabled = ck.disabled = true; return; }
    HS.fx('no'); fb.className = 'fb no';
    fb.innerHTML = tries < 2 ? 'ليس بعد. ارجع إلى الخطوة الأخيرة في المثال المحلول، وافعل مثلها.' : `${b.try.text ? 'الجواب' : 'الناتج'}: <b>${b.try.a}</b>. قارن خطواتك بخطوات المثال.`;
    if (tries >= 2) inp.disabled = ck.disabled = true;
  }
});
ROOT.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.wk-try input')) { e.preventDefault(); e.target.closest('.wk-try').querySelector('[data-wcheck]').click(); } });
