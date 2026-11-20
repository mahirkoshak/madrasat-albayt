/* ================= arcade: what makes the unit games adapt, and the games every unit gets from its own content =================
   Built on learning research (see README «Unit games»):
   - retrieval: the child recalls (who-am-I, find the mistake, build the term) rather than only recognising
   - interleaving: odd-one-out and the daily challenge mix items from every sorting game and lesson
   - success rate: 3 levels per game; up after ≥85% right, down below 50%, so a child stays at roughly 75–90% right
   - mistakes come back: a wrong item is weighted and dealt first next time, until answered right twice
   - hints: short, plain words, shown in a coach box inside the game (not a toast), and they stay until the child moves on
   Data (per child, per unit, in D()): g[key] = { lv, h: [last accuracies] } · miss[itemId] = weight · daily = { day, n } */

/* ---------- levels ---------- */
const LV_UP = .85, LV_DOWN = .5;
function gData() { const d = D(); d.g = d.g || {}; d.miss = d.miss || {}; return d; }
function gLv(key) { return Math.min(3, Math.max(1, (gData().g[key] || {}).lv || 1)); }
/** record one finished game and move the level: returns { lv, change: 'up' | 'down' | '' } */
function gAdapt(key, right, total) {
  const d = gData(), g = d.g[key] = d.g[key] || { lv: 1, h: [] }, acc = total ? right / total : 0;
  g.h = (g.h || []).concat(Math.round(acc * 100)).slice(-5); let change = '';
  if (acc >= LV_UP && g.lv < 3) { g.lv++; change = 'up'; } else if (acc < LV_DOWN && g.lv > 1) { g.lv--; change = 'down'; }
  HS.save(); return { lv: g.lv, change };
}
const lvPath = lv => `<span class="g-lv" role="img" aria-label="المستوى ${ar(lv)} من ٣">${[1, 2, 3].map(i => `<i class="${i <= lv ? 'f' : ''}"></i>`).join('')}</span>`;

/* ---------- mistakes come back ---------- */
function missed(id) { return gData().miss[id] || 0; }
function missAdd(id) { if (!id) return; const d = gData(); d.miss[id] = Math.min(6, (d.miss[id] || 0) + 2); HS.save(); }
function missOk(id) { if (!id) return; const d = gData(); if (d.miss[id]) { d.miss[id]--; if (d.miss[id] <= 0) delete d.miss[id]; HS.save(); } }
/** n items from a pool: up to half of them items the child got wrong before (most-missed first), the rest new at random */
function deal(pool, idf, n) {
  const back = pool.filter(x => missed(idf(x))).sort((a, b) => missed(idf(b)) - missed(idf(a)) || Math.random() - .5).slice(0, Math.ceil(n / 2));
  return HS.shuffle(back.concat(HS.shuffle(pool.filter(x => !back.includes(x)))).slice(0, n));
}

