"""Build everything and put it where GitHub Pages serves it (the repository root).

  python3 tools/publish.py

1. tools/art_process.py  ../art-source/raw  ->  dist/assets/ (+ art.json)
2. build.py                                ->  dist/index.html
3. copies dist/index.html to ../index.html, dist/voice-maker.html to ../voice-maker.html and dist/assets/ to ../assets/
Files already in ../assets that the build no longer makes are left alone (nothing is deleted).
Then commit index.html and assets/ and push.
"""
import json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(HERE)
run = lambda *a: subprocess.run([sys.executable, *a], cwd=HERE, check=True)
run(os.path.join('tools', 'art_process.py'))
run('build.py')

# the voice maker page (tools/voice_maker): every spoken sentence, for recording natural voices with Azure
try:
    lines = json.loads(subprocess.run(['node', os.path.join(HERE, 'tools', 'speech_list.js')], capture_output=True, text=True, check=True).stdout)
    t = open(os.path.join(HERE, 'tools', 'voice_maker', 'template.html'), encoding='utf-8').read()
    ar_n = sum(1 for l in lines if l['lang'] == 'ar')
    man = os.path.join(HERE, 'src', 'audio', 'manifest.json')
    have = sorted(json.load(open(man, encoding='utf-8')).keys()) if os.path.isfile(man) else []
    new_n = sum(1 for l in lines if l['lang'] + '|' + l['text'] not in set(have))
    for k, v in {'{{LINES}}': json.dumps(lines, ensure_ascii=False), '{{COUNT}}': str(len(lines)), '{{CHARS}}': f"{sum(len(l['text']) for l in lines):,}",
                 '{{COUNT_AR}}': str(ar_n), '{{COUNT_EN}}': str(len(lines) - ar_n),
                 '{{HAVE}}': json.dumps(have, ensure_ascii=False), '{{COUNT_NEW}}': str(new_n)}.items():
        t = t.replace(k, v)
    with open(os.path.join(HERE, 'dist', 'voice-maker.html'), 'w', encoding='utf-8') as f: f.write(t)
except (OSError, subprocess.CalledProcessError) as e:
    print('voice maker page skipped (needs node):', e)
shutil.copy2(os.path.join(HERE, 'dist', 'index.html'), os.path.join(REPO, 'index.html'))
if os.path.isfile(os.path.join(HERE, 'dist', 'voice-maker.html')):
    shutil.copy2(os.path.join(HERE, 'dist', 'voice-maker.html'), os.path.join(REPO, 'voice-maker.html'))
n = 0
for root, _, files in os.walk(os.path.join(HERE, 'dist', 'assets')):
    for f in files:
        src = os.path.join(root, f)
        dst = os.path.join(REPO, os.path.relpath(src, os.path.join(HERE, 'dist')))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst) or open(src, 'rb').read() != open(dst, 'rb').read():
            shutil.copy2(src, dst); n += 1
print(f'Published index.html and {n} changed asset file(s) to {REPO}')
