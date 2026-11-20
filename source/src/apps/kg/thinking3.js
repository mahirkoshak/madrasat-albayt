/* ============================================================
   MORE PLAY GAMES (loaded after thinking2.js, same scope). Each has 3 levels that adapt like the others.
   - race:  number race on a straight 1–10 board (Siegler & Ramani: linear number board games build
            number sense; saying each number while moving is the key part)
            1 spin 1–2, tap each square, the next square glows · 2 spin 1–3, no glow · 3 tap where you land
   - quick: quick look (subitizing, Clements & Sarama): dots show for a moment, then hide
            1 dice dots 1–3 · 2 dice dots 1–6 · 3 two groups in two colours (5 and 2 → 7)
   - more:  which has more? 1 very different groups · 2 close groups, more or fewer, the smaller group drawn bigger
            · 3 numerals only (bigger / smaller number)
   - size:  order by size (seriation): 1 three, small to big · 2 four · 3 five close sizes, sometimes big to small
   - sound: same first sound (phonological awareness before letters: no letters shown, every word spoken)
            1 three pictures · 2 four pictures · 3 which one starts with a different sound
   - feel:  feelings: 1 find the face · 2 a short situation, which face · 3 more feelings, closer faces
   ============================================================ */
const { SOUNDS, FEEL, FEEL_EASY, FEEL_SIT, SIZE_EM, MORE_EM } = APPDATA.kg;
Object.assign(THINK_ROUNDS, { race: 2, quick: 5, more: 5, size: 4, sound: 5, feel: 5 });
Object.assign(THINK_MAX, { race: 3, quick: 3, more: 3, size: 3, sound: 3, feel: 3 });

const numTxt = n => lang() === 'ar' ? NUM[n - 1][1] : String(n);
const numSay = n => [lang() === 'ar' ? NUM[n - 1][2] : NUM[n - 1][3], lang()];
const retry = () => [lang() === 'ar' ? HS_PHRASES.retryF.ar : HS_PHRASES.retry.en, lang()];
/** show a question made of several spoken parts (the 🔊 button repeats all of them) */
function askAll(text, parts) { $('gQ').textContent = text; $('gQ').style.direction = lang() === 'ar' ? 'rtl' : 'ltr'; G.sp = parts; say(parts); }
/** one question finished: record it, say what was found and praise, then the next one */
function playDone(ok, pre = []) {
  track(ok); say([...pre, ...praise()]); G.round++; dots();
  later(() => { if (G.round >= G.roundN) endOfRound(); thinkStart(G.k); }, pre.length ? 2900 : 2200);
}
/** answer buttons: right → done; wrong → greyed out, «let's try again» and the question again */
function choices(box, opts, ans, onRight, onWrong) {
  let first = true;
  box.innerHTML = opts.map((o, i) => `<button type="button" class="opt" data-i="${i}"${i === ans ? ' data-r' : ''}>${o}</button>`).join('');
  box.className = 'opts' + (opts.length === 4 ? ' four' : '') + (opts.length === 2 ? ' two' : '');
  box.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (+b.dataset.i === ans) { box.querySelectorAll('.opt').forEach(x => x.disabled = true); b.classList.add('ok'); HS.fx('ok'); onRight(first); }
    else { first = false; b.classList.add('no'); b.disabled = true; HS.fx('no'); if (onWrong) onWrong(); else say([retry(), ...G.sp]); }
  });
}