/* ---------- the coach box: hints next to the cards, staying until the next move ---------- */
const coachBox = () => `<div class="coach" id="uCoach" role="status" aria-live="polite" hidden></div>`;
function coach(html, kind = 'info') {
  const c = $('uCoach'); if (!c || !html) return;
  c.hidden = false; c.className = 'coach ' + kind;
  c.innerHTML = `<span class="coach-av" aria-hidden="true">${HS.mascot(kind === 'ok' ? 'cheer' : 'thinking', { small: true, fb: '🐨' })}</span><div class="coach-tx">${html}</div>`;
  c.classList.remove('hs-pop'); void c.offsetWidth; c.classList.add('hs-pop');
  const r = c.getBoundingClientRect(); if (r.bottom > innerHeight - 10 || r.top < 60) c.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
function coachOff() { const c = $('uCoach'); if (c) { c.hidden = true; c.innerHTML = ''; } }

/* ---------- what the unit's content offers ---------- */
const plain = s => String(s || "").replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "").replace(/\s+/g, " ").trim();
const binName = lab => plain(lab);
/** every sorting card: { g, it: [em, text, bin], id } */
const sortCards = () => S.u.games.sort.flatMap(g => g.items.map(it => ({ g, it, id: 's:' + g.id + ':' + it[1] })));
const gloss = l => (S.u.glossary || []).filter(g => !l || g.l === l);
const gid = g => 'gl:' + g.term;
const mean = g => g.short || g.def;
/** statements a child can judge: true ones, and false ones made by swapping a box or a meaning */
function statements() {
  const out = [];
  (S.u.questions || []).filter(q => q.t === 'tf').forEach(q => out.push({ id: 'tf:' + q.id, text: q.q, truth: !!q.a, why: q.ex || '', kind: 'tf' }));
  const G = gloss();
  G.forEach(g => {
    const other = HS.shuffle(G.filter(x => x !== g && mean(x) !== mean(g)))[0];
    out.push({ id: gid(g), kind: 'gl', g, other, em: g.em,
      t: `<b>${g.term}</b>: ${mean(g)}`, f: other ? `<b>${g.term}</b>: ${mean(other)}` : '', why: `<b>${g.term}</b>: ${g.def}` });
  });
  sortCards().forEach(c => {
    const [em, text, b] = c.it, wrong = HS.shuffle(c.g.bins.map((_, i) => i).filter(i => i !== b))[0];
    out.push({ id: c.id, kind: 's', c, em, t: `${text} ⬅ ${binName(c.g.bins[b][0])}`, f: wrong !== undefined ? `${text} ⬅ ${binName(c.g.bins[wrong][0])}` : '',
      why: `${text} ⬅ <b>${binName(c.g.bins[b][0])}</b>${c.g.why && c.g.why[b] ? '. ' + c.g.why[b] : ''}` });
  });
  return out;
}

