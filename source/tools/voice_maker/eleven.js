/* ElevenLabs text-to-speech in the browser (voice maker + listening test).
   The key is typed by the parent and stays in this browser (localStorage 'madrasat-eleven' only if "remember" is ticked).
   Needs elements: #elKey #elRemember #elForget #elRememberNote #elVoice #elModel #elLoad #elSpeed #elStab #elMsg #elLib */
const EL = (() => {
  const $ = id => document.getElementById(id), API = 'https://api.elevenlabs.io';
  const K = 'madrasat-eleven', store = v => { try { v ? localStorage.setItem(K, JSON.stringify(v)) : localStorage.removeItem(K); } catch (e) {} };
  const say = (t, err) => { const m = $('elMsg'); if (m) { m.textContent = t; m.className = err ? 'err' : ''; } };
  const key = () => $('elKey').value.trim();
  const head = () => ({ 'xi-api-key': key() });
  let lib = [];   // shared Saudi/Arabic voices found in the voice library
  async function j(path, opt) {
    const r = await fetch(API + path, Object.assign({ headers: head() }, opt));
    if (r.status === 401) throw new Error('مفتاح ElevenLabs غير صحيح (401)');
    if (!r.ok) throw new Error('ElevenLabs رفض الطلب (' + r.status + ')');
    return r.json();
  }
  /** fill the voice and model lists: my voices first, then Saudi/Arabic voices from the shared library */
  async function load() {
    if (!key()) { say('اكتب مفتاح ElevenLabs أولًا', true); return; }
    say('⏳ جاري تحميل الأصوات…');
    const [mine, models] = await Promise.all([j('/v1/voices'), j('/v1/models')]);
    let shared = [];
    for (const q of ['&accent=saudi', '']) {   // Saudi accent first, then any Arabic voice
      try { const r = await j('/v1/shared-voices?page_size=40&language=ar' + q); shared = shared.concat(r.voices || []); } catch (e) {}
    }
    const seen = new Set(); lib = shared.filter(v => !seen.has(v.voice_id) && seen.add(v.voice_id));
    const sel = $('elVoice'), keep = sel.value;
    sel.innerHTML = '<optgroup label="أصواتي">' + (mine.voices || []).map(v => `<option value="${v.voice_id}">${v.name}</option>`).join('') + '</optgroup>'
      + '<optgroup label="مكتبة ElevenLabs: عربي (سعودي أولًا)">' + lib.map(v => `<option value="lib:${v.public_owner_id}:${v.voice_id}">${v.name}${v.accent ? ' · ' + v.accent : ''}${v.gender ? ' · ' + (v.gender === 'female' ? 'أنثى' : 'ذكر') : ''}</option>`).join('') + '</optgroup>';
    if (keep && [...sel.options].some(o => o.value === keep)) sel.value = keep;
    const tts = (models || []).filter(m => m.can_do_text_to_speech && (m.languages || []).some(l => /^ar/.test(l.language_id)));
    const ms = $('elModel'), mk = ms.value;
    ms.innerHTML = tts.map(m => `<option value="${m.model_id}">${m.name}</option>`).join('');
    const best = tts.find(m => /v4/.test(m.model_id)) || tts.find(m => /v3/.test(m.model_id)) || tts.find(m => /multilingual_v2/.test(m.model_id));
    if (mk && tts.some(m => m.model_id === mk)) ms.value = mk; else if (best) ms.value = best.model_id;
    save(); say(`✓ ${(mine.voices || []).length} من أصواتك، و${lib.length} صوتًا عربيًا من المكتبة. استمع للمعاينة ثم اختر.`);
  }
  /** a library voice must be added to "my voices" once before the API can use it */
  async function voiceId() {
    const v = $('elVoice').value; if (!v) throw new Error('اختر صوتًا من ElevenLabs');
    if (!v.startsWith('lib:')) return v;
    const [, owner, id] = v.split(':'), name = (lib.find(x => x.voice_id === id) || {}).name || 'Arabic voice';
    try { await j(`/v1/voices/add/${owner}/${id}`, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, head()), body: JSON.stringify({ new_name: name + ' (مدرسة البيت)' }) }); } catch (e) {}
    const opt = [...$('elVoice').options].find(o => o.value === v); if (opt) opt.value = id; $('elVoice').value = id; save();
    return id;
  }
  function preview() {
    const v = $('elVoice').value, id = v.startsWith('lib:') ? v.split(':')[2] : v, x = lib.find(l => l.voice_id === id);
    if (x && x.preview_url) new Audio(x.preview_url).play(); else say('لا توجد معاينة لهذا الصوت. جرّب جملة.', false);
  }
  /** one sentence → mp3 bytes */
  async function synth(text) {
    const id = await voiceId(), speed = +($('elSpeed') ? $('elSpeed').value : 0.9), stab = +($('elStab') ? $('elStab').value : 0.5);
    const body = { text, model_id: $('elModel').value || 'eleven_multilingual_v2', voice_settings: { stability: stab, similarity_boost: 0.8, speed } };
    for (let a = 0; a < 6; a++) {
      const r = await fetch(`${API}/v1/text-to-speech/${id}?output_format=mp3_44100_64`, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, head()), body: JSON.stringify(body) });
      if (r.ok) return new Uint8Array(await r.arrayBuffer());
      if (r.status === 401) throw new Error('مفتاح ElevenLabs غير صحيح (401)');
      if (r.status === 422 && body.voice_settings.speed !== undefined) { delete body.voice_settings.speed; continue; }   // a model without the speed setting
      if (r.status === 429 || r.status >= 500) { await new Promise(k => setTimeout(k, 2000 * (a + 1))); continue; }   // busy: wait a little
      let why = ''; try { why = (await r.json()).detail; why = why && (why.message || why.status || JSON.stringify(why)); } catch (e) {}
      throw new Error('ElevenLabs رفض الجملة (' + r.status + (why ? ': ' + String(why).slice(0, 120) : '') + ')');
    }
    throw new Error('ElevenLabs مشغول، جرّب بعد قليل');
  }
  function save() { if ($('elRemember') && $('elRemember').checked && key()) store({ key: key(), voice: $('elVoice').value, model: $('elModel').value, speed: $('elSpeed') && $('elSpeed').value, stab: $('elStab') && $('elStab').value }); }
  function init() {
    let s = null; try { s = JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) {}
    if (s && s.key) {
      $('elKey').value = s.key; $('elRemember').checked = true; $('elRememberNote').hidden = false;
      if (s.voice) $('elVoice').innerHTML = `<option value="${s.voice}">الصوت المحفوظ</option>`;
      if (s.model) $('elModel').innerHTML = `<option value="${s.model}">${s.model}</option>`;
      if (s.speed && $('elSpeed')) $('elSpeed').value = s.speed; if (s.stab && $('elStab')) $('elStab').value = s.stab;
      load().catch(e => say(e.message === 'Failed to fetch' ? 'تعذّر الاتصال بـ ElevenLabs' : e.message, true));
    }
    $('elRemember').onchange = () => { if ($('elRemember').checked) { save(); $('elRememberNote').hidden = !key(); } else { store(null); $('elRememberNote').hidden = true; } };
    $('elKey').addEventListener('input', () => { save(); if ($('elRemember').checked) $('elRememberNote').hidden = !key(); });
    ['elVoice', 'elModel', 'elSpeed', 'elStab'].forEach(id => $(id) && $(id).addEventListener('change', save));
    $('elForget').onclick = () => { store(null); $('elKey').value = ''; $('elRemember').checked = false; $('elRememberNote').hidden = true; };
    $('elLoad').onclick = () => load().catch(e => say(e.message === 'Failed to fetch' ? 'تعذّر الاتصال بـ ElevenLabs' : e.message, true));
    if ($('elPreview')) $('elPreview').onclick = preview;
  }
  return { init, synth, load, ready: () => !!(key() && $('elVoice').value), info: () => ({ voice: $('elVoice').selectedOptions[0] ? $('elVoice').selectedOptions[0].textContent : '', model: $('elModel').value }) };
})();