/* ---------------- 🏁 number race ---------------- */
function raceGame() {
  const L = G.lv, l = lang(), maxStep = L === 1 ? 2 : 3, TOKEN = '🐇';
  let pos = 0, target = 0, mistakes = 0, wrongHere = 0, moving = false;
  const root = fresh(`<div class="rc"><div class="rc-board" dir="ltr"><span class="rc-start" aria-hidden="true"></span>${Array.from({ length: 10 }, (_, i) => `<button type="button" class="rc-sq" data-n="${i + 1}" aria-label="${i + 1}"><b>${numTxt(i + 1)}</b><span class="rc-tok"></span></button>`).join('')}</div>
    <div class="rc-ctl"><button type="button" class="rc-spin" aria-label="${l === 'ar' ? 'أدِر العجلة' : 'Spin'}"><span class="rc-wheel" aria-hidden="true" data-nopic>🎡</span></button><div class="rc-res" aria-live="polite"></div></div></div>`);
  const sq = n => root.querySelector(`.rc-sq[data-n="${n}"]`), spin = root.querySelector('.rc-spin'), res = root.querySelector('.rc-res');
  const draw = () => {
    root.querySelectorAll('.rc-tok').forEach(t => t.textContent = ''); root.querySelector('.rc-start').textContent = pos ? '🏁' : TOKEN;
    if (pos) sq(pos).querySelector('.rc-tok').textContent = TOKEN;
    root.querySelectorAll('.rc-sq').forEach(s => { s.classList.toggle('past', +s.dataset.n <= pos); s.classList.remove('glow'); });
  };
  const glow = n => { root.querySelectorAll('.rc-sq').forEach(s => s.classList.toggle('glow', +s.dataset.n === n)); };
  const turnEnd = () => {
    moving = false; target = 0;
    if (pos >= 10) { HS.party(); return playDone(mistakes <= 1, [[P.raceWin[l](), l]]); }
    later(() => { spin.disabled = false; askAll(P.raceSpin[l](), [[P.raceSpin[l](), l]]); }, 1300);
  };
  spin.onclick = () => {
    spin.disabled = true; spin.classList.add('go'); HS.fx('tap'); let k = 0;
    const iv = setInterval(() => { res.innerHTML = `<b>${numTxt(1 + (k++ % maxStep))}</b>`; }, 110);
    later(() => {
      clearInterval(iv); spin.classList.remove('go');
      const n = 1 + rnd(maxStep); target = Math.min(10, pos + n); wrongHere = 0; root.dataset.pos = pos; root.dataset.target = target;
      res.innerHTML = `<b>${numTxt(n)}</b><span class="rc-dots">${'●'.repeat(n)}</span>`;
      const q = L === 3 ? P.raceLand[l](n) : P.raceGo[l](n);
      askAll(q, [[q, l]]); if (L === 1) glow(pos + 1);
    }, 800);
    setTimeout(() => clearInterval(iv), 900);
  };
  root.querySelectorAll('.rc-sq').forEach(b => b.onclick = () => {
    if (!target || moving) return;
    const n = +b.dataset.n;
    if (L < 3) {   // count each square while moving
      if (n === pos + 1) { pos = n; HS.fx('ok'); draw(); say([numSay(n)]); wrongHere = 0; if (pos >= target) turnEnd(); else if (L === 1) glow(pos + 1); return; }
    } else if (n === target) {   // hop there, saying each number
      moving = true; HS.fx('ok'); const from = pos; say(Array.from({ length: target - from }, (_, i) => numSay(from + i + 1)));
      const hop = () => { pos++; draw(); if (pos < target) later(hop, 520); else later(turnEnd, 500); }; hop(); return;
    }
    mistakes++; wrongHere++; HS.fx('no'); shake(b);
    if (wrongHere >= 2) glow(L < 3 ? pos + 1 : target);
    say([retry(), ...G.sp]);
  });
  draw(); res.innerHTML = ''; askAll(P.raceSpin[l](), [[P.raceSpin[l](), l]]);
}

