/* ============================================================
   THINKING LABS (نفكّر ونجرّب): predict → run → compare → explain → transfer
   Registered in LABS[unitId][labId] (app.js lists them on the games page and gives each a route:
   #unit-<unit>-play-lab-<id>).

   Each challenge keeps the fields an educator needs to review it:
     id, learningObjective, cognitiveSkill, prompt, correctAnswer, distractors, misconceptions (one per
     distractor), hint1, hint2, explanation, transferPrompt, difficulty (1–3), curriculumReference,
     review: true  → this statement is NOT in the unit's lesson text; a teacher should check it.
   The "why" questions use the quiz coach (renderQuestion with coach: true): a wrong first answer gets the
   misconception text for that choice, never the right answer.
   Pictures are drawn as SVG diagrams, not emoji, so they can show what matters (slope, roots, arrows).
   ============================================================ */

/* ---------- shared helpers ---------- */
const labRec = id => { const d = D(); d.labs = d.labs || {}; return d.labs[id] = d.labs[id] || { runs: 0, pred: 0, predOk: 0, why: 0, whyFirst: 0, done: [], last: 0 }; };
/** challenge fields → a question the quiz renderer understands (options shuffled by the renderer) */
function labQ(c) {
  const o = [c.correctAnswer, ...c.distractors];
  const mis = {}; c.misconceptions.forEach((m, i) => { mis[i + 1] = m; });
  return { id: 'lab:' + c.id, t: 'mcq', q: c.prompt, o, a: 0, ex: c.explanation, mis, hint1: c.hint1, hint2: c.hint2 };
}
function labSteps(n) {
  return `<ol class="lab-steps" aria-label="خطوات التجربة">${['نتوقّع', 'نجرّب', 'نقارن', 'نفسّر'].map((t, i) => `<li class="${i < n ? 'done' : i === n ? 'on' : ''}"${i === n ? ' aria-current="step"' : ''}>${t}</li>`).join('')}</ol>`;
}
/** ask the "why" question with hints; then(okFirst) */
function labWhy(el, lab, c, then) {
  const box = document.createElement('div'); box.className = 'card lab-why'; el.appendChild(box);
  box.innerHTML = `<h3>🤔 نفسّر</h3><div class="lab-q"></div><div class="fb" aria-live="polite"></div>`;
  renderQuestion(labQ(c), box.querySelector('.lab-q'), (ok, info) => {
    const r = labRec(lab.id); r.why++; if (ok) r.whyFirst++; HS.save();
    if (ok) star(1); else if (info.fixed) star(1);
    const fb = box.querySelector('.fb'); fb.className = 'fb ' + (ok || info.fixed ? 'ok' : 'no');
    fb.innerHTML = `<b>${ok ? 'تفسير صحيح! 🌟' : info.fixed ? 'وصلت إلى التفسير بنفسك! 👏' : 'هذا هو التفسير:'}</b><div>${c.explanation}</div>
      ${c.transferPrompt ? `<p class="lab-transfer">💭 <b>فكّر:</b> ${c.transferPrompt}</p>` : ''}`;
    then(ok);
  }, { coach: true });
  box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
/** the last story/case of a lab: a well-done card with play again, the next game, all games */
const labEnd = el => { const d = document.createElement('div'); d.className = 'card result lab-end';
  d.innerHTML = `<div class="big">${HS.kidCheer()}${HS.mascot('cheer', { fb: '🏅' })}</div><h2>أنهيت المختبر كله!</h2>${endRow()}`;
  el.appendChild(d); HS.party(); d.scrollIntoView({ behavior: 'smooth', block: 'center' }); const b = d.querySelector('[data-next]') || d.querySelector('button'); if (b) b.focus({ preventScroll: true }); };
const labNext = (el, label, fn) => { const r = document.createElement('div'); r.className = 'row center lab-next'; r.innerHTML = `<button type="button" class="btn">${label}</button>`; el.appendChild(r); const b = r.firstElementChild; b.onclick = fn; b.focus({ preventScroll: true }); };
const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   🌧️ EROSION LAB (grade 3, unit 3, lesson 2: weathering and erosion)
   Model (simplified, for comparing only): soil carried away = rain × slope × plant cover factor.
   rain 1–3, slope 1–3, plants 0 none / 1 a little / 2 thick (factor 1, .55, .2). Max 9.
   ============================================================ */
const ER = {
  rain: ['', 'خفيف', 'متوسط', 'غزير'], slope: ['', 'لطيف', 'متوسط', 'شديد'], veg: ['بلا نباتات', 'نباتات قليلة', 'نباتات كثيفة'],
  loss: s => s.rain * s.slope * [1, .55, .2][s.veg],
  /* the four challenges, easiest first */
  C: [
    { id: 'er-slope', kind: 'two', difficulty: 1, cognitiveSkill: 'التوقّع والمقارنة (تغيير عامل واحد)',
      learningObjective: 'يربط سرعة الماء الجاري على المنحدر بكمية التربة التي ينقلها (التعرية).',
      curriculumReference: 'علوم ٣، الوحدة ٣، درس «التجوية والتعرية»: الماء الجاري من عوامل التعرية', review: true,
      setup: 'تلّان من التربة نفسها، ومطر متوسط على الاثنين. الفرق الوحيد: <b>الانحدار</b>.',
      A: { rain: 2, slope: 1, veg: 0 }, B: { rain: 2, slope: 3, veg: 0 },
      prompt: 'لماذا نقل المطر تربة أكثر من التل شديد الانحدار؟',
      correctAnswer: 'لأن الماء يجري أسرع على المنحدر الشديد، فيحمل فتاتًا أكثر',
      distractors: ['لأن التل شديد الانحدار فيه تربة أكثر', 'لأن المطر سقط عليه أكثر', 'لأن الشمس جفّفته فتفتّت'],
      misconceptions: ['التربة كانت نفسها في التلّين. ما الشيء الوحيد الذي اختلف بينهما؟', 'المطر كان متوسطًا على التلّين معًا. انظر إلى الفرق في شكل التلّين.', 'هذه التجربة لم تغيّر الشمس. ما الذي يجعل الماء يجري أسرع؟'],
      hint1: 'قارن شكل التلّين: ماذا يحدث للماء على منحدر شديد؟', hint2: 'تذكّر: التعرية = نقل الفتات، والماء الأسرع يقدر أن يحمل أكثر.',
      explanation: 'على المنحدر الشديد يجري الماء أسرع، والماء الأسرع يحمل فتات الصخور والتربة أكثر. هذا نقل للفتات، أي <b>تعرية</b>.',
      transferPrompt: 'أين تتوقّع أن يحفر السيل أكثر: في وادٍ شديد الانحدار أم في أرض منبسطة؟' },
    { id: 'er-rain', kind: 'two', difficulty: 1, cognitiveSkill: 'التوقّع والمقارنة (تغيير عامل واحد)',
      learningObjective: 'يربط كمية الماء الجاري بكمية التربة المنقولة.',
      curriculumReference: 'علوم ٣، الوحدة ٣، درس «التجوية والتعرية»: الأنهار والسيول تحمل الحصى والرمل', review: true,
      setup: 'التل نفسه مرتين، والانحدار متوسط. الفرق الوحيد: <b>كمية المطر</b>.',
      A: { rain: 1, slope: 2, veg: 0 }, B: { rain: 3, slope: 2, veg: 0 },
      prompt: 'لماذا نقل المطر الغزير تربة أكثر؟',
      correctAnswer: 'لأن ماءً أكثر يجري على السطح فيحمل فتاتًا أكثر',
      distractors: ['لأن المطر الغزير يحوّل التربة إلى صخر', 'لأن المطر الخفيف لا يصل إلى التربة', 'لأن التل تغيّر شكله قبل المطر'],
      misconceptions: ['لو صارت التربة صخرًا لصعب نقلها. انظر: أين ذهبت التربة في الرسم؟', 'المطر الخفيف وصل إلى التربة، لكن الماء الجاري كان قليلًا. ماذا يحمل الماء الكثير؟', 'التل كان نفسه في المرتين: لم نغيّر إلا المطر.'],
      hint1: 'كم ماءً جرى على التل في كل مرة؟', hint2: 'الأنهار والسيول تحمل الحصى والرمل: ماذا يحدث إذا زاد الماء؟',
      explanation: 'كلما زاد الماء الجاري على السطح، حمل معه فتاتًا أكثر من التربة والصخور. لذلك تحدث <b>التعرية</b> أكثر بعد الأمطار الغزيرة والسيول.',
      transferPrompt: 'لماذا تبدو الأودية مختلفة بعد سيل كبير؟' },
    { id: 'er-plants', kind: 'two', difficulty: 2, cognitiveSkill: 'تفسير السبب (العلاقة بين النبات والتربة)',
      learningObjective: 'يفسّر كيف تقلّل النباتات التعرية: الجذور تمسك التربة.',
      curriculumReference: 'علوم ٣، الوحدة ٣، درس «التجوية والتعرية» و«التربة»', review: true,
      setup: 'تلّان شديدا الانحدار ومطر غزير على الاثنين. الفرق الوحيد: <b>النباتات</b>.',
      A: { rain: 3, slope: 3, veg: 0 }, B: { rain: 3, slope: 3, veg: 2 },
      prompt: 'لماذا فقد التل المزروع تربة أقل؟',
      correctAnswer: 'لأن جذور النباتات تمسك التربة، وأوراقها تخفّف ضربات المطر',
      distractors: ['لأن النباتات شربت كل ماء المطر', 'لأن النباتات أوقفت المطر', 'لأن التربة تحت النباتات أثقل وزنًا'],
      misconceptions: ['النباتات تأخذ بعض الماء فقط، وما زال ماء كثير يجري على السطح. انظر إلى الجذور في الرسم.', 'المطر سقط على التلّين بالقدر نفسه. ما الذي تحت سطح التل المزروع؟', 'التربة كانت من النوع نفسه. ما الذي يربط حبيبات التربة ببعضها؟'],
      hint1: 'انظر تحت سطح التل المزروع في الرسم. ماذا ترى؟', hint2: 'جذور النباتات تنتشر في التربة. ماذا تفعل بحبيباتها؟',
      explanation: 'جذور النباتات تنتشر في التربة وتمسك حبيباتها، وأوراقها تخفّف قوة قطرات المطر. لذلك ينقل الماء تربة أقل من التل المزروع.',
      transferPrompt: 'لماذا يزرع الناس الأشجار والشجيرات على جوانب الطرق الجبلية؟' },
    { id: 'er-garden', kind: 'fix', difficulty: 3, cognitiveSkill: 'تطبيق في موقف جديد (حلّ مشكلة)',
      learningObjective: 'يختار طريقة لتقليل التعرية ويختبرها بالتجربة.',
      curriculumReference: 'علوم ٣، الوحدة ٣، درس «التجوية والتعرية» (تطبيق)', review: true,
      setup: 'حديقة المدرسة على منحدر متوسط، وتربتها مكشوفة. بعد كل مطر غزير تجري التربة إلى الممر. ماذا تفعل؟',
      now: { rain: 3, slope: 2, veg: 0 },
      fixes: [['🌱 نزرع عشبًا وشجيرات على المنحدر', { veg: 2 }, true], ['✂️ نقلع النباتات القليلة الباقية', { veg: 0 }, false], ['⛰️ نجعل المنحدر أشدّ ليجري الماء بسرعة', { slope: 3 }, false]],
      prompt: 'لماذا نجح الحل الذي قلّل التربة المنقولة؟',
      correctAnswer: 'لأن الجذور أمسكت التربة فلم يحملها الماء بسهولة',
      distractors: ['لأن الماء جرى أسرع', 'لأن المطر صار أخف'],
      misconceptions: ['الماء الأسرع يحمل فتاتًا أكثر، لا أقل. تذكّر تجربة التلّين.', 'المطر بقي غزيرًا في التجربتين. ما الذي تغيّر في الحديقة؟'],
      hint1: 'ما الذي أضفناه إلى الحديقة؟', hint2: 'تذكّر تجربة التل المزروع.',
      explanation: 'النباتات تمسك التربة بجذورها، فيحمل الماء تربة أقل. أما المنحدر الأشد أو قلع النباتات فيزيدان التعرية.',
      transferPrompt: 'لو رأيت في حيّكم أرضًا مكشوفة تجرفها الأمطار، ماذا تقترح؟' }
  ]
};

/** SVG of one hillside: slope height, soil layer, plants with roots, rain, the soil carried to the bottom */
function hillSvg(s, label) {
  const top = { 1: 104, 2: 74, 3: 40 }[s.slope], X0 = 12, X1 = 170, Y = 132;
  const at = t => [X0 + (X1 - X0) * t, top + (Y - top) * t];
  const nV = [0, 3, 7][s.veg];
  const plants = Array.from({ length: nV }, (_, i) => { const [x, y] = at(.12 + .74 * (i + .5) / nV);
    return `<g class="pl"><path d="M${x} ${y + 9} l-3 6 M${x} ${y + 9} l0 9 M${x} ${y + 9} l4 7 M${x - 2} ${y + 14} l-3 3 M${x + 2} ${y + 15} l3 2" class="root"/>
      <path d="M${x} ${y} q-5 -8 -7 -12 M${x} ${y} q0 -9 1 -14 M${x} ${y} q5 -7 8 -10" class="leaf"/></g>`; }).join('');
  const rain = Array.from({ length: s.rain * 7 }, (_, i) => { const x = 8 + (i * 197 / (s.rain * 7)) % 200; return `<line x1="${x}" y1="${-10 - (i % 5) * 9}" x2="${x - 3}" y2="${-2 - (i % 5) * 9}" style="animation-delay:${(i % 7) * 90}ms"/>`; }).join('');
  const n = Math.round(ER.loss(s) * 2);
  const grains = Array.from({ length: n }, (_, i) => { const [x, y] = at(.08 + .8 * ((i * 37) % n) / Math.max(1, n));
    return `<circle class="gr" cx="${x.toFixed(1)}" cy="${(y + 3).toFixed(1)}" r="2.6" data-tx="${(186 + (i % 6) * 4.5 - x).toFixed(1)}" data-ty="${(Y - 3 - Math.floor(i / 6) * 4 - y - 3).toFixed(1)}" style="transition-delay:${i * 70}ms"/>`; }).join('');
  return `<svg class="hill" viewBox="0 0 220 150" role="img" aria-label="${label}: مطر ${ER.rain[s.rain]}، انحدار ${ER.slope[s.slope]}، ${ER.veg[s.veg]}">
    <g class="rain">${rain}</g>
    <polygon points="${X0},${Y} ${X0},${top} ${X1},${Y}" class="rock"/>
    <line x1="${X0}" y1="${top + 4}" x2="${X1}" y2="${Y}" class="soil"/>
    ${plants}<rect x="172" y="${Y}" width="46" height="4" class="path"/><g class="grains">${grains}</g>
    <line x1="0" y1="${Y + 2}" x2="220" y2="${Y + 2}" class="ground"/></svg>`;
}
function hillCard(s, label) {
  return `<figure class="lab-hill" data-k="${label}"><figcaption><b>${label}</b><span>🌧️ ${ER.rain[s.rain]} · ⛰️ ${ER.slope[s.slope]} · 🌱 ${ER.veg[s.veg]}</span></figcaption>${hillSvg(s, label)}
    <div class="lab-meter" aria-hidden="true"><i style="width:0"></i></div><p class="lab-out" aria-live="polite"></p></figure>`;
}
/** rain on the hills in el; then() when the soil has moved */
function rainOn(el, then) {
  const figs = [...el.querySelectorAll('.lab-hill')];
  figs.forEach(f => f.querySelector('svg').classList.add('raining'));
  const go = () => figs.forEach(f => {
    f.querySelectorAll('.gr').forEach(g => { g.style.transform = `translate(${g.dataset.tx}px,${g.dataset.ty}px)`; });
    const v = +f.dataset.loss; f.querySelector('.soil').style.strokeWidth = (9 - v * .75).toFixed(1);   // the soil layer gets thinner
    f.querySelector('.lab-meter i').style.width = Math.max(4, v / 9 * 100) + '%';
    f.querySelector('.lab-out').textContent = 'التربة المنقولة: ' + (v >= 6 ? 'كثيرة جدًا' : v >= 3.5 ? 'كثيرة' : v >= 1.5 ? 'قليلة' : 'قليلة جدًا');
  });
  if (reduced()) { go(); then(); return; }
  later(go, 600); later(() => { figs.forEach(f => f.querySelector('svg').classList.remove('raining')); then(); }, 2600);
}

function erosionLab(el, lab) {
  const r = labRec(lab.id); let ci = 0;
  const intro = () => {
    el.innerHTML = `<div class="card lab"><h2>🌧️ مختبر التعرية</h2>
      <p class="lead">نجرّب المطر على تلال من التربة. في كل تجربة نغيّر <b>شيئًا واحدًا فقط</b>، ونتوقّع قبل أن نجرّب.</p>
      <p class="lab-note">هذا نموذج مبسّط للمقارنة: الأرقام فيه ليست قياسات حقيقية.</p>
      <ol class="lab-list">${ER.C.map((c, i) => `<li class="${r.done.includes(c.id) ? 'ok' : ''}">${r.done.includes(c.id) ? '✅' : '🔬'} ${['الانحدار', 'كمية المطر', 'النباتات', 'حديقة المدرسة'][i]}</li>`).join('')}</ol>
      <div class="row center"><button type="button" class="btn" id="labGo">${r.done.length ? 'تجربة جديدة' : 'ابدأ التجربة الأولى'}</button><button type="button" class="btn sec" id="labFree">🧪 المختبر الحرّ</button></div></div>`;
    ci = Math.min(ER.C.length - 1, ER.C.findIndex(c => !r.done.includes(c.id)) < 0 ? 0 : ER.C.findIndex(c => !r.done.includes(c.id)));
    $('labGo').onclick = () => (ER.C[ci].kind === 'fix' ? fixOne : twoHills)(ER.C[ci]);
    $('labFree').onclick = free;
  };
  const after = c => { if (!r.done.includes(c.id)) r.done.push(c.id); r.last = Date.now(); HS.save();
    const i = ER.C.indexOf(c); labNext(el, i + 1 < ER.C.length ? 'التجربة التالية ←' : 'إلى المختبر الحرّ 🧪', () => i + 1 < ER.C.length ? (ER.C[i + 1].kind === 'fix' ? fixOne : twoHills)(ER.C[i + 1]) : free()); };

  function twoHills(c) {
    const lA = ER.loss(c.A), lB = ER.loss(c.B), more = lA > lB ? 'A' : 'B';
    el.innerHTML = `<div class="card lab">${labSteps(0)}<h2>🔬 ${ER.C.indexOf(c) + 1}. ${c.setup}</h2>
      <div class="lab-two">${hillCard(c.A, 'التل أ')}${hillCard(c.B, 'التل ب')}</div>
      <fieldset class="lab-pred"><legend>توقّع قبل المطر: أيّ تلّ سينقل المطر تربته أكثر؟</legend>
        <div class="row">${[['A', 'التل أ'], ['B', 'التل ب'], ['=', 'متساويان']].map(([k, t]) => `<button type="button" class="btn sec" data-pr="${k}" aria-pressed="false">${t}</button>`).join('')}</div></fieldset>
      <div class="row center"><button type="button" class="btn" id="labRun" disabled>🌧️ أنزل المطر</button></div><div class="lab-res" aria-live="polite"></div></div>`;
    const figs = el.querySelectorAll('.lab-hill'); figs[0].dataset.loss = lA; figs[1].dataset.loss = lB;
    let pred = null;
    el.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => { pred = b.dataset.pr; el.querySelectorAll('[data-pr]').forEach(x => { x.setAttribute('aria-pressed', x === b); x.classList.toggle('on', x === b); }); $('labRun').disabled = false; });
    $('labRun').onclick = () => {
      $('labRun').disabled = true; el.querySelectorAll('[data-pr]').forEach(x => x.disabled = true);
      el.querySelector('.lab-steps').outerHTML = labSteps(1); r.runs++;
      rainOn(el, () => {
        const ok = pred === more; r.pred++; if (ok) r.predOk++; HS.save();
        el.querySelector('.lab-steps').outerHTML = labSteps(2);
        el.querySelector('.lab-res').innerHTML = `<div class="lab-cmp ${ok ? 'ok' : ''}"><b>${more === 'A' ? 'التل أ' : 'التل ب'} نقل المطر تربته أكثر.</b>
          ${ok ? 'توقّعك صحيح! 🌟' : 'النتيجة غير ما توقّعت. لا بأس: العلماء يغيّرون رأيهم عندما يرون الدليل.'}</div>`;
        if (ok) star(1);
        later(() => { el.querySelector('.lab-steps').outerHTML = labSteps(3); labWhy(el, lab, c, () => after(c)); }, 500);
      });
    };
  }

  function fixOne(c) {
    el.innerHTML = `<div class="card lab">${labSteps(0)}<h2>🏫 ${c.setup}</h2>
      <div class="lab-two">${hillCard(c.now, 'الحديقة الآن')}</div>
      <fieldset class="lab-pred"><legend>اختر حلًّا، ثم جرّبه تحت المطر نفسه:</legend>
        <div class="col">${c.fixes.map((f, i) => `<button type="button" class="btn sec" data-fx="${i}" aria-pressed="false">${f[0]}</button>`).join('')}</div></fieldset>
      <div class="row center"><button type="button" class="btn" id="labRun" disabled>🌧️ جرّب الحل</button></div><div class="lab-res" aria-live="polite"></div></div>`;
    let pick = null, tries = 0;
    el.querySelectorAll('[data-fx]').forEach(b => b.onclick = () => { pick = +b.dataset.fx; el.querySelectorAll('[data-fx]').forEach(x => { x.setAttribute('aria-pressed', x === b); x.classList.toggle('on', x === b); }); $('labRun').disabled = false; });
    $('labRun').onclick = () => {
      const f = c.fixes[pick], after_ = Object.assign({}, c.now, f[1]); tries++; r.runs++;
      $('labRun').disabled = true;
      const two = el.querySelector('.lab-two');
      two.innerHTML = hillCard(c.now, 'قبل الحل') + hillCard(after_, 'بعد الحل');
      const figs = two.querySelectorAll('.lab-hill'); figs[0].dataset.loss = ER.loss(c.now); figs[1].dataset.loss = ER.loss(after_);
      el.querySelector('.lab-steps').outerHTML = labSteps(1);
      rainOn(el, () => {
        el.querySelector('.lab-steps').outerHTML = labSteps(2);
        const better = ER.loss(after_) < ER.loss(c.now);
        if (tries === 1) { r.pred++; if (better) r.predOk++; HS.save(); }
        el.querySelector('.lab-res').innerHTML = `<div class="lab-cmp ${better ? 'ok' : ''}">${better ? '<b>نجح الحل:</b> التربة المنقولة قلّت كثيرًا. 🌟' : ER.loss(after_) > ER.loss(c.now) ? '<b>انتبه:</b> هذا الحل زاد التربة المنقولة! جرّب حلًّا آخر.' : '<b>لم يتغيّر شيء.</b> جرّب حلًّا آخر.'}</div>`;
        if (better) { if (tries === 1) star(1); later(() => { el.querySelector('.lab-steps').outerHTML = labSteps(3); labWhy(el, lab, c, () => after(c)); }, 500); }
        else el.querySelectorAll('[data-fx]').forEach(x => { if (+x.dataset.fx === pick) { x.disabled = true; x.classList.add('no'); } });
      });
    };
  }

  function free() {
    const s = { rain: 2, slope: 2, veg: 0 };
    const seg = (k, opts, from) => `<fieldset class="lab-seg"><legend>${{ rain: '🌧️ المطر', slope: '⛰️ الانحدار', veg: '🌱 النباتات' }[k]}</legend><div class="row">${opts.slice(from).map((t, i) => `<button type="button" class="btn sec" data-k="${k}" data-v="${i + from}" aria-pressed="${s[k] === i + from}">${t}</button>`).join('')}</div></fieldset>`;
    el.innerHTML = `<div class="card lab"><h2>🧪 المختبر الحرّ</h2><p class="lead">غيّر شيئًا واحدًا كل مرة، ثم أنزل المطر وقارن بالمرة السابقة. هكذا تكون التجربة عادلة.</p>
      ${seg('rain', ER.rain, 1)}${seg('slope', ER.slope, 1)}${seg('veg', ER.veg, 0)}
      <div class="lab-two" id="labFreeHill"></div><div class="row center"><button type="button" class="btn" id="labRun">🌧️ أنزل المطر</button></div>
      <p class="lab-note" id="labPrev"></p></div>`;
    let prev = null;
    const draw = () => { $('labFreeHill').innerHTML = hillCard(s, 'تلّي'); $('labFreeHill').querySelector('.lab-hill').dataset.loss = ER.loss(s);
      el.querySelectorAll('[data-k]').forEach(b => b.setAttribute('aria-pressed', s[b.dataset.k] === +b.dataset.v)); };
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { s[b.dataset.k] = +b.dataset.v; draw(); });
    $('labRun').onclick = () => { $('labRun').disabled = true; r.runs++; HS.save();
      rainOn(el, () => { $('labRun').disabled = false; const v = ER.loss(s);
        if (prev != null) $('labPrev').textContent = v > prev ? '⬆️ نُقلت تربة أكثر من المرة السابقة.' : v < prev ? '⬇️ نُقلت تربة أقل من المرة السابقة.' : '＝ مثل المرة السابقة.';
        prev = v; }); };
    draw();
  }
  intro();
}

