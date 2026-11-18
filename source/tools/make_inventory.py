"""Picture inventory for future work (new games, quizzes, units): a reference for whoever builds the site next.

  python3 tools/make_inventory.py        (also run by tools/publish.py)

Reads dist/assets/art.json (the pictures that really exist) and the art manifests, and writes:
  docs/PICTURES.md        grouped, human/Claude-readable list: id, emoji it replaces, Arabic/English name, what is drawn
  docs/pictures.json      the same rows as data, for scripts (filter by group, search by word or emoji)
"""
import json, os, re, collections

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART_SRC = os.path.join(os.path.dirname(HERE), 'art-source')
art = json.load(open(os.path.join(HERE, 'dist', 'assets', 'art.json'), encoding='utf-8'))
art.pop('_icons', None)

rows = {}
AR = re.compile("[\\u0600-\\u06FF]")
def names(name):
    """'أرنب; Rabbit' -> ('أرنب', 'Rabbit'); Arabic-only or English-only names fill one side"""
    parts = [x.strip() for x in name.split(';') if x.strip()]
    return (' / '.join(dict.fromkeys(x for x in parts if AR.search(x))), ' / '.join(dict.fromkeys(x for x in parts if not AR.search(x))))
def row(i):
    return rows.setdefault(i, {'id': i, 'group': i.split('-')[0], 'emoji': '', 'ar': '', 'en': '', 'draw': '', 'style': '', 'extra': '', 'used': ''})

KOKO = re.compile(r'"Koko", an original small round soft-3D koala child:.*?gold star badge,? ?')
def short(p, n=160):
    p = KOKO.sub('Koko ', p)
    p = re.split(r'\. (Soft-3D|Polished 2D|Palette|Centred|Background)', p)[0].strip()
    return p if len(p) <= n else p[:n].rsplit(' ', 1)[0] + '…'

# core artwork (mascot, avatars, rewards, subject/unit/topic covers, UI)
for e in json.load(open(os.path.join(ART_SRC, 'manifest-core.json'), encoding='utf-8')):
    if e['id'] not in art: continue
    r = row(e['id']); r['emoji'] = e.get('replaces', ''); r['draw'] = short(e.get('prompt', '')); r['style'] = e.get('style', '')
# single content pictures: the prompt names the idea as "as: <Arabic>; <English>."
for e in json.load(open(os.path.join(ART_SRC, 'manifest-content.json'), encoding='utf-8')):
    if e['id'] not in art: continue
    r = row(e['id']); r['emoji'] = e.get('replaces', ''); r['style'] = e.get('style', '')
    m = re.search(r'as: (.+?)\. The current placeholder', e.get('prompt', ''))
    if m: r['ar'], r['en'] = names(m.group(1))
# sprite-sheet pictures: each cell says what was drawn; dictionary cells read "word (Arabic): definition"
ms = json.load(open(os.path.join(ART_SRC, 'manifest-sheets.json'), encoding='utf-8'))
for s in (ms['sheets'] if isinstance(ms, dict) else ms):
    for c in s['cells']:
        if c['id'] not in art: continue
        r = row(c['id']); r['style'] = r['style'] or '2d'
        m = re.match(r'(.+?) \((.+?)\): (.*)', c['draw'])
        if m and c['id'].startswith('dict-'): r['en'], r['ar'], r['draw'] = m.group(1), m.group(2), m.group(3)
        else:
            r['extra'] = r['extra'] or 'sheet: ' + s['id'].replace('sheet-', '')
            m2 = re.match(r'(.+) \(the idea of (.+)\)$', c['draw'])
            if m2:
                a, e = names(m2.group(1)); r['ar'] = r['ar'] or a; r['en'] = r['en'] or e; r['emoji'] = r['emoji'] or m2.group(2)
            else: r['draw'] = c['draw']
# dictionary words: topic, level and emoji from the word list (same id rule as build.py)
data = open(os.path.join(HERE, 'src', 'apps', 'dict', 'data.js'), encoding='utf-8').read()
topics = dict(re.findall(r"^\s+(\w+): \['[^']*', '([^']+)'", data, re.M))
seen = {}
for line in data.split('\n'):
    p = [x.strip() for x in line.strip().split('|')]
    if len(p) < 8: continue
    slug = re.sub(r'[^a-z0-9]+', '-', p[0].lower()).strip('-'); seen[slug] = seen.get(slug, 0) + 1; n = seen[slug]
    for cand in (slug if n == 1 else f'{slug}-{n}', slug + '-2' * (n - 1)):
        if 'dict-' + cand in art:
            r = row('dict-' + cand); r['en'] = r['en'] or p[0]; r['ar'] = r['ar'] or p[3]; r['emoji'] = r['emoji'] or p[2]
            r['draw'] = r['draw'] or p[4]; r['extra'] = f'topic {p[7]} ({topics.get(p[7], "")}), level {p[6]}, {p[1]}'; break