/* ---------------- 👀 quick look ---------------- */
const DICE = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const die = (n, c = '') => `<span class="qk-die ${c}">${Array.from({ length: 9 }, (_, i) => `<i${DICE[n].includes(i) ? ' class="d"' : ''}></i>`).join('')}</span>`;
POOLS.quick = { 1: [1, 2, 3], 2: [1, 2, 3, 4, 5, 6], 3: [[5, 1], [5, 2], [5, 3], [4, 2], [4, 3], [4, 4], [3, 3], [3, 2], [6, 2]] };
function quickGame() {
  const L = G.lv, l = lang(), item = bag(POOLS.quick[L]), parts = L === 3 ? item : [item], n = parts.reduce((a, b) => a + b, 0);
  const ms = L === 1 ? 2000 : L === 2 ? 1500 : 1800;
  const root = fresh(`<div class="qk"><div class="qk-show">${parts.map((p, i) => die(p, 'c' + i)).join('')}<span class="qk-cover" aria-hidden="true">❓</span></div>
    <button type="button" class="qk-again" aria-label="${l === 'ar' ? 'انظر مرة ثانية' : 'Look again'}" data-nopic>👀</button><div class="opts" id="qkOpts"></div></div>`);
  const show = root.querySelector('.qk-show'); let seen = 0;
  const flash = () => { show.classList.remove('hid'); seen++; later(() => show.classList.add('hid'), ms); };
  let first = true;
  root.querySelector('.qk-again').onclick = () => { first = false; flash(); };
  const o = nearNums(n, L === 1 ? 3 : 4, 10);
  choices(root.querySelector('#qkOpts'), o.map(numTxt), o.indexOf(n), f => { show.classList.remove('hid'); show.classList.add('done'); playDone(f && first, [numSay(n)]); }, () => { first = false; say([retry(), ...G.sp]); flash(); });
  askAll(P.quick[l](), [[P.quick[l](), l]]); later(flash, 350);
}

/* ---------------- ⚖️ which has more? ---------------- */
function moreGame() {
  const L = G.lv, l = lang(); let a, b, askMore = true;
  if (L === 1) { a = 1 + rnd(3); b = a + 3 + rnd(3); }
  else if (L === 2) { a = 2 + rnd(5); b = a + 1 + rnd(2); askMore = Math.random() < .5; }
  else { a = 1 + rnd(7); b = Math.min(10, a + 1 + rnd(3)); askMore = Math.random() < .5; }
  const vals = shuffle([a, b]), ans = vals.indexOf(askMore ? Math.max(a, b) : Math.min(a, b)), em = HS.bag('kg-more-em', MORE_EM);
  const group = v => {   // level 2: the smaller group is drawn bigger and spread out, so size alone misleads
    const big = L === 2 && v === Math.min(a, b), fs = big ? 46 : v > 6 ? 26 : 32;
    return `<span class="mr-grp${big ? ' big' : ''}" style="font-size:${fs}px">${Array.from({ length: v }, () => `<span>${em}</span>`).join('')}</span>`;
  };
  const q = L === 3 ? (askMore ? P.bigNum : P.smallNum)[l]() : (askMore ? P.more : P.fewer)[l]();
  const root = fresh(`<div class="mr"><div class="opts two" id="mrOpts"></div></div>`);
  choices(root.querySelector('#mrOpts'), vals.map(v => L === 3 ? `<span class="mr-num">${numTxt(v)}</span>` : group(v)), ans, f => playDone(f, [numSay(vals[ans])]));
  askAll(q, [[q, l]]);
}

/* ---------------- 📏 order by size ---------------- */
const SIZES = { 1: [34, 70, 116], 2: [30, 54, 80, 112], 3: [36, 52, 68, 86, 106] };
function sizeGame() {
  const L = G.lv, l = lang(), em = bag(SIZE_EM), down = L === 3 && Math.random() < .5;
  const want = down ? SIZES[L].slice().reverse() : SIZES[L].slice(); let step = 0, mistakes = 0, wrongHere = 0;
  const root = fresh(`<div class="sz"><div class="sz-pool">${shuffle(SIZES[L].slice()).map(s => `<button type="button" class="sz-it" data-s="${s}" style="font-size:${s}px">${em}</button>`).join('')}</div>
    <div class="sz-row${down ? ' down' : ''}" aria-hidden="true">${want.map(() => '<span class="sz-slot"></span>').join('')}</div></div>`);
  const q = (down ? P.sizeDown : P.sizeUp)[l]();
  root.querySelectorAll('.sz-it').forEach(b => b.onclick = () => {
    if (b.classList.contains('used')) return;
    if (+b.dataset.s === want[step]) {
      b.classList.add('used'); HS.fx('ok'); root.querySelectorAll('.sz-slot')[step].innerHTML = `<span class="hs-pop" style="font-size:${b.dataset.s * .62}px">${em}</span>`;
      root.querySelectorAll('.sz-it').forEach(x => x.classList.remove('glow')); step++; wrongHere = 0;
      if (step === want.length) playDone(mistakes === 0);
      return;
    }
    mistakes++; wrongHere++; HS.fx('no'); shake(b);
    const smallest = (want[step] === Math.min(...want.slice(step)));
    if (wrongHere >= 2) root.querySelector(`.sz-it[data-s="${want[step]}"]`).classList.add('glow');
    say([[(smallest ? P.sizeSmall : P.sizeBig)[l](), l]]);
  });
  askAll(q, [[q, l]]);
}