/* ============================================================
   🕸️ FOOD-WEB SHOCK (grade 4, ecosystems, lesson 2: relationships)
   Organisms and links come from the unit's own food chains:
   grass → grasshopper → lizard → hawk · wheat → mouse → snake → hawk · grass → rabbit (rabbit = herbivore).
   Arrows mean «the energy goes to…» (the unit's own note). A change spreads two steps:
   step 1 – whatever eats the changed organism changes the same way; whatever it eats changes the other way.
   step 2 – the same rule once more from the step-1 organisms. A simplified model: in nature animals can
   switch to other food. Every scenario is marked for educator review.
   ============================================================ */
const FW = {
  N: { grass: ['عشب', 75, 236, 'p'], wheat: ['قمح', 245, 236, 'p'], hopper: ['جرادة', 35, 152, 'c'], rabbit: ['أرنب', 130, 152, 'c'], mouse: ['فأر', 245, 152, 'c'],
       lizard: ['سحلية', 60, 78, 'c'], snake: ['ثعبان', 230, 78, 'c'], hawk: ['صقر', 145, 22, 'c'] },
  DEF: { grass: 'العشب', wheat: 'القمح', hopper: 'الجراد', rabbit: 'الأرانب', mouse: 'الفئران', lizard: 'السحالي', snake: 'الثعابين', hawk: 'الصقور' },
  E: [['grass', 'hopper'], ['grass', 'rabbit'], ['wheat', 'mouse'], ['hopper', 'lizard'], ['mouse', 'snake'], ['lizard', 'hawk'], ['snake', 'hawk']],
  /* one change → { id: +1 | -1 } for each step */
  spread(start, sign) {
    const eaters = x => this.E.filter(e => e[0] === x).map(e => e[1]), food = x => this.E.filter(e => e[1] === x).map(e => e[0]);
    const seen = { [start]: sign }, s1 = {}, s2 = {};
    const from = (x, sg, into) => { eaters(x).forEach(y => { if (!(y in seen)) { into[y] = sg; } }); food(x).forEach(y => { if (!(y in seen)) { into[y] = -sg; } }); };
    from(start, sign, s1); Object.assign(seen, s1);
    Object.keys(s1).forEach(x => from(x, s1[x], s2)); Object.keys(s2).forEach(k => { if (k in seen) delete s2[k]; });
    return [s1, s2];
  },
  C: [
    { id: 'fw-drought', start: 'grass', sign: -1, ask: ['rabbit', 'lizard'], difficulty: 1, kind: 'web',
      setup: 'جاء <b>جفاف</b> طويل، فقلّ <b>العشب</b> كثيرًا.',
      learningObjective: 'يتتبّع أثر نقص المنتج على المستهلكات في الشبكة الغذائية.', cognitiveSkill: 'التفكير في النتائج على خطوتين',
      curriculumReference: 'علوم ٤، الأنظمة البيئية، درس «العلاقات في الأنظمة البيئية»: السلسلة والشبكة الغذائية', review: true,
      prompt: 'لماذا قلّت السحالي مع أن الجفاف لم يصبها هي؟',
      correctAnswer: 'لأن الجراد الذي تأكله قلّ عندما قلّ العشب',
      distractors: ['لأن السحالي تأكل العشب', 'لأن الصقور زادت', 'لأن الجفاف يقتل كل الحيوانات فورًا'],
      misconceptions: ['تتبّع السهم الداخل إلى السحلية: من أين تأتيها الطاقة؟', 'الصقور لم تتغيّر في هذه القصة. ابدأ من العشب واصعد مع الأسهم.', 'لو كان ذلك صحيحًا لتغيّرت كل الحيوانات معًا. انظر: من تغيّر أولًا، ومن بعده؟'],
      hint1: 'ابدأ من العشب واتبع الأسهم صعودًا خطوة خطوة.', hint2: 'العشب ← الجرادة ← السحلية.',
      explanation: 'العشب منتج، والجراد يأكله. عندما قلّ العشب قلّ الجراد (الخطوة ١)، ثم قلّت السحالي لأن غذاءها قلّ (الخطوة ٢). التغيير في مخلوق واحد يصل إلى مخلوقات لا تأكله مباشرة.',
      transferPrompt: 'إذا قلّ القمح في الحقول، أيّ حيوان في الشبكة سيتأثّر في الخطوة الثانية؟' },
    { id: 'fw-hopper', start: 'hopper', sign: -1, ask: ['lizard', 'grass'], difficulty: 2, kind: 'web',
      setup: 'رشّ المزارعون مبيدًا، فاختفى <b>الجراد</b> تقريبًا.',
      learningObjective: 'يتوقّع أثر اختفاء مستهلك على غذائه وعلى من يأكله.', cognitiveSkill: 'التفكير في الاتجاهين (أعلى وأسفل الشبكة)',
      curriculumReference: 'علوم ٤، الأنظمة البيئية، درس «العلاقات» والدرس «التغيرات في الأنظمة البيئية»', review: true,
      prompt: 'لماذا زاد العشب عندما اختفى الجراد؟',
      correctAnswer: 'لأن الجراد كان يأكل العشب، فقلّ من يأكله',
      distractors: ['لأن المبيد سماد يقوّي العشب', 'لأن السحالي بدأت تزرع العشب', 'لأن الصقور تحمي العشب'],
      misconceptions: ['المبيد يقتل الحشرات، ولم يقل أحد إنه سماد. تتبّع الأسهم: من كان يأكل العشب؟', 'السحالي لا تزرع. انظر إلى السهم الخارج من العشب: إلى أين تذهب طاقته؟', 'الصقر بعيد عن العشب في الشبكة. ما المخلوق الذي بينهما مباشرة؟'],
      hint1: 'انظر إلى السهم الخارج من العشب: من يأكله؟', hint2: 'إذا قلّ من يأكل النبات، ماذا يحدث للنبات؟',
      explanation: 'الجراد كان يأكل العشب. عندما اختفى الجراد بقي عشب أكثر (الخطوة ١). وفي الوقت نفسه قلّت السحالي لأنها فقدت غذاءها.',
      transferPrompt: 'ولماذا قد يزيد الأرنب بعد ذلك؟' },
    { id: 'fw-snake', start: 'snake', sign: -1, ask: ['mouse', 'wheat'], difficulty: 2, kind: 'web',
      setup: 'قلّت <b>الثعابين</b> في المنطقة.',
      learningObjective: 'يفسّر أثر غياب المفترس على الفريسة وعلى المنتج.', cognitiveSkill: 'التفكير في النتائج على خطوتين',
      curriculumReference: 'علوم ٤، الأنظمة البيئية، درس «العلاقات»: المفترس والفريسة', review: true,
      prompt: 'لماذا قلّ القمح عندما قلّت الثعابين؟',
      correctAnswer: 'لأن الفئران زادت بعد أن قلّ من يصطادها، فأكلت قمحًا أكثر',
      distractors: ['لأن الثعابين كانت تأكل القمح', 'لأن الصقور أكلت القمح', 'لأن القمح يحتاج الثعابين ليكبر'],
      misconceptions: ['الثعبان آكل لحوم هنا: تتبّع السهم الداخل إليه.', 'السهم من القمح يذهب إلى الفأر وحده.', 'القمح منتج يصنع غذاءه بضوء الشمس. ما الذي يأكله؟'],
      hint1: 'من يصطاد الفئران؟ ماذا يحدث للفئران إذا قلّ صيّادها؟', hint2: 'الثعبان ← الفأر ← القمح: خطوتان.',
      explanation: 'الثعبان مفترس يصطاد الفئران. عندما قلّت الثعابين زادت الفئران (الخطوة ١)، فأكلت قمحًا أكثر فقلّ القمح (الخطوة ٢).',
      transferPrompt: 'لماذا يقول بعض المزارعين إن المفترسات قد تساعد حقولهم؟' },
    { id: 'fw-hawk', start: 'hawk', sign: -1, ask: ['snake', 'hopper'], difficulty: 3, kind: 'web',
      setup: 'صيد كثير للصقور، فقلّ عددها.',
      learningObjective: 'يطبّق قاعدة الخطوتين على مستهلك في قمة الشبكة.', cognitiveSkill: 'تطبيق في موقف جديد',
      curriculumReference: 'علوم ٤، الأنظمة البيئية، درس «التغيرات في الأنظمة البيئية»', review: true,
      prompt: 'لماذا قلّ الجراد عندما قلّت الصقور؟',
      correctAnswer: 'لأن السحالي زادت بعد أن قلّ من يصطادها، فأكلت جرادًا أكثر',
      distractors: ['لأن الصقور كانت تأكل العشب', 'لأن الجراد يأكل الصقور', 'لأن الجراد لا يتأثر بشيء'],
      misconceptions: ['الصقر في قمة الشبكة ويأكل الحيوانات. تتبّع الأسهم من الصقر نزولًا.', 'اتجاه السهم يعني «الطاقة تنتقل إلى». هل يدخل سهم من الصقر إلى الجراد؟', 'كل مخلوق في الشبكة مرتبط بغيره. من يأكل الجراد؟'],
      hint1: 'من تصطاد الصقور؟ وماذا يأكل ذلك الحيوان؟', hint2: 'الصقر ← السحلية ← الجرادة: خطوتان.',
      explanation: 'الصقور تصطاد السحالي والثعابين. عندما قلّت الصقور زادت السحالي والثعابين (الخطوة ١)، فأكلت جرادًا وفئرانًا أكثر فقلّ الجراد والفئران (الخطوة ٢).',
      transferPrompt: 'لماذا يحاول الناس حماية الحيوانات التي في قمة الشبكة الغذائية؟' }
  ]
};
function webSvg() {
  const N = FW.N, R = 21;
  const arrow = ([a, b]) => { const [, x1, y1] = N[a], [, x2, y2] = N[b], d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
    return `<line class="fw-e" data-e="${a}-${b}" x1="${(x1 + ux * R).toFixed(1)}" y1="${(y1 + uy * R).toFixed(1)}" x2="${(x2 - ux * (R + 4)).toFixed(1)}" y2="${(y2 - uy * (R + 4)).toFixed(1)}" marker-end="url(#fwA)"/>`; };
  return `<svg class="fw" viewBox="0 0 290 262" role="img" aria-label="شبكة غذائية: ${FW.E.map(([a, b]) => N[a][0] + ' يأكله ' + N[b][0]).join('، ')}">
    <defs><marker id="fwA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fw-ah"/></marker></defs>
    ${FW.E.map(arrow).join('')}
    ${Object.entries(N).map(([k, [t, x, y, kind]]) => `<g class="fw-n ${kind}" data-n="${k}" transform="translate(${x},${y})"><circle r="${R}"/><text y="5">${t}</text><g class="fw-b" transform="translate(16,-16)"><circle r="9"/><text y="4"></text></g></g>`).join('')}</svg>`;
}
function foodWebLab(el, lab) {
  const r = labRec(lab.id);
  const name = k => FW.N[k][0], def = k => FW.DEF[k];
  const said = (k, v) => `${def(k)}: ${v > 0 ? 'زاد العدد' : v < 0 ? 'قلّ العدد' : 'لم يتغيّر'}`;
  const intro = () => {
    el.innerHTML = `<div class="card lab"><h2>🕸️ صدمة الشبكة الغذائية</h2>
      <p class="lead">في كل قصة يتغيّر مخلوق واحد. توقّع ماذا يحدث لمخلوقين آخرين، ثم شاهد التغيير ينتقل مع الأسهم خطوة بعد خطوة.</p>
      <p class="lab-note">السهم يعني: «الطاقة تنتقل إلى…». هذا نموذج مبسّط: في الطبيعة قد تجد الحيوانات غذاءً آخر.</p>
      <div class="lab-web">${webSvg()}</div>
      <ol class="lab-list">${FW.C.map(c => `<li class="${r.done.includes(c.id) ? 'ok' : ''}">${r.done.includes(c.id) ? '✅' : '🔬'} ${c.setup.replace(/<[^>]+>/g, '')}</li>`).join('')}</ol>
      <div class="row center"><button type="button" class="btn" id="labGo">${r.done.length ? 'القصة التالية' : 'ابدأ'}</button></div></div>`;
    const i = FW.C.findIndex(c => !r.done.includes(c.id));
    $('labGo').onclick = () => story(FW.C[i < 0 ? 0 : i]);
  };
  function story(c) {
    const [s1, s2] = FW.spread(c.start, c.sign), truth = k => s1[k] || s2[k] || 0;
    el.innerHTML = `<div class="card lab">${labSteps(0)}<h2>🔬 ${c.setup}</h2>
      <div class="lab-web">${webSvg()}</div>
      ${c.ask.map(k => `<fieldset class="lab-pred" data-ask="${k}"><legend>ماذا يحدث لعدد <b>${def(k)}</b>؟</legend><div class="row">
        ${[['1', '⬆️ يزيد'], ['-1', '⬇️ يقلّ'], ['0', '＝ لا يتغيّر']].map(([v, t]) => `<button type="button" class="btn sec" data-v="${v}" aria-pressed="false">${t}</button>`).join('')}</div></fieldset>`).join('')}
      <div class="row center"><button type="button" class="btn" id="labRun" disabled>▶️ شاهد ماذا يحدث</button></div><div class="lab-res" aria-live="polite"></div></div>`;
    const svg = el.querySelector('.fw'), node = k => svg.querySelector(`[data-n="${k}"]`);
    node(c.start).classList.add('start', c.sign < 0 ? 'dn' : 'up'); node(c.start).querySelector('.fw-b text').textContent = c.sign < 0 ? '↓' : '↑';
    const pred = {};
    el.querySelectorAll('[data-ask]').forEach(fs => fs.querySelectorAll('[data-v]').forEach(b => b.onclick = () => {
      pred[fs.dataset.ask] = +b.dataset.v; fs.querySelectorAll('[data-v]').forEach(x => { x.setAttribute('aria-pressed', x === b); x.classList.toggle('on', x === b); });
      $('labRun').disabled = Object.keys(pred).length < c.ask.length; }));
    const mark = (m, step) => Object.entries(m).forEach(([k, v]) => { const n = node(k); n.classList.add(v > 0 ? 'up' : 'dn', 's' + step); n.querySelector('.fw-b text').textContent = v > 0 ? '↑' : '↓'; });
    $('labRun').onclick = () => {
      $('labRun').disabled = true; el.querySelectorAll('[data-v]').forEach(x => x.disabled = true); r.runs++;
      el.querySelector('.lab-steps').outerHTML = labSteps(1);
      const res = el.querySelector('.lab-res');
      const show = () => {
        el.querySelector('.lab-steps').outerHTML = labSteps(2);
        const okAll = c.ask.every(k => pred[k] === truth(k)); r.pred++; if (okAll) r.predOk++; HS.save();
        res.innerHTML += `<ul class="lab-cmp-list">${c.ask.map(k => `<li class="${pred[k] === truth(k) ? 'ok' : 'no'}">${pred[k] === truth(k) ? '✅' : '❌'} ${said(k, truth(k))}${s2[k] ? ' (في الخطوة ٢)' : ''}${pred[k] === truth(k) ? '' : '. توقّعك كان مختلفًا'}</li>`).join('')}</ul>`;
        if (okAll) star(1);
        later(() => { el.querySelector('.lab-steps').outerHTML = labSteps(3); labWhy(el, lab, c, () => { if (!r.done.includes(c.id)) r.done.push(c.id); r.last = Date.now(); HS.save();
          const i = FW.C.indexOf(c); i + 1 < FW.C.length ? labNext(el, 'القصة التالية ←', () => story(FW.C[i + 1])) : labEnd(el); }); }, 500);
      };
      const step1 = () => { mark(s1, 1); res.innerHTML = `<p><b>الخطوة ١:</b> ${Object.entries(s1).map(([k, v]) => said(k, v)).join('، ')}.</p>`; };
      const step2 = () => { mark(s2, 2); res.innerHTML += `<p><b>الخطوة ٢:</b> ${Object.keys(s2).length ? Object.entries(s2).map(([k, v]) => said(k, v)).join('، ') : 'لا تغيير آخر'}.</p>`; };
      if (reduced()) { step1(); step2(); show(); return; }
      later(step1, 500); later(step2, 1900); later(show, 2900);
    };
  }
  intro();
}