for i in art:
    r = row(i)
    if not (r['en'] or r['ar'] or r['draw']): r['draw'] = i.replace('-', ' ')
# where each picture is already used: files under src/ that name its id, or (for unit/game content) contain its emoji
srcs = {}
for d, _, fs in os.walk(os.path.join(HERE, 'src')):
    for f in fs:
        if f.endswith(('.js', '.html', '.css')):
            rel = os.path.relpath(os.path.join(d, f), os.path.join(HERE, 'src'))
            if rel.startswith('audio'): continue
            srcs[rel.replace('apps/', '').replace('.js', '')] = open(os.path.join(d, f), encoding='utf-8').read()
for r in rows.values():
    if r['group'] == 'dict': continue
    g, rest = r['group'], r['id'][len(r['group']) + 1:]
    def uses(t):
        if r['id'] in t: return True
        if r['emoji'] and g in ('sci', 'kg') and r['emoji'] in t: return True
        # ids built at runtime: 'math-' + name, HS.mascot('cheer')
        if (f"'{g}-'" in t or (g == 'mascot' and 'HS.mascot(' in t)) and re.search(r"['\"`]" + re.escape(rest) + r"['\"`]", t): return True
        return False
    hits = [k for k, t in srcs.items() if uses(t)]
    if g == 'avatar': hits.append('core (avatar picker lists every avatar-*)')
    r['used'] = ', '.join(sorted(hits)[:6]) + (' …' if len(hits) > 6 else '')
for r in rows.values():
    pass

# ---------- write ----------
GROUPS = [
    ('dict', 'Dictionary words (1 picture per word; also good for vocabulary quizzes, matching, spelling, categories)'),
    ('kg', 'Kindergarten (letters/numbers/world/thinking games: animals, objects, food, everyday things)'),
    ('sci', 'Science (Grade 3-4 units: plants, animals, ecosystems, matter, weather, space, body…)'),
    ('math', 'Maths (countable objects for counting, equal groups, arrays, money, shapes, measuring)'),
    ('avatar', 'Avatars (soft-3D, chosen by the child)'), ('mascot', 'Mascot "Koko" poses'),
    ('reward', 'Rewards / gifts shop'), ('game', 'Game covers & game UI'), ('subject', 'Subject covers'),
    ('unit', 'Unit covers'), ('topic', 'Dictionary topic covers'), ('grade', 'Grade covers'),
]
other = sorted({r['group'] for r in rows.values()} - {g for g, _ in GROUPS})
GROUPS.append(('*', 'Other UI artwork (' + ', '.join(other) + ')'))
by = collections.defaultdict(list)
for r in sorted(rows.values(), key=lambda r: r['id']):
    by[r['group'] if r['group'] in dict(GROUPS) else '*'].append(r)

esc = lambda s: (s or '').replace('|', '/').replace('\n', ' ')
out = ['# Picture inventory', '',
       f'Generated by `tools/make_inventory.py` on every publish; {len(rows)} pictures that exist in `dist/assets/art.json`. Do not edit by hand.', '',
       '## How to use a picture',
       '- By id: `HS.art(id)` / `HS.ART[id].src` (`sm` = small version, `face` = face crop for avatars/mascot).',
       '- By emoji: `HS.picFor(emoji, areas)` or write the emoji in content and call `HS.picify(ROOT, ["sci","kg","dict"])` at the end of the app; emoji next to words become small inline pictures.',
       '- Dictionary word → picture: `HS_PICMAP.dictw["<word>|<topic>"]`.',
       '- New pictures: add cells to a sheet in `art-source/manifest-sheets.json` (Codex draws them), never edit raw art; fixes go in `source/art/fixes/<id>.png`.',
       '- Search this file (or `docs/pictures.json`) by English word, Arabic word or emoji before asking for new art.', '',
       'Columns: `used in` = source files (under `src/`) that already show the picture, by id or by its emoji; empty = not used yet (free for new content). Dictionary pictures are all used by the dictionary.', '',
       '## Counts', '']
out += [f'- {g if g != "*" else "other"}: {len(by[g])}' for g, _ in GROUPS if by[g]]
for g, title in GROUPS:
    if not by[g]: continue
    out += ['', f'## {title}', '', '| id | emoji | Arabic | English | drawn / meaning | notes | used in |', '|---|---|---|---|---|---|---|']
    out += [f"| `{r['id']}` | {r['emoji']} | {esc(r['ar'])} | {esc(r['en'])} | {esc(r['draw'])} | {esc(r['extra'] or r['style'])} | {esc(r['used'])} |" for r in by[g]]
os.makedirs(os.path.join(HERE, 'docs'), exist_ok=True)
open(os.path.join(HERE, 'docs', 'PICTURES.md'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
json.dump(sorted(rows.values(), key=lambda r: r['id']), open(os.path.join(HERE, 'docs', 'pictures.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=0)
print(f'picture inventory: {len(rows)} pictures -> docs/PICTURES.md, docs/pictures.json')
