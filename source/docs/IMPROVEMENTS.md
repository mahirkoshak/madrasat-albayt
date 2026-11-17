# مدرسة البيت: review and improvements (November 2026)

Branch `feat/ia-games`. Everything below is implemented, built (`python3 tools/publish.py`) and checked in a real
browser (Chrome, through Playwright) at 320, 390, 768, 1024 and 1280 px. Screenshots are in `docs/screens/`.

## 1. Information architecture

### Before
```
الرئيسية (home: hero, child picker, shop card, years)
├── الروضة → عربي و English (app: own 🏠 button, own header «عالم الصغار», numbered level buttons; no addresses inside)
├── الصف الثالث → العلوم → الوحدة ٣ (unit)
├── الصف الرابع → العلوم → الأنظمة البيئية / صحة الإنسان (units)
│        unit: sections as ARIA tabs that replaced the address; games and quizzes had no address
├── قاموسي (app: own 🏠 / → رجوع / ✕ buttons; no addresses inside)
├── صفحة الأب, متجر النجوم
Three different navigation systems: menu pages (Back + non-clickable trail), app bar (Back/Home + plain trail),
and each app's own buttons. Back from a lesson went to the subject, not the unit.
```

### After
```
الرئيسية #home
├── الروضة #y-kg
│   └── عربي و English #app-kg
│       ├── نتعلّم: #app-kg-learn-<ar|en|num|col|shp|ani>
│       └── ألعاب (game layout): #app-kg-game-<15 games>
├── الصف الثالث #y-g3 → العلوم #s-g3-sci → الأرض ومواردها #unit-g3sciearth
├── الصف الرابع #y-g4 → العلوم #s-g4-sci → الأنظمة البيئية / صحة الإنسان #unit-<id>
│   unit: الرحلة · الدرس ١..ن · البطاقات · الألعاب · الاختبارات   (#unit-<id>-<section>)
│     الألعاب: 🧪 نفكّر ونجرّب (labs) · 🎮 نتدرّب (sort, order, memory) · ⚡ نتحدّى (speed)
│     each activity: #unit-<id>-play-…  /  #unit-<id>-test-…   (game layout)
├── قاموسي #app-dict → المواضيع → موضوع → كلمة; كلمات أتقنتها; تحدّي الإملاء (game layout)
├── صفحة الأب #parent (menu)   ·   متجر النجوم #shop (stars button)
```
One route model (`src/portal/nav.js`): every page knows its parent, breadcrumb, title, grade/subject/unit, counts
and whether it is a focused activity.

## 2. Navigation and breadcrumb audit (what was wrong)
- Three navigation systems with different buttons and labels (🏠, رجوع, ✕, → الألعاب).
- Breadcrumb items were plain text (not links), labelled «مكانك في الموقع», and missing inside apps.
- Back from a unit lesson went to the subject (skipping the unit).
- Unit sections used `role="tab"` while changing the page, with `replaceState`, so browser Back skipped them.
- Kindergarten and dictionary screens had no addresses: reload or Back lost the place.
- Header home button had no accessible name in one state; robot arrow buttons were announced as "l", "u", "d", "r".
- Stale titles: the tab title stayed on the previous page inside apps.

## 3. Layout issues found
- Unit section tabs were cut off on phones (horizontal strip, last tabs hidden) → now wrap to 2–3 rows, 44 px targets.
- Games showed the full unit header and tabs above the board → focused game layout (compact header, no tabs).
- The sticky header covered the top row of a puzzle after scrolling → in game layout the header scrolls away.
- `#app-kg` / `#app-dict` opened 109 px down (the browser jumped to the element with the same id) → fixed.
- Quiz title appeared twice (header and card) → the card copy is for screen readers only.
- Portal pages had no `<h1>` → page titles are `<h1>`.

## 4. Navigation decisions
- **Back = logical parent, always** (from `nav.js`), not browser history. Browser Back/Forward still work because
  every page has its own address (verified in `test_navigation.py`).
