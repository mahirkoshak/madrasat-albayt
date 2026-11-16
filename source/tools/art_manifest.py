"""Builds the art lists that Codex uses to generate the site's artwork.

  python3 tools/art_manifest.py

Writes art/manifest-core.json (interface art, characters, rewards, games) and art/manifest-content.json
(one picture per KG item, science item and dictionary word, read straight from the site's data files).
Each entry: {id, file, phase, style, size, prompt, replaces}. 'file' is where the finished image goes.
"""
import json, os, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'art')

BG = ('Background: perfectly flat uniform chroma green #00FF00, no gradient, no floor, no texture; '
      'no shadow on the background at all (the site adds its own shadow). No text, letters or numbers anywhere.')
S3D = ('Soft-3D render for a premium children\'s learning game: rounded toy-like clay/vinyl forms, big expressive eyes '
       'with bright catchlights, matte soft-touch materials, warm key light from upper left, soft cool rim light from the right, '
       'gentle ambient occlusion. Palette: cream #FFF8E7, sand #F3E2C3, green #58CC02, blue #1C7ED6, gold #FFC800, '
       'orange #FF9600, pink #FF6F91, purple #8E5CF7. Centred, whole subject visible with 10% margin. ' + BG)
S2D = ('Polished 2D illustration for a premium children\'s learning game: flat shapes with soft gradient shading (light from '
       'upper left), no outlines, rounded corners, simple readable silhouette that still works at 64 px, one clear focal object '
       'plus at most 2-3 supporting shapes. Palette: cream #FFF8E7, sand #F3E2C3, green #58CC02, blue #1C7ED6, gold #FFC800, '
       'orange #FF9600, pink #FF6F91, purple #8E5CF7. Centred with 10% margin. ' + BG)
MASCOT = ('"Koko", an original small round soft-3D koala child: dove-grey fur, cream belly and inner ears, big fluffy ears, '
          'large oval dark nose, big warm brown eyes, rosy cheeks, wearing a small mint-teal (#2BBBAD) backpack with a gold star badge')
KIDS = ('an original cartoon child character, big head small body (about 1:1.2), friendly expressive face, '
        'modest everyday clothes (long sleeves or t-shirt with long trousers)')

core = []
def add(id, file, phase, style, subject, replaces='', size='1024x1024', note=''):
    base = S3D if style == '3d' else S2D
    core.append({'id': id, 'file': file, 'phase': phase, 'style': style, 'size': size,
                 'replaces': replaces, 'prompt': f'{subject}. {base}' + (f' {note}' if note else '')})

# ---------- phase 1: style test (generate these first, then stop for approval) ----------
add('mascot-sheet', 'art/raw/mascot/mascot-sheet.png', 1, '3d',
    f'Character reference sheet of {MASCOT}: front view, 3/4 view, side view and back view standing in a row, same size, neutral happy expression',
    size='1536x1024')
add('mascot-welcome', 'assets/mascot/mascot-welcome.webp', 1, '3d', f'{MASCOT}, waving hello with one paw, big happy smile, full body', '👋')
add('avatar-fox', 'assets/avatars/avatar-fox.webp', 1, '3d', 'Head-and-shoulders portrait avatar of an original friendly orange fox cub with a cream muzzle, big curious eyes, a tiny green scarf', '🦊')
add('badge-champion-earned', 'assets/badges/badge-champion-earned.webp', 1, '3d',
    'A round gold medal with a soft ribbon in blue and gold, a raised trophy shape in the centre, little sparkles around it (no text)', '🏆')
add('subject-science', 'assets/catalog/subject-science.webp', 1, '2d', 'A friendly microscope beside a green leaf and a small round planet, science subject illustration', '🔬')

# ---------- phase 2: brand ----------
add('logo-mark', 'art/raw/brand/logo-mark.png', 2, '2d',
    'App icon symbol for a home learning site: a small cosy house whose roof is an open book, with a gold star above the chimney, inside a rounded square of cream', '', note='Used as the source for an SVG logo; keep shapes very simple.')
