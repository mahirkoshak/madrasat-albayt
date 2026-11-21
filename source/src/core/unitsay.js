/* What the school units (grades 3–4) read aloud, in one place.
   Used by the unit app (src/apps/unit) for its 🔊 buttons AND by tools/speech_list.js, which lists the sentences
   to record in the voice maker, so the recorded clip and the button always use exactly the same text.
   A 🔊 button only appears once its sentence has a recorded clip (no device voice in the units). */
window.HS_UNIT_SAY = (function () {
  const EMO = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu;
  // table cells and lines stay separate words; maths symbols are spoken as words
  const clean = s => String(s || '').replace(/<span class="frc"><b>(.*?)<\/b><i>(.*?)<\/i><\/span>/g, ' $1 على $2 ').replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(td|th)>/gi, '، ').replace(/<\/(tr|li|p|div|h\d)>/gi, '. ')
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(EMO, '').replace(/[⬅←→➜]/g, ' ')
    .replace(/\s*×\s*/g, ' ضرب ').replace(/\s*÷\s*/g, ' قسمة ').replace(/\s*≈\s*/g, ' تقريبًا ').replace(/\s*=\s*/g, ' يساوي ').replace(/\s*\+\s*/g, ' زائد ')
    .replace(/([0-9٠-٩])\s*[−-]\s*([0-9٠-٩])/g, '$1 ناقص $2').replace(/…/g, '، ').replace(/\s+/g, ' ').replace(/\s*([،.])(\s*[،.])+/g, '$1').replace(/^[،.\s]+/, '').trim();
  // join pieces into sentences: each piece ends with a full stop unless it already ends with punctuation
  const join = parts => parts.map(clean).filter(Boolean).map(p => /[.!?؟:،؛…]$/.test(p) ? p : p + '.').join(' ');
  /** the lesson's cards: a "tiles" block without a heading joins the card before it (same rule the page uses) */
  const cards = L => { const out = []; let cur = null; L.blocks.forEach(b => { if (cur && b.t === 'tiles' && !b.h) cur.push(b); else { cur = [b]; out.push(cur); } }); return out; };
  const blockText = b => {
    const p = [b.h];
    if (b.t === 'text' || b.t === 'html') p.push(b.html);
    if (b.t === 'tiles') b.items.forEach(t => p.push(join([t.b]).replace(/\.$/, ':') + ' ' + clean(t.p)));
    if (b.t === 'chain') { p.push(b.items.map(([, n, r]) => clean(n) + (r ? ' ' + clean(r) : '')).join('، ثم ')); p.push(b.note); }
    if (b.t === 'pyramid') { p.push(b.html); p.push('من القاعدة إلى القمة: ' + b.levels.map(([t]) => clean(t)).join('، ')); }
    if (b.t === 'model') { p.push(b.html); p.push(b.after); }
    return p;
  };
  const S = {
    clean, cards,
    idea: L => join(['الفكرة الرئيسية: ' + clean(L.idea)]),
    card: c => join(c.flatMap(blockText)),
    remember: L => join(['احفظ هذا', ...L.remember]),
    q: q => join([String(q.q || '').replace(/_{2,}/g, ' فراغ ')]),
    ex: q => join([q.ex]),
    term: g => join([g.term, g.def]),
    /** every sentence of a unit: [[text, 'ar'], ...] */
    all(u) {
      const o = [];
      u.lessons.forEach(L => { o.push(S.idea(L)); cards(L).forEach(c => o.push(S.card(c))); if (L.remember && L.remember.length) o.push(S.remember(L)); });
      (u.glossary || []).forEach(g => o.push(S.term(g)));
      (u.questions || []).forEach(q => { o.push(S.q(q)); if (q.ex) o.push(S.ex(q)); });
      return o.filter(t => t && t !== '.').map(t => [t, 'ar']);
    }
  };
  return S;
})();