/* ---------- a game made of rounds: progress, score, coach, level, end card ---------- */
function runRounds(key, title, rounds, opt = {}) {
  stopAll(); HS.markPractice();
  const lv = opt.lv || gLv(key), total = rounds.length, combo = HS.makeCombo();
  let i = 0, right = 0, done = 0, hearts = opt.hearts || 0, stage0 = -1;
  M().innerHTML = `<div class="card arc">${gameHead(title)}
    <div class="meta"><span id="aPos"></span>${opt.noLv ? '' : lvPath(lv)}<span id="aSc">✅ ${ar(0)}</span></div>
    ${hearts ? '<div class="hearts" id="aHearts" data-nopic aria-live="polite"></div>' : ''}
    <div id="aStage"></div>${coachBox()}
    <div class="row center"><button type="button" class="btn" id="aNext" hidden>التالي ←</button></div></div>`;
  const drawHearts = () => { const h = $('aHearts'); if (h) h.innerHTML = Array.from({ length: opt.hearts }, (_, k) => `<span class="${k < hearts ? '' : 'lost'}" aria-hidden="true">❤️</span>`).join('') + `<span class="sr">${ar(hearts)} قلوب</span>`; };
  const finish = () => {
    if (opt.onEnd) opt.onEnd(right, done);
    if (opt.noLv) return endCard(title, right, done, null, opt.endLine);
    endCard(title, right, done, gAdapt(key, right, done), opt.endLine);
  };
  const next = () => {
    if (i >= total || (opt.hearts && hearts <= 0)) return finish();
    if (stage0 === i) return; stage0 = i;   // a round is drawn once (the auto-advance and a tap on «التالي» can both call next)
    coachOff(); $('aNext').hidden = true;
    $('aPos').textContent = `${ar(i + 1)} / ${ar(total)}`; drawHearts();
    const R = rounds[i], stage = $('aStage'); stage.innerHTML = ''; let answered = false;
    R.draw(stage, (ok, why) => {
      if (answered) return; answered = true; i++; done++;
      if (ok) { right++; star(1 + combo.hit()); HS.fx('ok'); missOk(R.id); }
      else { combo.miss(); HS.fx('no'); missAdd(R.id); if (opt.hearts) { hearts--; drawHearts(); } }
      $('aSc').textContent = `✅ ${ar(right)}`;
      coach(ok ? `<b>${HS.one(HS_PHRASES.praise.ar)}</b>${why ? '<br>' + why : ''}` : why, ok ? 'ok' : 'no');
      // a right answer moves on by itself; after a mistake the hint stays until the child taps «التالي»
      // after a right answer the praise stays ~4 s (6 s with an explanation to read), with a bar for the time left and «التالي» to skip;
      // after a mistake the hint stays until the child taps «فهمت، التالي»
      const n = $('aNext'), last = i >= total || (opt.hearts && hearts <= 0); n.hidden = false; n.focus({ preventScroll: true });
      if (ok) { const ms = why ? 6000 : 4000; n.textContent = last ? 'النتيجة ←' : 'التالي ←';
        $('uCoach').insertAdjacentHTML('beforeend', `<div class="auto" style="--d:${ms}ms"><i></i></div>`); later(next, ms); }
      else n.textContent = last ? 'النتيجة ←' : 'فهمت، التالي ←';
    });
  };
  $('aNext').onclick = next;
  next();
}
/** the end of any game: score, the level for next time, and play again / next game / all games */
function endCard(title, right, total, a, line) {
  const perfect = total && right === total; if (perfect) HS.party();
  const lvLine = !a ? '' : a.change === 'up' ? `⬆️ ممتاز! في المرة القادمة: المستوى ${ar(a.lv)} من ٣` : a.change === 'down' ? `في المرة القادمة نلعب المستوى ${ar(a.lv)} لنثبّت الفكرة أولًا.` : a.lv === 3 && perfect ? '🏆 أعلى مستوى، وكلها صحيحة!' : `تبقى في المستوى ${ar(a.lv)}. ${a.lv < 3 ? 'أجب عن ٩ من ١٠ لتصعد.' : ''}`;
  M().innerHTML = `<div class="card result">${gameHead(title)}<div class="big">${HS.kidCheer()}${HS.mascot(perfect ? 'cheer' : 'encourage', { fb: perfect ? '🎉' : '👍' })}</div>
    <h2>${ar(right)} من ${ar(total)}</h2>${line ? `<p class="lead">${line}</p>` : ''}${lvLine ? `<p class="lv-msg ${a ? a.change : ''}">${lvLine}</p>` : ''}${endRow()}</div>`;
}
// data-r marks the right choice (used by the automated tests; never shown)
const optBtns = (opts, cls = '', rk = -1) => `<div class="a-opts ${cls}">${opts.map((o, k) => `<button type="button" class="opt" data-o="${k}"${k === rk ? ' data-r="1"' : ''}>${o}</button>`).join('')}</div>`;
/** mark the choices after an answer: the right one green, a wrong pick red, all locked */
function settle(stage, rightK, pickK) {
  stage.querySelectorAll('.opt').forEach(b => { const k = +b.dataset.o; b.disabled = true; if (k === rightK) b.classList.add('ok'); else if (k === pickK) b.classList.add('no'); });
}

