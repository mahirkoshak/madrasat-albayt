"""Build everything and put it where GitHub Pages serves it (the repository root).

  python3 tools/publish.py

1. tools/art_process.py  ../art-source/raw  ->  dist/assets/ (+ art.json)
2. build.py                                ->  dist/index.html
3. copies dist/index.html to ../index.html and dist/assets/ to ../assets/
Files already in ../assets that the build no longer makes are left alone (nothing is deleted).
Then commit index.html and assets/ and push.
"""
import os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(HERE)
run = lambda *a: subprocess.run([sys.executable, *a], cwd=HERE, check=True)
run(os.path.join('tools', 'art_process.py'))
run('build.py')
shutil.copy2(os.path.join(HERE, 'dist', 'index.html'), os.path.join(REPO, 'index.html'))
n = 0
for root, _, files in os.walk(os.path.join(HERE, 'dist', 'assets')):
    for f in files:
        src = os.path.join(root, f)
        dst = os.path.join(REPO, os.path.relpath(src, os.path.join(HERE, 'dist')))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst) or open(src, 'rb').read() != open(dst, 'rb').read():
            shutil.copy2(src, dst); n += 1
print(f'Published index.html and {n} changed asset file(s) to {REPO}')
