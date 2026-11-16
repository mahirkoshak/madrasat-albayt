# Instructions for Codex: generate the artwork for مدرسة البيت

You are generating original artwork for a children's learning website. You only create image files.
Do not change any website code: Claude wires the images into the site afterwards.

## Files
- `art-source/STYLE.md`: the style guide. Read it first and follow it for every image.
- `art-source/manifest-core.json`: interface art, mascot, avatars, navigation, rewards and game graphics (154 images, phases 1–6).
- `art-source/manifest-content.json`: one picture per learning item (phase 7: KG and science, about 290; phase 8: dictionary words, 1,143).

Each manifest entry has `id`, `phase`, `size` and `prompt`.

## How to generate
1. Use the `$imagegen` skill with **gpt-image-2**, high quality, at the entry's `size`.
   Send the entry's `prompt` as written. You may add detail, but never remove the background rule or the "no text" rule.
2. Make the background **transparent** (generate on flat green #00FF00, then remove it, as you did for phase 1).
   The finished PNG must have a fully see-through background, clean edges and no green fringe.
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
- Phases 7–8: content pictures. Only start these when the owner asks.
  You can do them in batches of about 50, pushing after each batch.

To generate a single phase, filter the manifest by `phase`.