/* ---------------- 👂 same first sound ---------------- */
function soundGame() {
  const L = G.lv, l = lang(), groups = SOUNDS[l], near = SOUNDS.near[l];
  const g = bag(groups), close = new Set([g[0]]); near.forEach(p => { if (p.includes(g[0])) p.forEach(x => close.add(x)); });
  // other groups: never a sound that is easy to mix up with this one, and never two from the same group
  const others = shuffle(groups.filter(x => !close.has(x[0])));
  const words = shuffle(g[1].slice()); let opts, ans, q, parts;
  if (L < 3) {
    const t = words[0], right = words[1], wrong = others.slice(0, L === 1 ? 2 : 3).map(x => one(x[1]));
    opts = shuffle([right, ...wrong]); ans = opts.indexOf(right);
    q = P.sound[l](t[0]); parts = [[q, l], ...opts.map(o => [o[0], l])];
    $('gShow').innerHTML = `<div class="sd-target">${t[1]}</div>`;
  } else {
    const odd = one(others[0][1]); opts = shuffle([words[0], words[1], odd]); ans = opts.indexOf(odd);
    q = P.soundOdd[l](); parts = [[q, l], ...opts.map(o => [o[0], l])];
    $('gShow').innerHTML = '';
  }
  const root = fresh(`<div class="sd"><div class="opts" id="sdOpts"></div></div>`);
  choices(root.querySelector('#sdOpts'), opts.map(o => `<span class="sd-em">${o[1]}</span>`), ans, f => playDone(f, L < 3 ? [[words[0][0], l], [opts[ans][0], l]] : [[opts[ans][0], l]]));
  askAll(q, parts);
}

/* ---------------- 😊 feelings ---------------- */
function feelGame() {
  const L = G.lv, l = lang(), face = k => `<span class="fl-face">${FEEL[k][0]}</span>`;
  const root = fresh(`<div class="fl"><div class="opts" id="flOpts"></div></div>`); $('gShow').innerHTML = '';
  if (L === 1) {
    const k = bag(FEEL_EASY), opts = shuffle([k, ...shuffle(FEEL_EASY.filter(x => x !== k)).slice(0, 2)]);
    const q = P.feelFace[l](FEEL[k]);
    choices(root.querySelector('#flOpts'), opts.map(face), opts.indexOf(k), f => playDone(f));
    return askAll(q, [[q, l]]);
  }
  POOLS.feel2 = POOLS.feel2 || FEEL_SIT.filter(s => FEEL_EASY.includes(s[2]));
  const s = bag(L === 2 ? POOLS.feel2 : FEEL_SIT), all = L === 2 ? FEEL_EASY : Object.keys(FEEL);
  const wrong = shuffle(all.filter(x => x !== s[2] && !s[3].includes(x))).slice(0, L === 2 ? 2 : 3), opts = shuffle([s[2], ...wrong]);
  const text = l === 'ar' ? s[0] : s[1];
  $('gShow').innerHTML = `<div class="fl-sit">${HS.esc ? HS.esc(text) : text}</div>`;
  choices(root.querySelector('#flOpts'), opts.map(face), opts.indexOf(s[2]), f => playDone(f, [[P.feelName[l](FEEL[s[2]]), l]]));
  askAll(P.feelSit[l](), [[text, l], [P.feelSit[l](), l]]);
}

Object.assign(THINK_GAMES, { race: raceGame, quick: quickGame, more: moreGame, size: sizeGame, sound: soundGame, feel: feelGame });
