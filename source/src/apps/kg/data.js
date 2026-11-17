/* Content for the Kindergarten "Arabic & English" app.
   Edit words, pictures and questions here; no code changes needed.

   AR   Arabic letters:  ["letter","letter name (spoken)","word","emoji"]
   EN   English letters: ["Letter","Word","emoji"]
   NUM  numbers:         [n,"Arabic digit","Arabic word","English word"]
   COL  colors:          ["#hex","Arabic","English"]
   SHP  shapes:          [id,"Arabic","English","<svg shape>"]
   ANI  animals:         ["emoji","Arabic","English"]
   OBJ_COL  (level 3 colors):  ["emoji","Arabic name with ال","English", index into COL]
   OBJ_SHP  (level 3 shapes):  [index into SHP, ["emoji objects with that shape"]]
   ANI_Q    (level 3 animals): ["Arabic question","English question","answer emoji",["emojis that are also correct, never used as wrong options"]]
   GROUPS / GROUPS_N: "odd one out" groups and their names
   PAT: emojis used in "what comes next?" patterns
   BASKETS  (basket game): per level, a list of sets: {bins:[["label ar","label en","color or emoji"]], items:[["emoji", binIndex]]}
   P        every spoken prompt, as small functions (also used to pre-generate audio clips)
*/
APPDATA.kg = {
  AR: [['أ','ألف','أرنب','🐇'],['ب','باء','بطة','🦆'],['ت','تاء','تفاحة','🍎'],['ث','ثاء','ثعلب','🦊'],['ج','جيم','جمل','🐪'],['ح','حاء','حصان','🐴'],['خ','خاء','خروف','🐑'],['د','دال','دب','🐻'],['ذ','ذال','ذرة','🌽'],['ر','راء','ريشة','🪶'],['ز','زاي','زرافة','🦒'],['س','سين','سمكة','🐟'],['ش','شين','شمس','☀️'],['ص','صاد','صقر','🦅'],['ض','ضاد','ضفدع','🐸'],['ط','طاء','طائرة','✈️'],['ظ','ظاء','ظرف','✉️'],['ع','عين','عنب','🍇'],['غ','غين','غيمة','☁️'],['ف','فاء','فيل','🐘'],['ق','قاف','قطة','🐈'],['ك','كاف','كرة','⚽'],['ل','لام','ليمون','🍋'],['م','ميم','موز','🍌'],['ن','نون','نحلة','🐝'],['هـ','هاء','هدية','🎁'],['و','واو','وردة','🌹'],['ي','ياء','يد','✋']],

  EN: [['A','Apple','🍎'],['B','Ball','⚽'],['C','Cat','🐈'],['D','Dog','🐕'],['E','Elephant','🐘'],['F','Fish','🐟'],['G','Grapes','🍇'],['H','Hat','🎩'],['I','Ice cream','🍦'],['J','Juice','🧃'],['K','Kite','🪁'],['L','Lion','🦁'],['M','Moon','🌙'],['N','Nest','🪺'],['O','Orange','🍊'],['P','Pig','🐷'],['Q','Queen','👸'],['R','Rabbit','🐇'],['S','Sun','☀️'],['T','Tree','🌳'],['U','Umbrella','☂️'],['V','Van','🚐'],['W','Watermelon','🍉'],['X','Box','📦'],['Y','Yo-yo','🪀'],['Z','Zebra','🦓']],

  NUM: [[1,'١','واحد','one'],[2,'٢','اثنان','two'],[3,'٣','ثلاثة','three'],[4,'٤','أربعة','four'],[5,'٥','خمسة','five'],[6,'٦','ستة','six'],[7,'٧','سبعة','seven'],[8,'٨','ثمانية','eight'],[9,'٩','تسعة','nine'],[10,'١٠','عشرة','ten']],

  COL: [['#ef3b3b','أحمر','red'],['#2f7df6','أزرق','blue'],['#ffd21f','أصفر','yellow'],['#2fbf5b','أخضر','green'],['#ff8a1f','برتقالي','orange'],['#8e4ff0','بنفسجي','purple'],['#ff8fc0','وردي','pink'],['#8a5a35','بني','brown'],['#222','أسود','black'],['#fff','أبيض','white']],

  SHP: [['circle','دائرة','circle','<circle cx="50" cy="50" r="42"/>'],['square','مربع','square','<rect x="10" y="10" width="80" height="80" rx="6"/>'],['triangle','مثلث','triangle','<polygon points="50,8 94,90 6,90"/>'],['rect','مستطيل','rectangle','<rect x="4" y="26" width="92" height="48" rx="6"/>'],['star','نجمة','star','<polygon points="50,5 61,38 96,38 68,59 78,93 50,72 22,93 32,59 4,38 39,38"/>'],['heart','قلب','heart','<path d="M50 90 C10 62 2 40 14 24 C26 8 46 14 50 30 C54 14 74 8 86 24 C98 40 90 62 50 90Z"/>']],

  SHPC: ['#ff7aa8','#4db6ff','#3fcf9a','#ff9442','#ffc23d','#ef3b3b'],

  ANI: [['🐈','قطة','cat'],['🐕','كلب','dog'],['🐄','بقرة','cow'],['🐑','خروف','sheep'],['🐪','جمل','camel'],['🐴','حصان','horse'],['🦁','أسد','lion'],['🐘','فيل','elephant'],['🦒','زرافة','giraffe'],['🐒','قرد','monkey'],['🐟','سمكة','fish'],['🐔','دجاجة','chicken'],['🦆','بطة','duck'],['🐇','أرنب','rabbit'],['🐻','دب','bear'],['🦋','فراشة','butterfly']],

  COUNT_EM: ['🍎','⭐','🐟','🎈','🌸','🐥','🍓','🚗'],

  OBJ_COL: [['🍌','الموزة','banana',2],['🍓','الفراولة','strawberry',0],['🥒','الخيارة','cucumber',3],['🍊','البرتقالة','orange',4],['🍆','الباذنجانة','eggplant',5],['🐸','الضفدع','frog',3],['🍇','العنب','grapes',5],['🐻','الدب','bear',7],['🍫','الشوكولاتة','chocolate',7],['🥛','الحليب','milk',9],['☁️','الغيمة','cloud',9],['🌹','الوردة','rose',0],['🍋','الليمونة','lemon',2],['🐷','الخنزير الصغير','piglet',6],['🌳','الشجرة','tree',3],['🫐','التوت الأزرق','blueberries',1],['🐈‍⬛','القطة السوداء','black cat',8],['🎱','الكرة','ball',8]],

  OBJ_SHP: [[0,['⚽','🍩','🕐','🍪','🌕']],[1,['🎲','🔲','🖼️']],[2,['⛺','🍕','🔺','📐']],[3,['📱','🚪','📺','💵','📏']],[4,['⭐','🌟','✴️']],[5,['❤️','💖','💚']]],

  ANI_Q: [
 ['من يعطينا الحليب؟','Who gives us milk?','🐄',['🐄','🐑','🐪','🐴']],
 ['من يعطينا البيض؟','Who gives us eggs?','🐔',['🐔','🦆','🐟','🦋']],
 ['من يستطيع أن يطير؟','Who can fly?','🦋',['🦋','🦆','🐔']],
 ['من يعيش في الماء؟','Who lives in the water?','🐟',['🐟','🦆']],
 ['أي حيوان هو الأكبر؟','Which animal is the biggest?','🐘',['🐘','🦒','🐪','🐴','🐄','🦁','🐻']],
 ['من له رقبة طويلة جدًا؟','Who has a very long neck?','🦒',['🦒','🐪','🐴']],
 ['من يحب أكل الموز؟','Who loves bananas?','🐒',['🐒','🐘']],
 ['من يقول: مياو؟','Who says meow?','🐈',['🐈']],
 ['من يقول: هاو هاو؟','Who says woof woof?','🐕',['🐕']],
 ['من يقول: كاك كاك؟','Who says quack quack?','🦆',['🦆','🐔']],
 ['من هو ملك الغابة؟','Who is the king of the jungle?','🦁',['🦁']],
 ['من له أذنان طويلتان ويحب الجزر؟','Who has long ears and loves carrots?','🐇',['🐇','🐴']],
 ['من يعيش في الصحراء ويحمل الماء في سنامه؟','Who lives in the desert and has a hump?','🐪',['🐪']],
 ['من يصنع العسل؟','Who makes honey?','🐝',['🐝']]
],

  GROUPS: [['🍎','🍌','🍇','🍊','🍓','🍉','🍋','🍒'],['🐈','🐕','🐄','🐑','🦁','🐘','🐒','🐴'],['🚗','🚌','✈️','🚲','🚂','🚀','🚁','🚜'],['👕','👖','👗','🧢','👟','🧦','🧤'],['⚽','🏀','🎾','🏐','🏈']],

  GROUPS_N: [['فواكه','fruits'],['حيوانات','animals'],['مركبات','vehicles'],['ملابس','clothes'],['كرات','balls']],

  PAT: ['🔴','🔵','🟡','🟢','🟣','🍎','🍌','⭐','🌙','🐱','🐶','🌸','🚗'],

  SHP_AR_DEF: {'دائرة':'الدائرة','مربع':'المربع','مثلث':'المثلث','مستطيل':'المستطيل','نجمة':'النجمة','قلب':'القلب'},

  BASKETS: {
    1: [ { bins: [['أحمر', 'red', '#ef3b3b'], ['أصفر', 'yellow', '#ffd21f']], items: [['🍎', 0], ['🍓', 0], ['🍒', 0], ['🌹', 0], ['🍌', 1], ['🍋', 1], ['🌽', 1], ['🐥', 1]] } ],
    2: [ { bins: [['أحمر', 'red', '#ef3b3b'], ['أصفر', 'yellow', '#ffd21f'], ['أخضر', 'green', '#2fbf5b']], items: [['🍎', 0], ['🍓', 0], ['🍒', 0], ['🍌', 1], ['🍋', 1], ['🐥', 1], ['🥒', 2], ['🥦', 2], ['🐸', 2]] },
         { bins: [['فواكه', 'fruits', '🍎'], ['حيوانات', 'animals', '🐾']], items: [['🍌', 0], ['🍇', 0], ['🍉', 0], ['🍊', 0], ['🐈', 1], ['🐄', 1], ['🦁', 1], ['🐘', 1]] } ],
    3: [ { bins: [['في السماء', 'in the sky', '☁️'], ['على الأرض', 'on land', '🌳'], ['في البحر', 'in the sea', '🌊']], items: [['🐦', 0], ['🦋', 0], ['🐝', 0], ['🦅', 0], ['🐄', 1], ['🐪', 1], ['🦁', 1], ['🐟', 2], ['🐬', 2], ['🐙', 2], ['🦀', 2]] },
         { bins: [['فواكه', 'fruits', '🍎'], ['حيوانات', 'animals', '🐾'], ['مركبات', 'vehicles', '🚗']], items: [['🍌', 0], ['🍇', 0], ['🍓', 0], ['🐈', 1], ['🐘', 1], ['🐒', 1], ['🚌', 2], ['✈️', 2], ['🚲', 2], ['🚂', 2]] } ]
  }
};

