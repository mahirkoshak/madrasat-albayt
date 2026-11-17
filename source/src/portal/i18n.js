/* ============================================================
   ENGLISH INTERFACE (HS.lang() === 'en')
   The menu pages are written in Arabic. In English mode, after a menu page, the top bar, a toast or a
   pop-up is drawn, its Arabic phrases are swapped for the English ones below and Arabic digits become 0–9.
   Only these places are translated: lessons, dictionary meanings and children's names are never touched.
   To translate a new phrase: add ['Arabic', 'English'] to EN. Anything missing simply stays in Arabic.
   Longer phrases are matched first; phrases of one short word only match as a whole word.
   ============================================================ */
(function () {
  const EN = [
    // brand, navigation, home
    ['مدرسة البيت', 'Home School'], ['مكانك في الموقع', 'Where you are'], ['الرئيسية', 'Home'], ['رجوع', 'Back'],
    ['أهلًا بك في مدرسة البيت', 'Welcome to Home School'], ['أهلًا يا', 'Hi'], ['أهلًا! أنا كوكو', 'Hi! I’m Koko'],
    ['من سيتعلّم معي؟ أضف كل طفل ليُحفظ تقدّمه ونجومه وأخطاؤه وحده.', 'Who will learn with me? Add each child so their progress, stars and mistakes are saved separately.'],
    ['المتابعة بدون إضافة', 'Continue without adding'], ['تعلّم متواصل:', 'Learning streak:'], ['هيا نتعلّم شيئًا جديدًا اليوم.', 'Let’s learn something new today.'],
    ['أكمل من حيث توقفت', 'Continue where you stopped'], ['مراجعة اليوم', 'Today’s review'], ['أسئلة أخطأت فيها أو حان وقت تذكّرها:', 'Questions you missed or that are due again:'],
    ['لا توجد مراجعة اليوم', 'Nothing to review today'], ['كل ما تعلّمته في موعده. جرّب درسًا جديدًا أو اختبارًا.', 'Everything you learned is on track. Try a new lesson or a test.'],
    ['ماذا نتعلّم اليوم؟', 'What shall we learn today?'], ['صفحة الأب: التقدّم والإعدادات', 'Parent page: progress and settings'], ['كوبون ينتظر', 'coupon waiting'],
    ['التقدّم والنجوم محفوظة على هذا الجهاز وأونلاين', 'Progress and stars are saved on this device and online'], ['التقدّم والنجوم تُحفظ على هذا الجهاز', 'Progress and stars are saved on this device'],
    ['للصوت افتح الصفحة في Chrome أو Edge أو Safari', 'For sound, open the page in Chrome, Edge or Safari'],
    ['اختر المادة', 'Choose a subject'], ['اختر الوحدة', 'Choose a unit'], ['قريبًا', 'Soon'],
    ['من يتعلّم الآن؟', 'Who is learning now?'], ['طفل جديد', 'New child'], ['أضف طفلًا', 'Add a child'], ['اسم الطفل', 'Child’s name'], ['مثال: محمد', 'e.g. Sam'],
    ['اختر صورته', 'Pick a picture'], ['صورة الطفل', 'Child’s picture'], ['كلماتي في القاموس', 'My dictionary words'], ['محفوظ أونلاين', 'Saved online'], ['بدون إنترنت', 'Offline'],
    // catalog
    ['الروضة', 'Kindergarten'], ['KG2 · عمر ٤–٥ سنوات', 'KG2 · ages 4–5'], ['عربي و English', 'Arabic & English'], ['قصص وأناشيد', 'Stories & songs'],
    ['الحروف، الأرقام، الألوان، الأشكال، الحيوانات + ٨ ألعاب بالصوت', 'Letters, numbers, colours, shapes, animals + 8 voice games'],
    ['الصف الثالث', 'Grade 3'], ['الصف الرابع', 'Grade 4'], ['ابتدائي · المنهج السعودي', 'Primary · Saudi curriculum'], ['العلوم', 'Science'], ['الرياضيات', 'Math'], ['لغتي', 'Arabic (Lughati)'],
    ['مراجعة الوحدات بالملخصات والألعاب والاختبارات', 'Unit review with summaries, games and tests'],
    ['الوحدة ١: المخلوقات الحية', 'Unit 1: Living things'], ['الوحدة ٢: النظام البيئي', 'Unit 2: Ecosystems'], ['الوحدة ٣: الأرض ومواردها', 'Unit 3: Earth and its resources'], ['الوحدة ٤: الطقس والمناخ', 'Unit 4: Weather and climate'],
    ['٤ دروس: تغيرات الأرض الفجائية، التجوية والتعرية، التربة، الأحافير والوقود الأحفوري', '4 lessons: sudden changes, weathering and erosion, soil, fossils and fossil fuels'],
    ['الأنظمة البيئية', 'Ecosystems'], ['صحة الإنسان', 'Human health'], ['الخلايا وتصنيف المخلوقات', 'Cells and classifying living things'], ['الحيوانات وأجهزة أجسامها', 'Animals and their body systems'],
    ['٣ دروس · بطاقات · ٦ ألعاب · اختبار نهائي', '3 lessons · cards · 6 games · final test'], ['٤ دروس · بطاقات · ٦ ألعاب · اختبار نهائي', '4 lessons · cards · 6 games · final test'],
    ['قاموسي', 'My Dictionary'], ['إنجليزي وعربي · أكثر من ١١٠٠ كلمة', 'English and Arabic · over 1100 words'],
    // shop
    ['متجر النجوم: عندك', 'Star shop: you have'], ['متجر النجوم', 'Star shop'], ['المتجر', 'Shop'], ['اشترِ مكافأة بنجومك', 'Buy a reward with your stars'], ['عندك كوبون', 'you have a coupon'],
    ['كوبوناتك: اعرضها على بابا أو ماما', 'Your coupons: show them to Mum or Dad'], ['اشتريتها', 'Bought'], ['ينتظر', 'Waiting'], ['هدفك', 'Your goal'], ['تقدر تشتريه الآن!', 'You can buy it now!'],
    ['إلغاء الهدف', 'Remove goal'], ['اختر مكافأة واضغط «🎯 هدفي» لتجمع لها النجوم.', 'Pick a reward and tap “🎯 My goal” to save stars for it.'], ['هدفي', 'My goal'],
    ['لا توجد مكافآت بعد. اطلبها من بابا أو ماما.', 'No rewards yet. Ask Mum or Dad.'], ['مثال: رحلة إلى البحر', 'e.g. a trip to the beach'], ['فكرتك', 'Your idea'], ['عندي فكرة مكافأة', 'I have a reward idea'],
    ['آخر المكافآت', 'Latest rewards'], ['استلمتها', 'received'], ['رجعت النجوم', 'stars returned'], ['صار هدفك', 'is your goal now'], ['وصلت فكرتك لبابا وماما', 'Your idea went to Mum and Dad'],
    ['متأكد؟ اضغط مرة ثانية ✅', 'Sure? Tap again ✅'], ['متأكد؟ اضغط مرة ثانية', 'Sure? Tap again'], ['اشترِ', 'Buy'], ['خلصت هذا الأسبوع', 'used up this week'], ['باقي ⭐', 'still need ⭐'],
    ['في الأسبوع', 'a week'], ['مبروك! اعرض الكوبون على بابا أو ماما', 'Congratulations! Show the coupon to Mum or Dad'],
    ['مفاجأة!', 'Surprise!'], ['مفاجأة', 'Surprise'], ['شكرًا! 💛', 'Thank you! 💛'],
    ['قصة إضافية قبل النوم', 'Extra bedtime story'], ['لعبة مع بابا أو ماما ١٥ دقيقة', '15 minutes of a game with Mum or Dad'], ['تختار عشاء العائلة', 'Choose the family dinner'],
    ['١٥ دقيقة آيباد', '15 minutes of iPad'], ['آيس كريم', 'Ice cream'], ['٣٠ دقيقة بلايستيشن', '30 minutes of PlayStation'], ['فيلم مع العائلة', 'Family movie'], ['طلعة للحديقة', 'Trip to the park'],
    ['لعبة صغيرة جديدة', 'A small new toy'], ['مكافأة جديدة', 'New reward'],
    // parent page
    ['صفحة الأب', 'Parent page'], ['الرقم السري', 'PIN'], ['دخول', 'Enter'], ['رقم غير صحيح', 'Wrong PIN'], ['ضيف', 'Guest'],
    ['تقدّم كل طفل، وما يحتاج مراجعة، والإعدادات.', 'Each child’s progress, what needs review, and settings.'], ['للصرف (جمع', 'to spend (earned'], ['في اليوم · 🔥 متواصل:', 'a day · 🔥 streak:'],
    ['تعلّم في', 'learned on'], ['آخر مرة', 'last time'], ['اشتراها', 'bought'], ['أعطيته', 'Given'], ['إرجاع النجوم', 'Return the stars'], ['يجمع لـ', 'saving for'], ['لم يختر هدفًا بعد', 'no goal yet'],
    ['أعطه نجومًا مفاجأة', 'Give surprise stars'], ['عدد النجوم', 'Number of stars'], ['رسالة قصيرة، مثال: فخور فيك لأنك ساعدت أختك', 'A short note, e.g. proud of you for helping your sister'], ['رسالة', 'Note'],
    ['المفاجآت التي لا يتوقعها الطفل لا تُضعف حبّه للتعلّم، بعكس المكافأة الموعودة. استعملها لمدح جهد محدد.', 'Rewards a child doesn’t expect don’t weaken their love of learning, unlike promised ones. Use them to praise a specific effort.'],
    ['لا يوجد نشاط بعد.', 'No activity yet.'], ['إتقان الوحدة', 'Unit mastery'], ['أجاب عن', 'Answered'], ['أفضل نتيجة في الاختبار الشامل', 'best final test'], ['تحدّي السرعة', 'speed challenge'],
    ['أكثر ما يخطئ فيه', 'Most missed'], ['أخطأ', 'wrong'], ['أصاب', 'right'], ['تحدّي الإملاء: أتقن', 'Spelling challenge: mastered'], ['كلمة إنجليزية', 'English words'], ['عربية', 'Arabic'], ['أطول سلسلة', 'longest streak'],
    ['«تعلّم» = كتبها صحيحة من ذاكرته في أكثر من مراجعة متباعدة.', '“Learned” = written correctly from memory in several spaced reviews.'], ['عربي و English (الروضة)', 'Arabic & English (Kindergarten)'],
    ['اللعبة', 'Game'], ['المستوى', 'Level'], ['صح من أول مرة', 'Right first time'], ['تعديل الاسم', 'Rename'], ['اضغط مرة ثانية لمسح التقدّم', 'Tap again to clear progress'], ['مسح التقدّم', 'Clear progress'],
    ['اضغط مرة ثانية للحذف', 'Tap again to delete'], ['حذف الطفل', 'Delete child'], ['الإعدادات', 'Settings'], ['مؤثرات صوتية عند الإجابة', 'Sound effects on answers'], ['إظهار المتجر للأطفال', 'Show the shop to the children'],
    ['كيف تجعل المتجر ينجح؟ (من الأبحاث)', 'How to make the shop work (from research)'], ['أسعار صغيرة ومتوسطة وكبيرة:', 'Small, medium and large prices:'],
    ['أول مكافأة يجب أن يصل لها خلال يوم أو يومين، وإلا يفقد الحماس. تحت كل مكافأة تجد كم يومًا يحتاج كل طفل.', 'The first reward should be reachable in a day or two, or the excitement fades. Under each reward you see how many days each child needs.'],
    ['أعطِ الكوبون بسرعة:', 'Give coupons quickly:'], ['كلما تأخرت المكافأة بعد الشراء ضعف أثرها. عدد الكوبونات المنتظرة يظهر على زر صفحة الأب.', 'The longer a reward waits after buying, the weaker it works. Waiting coupons show on the parent page button.'],
    ['قلّل مكافآت الشاشة:', 'Limit screen rewards:'], ['دراسة من جامعة Guelph وجدت أن الأطفال الذين تُستعمل الشاشة كمكافأة لهم يقضون وقتًا أطول أمامها. لذلك عليها حد أسبوعي، والأفضل الوقت معكم والتجارب.', 'A University of Guelph study found children given screen time as a reward spend more time on screens. So these have a weekly limit; time together and experiences work better.'],
    ['لا تأخذ النجوم عقابًا:', 'Never take stars away:'], ['النجوم تُكسب ولا تُسحب.', 'Stars are earned, never removed.'], ['المدح أولًا:', 'Praise first:'],
    ['امدح الجهد بكلام محدد، واستعمل «🎁 المفاجأة» أحيانًا بدل الوعود.', 'Praise effort with specific words, and sometimes use “🎁 surprise” instead of promises.'], ['دعهم يقترحون:', 'Let them suggest:'],
    ['اقتراحاتهم تظهر هنا، والطفل يعمل أكثر لمكافأة اختارها.', 'Their ideas appear here, and children work harder for a reward they chose.'],
    ['في الخانة الأولى رمز تعبيري (إيموجي). «لمن» يجعل المكافأة لطفل واحد، لأن الروضة والصف الرابع يجمعون بسرعات مختلفة. «حد أسبوعي» = أكثر عدد يشتريه في ٧ أيام (فارغ = بلا حد).', 'The first box is an emoji. “For” makes a reward for one child, since kindergarten and grade 4 earn at different speeds. “Weekly limit” = the most they can buy in 7 days (empty = no limit).'],
    ['أفكار من الأطفال', 'Ideas from the children'], ['للمتجر', 'to the shop'], ['الرمز', 'Emoji'], ['المكافأة', 'Reward'], ['السعر', 'Price'], ['لمن', 'For'], ['الكل', 'Everyone'], ['حد أسبوعي', 'Weekly limit'],
    ['حفظ المكافآت', 'Save rewards'], ['رقم سري لصفحة الأب', 'PIN for the parent page'], ['حتى لا يغيّر الأطفال الأسعار أو يوافقون على كوبوناتهم بأنفسهم. اتركه فارغًا لإلغائه.', 'So children can’t change prices or approve their own coupons. Leave empty to turn it off.'],
    ['مثال: 2580', 'e.g. 2580'], ['حفظ الرقم', 'Save PIN'], ['وقت الروضة', 'Kindergarten time'],
    ['بعد هذه المدة من اللعب في اليوم تظهر شاشة «وقت الاستراحة». منظمة الصحة العالمية تنصح بساعة شاشة كحد أقصى يوميًا لعمر ٢–٤ سنوات، والأقل أفضل.', 'After this much play in a day, a “break time” screen appears. The WHO advises at most one hour of screen time a day for ages 2–4, and less is better.'],
    ['١٠ دقائق', '10 minutes'], ['١٥ دقيقة', '15 minutes'], ['٢٠ دقيقة', '20 minutes'], ['٣٠ دقيقة', '30 minutes'], ['بدون حد', 'No limit'],
    ['العب معها: أسئلة قصيرة لألعاب «نفكّر»', 'Play along: short questions for the “Think” games'], ['الصوت العربي', 'Arabic voice'], ['في الموقع', 'The site has'],
    ['صوتية مسجّلة بصوت ذكاء اصطناعي، تُستخدم قبل صوت الجهاز.', 'recorded AI voice clips, used before the device voice.'], ['مقطعًا', 'clips'], ['مقاطع', 'clips'],
    ['الأصوات العربية في هذا الجهاز (⭐ = صوت حديث وطبيعي):', 'Arabic voices on this device (⭐ = modern, natural voice):'],
    ['لا يوجد صوت عربي في هذا الجهاز/المتصفح، لذلك العربية بلا صوت إلا في المقاطع المسجّلة.', 'This device/browser has no Arabic voice, so Arabic is silent except for the recorded clips.'],
    ['جرّب العربي', 'Test Arabic'], ['كيف أحصل على صوت عربي أوضح؟', 'How do I get a clearer Arabic voice?'],
    ['الحفظ أونلاين بين الأجهزة', 'Save online across devices'], ['الحالة:', 'Status:'], ['آخر مزامنة', 'last sync'], ['كود العائلة:', 'Family code:'], ['كود العائلة', 'Family code'],
    ['انسخ رابط الانضمام', 'Copy join link'], ['زامن الآن', 'Sync now'], ['إيقاف المزامنة على هذا الجهاز', 'Stop syncing on this device'], ['احتفظ بالكود سرًا: من يعرفه يرى تقدّم أطفالك.', 'Keep the code secret: anyone who has it can see your children’s progress.'],
    ['ابدأ: أنشئ كود عائلة', 'Start: create a family code'], ['انضم بكود العائلة', 'Join with a family code'], ['غير مفعّلة', 'off'], ['جاري الاتصال…', 'connecting…'], ['متزامن', 'synced'],
    ['بدون إنترنت: يحفظ هنا ويرسل لاحقًا', 'offline: saved here, sent later'], ['تعذّر الاتصال، سنحاول مرة أخرى', 'couldn’t connect, will retry'],
    ['احفظ الأطفال والنجوم والتقدّم أونلاين، لتظهر على كل الأجهزة (آيباد، لابتوب…). يعمل بدون إنترنت أيضًا ويرسل التغييرات عند الاتصال.', 'Save children, stars and progress online so they appear on every device (iPad, laptop…). Works offline too and sends changes when connected.'],
    ['على أي جهاز آخر: افتح الموقع ← صفحة الأب ← «انضم بكود العائلة» واكتب الكود، أو افتح رابط الانضمام. الأطفال بنفس الاسم يُدمجون تلقائيًا ولا تضيع النجوم.', 'On any other device: open the site → Parent page → “Join with a family code” and type the code, or open the join link. Children with the same name are merged and no stars are lost.'],
    ['الاسم الجديد', 'New name'], ['أُضيفت. عدّل السعر ثم احفظ', 'Added. Set the price, then save'], ['تم حفظ المكافآت', 'Rewards saved'], ['تم حفظ الرقم السري', 'PIN saved'], ['تم إلغاء الرقم السري', 'PIN removed'],
    ['انضممت للعائلة', 'Joined the family'], ['هذا الجهاز صار متزامنًا مع العائلة', 'This device now syncs with the family'], ['نُسخ الرابط', 'Link copied'], ['جاري المزامنة', 'Syncing'], ['أُوقفت المزامنة على هذا الجهاز', 'Sync stopped on this device'],
    ['الكود ١٢ حرفًا ورقمًا، مثل ABCD-EFGH-JKLM', 'The code is 12 letters and digits, like ABCD-EFGH-JKLM'], ['، ستظهر له كمفاجأة', ', it will appear as a surprise'], ['أُرسلت', 'Sent'],
    ['🎙️ صانع الأصوات', '🎙️ Voice maker'], [': يسجّل كل جمل الموقع بصوت Microsoft الطبيعي (سعودي) مجانًا، بدل صوت الجهاز.', ': records every sentence on the site with a natural Microsoft (Saudi) voice for free, instead of the device voice.'],
    ['تشغيل الصوت', 'Sound on'], ['كتم الصوت', 'Mute'], ['تحدّي الإملاء', 'Spelling challenge'],
    // short words (matched as whole words only)
    ['حفظ', 'Save'], ['إلغاء', 'Cancel'], ['حذف', 'Delete'], ['أرسل 🎁', 'Send 🎁'], ['أرسل', 'Send'], ['تم', 'Done'], ['عندك', 'You have'], ['باقي', 'need'], ['حتى', 'up to'], ['تقريبًا:', 'about:'], ['تقريبًا', 'about'],
    ['من', 'of'], ['نجمة.', 'stars.'], ['نجمة', 'stars'], ['تعلّم', 'Learned'], ['كلمة', 'words'], ['كلمتان', '2 words'], ['كلمات', 'words'], ['كلمة واحدة', '1 word'],
    ['يوم واحد', '1 day'], ['يومان', '2 days'], ['أيام', 'days'], ['يومًا', 'days'], ['سؤال واحد', '1 question'], ['سؤالان', '2 questions'], ['أسئلة', 'questions'], ['سؤالًا', 'questions'],
  ];
  const AR_RE = /[؀-ۿ]/;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const LIST = EN.slice().sort((a, b) => b[0].length - a[0].length).map(([a, e]) => {
    const short = !/\s/.test(a) && a.length <= 6;
    return [short ? new RegExp(`(^|[\\s(«:·،])${esc(a)}(?=$|[\\s)»:·،.!؟?,])`, 'g') : new RegExp(esc(a), 'g'), e, short];
  });
  const DIG = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٪/g, '%').replace(/،/g, ',').replace(/؟/g, '?').replace(/‹/g, '›').replace(/←/g, '→');
  HS.tr = s => {
    if (HS.lang() !== 'en' || !s || !AR_RE.test(s)) return HS.lang() === 'en' && s ? DIG(s) : s;
    for (const [re, e, short] of LIST) s = s.replace(re, short ? (m, p1) => p1 + e : e);
    return DIG(s);
  };
  const KEEP = '.nm,[data-keep]';   // children's names (marked where they are drawn)
  HS.trDom = root => {
    if (HS.lang() !== 'en' || !root) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n => { if (n.parentElement && n.parentElement.closest(KEEP)) return; const t = HS.tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; });
    root.querySelectorAll('[aria-label],[placeholder],[title]').forEach(el => ['aria-label', 'placeholder', 'title'].forEach(a => {
      const v = el.getAttribute(a); if (v && !el.closest(KEEP)) { const t = HS.tr(v); if (t !== v) el.setAttribute(a, t); } }));
  };
  // toasts and the page title follow the language too
  const toast = HS.toast; HS.toast = (h, ms) => toast(HS.tr(h), ms);
  const obs = new MutationObserver(ms => { if (HS.lang() !== 'en') return; obs.disconnect(); ms.forEach(m => HS.trDom(m.target.nodeType === 1 ? m.target : m.target.parentElement)); watch(); });
  const watch = () => ['pView', 'appbar'].forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el, { childList: true, subtree: true, characterData: true }); });
  HS.trWatch = () => { watch(); document.body && new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.matches('.sh-gift')) HS.trDom(n); }))).observe(document.body, { childList: true }); };
})();
