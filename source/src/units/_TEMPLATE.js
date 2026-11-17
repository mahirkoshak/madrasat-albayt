/* ============================================================
   TEMPLATE FOR A NEW UNIT (this file is ignored by the build because its name starts with "_").
   1. Copy it to src/units/<id>.js  (id: lowercase letters/digits, e.g. g4scicells)
   2. Change UNITS._template below to UNITS.<id> and set id: '<id>'
   3. Add the unit to src/portal/catalog.js:  { name, em, desc, color, unit: '<id>' }
   4. python3 build.py
   All text may contain simple HTML: <b>bold</b>, <br>, <span class="term">term</span>.
   ============================================================ */
UNITS._template = {
  id: '_template',
  title: 'اسم الوحدة',
  subtitle: 'المادة والصف – الفصل',
  em: '📘',

  lessons: [
    {
      id: 'l1', em: '🔬', title: 'عنوان الدرس', short: 'وصف قصير يظهر في الخريطة',
      idea: 'الفكرة الرئيسة في جملة واحدة.',
      /* blocks, drawn in order. A "tiles" block without h joins the card before it.
         { t:'text', h:'عنوان (اختياري)', html:'...' }
         { t:'tiles', h:'...', items:[{ em:'🌱', b:'عنوان', p:'شرح', tone:'green|sky|sun|berry|earth|violet' }] }
         { t:'chain', items:[['☀️','الشمس','دور'], ...], note:'ملاحظة تحت السلسلة' }
         { t:'pyramid', h:'...', html:'...', levels:[['القاعدة','color'], ..., ['القمة','color']] }   (bottom first)
         { t:'html', h:'...', html:'<p>any HTML</p>' } */
      blocks: [
        { t: 'text', h: 'عنوان فقرة', html: '<span class="term">مصطلح</span>: تعريفه.' },
        { t: 'tiles', items: [{ em: '🌱', b: 'بطاقة', p: 'شرح قصير', tone: 'green' }] }
      ],
      remember: ['نقطة يجب حفظها', 'نقطة أخرى']
    }
  ],

  /* flashcards + memory game. short = 2–5 words for the memory cards */
  glossary: [
    { l: 'l1', em: '🌱', term: 'المصطلح', def: 'التعريف الكامل.', short: 'تعريف قصير' }
  ],

  /* every question needs a unique, permanent id (progress is saved by id: never reuse or renumber).
     l = lesson id. ex = short explanation shown after answering (always write one: it is what teaches).
     Good options: one clearly correct answer; wrong options are real mistakes a child might make;
     similar length; no "all/none of the above"; avoid NOT-questions.
     Optional, for better hints (a wrong first answer never shows the right one):
       hint1: 'first hint', hint2: 'second hint',
       mis: { 2: 'what choosing option 2 usually means, and a question that makes the child rethink it' }
     Without them the quiz builds hints from this unit's glossary and never puts the answer's words in a hint. */
  questions: [
    { id: 't1', l: 'l1', t: 'mcq', q: 'السؤال؟', o: ['الصحيح', 'خطأ شائع ١', 'خطأ شائع ٢', 'خطأ شائع ٣'], a: 0, ex: 'لماذا هذا صحيح.' },
    { id: 't2', l: 'l1', t: 'tf', q: 'عبارة صحيحة أو خاطئة.', a: true, ex: '...' },
    { id: 't3', l: 'l1', t: 'fill', q: 'جملة فيها ____ فراغ.', o: ['الكلمة', 'كلمة خطأ', 'كلمة خطأ'], a: 0, ex: '...' },
    { id: 't4', l: 'l1', t: 'pic', q: 'أيّها ...؟', o: ['🌵', '🐪', '💧', '🦎'], labels: ['صبّار', 'جمل', 'ماء', 'سحلية'], a: 2, ex: '...' },
    { id: 't5', l: 'l1', t: 'match', q: 'صِل ...:', pairs: [['يسار ١', 'يمين ١'], ['يسار ٢', 'يمين ٢'], ['يسار ٣', 'يمين ٣']], ex: '...' },
    { id: 't6', l: 'l1', t: 'order', q: 'رتّب ...:', items: ['الأول', 'الثاني', 'الثالث'], ex: '...' }   // items in the CORRECT order
  ],

  games: {
    /* drag cards into boxes. items: ['emoji','name', box index]. why: one sentence per box */
    sort: [
      { id: 'g1', l: 'l1', em: '🌱🪨', title: 'اسم اللعبة', ask: 'التعليمات',
        bins: [['الصندوق الأول', 'var(--t-green-btn)'], ['الصندوق الثاني', 'var(--t-blue)']],
        items: [['🌳', 'شجرة', 0], ['🪨', 'صخرة', 1]],
        why: ['لماذا الصندوق الأول', 'لماذا الصندوق الثاني'] }
    ],
    /* tap items in order. sets: each set in the CORRECT order, as [['emoji','name'], ...]
       or { title:'shown above the set', items:[['emoji','name'], ...] } when sets are different processes */
    order: []
  },

  parentTips: ['نصيحة للأب تظهر في صفحة الوحدة.']
};
