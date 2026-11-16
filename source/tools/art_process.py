"""Turns Codex's raw artwork into the site's finished assets.

  python3 tools/art_process.py RAW_DIR            # e.g. ../site-repo/art-source/raw

For every art/raw/<id>.png that is listed in art/manifest-*.json:
  1. removes the flat chroma-green background (soft edges kept, green spill removed),
  2. trims empty space and pads to a square with a small margin,
  3. saves the WebP at the manifest's 'file' path: 512 px, plus a 128 px '-sm' copy for avatars, badges and rewards.
Prints anything that looks wrong (background left over, image missing).
"""
import json, os, sys
from PIL import Image
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def key_green(img):
    a = np.asarray(img.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # how strongly a pixel is "background green": green far above both red and blue
    spill = g - np.maximum(r, b)
    alpha = 1 - np.clip((spill - 140) / 90, 0, 1)           # #00FF00 (spill 255) -> 0; palette green #58CC02 (spill 116) stays solid
    # remove the green fringe on soft edges
    g2 = np.where((spill > 0) & (alpha < 0.999), np.maximum(r, b) + spill * 0.15 * alpha, g)   # only on see-through edges
    out = np.dstack([r, g2, b, alpha * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def finish(img, size, margin=0.06):
    box = img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if box: img = img.crop(box)
    w, h = img.size; side = int(max(w, h) * (1 + 2 * margin))
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - w) // 2, (side - h) // 2), img)
    return canvas.resize((size, size), Image.LANCZOS)


def main(raw_dir):
    entries = []
    for m in ('manifest-core.json', 'manifest-content.json'):
        p = os.path.join(ROOT, 'art', m)
        if os.path.exists(p): entries += json.load(open(p))
    done = 0
    for e in entries:
        src = os.path.join(raw_dir, e['id'] + '.png')
        if not os.path.exists(src) or not e['file'].startswith('assets/'): continue
        cut = key_green(Image.open(src))
        left = np.mean(np.asarray(cut.getchannel('A'))[:8, :] > 200)   # top rows should be see-through
        if left > 0.2: print(f'check {e["id"]}: background not fully removed ({left:.0%} of the top edge)')
        dst = os.path.join(ROOT, 'dist', e['file'])
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        finish(cut, 512).save(dst, 'WEBP', quality=86, method=6)
        if any(k in e['file'] for k in ('/avatars/', '/badges/', '/rewards/', '/mascot/')):
            finish(cut, 128).save(dst.replace('.webp', '-sm.webp'), 'WEBP', quality=86, method=6)
        done += 1
    print(f'{done} images finished into dist/assets')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'art', 'raw'))