/* ---------- 🕵️ مَن أنا؟  (replaces the flip-card memory game: recall the term from its meaning) ---------- */
function letterTiles(word) {
  const w = word.replace(/^ال/, ''), lead = word.startsWith('ال') ? ['ال'] : [];
  return lead.concat(w.match(/.[\u064B-\u0652\u0670]*/g) || []);
}
function whoRounds(lv, l, n) {
  const pool = gloss(l), list = deal(pool, gid, n || (lv === 1 ? 6 : 8));
  return list.map(g => ({ id: gid(g), draw(stage, done) {
    const term = g.term.split(' (')[0], others = HS.shuffle(pool.filter(x => x !== g)).map(x => x.term.split(' (')[0]);
    const clue = `<div class="who-clue"><span class="who-q" aria-hidden="true">؟</span><p>${g.def}</p></div>`;
    const why = `<b>${g.term}</b>: ${g.def}`;
    if (lv < 3) {   // choose the term
      const opts = HS.shuffle([term, ...others.slice(0, lv === 1 ? 2 : 3)]), rk = opts.indexOf(term);
      stage.innerHTML = `<p class="lead">مَن أنا؟ اقرأ الوصف واختر المصطلح.</p>${lv === 1 ? `<div class="who-pic" aria-hidden="true">${P(g.em)}</div>` : ''}${clue}
        ${lv === 2 ? `<div class="row center"><button type="button" class="btn sec sm" id="whoHint">💡 أرني صورة</button></div><div class="who-pic" id="whoPic" hidden aria-hidden="true">${P(g.em)}</div>` : ''}${optBtns(opts, '', rk)}`;
      if ($('whoHint')) $('whoHint').onclick = e => { $('whoPic').hidden = false; e.currentTarget.remove(); };
      stage.querySelectorAll('.opt').forEach(b => b.onclick = () => { const k = +b.dataset.o; settle(stage, rk, k); done(k === rk, why); });
      return;
    }
    // level 3: build it from tiles (letters for one word, words for a longer term), with two that do not belong
    const words = term.split(' '), parts = words.length > 1 ? words : letterTiles(term);
    const extra = words.length > 1 ? HS.shuffle([...new Set(others.flatMap(t => t.split(' ')).filter(w => !words.includes(w)))]).slice(0, 2)
      : HS.shuffle('بتثجحدرسشصعفقكلمنهوي'.split('').filter(c => !parts.includes(c))).slice(0, 2);
    const tiles = HS.shuffle(parts.map((t, k) => ({ t, k })).concat(extra.map(t => ({ t, k: -1 }))));
    let at = 0, miss = 0;
    stage.innerHTML = `<p class="lead">مَن أنا؟ ركّب المصطلح من القطع.</p>${clue}
      <div class="who-build ${words.length > 1 ? 'words' : ''}" id="whoOut" aria-live="polite">${parts.map(() => '<i></i>').join(words.length > 1 ? ' ' : '')}</div>
      <div class="who-tiles">${tiles.map((x, k) => `<button type="button" class="tile-b" data-k="${k}"${x.k >= 0 ? ` data-at="${x.k}"` : ''}>${x.t}</button>`).join('')}</div>
      <div class="row center"><button type="button" class="btn sec sm" id="whoGive">لا أعرف، أرني</button></div>`;
    const out = $('whoOut'), show = () => { out.innerHTML = parts.map((p, k) => k < at ? `<b>${p}</b>` : '<i></i>').join(words.length > 1 ? ' ' : ''); };
    stage.querySelectorAll('.tile-b').forEach(b => b.onclick = () => {
      const x = tiles[+b.dataset.k];
      if (x.k === at || (x.k >= 0 && parts[x.k] === parts[at])) {
        b.disabled = true; at++; show(); HS.fx('tap'); stage.querySelectorAll('.tile-b.glow').forEach(t => t.classList.remove('glow'));
        if (at === parts.length) { stage.querySelectorAll('.tile-b').forEach(t => t.disabled = true); $('whoGive').remove(); done(miss <= 1, why); }
      } else {
        miss++; b.classList.remove('hs-shake'); void b.offsetWidth; b.classList.add('hs-shake'); HS.fx('no');
        if (miss >= 2) { const nx = [...stage.querySelectorAll('.tile-b:not([disabled])')].find(t => tiles[+t.dataset.k].t === parts[at]); if (nx) nx.classList.add('glow'); }
      }
    });
    $('whoGive').onclick = () => { at = parts.length; show(); stage.querySelectorAll('.tile-b').forEach(t => t.disabled = true); $('whoGive').remove(); done(false, why); };
  } }));
}
function gameWho(l) { const lv = gLv('memory'); runRounds('memory', '🕵️ مَن أنا؟', whoRounds(lv, l)); }

