# مدرسة البيت · Home School

A learning site for kids (Arabic / English). It builds into **one file**, `dist/index.html`, which you can open in any browser, host anywhere, or send to someone.

- **Grade 4 units:** Each unit has lessons, flashcards, quizzes with 6 question types, a daily spaced review, and games (drag-to-sort, ordering, memory, speed round).
- **Kindergarten:** Spoken learn cards and 15 voice-led games that adapt to the child's level (no level numbers for the child; a parent can set a game's difficulty on the parent page).
- **Thinking labs:** «نفكّر ونجرّب» simulations where the child predicts, runs, compares and explains (Erosion Lab, grade 3; Food-Web Shock, grade 4).
- **Per child:** Each child has their own profile with stars, progress and mistakes. A **parent page** shows mastery, weak spots and voice settings.

```
madrasat-albayt/
├── build.py                    ← run after any change
├── dist/index.html             ← GENERATED single-file site (don't edit)
├── tools/
│   ├── make_audio.py           ← optional: make natural AI voice clips (SILMA TTS)
│   ├── speech_list.js          ← lists every sentence the site speaks
│   └── voices/                 ← reference voices for make_audio.py
└── src/
    ├── portal/                 ← main menu, child picker, parent page
    │   ├── catalog.js          ← THE MENU: years → subjects → units   ← edit to add items
    │   ├── theme.css           ← THE LOOK: colors, font, corners      ← edit to restyle
    │   ├── portal.js / portal.css / shell.html
    ├── core/                   ← shared by everything
    │   ├── core.js             ← profiles, saving, spaced repetition, speech, sounds, drag & drop
    │   ├── core.css, phrases.js
    ├── units/                  ← ONE FILE PER SCHOOL UNIT (content only)
    │   ├── _TEMPLATE.js        ← copy this to start a new unit (every field explained)
    │   └── g4scieco.js         ← Grade 4 Science: Ecosystems
    │   └── g4scihealth.js      ← Grade 4 Science: Human health (diseases, infection, health, nutrition)
    ├── apps/
    │   ├── unit/               ← the unit engine that draws any file in src/units/
    │   ├── dict/               ← kids' English dictionary (data.js = the word list, one line per word)
    │   └── kg/                 ← kindergarten app (data.js = words & questions; thinking.js = the 5 «نفكّر» games)
    └── audio/                  ← created by make_audio.py (clips + manifest.json)
```

## Build
```bash
python3 build.py          # Python 3 only, no packages
```
The build warns if the menu points to a unit or app that doesn't exist.

## Common tasks
| I want to… | Do this |
|---|---|
| **Add a new unit** (e.g. Science: Cells) | Copy `src/units/_TEMPLATE.js` to `src/units/g4scicells.js`, fill it in, add `{ …, unit: 'g4scicells' }` to `catalog.js`, then build. No code needed. |
| Fix or add a question, flashcard or game item | Edit that unit's file in `src/units/` |
| Kindergarten words and pictures | `src/apps/kg/data.js` |
| Add a subject or year, or mark "coming soon" | `src/portal/catalog.js` (`soon: true`) |
| Change colors, font or roundness everywhere | `src/portal/theme.css` |
| Better voices | See **Voice** below |

**Question ids are permanent.** Progress is saved per question id, so never renumber or reuse an id. To remove a question, delete it. To change a question, keep its id if the meaning is the same.

## Why it works this way (learning design)
The design follows well-established learning research:

