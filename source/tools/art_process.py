"""Turns the approved raw artwork into the site's finished assets.

  python3 tools/art_process.py [RAW_DIR]          # default RAW_DIR: ../art-source/raw

Reads the asset lists (manifest-core.json, manifest-content.json) from ../art-source/ (falls back to art/).
For every RAW_DIR/<id>.png that the lists send to an 'assets/...' path:
  1. keeps a transparent PNG as it is; otherwise removes a flat chroma-green background,
  2. trims empty space and pads it to a square with a small margin,
  3. saves dist/<file> (WebP, 512 px) and, for avatars, mascot, badges and rewards, a '-sm' copy (192 px);
     avatars also get a '-face' copy (192 px, head and shoulders) for the small round avatar spots.
Also makes the brand files the lists keep outside assets/ (logo-mark) and the home-screen icons.
Writes dist/assets/art.json: {id: {src, sm?}}. build.py reads it, so the site only shows pictures that exist
and keeps its emoji for the rest. Adding a new picture = put its PNG in RAW_DIR, run this, run build.py.
The artwork itself is never changed: only background removal (when needed), trimming and resizing.
"""
import json, os, sys
from PIL import Image
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(ROOT)
DIST = os.path.join(ROOT, 'dist')
SMALL = ('/avatars/', '/badges/', '/rewards/', '/mascot/')
# brand art that the asset lists keep outside assets/ (it was meant as a source), and where the site uses it
EXTRA = {'logo-mark': 'assets/brand/logo-mark.webp'}
# full scenes (not in the asset lists): kept whole, only resized. Each language has its own mirror image:
# the free sky is on the side where reading starts, so the greeting sits there.
SCENES = {'home-hero-koko': 'assets/hero/home-hero-koko.webp', 'home-hero-koko-en': 'assets/hero/home-hero-koko-en.webp'}
CREAM = (255, 248, 231, 255)


def manifest_dir():
    for d in (os.path.join(REPO, 'art-source'), os.path.join(ROOT, 'art')):
        if os.path.exists(os.path.join(d, 'manifest-core.json')):
            return d
    sys.exit('art_process: no manifest-core.json in ../art-source or art/')


