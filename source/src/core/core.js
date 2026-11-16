/* ============================================================
   CORE (window.HS): shared by the menu and every app.
   - child profiles + per-child saved progress
   - spaced repetition (which questions to review, mastery %)
   - speech: recorded clips first, device voice as fallback
   - small sound effects, toast, celebration
   - drag-and-drop that also works as "tap item, then tap target"
   ============================================================ */
(function () {
  const HS = window.HS = {};
  const KEY = 'hs-v2';

  /* ---------- small utils ---------- */
  HS.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  HS.one = a => a[Math.floor(Math.random() * a.length)];
  /** "Shuffle bag": random order, but every item comes once before any repeats, and never the same item twice in a row.
      key keeps a separate bag per game/level; the bag lives until the page is reloaded. */
  const bags = {};
  HS.bag = (key, list) => {
    let b = bags[key];
    if (!b || b.list !== list || !b.q.length) {
      const last = b && b.list === list ? b.last : -1;
      let q = HS.shuffle([...list.keys()]);
      if (q.length > 1 && q[0] === last) q.push(q.shift());
      b = bags[key] = { list, q, last };
    }
    b.last = b.q.shift();
    return list[b.last];
  };
  HS.pick = (arr, n, must) => HS.shuffle([must, ...HS.shuffle(arr.filter(x => x !== must)).slice(0, n - 1)]);
  HS.toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  HS.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /** Arabic counted noun: HS.count(3, HS.N.q) → "٣ أسئلة" */
  HS.N = { q: ['سؤال', 'سؤالان', 'أسئلة', 'سؤالًا'], day: ['يوم', 'يومان', 'أيام', 'يومًا'], star: ['نجمة', 'نجمتان', 'نجوم', 'نجمة'], term: ['مصطلح', 'مصطلحان', 'مصطلحات', 'مصطلحًا'] };
  HS.count = (n, w) => n === 1 ? `${w[0]} واحد${w[0].endsWith('ة') ? 'ة' : ''}` : n === 2 ? w[1] : n >= 3 && n <= 10 ? `${HS.toAr(n)} ${w[2]}` : `${HS.toAr(n)} ${w[3]}`;
  HS.today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  /* ---------- storage ---------- */
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
  if (!S) S = { profiles: [], current: null, settings: { sound: true, arVoice: '' }, p: {} };
  S.settings = Object.assign({ sound: true, arVoice: '' }, S.settings || {});
  let saveT = null;
  HS.save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} if (HS.onSaved) HS.onSaved(); }, 60); };
  /* for sync.js only: the whole saved state, writing it without telling sync, and firing events */
  HS._state = () => S;
  HS._persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  HS._emit = (t, d) => emit(t, d);
  // write right away if the page is being closed or hidden, so a purchase or star is never lost
  const flush = () => { if (saveT) { clearTimeout(saveT); saveT = null; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} if (HS.onSaved) HS.onSaved(true); } };
  addEventListener('pagehide', flush); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  HS.settings = () => S.settings;
  HS.setSetting = (k, v) => { S.settings[k] = v; HS.save(); };
  HS.exportAll = () => JSON.stringify(S);

  /* one-time: stars earned on the first version of the ecosystem page carry over */
  try {
    const old = JSON.parse(localStorage.getItem('eco4-progress-v1') || 'null');
    if (old && !S.migratedEco) { S.migratedEco = true; S.p.guest = S.p.guest || { stars: 0, days: [], ns: {} }; S.p.guest.stars += +old.stars || 0; localStorage.setItem(KEY, JSON.stringify(S)); }
  } catch (e) {}

  /* ---------- profiles ---------- */
  const GUEST = { id: 'guest', name: 'ضيف', avatar: '🙂', color: 'var(--t-blue)' };
  HS.AVATARS = ['🦁', '🐯', '🐼', '🦊', '🐨', '🐰', '🦄', '🐬', '🦋', '🐢', '🚀', '⭐'];
  HS.COLORS = ['var(--t-blue)', 'var(--t-pink)', 'var(--t-green-btn)', 'var(--t-purple)', 'var(--t-orange)'];
  HS.profiles = () => S.profiles.slice();
  HS.current = () => S.profiles.find(p => p.id === S.current) || (S.profiles.length ? null : GUEST);
  HS.setCurrent = id => { S.current = id; HS.save(); emit('profile'); };
  HS.addProfile = ({ name, avatar, color }) => {
    const id = 'p' + Date.now().toString(36);
    S.profiles.push({ id, name: (name || '').trim() || 'بطل', avatar: avatar || '⭐', color: color || HS.COLORS[0] });
    // first real profile inherits anything earned as guest
    if (S.profiles.length === 1 && S.p.guest) { S.p[id] = S.p.guest; delete S.p.guest; }
    S.current = id; HS.save(); emit('profile'); return id;
  };
  HS.updateProfile = (id, patch) => { const p = S.profiles.find(x => x.id === id); if (p) { Object.assign(p, patch); HS.save(); emit('profile'); } };
  HS.removeProfile = id => {
    S.profiles = S.profiles.filter(p => p.id !== id); delete S.p[id];
    if (S.current === id) S.current = S.profiles[0] ? S.profiles[0].id : null;
    HS.save(); emit('profile');
  };
  function prof(id) {
    const pid = id || (HS.current() || GUEST).id;
    if (!S.p[pid]) S.p[pid] = { stars: 0, days: [], ns: {} };
    return S.p[pid];
  }
  HS.profileData = id => prof(id);
  /** Per-child saved data for one app/unit ("namespace"). Mutate it, then call HS.save(). */
  HS.data = (ns, id) => { const p = prof(id); if (!p.ns[ns]) p.ns[ns] = {}; return p.ns[ns]; };
  HS.resetProgress = id => { S.p[id || (HS.current() || GUEST).id] = { stars: 0, days: [], ns: {} }; HS.save(); emit('stars'); };   // also clears shop coupons

  /* ---------- stars & practice days ---------- */
  /* p.stars = all stars ever earned; p.spent = stars spent in the shop. The child sees what is left to spend. */
  HS.stars = id => { const p = prof(id); return p.stars - (p.spent || 0); };
  HS.earned = id => prof(id).stars;
  HS.addStars = (n = 1) => {
    const p = prof(); p.stars += n; markDay(p);
    const t = HS.today(); p.log = p.log || {}; p.log[t] = (p.log[t] || 0) + n;          // stars per day, for the parent's pricing
    const ks = Object.keys(p.log); if (ks.length > 60) delete p.log[ks.sort()[0]];
    HS.save(); emit('stars');
  };
  /** average stars a day over the last 7 days this child practised (0 if none) */
  HS.earnRate = id => { const v = Object.entries(prof(id).log || {}).sort().slice(-7).map(x => x[1]); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0; };

  /* ---------- rewards shop ----------
     The parent sets the rewards and prices (settings.rewards, shared by all children).
     Buying spends stars and makes a coupon that waits until the parent marks it as given (or gives the stars back). */
  /* Default menu: small / medium / large prices, mostly time together and experiences.
     Screen time is on the menu but capped per week (research: using screens as the reward makes children want them more). */
  HS.DEFAULT_REWARDS = [
    { id: 'r7', em: '📖', name: 'قصة إضافية قبل النوم', cost: 25 },
    { id: 'r8', em: '🎲', name: 'لعبة مع بابا أو ماما ١٥ دقيقة', cost: 30 },
    { id: 'r9', em: '🍽️', name: 'تختار عشاء العائلة', cost: 50 },
    { id: 'r1', em: '📱', name: '١٥ دقيقة آيباد', cost: 50, week: 3 },
    { id: 'r3', em: '🍦', name: 'آيس كريم', cost: 60, week: 2 },
    { id: 'r2', em: '🎮', name: '٣٠ دقيقة بلايستيشن', cost: 90, week: 2 },
    { id: 'r5', em: '🎬', name: 'فيلم مع العائلة', cost: 120 },
    { id: 'r6', em: '🏞️', name: 'طلعة للحديقة', cost: 150 },
    { id: 'r10', em: '🧸', name: 'لعبة صغيرة جديدة', cost: 300 }
  ];
  const OLD_DEFAULT = '📱40🎮80🍦60🌙50🎬120🏞️150';   // first version of the menu: replaced if the parent never changed it
  HS.rewards = () => {
    const cur = S.settings.rewards;
    if (!cur || cur.map(r => r.em + r.cost).join('') === OLD_DEFAULT) S.settings.rewards = HS.DEFAULT_REWARDS.map(r => Object.assign({}, r));
    return S.settings.rewards;
  };
  /** rewards this child can see (a reward can be for everyone or for one child), cheapest first */
  HS.rewardsFor = id => { const pid = id || (HS.current() || GUEST).id; return HS.rewards().filter(r => !r.for || r.for === pid).slice().sort((a, b) => a.cost - b.cost); };
  HS.orders = id => { const p = prof(id); return (p.orders = p.orders || []); };
  /** how many of this reward the child bought in the last 7 days (refunded ones don't count) */
  HS.boughtWeek = (rid, id) => HS.orders(id).filter(o => o.rid === rid && o.st !== 'back' && Date.now() - o.t < 7 * 864e5).length;
  /** why the child can't buy it now: '' | 'stars' | 'week' */
  HS.cantBuy = (r, id) => r.week && HS.boughtWeek(r.id, id) >= r.week ? 'week' : HS.stars(id) < r.cost ? 'stars' : '';
  HS.buy = rid => {
    const r = HS.rewardsFor().find(x => x.id === rid), p = prof();
    if (!r || HS.cantBuy(r)) return null;
    const o = { id: 'o' + Date.now().toString(36), rid: r.id, em: r.em, name: r.name, cost: r.cost, t: Date.now(), st: 'wait' };
    HS.orders().push(o); p.spent = (p.spent || 0) + r.cost;
    if (p.goal === rid) p.goal = '';
    if (p.orders.length > 80) p.orders.splice(0, p.orders.length - 80);
    HS.save(); emit('stars'); return o;
  };
  /* savings goal: one reward the child is saving for (goal-gradient: effort rises as the goal gets close) */
  HS.goal = id => { const g = prof(id).goal; return g ? HS.rewardsFor(id).find(r => r.id === g) || null : null; };
  HS.setGoal = rid => { prof().goal = rid || ''; HS.save(); emit('stars'); };
  /* surprise gift from the parent (unexpected rewards don't lower interest the way promised ones can) */
  HS.gift = (pid, n, msg) => { const p = prof(pid); p.stars += n; (p.gifts = p.gifts || []).push({ n, msg: msg || '', t: Date.now(), seen: false }); if (p.gifts.length > 30) p.gifts.shift(); HS.save(); emit('stars'); };
  HS.unseenGifts = id => (prof(id).gifts || []).filter(g => !g.seen);
  HS.seeGifts = id => { (prof(id).gifts || []).forEach(g => g.seen = true); HS.save(); };
  /* ideas: children can suggest a reward; the parent sees them on the parent page */
  HS.ideas = () => (S.settings.ideas = S.settings.ideas || []);
  HS.addIdea = text => { const me = HS.current() || GUEST; HS.ideas().push({ id: 'i' + Date.now().toString(36), pid: me.id, name: me.name || '', text, t: Date.now() }); HS.save(); };
  HS.waitingCount = () => Object.keys(S.p).reduce((n, pid) => n + (S.p[pid].orders || []).filter(o => o.st === 'wait').length, 0);
  /** parent: 'done' = reward given, 'back' = cancelled and stars returned */
  HS.settleOrder = (pid, oid, how) => {
    const p = prof(pid), o = HS.orders(pid).find(x => x.id === oid);
    if (!o || o.st !== 'wait') return;
    o.st = how; o.done = Date.now(); if (how === 'back') p.spent = Math.max(0, (p.spent || 0) - o.cost);
    HS.save(); emit('stars');
  };
  function markDay(p) { const t = HS.today(); if (p.days[p.days.length - 1] !== t) { p.days.push(t); if (p.days.length > 400) p.days.shift(); } }
  HS.markPractice = () => { markDay(prof()); HS.save(); };
  /** consecutive practice days ending today or yesterday */
  HS.dayStreak = id => {
    const days = new Set(prof(id).days); let n = 0; const d = new Date();
    if (!days.has(HS.today())) d.setDate(d.getDate() - 1);
    for (;;) { const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); if (!days.has(k)) break; n++; d.setDate(d.getDate() - 1); }
    return n;
  };

  /* ---------- events ---------- */
  const L = {};
  function emit(t, d) { (L[t] || []).forEach(f => { try { f(d); } catch (e) {} }); }
  HS.on = (t, f) => { (L[t] = L[t] || []).push(f); };

  /* ---------- spaced repetition (Leitner boxes) ----------
     box 0 = new/wrong ... box 5 = solid. Correct → next box, wrong → box 0.
     Next review after INTERVALS[box] days. Mastery = average box / 4 (capped). */
  const DAY = 864e5, INTERVALS = [0, 1, 2, 4, 8, 16];
  HS.srs = {
    rec(ns, id) { const d = HS.data(ns); d.srs = d.srs || {}; return d.srs[id]; },
    record(ns, id, correct) {
      const d = HS.data(ns); d.srs = d.srs || {};
      const r = d.srs[id] || (d.srs[id] = { b: 0, c: 0, w: 0, t: 0, due: 0 });
      if (correct) { r.c++; r.b = Math.min(5, r.b + 1); } else { r.w++; r.b = 0; }
      r.t = Date.now(); r.due = r.t + INTERVALS[r.b] * DAY;
      markDay(prof()); HS.save();
      return r;
    },
    box(ns, id) { const r = this.rec(ns, id); return r ? r.b : 0; },
    seen(ns, id) { return !!this.rec(ns, id); },
    /** ids that need review now: answered wrong last time, or their interval has passed */
    due(ns, ids) {
      const now = Date.now();
      return ids.filter(id => { const r = this.rec(ns, id); return r && (r.b === 0 || r.due <= now); })
        .sort((a, b) => this.box(ns, a) - this.box(ns, b));
    },
    /** 0..1: how well these items are known (unseen items count as 0) */
    mastery(ns, ids) { if (!ids.length) return 0; return ids.reduce((s, id) => s + Math.min(4, this.box(ns, id)) / 4, 0) / ids.length; },
    /** weighted pick: weaker/unseen items more likely; also interleaves */
    choose(ns, ids, n) {
      const w = ids.map(id => ({ id, k: Math.random() * (1 + (5 - this.box(ns, id))) + (this.seen(ns, id) ? 0 : 1.5) }));
      return w.sort((a, b) => b.k - a.k).slice(0, n).map(x => x.id);
    },
    mostMissed(ns, n = 5) {
      const d = HS.data(ns); const s = d.srs || {};
      return Object.keys(s).filter(id => s[id].w > 0).sort((a, b) => (s[b].w - s[b].c * .5) - (s[a].w - s[a].c * .5)).slice(0, n).map(id => ({ id, ...s[id] }));
    }
  };

  /* ---------- speech: recorded clip first, device voice as fallback ---------- */
  HS.AUDIO = window.HS_AUDIO || {};     // filled by the build: {"ar|نص": "data:audio/mpeg;base64,..."}
  const synth = window.speechSynthesis; let voices = [];
  function loadVoices() { try { voices = synth.getVoices() || []; } catch (e) { voices = []; } }
  if (synth) { loadVoices(); if ('onvoiceschanged' in synth) synth.onvoiceschanged = loadVoices; setTimeout(loadVoices, 800); setTimeout(loadVoices, 2500); }
  const isAr = v => /^ar/i.test(v.lang) || /arab|maged|majed|tarik|laila|hoda|naayf|zariyah|hamed/i.test(v.name);
  const vScore = v => (/natural|neural|online|premium|enhanced|wavenet|google/i.test(v.name) ? 10 : 0) + (/^ar[-_]SA/i.test(v.lang) ? 3 : 0);
  HS.arVoices = () => { if (!voices.length) loadVoices(); return voices.filter(isAr).sort((a, b) => vScore(b) - vScore(a)); };
  HS.isGoodVoice = v => vScore(v) >= 10;
  HS.hasSpeech = () => !!synth || Object.keys(HS.AUDIO).length > 0;
  HS.clipCount = () => Object.keys(HS.AUDIO).length;
  function arVoice() { const l = HS.arVoices(); return l.find(v => v.name === S.settings.arVoice) || l[0]; }
  function enVoice() { if (!voices.length) loadVoices(); return voices.find(v => /^en[-_]US/i.test(v.lang) && v.localService) || voices.find(v => /^en[-_]US/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)); }
  HS.hasArabicVoice = () => HS.arVoices().length > 0;

  let token = 0, curAudio = null, sayT = null;
  HS.stopSpeak = () => { token++; clearTimeout(sayT); try { synth && synth.cancel(); } catch (e) {} if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio = null; } };
  /** parts: [["text","ar"|"en"], ...] spoken one after another */
  HS.speak = (parts) => {
    HS.stopSpeak(); const my = token; let i = 0;
    const next = () => {
      if (my !== token || i >= parts.length) return;
      const [text, lang] = parts[i++];
      const clip = HS.AUDIO[lang + '|' + text];
      if (clip) {
        const a = new Audio(clip); curAudio = a;
        a.onended = next; a.onerror = () => tts(text, lang, next);
        a.play().catch(() => tts(text, lang, next));
      } else tts(text, lang, next);
    };
    sayT = setTimeout(next, 90);
  };
  function tts(text, lang, done) {
    if (!synth) return done();
    try {
      const u = new SpeechSynthesisUtterance(text);
      const v = lang === 'ar' ? arVoice() : enVoice();
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      u.rate = lang === 'ar' ? 0.8 : 0.88; u.pitch = 1.08;
      u.onend = done; u.onerror = done;
      synth.speak(u);
    } catch (e) { done(); }
  }

  /* ---------- sound effects (tiny synthesized tones, no files) ---------- */
  let ac = null;
  HS.fx = kind => {
    if (!S.settings.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const seq = { ok: [[660, .08], [880, .12]], no: [[220, .16]], win: [[523, .1], [659, .1], [784, .1], [1047, .2]], tap: [[440, .04]], combo: [[784, .07], [988, .07], [1175, .12]] }[kind] || [];
      let t = ac.currentTime;
      seq.forEach(([f, d]) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = kind === 'no' ? 'triangle' : 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + .02); t += d;
      });
    } catch (e) {}
  };

  /* ---------- toast & celebration ---------- */
  HS.toast = (html, ms = 1600) => {
    let el = document.getElementById('hs-toast');
    if (!el) { el = document.createElement('div'); el.id = 'hs-toast'; el.className = 'hs-toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.innerHTML = html; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), ms);
  };
  HS.party = () => {
    let P = document.getElementById('hs-party');
    if (!P) { P = document.createElement('div'); P.id = 'hs-party'; P.className = 'hs-party'; P.setAttribute('aria-hidden', 'true'); document.body.appendChild(P); }
    const em = ['🎈', '🎉', '⭐', '🌟', '🎊', '💖', '🏆'];
    P.innerHTML = Array.from({ length: 22 }, () => `<span style="left:${Math.random() * 95}%;animation-delay:${Math.random() * .8}s">${HS.one(em)}</span>`).join('');
    HS.fx('win'); setTimeout(() => { P.innerHTML = ''; }, 3400);
  };

  /* ---------- combo (answers in a row) ---------- */
  /** returns bonus stars earned on this hit (1 at 3, 2 at 5, 3 at 10...) */
  HS.makeCombo = () => ({
    n: 0,
    hit() { this.n++; const b = this.n === 3 ? 1 : this.n === 5 ? 2 : (this.n >= 10 && this.n % 5 === 0) ? 3 : 0; if (b) { HS.fx('combo'); HS.toast(`🔥 ${HS.toAr(this.n)} متتالية! +${HS.toAr(b)} ⭐`); } return b; },
    miss() { this.n = 0; }
  });

  /* ---------- drag & drop with tap-tap fallback ----------
     HS.dnd(root, {item:'.sel', target:'.sel', onDrop(itemEl, targetEl) → true if accepted})
     Works with mouse, touch and pen. Tap an item (it lifts), then tap a target. */
  HS.dnd = (root, opt) => {
    let picked = null, drag = null;
    const clear = () => { if (picked) picked.classList.remove('hs-picked'); picked = null; root.querySelectorAll(opt.target).forEach(t => t.classList.remove('hs-ready')); };
    const pick = el => { clear(); picked = el; el.classList.add('hs-picked'); root.querySelectorAll(opt.target).forEach(t => t.classList.add('hs-ready')); HS.fx('tap'); };
    const drop = (el, tgt) => { const ok = opt.onDrop(el, tgt); clear(); return ok; };
    root.classList.add('hs-dnd');
    root.querySelectorAll(opt.item).forEach(el => { el.classList.add('hs-drag'); el.draggable = false; });
    // no native drag image and no long-press menu (iOS shows both otherwise)
    root.addEventListener('dragstart', e => e.preventDefault());
    root.addEventListener('contextmenu', e => { if (e.target.closest(opt.item)) e.preventDefault(); });
    /* Dragging moves the real piece (no copy). A copy lived outside the app, so on the iPad it lost the app's
       styles and showed the whole picture instead of the piece. */
    const moveTo = (d, x, y) => { d.el.style.transform = `translate(${x - d.x}px,${y - d.y}px) scale(1.08)`; };
    root.addEventListener('pointerdown', e => {
      const it = e.target.closest(opt.item);
      if (!it || !root.contains(it) || it.disabled || it.classList.contains('hs-done')) return;
      drag = { el: it, x: e.clientX, y: e.clientY, moving: false, id: e.pointerId };
    });
    root.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moving && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 10) {
        drag.moving = true; if (picked) clear();
        drag.el.classList.add('hs-moving'); if (getComputedStyle(drag.el).position === 'static') drag.el.style.position = 'relative';
        try { root.setPointerCapture && root.setPointerCapture(e.pointerId); } catch (x) {}
      }
      if (drag.moving) {
        e.preventDefault(); moveTo(drag, e.clientX, e.clientY);
        root.querySelectorAll(opt.target).forEach(t => t.classList.remove('hs-over'));
        const under = document.elementFromPoint(e.clientX, e.clientY);   // the moving piece ignores the pointer, so this finds what is under it
        const t = under && under.closest(opt.target); if (t && root.contains(t)) t.classList.add('hs-over');
      }
    }, { passive: false });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      root.querySelectorAll(opt.target).forEach(t => t.classList.remove('hs-over'));
      if (d.moving) {
        const under = document.elementFromPoint(e.clientX, e.clientY);
        const t = under && under.closest(opt.target);
        d.el.classList.remove('hs-moving'); d.el.style.transform = '';     // glides back (CSS transition) unless it was accepted and hidden
        if (t && root.contains(t)) drop(d.el, t);
      } else if (e.type === 'pointerup') {
        if (picked === d.el) clear(); else pick(d.el);
      }
    };
    root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
    root.addEventListener('click', e => {
      const t = e.target.closest(opt.target);
      if (picked && t && root.contains(t) && !e.target.closest(opt.item)) drop(picked, t);
    });
    // keyboard: Enter/Space on item picks it, on target drops
    root.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const it = e.target.closest(opt.item), t = e.target.closest(opt.target);
      if (it && !it.classList.contains('hs-done')) { e.preventDefault(); picked === it ? clear() : pick(it); }
      else if (t && picked) { e.preventDefault(); drop(picked, t); }
    });
    return { clear };
  };
})();