- **Retrieval practice.** Kids answer questions and play recall games instead of only re-reading. Recalling from memory is one of the strongest ways to make learning stick.
- **Spaced repetition.** Each question sits in a "box". A wrong answer goes back to box 0 and comes back today. A right answer moves it up, and it comes back after 1, 2, 4, 8, then 16 days. **«مراجعة اليوم»** (today's review) shows exactly what is due. This is the Leitner system; Duolingo uses a more advanced version of the same idea.
- **Interleaving.** The full test and the daily review mix all lessons. Mixed practice is harder in the moment but sticks better than doing one topic at a time.
- **Explained feedback, right away.** After every answer the child sees the correct answer and a one-line *why*. This works much better than only saying "right/wrong", and immediate feedback prevents children from remembering wrong options. Missed questions are asked once more at the end of the quiz.
- **Rewards follow mastery.** Badges come from 80%+ lesson mastery, not from clicking. Stars and streaks give feedback; there are no leaderboards, because shallow points-and-leaderboards can undermine motivation.
- **Kindergarten design.**
  - Everything is spoken, and buttons are big.
  - **Tap-then-tap always works alongside drag**, since dragging is hard for under-5s.
  - A wrong tap never ends a question.
  - Levels go **up after a strong round (≥80%) and down after a weak one (<50%)**, keeping her around 80% success.
- **«نفكّر» thinking games (KG).** Five games with **levels that follow published learning paths** (8 levels for the jigsaw and the robot, 5 for the others), and auto-levelling like the other games. A shuffle bag means a puzzle never repeats straight away:
  - 🧩 **Jigsaw**: 4 → 6 → 9 pieces with a faint picture guide, then 9 → 12 → 16 pieces with no guide, then 16 and 25 pieces with decoy pieces from another picture mixed in. A wrong piece gets a spatial hint ("near the top"); plain background pieces in the same row fit either spot.
  - 🔺 **Build with shapes**: coloured guide → outlines only → one grey silhouette with no inner lines. This follows Clements & Sarama's shape-composition trajectory (picture maker → shape composer); spatial skill at this age predicts later maths.
  - 🧭 **Where does it go?** in / on / under → next to → behind / in front of → between → pick the right picture (comprehension before production). Left/right is left out on purpose: children usually get it at 5–7.
  - 🤖 **Guide the robot**: each arrow moves at once (level 1) → plan a straight path and press ▶️ → one turn → rocks in the way → collect a star first → 6×6 board where rocks force a detour → two stars → two stars with only as many arrows as the shortest path. This is the Bee-Bot progression used in early-years coding, extended with planning and efficiency.
  - 📖 **Story order**: 3 pictures with the first one placed → 3 → 4 → 5 → "what happens next?". After each story the app retells it, which builds narrative language.
- **Screen time.** WHO advises at most 1 hour a day for ages 2–4. After 15 minutes of KG play a day (changeable on the parent page) a «وقت الاستراحة» break screen appears; a parent can press and hold to continue for 10 more minutes. The parent page also has short co-play tips, because playing *with* an adult is what makes screen time count.
- **Stars shop (🛒).** A home "token economy", built on the research about what makes these work:
  - **Menu of small, medium and large rewards**, cheapest first. The first reward should take a day or two at most: the parent page shows "≈ N days" for each child under every reward, from that child's recent stars per day.
  - **Savings goal 🎯.** A child picks one reward; a big progress bar shows on the home page and in the shop (the goal-gradient effect: effort rises as a goal gets close).
  - **Quick hand-over.** Buying makes a coupon «ينتظر»; the number of waiting coupons shows on the parent-page button, because rewards lose their effect the longer they are delayed.
  - **Stars are never taken away.** The parent can only give stars back (refund) or give **🎁 surprise stars** with a short message. Unexpected rewards don't lower a child's interest the way promised rewards can (Lepper, Greene & Nisbett 1973; Deci, Koestner & Ryan 1999).
  - **Weekly limits** (e.g. iPad 3 times a week). A University of Guelph study found that children whose parents use screen time as a reward spend more time on screens, so the default menu leans on time together and experiences.
  - **Per-child rewards** («لمن»), since KG and grade 4 earn at different speeds, and **children can suggest rewards** (💡), which the parent can add with one tap.
  - Tapping a reward reads its name and price aloud, for children who can't read yet. An optional PIN protects the parent page.
- **📖 قاموسي (kids' dictionary, English ⇄ Arabic).** A card of its own next to the school years on the home page. 1,143 words (CEFR A1–A2, the level Saudi primary English aims at), each with a picture, part of speech, Arabic meaning, a *student-friendly* English definition and an example sentence (Beck & McKeown: explain words in everyday language and show them in use). Search works in English or Arabic (diacritics and أ/ا, ة/ه, ى/ي are ignored). Browse by topic or by letter, and filter by difficulty (all / easy / medium / hard); a word of the day; and «كلماتي» (my words).
  - **Practice = retrieval with immediate correction**, which beats copying or "rainbow writing" for spelling (Jones et al. 2016; da Silva et al. 2023). Each word climbs Leitner boxes over days: meaning → pick the right spelling → build it from letter tiles → write it from memory. A wrong spelling shows the correct word with the wrong letters in red, and the word comes back at the end of the session.
  - The definition shown while spelling hides the word itself, so it can't be copied. The 🔊 buttons use the device's English voice (pronunciation only).
  - **Two directions** (switch on the dictionary's home page): *Learn English* (meanings in Arabic) or *أتعلّم العربي* (meanings in English, for children who know English better). The Arabic side spells the first Arabic meaning (before any "/", without notes in brackets); harakat are ignored when checking, but hamza forms, ة/ه and ى/ي count, and wrong-choice spellings use the letters children really confuse. Each direction keeps its own progress (namespaces `dict` and `dictar`); «كلماتي» is shared.
  - **🎲 random word**: on the word-of-the-day card and on every word page; it prefers words the child hasn't learned yet.
  - To add words: one line in `src/apps/dict/data.js` (8 parts separated by `|`).
- **Multiple-choice quality.** One clearly best answer. Wrong options are real misconceptions. Options have similar length, with no "all/none of the above". The template repeats these rules.

## Voice
1. **Default:** the device's own voice, with no setup needed. On Windows, **Microsoft Edge** has natural Arabic voices. On Apple devices, download the "Majed (Enhanced)" voice. The parent page lets you choose the voice.
2. **Best:** natural AI voice clips, generated once and embedded in the HTML.
   - The site plays a clip when one exists and falls back to the device voice otherwise.
   - The engine is [SILMA TTS](https://huggingface.co/harfby/silma-tts), open source (Apache-2.0, commercial use OK), Arabic and English in one model.
   - Easiest: open **`tools/AI_Voices_Colab.ipynb`** in [Google Colab](https://colab.research.google.com) (File ← Upload notebook) and follow the steps. It is free, uses a GPU, and needs no setup.
   - The same steps by hand:
     ```
     !apt-get -qq install -y ffmpeg nodejs
     !pip -q install silma-tts
     # upload this project folder, then:
     %cd madrasat-albayt
     # put a 5–8 s clean voice sample at tools/voices/ar.wav and tools/voices/en.wav
     !python tools/make_audio.py --dry-run      # shows how many sentences need clips
     !python tools/make_audio.py
     !python build.py
     ```
   - After adding a unit, run it again. It only generates the new sentences.
   - School units (grades 3–4) have 🔊 buttons for each part of a lesson's explanation, the main idea, «احفظ هذا», each question, the
     explanation after an answer and each flashcard. The text each button reads is built in `src/core/unitsay.js` (shared with
     `tools/speech_list.js`), and a button only appears once its sentence has a recorded clip (no device voice in the units).
     The voice maker lists unit sentences by importance: explanations first, then answer explanations, questions, flashcards.
   - Size: about 550 sentences ≈ 4 MB added to the HTML.
   - The reference voice is copied, so you can record a parent's voice for the kids.

## URLs (deep links)
| Link | Opens |
|---|---|
| `#home` | Main page |
| `#parent` | Parent page |
| `#y-g4` | A year |
| `#s-g4-sci` | A subject |
| `#unit-g4scieco` | A unit |
| `#unit-g4scieco-test` | A unit page: `home`, `l1`, `cards`, `play` or `test` |
| `#app-kg` | The kindergarten app |

## For developers
- **CSS:** Each app's CSS is auto-scoped to `#app-<id>`. JS runs in its own scope with `ROOT` = the app container. Register an app as `APPS.<id> = { open(sub), close() }`.
- **IDs and keyframes:** Element ids and `@keyframes` names must be unique across apps.
- **Shared helpers:** `HS.*` in `core.js` (all documented there):
  - `HS.data(ns)`: per-child storage
  - `HS.srs`: spaced repetition
  - `HS.speak([[text, 'ar']])`
  - `HS.dnd`: drag or tap-tap
  - `HS.fx` / `HS.toast` / `HS.party`
  - `HS.addStars`
- **Spoken text:** Any new spoken sentence should appear in `tools/speech_list.js` output, so clips can be generated for it. Units are covered automatically. Apps expose `APPDATA.<id>.speakables()`.
- **Saving:** Progress is saved in the browser (localStorage) on that device only.

## Online sync (Firebase)
- `src/core/firebase-config.js` — the project's web config (not secret; the 12-letter family code is the key).
- `src/core/sync.js` — profiles, stars, shop, progress sync across devices. Each save goes through a Firestore
  transaction that merges with what's online (stars add up, lists combine, newest answer wins), so two iPads
  never overwrite each other. Sound/voice settings stay per device.
- Parent page → «المزامنة»: create family code on one device, then «انضم بكود العائلة» or open the join link on others.
- Hosting: GitHub Pages (`mahirkoshak.github.io/madrasat-albayt`). Update = rebuild + push `dist/index.html` as `index.html`.

## Artwork and publishing
- Approved artwork lives in `../art-source/raw/<id>.png` (ids from `art-source/manifest-core.json`). Never edit it here.
- `python3 tools/art_process.py` makes the site's pictures in `dist/assets/` (WebP; `-sm` 192px copies; `-face` head-and-shoulders
  copies for avatar circles; home-screen icons) and the registry `dist/assets/art.json`. It removes leftover green edges only.
- `build.py` turns the registry into `window.HS_ART`. Code asks for pictures by id through `HS.art(id, {fb: '🧩'})`,
  `HS.mascot(pose)`, `HS.avatar(profile)`, `HS.rewardArt(reward)` or `data-art="id"` in markup; when a picture does not exist yet,
  the old emoji stays. Menu items take `art: '<id>'` in `catalog.js`. A new picture appears after: add PNG → publish.
- Profiles still store `avatar` as one string: old emoji, or a picture id like `avatar-fox`. No data migration.
- **Picture inventory: `docs/PICTURES.md`** (and `docs/pictures.json`): every existing picture with id, emoji, Arabic/English name,
  what is drawn and where it is already used. Rebuilt by `tools/make_inventory.py` on every publish. Check it before planning a new
  game, quiz or unit, or before asking Codex for new art.
- `python3 tools/publish.py` = process art + build + copy `index.html` and `assets/` to the repository root (GitHub Pages).

## Spelling challenge, English menus, mute
- Dictionary → «✍️ تحدّي الإملاء» (`src/apps/dict/spell.js`): endless, one word after another. Hear/see the word, type it into
  letter boxes, instant letter-by-letter feedback; after a miss the word is shown, hidden, and written again from memory
  (cover-copy-compare); missed words come back 3 words later. Right first time without a hint = "done": it moves to the
  ✓ list and stops coming up (↩️ puts it back). Saved per child in `HS.data('spell')`; shown on the parent page.
- English interface: the «English / عربي» button in the top bar (this device only). `src/portal/i18n.js` holds the English
  phrases for the menu pages, top bar, toasts and pop-ups; lessons stay Arabic (Saudi book). Add a missing phrase there.
- Mute: the speaker button in every top bar silences speech and sound effects on this device (`HS.setMute`).
- Colours: the main action colour is `--t-primary` (blue); green is used only for "correct".

## Natural Arabic voices (Azure)
- Why: Arabic lines without a recorded clip used the device voice (robotic on iPad), and the old SILMA clips were thin.
- `voice-maker.html` (made by `tools/publish.py` from `tools/voice_maker/template.html` + `tools/speech_list.js`): the parent
  pastes a free Azure Speech key (stays in their browser), previews Saudi voices (Zariyah / Hamed), records every sentence and
  downloads `madrasat-voices.zip`. Free tier = 500,000 characters/month; the whole site is ~16,000.
- `python3 tools/import_voices.py madrasat-voices.zip` then `python3 tools/publish.py`.
- Clips are now separate files in `assets/audio/` (the page went from 4.5 MB to ~0.6 MB).


## Navigation (one system for every page)
Every page has an address, so reload and browser Back/Forward keep your place:

| Address | Page |
|---|---|
| `#home`, `#parent`, `#shop` | home, parent page, star shop |
| `#y-<grade>` · `#s-<grade>-<subject>` | a year · a subject (from `catalog.js`) |
| `#unit-<unit>` · `-<lesson id>` · `-cards` · `-play` · `-test` | unit sections |
| `#unit-<unit>-play-s-<id>` · `-o-<id>` · `-memory` · `-speed` · `-lab-<id>` · `-test-final` · `-test-<lesson>` | one activity (game layout) |
| `#app-kg` · `-learn-<id>` · `-game-<id>` | kindergarten |
| `#app-dict` · `-topics` · `-t-<topic>` · `-w-<word id>` · `-spell` … | dictionary |

`src/portal/nav.js` (HS.nav) turns an address into its chain of pages (from `catalog.js` + each app's `nav(sub)`),
which the header uses for the **Back** button (always the logical parent, never browser history), the breadcrumb,
and the tab title. Activities are marked `focus: true`: the header becomes compact and the breadcrumb is hidden.
Counts on menu cards (lessons, terms, games, questions) are computed from the data by `HS.nav.desc`.

## Thinking labs
`src/apps/unit/labs.js` registers labs per unit (`LABS[unitId][labId]`). Each challenge stores
id, learningObjective, cognitiveSkill, prompt, correctAnswer, distractors, misconceptions (one per distractor),
hint1, hint2, explanation, transferPrompt, difficulty, curriculumReference and `review: true` when a teacher should
check it. Results per child are on the parent page.

## Tests
```bash
pip install playwright && playwright install chromium   # once
python3 build.py && python3 tests/run_all.py             # all browser tests (about 9 minutes)
python3 tests/run_all.py test_navigation.py              # one test
```
`CHROME=/path/to/chrome` uses an installed Chrome; screenshots go to `/tmp/madrasat-shots`.

## Publish (GitHub Pages)
```bash
python3 tools/publish.py   # art + build + voice-maker page, copies index.html and assets/ to the repo root
```
Then commit and push to `main`; GitHub Pages serves the repo root. The voice maker page records natural voices;
by default it records only the sentences that have no clip yet. Add the downloaded zip with
`python3 tools/import_voices.py madrasat-voices.zip`, then publish again.

See `docs/IMPROVEMENTS.md` for the November 2026 review: information architecture, decisions, educator-review list and backlog.