/* ---------- 🔍 الدخيل: which one does not belong? (mixes every sorting game) ---------- */
function oddRounds(lv, n) {
  const k = [3, 4, 5][lv - 1], cards = sortCards();
  return deal(cards, c => c.id, n || 8).map(c => {
    const [, , ib] = c.it, bins = c.g.bins.map((_, b) => b).filter(b => b !== ib && c.g.items.filter(x => x[2] === b).length >= 2);
    if (!bins.length) return null;
    const b = HS.shuffle(bins)[0], same = HS.shuffle(c.g.items.filter(x => x[2] === b)).slice(0, k - 1);
    const opts = HS.shuffle([c.it, ...same]), rk = opts.indexOf(c.it);
    return { id: c.id, draw(stage, done) {
      stage.innerHTML = `<p class="lead">أيّها <b>لا ينتمي</b> إلى البقية؟</p><div class="a-opts odd">${opts.map((x, j) => `<button type="button" class="opt card-o" data-o="${j}"${j === rk ? ' data-r="1"' : ''}><span class="em">${P(x[0])}</span>${x[1]}</button>`).join('')}</div>`;
      stage.querySelectorAll('.opt').forEach(btn => btn.onclick = () => { const j = +btn.dataset.o; settle(stage, rk, j);
        done(j === rk, `<b>${c.it[1]}</b> ${binName(c.g.bins[ib][0])}، والبقية ${binName(c.g.bins[b][0])}.${c.g.why && c.g.why[ib] ? ' ' + c.g.why[ib] : ''}`); });
    } };
  }).filter(Boolean);
}
function gameOdd() { runRounds('odd', '🔍 الدخيل', oddRounds(gLv('odd'))); }

/* ---------- ✔️ صح أم خطأ؟  (hearts instead of a clock, so there is time to read why) ---------- */
function tfRounds(lv, n) {
  const pool = statements().filter(s => s.kind === 'tf' || s.f);
  return deal(pool, s => s.id, n || [10, 12, 15][lv - 1]).map(s => {
    const truth = s.kind === 'tf' ? s.truth : Math.random() < .5, text = s.kind === 'tf' ? s.text : truth ? s.t : s.f;
    return { id: s.id, draw(stage, done) {
      stage.innerHTML = `<div class="tf-card">${s.em ? `<span class="em" aria-hidden="true">${P(s.em)}</span>` : ''}<p>${text}</p></div>
        <div class="a-opts tf"><button type="button" class="opt t-yes" data-o="1"${truth ? ' data-r="1"' : ''}>✔️ صح</button><button type="button" class="opt t-no" data-o="0"${truth ? '' : ' data-r="1"'}>✖️ خطأ</button></div>`;
      stage.querySelectorAll('.opt').forEach(b => b.onclick = () => { const said = b.dataset.o === '1'; settle(stage, truth ? 1 : 0, +b.dataset.o);
        const why = s.kind === 'tf' ? s.why : (truth ? s.why : 'الصواب: ' + s.why);
        // a mistake always says whether the sentence was right or wrong, and why; a right answer adds the fix for a false sentence
        done(said === truth, said === truth ? (truth ? '' : why) : `هذه الجملة <b>${truth ? 'صحيحة ✔️' : 'خطأ ✖️'}</b>${why ? '. ' + why : '.'}`); });
    } };
  });
}
function gameTF() { const lv = gLv('tf'); runRounds('tf', '✔️ صح أم خطأ؟', tfRounds(lv), { hearts: lv === 3 ? 2 : 3 }); }

