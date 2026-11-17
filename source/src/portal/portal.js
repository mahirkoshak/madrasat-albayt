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
    on: svg('M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11'), off: svg('M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5') };
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
        ${named && shopOn() ? `<button type="button" class="gb-btn gb-stars" data-nav="shop" aria-label="متجر النجوم: عندك ${ar(HS.stars())} نجمة">⭐ <b id="barStars">${ar(HS.stars())}</b></button>` : ''}
        <div class="gb-menu"><button type="button" class="gb-btn gb-me" id="gbMenuBtn" aria-expanded="${menuOpen}" aria-controls="gbMenu" aria-label="القائمة: ${named ? esc(me.name) : 'ضيف'}">${who}<span class="gb-caret" aria-hidden="true">▾</span></button>
          <div class="gb-pop" id="gbMenu" ${menuOpen ? '' : 'hidden'}>
            <p class="gb-pop-h">${named ? `يتعلّم الآن: <b class="nm">${esc(me.name)}</b>` : 'تتعلّم الآن كضيف: التقدّم لا يُحفظ باسم طفل'}</p>
            <button type="button" data-nav="home" data-menu>🏠 الرئيسية</button>
            <button type="button" data-nav="home" data-menu>👧 ${HS.profiles().length ? 'تبديل الطفل أو إضافة طفل' : 'إضافة طفل'}</button>
            ${named && shopOn() ? '<button type="button" data-nav="shop" data-menu>⭐ متجر النجوم</button>' : ''}
            <button type="button" data-nav="parent" data-menu>👨‍👩‍👧 صفحة الأب</button>
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
  HS.on('stars', () => { const b = document.getElementById('barStars'); if (b) b.textContent = ar(HS.stars()); });

  /* ---------- online sync (Firebase): one family code shared by every device ---------- */
  const SYNC_TXT = { off: 'غير مفعّلة', connecting: '⏳ جاري الاتصال…', on: '✅ متزامن', offline: '📴 بدون إنترنت: يحفظ هنا ويرسل لاحقًا', error: '⚠️ تعذّر الاتصال، سنحاول مرة أخرى' };
  function syncBox() {
    if (!HS.sync || !HS.sync.available()) return '';
    const f = HS.sync.family(), st = HS.sync.status(), t = HS.sync.lastSync();
    return `<h4>☁️ الحفظ أونلاين بين الأجهزة</h4>
      ${f ? `<div class="pp-sync"><p>الحالة: <b id="ppSyncSt">${SYNC_TXT[st] || st}</b>${t ? ` · آخر مزامنة ${new Date(t).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
          <p>كود العائلة: <b class="pp-code" dir="ltr">${HS.sync.pretty()}</b></p>
          <p class="pp-note">على أي جهاز آخر: افتح الموقع ← صفحة الأب ← «انضم بكود العائلة» واكتب الكود، أو افتح رابط الانضمام. الأطفال بنفس الاسم يُدمجون تلقائيًا ولا تضيع النجوم.</p>
          <div class="pp-actions"><button type="button" class="p-btn" id="ppSyncCopy">📋 انسخ رابط الانضمام</button><button type="button" class="p-btn sec" id="ppSyncNow">🔄 زامن الآن</button><button type="button" class="p-btn sec danger" id="ppSyncLeave">${leaving ? 'متأكد؟ اضغط مرة ثانية' : 'إيقاف المزامنة على هذا الجهاز'}</button></div>
          <p class="pp-note">احتفظ بالكود سرًا: من يعرفه يرى تقدّم أطفالك.</p></div>`
        : `<div class="pp-sync"><p class="pp-note">احفظ الأطفال والنجوم والتقدّم أونلاين، لتظهر على كل الأجهزة (آيباد، لابتوب…). يعمل بدون إنترنت أيضًا ويرسل التغييرات عند الاتصال.</p>
          <div class="pp-actions"><button type="button" class="p-btn" id="ppSyncNew">☁️ ابدأ: أنشئ كود عائلة</button></div>
          <form class="pp-actions" id="ppSyncJoin"><input id="ppSyncCode" dir="ltr" maxlength="16" placeholder="XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" aria-label="كود العائلة"><button type="submit" class="p-btn sec">انضم بكود العائلة</button></form>
          <p class="pp-note" id="ppSyncErr"></p></div>`}`;
  }
  let leaving = false;
  function bindSync() {
    const $ = id => document.getElementById(id);
    if ($('ppSyncNew')) $('ppSyncNew').onclick = () => { HS.sync.create().then(parent); setTimeout(parent, 50); };
    if ($('ppSyncJoin')) $('ppSyncJoin').onsubmit = e => { e.preventDefault();
      HS.sync.join($('ppSyncCode').value).then(() => { HS.toast('✅ انضممت للعائلة'); parent(); }).catch(() => { $('ppSyncErr').textContent = 'الكود ١٢ حرفًا ورقمًا، مثل ABCD-EFGH-JKLM'; }); setTimeout(parent, 50); };
    if ($('ppSyncCopy')) $('ppSyncCopy').onclick = () => { const l = HS.sync.joinLink(); (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(() => HS.toast('📋 نُسخ الرابط'), () => HS.toast(l)); };
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
      <div class="big">${HS.art('gift-box', { fb: '🎁' })}</div><h2>مفاجأة!</h2><p class="sh-gift-n">+ ⭐ ${ar(n)}</p>${msgs.map(m => `<p class="sh-gift-m">«${esc(m)}»</p>`).join('')}
      <button type="button" class="p-btn" id="shGiftOk">شكرًا! 💛</button></div></div>`);
    HS.fx('win'); HS.party(); HS.speak([['مفاجأة! حصلت على ' + n + ' نجمة', 'ar']]);
    document.getElementById('shGiftOk').onclick = () => { HS.seeGifts(me.id); document.getElementById('shGift').remove(); route(); };
  }
  function shop() {
    const me = HS.current(), bal = HS.stars(), rs = HS.rewardsFor(), goal = HS.goal(), orders = HS.orders();
    const wait = orders.filter(o => o.st === 'wait'), old = orders.filter(o => o.st !== 'wait').slice(-5).reverse();
    const state = r => { const c = HS.cantBuy(r); return c === 'week' ? `<span class="sh-need">✋ خلصت هذا الأسبوع (${ar(HS.boughtWeek(r.id))}/${ar(r.week)})</span>`
      : c === 'stars' ? `<span class="sh-need">باقي ⭐ ${ar(r.cost - bal)}</span>`
      : `<button type="button" class="p-btn ${buying === r.id ? 'warn' : ''}" data-buy="${r.id}">${buying === r.id ? 'متأكد؟ اضغط مرة ثانية ✅' : 'اشترِ'}</button>`; };
    P.innerHTML = `<div class="sh-head">${me ? `<span class="p-kid-av" style="background:${HS.kidColor(me)}">${HS.avatar(me)}</span>` : ''}
        <div><h2 class="p-title">🛒 متجر النجوم</h2><p class="sh-bal">عندك <b>⭐ ${ar(bal)}</b></p></div></div>
      ${wait.length ? `<h3 class="sh-h">🎟️ كوبوناتك: اعرضها على بابا أو ماما</h3><div class="sh-coupons">${wait.map(o => `<div class="sh-coupon"><span class="em">${HS.rewardArt(o)}</span><div><b>${esc(o.name)}</b><small>اشتريتها ${fmtDate(o.t)} · ⭐ ${ar(o.cost)}</small></div><span class="sh-stamp">ينتظر</span></div>`).join('')}</div>` : ''}
      ${goal ? `<div class="sh-goal"><span class="em">${HS.rewardArt(goal)}</span><div class="sh-goal-tx"><small>🎯 هدفك</small><b>${esc(goal.name)}</b>
          <div class="hs-meter ${bal >= goal.cost ? '' : 'mid'}"><i style="width:${pct(bal, goal.cost)}%"></i></div>
          <span>${bal >= goal.cost ? '🎉 تقدر تشتريه الآن!' : `⭐ ${ar(bal)} من ${ar(goal.cost)} · باقي ${ar(goal.cost - bal)}`}</span></div>
          <button type="button" class="sh-x" data-goal="" aria-label="إلغاء الهدف">✕</button></div>`
        : `<p class="sh-tip">🎯 اختر مكافأة واضغط «🎯 هدفي» لتجمع لها النجوم.</p>`}
      <div class="sh-grid">${rs.map(r => { const c = HS.cantBuy(r), isGoal = goal && goal.id === r.id;
        return `<div class="sh-card ${c ? '' : 'can'} ${isGoal ? 'goal' : ''}" data-say="${r.id}"><span class="em">${HS.rewardArt(r)}</span><b>${esc(r.name)}</b><span class="sh-price">⭐ ${ar(r.cost)}</span>
          <div class="hs-meter ${c ? 'mid' : ''}"><i style="width:${pct(bal, r.cost)}%"></i></div>${state(r)}
          ${r.week ? `<small class="sh-lim">حتى ${ar(r.week)} في الأسبوع</small>` : ''}
          ${isGoal ? '' : `<button type="button" class="sh-goalbtn" data-goal="${r.id}">🎯 هدفي</button>`}</div>`; }).join('') || `<div class="p-empty">${HS.mascot('point', { small: true, fb: '' })}<p>لا توجد مكافآت بعد. اطلبها من بابا أو ماما.</p></div>`}</div>
      <div class="sh-idea">${ideaOpen ? `<form class="p-inline" id="shIdeaF"><input id="shIdea" maxlength="60" placeholder="مثال: رحلة إلى البحر" aria-label="فكرتك"><button type="submit" class="p-btn">أرسل</button></form>`
        : `<button type="button" class="p-btn sec" id="shIdeaB">💡 عندي فكرة مكافأة</button>`}</div>
      ${old.length ? `<h3 class="sh-h small">آخر المكافآت</h3><ul class="sh-old">${old.map(o => `<li>${o.em} ${esc(o.name)} · ${o.st === 'done' ? '✅ استلمتها' : '↩️ رجعت النجوم'}</li>`).join('')}</ul>` : ''}`;
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
      HS.speak([[r.name + '. ' + r.cost + ' نجمة. ' + (k === 'stars' ? 'باقي ' + (r.cost - bal) + ' نجمة' : k === 'week' ? 'خلصت هذا الأسبوع' : 'تقدر تشتريها'), 'ar']]); });
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
  /** "who is learning now?": one chip per child (tap to switch), plus "new child" */
  function kidsRow() {
    const list = HS.profiles(), cur = HS.current();
    if (!list.length) return `<div class="p-kids"><button type="button" class="p-kid add" id="pNew" aria-expanded="${adding}"><span class="p-kid-av">＋</span><span class="p-kid-n">أضف طفلًا</span></button>${adding ? avForm(list) : ''}</div>`;
    return `<div class="p-kids"><h2 class="p-kids-t">من يتعلّم الآن؟</h2><div class="p-chips">${list.map(p => { const on = !!(cur && cur.id === p.id);
        return `<button type="button" class="p-kid ${on ? 'on' : ''}" data-kid="${p.id}" aria-pressed="${on}"><span class="p-kid-av" style="background:${HS.kidColor(p)}">${HS.avatar(p)}</span><span class="p-kid-n nm">${esc(p.name)}</span><span class="p-kid-s">⭐ ${ar(HS.stars(p.id))}${HS.dayStreak(p.id) ? ` · 🔥 ${ar(HS.dayStreak(p.id))}` : ''}</span></button>`; }).join('')}
      <button type="button" class="p-kid add" id="pNew" aria-expanded="${adding}"><span class="p-kid-av">＋</span><span class="p-kid-n">طفل جديد</span></button></div>${adding ? avForm(list) : ''}</div>`;
  }
  function bindPicker() {
    P.querySelectorAll('[data-kid]').forEach(b => b.onclick = () => { HS.setCurrent(b.dataset.kid); home(); });
    const nw = document.getElementById('pNew'); if (nw) nw.onclick = () => { adding = !adding; home(); if (adding) setTimeout(() => document.getElementById('pName').focus(), 50); };
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
        <h1 id="pHi">${named ? `أهلًا يا <span class="nm">${esc(me.name)}</span>` : 'أهلًا بك في مدرسة البيت'}</h1>
        <p class="p-hero-sub">${st ? `🔥 تعلّم متواصل: ${HS.count(st, HS.N.day)}` : 'هيا نتعلّم شيئًا جديدًا اليوم.'}</p>
        ${go ? `<button type="button" class="p-go" data-nav="${go.nav}"><span class="p-go-tile" aria-hidden="true">${HS.art(go.art, { fb: go.em, small: true })}</span>
            <span class="p-go-tx"><small>أكمل من حيث توقفت${go.where ? ` · ${go.where}` : ''}</small><b>${go.name}</b></span><span class="go">${I.fwd}</span></button>` : ''}
      </div>`);
  }
  function today() {
    const r = reviews(), out = [];
    if (r.items.length) out.push(`<section class="p-panel p-review" aria-labelledby="pRv"><h2 id="pRv"><span aria-hidden="true">📅</span> مراجعة اليوم</h2>
        <p>أسئلة أخطأت فيها أو حان وقت تذكّرها:</p><div class="p-rv-list">${r.items.map(i => `<button type="button" class="p-rv" data-nav="${i.nav}"><span>${i.name}</span><b>${HS.count(i.n, i.noun)}</b><span class="go">${I.fwd}</span></button>`).join('')}</div></section>`);
    else if (r.seen) out.push(`<section class="p-panel p-review ok" aria-labelledby="pRv"><h2 id="pRv"><span aria-hidden="true">✅</span> لا توجد مراجعة اليوم</h2><p>كل ما تعلّمته في موعده. جرّب درسًا جديدًا أو اختبارًا.</p></section>`);
    if (shopOn() && HS.current()) out.push(shopButton());
    return out.length ? `<div class="p-today">${out.join('')}</div>` : '';
  }
  function home() {
    let skip = false; try { skip = sessionStorage.getItem('hs-skip') === '1'; } catch (e) {}
    const list = HS.profiles();
    if (!list.length && !skip) {   // first visit: Koko asks who will learn here
      const sc = !!heroScene(), form = `${avForm(list)}<button type="button" class="p-link" id="pSkip">المتابعة بدون إضافة</button>`;
      // with the full scene the form goes in a card below it, so it never covers Koko
      P.innerHTML = heroWrap('p-onb', `<div class="p-hero-tx"><h1 id="pHi">أهلًا! أنا كوكو</h1>
          <p class="p-hero-sub">من سيتعلّم معي؟ أضف كل طفل ليُحفظ تقدّمه ونجومه وأخطاؤه وحده.</p>${sc ? '' : form}</div>`) + (sc ? `<div class="p-onb-form">${form}</div>` : '');
      return bindPicker();
    }
    P.innerHTML = hero() + kidsRow() + today() + `
      <section class="p-sec" aria-labelledby="pGr"><h2 id="pGr" class="p-h2">ماذا نتعلّم اليوم؟</h2>
        <div class="p-grid">${CATALOG.map(y => card(y, y.app ? 'app-' + y.app : 'y-' + y.id)).join('')}</div></section>
      <footer class="p-foot">${HS.sync && HS.sync.family() ? `<p class="p-cloud" id="pCloud">${HS.sync.status() === 'on' ? '☁️ محفوظ أونلاين' : ''}</p>` : ''}<button type="button" class="p-parent" data-nav="parent"><span aria-hidden="true">👨‍👩‍👧</span> صفحة الأب: التقدّم والإعدادات${HS.waitingCount() ? ` <span class="p-badge" aria-label="${ar(HS.waitingCount())} كوبون ينتظر">🎟️ ${ar(HS.waitingCount())}</span>` : ''}</button>
      <p>${HS.sync && HS.sync.family() ? 'التقدّم والنجوم محفوظة على هذا الجهاز وأونلاين' : 'التقدّم والنجوم تُحفظ على هذا الجهاز'} · للصوت افتح الصفحة في Chrome أو Edge أو Safari</p></footer>`;
    bindPicker(); giftPopup();
  }
  function shopButton() {
    const g = HS.goal(), bal = HS.stars(), w = HS.orders().some(o => o.st === 'wait');
    return `<button type="button" class="p-shop" data-nav="shop"><span class="em" aria-hidden="true">${g ? HS.rewardArt(g) : '🛒'}</span><span class="tx"><small>${g ? '🎯 هدفك' : 'متجر النجوم'}</small><b>${g ? esc(g.name) : `عندك ⭐ ${ar(bal)}`}</b>
      ${g ? `<span class="hs-meter ${bal >= g.cost ? '' : 'mid'}"><i style="width:${pct(bal, g.cost)}%"></i></span>` : ''}<span class="p-shop-s">${g ? (bal >= g.cost ? '🎉 تقدر تشتريه الآن!' : `⭐ ${ar(bal)} من ${ar(g.cost)}`) : 'اشترِ مكافأة بنجومك'}${w ? ' · 🎟️ عندك كوبون' : ''}</span></span><span class="go">${I.fwd}</span></button>`;
  }

  /* ---------- parent PIN (optional) ----------
     Stops children from changing prices or approving their own coupons. Asked once per browser session. */
  function gate(next) {
    const pin = HS.settings().pin; let ok = false; try { ok = sessionStorage.getItem('hs-pin') === '1'; } catch (e) {}
    if (!pin || ok) return next();
    P.innerHTML = `<form class="p-form pin" id="pinF"><h2 class="p-title">🔒 صفحة الأب</h2><label for="pinI">الرقم السري</label>
      <input id="pinI" inputmode="numeric" type="password" maxlength="8" autocomplete="off"><button type="submit" class="p-btn">دخول</button><p class="pp-note" id="pinE"></p></form>`;
    const i = document.getElementById('pinI'); i.focus();
    document.getElementById('pinF').onsubmit = e => { e.preventDefault();
      if (i.value === pin) { try { sessionStorage.setItem('hs-pin', '1'); } catch (x) {} next(); }
      else { i.value = ''; document.getElementById('pinE').textContent = 'رقم غير صحيح'; HS.fx('no'); } };
  }

  /* ---------- parent page ---------- */
  const meter = x => `<div class="hs-meter ${x < .4 ? 'low' : x < .8 ? 'mid' : ''}" role="img" aria-label="${Math.round(x * 100)}٪"><i style="width:${Math.max(3, Math.round(x * 100))}%"></i></div>`;
  let confirmKey = '';
  // Kindergarten: the child never sees numbered levels. Difficulty adapts by itself;
  // a parent can move a game to a different starting level here.
  function kgLevels(pid) {
    const cur = (HS.data('kg', pid).lv) || {};
    return `<details class="pp-unit pp-kglv"><summary>🎚️ صعوبة ألعاب الروضة</summary>
      <p class="pp-note">الألعاب تصعب وتسهل تلقائيًا حسب إجابات الطفل. غيّر المستوى هنا فقط إذا كانت لعبة سهلة جدًا أو صعبة جدًا.</p>
      ${APPS.kg.levels().map(g => `<label class="pp-lv"><span>${esc(g.name)}</span><select data-kglv="${pid}|${g.k}" aria-label="مستوى ${esc(g.name)}">${Array.from({ length: g.max }, (_, i) => `<option value="${i + 1}" ${(cur[g.k] || 1) === i + 1 ? 'selected' : ''}>المستوى ${ar(i + 1)} من ${ar(g.max)}</option>`).join('')}</select></label>`).join('')}</details>`;
  }
  function parent() {
    const kids = HS.profiles().length ? HS.profiles() : [{ id: 'guest', name: 'ضيف', avatar: '🙂', color: 'var(--t-blue)' }];
    const units = Object.keys(window.UNITS || {});
    const s = HS.settings(), voices = HS.arVoices(), cur = s.arVoice;
    P.innerHTML = `<h2 class="p-title">👨‍👩‍👧 صفحة الأب</h2><p class="p-sub">تقدّم كل طفل، وما يحتاج مراجعة، والإعدادات.</p>
    ${kids.map(k => {
      const d = HS.profileData(k.id);
      const ur = units.map(u => APPS.unit.report(u, k.id)).filter(r => r && r.answered);
      const kg = APPS.kg ? APPS.kg.report(k.id).filter(g => g.c + g.w) : [];
      const dr = APPS.dict ? APPS.dict.report(k.id) : null;
      return `<section class="pp-kid"><div class="pp-head"><span class="p-kid-av" style="background:${HS.kidColor(k)}">${HS.avatar(k)}</span><div><h3 class="nm">${esc(k.name)}</h3><p>⭐ ${ar(HS.stars(k.id))} للصرف (جمع ${ar(d.stars)}) · ⚡ تقريبًا ${ar(HS.earnRate(k.id))} في اليوم · 🔥 متواصل: ${HS.count(HS.dayStreak(k.id), HS.N.day)} · 📅 تعلّم في ${HS.count(d.days.length, HS.N.day)}${d.days.length ? ` · آخر مرة ${d.days[d.days.length - 1]}` : ''}</p></div></div>
        ${HS.orders(k.id).filter(o => o.st === 'wait').map(o => `<div class="pp-order"><span class="em">${HS.rewardArt(o)}</span><span><b>${esc(o.name)}</b><small>اشتراها ${fmtDate(o.t)} · ⭐ ${ar(o.cost)}</small></span>
          <button type="button" class="p-btn" data-ord="${k.id}|${o.id}|done">✅ أعطيته</button><button type="button" class="p-btn sec" data-ord="${k.id}|${o.id}|back">↩️ إرجاع النجوم</button></div>`).join('')}
        ${shopOn() ? `<div class="pp-gift"><span>${HS.goal(k.id) ? `🎯 يجمع لـ ${esc(HS.goal(k.id).em)} ${esc(HS.goal(k.id).name)} (${ar(HS.stars(k.id))}/${ar(HS.goal(k.id).cost)})` : '🎯 لم يختر هدفًا بعد'}</span>
          <details><summary>🎁 أعطه نجومًا مفاجأة</summary><form class="pp-gift-f" data-gift="${k.id}"><select aria-label="عدد النجوم">${[5, 10, 20, 50].map(n => `<option value="${n}">⭐ ${ar(n)}</option>`).join('')}</select>
            <input maxlength="60" placeholder="رسالة قصيرة، مثال: فخور فيك لأنك ساعدت أختك" aria-label="رسالة"><button type="submit" class="p-btn">أرسل 🎁</button></form>
            <p class="pp-note">المفاجآت التي لا يتوقعها الطفل لا تُضعف حبّه للتعلّم، بعكس المكافأة الموعودة. استعملها لمدح جهد محدد.</p></details></div>` : ''}
        ${!ur.length && !kg.length && !(dr && (dr.seen || dr.ar.seen || dr.spell.en || dr.spell.ar)) ? '<p class="pp-empty">لا يوجد نشاط بعد.</p>' : ''}
        ${ur.map(r => `<div class="pp-unit"><h4>${r.em} ${r.title}</h4><div class="m-row"><span>إتقان الوحدة</span><b>${ar(Math.round(r.total * 100))}٪</b></div>${meter(r.total)}
          <div class="pp-ls">${r.lessons.map(L => `<div class="m-row"><span>${L.em} ${L.title}</span><b>${ar(Math.round(L.m * 100))}٪</b></div>${meter(L.m)}`).join('')}</div>
          ${r.learn ? `<div class="pp-learn"><div class="m-row"><span>صح من أول محاولة</span><b>${ar(Math.round(r.learn.first * 100))}٪</b></div>${meter(r.learn.first)}
            <p class="pp-note">صُحّحت بعد تلميح: ${ar(r.learn.fixed)} مرة · عُرضت الإجابة بعد ٣ محاولات: ${ar(r.learn.revealed)} مرة · تلميحات: ${ar(r.learn.hints)}</p>
            ${r.lessons.some(L => L.n) ? `<table class="pp-t"><thead><tr><th>الفكرة (الدرس)</th><th>صح من أول مرة</th><th>الإتقان</th></tr></thead><tbody>${r.lessons.filter(L => L.n).map(L => `<tr><td>${L.em} ${L.title}</td><td>${ar(Math.round(L.first * 100))}٪ <small>(${ar(L.n)})</small></td><td>${ar(Math.round(L.m * 100))}٪</td></tr>`).join('')}</tbody></table>` : ''}
            ${r.mis.length ? `<details><summary>🧩 أفكار خاطئة تكرّر اختيارها (${ar(r.mis.length)})</summary><ul>${r.mis.map(x => `<li>${x.q}<br><small>الاختيار: «${x.chose}»${x.n > 1 ? ` (${ar(x.n)} مرات)` : ''} · الصحيح: «${x.right}»</small></li>`).join('')}</ul></details>` : ''}
            ${r.next ? `<p class="pp-next">➡️ ${r.next}</p>` : ''}</div>` : ''}
          <p class="pp-note">أجاب عن ${ar(r.answered)} من ${ar(r.count)} سؤالًا${r.best.final ? ` · أفضل نتيجة في الاختبار الشامل ${ar(r.best.final.s)}/${ar(r.best.final.t)}` : ''}${r.best.speed ? ` · تحدّي السرعة ${ar(r.best.speed.s)}` : ''}</p>
          ${r.missed.length ? `<details><summary>⚠️ أكثر ما يخطئ فيه (${ar(r.missed.length)})</summary><ul>${r.missed.map(m => `<li>${m.q} <small>(أخطأ ${ar(m.w)} · أصاب ${ar(m.c)})</small></li>`).join('')}</ul></details>` : ''}</div>`).join('')}
        ${dr && (dr.seen || dr.ar.seen || dr.spell.en || dr.spell.ar) ? `<div class="pp-unit"><h4>📖 قاموسي</h4><div class="m-row"><span>تعلّم ${ar(dr.learned)} كلمة · تدرّب على ${ar(dr.seen)} · في «كلماتي» ${ar(dr.mine)}</span><b>${ar(Math.round(dr.acc * 100))}٪ صح</b></div>${meter(dr.learned / Math.max(1, dr.seen))}${dr.ar.seen ? `<div class="m-row"><span>📝 عربي: كتب ${ar(dr.ar.learned)} كلمة من ذاكرته · تدرّب على ${ar(dr.ar.seen)}</span><b>${ar(Math.round(dr.ar.acc * 100))}٪ صح</b></div>${meter(dr.ar.learned / Math.max(1, dr.ar.seen))}` : ''}${dr.spell && (dr.spell.en || dr.spell.ar) ? `<div class="m-row"><span>✍️ تحدّي الإملاء: أتقن ${ar(dr.spell.en)} كلمة إنجليزية${dr.spell.ar ? ` و${ar(dr.spell.ar)} عربية` : ''} · أطول سلسلة ${ar(dr.spell.best)}</span></div>` : ''}<p class="pp-note">«تعلّم» = كتبها صحيحة من ذاكرته في أكثر من مراجعة متباعدة.</p></div>` : ''}
        ${kg.length ? `<div class="pp-unit"><h4>🔤 عربي و English (الروضة)</h4><table class="pp-t"><thead><tr><th>اللعبة</th><th>المستوى</th><th>صح من أول مرة</th></tr></thead><tbody>${kg.map(g => `<tr><td>${g.name}</td><td>${g.max > 3 ? ar(g.lv || 1) + ' / ' + ar(g.max) : '⭐'.repeat(g.lv || 1)}</td><td>${ar(Math.round(g.c / (g.c + g.w) * 100))}٪ <small>(${ar(g.c + g.w)})</small></td></tr>`).join('')}</tbody></table></div>` : ''}
        ${APPS.kg ? kgLevels(k.id) : ''}
        ${k.id !== 'guest' ? `<div class="pp-actions"><button type="button" class="p-btn sec" data-ren="${k.id}">✏️ تعديل الاسم</button>
          <button type="button" class="p-btn sec" data-reset="${k.id}">${confirmKey === 'r' + k.id ? '⚠️ اضغط مرة ثانية لمسح التقدّم' : '🔄 مسح التقدّم'}</button>
          <button type="button" class="p-btn sec danger" data-del="${k.id}">${confirmKey === 'd' + k.id ? '⚠️ اضغط مرة ثانية للحذف' : '🗑️ حذف الطفل'}</button></div>` : ''}
      </section>`;
    }).join('')}
    <section class="pp-kid"><h3>⚙️ الإعدادات</h3>
      <label class="pp-sw"><input type="checkbox" id="ppSound" ${s.sound ? 'checked' : ''}> مؤثرات صوتية عند الإجابة</label>
${syncBox()}
      <h4>🛒 متجر النجوم</h4>
      <label class="pp-sw"><input type="checkbox" id="ppShop" ${shopOn() ? 'checked' : ''}> إظهار المتجر للأطفال</label>
      <details class="pp-how"><summary>💡 كيف تجعل المتجر ينجح؟ (من الأبحاث)</summary><ul>
        <li><b>أسعار صغيرة ومتوسطة وكبيرة:</b> أول مكافأة يجب أن يصل لها خلال يوم أو يومين، وإلا يفقد الحماس. تحت كل مكافأة تجد كم يومًا يحتاج كل طفل.</li>
        <li><b>أعطِ الكوبون بسرعة:</b> كلما تأخرت المكافأة بعد الشراء ضعف أثرها. عدد الكوبونات المنتظرة يظهر على زر صفحة الأب.</li>
        <li><b>قلّل مكافآت الشاشة:</b> دراسة من جامعة Guelph وجدت أن الأطفال الذين تُستعمل الشاشة كمكافأة لهم يقضون وقتًا أطول أمامها. لذلك عليها حد أسبوعي، والأفضل الوقت معكم والتجارب.</li>
        <li><b>لا تأخذ النجوم عقابًا:</b> النجوم تُكسب ولا تُسحب.</li>
        <li><b>المدح أولًا:</b> امدح الجهد بكلام محدد، واستعمل «🎁 المفاجأة» أحيانًا بدل الوعود.</li>
        <li><b>دعهم يقترحون:</b> اقتراحاتهم تظهر هنا، والطفل يعمل أكثر لمكافأة اختارها.</li></ul></details>
      <p class="pp-note">في الخانة الأولى رمز تعبيري (إيموجي). «لمن» يجعل المكافأة لطفل واحد، لأن الروضة والصف الرابع يجمعون بسرعات مختلفة. «حد أسبوعي» = أكثر عدد يشتريه في ٧ أيام (فارغ = بلا حد).</p>
      ${HS.ideas().length ? `<div class="pp-ideas"><b>💡 أفكار من الأطفال</b>${HS.ideas().map(i => `<div class="pp-idea"><span>${esc(i.name)}: «${esc(i.text)}»</span><button type="button" class="p-btn sec" data-idea-add="${i.id}">＋ للمتجر</button><button type="button" class="p-btn sec danger" data-idea-del="${i.id}" aria-label="حذف">🗑️</button></div>`).join('')}</div>` : ''}
      <div class="pp-rw">${HS.rewards().map((r, i) => `<div class="pp-rw-row" data-i="${i}"><input class="em" value="${esc(r.em)}" maxlength="4" aria-label="الرمز"><input class="nm" value="${esc(r.name)}" maxlength="40" aria-label="المكافأة">
          <button type="button" class="p-btn sec danger" data-rdel="${i}" aria-label="حذف">🗑️</button>
          <div class="pp-rw-2"><label>⭐ <input class="ct" type="number" min="1" max="9999" inputmode="numeric" value="${r.cost}" aria-label="السعر"></label>
            <label>لمن <select class="fr" aria-label="لمن">${[['', 'الكل'], ...HS.profiles().map(p => [p.id, [HS.avatarText(p), p.name].filter(Boolean).join(' ')])].map(([v, t]) => `<option value="${v}" ${(r.for || '') === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
            <label>حد أسبوعي <input class="wk" type="number" min="0" max="50" inputmode="numeric" value="${r.week || ''}" placeholder="—" aria-label="حد أسبوعي"></label></div>
          <small class="pp-days">${daysHint(r)}</small></div>`).join('')}</div>
      <div class="pp-actions"><button type="button" class="p-btn sec" id="ppRAdd">＋ مكافأة جديدة</button><button type="button" class="p-btn" id="ppRSave">💾 حفظ المكافآت</button></div>
      <h4>🔒 رقم سري لصفحة الأب</h4>
      <p class="pp-note">حتى لا يغيّر الأطفال الأسعار أو يوافقون على كوبوناتهم بأنفسهم. اتركه فارغًا لإلغائه.</p>
      <div class="pp-actions"><input id="ppPin" inputmode="numeric" maxlength="8" placeholder="مثال: 2580" value="${esc(s.pin || '')}" aria-label="الرقم السري"><button type="button" class="p-btn sec" id="ppPinSave">حفظ الرقم</button></div>
      <h4>⏱️ وقت الروضة</h4>
      <p class="pp-note">بعد هذه المدة من اللعب في اليوم تظهر شاشة «وقت الاستراحة». منظمة الصحة العالمية تنصح بساعة شاشة كحد أقصى يوميًا لعمر ٢–٤ سنوات، والأقل أفضل.</p>
      <select id="ppMin">${[[10, '١٠ دقائق'], [15, '١٥ دقيقة'], [20, '٢٠ دقيقة'], [30, '٣٠ دقيقة'], [0, 'بدون حد']].map(([v, t]) => `<option value="${v}" ${(s.kgMinutes === undefined ? 15 : s.kgMinutes) === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
      <details><summary>🧠 العب معها: أسئلة قصيرة لألعاب «نفكّر»</summary><ul>
        <li><b>🧩 الأحجية:</b> «وين تروح هذي القطعة؟ فوق ولا تحت؟» ثم جرّبوا أحجية حقيقية من الكرتون.</li>
        <li><b>🔺 ركّبي الشكل:</b> «أي شكل يصير سقف البيت؟» ثم ابنوا نفس الشكل بالمكعبات أو قصاصات ورق.</li>
        <li><b>🧭 أين أضعها؟:</b> العبوا في البيت: «حطّي الدبدوب تحت الطاولة… خلف الكرسي… بين المخدتين».</li>
        <li><b>🤖 الروبوت:</b> كوني أنتِ الروبوت! تعطيك أوامر «خطوة قدّام، لفّي» حتى توصلين للهدف.</li>
        <li><b>📖 القصة:</b> اطلب منها تحكي القصة بكلماتها: «أولًا… بعدين… وفي الآخر…».</li></ul></details>
      <h4>🔊 الصوت العربي</h4>
      ${HS.clipCount() ? `<p class="pp-note">✅ في الموقع ${HS.count(HS.clipCount(), ['مقطع', 'مقطعان', 'مقاطع', 'مقطعًا'])} صوتية مسجّلة بصوت ذكاء اصطناعي، تُستخدم قبل صوت الجهاز.</p>` : ''}
      <p class="pp-note">${voices.length ? `الأصوات العربية في هذا الجهاز (⭐ = صوت حديث وطبيعي):` : 'لا يوجد صوت عربي في هذا الجهاز/المتصفح، لذلك العربية بلا صوت إلا في المقاطع المسجّلة.'}</p>
      ${voices.length ? `<select id="ppVoice">${voices.map(v => `<option value="${esc(v.name)}" ${cur === v.name ? 'selected' : ''}>${esc(v.name)}${HS.isGoodVoice(v) ? ' ⭐' : ''}</option>`).join('')}</select>` : ''}
      <div class="pp-actions"><button type="button" class="p-btn" id="ppTestAr">🔊 جرّب العربي</button><button type="button" class="p-btn sec" id="ppTestEn">🔊 Test English</button></div>
      <p class="pp-note"><a href="voice-maker.html" target="_blank" rel="noopener">🎙️ صانع الأصوات</a>: يسجّل كل جمل الموقع بصوت Microsoft الطبيعي (سعودي) مجانًا، بدل صوت الجهاز.</p><details><summary>كيف أحصل على صوت عربي أوضح؟</summary><ul>
        <li><b>ويندوز:</b> افتح الصفحة في متصفح <b>Microsoft Edge</b>؛ فيه أصوات عربية طبيعية مجانية (Hamed و Zariyah).</li>
        <li><b>آيفون / آيباد / ماك:</b> الإعدادات ← تسهيلات الاستخدام ← المحتوى المنطوق ← الأصوات ← العربية ← حمّل «ماجد» أو «ليلى» (يفضّل النسخة المحسّنة Enhanced).</li>
        <li><b>أندرويد:</b> الإعدادات ← تحويل النص إلى كلام ← محرك Google ← تثبيت بيانات الصوت ← العربية.</li>
        <li>الأفضل: توليد مقاطع صوتية بالذكاء الاصطناعي مرة واحدة (انظر README، قسم الصوت).</li></ul></details>
    </section>`;
    P.querySelectorAll('[data-kglv]').forEach(sel => sel.onchange = () => {
      const [pid, k] = sel.dataset.kglv.split('|'); APPS.kg.setLevel(pid, k, +sel.value); HS.toast('✓ تم حفظ المستوى');
    });
    P.querySelectorAll('[data-ren]').forEach(b => b.onclick = () => {
      const k = HS.profiles().find(x => x.id === b.dataset.ren); const sec = b.closest('.pp-kid').querySelector('h3');
      sec.innerHTML = `<form class="p-inline"><input value="${esc(k.name)}" maxlength="20" aria-label="الاسم الجديد"><button type="submit" class="p-btn">حفظ</button></form>`;
      const f = sec.querySelector('form'); f.querySelector('input').focus();
      f.onsubmit = e => { e.preventDefault(); const v = f.querySelector('input').value.trim(); if (v) HS.updateProfile(k.id, { name: v }); parent(); };
    });
    P.querySelectorAll('[data-reset]').forEach(b => b.onclick = () => { const k = 'r' + b.dataset.reset; if (confirmKey === k) { HS.resetProgress(b.dataset.reset); confirmKey = ''; } else confirmKey = k; parent(); });
    P.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const k = 'd' + b.dataset.del; if (confirmKey === k) { HS.removeProfile(b.dataset.del); confirmKey = ''; } else confirmKey = k; parent(); });
    P.querySelectorAll('[data-ord]').forEach(b => b.onclick = () => { const [k, o, how] = b.dataset.ord.split('|'); HS.settleOrder(k, o, how); HS.toast(how === 'done' ? '✅ تم' : '↩️ رجعت النجوم'); parent(); });
    document.getElementById('ppShop').onchange = e => HS.setSetting('shop', e.target.checked);
    const readRw = () => [...P.querySelectorAll('.pp-rw-row')].map((row, i) => { const r = { id: HS.rewards()[i] ? HS.rewards()[i].id : 'r' + Date.now().toString(36) + i,
      em: row.querySelector('.em').value.trim() || '🎁', name: row.querySelector('.nm').value.trim(), cost: Math.max(1, Math.round(+row.querySelector('.ct').value || 1)) };
      const fr = row.querySelector('.fr').value, wk = Math.round(+row.querySelector('.wk').value || 0); if (fr) r.for = fr; if (wk > 0) r.week = wk; return r; }).filter(r => r.name);
    P.querySelectorAll('[data-gift]').forEach(f => f.onsubmit = e => { e.preventDefault(); const n = +f.querySelector('select').value, m = f.querySelector('input').value.trim();
      HS.gift(f.dataset.gift, n, m); HS.toast(`🎁 أُرسلت ⭐ ${ar(n)}، ستظهر له كمفاجأة`); parent(); });
    P.querySelectorAll('[data-idea-add]').forEach(b => b.onclick = () => { const i = HS.ideas().find(x => x.id === b.dataset.ideaAdd); const l = readRw();
      l.push({ id: 'r' + Date.now().toString(36), em: '💡', name: i.text, cost: 50 }); HS.setSetting('rewards', l); HS.setSetting('ideas', HS.ideas().filter(x => x !== i)); HS.toast('أُضيفت. عدّل السعر ثم احفظ'); parent(); });
    P.querySelectorAll('[data-idea-del]').forEach(b => b.onclick = () => { HS.setSetting('ideas', HS.ideas().filter(x => x.id !== b.dataset.ideaDel)); parent(); });
    document.getElementById('ppRSave').onclick = () => { HS.setSetting('rewards', readRw()); HS.toast('💾 تم حفظ المكافآت'); parent(); };
    document.getElementById('ppRAdd').onclick = () => { const l = readRw(); l.push({ id: 'r' + Date.now().toString(36), em: '🎁', name: 'مكافأة جديدة', cost: 50 }); HS.setSetting('rewards', l); parent(); };
    P.querySelectorAll('[data-rdel]').forEach(b => b.onclick = () => { const l = readRw(); l.splice(+b.dataset.rdel, 1); HS.setSetting('rewards', l); parent(); });
    document.getElementById('ppPinSave').onclick = () => { const v = document.getElementById('ppPin').value.trim(); HS.setSetting('pin', v); try { sessionStorage.setItem('hs-pin', '1'); } catch (e) {} HS.toast(v ? '🔒 تم حفظ الرقم السري' : 'تم إلغاء الرقم السري'); };
    bindSync();
    document.getElementById('ppMin').onchange = e => HS.setSetting('kgMinutes', +e.target.value);
    document.getElementById('ppSound').onchange = e => HS.setSetting('sound', e.target.checked);
    const sel = document.getElementById('ppVoice'); if (sel) sel.onchange = e => { HS.setSetting('arVoice', e.target.value); HS.speak([['ألف. أرنب', 'ar']]); };
    document.getElementById('ppTestAr').onclick = () => HS.speak([['ألف. أرنب. باء. بطة', 'ar']]);
    document.getElementById('ppTestEn').onclick = () => HS.speak([['A is for Apple', 'en']]);
  }

  /* ---------- router ---------- */
  // addresses from the first single-unit pages (old links saved on the kids' devices) → new pages
  const LEGACY = { l1: 'l1', l2: 'l2', l3: 'l3', cards: 'cards', games: 'play', quiz: 'test' };
  function route() {
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
    if (h === 'parent') { showScreen('portal'); draw('parent'); return gate(parent); }
    if (h !== 'shop') buying = '';
    if (h === 'shop') { showScreen('portal'); if (shopOn()) { draw('shop'); return shop(); } draw('home'); return home(); }
    showScreen('portal');
    if ((m = h.match(/^y-(\w+)$/))) {
      const y = CATALOG.find(x => x.id === m[1]); if (!y) { draw('home'); return home(); }
      draw(h);
      P.innerHTML =         `<div class="p-head">${tile(y)}<div><h2 class="p-title">${y.name}</h2><p class="p-sub">اختر المادة</p></div></div><div class="p-grid">${
          y.subjects.map(s => card(s, navOf(s) || `s-${y.id}-${s.id}`)).join('')}</div>`;
    } else if ((m = h.match(/^s-(\w+)-(\w+)$/))) {
      const y = CATALOG.find(x => x.id === m[1]); const s = y && y.subjects.find(x => x.id === m[2]);
      if (!s || !s.units) { draw('home'); return home(); }
      draw(h);
      P.innerHTML =         `<div class="p-head">${tile(s)}<div><h2 class="p-title">${s.name}</h2><p class="p-sub">اختر الوحدة</p></div></div><div class="p-grid">${
          s.units.map(u => card(u, navOf(u))).join('')}</div>`;
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
  route();
})();