LABS.g3sciearth = { erosion: { id: 'erosion', title: '🌧️ مختبر التعرية', em: '🌧️⛰️', sub: 'توقّع، جرّب، فسّر', kind: 'think', lesson: 'l2', run: erosionLab, challenges: ER.C } };
LABS.g4scieco = { web: { id: 'web', title: '🕸️ صدمة الشبكة الغذائية', em: '🕸️🦅', sub: 'ماذا يحدث إذا تغيّر مخلوق واحد؟', kind: 'think', lesson: 'l2', run: foodWebLab, challenges: FW.C, spread: (s, g) => FW.spread(s, g) } };

/* ============================================================
   🔎 OUTBREAK DETECTIVE (grade 4, human health, lessons 1–2: diseases, infection)
   Fictional cases. A register lists sick AND healthy children and what each did. The child predicts how the
   illness spread, finds the one thing every sick child shares and no healthy child has (feedback names a real
   counter-example from the register), names the route, then chooses how to stop it.
   Routes are the lesson's five ways of infection; the last case is not infectious at all (lesson 1).
   Every case is marked for educator review: the cases are invented, the facts come from the lessons.
   ============================================================ */
const OB = {
  ROUTES: ['الاتصال المباشر', 'الهواء (الرذاذ)', 'الطعام والشراب', 'الأدوات الملوثة', 'النواقل (حشرات وحيوانات)', 'ليس مرضًا معديًا'],
  C: [
    { id: 'ob-trip', route: 2, difficulty: 1, review: true,
      title: 'رحلة المزرعة', report: 'بعد رحلة المزرعة، أصيب عدد من الطلاب بإسهال وقيء في اليوم التالي.',
      cols: ['الحافلة', 'الغداء', 'من أين شرب؟'],
      rows: [['سلمى', 'أ', 'فطيرة', 'خزّان مكشوف', 1], ['يوسف', 'ب', 'شطيرة', 'خزّان مكشوف', 1], ['ريم', 'أ', 'شطيرة', 'خزّان مكشوف', 1],
             ['عمر', 'ب', 'فطيرة', 'قارورة مغلقة', 0], ['لين', 'أ', 'فطيرة', 'قارورة مغلقة', 0], ['خالد', 'ب', 'شطيرة', 'قارورة مغلقة', 0]],
      key: 2,
      learningObjective: 'يتعرّف انتقال العدوى بالطعام والشراب من مقارنة المرضى بالأصحّاء.', cognitiveSkill: 'إيجاد العامل المشترك (مقارنة بمجموعة ضابطة)',
      curriculumReference: 'علوم ٤، صحة الإنسان، درس «العدوى وانتقالها»: الطعام والشراب', 
      prompt: 'لماذا نقول إن المرض انتقل بالشراب وليس بالغداء؟',
      correctAnswer: 'لأن كل من مرض شرب من الخزّان المكشوف، ولم يمرض أحد شرب من قارورة مغلقة',
      distractors: ['لأن الفطيرة لا تنقل المرض أبدًا', 'لأن الطلاب في الحافلة أ مرضوا كلهم', 'لأن الإسهال يأتي من التعب في الرحلة'],
      misconceptions: ['الطعام قد ينقل المرض أيضًا. لكن انظر إلى الجدول: هل كل من أكل الفطيرة مرض؟', 'لين ركبت الحافلة أ ولم تمرض. فالحافلة ليست السبب.', 'لو كان السبب التعب لمرض الجميع، فكلهم ذهبوا إلى الرحلة.'],
      hint1: 'قارن عمودًا عمودًا: أيّ عمود يفصل المرضى عن الأصحّاء تمامًا؟', hint2: 'انظر إلى عمود الشراب.',
      explanation: 'كل المرضى شربوا من الخزّان المكشوف، وكل من شرب من قارورة مغلقة بقي سليمًا. الماء الملوث والأطعمة المكشوفة من طرق انتقال العدوى.',
      stop: { q: 'كيف نمنع تكرار ذلك في الرحلة القادمة؟', a: 'نشرب من ماء نظيف مغلق، ولا نأكل الأطعمة المكشوفة', o: ['نجلس في الحافلة ب فقط', 'لا نأكل الغداء في الرحلات', 'نلبس الكمامة في الحافلة'],
        mis: ['الحافلة لم تكن السبب: مرض طلاب من الحافلتين.', 'الغداء لم يكن السبب هنا، والجسم يحتاج الطعام.', 'المرض لم ينتقل بالهواء هنا، بل بالشراب.'] },
      transferPrompt: 'لماذا يُطلب منّا ألّا نشتري الأطعمة المكشوفة من الباعة؟' },
    { id: 'ob-class', route: 1, difficulty: 1, review: true,
      title: 'الفصل الرابع', report: 'كان أحد الطلاب يعطس ويسعل دون منديل. بعد أيام أصيب بعض زملائه بحرارة وعطاس وسعال.',
      cols: ['أين يجلس؟', 'وجبة المقصف', 'شارك الأقلام؟'],
      rows: [['نورة', 'بجانبه', 'تمر', 'نعم', 1], ['فهد', 'أمامه', 'خبز', 'لا', 1], ['هيا', 'بجانبه', 'خبز', 'لا', 1],
             ['سعد', 'آخر الفصل', 'تمر', 'نعم', 0], ['جود', 'آخر الفصل', 'خبز', 'نعم', 0], ['ماجد', 'آخر الفصل', 'تمر', 'لا', 0]],
      key: 0, same: { 'بجانبه': 'near', 'أمامه': 'near' },
      learningObjective: 'يتعرّف انتقال العدوى بالرذاذ في الهواء عند العطاس والسعال.', cognitiveSkill: 'إيجاد العامل المشترك وربطه بالسبب',
      curriculumReference: 'علوم ٤، صحة الإنسان، درس «العدوى وانتقالها»: الهواء', 
      prompt: 'لماذا مرض من جلس قريبًا من الطالب المريض؟',
      correctAnswer: 'لأن الرذاذ خرج مع العطاس والسعال ووصل إلى عيون القريبين منه وأنوفهم وأفواههم',
      distractors: ['لأنهم شاركوه الأقلام', 'لأنهم أكلوا التمر من المقصف', 'لأن المكان القريب من السبورة بارد'],
      misconceptions: ['جود شاركت الأقلام ولم تمرض، وفهد لم يشارك ومرض.', 'فهد وهيا أكلا خبزًا ومرضا، وماجد أكل تمرًا ولم يمرض.', 'البرد لا يسبّب العدوى؛ الذي ينقلها شيء خرج من الطالب المريض.'],
      hint1: 'أيّ عمود يفصل المرضى عن الأصحّاء؟', hint2: 'ماذا يخرج من الفم والأنف عند العطاس دون منديل؟',
      explanation: 'عند السعال أو العطاس ينتقل الرذاذ في الهواء فيصل إلى عين الشخص القريب أو أنفه أو فمه. لذلك مرض الجالسون بقربه.',
      stop: { q: 'ماذا كان يجب أن يفعل الطالب المريض؟', a: 'يغطّي فمه وأنفه بمنديل ورقي عند العطاس والسعال', o: ['يتوقّف عن شرب الماء', 'يجلس في آخر الفصل ويعطس كما يريد', 'يشارك منديله مع زملائه'],
        mis: ['الماء لا علاقة له بالرذاذ، والجسم يحتاج الماء.', 'الرذاذ قد يصل إلى غيره أينما جلس.', 'المنديل المستعمل يحمل الجراثيم.'] },
      transferPrompt: 'لماذا يرتاح المريض في البيت ولا يخرج إلا للضرورة؟' },
    { id: 'ob-pool', route: 3, difficulty: 2, review: true,
      title: 'نادي السباحة', report: 'ظهر عند بعض أعضاء نادي السباحة طفح جلدي بين أصابع القدم.',
      cols: ['أيّ يوم يسبح؟', 'نعال المسبح', 'يجفّف قدميه؟'],
      rows: [['زياد', 'السبت', 'نعال النادي المشترك', 'أحيانًا', 1], ['دانة', 'الإثنين', 'نعال النادي المشترك', 'دائمًا', 1], ['بدر', 'الإثنين', 'نعال النادي المشترك', 'أحيانًا', 1],
             ['رهف', 'السبت', 'نعاله الخاصة', 'أحيانًا', 0], ['تركي', 'الإثنين', 'نعاله الخاصة', 'دائمًا', 0], ['ملك', 'السبت', 'نعالها الخاصة', 'دائمًا', 0]],
      key: 1, same: { 'نعاله الخاصة': 'own', 'نعالها الخاصة': 'own' },
      learningObjective: 'يتعرّف انتقال العدوى باستعمال أدوات الآخرين.', cognitiveSkill: 'إيجاد العامل المشترك وتطبيقه على العادات الشخصية',
      curriculumReference: 'علوم ٤، صحة الإنسان، درسا «الأمراض» (القدم الرياضي) و«العدوى وانتقالها» (الأدوات الملوثة)', 
      prompt: 'لماذا أصيب من لبس نعال النادي المشترك؟',
      correctAnswer: 'لأن الأدوات المشتركة تنقل العدوى من شخص إلى آخر',
      distractors: ['لأنهم سبحوا يوم الإثنين', 'لأن ماء المسبح يسبّب الطفح لكل من يسبح', 'لأنهم لا يجفّفون أقدامهم أبدًا'],
      misconceptions: ['زياد سبح يوم السبت ومرض، وتركي سبح يوم الإثنين ولم يمرض.', 'كلهم سبحوا في الماء نفسه، ولم يمرض الجميع.', 'دانة تجفّف قدميها دائمًا ومرضت. فهذا ليس الفرق.'],
      hint1: 'كلهم سبحوا. ما الشيء الذي استعمله المرضى فقط؟', hint2: 'من طرق انتقال العدوى: استعمال أدوات الآخرين.',
      explanation: 'كل المرضى لبسوا نعالًا مشتركة، وكل من لبس نعاله الخاصة بقي سليمًا. الأدوات المتسخة وأدوات الآخرين تنقل العدوى، والطفح بين الأصابع ينتشر في الأماكن الدافئة التي يكثر فيها التعرّق.',
      stop: { q: 'ما أفضل نصيحة لأعضاء النادي؟', a: 'كل شخص يستعمل نعاله ومنشفته الخاصة', o: ['يسبح الجميع يوم السبت فقط', 'نتوقّف عن السباحة', 'نتبادل النعال بعد كل سباحة'],
        mis: ['اليوم لم يكن السبب: مرض أعضاء من اليومين.', 'السباحة رياضة مفيدة، والمشكلة في الأدوات المشتركة.', 'تبادل النعال هو الذي نقل العدوى.'] },
      transferPrompt: 'لماذا يكون لكل فرد في البيت فرشاة أسنان خاصة به؟' },
    { id: 'ob-camp', route: 4, difficulty: 2, review: true,
      title: 'مخيّم البركة', report: 'في مخيّم قرب بركة ماء، أصيب بعض المخيّمين بالحمّى بعد أيام. لاحظوا لسعات بعوض على أذرعهم.',
      cols: ['أين نام؟', 'العشاء', 'من أين شرب؟'],
      rows: [['حمد', 'خارج الخيمة قرب البركة', 'أرز', 'قارورة', 1], ['شهد', 'خارج الخيمة قرب البركة', 'دجاج', 'قارورة', 1], ['ناصر', 'خارج الخيمة قرب البركة', 'أرز', 'إبريق المخيّم', 1],
             ['أروى', 'داخل الخيمة المغلقة', 'أرز', 'إبريق المخيّم', 0], ['سامي', 'داخل الخيمة المغلقة', 'دجاج', 'قارورة', 0], ['غدير', 'داخل الخيمة المغلقة', 'دجاج', 'إبريق المخيّم', 0]],
      key: 0,
      learningObjective: 'يتعرّف النواقل الحيوية (البعوض) طريقًا لانتقال العدوى.', cognitiveSkill: 'ربط الدليل (اللسعات) بالعامل المشترك',
      curriculumReference: 'علوم ٤، صحة الإنسان، درس «العدوى وانتقالها»: النواقل والملاريا', 
      prompt: 'لماذا نقول إن البعوض هو الذي نقل المرض؟',
      correctAnswer: 'لأن المرضى ناموا في الخارج حيث البعوض، والبعوض من نواقل الأمراض',
      distractors: ['لأن المرضى أكلوا الأرز', 'لأن الإبريق كان ملوثًا', 'لأن الحمّى تنتقل بالمصافحة'],
      misconceptions: ['شهد أكلت الدجاج ومرضت، وأروى أكلت الأرز ولم تمرض.', 'حمد وشهد شربا من قارورة ومرضا، وأروى شربت من الإبريق ولم تمرض.', 'لو انتقلت بالمصافحة لما كان مكان النوم هو الفرق. ولاحظ اللسعات.'],
      hint1: 'أين كان المرضى ليلًا؟', hint2: 'ما الحشرة التي تلسع وتنقل أمراضًا مثل الملاريا؟',
      explanation: 'كل المرضى ناموا خارج الخيمة قرب البركة، وكل من نام داخل الخيمة المغلقة بقي سليمًا. البعوض من النواقل الحيوية التي تحمل مسبّبات الأمراض وتنقلها.',
      stop: { q: 'ما الذي يحمي المخيّمين في المرة القادمة؟', a: 'النوم داخل الخيمة المغلقة بعيدًا عن البعوض', o: ['تغيير العشاء إلى الدجاج', 'الشرب من القوارير فقط', 'النوم خارج الخيمة قرب البركة'],
        mis: ['العشاء لم يكن الفرق بين المرضى والأصحّاء.', 'من شربوا من القوارير مرضوا أيضًا.', 'هذا هو المكان الذي كثرت فيه اللسعات.'] },
      transferPrompt: 'الكلاب والفئران والطيور والذباب نواقل أيضًا. كيف نحمي طعامنا من الذباب؟' },
    { id: 'ob-sugar', route: 5, difficulty: 3, review: true,
      title: 'هل ينتقل؟', report: 'عرف الطلاب أن زميلتهم مصابة بالسكري، فقال بعضهم: «لا تصافحوها حتى لا نمرض». مرّ شهر.',
      cols: ['صافحها؟', 'جلس بجانبها؟', 'لعب معها؟'],
      rows: [['أمل', 'نعم', 'نعم', 'نعم', 0], ['مشاري', 'نعم', 'لا', 'نعم', 0], ['وعد', 'لا', 'نعم', 'نعم', 0],
             ['راشد', 'نعم', 'نعم', 'لا', 0], ['لمى', 'لا', 'لا', 'نعم', 0], ['عبدالله', 'نعم', 'نعم', 'نعم', 0]],
      key: -1,
      learningObjective: 'يميّز المرض غير المعدي ويصحّح فكرة خاطئة شائعة.', cognitiveSkill: 'استخدام الدليل لرفض فرضية',
      curriculumReference: 'علوم ٤، صحة الإنسان، درس «الأمراض»: السكري مرض غير معدٍ', 
      prompt: 'لماذا لم يمرض أحد ممّن صافحها؟',
      correctAnswer: 'لأن السكري مرض غير معدٍ؛ سببه خلل في مستوى الأنسولين داخل الجسم',
      distractors: ['لأنهم غسلوا أيديهم بعد المصافحة', 'لأن السكري ينتقل بالهواء فقط', 'لأن الشهر مدة قصيرة'],
      misconceptions: ['حتى من غير غسل اليدين لا ينتقل هذا المرض. ما سببه؟', 'لو انتقل بالهواء لمرض من جلس بجانبها.', 'الأمراض المعدية التي درسناها تظهر في أيام. والسكري سببه داخل الجسم.'],
      hint1: 'انظر: هل في الجدول أي مريض؟', hint2: 'ما سبب السكري: جرثومة أم شيء داخل الجسم؟',
      explanation: 'لم يمرض أحد مهما فعل، لأن السكري مرض غير معدٍ: ينتج عن خلل في مستوى الأنسولين الذي يفرزه البنكرياس، ولا ينتقل من شخص إلى آخر.',
      stop: { q: 'ماذا نقول للطلاب؟', a: 'صافحوها والعبوا معها كالعادة، فالسكري لا ينتقل', o: ['ابتعدوا عنها حتى تشفى', 'ضعوا الكمامة عندما تكونون معها', 'لا تأكلوا معها في المقصف'],
        mis: ['الابتعاد عنها يجرحها ولا يحمي أحدًا: السكري لا ينتقل.', 'الكمامة تحمي من الرذاذ في الأمراض المعدية، والسكري ليس منها.', 'الأكل معها لا ينقل السكري.'] },
      transferPrompt: 'اذكر مرضًا آخر غير معدٍ من الدرس.' }
  ]
};
function outbreakLab(el, lab) {
  const r = labRec(lab.id);
  const valOf = (c, row, k) => { const v = row[k + 1]; return (c.same && c.same[v]) || v; };
  const intro = () => {
    el.innerHTML = `<div class="card lab"><h2>🔎 محقّق العدوى</h2>
      <p class="lead">في كل قضية مرض بعض الناس. اقرأ السجلّ وقارن <b>المرضى</b> بـ<b>الأصحّاء</b>: ما الشيء الذي يشترك فيه كل المرضى ولا يوجد عند أيّ سليم؟</p>
      <p class="lab-note">القضايا والأسماء خيالية. المعلومات من دروس الوحدة.</p>
      <ol class="lab-list">${OB.C.map(c => `<li class="${r.done.includes(c.id) ? 'ok' : ''}">${r.done.includes(c.id) ? '✅' : '🗂️'} ${c.title}</li>`).join('')}</ol>
      <div class="row center"><button type="button" class="btn" id="labGo">${r.done.length ? 'القضية التالية' : 'افتح القضية الأولى'}</button></div></div>`;
    const i = OB.C.findIndex(c => !r.done.includes(c.id));
    $('labGo').onclick = () => caseView(OB.C[i < 0 ? 0 : i]);
  };
  function caseView(c) {
    const sick = c.rows.filter(x => x[4]), well = c.rows.filter(x => !x[4]);
    el.innerHTML = `<div class="card lab">${labSteps(0)}<h2>🗂️ ${c.title}</h2><p class="ob-report">${c.report}</p>
      <fieldset class="lab-pred"><legend>توقّع قبل أن تفتح السجلّ: كيف انتقل المرض؟</legend>
        <div class="col">${OB.ROUTES.map((t, i) => `<button type="button" class="btn sec" data-pr="${i}" aria-pressed="false">${t}</button>`).join('')}</div></fieldset>
      <div class="row center"><button type="button" class="btn" id="labRun" disabled>📋 افتح السجلّ</button></div><div class="lab-res"></div></div>`;
    let pred = null;
    el.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => { pred = +b.dataset.pr; el.querySelectorAll('[data-pr]').forEach(x => { x.setAttribute('aria-pressed', x === b); x.classList.toggle('on', x === b); }); $('labRun').disabled = false; });
    $('labRun').onclick = () => {
      $('labRun').disabled = true; el.querySelectorAll('[data-pr]').forEach(x => x.disabled = true); r.runs++;
      el.querySelector('.lab-steps').outerHTML = labSteps(1);
      const res = el.querySelector('.lab-res');
      res.innerHTML = `<div class="ob-wrap"><table class="ob-t"><caption>سجلّ القضية</caption><thead><tr><th scope="col">الاسم</th><th scope="col">الحالة</th>${c.cols.map((h, k) => `<th scope="col"><button type="button" class="ob-col" data-k="${k}" aria-pressed="false">${h}</button></th>`).join('')}</tr></thead>
        <tbody>${c.rows.map(x => `<tr class="${x[4] ? 'sick' : ''}"><th scope="row">${x[0]}</th><td class="st">${x[4] ? '🤒 مريض' : '🙂 سليم'}</td>${c.cols.map((_, k) => `<td data-k="${k}">${x[k + 1]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        <p class="ob-ask" id="obAsk"><b>${c.key < 0 ? 'هل يشترك المرضى في شيء؟ اضغط على العمود الذي يفصل المرضى عن الأصحّاء، أو اختر:' : 'اضغط على العمود الذي يفصل المرضى عن الأصحّاء:'}</b></p>
        ${c.key < 0 ? '<div class="row center"><button type="button" class="btn sec" id="obNone">لا يوجد مريض أصلًا</button></div>' : ''}
        <div class="coach" id="obCoach" role="status" hidden></div>`;
      let tries = 0;
      const found = () => {
        el.querySelectorAll('.ob-col,#obNone').forEach(x => x.disabled = true); $('obCoach').hidden = true;
        if (c.key >= 0) el.querySelectorAll(`td[data-k="${c.key}"]`).forEach(td => td.classList.add('key'));
        el.querySelector('.lab-steps').outerHTML = labSteps(2);
        const ok = pred === c.route; r.pred++; if (ok) r.predOk++; if (tries === 0) star(1); HS.save();
        res.insertAdjacentHTML('beforeend', `<div class="lab-cmp ${ok ? 'ok' : ''}"><b>${c.key < 0 ? 'لم يمرض أحد مهما فعل.' : `كل المرضى يشتركون في «${c.cols[c.key]}»، ولا يشترك فيه أي سليم.`}</b>
          ${ok ? 'وتوقّعك كان صحيحًا! 🌟' : `توقّعت «${OB.ROUTES[pred]}». الدليل يقول شيئًا آخر، وهكذا يعمل المحقّقون.`}</div>`);
        later(() => { el.querySelector('.lab-steps').outerHTML = labSteps(3); labWhy(el, lab, c, () => stopIt(c)); }, 500);
      };
      // a wrong column: name a real counter-example from the register
      const why = k => {
        const vals = sick.map(x => valOf(c, x, k)), common = vals.sort((a, b) => vals.filter(v => v === b).length - vals.filter(v => v === a).length)[0];
        const w = well.find(x => valOf(c, x, k) === common), s = sick.find(x => valOf(c, x, k) !== common);
        if (w) return `في السجلّ: ${w[0]}، «${c.cols[k]}»: ${w[k + 1]} مثل المرضى، لكن الحالة «سليم». فهذا العمود لا يفسّر المرض.`;
        if (s) return `في السجلّ: ${s[0]}، «${c.cols[k]}»: ${s[k + 1]}، وهذا يختلف عن بقية المرضى، لكن الحالة «مريض». فهذا العمود لا يفسّر المرض.`;
        return 'قارن المرضى بالأصحّاء في هذا العمود.';
      };
      el.querySelectorAll('.ob-col').forEach(b => b.onclick = () => {
        const k = +b.dataset.k;
        if (k === c.key) { b.classList.add('ok'); return found(); }
        tries++; b.classList.add('no'); b.disabled = true; HS.fx('no');
        const box = $('obCoach'); box.hidden = false;
        box.innerHTML = `<span class="coach-ic" aria-hidden="true">💡</span><span>${c.key < 0 ? 'انظر إلى عمود الحالة: هل مرض أحد؟' : why(k)}${tries >= 2 ? ' ' + c.hint2 : ''}</span>`;
      });
      if ($('obNone')) $('obNone').onclick = found;
      res.querySelector('.ob-t').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
  }
  function stopIt(c) {
    const box = document.createElement('div'); box.className = 'card lab-why'; el.appendChild(box);
    box.innerHTML = `<h3>🛡️ نوقف المرض</h3><div class="lab-q"></div><div class="fb" aria-live="polite"></div>`;
    const q = { id: 'lab:' + c.id + ':stop', t: 'mcq', q: c.stop.q, o: [c.stop.a, ...c.stop.o], a: 0, mis: Object.fromEntries(c.stop.mis.map((m, i) => [i + 1, m])), hint1: 'تذكّر ما وجدته في السجلّ.', hint2: 'الحل يمنع الشيء المشترك بين المرضى.' };
    renderQuestion(q, box.querySelector('.lab-q'), (ok, info) => {
      if (ok || info.fixed) star(1);
      const fb = box.querySelector('.fb'); fb.className = 'fb ' + (ok || info.fixed ? 'ok' : 'no');
      fb.innerHTML = `<b>${ok ? 'أحسنت أيها المحقّق! 🔎' : info.fixed ? 'وجدت الحل بنفسك! 👏' : 'هذا هو الحل:'}</b><div>${c.stop.a}.</div>`;
      if (!r.done.includes(c.id)) r.done.push(c.id); r.last = Date.now(); HS.save();
      const i = OB.C.indexOf(c); i + 1 < OB.C.length ? labNext(el, 'القضية التالية ←', () => caseView(OB.C[i + 1])) : labEnd(el);
    }, { coach: true });
    box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  intro();
}
LABS.g4scihealth = { outbreak: { id: 'outbreak', title: '🔎 محقّق العدوى', em: '🔎🦠', sub: 'من السجلّ إلى السبب', kind: 'think', lesson: 'l2', run: outbreakLab, challenges: OB.C } };
