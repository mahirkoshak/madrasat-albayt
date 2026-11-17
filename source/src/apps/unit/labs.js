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
          const i = FW.C.indexOf(c); labNext(el, i + 1 < FW.C.length ? 'القصة التالية ←' : 'إلى بداية المختبر', () => i + 1 < FW.C.length ? story(FW.C[i + 1]) : intro()); }); }, 500);
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
