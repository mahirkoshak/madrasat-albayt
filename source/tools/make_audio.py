#!/usr/bin/env python3
"""
Generate natural AI voice clips for everything the site says, then embed them on the next build.

Engine: SILMA TTS (open source, Apache-2.0 weights): Arabic + English in one model.
Needs: Python 3.10+, ffmpeg, Node.js, and ideally a GPU (free Google Colab works).

    pip install silma-tts
    python tools/make_audio.py --ar-ref tools/voices/ar.wav --en-ref tools/voices/en.wav
    python build.py

Reference voice (required by SILMA, it copies the voice): a clean 5–8 second WAV of someone speaking.
Record yourself (fun for the kids!) or use the sample voices from the SILMA repository
(src/silma_tts/infer/ref_audio_samples/). Put them at tools/voices/ar.wav and tools/voices/en.wav.

Only missing clips are generated, so re-run it after adding a unit: it does just the new sentences.
Output: src/audio/clips/<hash>.mp3 and src/audio/manifest.json  {"ar|text": "<hash>.mp3"}
"""
import argparse, hashlib, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
AUDIO = os.path.join(ROOT, 'src', 'audio')
CLIPS = os.path.join(AUDIO, 'clips')
MANIFEST = os.path.join(AUDIO, 'manifest.json')

# trims silence at both ends, mono 22 kHz MP3 at 32 kbps: small enough to embed hundreds of clips
FFMPEG_FILTER = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                 'silenceremove=start_periods=1:start_threshold=-45dB,areverse')


def speech_list(units=False):
    out = subprocess.run(['node', os.path.join(HERE, 'speech_list.js')] + (['--units'] if units else []),
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--ar-ref', default=os.path.join(HERE, 'voices', 'ar.wav'), help='Arabic reference voice WAV')
    ap.add_argument('--ar-ref-text', default=None, help='what is said in the Arabic reference (optional)')
    ap.add_argument('--en-ref', default=os.path.join(HERE, 'voices', 'en.wav'), help='English reference voice WAV')
    ap.add_argument('--en-ref-text', default=None, help='what is said in the English reference (optional)')
    ap.add_argument('--speed', type=float, default=0.9, help='speaking speed (kids: 0.85–0.95)')
    ap.add_argument('--limit', type=int, default=0, help='generate at most N clips (for a quick test)')
    ap.add_argument('--only', choices=['ar', 'en'], help='only one language')
    ap.add_argument('--prune', action='store_true', help='delete clips no longer used by any content')
    ap.add_argument('--units', action='store_true', help='also voice the school units (default: kindergarten only)')
    ap.add_argument('--dry-run', action='store_true', help='just list what is missing')
    a = ap.parse_args()

    items = speech_list(a.units)
    os.makedirs(CLIPS, exist_ok=True)
    manifest = json.load(open(MANIFEST, encoding='utf-8')) if os.path.isfile(MANIFEST) else {}
    keys = {f"{it['lang']}|{it['text']}": it for it in items}

    if a.prune:
        for k in [k for k in manifest if k not in keys]:
            fp = os.path.join(CLIPS, manifest.pop(k))
            if os.path.isfile(fp):
                os.remove(fp)
        print('pruned unused clips')

    todo = [it for k, it in keys.items()
            if not (k in manifest and os.path.isfile(os.path.join(CLIPS, manifest[k])))
            and (not a.only or it['lang'] == a.only)]
    print(f'{len(items)} sentences, {len(items) - len(todo)} already have clips, {len(todo)} to generate')
    if a.dry_run or not todo:
        json.dump(manifest, open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        return
    if a.limit:
        todo = todo[:a.limit]

    refs = {'ar': (a.ar_ref, a.ar_ref_text), 'en': (a.en_ref, a.en_ref_text)}
    # SILMA is bilingual: if there is no English sample, the Arabic voice speaks English too (and vice versa)
    if not os.path.isfile(refs['en'][0]) and os.path.isfile(refs['ar'][0]):
        print('No English reference voice: using the Arabic one for English too.'); refs['en'] = refs['ar']
    if not os.path.isfile(refs['ar'][0]) and os.path.isfile(refs['en'][0]):
        print('No Arabic reference voice: using the English one for Arabic too.'); refs['ar'] = refs['en']
    for lang in {it['lang'] for it in todo}:
        if not os.path.isfile(refs[lang][0]):
            sys.exit(f'Missing reference voice for {lang}: {refs[lang][0]}\n'
                     f'Record 5–8 seconds of clear speech as WAV, or copy a sample from the SILMA repo.')

    # if the reference voice changed since the last run, old clips are in the old voice: start fresh
    def fp(f):
        return hashlib.sha1(open(f, 'rb').read()).hexdigest() if os.path.isfile(f) else ''
    voice_id = fp(refs['ar'][0]) + fp(refs['en'][0])
    vfile = os.path.join(AUDIO, 'voice.txt')
    old_id = open(vfile).read().strip() if os.path.isfile(vfile) else ''
    if old_id and old_id != voice_id and manifest:
        print('The reference voice changed: deleting old clips so every sentence uses the new voice.')
        for f in manifest.values():
            if os.path.isfile(os.path.join(CLIPS, f)):
                os.remove(os.path.join(CLIPS, f))
        manifest = {}
        todo = [it for it in items if not a.only or it['lang'] == a.only]
        if a.limit:
            todo = todo[:a.limit]
    open(vfile, 'w').write(voice_id)

    try:
        from silma_tts.api import SilmaTTS
    except ImportError:
        sys.exit('SILMA TTS is not installed. Run:  pip install silma-tts')
    tts = SilmaTTS()

    tmp = tempfile.mkdtemp()
    fails = 0
    for n, it in enumerate(todo, 1):
        key = f"{it['lang']}|{it['text']}"
        name = hashlib.sha1(key.encode('utf-8')).hexdigest()[:16] + '.mp3'
        wav = os.path.join(tmp, 'clip.wav')
        ref_file, ref_text = refs[it['lang']]
        try:
            # ref_text must be a string: "" lets SILMA transcribe the reference voice by itself
            tts.infer(ref_file=ref_file, ref_text=ref_text or '', gen_text=it['text'],
                      file_wave=wav, seed=None, speed=a.speed)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', FFMPEG_FILTER,
                            '-ac', '1', '-ar', '22050', '-codec:a', 'libmp3lame', '-b:a', '32k',
                            os.path.join(CLIPS, name)], check=True)
            manifest[key] = name
            fails = 0
        except Exception as e:  # keep going; that sentence just uses the device voice
            fails += 1
            print(f'  ! failed: {it["text"][:40]}… ({e})')
            if fails >= 5 and len(manifest) == 0:
                json.dump(manifest, open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
                sys.exit('Stopped: the first 5 clips all failed with the error above. Send this error to get it fixed.')
        if n % 20 == 0 or n == len(todo):
            json.dump(manifest, open(MANIFEST, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            print(f'  {n}/{len(todo)}')
    print(f'Done. {len(manifest)} clips. Now run:  python build.py')


if __name__ == '__main__':
    main()
