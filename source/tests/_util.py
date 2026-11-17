"""Shared settings for the browser tests (Python + Playwright).
SITE: the built page (default ../dist/index.html: run `python3 build.py` first).
CHROME: set CHROME=/path/to/chrome to use an installed Chrome instead of Playwright's Chromium.
OUT: where screenshots go (default /tmp/madrasat-shots)."""
import os, pathlib
HERE = pathlib.Path(__file__).resolve().parent
SITE = pathlib.Path(os.environ.get('SITE', HERE.parent / 'dist' / 'index.html')).resolve()
U = SITE.as_uri()
VOICE_MAKER = (HERE.parent.parent / 'voice-maker.html').as_uri()
_c = os.environ.get('CHROME') or ('/usr/bin/google-chrome' if os.path.exists('/usr/bin/google-chrome') else None)
CHROME = {'executable_path': _c} if _c else {}
OUT = os.environ.get('OUT', '/tmp/madrasat-shots'); os.makedirs(OUT, exist_ok=True)
FIX = HERE / 'fixtures'