- **Breadcrumb**: every ancestor is a link, the current page is text with `aria-current="page"`, inside
  `<nav aria-label="مسار التنقل">`; arrows point the reading direction (← in Arabic, → in English); the middle
  collapses into «…» under 760 px; no breadcrumb on pages one level deep (Back is enough) or in activities.
- **Unit sections are links**, not ARIA tabs, because they change the address.
- **Header**: brand/home, sound, stars (to the shop), child menu (home, switch/add child, shop, parent page,
  «لغة الواجهة»). The KG «لغة النشاط» (questions and voice) is separate from the interface language.
- **Game layout**: compact header (Back + title), no level buttons, no breadcrumb, no unit tabs.

## 5. Files changed
New: `src/portal/nav.js`, `src/apps/unit/labs.js`, `tests/` (16 browser tests + runner + fixtures),
`docs/IMPROVEMENTS.md`, `docs/screens/`.
Changed: `build.py` (nav.js, `:root.x` scoping), `src/portal/{portal.js,portal.css,shell.html,catalog.js,i18n.js}`,
`src/core/{core.js,phrases.js}`, `src/apps/unit/{app.js,app.css,app.html}`, `src/apps/kg/{app.js,app.css,app.html,data.js,thinking.js}`,
`src/apps/dict/{app.js,app.html,spell.js}`, `src/units/_TEMPLATE.js`, `tools/{publish.py,voice_maker/template.html}`, `README.md`.
Saved data: new fields only (`learn`, `labs` per unit, per child). Nothing is renamed or removed, so no migration
is needed; existing profiles, stars and progress load unchanged (checked in `test_a11y.py`).

## 6. Games
**Improved**
- **Unit quizzes: hints before answers.** First mistake: a hint about the chosen option (its real meaning from
  the unit glossary, or an authored misconception); second: one wrong option removed + second hint; third: the
  answer with the explanation. Hints never contain the answer's words (checked for all 678 wrong-choice hints).
  Tracked per child: first-try accuracy per lesson, self-corrections, reveals, hints, chosen misconceptions.
- **Parent page:** concept table per lesson, wrong ideas chosen most, a recommended next step, lab results,
  and kindergarten difficulty per game.
- **Plan, then move (robot):** plan queue, ▶️ run, 👣 step-by-step playback, ⌫ undo, 🗑️ clear, rocks,
  numbered stars collected in order (levels 7–8), limited commands (level 8), ×2 repeat command (first loop, level 6+),
  named buttons.
- **Kindergarten:** no numbered levels for the child (a dot path instead), adaptive difficulty kept, parent can
  set the level; gender-inclusive prompts («لنضع…», «لنحاول مرة ثانية»).
- **Counts** on cards come from the data (the old cards said «٦ ألعاب» / «٨ ألعاب»; the real numbers are 7–9 and 15).

**New**
- **🌧️ مختبر التعرية (grade 3):** two-hillside experiments (slope, rain, plants), prediction required before the
  rain, SVG model with soil carried down and roots, compare, explain with hints, transfer question; a school-garden
  problem where a wrong fix visibly makes erosion worse; a free lab (change one thing at a time).
- **🔎 محقّق العدوى (grade 4 health):** five fictional cases; a register of sick and healthy children; the child
  finds the one thing all sick children share (a wrong column gets a real counter-example from the register),
  names the route of infection and chooses how to stop it. The last case is diabetes: nobody gets sick, which
  corrects the idea that it spreads by shaking hands.
- **Kindergarten:** غيّر القاعدة (card sorting with a rule switch, 5 levels, 120 configurations), ورشة القصة
  (hero, place, problem and a fix that must solve it), نبني ما نحب (free build).
- **🕸️ صدمة الشبكة الغذائية (grade 4):** food web built only from the unit's chains; four stories (drought,
  pesticide, fewer snakes, fewer hawks); predict two organisms (one two steps away), watch step 1 and step 2, explain.

## 7. For educator review
Marked `review: true` in `src/apps/unit/labs.js`.
1. Erosion Lab: slope, amount of rain and plant cover are **not in the unit's lesson text** (it covers what
   weathering/erosion/deposition are and their agents). The lab's model and explanations add them; the numbers are
   a comparison model, not measurements (stated on screen).
