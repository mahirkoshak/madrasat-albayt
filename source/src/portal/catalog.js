/* ============================================================
   CATALOG: the menu of the site (years -> subjects -> units)
   ------------------------------------------------------------
   This is the only file you edit to add or rename menu items.

   Year:     { id, name, sub, em, color, subjects:[...] }
             { id, name, sub, em, color, app:'dict' }     -> a card next to the years that opens an app directly
   Subject:  { id, name, em, desc, color, units:[...] }   -> opens a list of units
             { id, name, em, desc, color, app:'kg' }      -> opens an app directly
   Unit:     { name, em, desc, color, unit:'g4scieco' }    -> opens src/units/g4scieco.js
             { name, em, desc, color, app:'kg' }          -> or opens a custom app
   color: any CSS color; theme colors from theme.css work, e.g. 'var(--t-blue)'.
   Any item: { name, em, soon:true }                     -> grey "coming soon" card
   Any item: art:'<id>'  its picture (an id from art-source/manifest-core.json). Until that picture is made
             and processed, the card shows `em`, so ids can be added before the artwork exists.

   `unit` must match the id in src/units/<id>.js; `app` must match the "id" in src/apps/<folder>/app.json.
   ids: English letters/digits only, no spaces or hyphens.
   ============================================================ */
window.CATALOG = [
  {
    id: 'kg', name: 'الروضة', sub: 'KG2 · عمر ٤–٥ سنوات', em: '🧸', art: 'grade-kg',
    color: 'var(--t-pink)',
    subjects: [
      { id: 'early', name: 'عربي و English', em: '🔤', art: 'subject-early',
        desc: 'حروف وأرقام وألوان وأشكال وحيوانات، كلها بالصوت',
        color: 'var(--t-orange)', app: 'kg' },
      { name: 'قصص وأناشيد', em: '📖', art: 'subject-stories', soon: true }
    ]
  },
  {
    id: 'g3', name: 'الصف الثالث', sub: 'ابتدائي · المنهج السعودي', em: '🧒', art: 'grade-g3',
    color: 'var(--t-orange)',
    subjects: [
      { id: 'sci', name: 'العلوم', em: '🔬', art: 'subject-science', desc: 'مراجعة الوحدات بالملخصات والألعاب والاختبارات',
        color: 'var(--t-blue)',
        units: [
          { name: 'الوحدة ١: المخلوقات الحية', em: '🌱', art: 'unit-g3sci-living-cover',
            color: 'var(--t-pink)', unit: 'g3scilife' },
          { name: 'الوحدة ٢: النظام البيئي', em: '🦁', art: 'unit-g3sci-eco-cover',
            color: 'var(--t-purple)', unit: 'g3scieco' },
          { name: 'الوحدة ٣: الأرض ومواردها', em: '🌎', art: 'unit-g3sciearth-cover',
            color: 'var(--t-orange)', unit: 'g3sciearth' },
          { name: 'الوحدة ٤: الطقس والمناخ', em: '⛅', art: 'unit-g3sci-weather-cover', soon: true }
        ] },
      { id: 'math', name: 'الرياضيات', em: '➗', art: 'subject-math', desc: 'دروس بالنماذج، وألعاب نحسب فيها بأنفسنا',
        color: 'var(--t-orange)',
        units: [
          { name: 'الفصل ٥: الضرب (٢)', em: '✖️', art: 'unit-g3math5-cover', color: 'var(--t-orange)', unit: 'g3math5' }
        ] },
      { name: 'لغتي', em: '📝', art: 'subject-arabic', soon: true }
    ]
  },
  {
    id: 'g4', name: 'الصف الرابع', sub: 'ابتدائي · المنهج السعودي', em: '🎒', art: 'grade-g4',
    color: 'var(--t-blue)',
    subjects: [
      { id: 'sci', name: 'العلوم', em: '🔬', art: 'subject-science', desc: 'مراجعة الوحدات بالملخصات والألعاب والاختبارات',
        color: 'var(--t-blue)',
        units: [
          { name: 'الأنظمة البيئية', em: '🌍', art: 'unit-g4scieco-cover',
            color: 'var(--t-purple)', unit: 'g4scieco' },
          { name: 'صحة الإنسان', em: '🩺', art: 'unit-g4scihealth-cover',
            color: 'var(--t-pink)', unit: 'g4scihealth' },
          { name: 'الخلايا وتصنيف المخلوقات', em: '🦠', art: 'unit-g4sci-cells-cover',
            color: 'var(--t-blue)', unit: 'g4scicells' },
          { name: 'الحيوانات وأجهزة أجسامها', em: '🐾', art: 'unit-g4sci-animals-cover',
            color: 'var(--t-orange)', unit: 'g4scianimals' }
        ] },
      { id: 'math', name: 'الرياضيات', em: '➗', art: 'subject-math', desc: 'دروس بالنماذج، وألعاب نحسب فيها بأنفسنا',
        color: 'var(--t-orange)',
        units: [
          { name: 'الفصل ٥: الضرب في عدد من رقم واحد', em: '✖️', art: 'unit-g4math5-cover', color: 'var(--t-blue)', unit: 'g4math5' }
        ] },
      { name: 'لغتي', em: '📝', art: 'subject-arabic', soon: true },
      { id: 'en', name: 'English', em: '🔠', art: 'subject-english', soon: true }
    ]
  },
  {
    id: 'g5', name: 'الصف الخامس', sub: 'ابتدائي · المنهج السعودي', em: '📘', art: 'grade-g5',
    color: 'var(--t-purple)',
    subjects: [
      { id: 'sci', name: 'العلوم', em: '🔬', art: 'subject-science', desc: 'مراجعة الوحدات بالملخصات والألعاب والاختبارات',
        color: 'var(--t-blue)',
        units: [
          { name: 'الوحدة ١: المخلوقات الحية', em: '🌿', art: 'unit-g5sci-living-cover',
            color: 'var(--t-pink)', unit: 'g5scilife' }
        ] }
    ]
  },
  /* Not a year: an app shown next to the years on the home page (for every child) */
  { id: 'dict', name: 'قاموسي', sub: 'إنجليزي وعربي · أكثر من ١١٠٠ كلمة', em: '📖', art: 'dict-cover',
    color: 'var(--t-purple)', app: 'dict' }
];