/* ---------- 📒 صحّح دفتر كوكو: find the one wrong line, then fix it ---------- */
function fixRounds(lv, n) {
  const pool = statements().filter(s => s.kind !== 'tf' && s.f), k = [3, 4, 5][lv - 1];
  return deal(pool, s => s.id, n || 6).map(bad => {
    const good = HS.shuffle(pool.filter(s => s.id !== bad.id)).slice(0, k - 1);
    const lines = HS.shuffle([bad, ...good]), bk = lines.indexOf(bad);
    // the fix: the right box for a sorting card, the right meaning for a term
    let fixOpts, fixRight;
    if (bad.kind === 's') { fixOpts = bad.c.g.bins.map(b => binName(b[0])); fixRight = bad.c.it[2]; }
    else { const o = HS.shuffle([mean(bad.g), mean(bad.other), ...HS.shuffle(gloss().filter(x => x !== bad.g && x !== bad.other)).slice(0, 1).map(mean)]); fixOpts = o; fixRight = o.indexOf(mean(bad.g)); }
    return { id: bad.id, draw(stage, done) {
      let tries = 0;
      stage.innerHTML = `<p class="lead">كتب كوكو هذه الجمل في دفتره، وواحدة منها <b>خطأ</b>. اضغط عليها.</p>
        <div class="nb">${lines.map((s, j) => `<button type="button" class="nb-l" data-j="${j}"${j === bk ? ' data-r="1"' : ''}>${s === bad ? s.f : s.t}</button>`).join('')}</div><div id="fixStep"></div>`;
      stage.querySelectorAll('.nb-l').forEach(b => b.onclick = () => {
        const j = +b.dataset.j; if (b.disabled) return;
        if (j !== bk) { tries++; b.classList.add('ok-l'); b.disabled = true; coach('هذه صحيحة ✔️. ابحث عن الجملة الخطأ.', 'info'); HS.fx('no'); return; }
        stage.querySelectorAll('.nb-l').forEach(x => x.disabled = true); b.classList.add('bad-l'); coachOff();
        $('fixStep').innerHTML = `<p class="lead">وجدتها! كيف نصحّحها؟ ${bad.kind === 's' ? `<b>${bad.c.it[1]}</b> ⬅ …` : `<b>${bad.g.term}</b>: …`}</p>${optBtns(fixOpts, '', fixRight)}`;
        $('fixStep').querySelectorAll('.opt').forEach(o => o.onclick = () => { const p = +o.dataset.o; settle($('fixStep'), fixRight, p);
          done(tries === 0 && p === fixRight, bad.why); });
      });
    } };
  });
}
function gameFix() { runRounds('fix', '📒 صحّح دفتر كوكو', fixRounds(gLv('fix'))); }

/* ---------- 🌟 تحدي اليوم: 8 mixed rounds, mistakes first, once a day for a bonus ---------- */
const today = () => new Date().toISOString().slice(0, 10);
function dailyDone() { const d = gData().daily; return d && d.day === today(); }
function gameDaily() {
  const pick = (f, key, n) => f(gLv(key), n);
  const rounds = HS.shuffle([].concat(pick(tfRounds, 'tf', 2), pick(oddRounds, 'odd', 2), pick(fixRounds, 'fix', 2),
    gloss().length >= 4 ? whoRounds(Math.min(2, gLv('memory')), '', 2) : [])).slice(0, 8);
  const first = !dailyDone();
  runRounds('daily', '🌟 تحدي اليوم', rounds, { noLv: true, endLine: first ? '🌟 أنجزت تحدي اليوم: +٥ نجمات إضافية. عد غدًا لتحدٍّ جديد!' : 'لعبته مرة ثانية اليوم. التحدي الجديد غدًا.',
    onEnd() { if (!first) return; const d = gData(), y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      d.daily = { day: today(), n: d.daily && d.daily.day === y ? d.daily.n + 1 : 1 }; HS.save(); star(5); } });
}
function dailyCard() {
  const d = gData().daily, on = dailyDone();
  return `<div class="card daily ${on ? 'done' : ''}"><span class="daily-em" aria-hidden="true">${on ? '✅' : '🌟'}</span><div><h3>تحدي اليوم</h3>
    <p class="lead small">${on ? `أنجزته اليوم${d.n > 1 ? ` · ${ar(d.n)} أيام متتالية 🔥` : ''}. عد غدًا لتحدٍّ جديد.` : '٨ جولات منوّعة من كل الدروس، وما أخطأت فيه يعود أولًا. +٥ نجمات إضافية.'}</p></div>
    <button type="button" class="btn ${on ? 'sec' : ''}" data-act="daily">${on ? 'العب مرة أخرى' : 'ابدأ التحدي'}</button></div>`;
}