add('app-icon', 'assets/brand/app-icon.webp', 2, '3d', f'App icon: {MASCOT} peeking out of an open book shaped like a little house, rounded-square composition, cheerful', '')

# ---------- phase 3: mascot poses + avatars ----------
for pose, d, rep in [('thinking', 'tapping chin with one paw, looking up thoughtfully, a small question-mark-shaped cloud of light above (no text)', '🤔'),
                     ('cheer', 'jumping with both arms up, eyes closed with joy', '🎉'),
                     ('celebrate', 'holding a small gold trophy above its head, confetti around', '🏆'),
                     ('encourage', 'giving a gentle thumbs up with a warm reassuring smile', '💪'),
                     ('read', 'sitting and reading an open book, happy and focused', '📖'),
                     ('point', 'pointing to the left with one paw, friendly helpful expression', '👆'),
                     ('sleep', 'sleeping curled up on a small pillow, with a tiny moon nearby', '🌙'),
                     ('sad-soft', 'slightly sad but hopeful face, holding a little star, kind eyes', '🙂')]:
    add(f'mascot-{pose}', f'assets/mascot/mascot-{pose}.webp', 3, '3d', f'{MASCOT}, {d}, full body', rep)

AVATARS = [
    ('boy-curly', 'a boy with tan skin and short curly black hair, wearing a light blue t-shirt with a small star', ''),
    ('boy-glasses', 'a boy with light-olive skin, neat short brown hair and round glasses, wearing a green hoodie', ''),
    ('boy-cap', 'a boy with deep brown skin and short hair under a backwards orange cap, wearing a sports jersey', ''),
    ('boy-thobe', 'a boy with medium skin and short wavy hair, wearing a white thobe', ''),
    ('girl-bob', 'a girl with warm medium-brown skin and a short black bob with a pink hairclip, wearing a coral long-sleeve top', ''),
    ('girl-braids', 'a girl with dark brown skin and two puffy braids with purple hair ties, wearing a yellow long-sleeve top', ''),
    ('girl-ponytail', 'a girl with light skin, a high ginger-brown ponytail and freckles, wearing a teal long-sleeve top', ''),
    ('girl-waves', 'a girl with fair-olive skin and long wavy brown hair with a sky-blue headband, wearing a cosy cream cardigan', ''),
    ('fox', 'an original friendly orange fox cub with a cream muzzle and a tiny green scarf', '🦊'),
    ('cat', 'an original playful tabby cat kitten with big green eyes and a little bell collar', ''),
    ('panda', 'an original chubby panda cub holding a bamboo leaf', '🐼'),
    ('dragon', 'an original cute baby dragon, mint green with a cream belly, tiny wings and rounded horns', ''),
    ('lion', 'an original lion cub with a fluffy golden mane and a big grin', '🦁'),
    ('bunny', 'an original soft white bunny with long floppy ears and pink cheeks', '🐰'),
    ('robot', 'an original friendly round robot with a sky-blue body, a glowing heart light and antenna with a small star', '🚀'),
    ('unicorn', 'an original magical baby unicorn with a pastel rainbow mane and a gold horn', '🦄'),
    ('star-sprite', 'an original magical star sprite: a soft golden star-shaped creature with a happy face and tiny arms', '⭐'),
    ('cloud-pal', 'an original magical fluffy cloud creature with a tiny rainbow tail and a cheerful face', ''),
]
for key, d, rep in AVATARS:
    who = f'{KIDS}: {d}' if key.startswith(('boy', 'girl')) else d
    if not any(e['id'] == f'avatar-{key}' for e in core):
      add(f'avatar-{key}', f'assets/avatars/avatar-{key}.webp', 3, '3d', f'Head-and-shoulders portrait avatar of {who}, happy smile, circle-friendly composition', rep)
    add(f'avatar-{key}-happy', f'assets/avatars/avatar-{key}-happy.webp', 3, '3d', f'The same character as avatar-{key} ({who}), celebrating with a big joyful laugh and sparkles, head-and-shoulders', '',
        note=f'Use assets/avatars/avatar-{key}.webp as the reference image so the character matches exactly.')

