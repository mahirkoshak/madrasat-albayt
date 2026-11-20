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
  HS.N = { q: ['سؤال', 'سؤالان', 'أسئلة', 'سؤالًا'], day: ['يوم', 'يومان', 'أيام', 'يومًا'], star: ['نجمة', 'نجمتان', 'نجوم', 'نجمة'], term: ['مصطلح', 'مصطلحان', 'مصطلحات', 'مصطلحًا'],
    lesson: ['درس', 'درسان', 'دروس', 'درسًا'], game: ['لعبة', 'لعبتان', 'ألعاب', 'لعبة'] };
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

  /* ---------- interface language (this device only): 'ar' (default) or 'en' ----------
     HS.L('عربي', 'English') picks the text for the current language. The menu pages and the top bar follow it;
     school lessons stay in Arabic (they follow the Saudi student book). */
  HS.lang = () => S.settings.lang === 'en' ? 'en' : 'ar';
  HS.L = (a, e) => HS.lang() === 'en' ? e : a;
  HS.num = n => HS.lang() === 'en' ? String(n) : HS.toAr(n);
  /** counted noun in the current language: HS.cnt(3, HS.N.day, ['day', 'days']) */
  HS.cnt = (n, arN, en) => HS.lang() === 'en' ? `${n} ${n === 1 ? en[0] : en[1]}` : HS.count(n, arN);
  const applyLang = () => { const r = document.documentElement; r.lang = HS.lang(); r.dir = HS.lang() === 'en' ? 'ltr' : 'rtl'; };
  HS.setLang = l => { S.settings.lang = l === 'en' ? 'en' : 'ar'; applyLang(); HS.save(); emit('lang'); };

  /* ---------- mute (this device only): silences speech and sound effects everywhere ---------- */
  HS.muted = () => !!S.settings.mute;
  HS.setMute = v => { S.settings.mute = !!v; if (v) HS.stopSpeak(); HS.save(); emit('mute', !!v); };
  HS.setSetting = (k, v) => { S.settings[k] = v; HS.save(); };
  HS.exportAll = () => JSON.stringify(S);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => applyLang()); else setTimeout(() => applyLang());

  /* one-time: stars earned on the first version of the ecosystem page carry over */
  try {
    const old = JSON.parse(localStorage.getItem('eco4-progress-v1') || 'null');
    if (old && !S.migratedEco) { S.migratedEco = true; S.p.guest = S.p.guest || { stars: 0, days: [], ns: {} }; S.p.guest.stars += +old.stars || 0; localStorage.setItem(KEY, JSON.stringify(S)); }
  } catch (e) {}

  /* ---------- profiles ---------- */
  const GUEST = { id: 'guest', name: 'ضيف', avatar: '🙂', color: 'var(--t-blue)' };
  HS.AVATARS = ['🦁', '🐯', '🐼', '🦊', '🐨', '🐰', '🦄', '🐬', '🦋', '🐢', '🚀', '⭐'];
  HS.COLORS = ['var(--t-blue)', 'var(--t-pink)', 'var(--t-gold)', 'var(--t-purple)', 'var(--t-orange)'];
  /** a child's circle colour; children saved with the old green are shown in purple (nothing is rewritten) */
  HS.kidColor = p => !p || !p.color ? 'var(--t-blue)' : p.color === 'var(--t-green-btn)' ? 'var(--t-purple)' : p.color;

  /* ---------- artwork ----------
     window.HS_ART comes from the build (tools/art_process.py → dist/assets/art.json): only pictures that exist.
     Everything asks for art by its id (the "id" in art-source/manifest-core.json) and passes the emoji it used
     before as the fallback, so a picture that is not made yet keeps showing its emoji, and a new picture
     appears everywhere as soon as it is processed and the site is rebuilt. */
  HS.ART = window.HS_ART || {};
  HS.hasArt = id => !!(id && HS.ART[id]);
  /** <img> for artwork `id`, or the fallback when there is no picture.
      o.alt: '' = decorative (default), or a short Arabic description · o.small: the 192px copy · o.cls · o.size (px)
      o.face: the head-and-shoulders copy (avatars) · o.fb: fallback (emoji or text) · o.eager: load now (above the fold) */
  /** the listen icon used on every 🔊 button (drawn, so it matches the header icons) */
  HS.SPK = '<svg class="hs-spk" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3.5 9.2h3.8L12 5.3v13.4l-4.7-3.9H3.5z" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M15.4 9.1a4.2 4.2 0 010 5.8M18.1 6.4a8 8 0 010 11.2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  /** content picture for an emoji (manifest-sheets: ids like kg-u1f407, sci-u26f0-2b07), or the emoji itself
      while that picture does not exist yet. area: 'kg' | 'sci' | 'math' */
  HS.picId = (em, area) => area + '-u' + [...String(em)].map(c => c.codePointAt(0).toString(16)).filter(h => h !== 'fe0f' && h !== '200d').join('-');
  HS.pic = (em, area, o = {}) => {
    const id = ((window.HS_PICMAP || {})[area] || {})[em] || HS.picId(em, area);
    return HS.ART && HS.ART[id] ? HS.art(id, Object.assign({ fb: em }, o)) : em;
  };
  /** swap emoji for their pictures inside root, now and whenever root changes (screens that build emoji in many places).
      areas: picture sets to look in, in order (e.g. ['kg', 'sci', 'dict']). An element holding only emoji gets the picture
      at the emoji's size; an emoji beside words (a tab «🪨 الصخور») gets a small picture inline.
      Interface symbols stay emoji: arrows, + − × ÷, ✓, ?, counters (⭐ 💎), the lock, confetti, keys and anything inside
      [data-nopic], .hs-party, the top bar, inputs or speaker buttons. */
  const KEEP = new Set([...'⭐🌟💎🔒🔓💡🎯🃏⏱️⏰👆👍👋👉👈🔁🔀🔄🗑️🧹➕➖✖️➗❓❔❗✅❌✔️🔟🔢🔤🔠🔡🔊🔈🔇🎉🎊🎈💖✨🏆🏅🥇🎮📚📝🗂️✍️🔎🔍🗺️📅📌📎🎲']
    .concat(['⬅️', '➡️', '⬆️', '⬇️', '↩️', '↪️', '🔴', '🟢', '🟡', '🔵', '🟠', '🟣', '🟤', '⚫', '⚪', '🟥', '🟩', '🟨', '🟦', '🟧', '🟪', '🟫', '⬛', '⬜', '✏️', '✖', '✔', '〰️'].map(x => x)));
  const EMO = /[0-9#*]️?⃣|\p{Regional_Indicator}{2}|[←→↑↓➜]|\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*/gu;   // also keycap numbers (1️⃣) and text arrows
  const ONLY = /^\s*(([0-9#*]️?⃣|\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*)\s*)+$/u;
  const PIC_ALIAS = { '🚂': 'dict-train', '🚆': 'dict-train',   // an emoji whose picture was drawn under another emoji
    '😄': 'dict-happy', '😀': 'dict-happy', '😊': 'dict-smile', '😢': 'dict-sad', '😠': 'dict-angry', '😨': 'dict-scared', '😲': 'dict-surprised', '😴': 'dict-tired',
    '🔴': 'dict-red', '🔵': 'dict-blue', '🟡': 'dict-yellow', '🟣': 'dict-purple', '🔲': 'dict-square', '⬛': 'dict-square',
    '⭐': 'star', '🌟': 'dict-star-2', '💎': 'dict-shine', '✏️': 'dict-pencil', '✏': 'dict-pencil', '🎈': 'dict-balloon', '🐫': 'dict-camel', '🐪': 'dict-camel',
    '🌼': 'dict-flower', '🐾': 'dict-dog', '👀': 'dict-eye', '👁️': 'dict-eye', '🃏': 'game-card-back', '🎮': 'dict-game-console', '🗺️': 'dict-map', '🧭': 'dict-map',
    '🏅': 'dict-medal', '🏆': 'badge-champion-earned', '👑': 'badge-champion-earned', '🟢': 'dict-green', '🦄': 'avatar-unicorn', '🎉': 'star-burst', '🎊': 'star-burst', '👨‍👦': 'dict-father', '👨‍👩‍👧': 'dict-family', '🛒': 'gift-box', '🎁': 'gift-box', '🔒': 'dict-key', '🗑️': 'dict-bin', '🗑': 'dict-bin',
    '🧹': 'dict-broom', '👋': 'dict-hello', '👣': 'dict-foot', '🔍': 'dict-check', '🔎': 'dict-check',
    '🔢': 'subject-math', '🗂️': 'game-card-back', '🟦': 'dict-square', '🎯': 'goal-flag',
    '💡': 'dict-idea', '🔁': 'dict-repeat', '🔄': 'dict-repeat', '👍': 'dict-like', '👆': 'dict-touch', '⏱️': 'dict-clock', '⏰': 'dict-clock', '🕐': 'dict-clock', '📅': 'dict-calendar',
    '📒': 'dict-notebook', '📝': 'dict-write', '🔤': 'dict-alphabet', '🐎': 'dict-horse', '🐴': 'dict-horse', '🏈': 'dict-football', '🕸️': 'dict-spider', '🫀': 'dict-heart',
    '🦪': 'dict-shell', '🪲': 'dict-insect', '👪': 'dict-family', '🍖': 'dict-meat', '⚪': 'dict-white', '✨': 'star-burst', '🟩': 'dict-square',
    '💛': 'dict-heart', '💚': 'dict-heart', '🍼': 'dict-bottle', '🍶': 'dict-bottle', '🐀': 'dict-mouse', '🧻': 'dict-toilet', '🕶️': 'dict-glasses', '🍰': 'dict-cake', '⭕': 'dict-circle',
    '🟠': 'dict-orange', '🇸🇦': 'dict-saudi-arabia', '🦑': 'dict-octopus', '🐖': 'kg-pig', '👝': 'dict-bag', '💺': 'dict-chair', '🎟️': 'coupon', '💾': 'dict-save', '⛅': 'dict-cloudy',
    '🎭': 'dict-play', '🔦': 'dict-light' };
  /** drawn interface symbols (no picture fits): arrows, play, plus, minus, ×, ?, the spinner */
  const ARR = r => `<svg class="hs-ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="3" y="3" width="42" height="42" rx="13" fill="#1C7ED6"/><rect x="3" y="3" width="42" height="21" rx="13" fill="#fff" opacity=".12"/><g transform="rotate(${r} 24 24)"><path d="M12 24h21M24 13l11 11-11 11" fill="none" stroke="#fff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
  const BOX = (c, inner) => `<svg class="hs-ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="3" y="3" width="42" height="42" rx="13" fill="${c}"/><rect x="3" y="3" width="42" height="21" rx="13" fill="#fff" opacity=".12"/>${inner}</svg>`;
  const LINE = d => `<path d="${d}" fill="none" stroke="#fff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  HS.ICONS = {
    '➡️': ARR(0), '⬅️': ARR(180), '⬆️': ARR(-90), '⬇️': ARR(90), '➡': ARR(0), '⬅': ARR(180), '⬆': ARR(-90), '⬇': ARR(90),
    '▶️': BOX('#8E5CF7', '<path d="M19 13.5l15 10.5-15 10.5z" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'),
    '✅': BOX('#1C7ED6', LINE('M14 25l7 7 13-15')), '✔️': BOX('#1C7ED6', LINE('M14 25l7 7 13-15')),
    '➕': BOX('#FF9600', LINE('M24 13v22M13 24h22')), '➖': BOX('#FF9600', LINE('M13 24h22')),
    '✖️': BOX('#FF6F91', LINE('M16 16l16 16M32 16L16 32')), '✖': BOX('#FF6F91', LINE('M16 16l16 16M32 16L16 32')),
    '❓': '<svg class="hs-ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="21" fill="#8E5CF7"/><path d="M17.5 18.5a6.5 6.5 0 1113 .5c0 4.5-6.5 5-6.5 10" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="24" cy="36.5" r="3.6" fill="#fff"/></svg>',
    '🎡': '<svg class="hs-ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' + ['#FF6F91', '#FFC800', '#1C7ED6', '#FF9600', '#8E5CF7', '#4DA8FF'].map((c, i) => { const a = i * Math.PI / 3, b = a + Math.PI / 3, P = t => (24 + 21 * Math.cos(t)).toFixed(1) + ' ' + (24 + 21 * Math.sin(t)).toFixed(1); return `<path d="M24 24L${P(a)}A21 21 0 0 1 ${P(b)}z" fill="${c}"/>`; }).join('') + '<circle cx="24" cy="24" r="6" fill="#fff"/><circle cx="24" cy="24" r="2.6" fill="#3C3C3C"/></svg>'
  };
  const AR_D = '٠١٢٣٤٥٦٧٨٩', KEYCAP = t => BOX('#1C7ED6', `<text x="24" y="34" text-anchor="middle" font-size="${t.length > 1 ? 23 : 29}" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">${t}</text>`);
  for (let i = 0; i < 10; i++) HS.ICONS[i + '️⃣'] = HS.ICONS[i + '⃣'] = KEYCAP(AR_D[i]);
  HS.ICONS['🔟'] = KEYCAP('١٠');
  const SV = b => `<svg class="hs-ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${b}</svg>`;
  Object.assign(HS.ICONS, {
    '←': '<svg class="hs-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H6M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '→': '<svg class="hs-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '✔': BOX('#1C7ED6', LINE('M14 25l7 7 13-15')),
    '➗': BOX('#FF9600', '<path d="M13 24h22" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="24" cy="14.5" r="3.8" fill="#fff"/><circle cx="24" cy="33.5" r="3.8" fill="#fff"/>'),
    '🎲': SV('<rect x="6" y="6" width="36" height="36" rx="10" fill="#fff" stroke="#FF6F91" stroke-width="4"/>' + [[16, 16], [32, 16], [24, 24], [16, 32], [32, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#FF6F91"/>`).join('')),
    '🔗': SV('<g fill="none" stroke-width="6.5" stroke-linecap="round"><rect x="5" y="17" width="22" height="14" rx="7" stroke="#1C7ED6"/><rect x="21" y="17" width="22" height="14" rx="7" stroke="#FF9600"/></g>'),
    '⚔️': SV('<g stroke-linecap="round" stroke-width="5"><path d="M10 10l26 26" stroke="#8E5CF7"/><path d="M38 10L12 36" stroke="#FF6F91"/><path d="M30 38l8-8M10 30l8 8" stroke="#FFC800"/></g>'),
    '📁': SV('<path d="M5 14a4 4 0 014-4h10l4 5h16a4 4 0 014 4v17a4 4 0 01-4 4H9a4 4 0 01-4-4z" fill="#FFC800"/><path d="M5 20h38v16a4 4 0 01-4 4H9a4 4 0 01-4-4z" fill="#FF9600"/>'),
    '🔖': SV('<path d="M13 5h22v38l-11-8-11 8z" fill="#FF6F91"/><path d="M13 5h22v9H13z" fill="#fff" opacity=".18"/>'),
    '🎗️': SV('<path d="M24 22c-5-6-9-12-5-15s7 1 5 7c-2-6 1-10 5-7s0 9-5 15zM24 22l-9 20 5-2 3 5zM24 22l9 20-5-2-3 5z" fill="#8E5CF7"/>'),
    '🧬': SV('<g fill="none" stroke-width="4.5" stroke-linecap="round"><path d="M15 5c0 13 18 13 18 19s-18 6-18 19" stroke="#1C7ED6"/><path d="M33 5c0 13-18 13-18 19s18 6 18 19" stroke="#FF6F91"/></g><g stroke="#FFC800" stroke-width="3.5" stroke-linecap="round"><path d="M18 11h12M18 37h12M21 17h6M21 31h6"/></g>'),
    '🫧': SV('<g fill="#9AD0FF" stroke="#1C7ED6" stroke-width="2.5"><circle cx="19" cy="27" r="13" opacity=".85"/><circle cx="36" cy="14" r="7" opacity=".85"/><circle cx="37" cy="36" r="5" opacity=".85"/></g><path d="M12 22a8 8 0 016-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>'),
    '〰️': SV('<path d="M4 24c5-9 9-9 13 0s8 9 13 0 9-9 14 0" fill="none" stroke="#1C7ED6" stroke-width="6" stroke-linecap="round"/>'),
    '📎': SV('<path d="M30 14v18a7 7 0 01-14 0V12a5 5 0 0110 0v19a2.5 2.5 0 01-5 0V15" fill="none" stroke="#8E5CF7" stroke-width="4" stroke-linecap="round"/>'),
    '⛓️': SV('<g fill="none" stroke-width="6.5" stroke-linecap="round"><rect x="5" y="17" width="22" height="14" rx="7" stroke="#1C7ED6"/><rect x="21" y="17" width="22" height="14" rx="7" stroke="#FF9600"/></g>')
  });
  Object.assign(HS.ICONS, {
    '↑': HS.ICONS['→'].replace('<path', '<path transform="rotate(-90 12 12)"'), '↓': HS.ICONS['→'].replace('<path', '<path transform="rotate(90 12 12)"'), '➜': HS.ICONS['→'],
    '🤼': HS.ICONS['⚔️'], '➰': SV('<path d="M4 34c8 0 12-6 14-12s6-12 12-12 8 5 6 10-10 6-14 2-6-10-2-14" fill="none" stroke="#8E5CF7" stroke-width="5" stroke-linecap="round"/>'),
    '📊': SV('<rect x="5" y="40" width="38" height="4" rx="2" fill="#3C3C3C" opacity=".6"/><rect x="8" y="24" width="8" height="15" rx="2.5" fill="#FF6F91"/><rect x="20" y="12" width="8" height="27" rx="2.5" fill="#1C7ED6"/><rect x="32" y="18" width="8" height="21" rx="2.5" fill="#FFC800"/>'),
    '🪸': SV('<g fill="none" stroke="#FF6F91" stroke-width="5.5" stroke-linecap="round"><path d="M24 44V22M24 30c-8 0-10-6-10-12M14 22c-6 0-8-4-8-9M24 26c8 0 11-6 11-13M35 19c5 0 7-3 7-8M24 22c0-6 3-10 3-15"/></g>'),
    '🎙️': SV('<rect x="17" y="5" width="14" height="24" rx="7" fill="#8E5CF7"/><path d="M11 22a13 13 0 0026 0M24 35v7M17 42h14" fill="none" stroke="#3C3C3C" stroke-width="4" stroke-linecap="round"/>'),
    '🎚️': SV('<g stroke-linecap="round"><path d="M10 8v32M24 8v32M38 8v32" stroke="#C9C2B3" stroke-width="4"/></g><rect x="4" y="26" width="12" height="8" rx="4" fill="#FF9600"/><rect x="18" y="12" width="12" height="8" rx="4" fill="#1C7ED6"/><rect x="32" y="20" width="12" height="8" rx="4" fill="#FF6F91"/>'),
    '📴': SV('<rect x="13" y="4" width="22" height="40" rx="6" fill="#3C3C3C"/><rect x="16" y="9" width="16" height="27" rx="2" fill="#9AD0FF"/><path d="M8 8l32 32" stroke="#FF6F91" stroke-width="5" stroke-linecap="round"/>')
  });
  HS.ICONS['🪹'] = SV('<path d="M24 3v7" stroke="#8B5E34" stroke-width="3" stroke-linecap="round"/><path d="M10 6h28" stroke="#8B5E34" stroke-width="4" stroke-linecap="round"/><ellipse cx="24" cy="27" rx="10" ry="17" fill="#C99A5B"/><path d="M15 21q9 4 18 0M14.5 28q9.5 4 19 0M16 35q8 4 16 0" fill="none" stroke="#8B5E34" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="20" cy="19" rx="3" ry="6" fill="#fff" opacity=".25"/>');   // a cocoon (pupa)
  HS.ICONS['❔'] = HS.ICONS['❓']; HS.ICONS['▶'] = HS.ICONS['▶️'];
  const hasPic = em => !!(PIC_ALIAS[em] || PIC_ALIAS[em.replace(/️/g, '')] || HS.ICONS[em] || HS.ICONS[em.replace(/️/g, '')]);
  HS.picFor = (em, areas) => {
    const pm = window.HS_PICMAP || {}, bare = em.replace(/️/g, '');
    const al = PIC_ALIAS[em] || PIC_ALIAS[bare]; if (al && HS.ART[al]) return al;
    for (const a of areas) { const m = pm[a] || {}, id = m[em] || m[bare] || HS.picId(em, a); if (id && HS.ART[id]) return id; }
    return null;
  };
  HS.picify = (root, areas) => {
    areas = [].concat(areas); if (!root) return;
    const skip = el => !el || el.closest('[data-nopic],button.hs-spk,svg,textarea,input,select,option,.hs-party,[aria-hidden="true"].hs-fb,.m-pad,title');
    const run = () => {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
      for (let n; (n = w.nextNode());) {
        const v = n.nodeValue; if (!v || !/\p{Extended_Pictographic}|\p{Regional_Indicator}|[←→↑↓➜]|⃣/u.test(v) || skip(n.parentElement)) continue;
        const whole = v.trim(), alone = ONLY.test(v), wid = alone && (!KEEP.has(whole) || hasPic(whole)) ? HS.picFor(whole, areas) : null;   // several emoji drawn as one picture (🐪🌵🦎)
        const parts = []; let last = 0, any = false;
        if (wid) { parts.push({ id: wid, em: whole, big: true }); any = true; }
        else for (const m of v.matchAll(EMO)) {
          const em = m[0], kept = (KEEP.has(em) || KEEP.has(em.replace(/️/g, ''))) && !hasPic(em), id = kept ? null : (HS.picFor(em, areas) || (HS.ICONS[em] ? 'ico:' + em : HS.ICONS[em.replace(/️/g, '')] ? 'ico:' + em.replace(/️/g, '') : null));
          if (!id) continue;
          if (m.index > last) parts.push(v.slice(last, m.index));
          parts.push({ id, em, big: alone }); last = m.index + em.length; any = true;
        }
        if (!any) continue;
        if (!wid && last < v.length) parts.push(v.slice(last));
        todo.push([n, parts]);
      }
      todo.forEach(([n, parts]) => {
        const t = document.createElement('template');
        t.innerHTML = parts.map(p => typeof p === 'string' ? HS.esc(p) : p.id.startsWith('ico:') ? HS.ICONS[p.id.slice(4)].replace('hs-ico', 'hs-ico' + (p.big ? '' : ' inl')) : HS.art(p.id, { small: true, eager: true, fb: p.em, cls: 'hs-pic' + (p.big ? '' : ' inl') })).join('');
        n.replaceWith(t.content);
      });
    };
    let q = 0; new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; run(); }); }).observe(root, { childList: true, subtree: true, characterData: true });
    run();
  };
  HS.art = (id, o = {}) => {
    const a = HS.ART[id], fb = o.fb == null ? '' : String(o.fb);
    if (!a) return fb ? `<span class="hs-fb ${o.fbCls || ''}" aria-hidden="true">${fb}</span>` : '';
    const src = (o.face && a.face) || (o.small && a.sm) || a.src, sz = o.size ? ` width="${o.size}" height="${o.size}"` : '';
    return `<img class="hs-art ${o.cls || ''}" src="${src}" alt="${HS.esc(o.alt || '')}"${sz} decoding="async"${o.eager ? '' : ' loading="lazy"'} draggable="false" data-fb="${HS.esc(fb)}" onerror="HS.artFail(this)">`;
  };
  /** a listed picture failed to load (e.g. offline before it was cached): show its fallback instead of a broken image */
  HS.artFail = img => { const s = document.createElement('span'); s.className = 'hs-fb'; s.setAttribute('aria-hidden', 'true'); s.textContent = img.dataset.fb || ''; img.replaceWith(s); };
  /** static markup: <span data-art="id">🧩</span> becomes the picture when it exists (the emoji stays otherwise) */
  HS.hydrateArt = root => (root || document).querySelectorAll('[data-art]').forEach(el => {
    if (!HS.hasArt(el.dataset.art) || el.querySelector('img')) return;
    el.innerHTML = HS.art(el.dataset.art, { small: el.hasAttribute('data-art-small'), fb: el.textContent.trim() }); el.classList.add('has-art');
  });
  HS.mascot = (pose, o = {}) => HS.art('mascot-' + pose, o);

  /* avatars: a profile's `avatar` is still one string. Old profiles keep their emoji; new ones store a picture id
     (e.g. "avatar-fox"). Nothing is migrated, so synced devices and saved data stay the same. */
  const AV_FROM_EMOJI = { '🦊': 'avatar-fox', '🐼': 'avatar-panda', '🦁': 'avatar-lion', '🐰': 'avatar-bunny', '🦄': 'avatar-unicorn' };   // only exact matches
  const isAvId = v => /^avatar-[a-z0-9-]+$/.test(v || '');
  /** picture choices for a new child: children first, then animals and friends; the emoji list if no pictures exist */
  HS.avatarChoices = () => {
    const ids = Object.keys(HS.ART).filter(k => isAvId(k) && !/-happy$/.test(k));
    const kid = k => /^avatar-(boy|girl)-/.test(k);
    return ids.length ? [...ids.filter(kid), ...ids.filter(k => !kid(k))] : HS.AVATARS;
  };
  HS.avatarArt = v => isAvId(v) ? (HS.ART[v] ? v : null) : (AV_FROM_EMOJI[v] && HS.ART[AV_FROM_EMOJI[v]] ? AV_FROM_EMOJI[v] : null);
  /** the avatar of profile p as HTML (picture or emoji); o.big uses the 512px picture */
  HS.avatar = (p, o = {}) => {
    const v = (p && p.avatar) || '🙂', id = HS.avatarArt(v);
    if (id) return `<span class="hs-av">${HS.art(id, { face: !o.big, small: !o.big, cls: 'hs-av-img', fb: '🙂', eager: o.eager })}</span>`;
    return `<span class="hs-av-em" aria-hidden="true">${HS.esc(isAvId(v) ? '🙂' : v)}</span>`;
  };
  /** the child's happy face (avatar-…-happy) when it exists, otherwise the usual one: for results screens */
  HS.avatarHappy = (p, o = {}) => {
    const id = HS.avatarArt((p && p.avatar) || ''), h = id && HS.ART[id + '-happy'] ? id + '-happy' : null;
    return h ? `<span class="hs-av">${HS.art(h, { face: !o.big, small: !o.big, cls: 'hs-av-img', fb: '🙂', eager: true })}</span>` : HS.avatar(p, o);
  };
  /** next to the mascot on a results screen: the child, smiling (nothing for a guest) */
  HS.kidCheer = () => { const me = HS.current(); return me && me.id !== 'guest' ? `<span class="kid-cheer" style="background:${HS.kidColor(me)}">${HS.avatarHappy(me)}</span>` : ''; };
  /** for plain text (a <select> option, a sentence): the emoji, or nothing for a picture avatar */
  HS.avatarText = p => { const v = (p && p.avatar) || ''; return isAvId(v) ? '' : v; };
  /** spoken/read names of the picture avatars, for screen readers in the picker */
  HS.AVATAR_NAMES = { 'boy-cap': 'ولد بقبعة', 'boy-curly': 'ولد بشعر مجعّد', 'boy-glasses': 'ولد بنظارة', 'boy-thobe': 'ولد بثوب',
    'girl-bob': 'بنت بشعر قصير', 'girl-braids': 'بنت بضفيرتين', 'girl-ponytail': 'بنت بذيل حصان', 'girl-waves': 'بنت بشعر مموّج',
    cat: 'قطة', dragon: 'تنين صغير', fox: 'ثعلب', panda: 'باندا', lion: 'شبل', bunny: 'أرنب', robot: 'روبوت', unicorn: 'حصان وحيد القرن', 'star-sprite': 'نجمة سحرية', 'cloud-pal': 'غيمة' };
  HS.avatarName = v => isAvId(v) ? HS.AVATAR_NAMES[v.slice(7)] || 'صورة' : v;

  /* reward pictures: the parent can rename rewards and change their emoji, so a default reward shows its
     picture only while it still has its original emoji (r = a reward, or a bought coupon with .rid) */
  const RW_ART = { r1: ['📱', 'reward-ipad'], r2: ['🎮', 'reward-playstation'], r3: ['🍦', 'reward-icecream'], r5: ['🎬', 'reward-movie'],
    r6: ['🏞️', 'reward-park'], r7: ['📖', 'reward-story'], r8: ['🎲', 'reward-boardgame'], r9: ['🍽️', 'reward-dinner'], r10: ['🧸', 'reward-toy'] };
  HS.rewardArt = (r, o = {}) => { const m = RW_ART[r.rid || r.id]; return HS.art(m && m[0] === r.em ? m[1] : null, Object.assign({ small: true, fb: HS.esc(r.em || '🎁') }, o)); };
  HS.profiles = () => S.profiles.slice();
  HS.current = () => S.profiles.find(p => p.id === S.current) || (S.profiles.length ? null : GUEST);
  HS.setCurrent = id => { S.current = id; HS.save(); emit('profile'); };
  HS.addProfile = ({ name, avatar, color, grade, focus, needFocus }) => {
    const id = 'p' + Date.now().toString(36);
    const pr = { id, name: (name || '').trim() || 'بطل', avatar: avatar || '⭐', color: color || HS.COLORS[0] };
    if (grade) pr.grade = grade;
    if (focus) pr.focus = focus.slice();
    if (needFocus) pr.needFocus = true;
    S.profiles.push(pr);
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

  /* ---------- diamonds, stars & practice days ----------
     Each child has a grade and focus subjects (the hard ones, chosen by the parent).
     - Work in a focus subject (or a focus group of kindergarten games) earns blue diamonds 💎.
     - Everything else earns yellow stars ⭐; every 10 stars turn into 1 diamond by themselves.
     - Gifts in the shop are bought with diamonds only.
     p.dia = diamonds ever earned · p.diaSpent = diamonds spent · p.cs = stars waiting to become a diamond (0–9)
     p.stars = yellow stars ever earned (for fun; they no longer buy gifts) · p.spent = stars spent before diamonds existed */
  HS.STARS_PER_DIAMOND = 10;
  HS.diamonds = id => { const p = prof(id); return (p.dia || 0) - (p.diaSpent || 0); };
  HS.stars = HS.diamonds;   // what the shop spends: diamonds (old name kept for the apps that read it)
  HS.yellow = id => prof(id).stars;
  HS.toNextDiamond = id => prof(id).cs || 0;
  HS.earned = id => prof(id).dia || 0;
  /** the grade a profile chose, and its focus list (subject ids of that grade, or kindergarten game groups) */
  HS.gradeOf = p => (p && p.grade) || '';
  HS.focusOf = p => (p && p.focus) || [];
  /* kindergarten game groups a parent can pick as focus (game keys from src/apps/kg/app.html) */
  HS.KG_GROUPS = [
    { id: 'letters', name: 'الحروف والأصوات', em: '🔤', games: ['letters', 'first', 'sound'] },
    { id: 'numbers', name: 'الأرقام والعدّ', em: '🔢', games: ['count', 'race', 'quick', 'more', 'size'] },
    { id: 'world', name: 'العالم من حولنا (ألوان، أشكال، حيوانات، مشاعر)', em: '🎨', games: ['col', 'shp', 'ani', 'basket', 'feel'] },
    { id: 'think', name: 'ألعاب التفكير', em: '🧠', games: ['puzzle', 'compose', 'where', 'robot', 'story', 'rule', 'tale', 'build', 'pat', 'odd', 'memory'] }
  ];
  /** where the child is right now, read from the address: { year, subject } for a unit, { kg: game } or { app } */
  HS.place = (hash) => {
    const h = (hash == null ? location.hash : hash).replace(/^#/, ''); let m;
    if ((m = /^unit-([a-z0-9]+)/.exec(h))) {
      for (const y of window.CATALOG || []) for (const sb of y.subjects || []) for (const u of sb.units || []) if (u.unit === m[1]) return { year: y.id, subject: sb.id };
      return { unit: m[1] };
    }
    if ((m = /^app-kg-game-([a-z]+)/.exec(h))) return { year: 'kg', kg: m[1] };
    if ((m = /^app-([a-z]+)/.exec(h))) return { app: m[1] };
    return {};
  };
  /** does work at this place count as focus work for profile p? */
  HS.isFocus = (p, pl) => {
    const f = HS.focusOf(p); if (!f.length) return false; pl = pl || HS.place();
    if (pl.kg) return HS.gradeOf(p) === 'kg' && HS.KG_GROUPS.some(g => f.includes(g.id) && g.games.includes(pl.kg));
    if (pl.subject) return pl.year === HS.gradeOf(p) && f.includes(pl.subject);
    if (pl.app === 'dict') return f.includes('en');   // the dictionary is English practice
    return false;
  };
  const logDia = (p, n) => { const t = HS.today(); p.log = p.log || {}; p.log[t] = (p.log[t] || 0) + n; const ks = Object.keys(p.log); if (ks.length > 60) delete p.log[ks.sort()[0]]; };
  HS.addStars = (n = 1) => {
    const me = HS.current(), p = prof(); markDay(p);
    let dia = 0;
    if (me && HS.isFocus(me)) dia = n;
    else { p.stars += n; p.cs = (p.cs || 0) + n; while (p.cs >= HS.STARS_PER_DIAMOND) { p.cs -= HS.STARS_PER_DIAMOND; dia++; } }
    if (dia) { p.dia = (p.dia || 0) + dia; logDia(p, dia); }   // diamonds per day, for the parent's pricing
    HS.save(); emit('stars');
    if (dia) emit('diamond', dia);
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
    const o = { id: 'o' + Date.now().toString(36), rid: r.id, em: r.em, name: r.name, cost: r.cost, t: Date.now(), st: 'wait', u: 'dia' };
    HS.orders().push(o); p.diaSpent = (p.diaSpent || 0) + r.cost;
    if (p.goal === rid) p.goal = '';
    if (p.orders.length > 80) p.orders.splice(0, p.orders.length - 80);
    HS.save(); emit('stars'); return o;
  };
  /* savings goal: one reward the child is saving for (goal-gradient: effort rises as the goal gets close) */
  HS.goal = id => { const g = prof(id).goal; return g ? HS.rewardsFor(id).find(r => r.id === g) || null : null; };
  HS.setGoal = rid => { prof().goal = rid || ''; HS.save(); emit('stars'); };
  /* surprise gift from the parent (unexpected rewards don't lower interest the way promised ones can) */
  HS.gift = (pid, n, msg) => { const p = prof(pid); p.dia = (p.dia || 0) + n; (p.gifts = p.gifts || []).push({ n, msg: msg || '', t: Date.now(), seen: false }); if (p.gifts.length > 30) p.gifts.shift(); HS.save(); emit('stars'); };
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
    o.st = how; o.done = Date.now(); if (how === 'back') { if (o.u === 'dia') p.diaSpent = Math.max(0, (p.diaSpent || 0) - o.cost); else p.spent = Math.max(0, (p.spent || 0) - o.cost); }
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
    HS.stopSpeak(); if (S.settings.mute) return; const my = token; let i = 0;
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
    if (!S.settings.sound || S.settings.mute) return;
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
