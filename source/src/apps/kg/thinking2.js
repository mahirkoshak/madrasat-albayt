/* ============================================================
   MORE THINKING GAMES (loaded after thinking.js, same scope)
   - rule:  Change the Rule (card sorting with a rule switch, after Zelazo's DCCS task)
            1 colour → shape · 2 colour → shape → colour · 3 frame = shape, no frame = colour (mixed)
            4 colour → shape → size · 5 the rule changes and only «the rule changed!» is said
            Configurations: 2 of 4 colours × 2 of 5 shapes × which rule first = 120.
   - tale:  Story Workshop: choose a hero and a place (1), a problem and its fix (2, 3 with more fixes).
            A fix that does not solve the problem is questioned, never just accepted.
   - build: free building with shapes (no right answer, no levels)
   ============================================================ */
Object.assign(THINK_ROUNDS, { rule: 3, tale: 2, build: 1 });
Object.assign(THINK_MAX, { rule: 5, tale: 3, build: 1 });

/* ---------------- 🔀 change the rule ---------------- */
const RULE_COL = [['#e63946', 'red'], ['#1c7ed6', 'blue'], ['#f4b400', 'yellow'], ['#2f9e44', 'green']];
const RULE_SHP = ['circle', 'star', 'tri', 'square', 'heart'];
function ruleShape(t, c, big) {
  const s = big ? 1 : .62, g = `transform="translate(50 50) scale(${s}) translate(-50 -50)" fill="${c}" stroke="rgba(0,0,0,.22)" stroke-width="2"`;
  const d = { circle: '<circle cx="50" cy="50" r="34"/>', square: '<rect x="18" y="18" width="64" height="64" rx="6"/>', tri: '<polygon points="50,12 88,84 12,84"/>',
    star: '<polygon points="50,8 61,38 93,38 67,57 77,89 50,70 23,89 33,57 7,38 39,38"/>', heart: '<path d="M50 86 C10 58 8 30 28 20 C40 14 48 22 50 30 C52 22 60 14 72 20 C92 30 90 58 50 86Z"/>' }[t];
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g ${g}>${d.replace('/>', '/>')}</g></svg>`;
}
function ruleGame() {
  const L = G.lv, l = lang();
  const [ca, cb] = HS.shuffle(RULE_COL.slice()).slice(0, 2), [sa, sb] = HS.shuffle(RULE_SHP.slice()).slice(0, 2);
  // the two baskets: A = colour a + shape a (+ big), B = colour b + shape b (+ small)
  const bins = [{ c: ca[0], s: sa, big: true, cn: ca[1] }, { c: cb[0], s: sb, big: L < 4, cn: cb[1] }];   // size only matters from level 4
  const first = Math.random() < .5 ? 'col' : 'shp', other = first === 'col' ? 'shp' : 'col';
  const plan = { 1: [first, first, first, other, other, other], 2: [first, first, other, other, first, first],
    3: ['mix', 'mix', 'mix', 'mix', 'mix', 'mix'], 4: ['col', 'col', 'shp', 'shp', 'size', 'size'], 5: [first, first, other, other, first, other] }[L];
  // each card conflicts: its colour points to one basket, its shape (and size) to the other
  const cards = plan.map((r, i) => { const to = Math.random() < .5 ? 0 : 1, frame = r === 'mix' ? Math.random() < .5 : false;
    const rule = r === 'mix' ? (frame ? 'shp' : 'col') : r;
    return rule === 'col' ? { c: bins[to].c, s: bins[1 - to].s, big: bins[1 - to].big, to, rule, frame } : rule === 'shp' ? { c: bins[1 - to].c, s: bins[to].s, big: bins[1 - to].big, to, rule, frame }
      : { c: bins[1 - to].c, s: bins[1 - to].s, big: bins[to].big, to, rule, frame }; });
  const say1 = r => tl({ col: P.ruleColor, shp: P.ruleShape, size: P.ruleSize }[r])();
  const icon = r => ({ col: '🎨', shp: '🔷', size: '📏' })[r];
  const root = fresh(`<div class="rl-rule" aria-live="polite"></div><div class="rl-card" aria-live="polite"></div>
    <div class="rl-bins">${bins.map((b, i) => `<button type="button" class="rl-bin" data-b="${i}" aria-label="السلة ${HS.toAr(i + 1)}">${ruleShape(b.s, b.c, b.big)}<span class="rl-basket" aria-hidden="true"></span></button>`).join('')}</div>`);
  ROOT._dbg = { cards, plan };   // read by the automated tests
  let i = 0, mistakes = 0, shownRule = null;
  const show = () => {
    const c = cards[i], ruleEl = root.querySelector('.rl-rule');
    const changed = i > 0 && cards[i - 1].rule !== c.rule && L !== 3;
    if (L === 3) { if (i === 0) { ruleEl.textContent = '🖼️ = 🔷   ·   🎨'; ask(tl(P.ruleFrame)(), l); } }
    else if (L === 5) { ruleEl.textContent = changed || i === 0 ? '❓' : ruleEl.textContent; if (i === 0) ask(say1(c.rule), l); else if (changed) ask(tl(P.ruleNew)(), l); }
    else if (i === 0 || changed) { ruleEl.textContent = icon(c.rule);
      if (!changed) ask(say1(c.rule), l);
      else { const a = tl(P.ruleNew)(), b = say1(c.rule); $('gQ').textContent = a + ' ' + b; G.sp = [[a, l], [b, l]]; say(G.sp); } }   // two recorded sentences
    shownRule = c.rule;
    root.querySelector('.rl-card').innerHTML = `<div class="rl-c ${c.frame ? 'frame' : ''} hs-pop" role="img" aria-label="بطاقة">${ruleShape(c.s, c.c, c.big)}</div>`;
  };
  root.querySelectorAll('.rl-bin').forEach(b => b.onclick = () => {
    const c = cards[i]; if (!c) return;
    if (+b.dataset.b === c.to) {
      HS.fx('ok'); b.classList.remove('hs-pop'); void b.offsetWidth; b.classList.add('hs-pop');
      if (L === 5) root.querySelector('.rl-rule').textContent = icon(c.rule);
      if (++i >= cards.length) return later(() => thinkDone(mistakes <= 1), 300);
      return later(show, 450);
    }
    mistakes++; HS.fx('no'); shake(root.querySelector('.rl-c'));
    say([[say1(c.rule), l]]);    // remind the rule, never point at the basket
    if (L === 5 || L === 3) root.querySelector('.rl-rule').textContent = icon(c.rule) + (c.frame ? ' 🖼️' : '');
  });
  show();
}

/* ---------------- 📚 story workshop ---------------- */
function taleGame() {
  const L = G.lv, l = lang(), T = APPDATA.kg.TALE, en = l === 'en';
  const pick = { who: null, where: null, problem: null };
  let wrong = 0;
  const root = fresh(`<div class="tl-story" aria-live="polite"></div><div class="tl-choose"></div>`);
  const story = root.querySelector('.tl-story'), area = root.querySelector('.tl-choose');
  const line = (em, t) => story.insertAdjacentHTML('beforeend', `<p class="tl-line hs-pop" data-t="${HS.esc(t)}"><span class="em">${em}</span> ${t}</p>`);
  const choose = (q, list, cb, opt = {}) => {
    ask(tl(q)(), l);
    area.innerHTML = `<div class="tl-opts">${list.map(([em, ar, e], i) => `<button type="button" class="tl-o" data-i="${opt.idx ? opt.idx[i] : i}"><span class="em">${em}</span><small>${opt.noText ? '' : (en ? e : ar)}</small></button>`).join('')}</div>`;
    area.querySelectorAll('.tl-o').forEach(b => b.onclick = () => cb(+b.dataset.i, b));
  };
  const finish = () => {
    area.innerHTML = '';
    later(() => { line('😊', tl(P.taleEnd)()); say([...story.querySelectorAll('.tl-line')].map(p => [p.dataset.t, l])); }, 300);
    later(() => thinkDone(wrong === 0), 1500 + 1800 * story.querySelectorAll('.tl-line').length);
  };
  choose(P.taleWho, T.who, i => {
    pick.who = T.who[i];
    choose(P.taleWhere, T.where, j => {
      pick.where = T.where[j];
      line(pick.who[0] + pick.where[0], tl(P.taleStart)(pick.who, pick.where));
      say([[tl(P.taleStart)(pick.who, pick.where), l]]);
      if (L === 1) return finish();
      later(() => choose(P.taleProblem, T.problem, k => {
        pick.problem = k; line(T.problem[k][0], en ? T.problem[k][2] : T.problem[k][1]); say([[en ? T.problem[k][2] : T.problem[k][1], l]]);
        // fixes to choose from: the right one + 1 (level 2) or 3 (level 3) others
        const idx = HS.shuffle([k, ...HS.shuffle(T.fix.map((_, x) => x).filter(x => x !== k)).slice(0, L === 2 ? 1 : 3)]);
        later(() => choose(P.taleFix, idx.map(x => T.fix[x]), (f, b) => {
          if (f !== k) { wrong++; HS.fx('no'); shake(b); b.disabled = true; say([[tl(P.taleNotFix)(), l]]); return; }
          HS.fx('ok'); line(T.fix[f][0], en ? T.fix[f][2] : T.fix[f][1]); say([[en ? T.fix[f][2] : T.fix[f][1], l]]);
          later(finish, 2400);
        }, { idx, noText: true }), 2600);
      }, { noText: true }), 2600);
    });
  });
}

/* ---------------- 🎨 free build ---------------- */
const BUILD_COLS = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5', '#f4a261', '#8a5a35'];
const BUILD_SHAPES = [['rect', 20, 20], ['rect', 30, 12], ['circle', 20, 20], ['triU', 22, 20], ['rtBL', 20, 20], ['triD', 22, 20]];
function buildGame() {
  const l = lang(), S = Math.min(340, window.innerWidth - 40);
  let col = 0, sel = null, n = 0, praised = false;
  const items = [];
  const root = fresh(`<svg class="bd-board" viewBox="0 0 100 100" style="width:${S}px;height:${S}px" role="img" aria-label="لوحة البناء"></svg>
    <div class="bd-tools">
      <div class="bd-row" role="group" aria-label="الأشكال">${BUILD_SHAPES.map((x, i) => `<button type="button" class="bd-s" data-s="${i}" aria-label="أضف شكلًا"><svg viewBox="-2 -2 ${x[1] + 4} ${x[2] + 4}" aria-hidden="true">${shapeSvg(x[0], 0, 0, x[1], x[2], `fill="${BUILD_COLS[col]}"`)}</svg></button>`).join('')}</div>
      <div class="bd-row" role="group" aria-label="الألوان">${BUILD_COLS.map((c, i) => `<button type="button" class="bd-c ${i === col ? 'on' : ''}" data-c="${i}" style="background:${c}" aria-label="لون ${HS.toAr(i + 1)}" aria-pressed="${i === col}"></button>`).join('')}</div>
      <div class="bd-row"><button type="button" class="rk bd-a" data-a="big" aria-label="أكبر">➕</button><button type="button" class="rk bd-a" data-a="small" aria-label="أصغر">➖</button>
        <button type="button" class="rk bd-a" data-a="del" aria-label="احذف الشكل">🗑️</button><button type="button" class="rk bd-a" data-a="clear" aria-label="امسح اللوحة">🧹</button>
        <button type="button" class="rk bd-a done" data-a="done" aria-label="انتهيت">✅</button></div></div>`);
  ask(tl(P.build)(), l);
  const svg = root.querySelector('.bd-board');
  const draw = () => {
    svg.innerHTML = items.map((it, i) => `<g class="bd-it ${sel === i ? 'sel' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="شكل ${HS.toAr(i + 1)}">${shapeSvg(it.t, it.x, it.y, it.w, it.h, `fill="${it.c}" stroke="${sel === i ? '#212529' : 'rgba(0,0,0,.2)'}" stroke-width="${sel === i ? 1.2 : .6}"`)}</g>`).join('');
    root.querySelectorAll('.bd-s svg *').forEach(e => e.setAttribute('fill', BUILD_COLS[col]));
  };
  root.querySelectorAll('.bd-s').forEach(b => b.onclick = () => {
    const [t, w, h] = BUILD_SHAPES[+b.dataset.s];
    items.push({ t, w, h, x: 50 - w / 2 + (n % 5) * 3 - 6, y: 50 - h / 2 + (n % 5) * 3 - 6, c: BUILD_COLS[col] }); n++; sel = items.length - 1; HS.fx('tap'); draw();
  });
  root.querySelectorAll('.bd-c').forEach(b => b.onclick = () => {
    col = +b.dataset.c; root.querySelectorAll('.bd-c').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    if (sel != null && items[sel]) items[sel].c = BUILD_COLS[col]; draw();
  });
  root.querySelectorAll('.bd-a').forEach(b => b.onclick = () => {
    const a = b.dataset.a, it = items[sel];
    if (a === 'clear') { items.length = 0; sel = null; }
    else if (a === 'done') { if (items.length >= 2) { say([[tl(P.buildDone)(), l]]); HS.party && HS.party(); if (!praised) { praised = true; HS.addStars(1); } } return draw(); }
    else if (!it) return;
    else if (a === 'del') { items.splice(sel, 1); sel = null; }
    else { const f = a === 'big' ? 1.2 : 1 / 1.2, cx = it.x + it.w / 2, cy = it.y + it.h / 2;
      it.w = Math.max(6, Math.min(80, it.w * f)); it.h = Math.max(6, Math.min(80, it.h * f)); it.x = cx - it.w / 2; it.y = cy - it.h / 2; }
    HS.fx('tap'); draw();
  });
  // drag a shape (pointer), or select it and move it with the arrow keys
  let drag = null;
  const pt = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) * 100 / r.width, (e.clientY - r.top) * 100 / r.height]; };
  svg.addEventListener('pointerdown', e => { const g = e.target.closest('.bd-it'); if (!g) { sel = null; return draw(); }
    sel = +g.dataset.i; const [x, y] = pt(e); drag = { dx: x - items[sel].x, dy: y - items[sel].y, id: e.pointerId }; try { svg.setPointerCapture(e.pointerId); } catch (x) {} draw(); e.preventDefault(); });
  svg.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; const it = items[sel], [x, y] = pt(e);
    it.x = Math.max(-it.w / 2, Math.min(100 - it.w / 2, x - drag.dx)); it.y = Math.max(-it.h / 2, Math.min(100 - it.h / 2, y - drag.dy));
    const g = svg.querySelector(`.bd-it[data-i="${sel}"] > *`); if (g) g.outerHTML = shapeSvg(it.t, it.x, it.y, it.w, it.h, `fill="${it.c}" stroke="#212529" stroke-width="1.2"`); });
  const up = () => { drag = null; }; svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('keydown', e => { const g = e.target.closest('.bd-it'); if (!g) return; sel = +g.dataset.i; const it = items[sel];
    const m = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] }[e.key]; if (!m) return;
    e.preventDefault(); it.x += m[0]; it.y += m[1]; draw(); svg.querySelector(`.bd-it[data-i="${sel}"]`).focus(); });
  draw();
}
Object.assign(THINK_GAMES, { rule: ruleGame, tale: taleGame, build: buildGame });