# ---------- phase 4: navigation art ----------
NAV = [
    ('grade-kg', 'catalog', 'Colourful building blocks, a soft teddy bear and a crayon, kindergarten illustration', '🧸'),
    ('grade-g3', 'catalog', 'A small school backpack with a pencil and a ruler, early primary school illustration, blue accents', '🧒'),
    ('grade-g4', 'catalog', 'A bigger school backpack with a notebook and a compass tool, primary school illustration, purple accents', '🎒'),
    ('subject-math', 'catalog', 'Friendly plus, minus, times and divide shapes as soft rounded blocks with an abacus (no digits)', '➗'),
    ('subject-arabic', 'catalog', 'An open notebook with a reed pen and an ink pot, decorative Arabic geometric pattern border (no letters)', '📝'),
    ('subject-english', 'catalog', 'A speech bubble and an open book with a small British-style red bus toy (no letters)', '🔠'),
    ('subject-early', 'catalog', 'Two alphabet blocks and a speech bubble with sparkles, early language learning (blank block faces, no letters)', '🔤'),
    ('subject-stories', 'catalog', 'An open storybook with a crescent moon and small stars rising from its pages', '📖'),
    ('dict-cover', 'catalog', 'A big friendly purple dictionary book with a magnifying glass and floating sparkles', '📖'),
    ('unit-g3sciearth-cover', 'units', 'Earth science: a cut-away hill showing soil layers, a small volcano, a fossil shell and a rock', '🌎'),
    ('unit-g4scieco-cover', 'units', 'Ecosystems: a small desert scene with a palm tree, a camel, a lizard, a sun and a pond', '🌍'),
    ('unit-g4scihealth-cover', 'units', 'Human health: a heart, a toothbrush, a soap bar and a plate of healthy food', '🩺'),
    ('unit-g3sci-living-cover', 'units', 'Living things: a sprouting seedling, a ladybug and a leaf', '🌱'),
    ('unit-g3sci-eco-cover', 'units', 'Ecosystem: a lion cub in tall grass under a tree', '🦁'),
    ('unit-g3sci-weather-cover', 'units', 'Weather and climate: a sun peeking behind a cloud with a few raindrops and a wind swirl', '⛅'),
    ('unit-g4sci-cells-cover', 'units', 'Cells and classification: a friendly round cell under a magnifying glass, a leaf and a mushroom', '🦠'),
    ('unit-g4sci-animals-cover', 'units', 'Animals and their body systems: a paw print, a bone and a friendly heart', '🐾'),
    ('dict-mode-en', 'catalog', 'An open book with a small English flag-coloured bookmark and a sparkle (no letters)', ''),
    ('dict-mode-ar', 'catalog', 'An open book with a green bookmark and a reed pen, Arabic geometric pattern on the cover (no letters)', ''),
]
for id, folder, d, rep in NAV:
    add(id, f'assets/{folder}/{id}.webp', 4, '2d', d, rep)