def key_green(img):
    a = np.asarray(img.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    spill = g - np.maximum(r, b)
    alpha = 1 - np.clip((spill - 140) / 90, 0, 1)           # #00FF00 -> see-through; palette green #58CC02 stays solid
    g2 = np.where((spill > 0) & (alpha < 0.999), np.maximum(r, b) + spill * 0.15 * alpha, g)
    return Image.fromarray(np.dstack([r, g2, b, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA')


def rim(alpha, px=2):
    """pixels on the outline: see-through or semi-transparent, or within px pixels of the see-through area"""
    clear = alpha < 128
    near = clear.copy()
    for dy in range(-px, px + 1):
        for dx in range(-px, px + 1):
            near |= np.roll(np.roll(clear, dy, 0), dx, 1)
    return near | (alpha < 250)


def chroma(a):
    """green that comes from a chroma-key background blended into the edge: green well above red and blue,
    with red and blue close together (art greens such as leaves have far less blue than red)"""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (g - np.maximum(r, b) > 25) & (b > 0.55 * r)


def despill(img):
    """take the left-over chroma green out of the outline only; the rest of the picture is untouched"""
    a = np.asarray(img).astype(np.float32)
    m = rim(a[..., 3]) & chroma(a)
    mx = np.maximum(a[..., 0], a[..., 2])
    a[..., 1] = np.where(m, mx + (a[..., 1] - mx) * 0.1, a[..., 1])
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


def load(src):
    im = Image.open(src)
    if im.mode in ('RGBA', 'LA') and min(im.getchannel('A').getextrema()) < 10:
        return despill(im.convert('RGBA'))
    return despill(key_green(im))


def fringe(img):
    """outline pixels that are still visibly chroma-green"""
    a = np.asarray(img).astype(np.float32)
    edge = (a[..., 3] > 20) & (a[..., 3] < 235)
    return int((edge & chroma(a)).sum()), int(edge.sum())


def finish(img, size, margin=0.06):
    box = img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if box: img = img.crop(box)
    w, h = img.size; side = int(max(w, h) * (1 + 2 * margin))
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - w) // 2, (side - h) // 2), img)
    return canvas.resize((size, size), Image.LANCZOS)


def run_width(row, c):
    """width of the solid run of pixels in this row that contains column c (or the run nearest to it)"""
    idx = np.nonzero(row)[0]
    if not len(idx): return 0
    if not row[c]: c = idx[np.argmin(abs(idx - c))]
    l = r = c
    while l > 0 and row[l - 1]: l -= 1
    while r < len(row) - 1 and row[r + 1]: r += 1
    return r - l


def face(img, kid):
    """head-and-shoulders square for the small avatar circles. The characters are drawn full-body, so a plain
    shrink makes some look far away. Children: about 1.5 head-widths (the run through the head centre, so a
    waving hand does not count). Animals (head as wide as the body): the top 82% of the figure."""
    a = np.asarray(img.getchannel('A')) > 60
    ys, xs = np.nonzero(a); top, bot = ys.min(), ys.max(); h = bot - top
    band = a[top:top + max(1, int(h * .08))]; bx = np.nonzero(band.any(0))[0]; cx = int((bx.min() + bx.max()) / 2)
    if kid:
        hw = np.percentile([run_width(a[y], cx) for y in range(top, top + int(h * .3))], 90)
        side = int(min(h * 1.02, hw * 1.5))
    else:
        side = int(h * .82)
    x0, y0 = int(cx - side / 2), int(top - side * .07)
    c = Image.new('RGBA', (side, side), (0, 0, 0, 0)); c.paste(img.crop((x0, y0, x0 + side, y0 + side)), (0, 0))
    return c


def save(img, rel, size):
    dst = os.path.join(DIST, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    finish(img, size).save(dst, 'WEBP', quality=88, method=6)


def icons(img):
    """home-screen icon and favicon: the app icon on the cream page colour (iOS fills see-through parts with black)"""
    out = {}
    for name, size, pad in (('apple-touch-icon.png', 180, .08), ('icon-192.png', 192, .08), ('favicon-64.png', 64, .02)):
        bg = Image.new('RGBA', (size, size), CREAM)
        art = finish(img, int(size * (1 - 2 * pad)), margin=0)
        bg.alpha_composite(art, ((size - art.width) // 2, (size - art.height) // 2))
        rel = 'assets/brand/' + name
        os.makedirs(os.path.join(DIST, 'assets/brand'), exist_ok=True)
        bg.convert('RGB').save(os.path.join(DIST, rel), optimize=True)
        out[name.split('.')[0]] = rel
    return out


# art/fixes/<id>.png: corrections made after generation (e.g. game-story-card: the eggs were drawn too thin).
# They replace the raw picture when the site is built; the raw files are never changed.
HERE_FIXES = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'art', 'fixes')

def main(raw_dir):
    mdir = manifest_dir()
    entries = []
    for m in ('manifest-core.json', 'manifest-content.json'):
        p = os.path.join(mdir, m)
        if os.path.exists(p): entries += json.load(open(p, encoding='utf-8'))
    reg, problems = {}, []
    for e in entries:
        rel = e['file'] if e['file'].startswith('assets/') else EXTRA.get(e['id'])
        src = os.path.join(raw_dir, e['id'] + '.png')
        fix = os.path.join(HERE_FIXES, e['id'] + '.png')   # a corrected version made here (the raw file stays as generated)
        if os.path.exists(fix): src = fix
        if not rel or not os.path.exists(src): continue
        smrel = rel.replace('.webp', '-sm.webp') if any(k in rel for k in SMALL) else None
        facerel = rel.replace('.webp', '-face.webp') if '/avatars/' in rel and not e['id'].endswith('-happy') else None
        outs = [os.path.join(DIST, x) for x in (rel, smrel, facerel) if x]
        fresh = all(os.path.exists(o) and os.path.getmtime(o) >= max(os.path.getmtime(src), os.path.getmtime(__file__)) for o in outs)
        reg[e['id']] = {'src': rel, **({'sm': smrel} if smrel else {}), **({'face': facerel} if facerel else {})}
        if fresh and e['id'] != 'app-icon':
            continue
        img = load(src)
        bad, edge = fringe(img)
        if bad > max(30, edge * .01): problems.append(f'{e["id"]}: {bad} green-tinted edge pixels')
        save(img, rel, 512)
        if smrel: save(img, smrel, 192)
        if facerel:
            f = face(img, e['id'].startswith(('avatar-boy', 'avatar-girl')))
            os.makedirs(os.path.dirname(os.path.join(DIST, facerel)), exist_ok=True)
            f.resize((192, 192), Image.LANCZOS).save(os.path.join(DIST, facerel), 'WEBP', quality=88, method=6)
        if e['id'] == 'app-icon':
            reg['_icons'] = icons(img)
    for sid, rel in SCENES.items():
        src = os.path.join(raw_dir, sid + '.png')
        if not os.path.exists(src): continue
        sm = rel.replace('.webp', '-800.webp'); reg[sid] = {'src': rel, 'sm': sm, 'w': 0, 'h': 0}
        im = Image.open(src).convert('RGB'); reg[sid]['w'], reg[sid]['h'] = im.size
        for r, w in ((rel, 1600), (sm, 800)):
            dst = os.path.join(DIST, r); os.makedirs(os.path.dirname(dst), exist_ok=True)
            if os.path.exists(dst) and os.path.getmtime(dst) >= max(os.path.getmtime(src), os.path.getmtime(__file__)): continue
            im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(dst, 'WEBP', quality=84, method=6)
    os.makedirs(os.path.join(DIST, 'assets'), exist_ok=True)
    with open(os.path.join(DIST, 'assets', 'art.json'), 'w', encoding='utf-8') as f:
        json.dump(reg, f, ensure_ascii=False, indent=1, sort_keys=True)
    for p in problems: print('check', p)
    print(f'{len([k for k in reg if not k.startswith("_")])} images finished into dist/assets (registry: dist/assets/art.json)')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO, 'art-source', 'raw'))
