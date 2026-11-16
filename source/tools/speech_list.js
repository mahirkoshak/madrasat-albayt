#!/usr/bin/env node
/* Prints every sentence the site can speak, as JSON: [{"lang":"ar","text":"..."}].
   Used by make_audio.py to know which voice clips to generate.
   Run from anywhere:  node tools/speech_list.js > speech.json
   It reads the same content files the site uses, so new words are picked up automatically.
   By default only the kindergarten app and shared phrases are included (add --units for school units). */
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

// units (grades 3+): skipped by default, older kids read; their 🔊 buttons use the device voice.
// To record clips for units too, run:  node tools/speech_list.js --units   (and make_audio.py --units)
if (process.argv.includes('--units')) for (const f of fs.readdirSync(path.join(SRC, 'units'))) if (f.endsWith('.js') && !f.startsWith('_')) run(path.join(SRC, 'units', f));
for (const u of Object.values(ctx.UNITS)) {   // empty unless --units
  u.lessons.forEach(L => { add('الفكرة الرئيسة: ' + strip(L.idea), 'ar'); add(L.remember.join('. '), 'ar'); });
  u.glossary.forEach(g => { add(g.term, 'ar'); add(g.def, 'ar'); });
  u.questions.forEach(q => add(q.q.replace('____', 'فراغ'), 'ar'));
}
process.stdout.write(JSON.stringify([...out.values()], null, 1));
