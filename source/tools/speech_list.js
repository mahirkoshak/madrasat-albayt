#!/usr/bin/env node
/* Prints every sentence the site can speak, as JSON: [{"lang":"ar","text":"..."}].
   Used by make_audio.py to know which voice clips to generate.
   Run from anywhere:  node tools/speech_list.js > speech.json
   It reads the same content files the site uses, so new words are picked up automatically.
   Includes the kindergarten app, the dictionary, shared phrases and the school units. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src');
const ctx = { APPDATA: {}, UNITS: {}, console }; ctx.window = ctx; vm.createContext(ctx);
const run = f => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
const out = new Map();
const add = (text, lang) => { text = strip(text); if (text) out.set(lang + '|' + text, { lang, text }); };

// shared phrases
run(path.join(SRC, 'core', 'phrases.js'));
const PH = ctx.HS_PHRASES;
for (const v of Object.values(PH)) for (const [lang, t] of Object.entries(v)) [].concat(t).forEach(x => add(x, lang));
add('ألف. أرنب. باء. بطة', 'ar'); add('ألف. أرنب', 'ar'); add('A is for Apple', 'en');   // parent-page voice tests

// apps with a speakables() list
for (const dir of fs.readdirSync(path.join(SRC, 'apps'))) {
  const f = path.join(SRC, 'apps', dir, 'data.js');
  if (!fs.existsSync(f)) continue;
  run(f);
  for (const d of Object.values(ctx.APPDATA)) if (d && typeof d.speakables === 'function') d.speakables().forEach(([t, l]) => add(t, l));
}

// school units (grades 3+): lesson explanations, questions, answer explanations, flashcards (src/core/unitsay.js)
run(path.join(SRC, 'core', 'unitsay.js'));
for (const f of fs.readdirSync(path.join(SRC, 'units'))) if (f.endsWith('.js') && !f.startsWith('_')) run(path.join(SRC, 'units', f));
const US = ctx.HS_UNIT_SAY, UL = Object.values(ctx.UNITS);
UL.forEach(u => u.lessons.forEach(L => { add(US.idea(L), 'ar'); US.cards(L).forEach(c => add(US.card(c), 'ar')); if (L.remember && L.remember.length) add(US.remember(L), 'ar'); }));   // 1. lesson explanations
UL.forEach(u => (u.questions || []).forEach(q => q.ex && add(US.ex(q), 'ar')));     // 2. the explanation after an answer
UL.forEach(u => (u.questions || []).forEach(q => add(US.q(q), 'ar')));             // 3. the questions
UL.forEach(u => (u.glossary || []).forEach(g => add(US.term(g), 'ar')));           // 4. flashcards
US.all(UL[0] || { lessons: [] }).forEach(([t]) => { if (!out.has('ar|' + t)) throw new Error('unitsay.all and speech_list disagree: ' + t); });
process.stdout.write(JSON.stringify([...out.values()], null, 1));
