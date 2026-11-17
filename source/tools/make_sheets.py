"""Writes ../art-source/manifest-sheets.json: the content pictures drawn as sprite sheets (many small objects
in one image) instead of one 1024 px image each.

  python3 tools/make_sheets.py

Each sheet is one 1024×1024 image with a grid of objects (4×4 = 16 cells of 256 px, or 3×3 = 9 cells of
341 px for detailed subjects). tools/art_process.py cuts finished sheets into one picture per cell, using the
same ids and files as manifest-content.json, so the site needs no other change.

Sources:
- the maths pictures below (new: single objects; the site repeats them to make groups, rows and arrays, so
  every count in an exercise is exact — a generated picture is never trusted to show "5 apples");
- manifest-content.json phase 7 (KG, science) and phase 8 (dictionary, grouped by topic; words that cannot be
  pictured, such as day and month names, are left out and keep their emoji).
"""
import json, os, re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(os.path.dirname(HERE), 'art-source')

STYLE = ("Polished 2D illustration for a premium children's learning game: flat shapes with soft gradient shading "
         "(light from the upper left), no outlines, rounded corners, simple readable silhouettes that still work at 48 px. "
         "Palette: cream #FFF8E7, sand #F3E2C3, green #58CC02, blue #1C7ED6, gold #FFC800, orange #FF9600, "
         "pink #FF6F91, purple #8E5CF7, darkest shadows ink #3C3C3C (never pure black).")

# ---------------- new: maths (single objects; the site makes the groups) ----------------
MATH = [
    ('math-count', 'Countable objects for counting, equal groups and arrays', 4, [
        ('apple', 'one red apple with a small green leaf'), ('orange', 'one orange fruit'), ('date', 'one brown date fruit'),
        ('cookie', 'one round cookie with chocolate chips'), ('pencil', 'one yellow pencil, lying diagonally'), ('crayon', 'one blue crayon'),
        ('egg', 'one white egg standing upright'), ('flower', 'one pink flower head with a short stem'), ('star', 'one gold five-pointed star'),
        ('ball', 'one small blue and white ball'), ('toycar', 'one small red toy car seen from the side'), ('bird', 'one small blue bird seen from the side'),
        ('fish', 'one small orange fish seen from the side'), ('book', 'one closed green book'), ('marble', 'one glass marble with a swirl'),
        ('balloon', 'one purple balloon with a short string')]),
    ('math-groups', 'Containers for equal groups', 3, [
        ('plate', 'one empty round plate seen from slightly above'), ('bag', 'one empty open paper bag'), ('box', 'one empty open cardboard box'),
        ('cup', 'one empty cup'), ('basket', 'one empty woven basket'), ('tray', 'one empty rectangular tray seen from slightly above'),
        ('jar', 'one empty glass jar without lid'), ('pencilcase', 'one open empty pencil case'), ('nest', 'one empty bird nest')]),
    ('math-tools', 'Maths tools and manipulatives', 3, [
        ('counter', 'one round flat red counter (a plain disc)'), ('counter-yellow', 'one round flat yellow counter (a plain disc)'),
        ('cube', 'one small blue unit cube (base-ten block, a single cube)'), ('rod', 'one ten-rod: a row of exactly ten small green cubes joined in a straight vertical line'),
        ('flat', 'one hundred-flat: a square of ten by ten small orange cubes joined flat'), ('linkcube', 'one linking cube with a connector bump, purple'),
        ('die', 'one white dice with round dots (pips) only, showing three faces'), ('clock', 'one round clock face with hands and tick marks but no numbers'),
        ('ruler', 'one wooden ruler with tick marks but no numbers')]),
    ('math-comes-in', 'Things that come in groups (for times-table stories)', 4, [
        ('bicycle', 'one bicycle with two wheels, side view'), ('clover', 'one green three-leaf clover'), ('car', 'one family car seen from slightly above so all four wheels show'),
        ('hand', 'one open hand showing five fingers'), ('ant', 'one friendly ant with six legs, top view'), ('spider', 'one friendly spider with eight legs, top view'),
        ('eggbox', 'one egg carton with two rows of three eggs (six eggs)'), ('starfish', 'one starfish with five arms'), ('chair', 'one chair with four legs'),
        ('stool', 'one three-legged stool'), ('octopus', 'one friendly octopus with eight arms'), ('ladybird', 'one ladybird with spots'),
        ('wheel', 'one single tyre wheel'), ('sock', 'one pair of socks (two socks)'), ('glove', 'one pair of gloves (two gloves)'), ('shoe', 'one pair of shoes (two shoes)')]),
]

# dictionary words with no clear picture: they keep their emoji
NO_PICTURE = {'week', 'month', 'year', 'today', 'tomorrow', 'yesterday', 'minute', 'second', 'time', 'date', 'past', 'future',
              'now', 'soon', 'later', 'usually', 'often', 'again', 'before', 'after', 'always', 'never', 'sometimes', 'early', 'late',
              'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'january', 'february', 'march', 'april',
              'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'}

TOPIC = {'fam': 'Family and people', 'body': 'Body and health', 'food': 'Food and drinks', 'ani': 'Animals', 'home': 'Home', 'sch': 'School',
         'town': 'Places', 'job': 'Jobs', 'trans': 'Transport', 'nat': 'Nature and weather', 'time': 'Time', 'sport': 'Sports and hobbies',
         'clo': 'Clothes', 'feel': 'Feelings and describing words', 'act': 'Action words', 'sci': 'Science and space', 'col': 'Colours and shapes',
         'num': 'Numbers and maths', 'life': 'Faith and daily life'}


