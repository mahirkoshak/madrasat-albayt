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

   `unit` must match the id in src/units/<id>.js; `app` must match the "id" in src/apps/<folder>/app.json.
   ids: English letters/digits only, no spaces or hyphens.
   ============================================================ */
window.CATALOG = [
  {
    id: 'kg', name: 'الروضة', sub: 'KG2 · عمر ٤–٥ سنوات', em: '🧸',
    color: 'var(--t-pink)',
    subjects: [
      { id: 'early', name: 'عربي و English', em: '🔤',
        desc: 'الحروف، الأرقام، الألوان، الأشكال، الحيوانات + ٨ ألعاب بالصوت',
        color: 'var(--t-orange)', app: 'kg' },
      { name: 'قصص وأناشيد', em: '📖', soon: true }
    ]
  },
  {
    id: 'g3', name: 'الصف الثالث', sub: 'ابتدائي · المنهج السعودي', em: '🧒',
    color: 'var(--t-orange)',
    subjects: [
      { id: 'sci', name: 'العلوم', em: '🔬', desc: 'مراجعة الوحدات بالملخصات والألعاب والاختبارات',
        color: 'var(--t-green-btn)',
        units: [
          { name: 'الوحدة ١: المخلوقات الحية', em: '🌱', soon: true },
          { name: 'الوحدة ٢: النظام البيئي', em: '🦁', soon: true },
          { name: 'الوحدة ٣: الأرض ومواردها', em: '🌎', desc: '٤ دروس: تغيرات الأرض الفجائية، التجوية والتعرية، التربة، الأحافير والوقود الأحفوري',
            color: 'var(--t-orange)', unit: 'g3sciearth' },
          { name: 'الوحدة ٤: الطقس والمناخ', em: '⛅', soon: true }
        ] },
      { name: 'الرياضيات', em: '➗', soon: true },
      { name: 'لغتي', em: '📝', soon: true }
    ]
  },
  {
    id: 'g4', name: 'الصف الرابع', sub: 'ابتدائي · المنهج السعودي', em: '🎒',
    color: 'var(--t-blue)',
    subjects: [
      { id: 'sci', name: 'العلوم', em: '🔬', desc: 'مراجعة الوحدات بالملخصات والألعاب والاختبارات',
        color: 'var(--t-green-btn)',
        units: [
          { name: 'الأنظمة البيئية', em: '🌍', desc: '٣ دروس · بطاقات · ٦ ألعاب · اختبار نهائي',
            color: 'var(--t-green-btn)', unit: 'g4scieco' },
          { name: 'صحة الإنسان', em: '🩺', desc: '٤ دروس · بطاقات · ٦ ألعاب · اختبار نهائي',
            color: 'var(--t-pink)', unit: 'g4scihealth' },
          { name: 'الخلايا وتصنيف المخلوقات', em: '🦠', soon: true },
          { name: 'الحيوانات وأجهزة أجسامها', em: '🐾', soon: true }
        ] },
      { name: 'الرياضيات', em: '➗', soon: true },
      { name: 'لغتي', em: '📝', soon: true },
      { name: 'English', em: '🔠', soon: true }
    ]
  },
  /* Not a year: an app shown next to the years on the home page (for every child) */
  { id: 'dict', name: 'قاموسي', sub: 'إنجليزي وعربي · أكثر من ١١٠٠ كلمة', em: '📖',
    color: 'var(--t-purple)', app: 'dict' }
];