/* ---------- every spoken prompt (one place) ---------- */
(function (K) {
  const N = K.NUM;
  K.P = {
    letter: { ar: a => 'أين حرف ' + a[1] + '؟', en: a => 'Where is the letter ' + a[0] + '?' },
    first: { ar: a => a[2] + '. بأي حرف تبدأ؟', en: a => a[1] + '. Which letter does it start with?' },
    count: { ar: () => 'كم عددها؟', en: () => 'How many?' },
    add: { ar: (a, b) => N[a - 1][2] + ' زائد ' + N[b - 1][2] + '، كم يساوي؟', en: (a, b) => a + ' plus ' + b + '. How many?' },
    color: { ar: c => 'أين اللون ' + c[1] + '؟', en: c => 'Where is ' + c[2] + '?' },
    objColor: { ar: o => 'ما لون ' + o[1] + '؟', en: o => 'What color is the ' + o[2] + '?' },
    shape: { ar: s => 'أين ' + K.SHP_AR_DEF[s[1]] + '؟', en: s => 'Where is the ' + s[2] + '?' },
    objShape: { ar: s => 'أي واحد شكله ' + s[1] + '؟', en: s => 'Which one is a ' + s[2] + '?' },
    animal: { ar: a => 'أين ال' + a[1] + '؟', en: a => 'Where is the ' + a[2] + '?' },
    odd: { ar: () => 'أيّهم مختلف؟', en: () => 'Which one is different?' },
    oddWhy: { ar: g => 'لأن البقية ' + g[0], en: g => 'The others are ' + g[1] },
    pattern: { ar: () => 'ماذا يأتي بعد ذلك؟', en: () => 'What comes next?' },
    memory: { ar: () => 'اقلبي بطاقتين وابحثي عن الأزواج', en: () => 'Flip two cards and find the pairs' },
    basket: { ar: () => 'لنضع كل شيء في سلّته', en: () => 'Put each one in the right basket' }
  };
  /** every string the app can say, as [text, lang] (for tools/speech_list.js) */
  K.speakables = function () {
    const out = [], add = (t, l) => out.push([t, l]), P = K.P;
    K.AR.forEach(a => { add(a[1], 'ar'); add(a[2], 'ar'); add(P.letter.ar(a), 'ar'); add(P.first.ar(a), 'ar'); });
    K.EN.forEach(a => { add(a[0], 'en'); add(a[0] + ' is for ' + a[1], 'en'); add(a[1], 'en'); add(P.letter.en(a), 'en'); if (a[0] !== 'X') add(P.first.en(a), 'en'); });
    add('box ends with X', 'en');
    N.forEach(n => { add(n[2], 'ar'); add(n[3], 'en'); });
    for (let a = 1; a <= 5; a++) for (let b = 1; b <= 4 && a + b <= 9; b++) { add(P.add.ar(a, b), 'ar'); add(P.add.en(a, b), 'en'); }
    K.COL.forEach(c => { add(c[1], 'ar'); add(c[2], 'en'); add(P.color.ar(c), 'ar'); add(P.color.en(c), 'en'); });
    K.OBJ_COL.forEach(o => { add(P.objColor.ar(o), 'ar'); add(P.objColor.en(o), 'en'); });
    K.SHP.forEach(s => { add(s[1], 'ar'); add(s[2], 'en'); add(P.shape.ar(s), 'ar'); add(P.shape.en(s), 'en'); add(P.objShape.ar(s), 'ar'); add(P.objShape.en(s), 'en'); });
    K.ANI.forEach(a => { add(a[1], 'ar'); add(a[2], 'en'); add(P.animal.ar(a), 'ar'); add(P.animal.en(a), 'en'); });
    K.ANI_Q.forEach(q => { add(q[0], 'ar'); add(q[1], 'en'); });
    K.GROUPS_N.forEach(g => { add(P.oddWhy.ar(g), 'ar'); add(P.oddWhy.en(g), 'en'); });
    Object.values(K.BASKETS).forEach(sets => sets.forEach(s => s.bins.forEach(b => { add(b[0], 'ar'); add(b[1], 'en'); })));
    ['count', 'odd', 'pattern', 'memory', 'basket'].forEach(k => { add(P[k].ar(), 'ar'); add(P[k].en(), 'en'); });
    return out;
  };
})(APPDATA.kg);