2. Erosion Lab, garden: "plants reduce erosion" as the right fix, and the wording of the three fixes.
3. Food-Web Shock: the rabbit ← grass link (the unit says rabbits are herbivores, not what they eat) and the
   two-step population rule (simplified; on screen: "in nature animals can switch to other food").
4. Misconception texts written for the lab distractors.
5. Unit quizzes: about 60% of hints are generic («فكّر مرة ثانية…»), because most questions have no authored
   hint and the options are not glossary terms. Authoring `hint1/hint2/mis` per question (see `_TEMPLATE.js`) is the
   biggest remaining content task.
6. The parent page is titled «صفحة الأب»; consider «صفحة ولي الأمر» or «صفحة الوالدين».

## 8. Accessibility (WCAG 2.2 AA work)
Fixed: names on every button (0 unnamed), robot arrows named (يسار/فوق/تحت/يمين), breadcrumb landmark and
`aria-current`, one `<h1>` per page, focus moves to the next option after a hint, hints in `role="status"`,
quiz feedback `aria-live`, lab steps with `aria-current="step"`, SVG diagrams with text descriptions, 44 px targets
(0 small targets on menu pages), reduced motion respected (labs, robot, menus), visible focus outline on every
stop in the header, no horizontal scrolling at 320–1280 px.
Limitations: drag-and-drop games also work by tap-then-tap and keyboard (Enter), but the board games
(puzzle, shape building) are hard with a screen reader; emoji are still used as pictures in KG and in sorting
games; contrast was checked on the new parts only; new strings (hints, labs, parent summary) stay Arabic in the
English interface.

## 9. Test results
`python3 tests/run_all.py`: **16 of 16 test files pass** (navigation and parents for 22 routes, focus mode, no
stale titles, header Back, browser Back/Forward, deep-link reload, counts vs. pages, quiz hints and tracking,
hints never reveal (678 hints), labs end-to-end and saved progress, robot plan/step/×2/ordered stars/limit,
all 5 KG thinking games at every level, dictionary, shop, sync, per-child isolation, 5 widths, keyboard order,
reduced motion, no console errors).
Manual: checked with screenshots at 320/390/1280; mute; guest mode; English interface. Not tested on a real
iPad (touch drag was tested with mouse events only).

## 10. Build and deploy
```
cd source
python3 tools/publish.py          # build + copy index.html, assets/, voice-maker.html to the repo root
python3 tests/run_all.py          # optional: all browser tests
git push                          # GitHub Pages serves the repo root of main
```
Voices: 88 kindergarten sentences changed wording (inclusive Arabic, new robot prompts) and have no natural clip yet;
they use the device voice until recorded. Open `voice-maker.html` (it now records only the missing sentences by default),
then `python3 tools/import_voices.py madrasat-voices.zip` and publish.

## 11. Screenshots
`docs/screens/`: before/after `home.png`, `subject.png`, `unit-lesson.png`, `unit-game.png`, `kg.png`;
new: `quiz-hint.png`, `robot-plan.png`, `erosion-lab.png`, `food-web-lab.png`.

## 12. Backlog (in priority order)
Done since the first version of this report (17 Nov 2026): written hints for all 128 quiz choice questions
(`src/apps/unit/hints-<unit>.js`), Outbreak Detective (grade 4 health, 5 fictional cases), and in kindergarten
Change the Rule, Story Workshop, free build, and a second correct solution in shape building (two triangles = a rectangle).
1. Record the 68 new kindergarten sentences with the voice maker (it lists only the new ones).
2. A teacher reviews the written hints and the three labs (`review: true`).
3. English translations for the new strings (hints, labs, parent summary).
4. Transfer questions as scored items (now they are prompts), and "concepts mastered" based on transfer.
5. Puzzle rotation at the top levels only.
6. Replace emoji used as scientific pictures in the sorting games with drawn illustrations.
7. Real-device testing on iPad and a phone; a full contrast audit.