KG_GAMES = [
    ('puzzle', 'A jigsaw puzzle with two pieces lifting out, showing part of a sunny garden picture', '🧩'),
    ('compose', 'A house built from simple shapes: a red square, a triangle roof and a round window', '🔺🟥'),
    ('where', 'A cute cat sitting inside an open cardboard box, with a ball beside the box', '🐱📦'),
    ('robot', 'A small friendly robot on a checkered path heading toward a red apple', '🤖🍎'),
    ('story', 'Three steps of a story: an egg, a cracking egg, a fluffy chick', '🥚🐣🐥'),
    ('count', 'Three shiny red apples in a row with little sparkles (no numbers)', '🍎🍎🍎'),
    ('col', 'Paint splashes of red, blue, yellow and green with a paintbrush', '🔴🔵'),
    ('shp', 'A circle, a triangle and a square as soft chunky toy blocks', '⭕🔺'),
    ('ani', 'A cat and a cow looking at each other happily', '🐈🐄'),
    ('pat', 'A row of red and blue beads in a pattern with a glowing empty spot at the end', '🔴🔵🔴❓'),
    ('odd', 'Two fruits and one kitten in a row, the kitten looking surprised', '🍎🍌🐈'),
    ('memory', 'Two face-down cards and one flipped card showing a star', '⭐❓⭐'),
    ('basket', 'A woven basket with apples dropping into it', '🧺🍎'),
    ('first', 'A rabbit beside a soft speech bubble (no letters)', '🐇'),
    ('menu-arabic', 'Arabic learning for young children: a crescent-shaped bookmark in a picture book', ''),
    ('menu-english', 'English learning for young children: a picture book with an apple on the cover', ''),
    ('menu-numbers', 'Counting for young children: stacking rings in rainbow colours', ''),
    ('menu-thinking', 'Thinking games for young children: a friendly lightbulb with a puzzle piece', '🧠'),
]
for key, d, rep in KG_GAMES:
    add(f'game-{key}-card', f'assets/games/kg/game-{key}-card.webp', 4, '2d', d, rep)

DICT_TOPICS = [('fam', 'a happy family of three cartoon figures holding hands', '👨‍👩‍👧'), ('body', 'a friendly heart with a stethoscope', '🫀'),
    ('food', 'an apple, bread and a glass of milk', '🍎'), ('ani', 'a paw print with a little bird', '🐾'), ('home', 'a cosy house with a door and a window', '🏠'),
    ('sch', 'a school building with a flag pole (blank flag)', '🏫'), ('town', 'a small town with a shop and a mosque minaret', '🏙'),
    ('job', 'a doctor coat, a chef hat and a hard hat', '👩‍⚕️'), ('trans', 'a small car, a bus and a plane', '🚗'), ('nat', 'a sun, a cloud and a tree', '🌦'),
    ('time', 'a round friendly clock', '⏰'), ('sport', 'a football and a bicycle', '⚽')]
for key, d, rep in DICT_TOPICS:
    add(f'topic-{key}', f'assets/dict/topic-{key}.webp', 4, '2d', d, rep)

# ---------- phase 5: rewards ----------
BADGES = [('champion', 'a trophy'), ('streak3', 'a friendly flame'), ('stars100', 'a big star surrounded by small stars'), ('lesson', 'an open book with a check-mark shape made of light')]
for key, d in [b for b in BADGES if b[0] != 'champion']:
    add(f'badge-{key}-earned', f'assets/badges/badge-{key}-earned.webp', 5, '3d', f'A round gold medal with a soft blue and gold ribbon, {d} raised in the centre, small sparkles (no text)')