/* ============================================================
   THINKING GAMES (نفكّر): content for the 5 games in thinking.js
   ============================================================ */
(function (K) {
  /* Jigsaw scenes: drawn on a canvas, then cut into pieces. items: [emoji, x, y, size] on a 600×600 picture */
  K.SCENES = [
    { bg: ['#bde0fe', '#ffd6a5'], items: [['🦁', 300, 340, 280], ['☀️', 95, 95, 130], ['🌳', 510, 430, 170], ['🌼', 110, 520, 90]] },
    { bg: ['#caffbf', '#9bf6ff'], items: [['🐘', 300, 330, 300], ['☁️', 470, 100, 140], ['🌴', 95, 420, 170], ['🦋', 500, 520, 90]] },
    { bg: ['#ffc6ff', '#fdffb6'], items: [['🦄', 300, 330, 300], ['🌈', 300, 90, 170], ['⭐', 520, 520, 90], ['🌸', 85, 520, 90]] },
    { bg: ['#a0c4ff', '#caffbf'], items: [['🐢', 300, 360, 280], ['🌊', 110, 110, 140], ['🐟', 500, 120, 110], ['🐚', 510, 530, 90]] },
    { bg: ['#ffadad', '#ffd6a5'], items: [['🚀', 300, 320, 300], ['🌙', 520, 90, 130], ['⭐', 90, 110, 90], ['🪐', 100, 500, 130]] },
    { bg: ['#fdffb6', '#caffbf'], items: [['🐪', 300, 330, 290], ['☀️', 510, 90, 130], ['🌵', 95, 450, 150], ['🌴', 520, 470, 140]] }
  ];

  /* Shape-building designs on a 100×100 board (pieces never overlap).
     t: rect | circle | triU triD triL triR (isosceles, tip direction) | rtBR rtBL (right angle bottom-right / bottom-left) */
  K.DESIGNS = [
    { ar: 'بيت', en: 'house', lv: 1, p: [['triU', 20, 12, 60, 30, '#ef476f'], ['rect', 25, 42, 50, 30, '#ffd166'], ['rect', 25, 72, 50, 14, '#06d6a0']] },
    { ar: 'شجرة', en: 'tree', lv: 1, p: [['triU', 25, 8, 50, 30, '#06d6a0'], ['triU', 18, 36, 64, 30, '#2a9d8f'], ['rect', 42, 66, 16, 26, '#8a5a35']] },
    { ar: 'سمكة', en: 'fish', lv: 1, p: [['circle', 38, 28, 44, 44, '#f4a261'], ['triR', 12, 32, 26, 36, '#e76f51'], ['triU', 50, 14, 20, 14, '#e9c46a']] },
    { ar: 'سيارة', en: 'car', lv: 2, p: [['rect', 30, 30, 40, 18, '#4cc9f0'], ['rect', 12, 48, 76, 20, '#ef476f'], ['circle', 18, 66, 20, 20, '#333333'], ['circle', 62, 66, 20, 20, '#333333']] },
    { ar: 'صاروخ', en: 'rocket', lv: 2, p: [['triU', 38, 4, 24, 22, '#ef476f'], ['rect', 38, 26, 24, 40, '#a0c4ff'], ['rtBR', 18, 48, 20, 22, '#ffd166'], ['rtBL', 62, 48, 20, 22, '#ffd166'], ['triD', 40, 66, 20, 20, '#f77f00']] },
    { ar: 'قارب', en: 'boat', lv: 2, p: [['rtBR', 22, 18, 28, 42, '#ffffff'], ['rtBL', 50, 18, 28, 42, '#ffd166'], ['rect', 14, 60, 72, 12, '#8a5a35'], ['triD', 14, 72, 72, 14, '#118ab2']] },
    { ar: 'روبوت', en: 'robot', lv: 3, p: [['rect', 36, 6, 28, 24, '#adb5bd'], ['rect', 30, 32, 40, 34, '#4cc9f0'], ['rect', 14, 34, 14, 26, '#ffd166'], ['rect', 72, 34, 14, 26, '#ffd166'], ['rect', 34, 66, 13, 24, '#6c757d'], ['rect', 53, 66, 13, 24, '#6c757d']] },
    { ar: 'قلعة', en: 'castle', lv: 3, p: [['triU', 12, 10, 22, 18, '#ef476f'], ['triU', 66, 10, 22, 18, '#ef476f'], ['rect', 12, 28, 22, 58, '#ffd166'], ['rect', 66, 28, 22, 58, '#ffd166'], ['rect', 34, 44, 32, 42, '#f4a261'], ['triU', 34, 26, 32, 18, '#06d6a0']] },
    { ar: 'طائر', en: 'bird', lv: 3, p: [['circle', 30, 30, 40, 40, '#4cc9f0'], ['circle', 58, 18, 22, 22, '#4cc9f0'], ['triR', 80, 24, 12, 10, '#f77f00'], ['rtBR', 10, 40, 20, 24, '#118ab2'], ['triD', 40, 70, 20, 16, '#f77f00']] }
  ];

  /* Position words, in the order children learn them (research: in/on/under → beside → front/behind → between).
     Left/right is left out on purpose: it usually comes at 5–7 years. */
  K.WHERE = {
    targets: [['🐱', 'القطة', 'cat'], ['🐶', 'الكلب', 'dog'], ['🐰', 'الأرنب', 'rabbit'], ['⚽', 'الكرة', 'ball']],
    // scene: which reference object and which spots it offers
    scenes: {
      table: { ar: 'الطاولة', en: 'the table', zones: ['on', 'under', 'beside'] },
      basket: { ar: 'السلة', en: 'the basket', zones: ['in', 'beside', 'on'] },
      box: { ar: 'الصندوق', en: 'the box', zones: ['on', 'beside', 'behind', 'front'] },
      boxes: { ar: 'الصندوقين', en: 'the two boxes', zones: ['between', 'on', 'beside'] }
    },
    preps: {
      on: ['على', 'on'], under: ['تحت', 'under'], in: ['في', 'in'], beside: ['بجانب', 'next to'],
      behind: ['خلف', 'behind'], front: ['أمام', 'in front of'], between: ['بين', 'between']
    },
    // per level: [scene, prep] pairs to ask
    levels: {
      1: [['table', 'on'], ['table', 'under'], ['basket', 'in']],
      2: [['table', 'on'], ['table', 'under'], ['basket', 'in'], ['table', 'beside'], ['basket', 'beside'], ['box', 'beside']],
      3: [['box', 'behind'], ['box', 'front'], ['box', 'on'], ['box', 'beside'], ['table', 'under']],
      4: [['boxes', 'between'], ['box', 'behind'], ['box', 'front'], ['table', 'under'], ['basket', 'in'], ['boxes', 'beside']],
      5: 'pick'   // look at 3 pictures: "where is the cat under the table?"
    }
  };

  /* Picture stories: steps in the correct order: [emoji, Arabic, English] */
  K.STORIES = [
    { n: 3, steps: [['☁️', 'غيوم في السماء', 'clouds in the sky'], ['🌧️', 'ينزل المطر', 'it rains'], ['🌈', 'يظهر قوس قزح', 'a rainbow appears']] },
    { n: 3, steps: [['🍦', 'آيس كريم بارد', 'a cold ice cream'], ['☀️', 'الشمس حارة', 'the sun is hot'], ['💧', 'ذاب الآيس كريم', 'the ice cream melted']] },
    { n: 3, steps: [['🪥', 'تفرّش أسنانها', 'she brushes her teeth'], ['📖', 'تسمع قصة', 'she hears a story'], ['😴', 'تنام', 'she sleeps']] },
    { n: 3, steps: [['🥚', 'بيضة', 'an egg'], ['🐣', 'تفقس البيضة', 'the egg hatches'], ['🐥', 'كتكوت صغير', 'a little chick']] },
    { n: 3, steps: [['🎁', 'هدية', 'a present'], ['📦', 'تفتح الهدية', 'she opens it'], ['🧸', 'دبدوب جميل', 'a lovely teddy']] },
    { n: 4, steps: [['🌰', 'بذرة', 'a seed'], ['💧', 'نسقيها بالماء', 'we water it'], ['🌱', 'تنبت', 'it sprouts'], ['🌻', 'تصبح زهرة', 'it becomes a flower']] },
    { n: 4, steps: [['😴', 'نائمة', 'asleep'], ['🪥', 'تفرّش أسنانها', 'she brushes her teeth'], ['🍳', 'تأكل الفطور', 'she eats breakfast'], ['🎒', 'تذهب إلى الروضة', 'she goes to school']] },
    { n: 4, steps: [['🥚', 'بيض وطحين', 'eggs and flour'], ['🥣', 'نخلطها', 'we mix them'], ['🔥', 'نخبزها', 'we bake it'], ['🎂', 'كعكة لذيذة', 'a yummy cake']] },
    { n: 4, steps: [['🌸', 'زهرة على الشجرة', 'a flower on the tree'], ['🍏', 'تفاحة صغيرة', 'a small apple'], ['🍎', 'تفاحة ناضجة', 'a ripe apple'], ['😋', 'نأكلها', 'we eat it']] },
    { n: 4, steps: [['🌅', 'الصباح', 'morning'], ['☀️', 'الظهر', 'noon'], ['🌇', 'المساء', 'evening'], ['🌙', 'الليل', 'night']] },
    { n: 5, steps: [['🏖️', 'نذهب إلى الشاطئ', 'we go to the beach'], ['🪣', 'نملأ الدلو رملًا', 'we fill a bucket with sand'], ['🏰', 'نبني قلعة', 'we build a castle'], ['🌊', 'تأتي موجة', 'a wave comes'], ['😮', 'ذهبت القلعة', 'the castle is gone']] },
    { n: 5, steps: [['🌰', 'بذرة', 'a seed'], ['🕳️', 'نزرعها في التراب', 'we plant it'], ['💧', 'نسقيها', 'we water it'], ['🌱', 'تنبت', 'it sprouts'], ['🌻', 'زهرة كبيرة', 'a big flower']] },
    { n: 5, steps: [['🥚', 'بيضة', 'an egg'], ['🐣', 'تفقس', 'it hatches'], ['🐥', 'كتكوت', 'a chick'], ['🐔', 'يكبر ويصبح دجاجة', 'it grows into a hen'], ['🥚', 'الدجاجة تبيض', 'the hen lays an egg']] },
    { n: 5, steps: [['🌅', 'نصحو', 'we wake up'], ['🍳', 'نفطر', 'we eat breakfast'], ['🏫', 'نذهب إلى الروضة', 'we go to school'], ['🛝', 'نلعب', 'we play'], ['🌙', 'ننام', 'we sleep']] }
  ];

  const P = K.P, W = K.WHERE;
  Object.assign(P, {
    puzzle: { ar: () => 'هيا نركّب الصورة', en: () => 'Put the picture together' },
    compose: { ar: d => 'لنركّب ' + d.ar + ' من الأشكال', en: d => 'Build a ' + d.en + ' with the shapes' },
    where: { ar: (t, s, p) => 'لنضع ' + t[1] + ' ' + W.preps[p][0] + ' ' + W.scenes[s].ar, en: (t, s, p) => 'Put the ' + t[2] + ' ' + W.preps[p][1] + ' ' + W.scenes[s].en },
    wherePick: { ar: (t, s, p) => 'أين ' + t[1] + ' ' + W.preps[p][0] + ' ' + W.scenes[s].ar + '؟', en: (t, s, p) => 'Where is the ' + t[2] + ' ' + W.preps[p][1] + ' ' + W.scenes[s].en + '?' },
    robot: { ar: () => 'لنخطّط طريق الروبوت إلى التفاحة', en: () => 'Help the robot get to the apple' },
    robotStar: { ar: () => 'خذي النجمة أولًا، ثم اذهبي إلى التفاحة', en: () => 'Get the star first, then go to the apple' },
    robotStars: { ar: () => 'خذي كل النجوم، ثم اذهبي إلى التفاحة', en: () => 'Get all the stars, then go to the apple' },
    robotLimit: { ar: n => 'عندك ' + n + (n <= 10 ? ' أسهم' : ' سهمًا') + ' فقط. لنجد أقصر طريق', en: n => 'You have only ' + n + ' arrows. Find the shortest way' },
    robotMissed: { ar: () => 'وصلتِ! لكن نسيتِ نجمة', en: () => 'You got there, but you missed a star' },
    notMine: { ar: () => 'هذه القطعة ليست من هذه الصورة', en: () => 'This piece is not from this picture' },
    robotRun: { ar: () => 'الآن نضغط زر التشغيل', en: () => 'Press play' },
    robotBump: { ar: () => 'أوه! اصطدم الروبوت. لنجرّب طريقًا آخر', en: () => 'Oops! The robot bumped. Try another way' },
    robotShort: { ar: () => 'لم يصل بعد. أضيفي أسهمًا', en: () => 'Not there yet. Add more arrows' },
    story: { ar: () => 'لنرتّب القصة: ماذا حدث أولًا؟', en: () => 'Put the story in order: what happened first?' },
    storyNext: { ar: () => 'ماذا يحدث بعد ذلك؟', en: () => 'What happens next?' },
    up: { ar: () => 'لنجرّب في الأعلى', en: () => 'Try near the top' },
    mid: { ar: () => 'لنجرّب في الوسط', en: () => 'Try in the middle' },
    down: { ar: () => 'لنجرّب في الأسفل', en: () => 'Try near the bottom' },
    brk: { ar: () => 'عمل رائع اليوم! حان وقت الاستراحة. لنلعب بعيدًا عن الشاشة', en: () => 'Great work today! Time for a break away from the screen' }
  });
  const base = K.speakables;
  K.speakables = function () {
    const out = base(), add = (t, l) => out.push([t, l]);
    ['puzzle', 'robot', 'robotStar', 'robotStars', 'robotMissed', 'notMine', 'robotRun', 'robotBump', 'robotShort', 'story', 'storyNext', 'up', 'mid', 'down', 'brk'].forEach(k => { add(P[k].ar(), 'ar'); add(P[k].en(), 'en'); });
    for (let n = 9; n <= 14; n++) { add(P.robotLimit.ar(n), 'ar'); add(P.robotLimit.en(n), 'en'); }
    K.DESIGNS.forEach(d => { add(P.compose.ar(d), 'ar'); add(P.compose.en(d), 'en'); });
    W.targets.forEach(t => Object.keys(W.scenes).forEach(s => W.scenes[s].zones.forEach(p => {
      add(P.where.ar(t, s, p), 'ar'); add(P.where.en(t, s, p), 'en'); add(P.wherePick.ar(t, s, p), 'ar'); add(P.wherePick.en(t, s, p), 'en');
    })));
    K.STORIES.forEach(s => s.steps.forEach(st => { add(st[1], 'ar'); add(st[2], 'en'); }));
    return out;
  };
})(APPDATA.kg);
