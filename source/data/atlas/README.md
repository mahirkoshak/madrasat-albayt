# Atlas data (inputs for tools/make_atlas.py)

- `ne/`: Natural Earth (naturalearthdata.com), public domain. Countries at 1:50m, physical layers at 1:110m.
  The map uses Natural Earth's Saudi point of view (`ADM0_A3_SA`): Palestine in place of Israel, the Golan Heights in Syria,
  Western Sahara in Morocco, Somaliland in Somalia, Northern Cyprus in Cyprus, Crimea in Ukraine.
- `flags/`: country flags from lipis/flag-icons (MIT licence, see `flags/LICENSE`). There is no Israeli flag.

Run `python3 tools/make_atlas.py` (publish.py does it) to rebuild `src/apps/atlas/data.js`, `dist/assets/atlas/world.js` and `dist/assets/flags/`.