add('star', 'assets/rewards/star.webp', 5, '3d', 'A single plump golden star with a soft glow and a tiny shine, the currency of a kids game', '⭐')
add('star-burst', 'assets/rewards/star-burst.webp', 5, '3d', 'A burst of several plump golden stars flying outward with sparkles', '🌟')
add('gift-box', 'assets/rewards/gift-box.webp', 5, '3d', 'A wrapped gift box in pink and gold with a big bow, slightly bouncing', '🎁')
add('goal-flag', 'assets/rewards/goal-flag.webp', 5, '3d', 'A small flag on a pole on top of a little hill, goal reached', '🎯')
add('coupon', 'assets/rewards/coupon.webp', 5, '3d', 'A cheerful paper ticket coupon in gold and orange with a star punched in it (no text)', '🎟')
REWARDS = [('ipad', 'a tablet with a colourful game on its screen (no logos)', '📱'), ('playstation', 'a generic game controller (no logos)', '🎮'),
    ('icecream', 'an ice-cream cone with two scoops', '🍦'), ('movie', 'a movie clapperboard and a popcorn box', '🎬'), ('park', 'a park with a tree and a swing', '🏞'),
    ('story', 'a bedtime storybook with a moon', '📖'), ('boardgame', 'a board game with a die and pieces', '🎲'), ('dinner', 'a family dinner plate with a spoon and fork', '🍽'),
    ('toy', 'a small cuddly teddy bear toy', '🧸'), ('bike', 'a small bicycle', ''), ('outing', 'a picnic basket and blanket', ''), ('pizza', 'a pizza', ''),
    ('juice', 'a fruit juice cup with a straw', ''), ('sweets', 'a few wrapped sweets', ''), ('books', 'a stack of colourful books', ''), ('crafts', 'crayons and a drawing pad', ''),
    ('beach', 'a beach bucket and spade', ''), ('cinema', 'cinema tickets and popcorn (no text)', ''), ('sleepover', 'a tent with fairy lights', ''), ('cake', 'a slice of cake', ''),
    ('stayup', 'a moon and a clock showing late evening', ''), ('friend', 'two kids high-fiving', ''), ('ball', 'a football', ''), ('lego', 'colourful building bricks (generic)', ''),
    ('camera', 'a toy camera', ''), ('music', 'headphones with music notes', ''), ('plant', 'a small plant in a pot', ''), ('pet', 'a goldfish in a bowl', ''),
    ('restaurant', 'a burger meal tray', ''), ('shopping', 'a shopping bag with a star', ''), ('money', 'a piggy bank', ''), ('trip', 'a small suitcase with stickers', ''),
    ('swim', 'a swim ring', '')]
for key, d, rep in REWARDS:
    add(f'reward-{key}', f'assets/rewards/reward-{key}.webp', 5, '3d', d, rep)
for f, d in [('perfect', 'celebrate'), ('great', 'cheer'), ('good', 'encourage'), ('try', 'sad-soft')]:
    pass  # result screens reuse mascot poses: perfect=celebrate, great=cheer, good=encourage, try=sad-soft

# ---------- phase 6: game graphics ----------
GAME = [
    ('robot-idle', 'A small friendly round robot with a sky-blue body, big round eyes on a screen face and little wheels, standing still, top-down 3/4 view', '🤖'),
    ('robot-happy', 'The same small friendly robot celebrating with arms up and heart eyes', ''),
    ('apple-goal', 'A shiny red apple with a green leaf', '🍎'),
    ('rock', 'A round grey cartoon boulder with soft moss spots', '🪨'),
    ('star-pickup', 'A plump golden star with a gentle glow, game collectible', '⭐'),
    ('tile', 'A single square grass tile seen from above, soft rounded edges', ''),
    ('box', 'An open cardboard box', '📦'), ('basket', 'An empty woven basket', '🧺'), ('table', 'A small wooden kid table', ''), ('ball', 'A red and white ball', '⚽'),
    ('card-back', 'The back of a game card: purple with a gold star pattern, rounded rectangle', '❓'),
]
for key, d, rep in GAME:
    add(f'game-{key}', f'assets/games/kg/game-{key}.webp', 6, '3d', d, rep)

for f in ['manifest-core.json']:
    pass