def subject(e):
    """the thing to draw, from a manifest-content prompt"""
    m = re.search(r'recognises as: (.*?)\. The current placeholder is the emoji (.*?);', e['prompt'])
    return (m.group(1).strip(), m.group(2).strip()) if m else (e['id'], e.get('replaces', ''))


def prompt(title, grid, cells):
    n, cols = len(cells), grid
    lines = [f'{i + 1}. (row {i // cols + 1}, column {i % cols + 1}): {c["draw"]}' for i, c in enumerate(cells)]
    empty = cols * cols - n
    return (f'A sprite sheet of {n} separate small pictures for a children\'s learning game ({title}). '
            f'Arrange them in an invisible grid of {cols} columns and {cols} rows on a 1024x1024 canvas: one picture centred '
            f'in each cell of about {1024 // cols}x{1024 // cols} px, in reading order from left to right, top row first.\n'
            + '\n'.join(lines) + '\n'
            + (f'The last {empty} cell{"s stay" if empty > 1 else " stays"} completely empty.\n' if empty else '')
            + 'Every picture stays fully inside its own cell with at least 12% empty space on every side; pictures never touch or overlap. '
            'Draw each one as a single clear picture of the idea, not a copy of an emoji. All pictures at a similar size, same light '
            'direction and same style, so they look like one set. No grid lines, frames, borders, labels, captions, cards or tiles behind '
            'the pictures, no floor and no shadow on the background. ' + STYLE + ' '
            'Background: fully transparent (PNG with alpha channel). No text, letters or numbers anywhere.')


def sheet(sid, title, grid, cells, phase):
    return {'id': 'sheet-' + sid, 'phase': phase, 'size': '1024x1024', 'grid': grid, 'cell': 1024 // grid,
            'cells': [{'id': c['id'], 'file': c['file'], 'draw': c['draw']} for c in cells], 'prompt': prompt(title, grid, cells)}


def chunks(xs, n):
    return [xs[i:i + n] for i in range(0, len(xs), n)]


def main():
    content = json.load(open(os.path.join(ART, 'manifest-content.json'), encoding='utf-8'))
    out = []
    # phase 7: the test sheet (maths objects) · phase 8: the rest of maths
    for k, (sid, title, grid, items) in enumerate(MATH):
        cells = [{'id': 'math-' + i, 'file': f'assets/content/math/{i}.webp', 'draw': d} for i, d in items]
        out.append(sheet(sid, title, grid, cells, 7 if k == 0 else 8))
    # phase 9: kindergarten (4×4)
    kg = [e for e in content if e['id'].startswith('kg-')]
    for n, part in enumerate(chunks(kg, 16), 1):
        cells = [{'id': e['id'], 'file': e['file'], 'draw': '{} (the idea of {})'.format(*subject(e))} for e in part]
        out.append(sheet(f'kg-{n}', 'kindergarten learning pictures', 4, cells, 9))
    # phase 10: science (3×3: more detailed pictures, such as a volcano or soil layers)
    sci = [e for e in content if e['id'].startswith('sci-')]
    for n, part in enumerate(chunks(sci, 9), 1):
        cells = [{'id': e['id'], 'file': e['file'], 'draw': '{} (the idea of {})'.format(*subject(e))} for e in part]
        out.append(sheet(f'sci-{n:02d}', 'science lesson pictures for children aged 8-10', 3, cells, 10))
    # phase 11: dictionary, by topic (4×4)
    raw = open(os.path.join(HERE, 'src', 'apps', 'dict', 'data.js'), encoding='utf-8').read()
    topic, seen = {}, {}
    for line in raw.split('\n'):   # same ids as manifest-content: spaces → '-', a repeated word (second meaning) → '-2'
        p = line.strip().split('|')
        if len(p) < 8: continue
        slug = re.sub(r"[^a-z0-9]+", '-', p[0].strip().lower()).strip('-')
        seen[slug] = seen.get(slug, 0) + 1
        n = seen[slug]
        for k in {slug + ('' if n == 1 else f'-{n}'), slug + '-2' * (n - 1)}: topic[k] = p[-1].strip()   # a third meaning is 'star-2-2' in manifest-content
    words = {}
    for e in content:
        if not e['id'].startswith('dict-'): continue
        w = e['id'][5:]
        if w.lower() in NO_PICTURE: continue
        words.setdefault(topic.get(w.lower(), ''), []).append(e)
    if words.get(''): print('no topic for:', [e['id'] for e in words['']][:20])
    for t in TOPIC:
        for n, part in enumerate(chunks(words.get(t, []), 16), 1):
            cells = [{'id': e['id'], 'file': e['file'], 'draw': subject(e)[0]} for e in part]
            out.append(sheet(f'dict-{t}-{n}', f'dictionary words: {TOPIC[t]}', 4, cells, 11))
    left = sum(len(v) for k, v in words.items() if k not in TOPIC)
    with open(os.path.join(ART, 'manifest-sheets.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    by = {}
    for s in out: by.setdefault(s['phase'], [0, 0]); by[s['phase']][0] += 1; by[s['phase']][1] += len(s['cells'])
    print('manifest-sheets.json:', len(out), 'sheets,', sum(len(s['cells']) for s in out), 'pictures;', 'by phase (sheets, pictures):', by,
          '| dictionary words left out:', len(NO_PICTURE & {e['id'][5:].lower() for e in content if e['id'].startswith('dict-')}), '| without topic:', left)


if __name__ == '__main__':
    main()
