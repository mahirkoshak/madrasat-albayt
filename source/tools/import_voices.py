"""Adds the voices recorded with the voice maker page (madrasat-voices.zip) to the site.

  python3 tools/import_voices.py path/to/madrasat-voices.zip

The zip holds clips/<name>.mp3, manifest.json {"lang|text": "<name>.mp3"} and voices.json (which voices).
New clips replace the old ones for the same sentence; sentences that were not recorded keep their old clip
(or the device voice). Then run tools/publish.py.
"""
import json, os, sys, zipfile

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(HERE, 'src', 'audio')

def main(zpath):
    z = zipfile.ZipFile(zpath)
    new = json.loads(z.read('manifest.json'))
    man_p = os.path.join(AUD, 'manifest.json')
    old = json.load(open(man_p, encoding='utf-8')) if os.path.isfile(man_p) else {}
    os.makedirs(os.path.join(AUD, 'clips'), exist_ok=True)
    replaced = 0
    for key, fn in new.items():
        data = z.read('clips/' + fn)
        if len(data) < 500: print('skipped (empty clip):', key); continue
        if key in old and old[key] != fn:
            try: os.remove(os.path.join(AUD, 'clips', old[key]))
            except OSError: pass
        if key in old: replaced += 1
        with open(os.path.join(AUD, 'clips', fn), 'wb') as f: f.write(data)
        old[key] = fn
    with open(man_p, 'w', encoding='utf-8') as f: json.dump(old, f, ensure_ascii=False, indent=1, sort_keys=True)
    info = json.loads(z.read('voices.json')) if 'voices.json' in z.namelist() else {}
    with open(os.path.join(AUD, 'voices.json'), 'w', encoding='utf-8') as f: json.dump(info, f, ensure_ascii=False, indent=1)
    print(f'{len(new)} clips added ({replaced} replaced old ones); now {len(old)} sentences have a recorded voice.', 'Voices:', info.get('voices'))
    if info.get('failed'): print(len(info['failed']), 'sentences failed in the voice maker and still use the device voice.')

if __name__ == '__main__':
    main(sys.argv[1])