# ---------- content pictures (separate track) ----------
JS = r"""
const fs=require('fs'),vm=require('vm');const ctx={APPS:{},APPDATA:{},UNITS:{},window:{},HS:{}};vm.createContext(ctx);
for(const f of process.argv.slice(1)){try{vm.runInContext(fs.readFileSync(f,'utf8'),ctx)}catch(e){console.error(f,e.message)}}
console.log(JSON.stringify({kg:ctx.APPDATA.kg,dict:ctx.APPDATA.dict,units:ctx.UNITS}));
"""
files = [os.path.join(ROOT, p) for p in ['src/apps/kg/data.js', 'src/apps/dict/data.js', 'src/units/g3sciearth.js', 'src/units/g4scieco.js', 'src/units/g4scihealth.js']]
data = json.loads(subprocess.run(['node', '-e', JS] + files, capture_output=True, text=True, check=True).stdout)
EMO = re.compile('[\U0001F000-\U0001FAFF☀-➿⬀-⯿←-⇿⌀-⏿]')
seen = {}
content = []
def cadd(track, emoji, label, extra=''):
    emoji = (emoji or '').replace('️', '').strip()
    if not emoji or not EMO.search(emoji): return
    if re.sub(EMO.pattern + r'|[\s‍️]', '', emoji): return      # mixed text and emoji: not a picture slot
    label = re.sub('<[^>]+>', '', label or '').strip()
    if label.startswith(('var(', '#')) or not re.sub(EMO.pattern + r'|[\s‍️?❓➡⬅←→]', '', label): label = ''   # not a name
    key = (track, emoji)
    if key in seen:
        if label and label not in seen[key]['labels']: seen[key]['labels'].append(label)
        return
    slug = re.sub(r'[^a-z0-9]+', '-', (extra or '').lower()).strip('-') or 'u' + '-'.join(f'{ord(c):x}' for c in emoji)[:40]
    e = {'id': f'{track}-{slug}', 'file': f'assets/content/{track}/{slug}.webp', 'phase': 7 if track != 'dict' else 8,
         'style': '2d', 'size': '1024x1024', 'replaces': emoji, 'labels': [label] if label else []}
    while any(x['id'] == e['id'] for x in content): e['id'] += '-2'; e['file'] = e['file'].replace('.webp', '-2.webp')
    seen[key] = e; content.append(e)

kg = data['kg']
for a in kg.get('AR', []): cadd('kg', a[3], a[2])
for a in kg.get('EN', []): cadd('kg', a[2], a[1], a[1])
for a in kg.get('ANI', []): cadd('kg', a[0], a[1], a[2])
for a in kg.get('OBJ_COL', []): cadd('kg', a[0], a[1], a[2])
def walk(o, track, ctxlabel=''):
    if isinstance(o, dict):
        lab = o.get('b') or o.get('n') or o.get('name') or o.get('title') or ''
        for k in ('em', 'e', 'icon'):
            if isinstance(o.get(k), str) and len(o[k]) <= 12: cadd(track, o[k], re.sub('<[^>]+>', '', str(lab))[:80])
        for v in o.values(): walk(v, track)
    elif isinstance(o, list):
        if len(o) >= 2 and all(isinstance(x, str) for x in o[:2]) and EMO.search(o[0] or '') and len(o[0]) <= 12:
            cadd(track, o[0], re.sub('<[^>]+>', '', o[1])[:80])
        for v in o: walk(v, track, ctxlabel)
walk(kg, 'kg')
walk(data['units'], 'sci')
raw = data['dict'].get('RAW', '')
for line in raw.split('\n'):
    p = line.split('|')
    if len(p) != 8: continue
    word, pos, em, arw, de = p[0].strip(), p[1], p[2].strip(), p[3], p[4]
    e = {'id': f'dict-{re.sub("[^a-z0-9]+", "-", word.lower()).strip("-")}', 'file': f'assets/content/dict/{re.sub("[^a-z0-9]+", "-", word.lower()).strip("-")}.webp',
         'phase': 8, 'style': '2d', 'size': '1024x1024', 'replaces': em, 'labels': [f'{word} ({arw}): {de}']}
    while any(x['id'] == e['id'] for x in content): e['id'] += '-2'; e['file'] = e['file'].replace('.webp', '-2.webp')
    content.append(e)
content = [e for e in content if e['labels'] or e['id'].startswith('dict')]   # nothing to draw from without a name
for e in content:
    what = '; '.join(e['labels'][:3]) or e['replaces']
    e['prompt'] = (f'A single clear picture that a child instantly recognises as: {what}. The current placeholder is the emoji {e["replaces"]}; '
                   f'draw the idea, not the emoji. {S2D}')
    e.pop('labels', None)

os.makedirs(OUT, exist_ok=True)
json.dump(core, open(os.path.join(OUT, 'manifest-core.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(content, open(os.path.join(OUT, 'manifest-content.json'), 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print('core', len(core), dict(Counter(e['phase'] for e in core)))
print('content', len(content), dict(Counter(e['id'].split('-')[0] for e in content)))
