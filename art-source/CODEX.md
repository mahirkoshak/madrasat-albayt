# Instructions for Codex: generate the artwork for مدرسة البيت

You are generating original artwork for a children's learning website. You only create image files.
Do not change any website code: Claude wires the images into the site afterwards.

## Files
- `art-source/STYLE.md`: the style guide. Read it first and follow it for every image.
- `art-source/manifest-core.json`: interface art, mascot, avatars, navigation, rewards and game graphics (154 images, phases 1–6).
- `art-source/manifest-sheets.json`: **the content pictures, drawn as sprite sheets** (phases 7–11, 109 sheets, 1,435 small pictures).
  Each sheet is one 1024×1024 image holding a grid of separate small pictures (4×4, or 3×3 for detailed science pictures).
  Claude's tools cut each sheet into one picture per cell, so draw the sheet only, never the single pictures.
- `art-source/manifest-content.json`: the old one-picture-per-item list for the same content. **Do not generate from it**:
  it is kept only because the sheets use its ids and file names.

Each manifest entry has `id`, `phase`, `size` and `prompt`.

## How to generate
1. Use the `$imagegen` skill with **gpt-image-2**, high quality, at the entry's `size`.
   Send the entry's `prompt` as written. You may add detail, but never remove the background rule or the "no text" rule.
2. Make the background **transparent**: ask the image model for a transparent background directly (PNG with alpha).
   No green screen is needed any more. The finished PNG must have a fully see-through background and clean edges.
   Save every result as **`art-source/raw/<id>.png`**, for example `art-source/raw/mascot-welcome.png`.
   Use exactly the manifest `id` as the file name. Do not resize, crop or convert anything.
3. Keep the set consistent by passing reference images:
   - Every `mascot-*` image after `mascot-sheet`: use `art-source/raw/mascot-sheet.png` as the reference.
   - Every `avatar-<name>-happy`: use `art-source/raw/avatar-<name>.png` as the reference.
   - `game-robot-happy`: use `art-source/raw/game-robot-idle.png` as the reference.
   - After phase 1 is approved, include one or two approved phase-1 images as a style reference for every later image.
4. Check each image before moving on. Regenerate it if it has any of these problems:
   - text or letters;
   - any background left over, or a green fringe on the edges;
   - green #00FF00 inside the subject;
   - a cropped subject;
   - a style that does not match STYLE.md;
   - a likeness of a known character or brand.
5. After each phase, commit with the message `art: phase N` and push to `main` (not a separate branch).

## Order
- **Phase 1 (style test): done and approved.**
- Phases 2–6: core artwork, one phase at a time, pushing after each.
- **Phases 7–11: content sprite sheets** (`manifest-sheets.json`), one phase at a time, pushing after each:
  - **Phase 7: one test sheet (`sheet-math-count`). Stop after it and wait for approval** of the style and the layout.
  - Phase 8: the other maths sheets (3) · Phase 9: kindergarten (6) · Phase 10: science (22) · Phase 11: dictionary (77,
    push after every 20 sheets or so).

## Sprite sheets (phases 7–11)
- Save each sheet as `art-source/raw/<sheet id>.png`, for example `art-source/raw/sheet-math-count.png`, at 1024×1024.
- Draw exactly the pictures listed in the prompt, **in the listed order** (left to right, top row first), one per cell.
  The order is how the tools know which picture is which: a swapped or missing picture ends up on the wrong word.
- Leave clear empty space between pictures: they must not touch, overlap or cross into the next cell.
  Cells after the last listed picture stay empty.
- No grid lines, frames, cards, labels or numbers on the sheet.
- For the maths sheets, draw **one** object per cell (the site makes the groups and counts itself), except where the prompt
  asks for a pair or a set (socks, an egg carton, a ten-rod).
- Check every sheet before pushing: the right picture in every cell, nothing touching, no text. Redo the whole sheet if a
  picture is wrong or missing. Use an approved sheet as the style reference for the next ones.

To generate a single phase, filter the manifest by `phase`.
