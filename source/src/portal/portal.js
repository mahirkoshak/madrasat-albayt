/* ============================================================
   PORTAL + ROUTER
   Draws the menu from CATALOG, the child picker, and the parent page,
   and switches between the menu and apps.
   URL hash routes:
     #home                main page (child picker + years)
     #y-<year>            subjects of a year
     #s-<year>-<subj>     units of a subject
     #app-<id>            open app <id>   (e.g. the kindergarten app)
     #unit-<id>[-<page>]  open a unit from src/units/ in the unit engine
     #shop                rewards shop for the current child (buy rewards with stars)
     #parent              parent page: progress, profiles, shop, settings (optional PIN)
   Normally you do not need to edit this file.
   ============================================================ */
(function () {
  const P = document.getElementById('pView');
  const BAR = document.getElementById('appbar');
  const esc = HS.esc, ar = HS.toAr;

  /* small interface icons (drawn here: no picture files). RTL: "forward" points left, "back" points right. */
  const svg = d => `<svg class="p-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const I = { fwd: svg('M14.5 6l-6 6 6 6').replace('p-i', 'p-i flip'), back: svg('M9.5 6l6 6-6 6').replace('p-i', 'p-i flip'), home: svg('M4 11.5L12 5l8 6.5M6.5 10v8.5h11V10'),
    on: svg('M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11'), lock: svg('M7.5 11V8a4.5 4.5 0 019 0v3M5.5 11h13v9h-13zM12 14.5v2'), off: svg('M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5') };
  /* sound on/off and language buttons, in the top bar of every page */
  const muteBtn = cls => `<button type="button" class="${cls} p-mute" data-mute aria-pressed="${HS.muted()}" aria-label="${HS.muted() ? 'تشغيل الصوت' : 'كتم الصوت'}">${HS.muted() ? I.off : I.on}</button>`;

  const navOf = o => o.unit ? 'unit-' + o.unit : o.app ? 'app-' + o.app : null;
  // a catalog item's picture: its artwork when it exists (o.art), otherwise its emoji
  const tile = (o, small) => `<span class="p-tile" aria-hidden="true">${HS.art(o.art, { fb: o.em, small, eager: true })}</span>`;
  const card = (o, nav) => o.soon
    ? `<div class="p-card soon">${tile(o, true)}<span class="tx"><b>${o.name}</b></span><span class="tag">قريبًا</span></div>`
    : `<button type="button" class="p-card${HS.hasArt(o.art) ? ' has-art' : ''}" style="--c:${o.color}" data-nav="${nav}">${tile(o)}<span class="tx"><b>${o.name}</b><small>${HS.nav.desc(o)}</small></span><span class="go">${I.fwd}</span></button>`;
  /* ---------- the one header of the site (menu pages and apps) ----------
     global row: brand (home) · sound · stars (shop) · menu with the secondary utilities
     context row: one Back (to the logical parent from HS.nav) + clickable breadcrumb, or the activity title in a game */
  let menuOpen = false;
  function bar(route) {
    const c = HS.nav.chain(route), cur = c[c.length - 1], par = c.length > 1 ? c[c.length - 2] : null, focus = !!cur.focus;
    const me = HS.current(), named = !!(me && me.id !== 'guest');
    const crumbs = !focus && c.length > 2 ? `<nav class="gb-crumbs" aria-label="مسار التنقل"><ol>${c.map((n, i) => {
        const li = i === c.length - 1 ? `<li class="cur"><span aria-current="page">${n.title}</span></li>`
          : `<li${i > 0 ? ' class="mid"' : ''}><a href="#${n.route}" data-nav="${n.route}">${n.title}</a></li>`;
        return li + (i === 0 && c.length > 3 ? '<li class="ell"><button type="button" class="gb-ell" aria-label="أظهر المسار كاملًا" aria-expanded="false">…</button></li>' : '');
      }).join('')}</ol></nav>` : '';
    const ctx = par ? `<div class="gb-ctx"><button type="button" class="gb-back" data-nav="${par.route}" aria-label="رجوع إلى ${esc(par.title)}">${I.back}<span>رجوع</span></button>
      ${focus ? `<span class="gb-title">${cur.title}</span>` : crumbs}</div>` : '';
    const who = named ? `<span class="gb-av" style="background:${HS.kidColor(me)}">${HS.avatar(me)}</span><span class="gb-who nm">${esc(me.name)}</span>`
      : `<span class="gb-av gb-guest" aria-hidden="true">👤</span><span class="gb-who">ضيف</span>`;
    BAR.className = 'appbar' + (focus ? ' focus' : '') + (par ? '' : ' at-home');
    BAR.innerHTML = `<div class="gb-row">
      <a class="gb-brand" href="#home" data-nav="home" aria-label="مدرسة البيت: الرئيسية">${HS.art('logo-mark', { eager: true, cls: 'gb-logo', fb: '🏡' })}<span>مدرسة البيت</span></a>
      <div class="gb-tools">${muteBtn('gb-btn')}
        ${named ? `<button type="button" class="gb-btn gb-stars" data-nav="${shopOn() ? 'shop' : 'home'}" aria-label="${barLabel()}"><span class="gb-dia">💎 <b id="barDia">${ar(HS.diamonds())}</b></span><span class="gb-ys" aria-hidden="true">⭐<i id="barYs">${ar(HS.toNextDiamond())}</i>/${ar(HS.STARS_PER_DIAMOND)}</span></button>` : ''}
        <button type="button" class="gb-btn gb-lock" data-nav="parent" aria-label="صفحة الأب (بالرقم السري)${HS.waitingCount() ? `: ${ar(HS.waitingCount())} هدية تنتظر موافقتك` : ''}">${I.lock}${HS.waitingCount() ? `<span class="gb-badge">${ar(HS.waitingCount())}</span>` : ''}</button>
        <div class="gb-menu"><button type="button" class="gb-btn gb-me" id="gbMenuBtn" aria-expanded="${menuOpen}" aria-controls="gbMenu" aria-label="القائمة: ${named ? esc(me.name) : 'ضيف'}">${who}<span class="gb-caret" aria-hidden="true">▾</span></button>
          <div class="gb-pop" id="gbMenu" ${menuOpen ? '' : 'hidden'}>
            <p class="gb-pop-h">${named ? `يتعلّم الآن: <b class="nm">${esc(me.name)}</b>` : 'تتعلّم الآن كضيف: التقدّم لا يُحفظ باسم طفل'}</p>
            <button type="button" data-nav="home" data-menu>🏠 الرئيسية</button>
            <button type="button" data-nav="${HS.profiles().length ? 'who' : 'home'}" data-menu>👧 ${HS.profiles().length ? 'تبديل الطفل أو إضافة طفل' : 'إضافة طفل'}</button>
            ${named && shopOn() ? '<button type="button" data-nav="shop" data-menu>💎 متجر الهدايا</button>' : ''}
            <button type="button" data-nav="explore" data-menu>🧭 استكشف كل الصفوف</button>
            <button type="button" data-lang-ui="${HS.lang() === 'en' ? 'ar' : 'en'}" data-menu>🌐 لغة الواجهة: <span lang="${HS.lang() === 'en' ? 'ar' : 'en'}">${HS.lang() === 'en' ? 'العربية' : 'English'}</span></button>
          </div></div></div></div>${ctx}`;
    document.title = HS.tr(par ? cur.title + ' – مدرسة البيت' : 'مدرسة البيت');
  }
  const closeMenu = focusBtn => { if (!menuOpen) return; menuOpen = false; const m = document.getElementById('gbMenu'), b = document.getElementById('gbMenuBtn');
    if (m) m.hidden = true; if (b) { b.setAttribute('aria-expanded', 'false'); if (focusBtn) b.focus(); } };

  let current = null;   // app id currently open
  let shown = '';
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id));
    if (shown !== id) window.scrollTo(0, 0);
    shown = id;
  }
  function closeApp() { if (current && APPS[current]) { try { APPS[current].close(); } catch (e) {} } current = null; }
  /** open an app page. The same app stays open between its own pages (they are routes too), it is only re-drawn */
  function openApp(appId, sub) {
    if (current !== appId) { closeApp(); window.scrollTo(0, 0); }
    current = appId;
    showScreen('scr-' + appId);
    APPS[appId].open(sub);
  }

  const shopOn = () => HS.settings().shop !== false;
  /** "≈ 2 days for X · 1 for Y": how long each child needs to earn a reward, from their recent stars per day */
  function daysHint(r) {
    const ks = HS.profiles().filter(p => !r.for || r.for === p.id).map(p => { const rate = HS.earnRate(p.id); return rate ? `${esc(p.name)}: ${HS.count(Math.max(1, Math.ceil(r.cost / rate)), HS.N.day)}` : ''; }).filter(Boolean);
    return ks.length ? '⏳ تقريبًا: ' + ks.join(' · ') : '';
  }
  const barLabel = () => `متجر الهدايا: عندك ${ar(HS.diamonds())} ماسة، و${ar(HS.toNextDiamond())} نجمات من ${ar(HS.STARS_PER_DIAMOND)} للماسة التالية`;
  HS.on('stars', () => { const b = document.getElementById('barDia'), y = document.getElementById('barYs'), btn = document.querySelector('.gb-stars');
    if (b) b.textContent = ar(HS.diamonds()); if (y) y.textContent = ar(HS.toNextDiamond()); if (btn) btn.setAttribute('aria-label', barLabel()); });
  /* the child's avatar in the top bar smiles for a moment: after a right answer, and longer for a new diamond */
  let happyT = 0;
  function smile(ms) {
    const me = HS.current(), img = document.querySelector('.gb-av .hs-av-img'); if (!me || !img) return;
    const id = HS.avatarArt(me.avatar || ''), a = id && HS.ART[id + '-happy'], n = id && HS.ART[id]; if (!a || !n) return;
    img.src = a.face || a.sm || a.src; img.closest('.gb-av').classList.add('happy');
    // and a big version of the happy face under the top bar, so the reaction is easy to see
    let pop = document.querySelector('.av-pop');
    if (!pop) { pop = document.createElement('div'); pop.className = 'av-pop'; pop.setAttribute('aria-hidden', 'true'); pop.innerHTML = '<img alt="">'; document.body.appendChild(pop); }
    const r = img.closest('.gb-av').getBoundingClientRect(), W = Math.min(170, innerWidth * .4);
    pop.style.left = Math.max(8, Math.min(innerWidth - W - 8, r.left + r.width / 2 - W / 2)) + 'px'; pop.style.top = (r.bottom + 14) + 'px';
    pop.style.background = HS.kidColor(me); pop.classList.remove('out'); pop.querySelector('img').src = a.src;
    clearTimeout(happyT); happyT = setTimeout(() => {
      const i = document.querySelector('.gb-av .hs-av-img'); if (i) { i.src = n.face || n.sm || n.src; i.closest('.gb-av').classList.remove('happy'); }
      const p = document.querySelector('.av-pop'); if (p) { p.classList.add('out'); setTimeout(() => { if (p.classList.contains('out')) p.remove(); }, 300); }
    }, Math.max(ms, 1400));
  }
  const fx0 = HS.fx; HS.fx = k => { fx0(k); if (k === 'ok' || k === 'win' || k === 'combo') smile(900); };
  HS.on('diamond', n => { smile(2000); const b = document.querySelector('.gb-stars'); if (b) { b.classList.remove('hs-pop'); void b.offsetWidth; b.classList.add('hs-pop'); }
    HS.toast(`💎 +${ar(n)} ماسة!`, 1600); });

  /* ---------- online sync (Firebase): one family code shared by every device ---------- */
  const SYNC_TXT = { off: 'غير مفعّلة', connecting: '⏳ جاري الاتصال…', on: '✅ متزامن', offline: '📴 بدون إنترنت: يحفظ هنا ويرسل لاحقًا', error: '⚠️ تعذّر الاتصال، سنحاول مرة أخرى' };
  function syncBox() {
    if (!HS.sync || !HS.sync.available()) return '';
    const f = HS.sync.family(), st = HS.sync.status(), t = HS.sync.lastSync(), acc = HS.sync.account && HS.sync.account();
    const G = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z"/><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0012 23.5z"/><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4z"/><path fill="#EA4335" d="M12 5c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 001.8 6.8l3.8 3A6.9 6.9 0 0112 5z"/></svg>';
    const A = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9a4.8 4.8 0 00-3.8-2c-1.6-.2-3.1.9-3.9.9s-2-.9-3.4-.9a5 5 0 00-4.2 2.6c-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.3-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.5a10 10 0 001.4-2.8 4.3 4.3 0 01-2.1-4.1zM13.9 5c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>';
    const signin = acc
      ? `<div class="pp-acc"><p>✅ مسجّل الدخول: <b dir="ltr">${esc(acc.email || acc.name)}</b></p>
          <p class="pp-note">📱 من جوالك تستطيع الآن: متابعة تقدّم كل طفل مباشرة، والموافقة على الهدايا التي يطلبها، وتغيير صفّه والمواد الصعبة. على جهاز الطفل سجّل الدخول مرة واحدة بنفس الحساب.</p>
          <div class="pp-actions"><button type="button" class="p-btn sec" id="ppSignOut">تسجيل الخروج من هذا الجهاز</button></div></div>`
      : `<div class="pp-acc"><p class="pp-note">سجّل الدخول مرة واحدة على كل جهاز (جوالك، آيباد الطفل، اللابتوب): يظهر الأطفال وماساتهم وتقدّمهم في كل مكان، وتتحكم من جوالك: تتابع التقدّم، توافق على الهدايا، وتغيّر المواد الصعبة.</p>
          <div class="pp-actions"><button type="button" class="p-btn pp-g" id="ppSignG">${G} الدخول بحساب Google</button><button type="button" class="p-btn pp-a" id="ppSignA">${A} الدخول بحساب Apple</button></div>
          <p class="pp-note" id="ppSignE" role="alert"></p></div>`;
    return `${signin}
      <details class="pp-other"${acc ? '' : ''}><summary>${acc ? 'حالة المزامنة وكود العائلة' : 'طرق أخرى: كود العائلة'}</summary>
      ${f ? `<div class="pp-sync"><p>الحالة: <b id="ppSyncSt">${SYNC_TXT[st] || st}</b>${t ? ` · آخر مزامنة ${new Date(t).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
          <p>كود العائلة: <b class="pp-code" dir="ltr">${HS.sync.pretty()}</b></p>
          <p class="pp-note">على أي جهاز آخر: افتح الموقع ← صفحة الأب ← «انضم بكود العائلة» واكتب الكود، أو افتح رابط الانضمام. الأطفال بنفس الاسم يُدمجون تلقائيًا ولا تضيع النجوم.</p>
          <div class="pp-actions"><button type="button" class="p-btn" id="ppSyncCopy">📋 انسخ رابط الانضمام</button><button type="button" class="p-btn sec" id="ppSyncNow">🔄 زامن الآن</button><button type="button" class="p-btn sec danger" id="ppSyncLeave">${leaving ? 'متأكد؟ اضغط مرة ثانية' : 'إيقاف المزامنة على هذا الجهاز'}</button></div>
          <p class="pp-note">احتفظ بالكود سرًا: من يعرفه يرى تقدّم أطفالك.</p></div>`
        : `<div class="pp-sync"><p class="pp-note">احفظ الأطفال والنجوم والتقدّم أونلاين، لتظهر على كل الأجهزة (آيباد، لابتوب…). يعمل بدون إنترنت أيضًا ويرسل التغييرات عند الاتصال.</p>
          <div class="pp-actions"><button type="button" class="p-btn" id="ppSyncNew">☁️ ابدأ: أنشئ كود عائلة</button></div>
          <form class="pp-actions" id="ppSyncJoin"><input id="ppSyncCode" dir="ltr" maxlength="16" placeholder="XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" aria-label="كود العائلة"><button type="submit" class="p-btn sec">انضم بكود العائلة</button></form>
          <p class="pp-note" id="ppSyncErr"></p></div>`}</details>`;
  }
  let leaving = false;
  function bindSync() {
    const $ = id => document.getElementById(id);
    if ($('ppSyncNew')) $('ppSyncNew').onclick = () => { HS.sync.create().then(parent); setTimeout(parent, 50); };
    if ($('ppSyncJoin')) $('ppSyncJoin').onsubmit = e => { e.preventDefault();
      HS.sync.join($('ppSyncCode').value).then(() => { HS.toast('✅ انضممت للعائلة'); parent(); }).catch(() => { $('ppSyncErr').textContent = 'الكود ١٢ حرفًا ورقمًا، مثل ABCD-EFGH-JKLM'; }); setTimeout(parent, 50); };
    if ($('ppSyncCopy')) $('ppSyncCopy').onclick = () => { const l = HS.sync.joinLink(); (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(() => HS.toast('📋 نُسخ الرابط'), () => HS.toast(l)); };
    const sign = kind => () => { const e = $('ppSignE'); if (e) e.textContent = '⏳ جاري تسجيل الدخول…';
      HS.sync.signIn(kind).then(u => { if (u) { HS.toast('✅ تم تسجيل الدخول'); parent(); } })
        .catch(err => { const c = (err && err.code) || ''; if (e) e.textContent = /popup-closed|cancelled/.test(c) ? '' : /operation-not-allowed|invalid-oauth|configuration/.test(c) ? (kind === 'apple' ? 'الدخول بحساب Apple غير مفعّل بعد. استعمل Google.' : 'هذه الطريقة غير مفعّلة بعد.') : 'تعذّر تسجيل الدخول. تأكد من الإنترنت، أو استعمل كود العائلة.'; console.warn(err); }); };
    if ($('ppSignG')) $('ppSignG').onclick = sign('google');
    if ($('ppSignA')) $('ppSignA').onclick = sign('apple');
    if ($('ppSignOut')) $('ppSignOut').onclick = () => HS.sync.signOut().then(() => { HS.toast('تم تسجيل الخروج'); parent(); });
    if ($('ppSyncNow')) $('ppSyncNow').onclick = () => { HS.sync.now(); HS.toast('🔄 جاري المزامنة'); };
    if ($('ppSyncLeave')) $('ppSyncLeave').onclick = () => { if (!leaving) { leaving = true; return parent(); } leaving = false; HS.sync.leave(); HS.toast('أُوقفت المزامنة على هذا الجهاز'); parent(); };
  }
  if (HS.sync) {
    HS.on('sync', st => { const el = document.getElementById('ppSyncSt'); if (el) el.textContent = SYNC_TXT[st] || st; const c = document.getElementById('pCloud'); if (c) c.textContent = st === 'on' ? '☁️ محفوظ أونلاين' : st === 'offline' ? '📴 بدون إنترنت' : ''; });
    // another device changed something: redraw the page if it is a portal page (never interrupt a game)
    HS.on('synced', () => { const h = (location.hash || '#home').slice(1); if (/^(home|parent|shop|y-|s-)/.test(h) && !document.querySelector('#portal input:focus')) route(); });
  }

  /* ---------- rewards shop ----------
     Research behind the design (token economies, goal-gradient, overjustification):
     - a menu of small / medium / large rewards, so the first reward is reachable in a day or two
     - a savings goal with a progress bar (effort rises as a goal gets close)
     - coupons are shown first, and the parent sees how many wait, so rewards come soon after buying
     - stars are never taken away; the parent can give surprise stars (unexpected rewards keep interest)
     - children can suggest rewards (having a say makes rewards work better)
     - weekly limits for screen rewards (screens used as rewards become more wanted) */
  let buying = '', ideaOpen = false;
  const fmtDate = t => { const d = new Date(t); return ar(d.getDate()) + '/' + ar(d.getMonth() + 1); };
  const pct = (a, b) => Math.max(4, Math.min(100, Math.round(a / b * 100)));
  function giftPopup() {
    const me = HS.current(); if (!me) return;
    const g = HS.unseenGifts(me.id); if (!g.length) return;
    const n = g.reduce((a, x) => a + x.n, 0), msgs = g.map(x => x.msg).filter(Boolean);
    document.body.insertAdjacentHTML('beforeend', `<div class="sh-gift" id="shGift" role="dialog" aria-modal="true" aria-label="مفاجأة"><div class="sh-gift-in">
      <div class="big">${HS.art('gift-box', { fb: '🎁' })}</div><h2>مفاجأة!</h2><p class="sh-gift-n">+ 💎 ${ar(n)}</p>${msgs.map(m => `<p class="sh-gift-m">«${esc(m)}»</p>`).join('')}
      <button type="button" class="p-btn" id="shGiftOk">شكرًا! 💛</button></div></div>`);
    HS.fx('win'); HS.party(); HS.speak([['مفاجأة! حصلت على ' + n + ' ماسة', 'ar']]);
    document.getElementById('shGiftOk').onclick = () => { HS.seeGifts(me.id); document.getElementById('shGift').remove(); route(); };
  }
  function shop() {
    const me = HS.current(), bal = HS.stars(), rs = HS.rewardsFor(), goal = HS.goal(), orders = HS.orders();
    const wait = orders.filter(o => o.st === 'wait'), old = orders.filter(o => o.st !== 'wait').slice(-5).reverse();
    const state = r => { const c = HS.cantBuy(r); return c === 'week' ? `<span class="sh-need">✋ خلصت هذا الأسبوع (${ar(HS.boughtWeek(r.id))}/${ar(r.week)})</span>`
      : c === 'stars' ? `<span class="sh-need">باقي 💎 ${ar(r.cost - bal)}</span>`
      : `<button type="button" class="p-btn ${buying === r.id ? 'warn' : ''}" data-buy="${r.id}">${buying === r.id ? 'متأكد؟ اضغط مرة ثانية ✅' : 'اشترِ'}</button>`; };
    P.innerHTML = `<div class="sh-head">${me ? `<span class="p-kid-av" style="background:${HS.kidColor(me)}">${HS.avatar(me)}</span>` : ''}
        <div><h1 class="p-title">🛒 متجر الهدايا</h1><p class="sh-bal">عندك <b>💎 ${ar(bal)}</b> <small>· ⭐ ${ar(HS.toNextDiamond())} من ${ar(HS.STARS_PER_DIAMOND)} للماسة التالية</small></p></div></div>
      ${wait.length ? `<h3 class="sh-h">🎟️ كوبوناتك: اعرضها على بابا أو ماما</h3><div class="sh-coupons">${wait.map(o => `<div class="sh-coupon"><span class="em">${HS.rewardArt(o)}</span><div><b>${esc(o.name)}</b><small>اشتريتها ${fmtDate(o.t)} · 💎 ${ar(o.cost)}</small></div><span class="sh-stamp">ينتظر</span></div>`).join('')}</div>` : ''}
      ${goal ? `<div class="sh-goal"><span class="em">${HS.rewardArt(goal)}</span><div class="sh-goal-tx"><small>🎯 هدفك</small><b>${esc(goal.name)}</b>
          <div class="hs-meter ${bal >= goal.cost ? '' : 'mid'}"><i style="width:${pct(bal, goal.cost)}%"></i></div>
          <span>${bal >= goal.cost ? '🎉 تقدر تشتريه الآن!' : `💎 ${ar(bal)} من ${ar(goal.cost)} · باقي ${ar(goal.cost - bal)}`}</span></div>
          <button type="button" class="sh-x" data-goal="" aria-label="إلغاء الهدف">✕</button></div>`
        : `<p class="sh-tip">🎯 اختر هدية واضغط «🎯 هدفي» لتجمع لها الماسات. 💎 تأتي من موادك المهمة، وكل ١٠ نجوم ⭐ تصير ماسة.</p>`}
      <div class="sh-grid">${rs.map(r => { const c = HS.cantBuy(r), isGoal = goal && goal.id === r.id;
        return `<div class="sh-card ${c ? '' : 'can'} ${isGoal ? 'goal' : ''}" data-say="${r.id}"><span class="em">${HS.rewardArt(r)}</span><b>${esc(r.name)}</b><span class="sh-price">💎 ${ar(r.cost)}</span>
          <div class="hs-meter ${c ? 'mid' : ''}"><i style="width:${pct(bal, r.cost)}%"></i></div>${state(r)}
          ${r.week ? `<small class="sh-lim">حتى ${ar(r.week)} في الأسبوع</small>` : ''}
          ${isGoal ? '' : `<button type="button" class="sh-goalbtn" data-goal="${r.id}">🎯 هدفي</button>`}</div>`; }).join('') || `<div class="p-empty">${HS.mascot('point', { small: true, fb: '' })}<p>لا توجد مكافآت بعد. اطلبها من بابا أو ماما.</p></div>`}</div>
      <div class="sh-idea">${ideaOpen ? `<form class="p-inline" id="shIdeaF"><input id="shIdea" maxlength="60" placeholder="مثال: رحلة إلى البحر" aria-label="فكرتك"><button type="submit" class="p-btn">أرسل</button></form>`
        : `<button type="button" class="p-btn sec" id="shIdeaB">💡 عندي فكرة مكافأة</button>`}</div>
      ${old.length ? `<h3 class="sh-h small">آخر المكافآت</h3><ul class="sh-old">${old.map(o => `<li>${o.em} ${esc(o.name)} · ${o.st === 'done' ? '✅ استلمتها' : '↩️ رجعت الماسات'}</li>`).join('')}</ul>` : ''}`;
    P.querySelectorAll('[data-buy]').forEach(b => b.onclick = e => {
      e.stopPropagation(); const id = b.dataset.buy;
      if (buying !== id) { buying = id; HS.fx('tap'); return shop(); }
      buying = ''; const o = HS.buy(id);
      if (o) { HS.fx('win'); HS.party(); HS.toast(`🎉 ${o.em} ${o.name}`); HS.speak([['مبروك! اعرض الكوبون على بابا أو ماما', 'ar']]); }
      shop(); window.scrollTo(0, 0);
    });
    P.querySelectorAll('[data-goal]').forEach(b => b.onclick = e => { e.stopPropagation(); HS.setGoal(b.dataset.goal); HS.fx('tap'); if (b.dataset.goal) HS.toast('🎯 صار هدفك'); shop(); window.scrollTo(0, 0); });
    // tap a card to hear it (for children who can't read yet)
    P.querySelectorAll('[data-say]').forEach(c => c.onclick = () => { const r = rs.find(x => x.id === c.dataset.say), k = HS.cantBuy(r);
      HS.speak([[r.name + '. ' + r.cost + ' ماسة. ' + (k === 'stars' ? 'باقي ' + (r.cost - bal) + ' ماسة' : k === 'week' ? 'خلصت هذا الأسبوع' : 'تقدر تشتريها'), 'ar']]); });
    const ib = document.getElementById('shIdeaB'); if (ib) ib.onclick = () => { ideaOpen = true; shop(); document.getElementById('shIdea').focus(); };
    const f = document.getElementById('shIdeaF'); if (f) f.onsubmit = e => { e.preventDefault(); const v = document.getElementById('shIdea').value.trim(); if (v) { HS.addIdea(v); HS.toast('💡 وصلت فكرتك لبابا وماما'); } ideaOpen = false; shop(); };
    giftPopup();
  }

  /* ---------- child picker ---------- */
  let adding = false, newAv = null;
  const avChoices = () => HS.avatarChoices();
  function avForm(list) {
    const ch = avChoices(); if (!ch.includes(newAv)) newAv = ch[list.length % ch.length];
    return `<form class="p-form" id="pAdd"><label for="pName">اسم الطفل</label><input id="pName" maxlength="20" autocomplete="off" required placeholder="مثال: محمد">
      <fieldset class="p-avpick"><legend>اختر صورته</legend><div class="p-avs" role="radiogroup" aria-label="صورة الطفل">${ch.map(a => `<button type="button" role="radio" aria-checked="${a === newAv}" tabindex="${a === newAv ? 0 : -1}" class="p-av ${a === newAv ? 'on' : ''}" data-av="${esc(a)}" aria-label="${esc(HS.avatarName(a))}">${HS.avatar({ avatar: a })}</button>`).join('')}</div></fieldset>
      <div class="p-form-row"><button type="submit" class="p-btn">حفظ</button>${list.length ? '<button type="button" class="p-btn sec" id="pCancel">إلغاء</button>' : ''}</div></form>`;
  }
  /** a page's background scene (art/manifest-scenes.json), drawn faded behind the top of the page; nothing until Codex draws it */
  function pageBg(id) {
    const old = document.getElementById('pBg'); if (old) old.remove();
    const a = id && HS.ART[id]; if (!a) return;
    document.getElementById('portal').insertAdjacentHTML('afterbegin', `<div class="p-bg" id="pBg" aria-hidden="true"><img src="${a.src}" srcset="${a.sm} 800w, ${a.src} 1600w" sizes="(max-width: 640px) 100vw, 1080px" alt="" decoding="async" onerror="this.parentNode.remove()"></div>`);
  }
  /** #who: who is learning? Big square cards, one per child (Netflix style), plus "new child". Opens only when asked:
      the site remembers the last child and goes straight to their page. */
  function who() {
    const list = HS.profiles(), cur = HS.current();
    if (!list.length) return setupGo({});
    P.innerHTML = `<section class="p-who" aria-labelledby="pWhoT"><h1 class="p-title" id="pWhoT">من يتعلّم الآن؟</h1>
      <div class="p-who-grid">${list.map(p => { const on = !!(cur && cur.id === p.id);
        return `<button type="button" class="p-who-k ${on ? 'on' : ''}" data-kid="${p.id}" aria-pressed="${on}"><span class="p-who-av" style="background:${HS.kidColor(p)}">${HS.avatar(p, { big: true, eager: true })}</span>
          <span class="p-who-n nm">${esc(p.name)}</span><span class="p-who-s">💎 ${ar(HS.diamonds(p.id))}${HS.dayStreak(p.id) ? ` · 🔥 ${ar(HS.dayStreak(p.id))}` : ''}</span></button>`; }).join('')}
        <button type="button" class="p-who-k add" id="pNew"><span class="p-who-av">＋</span><span class="p-who-n">طفل جديد</span></button></div></section>`;
    P.querySelectorAll('[data-kid]').forEach(b => b.onclick = () => { HS.setCurrent(b.dataset.kid); HS.fx('tap'); location.hash = 'home'; });
    document.getElementById('pNew').onclick = () => setupGo({});
    pageBg('bg-who');
  }
  /** the small "switch child" button in the home greeting */
  const switchBtn = me => `<button type="button" class="p-switch" data-nav="who" aria-label="تبديل الطفل"><span class="p-switch-av" style="background:${HS.kidColor(me)}">${HS.avatar(me)}</span><span>تبديل</span></button>`;
  /** "who is learning now?": one chip per child (tap to switch), plus "new child" */
  function kidsRowAll() {
    const list = HS.profiles(), cur = HS.current();
    if (!list.length) return `<div class="p-kids"><button type="button" class="p-kid add" id="pNew" aria-expanded="${adding}"><span class="p-kid-av">＋</span><span class="p-kid-n">أضف طفلًا</span></button>${adding ? avForm(list) : ''}</div>`;
    return `<div class="p-kids"><h2 class="p-kids-t">من يتعلّم الآن؟</h2><div class="p-chips">${list.map(p => { const on = !!(cur && cur.id === p.id);
        return `<button type="button" class="p-kid ${on ? 'on' : ''}" data-kid="${p.id}" aria-pressed="${on}"><span class="p-kid-av" style="background:${HS.kidColor(p)}">${HS.avatar(p)}</span><span class="p-kid-n nm">${esc(p.name)}</span><span class="p-kid-s">💎 ${ar(HS.diamonds(p.id))}${HS.dayStreak(p.id) ? ` · 🔥 ${ar(HS.dayStreak(p.id))}` : ''}</span></button>`; }).join('')}
      <button type="button" class="p-kid add" id="pNew" aria-expanded="${adding}"><span class="p-kid-av">＋</span><span class="p-kid-n">طفل جديد</span></button></div>${adding ? avForm(list) : ''}</div>`;
  }
  function bindPicker() {
    P.querySelectorAll('[data-kid]').forEach(b => b.onclick = () => { HS.setCurrent(b.dataset.kid); home(); });
    const nw = document.getElementById('pNew'); if (nw) nw.onclick = () => setupGo({});
    const pick = b => { newAv = b.dataset.av; P.querySelectorAll('[data-av]').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); x.tabIndex = on ? 0 : -1; }); };
    P.querySelectorAll('[data-av]').forEach(b => b.onclick = () => { pick(b); HS.fx('tap'); });
    const grp = P.querySelector('.p-avs');
    if (grp) grp.onkeydown = e => {   // radio group keys; in right-to-left order "next" is the left arrow
      const all = [...grp.querySelectorAll('[data-av]')], i = all.indexOf(document.activeElement); if (i < 0) return;
      const step = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 }[e.key]; if (!step && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault(); const j = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : (i + step + all.length) % all.length; pick(all[j]); all[j].focus();
    };
    const f = document.getElementById('pAdd');
    if (f) f.onsubmit = e => { e.preventDefault(); const n = document.getElementById('pName').value.trim(); if (!n) return; const used = HS.profiles().length; HS.addProfile({ name: n, avatar: newAv, color: HS.COLORS[used % HS.COLORS.length] }); adding = false; newAv = null; home(); };
    const c = document.getElementById('pCancel'); if (c) c.onclick = () => { adding = false; home(); };
    const sk = document.getElementById('pSkip'); if (sk) sk.onclick = () => { try { sessionStorage.setItem('hs-skip', '1'); } catch (e) {} home(); };
  }

  /* ---------- what the current child did, read from their saved answers (nothing is made up) ---------- */
  function catalogEntry(kind, id) {   // the menu item for a unit/app, with the name of the subject it sits in
    for (const y of CATALOG) {
      if (y.app && kind === 'app' && y.app === id) return { o: y, where: '' };
      for (const s of y.subjects || []) {
        if (kind === 'app' && s.app === id) return { o: s, where: y.name };
        for (const u of s.units || []) if ((kind === 'unit' ? u.unit : u.app) === id) return { o: u, where: `${y.name} · ${s.name}` };
      }
    }
    return null;
  }
  const lastT = d => Object.values((d && d.srs) || {}).reduce((m, r) => Math.max(m, r.t || 0), 0);
  /** the place this child last practised: newest answer in a unit or the dictionary, or the last kindergarten session */
  function lastPlace() {
    const ns = HS.profileData().ns || {}, found = [];
    Object.keys(window.UNITS || {}).forEach(id => found.push({ t: Math.max(lastT(ns['u:' + id]), lastT(ns['fc:' + id])), kind: 'unit', id }));
    if (APPS.dict) found.push({ t: Math.max(lastT(ns.dict), lastT(ns.dictar)), kind: 'app', id: 'dict' });
    if (APPS.kg) found.push({ t: (ns.kg && ns.kg.sess && ns.kg.sess.last) || 0, kind: 'app', id: 'kg' });
    const best = found.filter(x => x.t).sort((a, b) => b.t - a.t)[0]; if (!best) return null;
    const c = catalogEntry(best.kind, best.id); if (!c) return null;
    return { nav: navOf(c.o), name: c.o.name, where: c.where, em: c.o.em, art: c.o.art };
  }
  /** questions and words due for review today, per unit and for the dictionary */
  function reviews() {
    const ns = HS.profileData().ns || {}, items = []; let seen = false;
    Object.keys(window.UNITS || {}).forEach(id => {
      const d = ns['u:' + id]; if (!d || !d.srs || !Object.keys(d.srs).length) return; seen = true;
      const n = HS.srs.due('u:' + id, UNITS[id].questions.map(q => q.id)).length, c = catalogEntry('unit', id);
      if (n) items.push({ nav: 'unit-' + id, name: c ? c.o.name : UNITS[id].title, n, noun: HS.N.q });
    });
    const mine = (ns.dict && ns.dict.mine) || [];
    if (mine.length) {
      ['dict', 'dictar'].forEach(k => { if (ns[k] && ns[k].srs && Object.keys(ns[k].srs).length) seen = true; });
      const n = new Set([...HS.srs.due('dict', mine), ...HS.srs.due('dictar', mine)]).size;
      if (n) items.push({ nav: 'app-dict', name: 'كلماتي في القاموس', n, noun: ['كلمة', 'كلمتان', 'كلمات', 'كلمة'] });
    }
    return { items, seen };
  }

  /* ---------- home ---------- */
  /** the full Koko scene for the current language (its free sky is where the text starts), or null */
  function heroScene() {
    const id = HS.lang() === 'en' && HS.ART['home-hero-koko-en'] ? 'home-hero-koko-en' : HS.ART['home-hero-koko'] ? 'home-hero-koko' : null;
    if (!id) return null; const a = HS.ART[id];
    return `<img class="p-hero-bg" src="${a.src}" srcset="${a.sm} 800w, ${a.src} 1600w" sizes="(max-width: 640px) 100vw, 1080px" width="${a.w}" height="${a.h}" alt="" decoding="async" fetchpriority="high" onerror="this.closest('.p-hero').classList.remove('scene');this.remove()">`;
  }
  /** the hero frame: the scene when it exists, otherwise Koko standing on the sand */
  const heroWrap = (cls, inner) => { const sc = heroScene();
    return `<section class="p-hero ${cls}${sc ? ' scene' : ''}" aria-labelledby="pHi">${sc || ''}${inner}${sc ? '' : `<div class="p-hero-art" aria-hidden="true">${HS.mascot('welcome', { eager: true, fb: '🐨' })}</div>`}</section>`; };
  function hero() {
    const me = HS.current(), named = me && me.id !== 'guest', st = HS.dayStreak(), go = lastPlace();
    return heroWrap('', `
      <div class="p-hero-tx">
        <div class="p-hi-row"><h1 id="pHi">${named ? `أهلًا يا <span class="nm">${esc(me.name)}</span>` : 'أهلًا بك في مدرسة البيت'}</h1>${named && HS.profiles().length ? switchBtn(me) : ''}</div>
        <p class="p-hero-sub">${st ? `🔥 تعلّم متواصل: ${HS.count(st, HS.N.day)}` : 'هيا نتعلّم شيئًا جديدًا اليوم.'}</p>
        ${go ? `<button type="button" class="p-go" data-nav="${go.nav}"><span class="p-go-tile" aria-hidden="true">${HS.art(go.art, { fb: go.em, small: true })}</span>
            <span class="p-go-tx"><small>أكمل من حيث توقفت${go.where ? ` · ${go.where}` : ''}</small><b>${go.name}</b></span><span class="go">${I.fwd}</span></button>` : ''}
      </div>`);
  }
  function today() {
    const r = reviews(), out = [], me = HS.current(), nf = me && me.grade ? nextFocus(me) : null;
    if (nf) out.push(`<section class="p-panel p-next" aria-labelledby="pNx"><h2 id="pNx"><span aria-hidden="true">💎</span> خطوتك التالية</h2>
        <button type="button" class="p-go" data-nav="${nf.nav}"><span class="p-go-tile" aria-hidden="true">${HS.art(nf.art, { fb: nf.em, small: true })}</span>
        <span class="p-go-tx"><small>${nf.where ? nf.where + ' · ' : ''}مادة تركيز: تعطي ماسات</small><b>${nf.name}</b></span><span class="go">${I.fwd}</span></button></section>`);
    if (r.items.length) out.push(`<section class="p-panel p-review" aria-labelledby="pRv"><h2 id="pRv"><span aria-hidden="true">📅</span> مراجعة اليوم</h2>
        <p>أسئلة أخطأت فيها أو حان وقت تذكّرها:</p><div class="p-rv-list">${r.items.map(i => `<button type="button" class="p-rv" data-nav="${i.nav}"><span>${i.name}</span><b>${HS.count(i.n, i.noun)}</b><span class="go">${I.fwd}</span></button>`).join('')}</div></section>`);
    else if (r.seen) out.push(`<section class="p-panel p-review ok" aria-labelledby="pRv"><h2 id="pRv"><span aria-hidden="true">✅</span> لا توجد مراجعة اليوم</h2><p>كل ما تعلّمته في موعده. جرّب درسًا جديدًا أو اختبارًا.</p></section>`);
    if (shopOn() && HS.current()) out.push(shopButton());
    return out.length ? `<div class="p-today">${out.join('')}</div>` : '';
  }
  function home() {
    let skip = false; try { skip = sessionStorage.getItem('hs-skip') === '1'; } catch (e) {}
    const list = HS.profiles();
    if (!list.length && !skip) { if (!W) W = { step: 'who', focus: [] }; return setup(); }   // first visit: who is setting up?
    const me = HS.current(), named = me && me.id !== 'guest';
    if (list.length && !named) { try { history.replaceState(null, '', '#who'); } catch (e) {} bar('who'); return who(); }
    const kidsRow = () => named ? '' : kidsRowAll();
    const foot = `<footer class="p-foot">${HS.sync && HS.sync.family() ? `<p class="p-cloud" id="pCloud">${HS.sync.status() === 'on' ? '☁️ محفوظ أونلاين' : ''}</p>` : ''}
      <p>${HS.sync && HS.sync.family() ? 'التقدّم والماسات محفوظة على هذا الجهاز وأونلاين' : 'التقدّم والماسات تُحفظ على هذا الجهاز'} · صفحة الأب من القفل 🔒 في الأعلى</p></footer>`;
    if (named && me.grade) {
      P.innerHTML = hero() + kidsRow() + today() + myGrade(me) + `
        <section class="p-sec" aria-label="المزيد"><div class="p-grid">${dictCard(me)}
          <button type="button" class="p-card p-explore" data-nav="explore"><span class="p-tile" aria-hidden="true">🧭</span><span class="tx"><b>استكشف</b><small>صفوف ومواد أخرى، وألعاب الروضة</small></span><span class="go">${I.fwd}</span></button></div></section>` + foot;
      return bindPicker(), giftPopup();
    }
    P.innerHTML = hero() + kidsRow() + (named ? `<button type="button" class="p-panel p-pickgrade" id="pPickGrade"><span aria-hidden="true">🎒</span><span><b>في أي صف أنت؟</b><small>اختر صفّك لتظهر لك مواده هنا</small></span><span class="go">${I.fwd}</span></button>` : '') + today() + `
      <section class="p-sec" aria-labelledby="pGr"><h2 id="pGr" class="p-h2">ماذا نتعلّم اليوم؟</h2>
        <div class="p-grid">${CATALOG.map(y => card(y, y.app ? 'app-' + y.app : 'y-' + y.id)).join('')}</div></section>` + foot;
    const pg = document.getElementById('pPickGrade'); if (pg) pg.onclick = () => setupGo({ step: 'grade', who: 'kid', pid: me.id, grade: me.grade });
    bindPicker(); giftPopup();
  }
  function shopButton() {
    const g = HS.goal(), bal = HS.stars(), w = HS.orders().some(o => o.st === 'wait');
    return `<button type="button" class="p-shop" data-nav="shop"><span class="em" aria-hidden="true">${g ? HS.rewardArt(g) : '🛒'}</span><span class="tx"><small>${g ? '🎯 هدفك' : 'متجر الهدايا'}</small><b>${g ? esc(g.name) : `عندك 💎 ${ar(bal)}`}</b>
      ${g ? `<span class="hs-meter ${bal >= g.cost ? '' : 'mid'}"><i style="width:${pct(bal, g.cost)}%"></i></span>` : ''}<span class="p-shop-s">${g ? (bal >= g.cost ? '🎉 تقدر تشتريه الآن!' : `💎 ${ar(bal)} من ${ar(g.cost)}`) : 'هدايا تشتريها بالماس 💎'}${w ? ' · 🎟️ عندك كوبون' : ''}</span></span><span class="go">${I.fwd}</span></button>`;
  }


  /* ---------- setting up a child (#setup) ----------
     Whoever opens the site first sets up: a parent does name, picture, grade, the subjects that are hard (focus:
     they earn diamonds) and the parent PIN; a child does name, picture and grade, and the parent is asked about the
     hard subjects the next time they open the lock. The same steps edit a child later (W.pid). */
  let W = null;
  const GRADES = () => CATALOG.filter(y => y.subjects);
  /** what a grade offers as focus: its subjects that have an id (kindergarten: groups of games) */
  const focusChoices = g => g === 'kg' ? HS.KG_GROUPS.map(x => ({ id: x.id, name: x.name, em: x.em }))
    : ((CATALOG.find(y => y.id === g) || {}).subjects || []).filter(x => x.id).map(x => ({ id: x.id, name: x.name, em: x.em, art: x.art, soon: !x.units && !x.app }));
  const gradeName = g => (CATALOG.find(y => y.id === g) || {}).name || '';
  function setupGo(w) { W = Object.assign({ step: 'who', focus: [] }, w); if (location.hash === '#setup') setup(); else location.hash = 'setup'; }
  function wizStep(title, sub, body, o = {}) {
    const steps = W.who === 'parent' ? ['who', 'kid', 'grade', 'focus', 'pin'] : ['who', 'kid', 'grade'], i = Math.max(0, steps.indexOf(W.step));
    P.innerHTML = `<section class="wz" aria-labelledby="wzT">
      ${W.pid ? '' : `<ol class="wz-dots" aria-label="الخطوة ${ar(i + 1)} من ${ar(steps.length)}">${steps.map((x, k) => `<li class="${k < i ? 'done' : k === i ? 'on' : ''}"></li>`).join('')}</ol>`}
      <div class="wz-koko" aria-hidden="true">${HS.mascot(o.pose || 'welcome', { small: true, eager: true, fb: '🐨' })}</div>
      <h1 class="p-title" id="wzT">${title}</h1>${sub ? `<p class="p-sub">${sub}</p>` : ''}
      <div class="wz-body">${body}</div>
      <div class="wz-nav">${o.next === false ? '' : `<button type="button" class="p-btn" id="wzNext" ${o.ready === false ? 'disabled' : ''}>${o.nextText || 'التالي ←'}</button>`}
        ${o.back === false ? '' : '<button type="button" class="p-btn sec" id="wzBack">رجوع</button>'}</div></section>`;
    const nx = document.getElementById('wzNext'); if (nx && o.onNext) nx.onclick = o.onNext;
    const bk = document.getElementById('wzBack'); if (bk) bk.onclick = o.onBack || (() => { W.step = steps[Math.max(0, i - 1)]; if (W.pid && i <= 2) { W = null; return history.back(); } setup(); });
  }
  function setup() {
    if (!W) W = { step: 'who', focus: [] };
    const kid = W.pid ? HS.profiles().find(x => x.id === W.pid) : null;
    if (W.step === 'who') return wizStep('أهلًا! أنا كوكو 👋', 'من يجهّز الحساب الآن؟', `<div class="wz-who">
        <button type="button" class="wz-big" data-who="parent"><span class="em" aria-hidden="true">👨‍👩‍👧</span><b>أنا ولي الأمر</b><small>أختار صف الطفل والمواد التي يحتاج فيها مساعدة</small></button>
        <button type="button" class="wz-big" data-who="kid"><span class="em" aria-hidden="true">🧒</span><b>أنا الطفل</b><small>أكتب اسمي وأختار صورتي وصفّي</small></button></div>
        ${HS.profiles().length ? '' : '<button type="button" class="p-link" id="pSkip">المتابعة بدون إضافة</button>'}`, { next: false, back: !!HS.profiles().length, onBack: () => { W = null; location.hash = 'home'; } }),
      P.querySelectorAll('[data-who]').forEach(b => b.onclick = () => { W.who = b.dataset.who; W.step = 'kid'; HS.fx('tap'); if (W.who === 'parent' && HS.settings().pin) gate(setup); else setup(); }),
      bindSkip();
    if (W.step === 'kid') {
      if (!HS.avatarChoices().includes(W.avatar)) W.avatar = HS.avatarChoices()[HS.profiles().length % HS.avatarChoices().length];
      wizStep(W.who === 'parent' ? 'اسم الطفل وصورته' : 'ما اسمك؟ واختر صورتك', '', `<label class="wz-l" for="wzName">${W.who === 'parent' ? 'اسم الطفل' : 'اسمي'}</label>
        <input id="wzName" class="wz-in" maxlength="20" autocomplete="off" value="${esc(W.name || '')}" placeholder="مثال: محمد">
        <fieldset class="p-avpick"><legend>${W.who === 'parent' ? 'اختر صورته' : 'اختر صورتك'}</legend><div class="p-avs" role="radiogroup" aria-label="الصورة">${HS.avatarChoices().map(a => `<button type="button" role="radio" aria-checked="${a === W.avatar}" tabindex="${a === W.avatar ? 0 : -1}" class="p-av ${a === W.avatar ? 'on' : ''}" data-av="${esc(a)}" aria-label="${esc(HS.avatarName(a))}">${HS.avatar({ avatar: a })}</button>`).join('')}</div></fieldset>`,
        { onNext: () => { const v = document.getElementById('wzName').value.trim(); if (!v) { document.getElementById('wzName').focus(); HS.fx('no'); return; } W.name = v; W.step = 'grade'; setup(); } });
      const nm = document.getElementById('wzName'); setTimeout(() => nm.focus(), 50);
      nm.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('wzNext').click(); } };
      return bindAvPick(a => { W.avatar = a; });
    }
    if (W.step === 'grade') {
      return wizStep(kid ? `صف <span class="nm">${esc(kid.name)}</span>` : W.who === 'parent' ? 'في أي صف؟' : 'في أي صف أنت؟', 'نعرض في الصفحة الرئيسية مواد هذا الصف فقط، والصفوف الأخرى في «استكشف».',
        `<div class="wz-grades" role="radiogroup" aria-label="الصف">${GRADES().map(y => `<button type="button" role="radio" aria-checked="${W.grade === y.id}" class="wz-grade ${W.grade === y.id ? 'on' : ''}" data-grade="${y.id}">${tile(y, true)}<b>${y.name}</b><small>${y.sub || ''}</small></button>`).join('')}</div>`,
        { ready: !!W.grade, nextText: W.who === 'parent' ? 'التالي ←' : 'تم ✓', onNext: () => { if (W.who === 'parent') { W.step = 'focus'; return setup(); } finish(); } }),
        P.querySelectorAll('[data-grade]').forEach(b => b.onclick = () => { if (W.grade !== b.dataset.grade) W.focus = []; W.grade = b.dataset.grade; HS.fx('tap'); setup(); });
    }
    if (W.step === 'focus') {
      const ch = focusChoices(W.grade), who = kid ? esc(kid.name) : esc(W.name || 'الطفل');
      wizStep(`أي ${W.grade === 'kg' ? 'الألعاب' : 'المواد'} يحتاج فيها <span class="nm">${who}</span> مساعدة أكثر؟`,
        `ما تختاره هنا يعطي <b>ماسات 💎</b> تُشترى بها الهدايا. باقي الأنشطة تعطي <b>نجومًا ⭐</b>، وكل ${ar(HS.STARS_PER_DIAMOND)} نجوم تصير ماسة واحدة.`,
        `<div class="wz-focus" role="group" aria-label="مواد التركيز">${ch.map(c => `<button type="button" class="wz-f ${W.focus.includes(c.id) ? 'on' : ''}" aria-pressed="${W.focus.includes(c.id)}" data-f="${c.id}"><span class="em" aria-hidden="true">${c.art ? HS.art(c.art, { small: true, fb: c.em }) : c.em}</span><b>${c.name}</b>${c.soon ? '<small>دروسها قريبًا</small>' : ''}<span class="wz-tick" aria-hidden="true">💎</span></button>`).join('')}</div>
        <p class="pp-note">يمكنك تغييرها في أي وقت من صفحة الأب 🔒.</p>${W.from === 'parent' && kid && kid.needFocus ? '<button type="button" class="p-link" id="wzLater">لاحقًا: افتح صفحة الأب الآن</button>' : ''}`,
        { ready: W.focus.length > 0, nextText: HS.settings().pin ? 'تم ✓' : 'التالي ←', onNext: () => { if (!HS.settings().pin) { W.step = 'pin'; return setup(); } finish(); },
          onBack: W.from === 'parent' ? () => { W = null; if (location.hash === '#parent') route(); else location.hash = 'parent'; } : undefined });
      const lt = document.getElementById('wzLater'); if (lt) lt.onclick = () => { try { sessionStorage.setItem('hs-focus-later', '1'); } catch (e) {} W = null; parent(); };
      return P.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { const f = b.dataset.f; W.focus = W.focus.includes(f) ? W.focus.filter(x => x !== f) : W.focus.concat(f); HS.fx('tap'); setup(); });
    }
    if (W.step === 'pin') {
      wizStep('رقم سري لصفحة الأب 🔒', 'حتى لا يغيّر الأطفال المواد أو الأسعار أو يوافقوا على هداياهم بأنفسهم. يُطلب عند فتح القفل في أعلى الصفحة.',
        `<label class="wz-l" for="wzPin">٤ أرقام على الأقل</label><input id="wzPin" class="wz-in pin" inputmode="numeric" type="password" maxlength="8" autocomplete="new-password">
         <label class="wz-l" for="wzPin2">اكتبه مرة ثانية</label><input id="wzPin2" class="wz-in pin" inputmode="numeric" type="password" maxlength="8" autocomplete="new-password"><p class="pp-note" id="wzPinE" role="alert"></p>`,
        { nextText: 'تم ✓', onNext: () => {
          const a = document.getElementById('wzPin').value.trim(), b = document.getElementById('wzPin2').value.trim(), e = document.getElementById('wzPinE');
          if (!/^\d{4,8}$/.test(a)) { e.textContent = 'اكتب ٤ أرقام على الأقل'; HS.fx('no'); return; }
          if (a !== b) { e.textContent = 'الرقمان غير متطابقين'; HS.fx('no'); return; }
          HS.setSetting('pin', a); try { sessionStorage.setItem('hs-pin', '1'); } catch (x) {} finish(); } });
      return setTimeout(() => document.getElementById('wzPin').focus(), 50);
    }
    if (W.step === 'done') {
      const me = HS.profiles().find(x => x.id === W.done) || HS.current();
      P.innerHTML = `<section class="wz done" aria-labelledby="wzT"><div class="wz-done-av" style="background:${HS.kidColor(me)}">${HS.avatarHappy(me, { big: true })}</div>
        <h1 class="p-title" id="wzT">جاهز يا <span class="nm">${esc(me.name)}</span>! 🎉</h1>
        <p class="p-sub">${HS.focusOf(me).length ? `تركيزك: ${focusChoices(me.grade).filter(c => HS.focusOf(me).includes(c.id)).map(c => c.name).join('، ')}. فيها تجمع الماسات 💎.` : 'كل نشاط يعطيك نجومًا ⭐، وكل ١٠ نجوم تصير ماسة 💎 تشتري بها الهدايا.'}</p>
        <div class="wz-nav"><button type="button" class="p-btn" id="wzGo">${W.from === 'parent' ? 'رجوع لصفحة الأب' : 'هيا نبدأ ←'}</button></div></section>`;
      HS.party && HS.party(); HS.fx('win');
      document.getElementById('wzGo').onclick = () => { const to = W.from === 'parent' ? 'parent' : 'home'; W = null; if (location.hash === '#' + to) route(); else location.hash = to; };
    }
  }
  function finish() {
    let id = W.pid;
    if (id) HS.updateProfile(id, Object.assign({ grade: W.grade }, W.who === 'parent' ? { focus: W.focus.slice(), needFocus: false } : { needFocus: !HS.focusOf(HS.profiles().find(x => x.id === id)).length }));
    else id = HS.addProfile({ name: W.name, avatar: W.avatar, color: HS.COLORS[HS.profiles().length % HS.COLORS.length], grade: W.grade, focus: W.who === 'parent' ? W.focus : [], needFocus: W.who !== 'parent' });
    HS.setCurrent(id); W.done = id; W.step = 'done'; setup();
  }
  function bindAvPick(onPick) {
    const pick = b => { onPick(b.dataset.av); P.querySelectorAll('[data-av]').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); x.tabIndex = on ? 0 : -1; }); };
    P.querySelectorAll('[data-av]').forEach(b => b.onclick = () => { pick(b); HS.fx('tap'); });
    const grp = P.querySelector('.p-avs');
    if (grp) grp.onkeydown = e => {   // radio group keys; in right-to-left order "next" is the left arrow
      const all = [...grp.querySelectorAll('[data-av]')], i = all.indexOf(document.activeElement); if (i < 0) return;
      const step = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 }[e.key]; if (!step && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault(); const j = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : (i + step + all.length) % all.length; pick(all[j]); all[j].focus();
    };
  }
  function bindSkip() { const sk = document.getElementById('pSkip'); if (sk) sk.onclick = () => { try { sessionStorage.setItem('hs-skip', '1'); } catch (e) {} W = null; location.hash = 'home'; route(); }; }

  /* ---------- the child's own grade on the main page ---------- */
  function myGrade(me) {
    const y = CATALOG.find(x => x.id === me.grade); if (!y) return '';
    const f = HS.focusOf(me), subs = y.subjects.slice().sort((a, b) => (f.includes(b.id) ? 1 : 0) - (f.includes(a.id) ? 1 : 0));
    const kgFocus = me.grade === 'kg' && f.length ? `<p class="p-focus-kg">💎 ألعاب التركيز: ${HS.KG_GROUPS.filter(g => f.includes(g.id)).map(g => g.em + ' ' + g.name).join(' · ')}</p>` : '';
    return `<section class="p-sec" aria-labelledby="pMy"><h2 id="pMy" class="p-h2">${tile(y, true)} ${y.name}</h2>${kgFocus}
      <div class="p-grid">${subs.map(sb => { const c = card(sb, navOf(sb) || `s-${y.id}-${sb.id}`); return f.includes(sb.id) && me.grade !== 'kg' ? c.replace('<span class="tx">', '<span class="p-focus" aria-label="مادة تركيز: تعطي ماسات">💎 تركيز</span><span class="tx">') : c; }).join('')}</div></section>`;
  }
  /** «خطوتك التالية»: the next unit in a focus subject (the one practised last, or the first not mastered) */
  function nextFocus(me) {
    const f = HS.focusOf(me); if (!f.length) return null;
    if (me.grade === 'kg') return { nav: 'app-kg', name: HS.KG_GROUPS.filter(g => f.includes(g.id)).map(g => g.name).join(' · '), em: '🧸', art: 'grade-kg' };
    const y = CATALOG.find(x => x.id === me.grade); if (!y) return null;
    const ns = HS.profileData().ns || {}, cand = [];
    y.subjects.filter(sb => f.includes(sb.id)).forEach(sb => (sb.units || []).filter(u => u.unit && window.UNITS && UNITS[u.unit]).forEach(u => cand.push({ u, sb, t: Math.max(lastT(ns['u:' + u.unit]), lastT(ns['fc:' + u.unit])) })));
    if (!cand.length) return null;
    const best = cand.slice().sort((a, b) => b.t - a.t)[0];
    return { nav: navOf(best.u), name: best.u.name, where: best.sb.name, em: best.u.em, art: best.u.art };
  }
  function dictCard(me) {
    const d = CATALOG.find(x => x.app === 'dict'); if (!d) return '';
    const lv = { kg: 'سهل', g1: 'سهل', g2: 'سهل', g3: 'سهل', g4: 'متوسط', g5: 'متوسط', g6: 'صعب' }[me.grade];
    return card(d, 'app-dict').replace('</small></span>', `</small>${lv ? `<small class="p-lv">مستواك المقترح: ${lv}</small>` : ''}</span>`);
  }
  function explore() {
    P.innerHTML = `<div class="p-head"><span class="p-tile" aria-hidden="true">🧭</span><div><h1 class="p-title">استكشف</h1><p class="p-sub">كل الصفوف والمواد والألعاب. ما تتعلّمه هنا يعطيك نجومًا ⭐.</p></div></div>
      <div class="p-grid">${CATALOG.map(y => card(y, y.app ? 'app-' + y.app : 'y-' + y.id)).join('')}</div>`;
  }

  /* ---------- parent PIN (required) ----------
     The lock in the top bar opens the parent page. Without a PIN yet, the parent sets one first.
     Stops children from changing focus subjects or prices, or approving their own gifts. Asked once per browser session. */
  function gate(next) {
    const pin = HS.settings().pin; let ok = false; try { ok = sessionStorage.getItem('hs-pin') === '1'; } catch (e) {}
    if (pin && ok) return next();
    if (!pin) {
      P.innerHTML = `<form class="p-form pin" id="pinF"><h1 class="p-title">🔒 رقم سري لصفحة الأب</h1>
        <p class="pp-note">اختر رقمًا سريًا (٤ أرقام على الأقل). يُطلب كلما فتحت القفل، حتى لا يغيّر الأطفال المواد أو الأسعار أو يوافقوا على هداياهم.</p>
        <label for="pinI">الرقم السري</label><input id="pinI" inputmode="numeric" type="password" maxlength="8" autocomplete="new-password">
        <label for="pinI2">اكتبه مرة ثانية</label><input id="pinI2" inputmode="numeric" type="password" maxlength="8" autocomplete="new-password">
        <button type="submit" class="p-btn">حفظ والدخول</button><p class="pp-note" id="pinE" role="alert"></p></form>`;
      const i = document.getElementById('pinI'); i.focus();
      return document.getElementById('pinF').onsubmit = e => { e.preventDefault();
        const a = i.value.trim(), b = document.getElementById('pinI2').value.trim(), er = document.getElementById('pinE');
        if (!/^\d{4,8}$/.test(a)) { er.textContent = 'اكتب ٤ أرقام على الأقل'; HS.fx('no'); return; }
        if (a !== b) { er.textContent = 'الرقمان غير متطابقين'; HS.fx('no'); return; }
        HS.setSetting('pin', a); try { sessionStorage.setItem('hs-pin', '1'); } catch (x) {} next(); };
    }
    P.innerHTML = `<form class="p-form pin" id="pinF"><h1 class="p-title">🔒 صفحة الأب</h1><label for="pinI">الرقم السري</label>
      <input id="pinI" inputmode="numeric" type="password" maxlength="8" autocomplete="off"><button type="submit" class="p-btn">دخول</button><p class="pp-note" id="pinE" role="alert"></p></form>`;
    const i = document.getElementById('pinI'); i.focus();
    document.getElementById('pinF').onsubmit = e => { e.preventDefault();
      if (i.value === pin) { try { sessionStorage.setItem('hs-pin', '1'); } catch (x) {} next(); }
      else { i.value = ''; document.getElementById('pinE').textContent = 'رقم غير صحيح'; HS.fx('no'); } };
  }
  /** after the lock: a child who set themselves up is waiting for the parent to choose their hard subjects */
  function parentFirst() {
    let later = false; try { later = sessionStorage.getItem('hs-focus-later') === '1'; } catch (e) {}
    const k = !later && HS.profiles().find(p => p.needFocus && p.grade);
    if (k) { W = { step: 'focus', who: 'parent', pid: k.id, grade: k.grade, focus: HS.focusOf(k).slice(), from: 'parent' }; return setup(); }
    parent();
  }

  /* ---------- parent page ---------- */
  const meter = x => `<div class="hs-meter ${x < .4 ? 'low' : x < .8 ? 'mid' : ''}" role="img" aria-label="${Math.round(x * 100)}٪"><i style="width:${Math.max(3, Math.round(x * 100))}%"></i></div>`;
  let confirmKey = '';
  // Kindergarten: the child never sees numbered levels. Difficulty adapts by itself;
  // a parent can move a game to a different starting level here.
  function kgLevels(pid) {
    const cur = (HS.data('kg', pid).lv) || {};
    return `<details class="pp-card pp-kglv"><summary>🎚️ صعوبة ألعاب الروضة</summary>
      <p class="pp-note">الألعاب تصعب وتسهل تلقائيًا حسب إجابات الطفل. غيّر المستوى هنا فقط إذا كانت لعبة سهلة جدًا أو صعبة جدًا.</p>
      ${APPS.kg.levels().map(g => `<label class="pp-lv"><span>${esc(g.name)}</span><select data-kglv="${pid}|${g.k}" aria-label="مستوى ${esc(g.name)}">${Array.from({ length: g.max }, (_, i) => `<option value="${i + 1}" ${(cur[g.k] || 1) === i + 1 ? 'selected' : ''}>المستوى ${ar(i + 1)} من ${ar(g.max)}</option>`).join('')}</select></label>`).join('')}</details>`;
  }
  /* the parent page has three kinds of tab: one per child (their progress and what needs the parent),
     «الهدايا» (the gifts shop) and «الإعدادات» (account, lock, sound, kindergarten time). Only one shows at a time. */
  let ptab = '';
  const sw = (id, on, label, sub) => `<label class="pp-row pp-swr"><span class="pp-rl"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span>
    <span class="pp-switch"><input type="checkbox" role="switch" id="${id}" ${on ? 'checked' : ''}><i aria-hidden="true"></i></span></label>`;
  const pct0 = x => ar(Math.round(x * 100)) + '٪';
  function ppKid(k) {
    const d = HS.profileData(k.id), units = Object.keys(window.UNITS || {}), isKg = k.grade === 'kg' || !k.grade;
    const ur = units.map(u => APPS.unit.report(u, k.id)).filter(r => r && (r.answered || r.labs.length));
    const kg = APPS.kg ? APPS.kg.report(k.id).filter(g => g.c + g.w) : [];
    const dr = APPS.dict ? APPS.dict.report(k.id) : null, dOn = dr && (dr.seen || dr.ar.seen || dr.spell.en || dr.spell.ar);
    const waits = HS.orders(k.id).filter(o => o.st === 'wait'), goal = HS.goal(k.id), guest = k.id === 'guest';
    const focus = k.grade ? focusChoices(k.grade).filter(c => HS.focusOf(k).includes(c.id)) : [];
    const last = d.days.length ? d.days[d.days.length - 1] : '';
    const fig = (n, l, cls = '') => `<div class="pp-fig ${cls}"><b>${n}</b><span>${l}</span></div>`;
    // what needs the parent now: gifts to hand over, a missing grade, the next lesson to study
    const todo = [
      ...waits.map(o => `<div class="pp-todo gift"><span class="em">${HS.rewardArt(o)}</span><span class="tx"><b>${esc(o.name)}</b><small>اشتراها ${fmtDate(o.t)} بـ ${o.u === 'dia' ? '💎' : '⭐'} ${ar(o.cost)}. أعطه إياها قريبًا، فالمكافأة المتأخرة يضعف أثرها.</small></span>
        <span class="pp-todo-b"><button type="button" class="p-btn" data-ord="${k.id}|${o.id}|done">✅ أعطيته</button><button type="button" class="p-btn sec" data-ord="${k.id}|${o.id}|back">↩️ إرجاع الماسات</button></span></div>`),
      ...(!guest && !k.grade ? [`<div class="pp-todo"><span class="em">🎒</span><span class="tx"><b>اختر صفّ ${esc(k.name)}</b><small>حتى تظهر له مواد صفّه في الصفحة الرئيسية.</small></span><span class="pp-todo-b"><button type="button" class="p-btn" data-setup="${k.id}">اختر الصف</button></span></div>`] : []),
      ...ur.filter(r => r.next).slice(0, 2).map(r => `<div class="pp-todo"><span class="em">➡️</span><span class="tx"><b>${r.next}</b><small>${r.em} ${r.title}</small></span></div>`)
    ];
    const unit = r => `<article class="pp-card pp-unit"><header><h4>${r.em} ${r.title}</h4><b class="pp-big">${pct0(r.total)}</b></header>${meter(r.total)}<p class="pp-cap">إتقان الوحدة · أجاب عن ${ar(r.answered)} من ${ar(r.count)} سؤالًا</p>
      <div class="pp-ls">${r.lessons.map(L => `<div class="pp-l"><span>${L.em} ${L.title}</span><span class="pp-lbar"><i style="width:${Math.max(2, Math.round(L.m * 100))}%"></i></span><b>${pct0(L.m)}</b></div>`).join('')}</div>
      ${r.learn ? `<div class="pp-learn"><div class="pp-kv"><span>صح من أول محاولة</span><b>${pct0(r.learn.first)}</b></div><div class="pp-kv"><span>صحّح بعد تلميح</span><b>${ar(r.learn.fixed)}</b></div><div class="pp-kv"><span>رأى الإجابة بعد ٣ محاولات</span><b>${ar(r.learn.revealed)}</b></div><div class="pp-kv"><span>تلميحات</span><b>${ar(r.learn.hints)}</b></div>
        ${r.lessons.some(L => L.n) ? `<details><summary>تفصيل الدروس</summary><table class="pp-t"><thead><tr><th>الدرس</th><th>صح من أول مرة</th><th>الإتقان</th></tr></thead><tbody>${r.lessons.filter(L => L.n).map(L => `<tr><td>${L.em} ${L.title}</td><td>${pct0(L.first)} <small>(${ar(L.n)})</small></td><td>${pct0(L.m)}</td></tr>`).join('')}</tbody></table></details>` : ''}
        ${r.mis.length ? `<details><summary>🧩 أفكار خاطئة يكرّرها (${ar(r.mis.length)})</summary><ul>${r.mis.map(x => `<li>${x.q}<br><small>اختار: «${x.chose}»${x.n > 1 ? ` (${ar(x.n)} مرات)` : ''} · الصحيح: «${x.right}»</small></li>`).join('')}</ul></details>` : ''}</div>` : ''}
      ${r.missed.length ? `<details><summary>⚠️ أكثر ما يخطئ فيه (${ar(r.missed.length)})</summary><ul>${r.missed.map(m => `<li>${m.q} <small>(أخطأ ${ar(m.w)} · أصاب ${ar(m.c)})</small></li>`).join('')}</ul></details>` : ''}
      ${(r.labs || []).map(x => `<p class="pp-cap">🧪 ${x.title}: أنهى ${ar(x.done.length)} من ${ar(x.total)} · توقّع صحيح ${ar(x.predOk)} من ${ar(x.pred)} · فسّر من أول مرة ${ar(x.whyFirst)} من ${ar(x.why)}</p>`).join('')}
      ${r.best.final || r.best.speed ? `<p class="pp-cap">${r.best.final ? `🏆 الاختبار الشامل: ${ar(r.best.final.s)} من ${ar(r.best.final.t)}` : ''}${r.best.final && r.best.speed ? ' · ' : ''}${r.best.speed ? `⚡ تحدّي السرعة: ${ar(r.best.speed.s)}` : ''}</p>` : ''}</article>`;
    return `<section class="pp-kidv" aria-label="${esc(k.name)}">
      <div class="pp-prof"><span class="pp-av" style="background:${HS.kidColor(k)}">${HS.avatar(k)}</span>
        <div class="pp-who"><h2 class="nm">${esc(k.name)}</h2>
          ${guest ? '' : `<div class="pp-focus"><span class="pp-chip grade">${k.grade ? gradeName(k.grade) : 'بدون صف'}</span>${focus.map(c => `<span class="pp-chip">💎 ${c.name}</span>`).join('')}<button type="button" class="pp-link" data-setup="${k.id}">تعديل الصف والمواد</button></div>`}</div>
        <div class="pp-figs">${fig('💎 ' + ar(HS.diamonds(k.id)), 'ماسات للصرف')}${fig('⭐ ' + ar(HS.yellow(k.id)), 'نجمات')}${fig('🔥 ' + ar(HS.dayStreak(k.id)), 'أيام متتالية')}${fig('📅 ' + ar(d.days.length), last ? 'أيام تعلّم · آخرها ' + fmtDate(Date.parse(last)) : 'أيام تعلّم')}</div></div>
      ${todo.length ? `<h3 class="pp-h">يحتاجك الآن</h3><div class="pp-todos">${todo.join('')}</div>` : ''}
      <h3 class="pp-h">التقدّم</h3>
      ${!ur.length && !kg.length && !dOn ? `<div class="pp-card pp-empty"><span class="em">🌱</span><p>لم يبدأ ${esc(k.name)} بعد. أول نشاط يلعبه سيظهر هنا: الإتقان، وما يخطئ فيه، والدرس التالي.</p></div>` : ''}
      <div class="pp-grid">${ur.map(unit).join('')}
        ${dOn ? `<article class="pp-card"><header><h4>📖 قاموسي</h4><b class="pp-big">${pct0(dr.acc)}</b></header>${meter(dr.learned / Math.max(1, dr.seen))}<p class="pp-cap">صحّ في التدريب</p>
          <div class="pp-kv"><span>كلمات تعلّمها</span><b>${ar(dr.learned)}</b></div><div class="pp-kv"><span>تدرّب عليها</span><b>${ar(dr.seen)}</b></div><div class="pp-kv"><span>في «كلماتي»</span><b>${ar(dr.mine)}</b></div>
          ${dr.ar.seen ? `<div class="pp-kv"><span>📝 عربي: كتبها من ذاكرته</span><b>${ar(dr.ar.learned)} من ${ar(dr.ar.seen)}</b></div>` : ''}
          ${dr.spell && (dr.spell.en || dr.spell.ar) ? `<div class="pp-kv"><span>✍️ أتقن في الإملاء</span><b>${ar(dr.spell.en)}${dr.spell.ar ? ' + ' + ar(dr.spell.ar) + ' عربية' : ''}</b></div><div class="pp-kv"><span>أطول سلسلة</span><b>${ar(dr.spell.best)}</b></div>` : ''}
          <p class="pp-cap">«تعلّمها» = كتبها صحيحة من ذاكرته في أكثر من مراجعة متباعدة.</p></article>` : ''}
        ${kg.length ? `<article class="pp-card"><header><h4>🔤 ألعاب الروضة</h4></header><table class="pp-t"><thead><tr><th>اللعبة</th><th>المستوى</th><th>صح من أول مرة</th></tr></thead><tbody>${kg.map(g => `<tr><td>${g.name}</td><td>${g.max > 3 ? ar(g.lv || 1) + ' / ' + ar(g.max) : '⭐'.repeat(g.lv || 1)}</td><td>${pct0(g.c / (g.c + g.w))} <small>(${ar(g.c + g.w)})</small></td></tr>`).join('')}</tbody></table></article>` : ''}
      </div>
      ${!guest && shopOn() ? `<h3 class="pp-h">التشجيع</h3><div class="pp-card pp-gift"><p class="pp-goal">${goal ? `🎯 يجمع لـ <b>${esc(goal.em)} ${esc(goal.name)}</b>: ${ar(HS.stars(k.id))} من ${ar(goal.cost)} 💎` : '🎯 لم يختر هدفًا من المتجر بعد'}</p>
        <form class="pp-gift-f" data-gift="${k.id}"><span class="pp-rl"><b>🎁 ماسات مفاجأة</b><small>المفاجأة لا تُضعف حبّ التعلّم مثل المكافأة الموعودة. امدح بها جهدًا محددًا.</small></span>
          <div class="pp-gift-in"><select aria-label="عدد الماسات">${[5, 10, 20, 50].map(n => `<option value="${n}">💎 ${ar(n)}</option>`).join('')}</select>
          <input maxlength="60" placeholder="رسالة قصيرة: فخور فيك لأنك ساعدت أختك" aria-label="رسالة"><button type="submit" class="p-btn">أرسل</button></div></form></div>` : ''}
      ${APPS.kg && isKg && !guest ? kgLevels(k.id) : ''}
      ${guest ? '' : `<div class="pp-quiet"><button type="button" class="pp-link" data-ren="${k.id}">✏️ تعديل الاسم</button>
        <button type="button" class="pp-link" data-reset="${k.id}">${confirmKey === 'r' + k.id ? '⚠️ اضغط مرة ثانية لمسح كل التقدّم' : '🔄 مسح التقدّم'}</button>
        <button type="button" class="pp-link danger" data-del="${k.id}">${confirmKey === 'd' + k.id ? '⚠️ اضغط مرة ثانية للحذف' : '🗑️ حذف الطفل'}</button></div>`}
    </section>`;
  }
  function ppShop() {
    return `<section class="pp-pane">
      <div class="pp-card pp-list">${sw('ppShop', shopOn(), 'إظهار متجر الهدايا للأطفال', 'يشترون الهدايا بالماس 💎 الذي يجمعونه في المواد الصعبة')}</div>
      ${HS.ideas().length ? `<h3 class="pp-h">💡 أفكار اقترحها الأطفال</h3><div class="pp-card pp-ideas">${HS.ideas().map(i => `<div class="pp-idea"><span>${esc(i.name)}: «${esc(i.text)}»</span><button type="button" class="p-btn sec" data-idea-add="${i.id}">＋ للمتجر</button><button type="button" class="pp-x" data-idea-del="${i.id}" aria-label="حذف">✕</button></div>`).join('')}</div>` : ''}
      <h3 class="pp-h">الهدايا والأسعار</h3>
      <p class="pp-cap">«لمن» يجعل الهدية لطفل واحد، لأن الروضة والصف الرابع يجمعون بسرعات مختلفة. «في الأسبوع» = أكثر عدد يشتريه في ٧ أيام. تحت كل هدية: كم يومًا يحتاج كل طفل تقريبًا.</p>
      <div class="pp-rw">${HS.rewards().map((r, i) => `<div class="pp-rw-row" data-i="${i}">
          <input class="em" value="${esc(r.em)}" maxlength="4" aria-label="الرمز"><input class="nm" value="${esc(r.name)}" maxlength="40" aria-label="الهدية">
          <label class="pp-f"><span>💎 السعر</span><input class="ct" type="number" min="1" max="9999" inputmode="numeric" value="${r.cost}"></label>
          <label class="pp-f"><span>لمن</span><select class="fr">${[['', 'الكل'], ...HS.profiles().map(p => [p.id, p.name])].map(([v, t]) => `<option value="${v}" ${(r.for || '') === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
          <label class="pp-f"><span>في الأسبوع</span><input class="wk" type="number" min="0" max="50" inputmode="numeric" value="${r.week || ''}" placeholder="بلا حد"></label>
          <button type="button" class="pp-x" data-rdel="${i}" aria-label="حذف ${esc(r.name)}">✕</button>
          <small class="pp-days">${daysHint(r)}</small></div>`).join('')}</div>
      <div class="pp-actions"><button type="button" class="p-btn" id="ppRSave">💾 حفظ الهدايا</button><button type="button" class="p-btn sec" id="ppRAdd">＋ هدية جديدة</button></div>
      <details class="pp-card pp-how"><summary>💡 كيف تجعل المتجر ينجح؟ (من الأبحاث)</summary><ul>
        <li><b>أسعار صغيرة ومتوسطة وكبيرة:</b> أول هدية يجب أن يصل لها خلال يوم أو يومين، وإلا يفقد الحماس.</li>
        <li><b>أعطِ الهدية بسرعة:</b> كلما تأخرت بعد الشراء ضعف أثرها. الهدايا المنتظرة تظهر في تبويب كل طفل وعلى القفل في الأعلى.</li>
        <li><b>قلّل هدايا الشاشة:</b> دراسة من جامعة Guelph وجدت أن الأطفال الذين تُستعمل الشاشة مكافأةً لهم يقضون أمامها وقتًا أطول. لذلك عليها حد أسبوعي، والأفضل الوقت معكم والتجارب.</li>
        <li><b>لا تأخذ النجوم عقابًا:</b> النجوم والماسات تُكسب ولا تُسحب.</li>
        <li><b>المدح أولًا:</b> امدح الجهد بكلام محدد، واستعمل الماسات المفاجأة أحيانًا بدل الوعود.</li>
        <li><b>دعهم يقترحون:</b> الطفل يعمل أكثر لهدية اختارها، واقتراحاتهم تظهر هنا.</li></ul></details>
    </section>`;
  }
  function ppSettings(s) {
    const voices = HS.arVoices(), cur = s.arVoice;
    return `<section class="pp-pane">
      <h3 class="pp-h">☁️ الحساب والأجهزة</h3><div class="pp-card pp-sync-card">${syncBox() || '<p class="pp-cap">الحفظ بين الأجهزة غير متاح في هذه النسخة.</p>'}</div>
      <h3 class="pp-h">🔒 القفل</h3>
      <div class="pp-card pp-list"><div class="pp-row"><span class="pp-rl"><b>الرقم السري لصفحة الأب</b><small>حتى لا يغيّر الأطفال المواد أو الأسعار أو يوافقوا على هداياهم بأنفسهم.</small></span>
        <span class="pp-pin"><input id="ppPin" inputmode="numeric" maxlength="8" placeholder="2580" value="${esc(s.pin || '')}" aria-label="الرقم السري" dir="ltr"><button type="button" class="p-btn sec" id="ppPinSave">حفظ</button></span></div></div>
      <h3 class="pp-h">🔊 الصوت</h3>
      <div class="pp-card pp-list">${sw('ppSound', s.sound, 'مؤثرات صوتية عند الإجابة', 'صوت قصير للإجابة الصحيحة والخاطئة')}
        <div class="pp-row"><span class="pp-rl"><b>الأصوات المسجّلة</b><small>${HS.clipCount() ? `${HS.count(HS.clipCount(), ['مقطع', 'مقطعان', 'مقاطع', 'مقطعًا'])} بصوت طبيعي: الروضة والقاموس وشرح الدروس.` : 'لا توجد مقاطع مسجّلة بعد.'}</small></span>
          <span class="pp-row-b"><button type="button" class="p-btn sec" id="ppTestAr">${HS.SPK} عربي</button><button type="button" class="p-btn sec" id="ppTestEn">${HS.SPK} English</button></span></div>
        <details class="pp-row pp-adv"><summary><span class="pp-rl"><b>صوت الجهاز وصانع الأصوات</b><small>لما ليس له مقطع مسجّل</small></span></summary>
          <p class="pp-cap">${voices.length ? 'صوت الجهاز العربي (⭐ = طبيعي):' : 'لا يوجد صوت عربي في هذا الجهاز، فالعربية تُسمع من المقاطع المسجّلة فقط.'}</p>
          ${voices.length ? `<select id="ppVoice" aria-label="صوت الجهاز العربي">${voices.map(v => `<option value="${esc(v.name)}" ${cur === v.name ? 'selected' : ''}>${esc(v.name)}${HS.isGoodVoice(v) ? ' ⭐' : ''}</option>`).join('')}</select>` : ''}
          <p class="pp-cap"><a href="voice-maker.html" target="_blank" rel="noopener">🎙️ صانع الأصوات</a>: يسجّل الجمل الجديدة بصوت ElevenLabs، ثم ترسل الملف لـ Claude.</p></details></div>
      <h3 class="pp-h">🧸 الروضة</h3>
      <div class="pp-card pp-list"><div class="pp-row"><span class="pp-rl"><b>وقت اللعب في اليوم</b><small>بعده تظهر شاشة «وقت الاستراحة». منظمة الصحة العالمية تنصح بساعة شاشة كحد أقصى يوميًا لعمر ٢–٤ سنوات، والأقل أفضل.</small></span>
        <select id="ppMin" aria-label="وقت الروضة">${[[10, '١٠ دقائق'], [15, '١٥ دقيقة'], [20, '٢٠ دقيقة'], [30, '٣٠ دقيقة'], [0, 'بدون حد']].map(([v, t]) => `<option value="${v}" ${(s.kgMinutes === undefined ? 15 : s.kgMinutes) === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <details class="pp-row pp-adv"><summary><span class="pp-rl"><b>🧠 العب معها: أسئلة لألعاب «نفكّر»</b><small>تحويل اللعبة إلى حديث في البيت</small></span></summary><ul>
          <li><b>🧩 الأحجية:</b> «وين تروح هذي القطعة؟ فوق ولا تحت؟» ثم جرّبوا أحجية حقيقية من الكرتون.</li>
          <li><b>🔺 ركّبي الشكل:</b> «أي شكل يصير سقف البيت؟» ثم ابنوا نفس الشكل بالمكعبات أو قصاصات ورق.</li>
          <li><b>🧭 أين أضعها؟:</b> «حطّي الدبدوب تحت الطاولة… خلف الكرسي… بين المخدتين».</li>
          <li><b>🤖 الروبوت:</b> كوني أنتِ الروبوت! تعطيك أوامر «خطوة قدّام، لفّي» حتى توصلين للهدف.</li>
          <li><b>📖 القصة:</b> اطلب منها تحكي القصة بكلماتها: «أولًا… بعدين… وفي الآخر…».</li></ul></details></div>
    </section>`;
  }
  function parent() {
    const kids = HS.profiles().length ? HS.profiles() : [{ id: 'guest', name: 'ضيف', avatar: '🙂', color: 'var(--t-blue)' }];
    const s = HS.settings(), waitN = id => HS.orders(id).filter(o => o.st === 'wait').length;
    // which tab: the last one picked; else a child with a gift waiting; else the child using this device
    const valid = t => t === 'shop' || t === 'settings' || kids.some(k => 'k:' + k.id === t);
    if (!valid(ptab)) { const w = kids.find(k => waitN(k.id)), me = HS.current(); ptab = 'k:' + (w || (me && kids.find(k => k.id === me.id)) || kids[0]).id; }
    const tab = (id, inner, n) => `<button type="button" role="tab" class="pp-tab ${ptab === id ? 'on' : ''}" aria-selected="${ptab === id}" data-ptab="${id}">${inner}${n ? `<span class="pp-badge" aria-label="${ar(n)} بانتظارك">${ar(n)}</span>` : ''}</button>`;
    const kid = kids.find(k => 'k:' + k.id === ptab);
    P.innerHTML = `<div class="pp-page">
      <header class="pp-top"><h1 class="pp-title">صفحة الأب</h1><p class="pp-sub">تقدّم كل طفل، وما يحتاج منك الآن، والهدايا والإعدادات.</p>
        <nav class="pp-tabs" role="tablist" aria-label="أقسام صفحة الأب">
          ${kids.map(k => tab('k:' + k.id, `<span class="pp-tav" style="background:${HS.kidColor(k)}">${HS.avatar(k)}</span><span>${esc(k.name)}</span>`, waitN(k.id))).join('')}
          <span class="pp-tsep" aria-hidden="true"></span>
          ${tab('shop', '<span class="pp-tic" aria-hidden="true">🎁</span><span>الهدايا</span>')}${tab('settings', '<span class="pp-tic" aria-hidden="true">⚙️</span><span>الإعدادات</span>')}</nav></header>
      <div class="pp-body" role="tabpanel">${kid ? ppKid(kid) : ptab === 'shop' ? ppShop() : ppSettings(s)}</div></div>`;
    const $ = id => document.getElementById(id), on = (id, ev, f) => { const el = $(id); if (el) el[ev] = f; };
    P.querySelectorAll('[data-ptab]').forEach(b => b.onclick = () => { ptab = b.dataset.ptab; confirmKey = ''; parent(); const t = P.querySelector('.pp-tabs'); if (t && t.getBoundingClientRect().top < 0) t.scrollIntoView({ block: 'start' }); });
    P.querySelectorAll('[data-setup]').forEach(b => b.onclick = () => { const k = HS.profiles().find(x => x.id === b.dataset.setup);
      setupGo({ step: 'grade', who: 'parent', pid: k.id, grade: k.grade, focus: HS.focusOf(k).slice(), from: 'parent' }); });
    P.querySelectorAll('[data-kglv]').forEach(sel => sel.onchange = () => {
      const [pid, k] = sel.dataset.kglv.split('|'); APPS.kg.setLevel(pid, k, +sel.value); HS.toast('✓ تم حفظ المستوى');
    });
    P.querySelectorAll('[data-ren]').forEach(b => b.onclick = () => {
      const k = HS.profiles().find(x => x.id === b.dataset.ren); const sec = P.querySelector('.pp-who .nm');
      sec.innerHTML = `<form class="p-inline"><input value="${esc(k.name)}" maxlength="20" aria-label="الاسم الجديد"><button type="submit" class="p-btn">حفظ</button></form>`;
      const f = sec.querySelector('form'); f.querySelector('input').focus();
      f.onsubmit = e => { e.preventDefault(); const v = f.querySelector('input').value.trim(); if (v) HS.updateProfile(k.id, { name: v }); parent(); };
    });
    P.querySelectorAll('[data-reset]').forEach(b => b.onclick = () => { const k = 'r' + b.dataset.reset; if (confirmKey === k) { HS.resetProgress(b.dataset.reset); confirmKey = ''; } else confirmKey = k; parent(); });
    P.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const k = 'd' + b.dataset.del; if (confirmKey === k) { HS.removeProfile(b.dataset.del); confirmKey = ''; ptab = ''; } else confirmKey = k; parent(); });
    P.querySelectorAll('[data-ord]').forEach(b => b.onclick = () => { const [k, o, how] = b.dataset.ord.split('|'); HS.settleOrder(k, o, how); HS.toast(how === 'done' ? '✅ تم' : '↩️ رجعت الماسات'); parent(); });
    P.querySelectorAll('[data-gift]').forEach(f => f.onsubmit = e => { e.preventDefault(); const n = +f.querySelector('select').value, m = f.querySelector('input').value.trim();
      HS.gift(f.dataset.gift, n, m); HS.toast(`🎁 أُرسلت 💎 ${ar(n)}، ستظهر له كمفاجأة`); parent(); });
    // gifts tab
    on('ppShop', 'onchange', e => HS.setSetting('shop', e.target.checked));
    const readRw = () => [...P.querySelectorAll('.pp-rw-row')].map((row, i) => { const r = { id: HS.rewards()[i] ? HS.rewards()[i].id : 'r' + Date.now().toString(36) + i,
      em: row.querySelector('.em').value.trim() || '🎁', name: row.querySelector('.nm').value.trim(), cost: Math.max(1, Math.round(+row.querySelector('.ct').value || 1)) };
      const fr = row.querySelector('.fr').value, wk = Math.round(+row.querySelector('.wk').value || 0); if (fr) r.for = fr; if (wk > 0) r.week = wk; return r; }).filter(r => r.name);
    P.querySelectorAll('[data-idea-add]').forEach(b => b.onclick = () => { const i = HS.ideas().find(x => x.id === b.dataset.ideaAdd); const l = readRw();
      l.push({ id: 'r' + Date.now().toString(36), em: '💡', name: i.text, cost: 50 }); HS.setSetting('rewards', l); HS.setSetting('ideas', HS.ideas().filter(x => x !== i)); HS.toast('أُضيفت. عدّل السعر ثم احفظ'); parent(); });
    P.querySelectorAll('[data-idea-del]').forEach(b => b.onclick = () => { HS.setSetting('ideas', HS.ideas().filter(x => x.id !== b.dataset.ideaDel)); parent(); });
    on('ppRSave', 'onclick', () => { HS.setSetting('rewards', readRw()); HS.toast('💾 تم حفظ الهدايا'); parent(); });
    on('ppRAdd', 'onclick', () => { const l = readRw(); l.push({ id: 'r' + Date.now().toString(36), em: '🎁', name: 'هدية جديدة', cost: 50 }); HS.setSetting('rewards', l); parent();
      const rows = P.querySelectorAll('.pp-rw-row .nm'); const last = rows[rows.length - 1]; if (last) { last.focus(); last.select(); } });
    P.querySelectorAll('[data-rdel]').forEach(b => b.onclick = () => { const l = readRw(); l.splice(+b.dataset.rdel, 1); HS.setSetting('rewards', l); parent(); });
    // settings tab
    on('ppPinSave', 'onclick', () => { const v = $('ppPin').value.trim(); if (!/^\d{4,8}$/.test(v)) { HS.toast('اكتب ٤ أرقام على الأقل'); HS.fx('no'); return; } HS.setSetting('pin', v); try { sessionStorage.setItem('hs-pin', '1'); } catch (e) {} HS.toast('🔒 تم حفظ الرقم السري'); });
    bindSync();
    on('ppMin', 'onchange', e => HS.setSetting('kgMinutes', +e.target.value));
    on('ppSound', 'onchange', e => HS.setSetting('sound', e.target.checked));
    on('ppVoice', 'onchange', e => { HS.setSetting('arVoice', e.target.value); HS.speak([['ألف. أرنب', 'ar']]); });
    on('ppTestAr', 'onclick', () => HS.speak([['ألف. أرنب. باء. بطة', 'ar']]));
    on('ppTestEn', 'onclick', () => HS.speak([['A is for Apple', 'en']]));
  }

  /* ---------- router ---------- */
  // addresses from the first single-unit pages (old links saved on the kids' devices) → new pages
  const LEGACY = { l1: 'l1', l2: 'l2', l3: 'l3', cards: 'cards', games: 'play', quiz: 'test' };
  // the address #app-kg is also the id of the app's box, so the browser jumps down to it: keep pages at the top
  const unjump = () => { if (document.getElementById((location.hash || '').slice(1))) requestAnimationFrame(() => window.scrollTo(0, 0)); };
  window.addEventListener('load', unjump);
  function route() {
    unjump();
    let h = (location.hash || '#home').slice(1);
    const jm = h.match(/^join-([A-Za-z0-9]{12})$/);
    if (jm && HS.sync) {   // a join link from another device: join this family, then go home (the code leaves the address bar)
      try { history.replaceState(null, '', '#home'); } catch (e) {}
      HS.sync.join(jm[1]).then(() => HS.toast('✅ هذا الجهاز صار متزامنًا مع العائلة')).catch(() => {}); h = 'home';
    }
    if (LEGACY[h]) { h = 'unit-g4scieco-' + LEGACY[h]; try { history.replaceState(null, '', '#' + h); } catch (e) {} }
    let m;
    closeMenu();
    if ((m = h.match(/^app-([a-z0-9]+)(?:-(.+))?$/i)) && APPS[m[1]]) { openApp(m[1], m[2] || ''); return bar(h); }
    if ((m = h.match(/^unit-([a-z0-9]+)(?:-(.+))?$/i)) && APPS.unit && window.UNITS && UNITS[m[1]]) { openApp('unit', m[1] + (m[2] ? '-' + m[2] : '')); return bar(h); }
    closeApp(); confirmKey = '';
    const draw = r => { if (r !== h) { try { history.replaceState(null, '', '#' + r); } catch (e) {} } bar(r); };
    if (h === 'parent') { showScreen('portal'); draw('parent'); return gate(() => { parentFirst(); pageBg('bg-parent'); }); }
    if (h === 'setup') { showScreen('portal'); draw('setup'); setup(); return pageBg('bg-setup'); }
    pageBg(null);
    if (h === 'who') { showScreen('portal'); draw('who'); return who(); }
    if (h === 'explore') { showScreen('portal'); draw('explore'); explore(); return pageBg('bg-explore'); }
    if (h !== 'shop') buying = '';
    if (h === 'shop') { showScreen('portal'); if (shopOn()) { draw('shop'); shop(); return pageBg('bg-shop'); } draw('home'); return home(); }
    showScreen('portal');
    if ((m = h.match(/^y-(\w+)$/))) {
      const y = CATALOG.find(x => x.id === m[1]); if (!y) { draw('home'); return home(); }
      draw(h);
      P.innerHTML =         `<div class="p-head">${tile(y)}<div><h1 class="p-title">${y.name}</h1><p class="p-sub">اختر المادة</p></div></div><div class="p-grid">${
          y.subjects.map(s => card(s, navOf(s) || `s-${y.id}-${s.id}`)).join('')}</div>`;
      pageBg('bg-grade-' + y.id);
    } else if ((m = h.match(/^s-(\w+)-(\w+)$/))) {
      const y = CATALOG.find(x => x.id === m[1]); const s = y && y.subjects.find(x => x.id === m[2]);
      if (!s || !s.units) { draw('home'); return home(); }
      draw(h);
      P.innerHTML =         `<div class="p-head">${tile(s)}<div><h1 class="p-title">${s.name}</h1><p class="p-sub">اختر الوحدة</p></div></div><div class="p-grid">${
          s.units.map(u => card(u, navOf(u))).join('')}</div>`;
      pageBg('bg-subj-' + s.id);
    } else { draw('home'); home(); }
  }

  document.addEventListener('click', e => {
    const mb = e.target.closest('#gbMenuBtn');
    if (mb) { menuOpen = !menuOpen; const m = document.getElementById('gbMenu'); m.hidden = !menuOpen; mb.setAttribute('aria-expanded', menuOpen); if (menuOpen) { const f = m.querySelector('button'); if (f) f.focus(); } return; }
    if (menuOpen && !e.target.closest('#gbMenu')) closeMenu();
    const el = e.target.closest('.gb-ell');
    if (el) { const nav = el.closest('.gb-crumbs'); nav.classList.add('open'); el.setAttribute('aria-expanded', 'true'); const a = nav.querySelector('li.mid a'); if (a) a.focus(); return; }
    const mu = e.target.closest('[data-mute]');
    if (mu) { HS.setMute(!HS.muted()); if (!HS.muted()) HS.fx('tap'); return; }
    const lg = e.target.closest('[data-lang-ui]');
    if (lg) { HS.setLang(lg.dataset.langUi); return route(); }
    const b = e.target.closest('[data-nav]');
    if (b) { e.preventDefault(); if (('#' + b.dataset.nav) === location.hash) route(); else location.hash = b.dataset.nav; }
  });
  window.addEventListener('hashchange', route);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) closeMenu(true); });
  HS.on('mute', m => document.querySelectorAll('[data-mute]').forEach(b => { b.setAttribute('aria-pressed', m); b.setAttribute('aria-label', HS.tr(m ? 'تشغيل الصوت' : 'كتم الصوت')); b.innerHTML = m ? I.off : I.on; }));
  HS.trWatch();
  HS.picify(document.getElementById('portal'), ['dict', 'kg', 'sci']); HS.picify(document.getElementById('appbar'), ['dict', 'kg', 'sci']);   // emoji → pictures here too
  route();
})();
