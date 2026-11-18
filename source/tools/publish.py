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
                 '{{HAVE}}': json.dumps(have, ensure_ascii=False), '{{COUNT_NEW}}': str(new_n), '{{CHARS_NEW}}': f"{sum(len(l['text']) for l in lines if l['lang'] + '|' + l['text'] not in set(have)):,}"}.items():
        t = t.replace(k, v)
    eleven = open(os.path.join(HERE, 'tools', 'voice_maker', 'eleven.js'), encoding='utf-8').read()
    t = t.replace('{{ELEVEN_JS}}', eleven).replace('{{CHARS_AR}}', f"{sum(len(l['text']) for l in lines if l['lang'] == 'ar'):,}")
    with open(os.path.join(HERE, 'dist', 'voice-maker.html'), 'w', encoding='utf-8') as f: f.write(t)
    # the listening test (tools/voice_maker/test.html): the same sentences in each voice, names hidden
    clips = json.load(open(man, encoding='utf-8')) if os.path.isfile(man) else {}
    site = lambda text, lang='ar': ('assets/audio/' + clips[lang + '|' + text]) if lang + '|' + text in clips else None
    TEST = [('الحروف', x) for x in ['ألف. أرنب', 'ثاء', 'حاء', 'خاء', 'ذال', 'ضاد', 'ظاء', 'عين', 'غين', 'قاف']] + \
           [('تشجيع', x) for x in ['أحسنت!', 'أحسنتِ!', 'ممتاز!', 'رائع!', 'سلسلة رائعة!', 'حاول مرة ثانية', 'هيا نلعب!']] + \
           [('تعليمات الروضة', x) for x in ['أين حرف غين؟', 'أربعة زائد اثنان، كم يساوي؟', 'رتّبي القصة: ماذا حدث أولًا؟', 'خذي النجمة أولًا، ثم اذهبي إلى التفاحة',
                                         'أوه! اصطدم الروبوت. جرّبي طريقًا آخر']] + \
           [('جملة علوم (للمستقبل)', 'النباتات تصنع غذاءها بنفسها من ضوء الشمس والماء.')]
    test = [{'cat': c, 'text': x, 'lang': 'ar', 'site': site(x)} for c, x in TEST]
    test += [{'cat': 'English (KG)', 'text': x, 'lang': 'en', 'site': site(x, 'en')} for x in
             ['A is for Apple', 'H is for Hat', 'Q is for Queen', 'Great job!', 'Well done!', 'Amazing!', 'Try again', 'Where is blue?', '2 plus 3. How many?', 'Build a rocket with the shapes']]
    ref_text = 'أحسنتِ اليوم! حان وقت الاستراحة. لنلعب بعيدًا عن الشاشة'
    ref = {'text': ref_text, 'url': site(ref_text)}
    tt = open(os.path.join(HERE, 'tools', 'voice_maker', 'test.html'), encoding='utf-8').read()
    tt = tt.replace('{{ELEVEN_JS}}', eleven).replace('{{TEST}}', json.dumps(test, ensure_ascii=False)).replace('{{REF}}', json.dumps(ref, ensure_ascii=False))
    with open(os.path.join(HERE, 'dist', 'voice-test.html'), 'w', encoding='utf-8') as f: f.write(tt)
    print('listening test:', len(test), 'sentences,', sum(1 for x in test if x['site']), 'with a current clip')
except (OSError, subprocess.CalledProcessError) as e:
    print('voice maker page skipped (needs node):', e)
shutil.copy2(os.path.join(HERE, 'dist', 'index.html'), os.path.join(REPO, 'index.html'))
if os.path.isfile(os.path.join(HERE, 'dist', 'voice-maker.html')):
    shutil.copy2(os.path.join(HERE, 'dist', 'voice-maker.html'), os.path.join(REPO, 'voice-maker.html'))
if os.path.isfile(os.path.join(HERE, 'dist', 'voice-test.html')):
    shutil.copy2(os.path.join(HERE, 'dist', 'voice-test.html'), os.path.join(REPO, 'voice-test.html'))
n = 0
for root, _, files in os.walk(os.path.join(HERE, 'dist', 'assets')):
    for f in files:
        src = os.path.join(root, f)
        dst = os.path.join(REPO, os.path.relpath(src, os.path.join(HERE, 'dist')))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst) or open(src, 'rb').read() != open(dst, 'rb').read():
            shutil.copy2(src, dst); n += 1
print(f'Published index.html and {n} changed asset file(s) to {REPO}')
