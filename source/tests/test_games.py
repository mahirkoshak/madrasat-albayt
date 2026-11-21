"""#games: the page that lists every game of every unit, grade and app"""
import sys; sys.path.insert(0, '.')
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME
bad = []
def check(what, ok, info=''):
    print(('ok  ' if ok else 'FAIL'), what, info)
    if not ok: bad.append(what)
with sync_playwright() as p:
    b = p.chromium.launch(**CHROME); pg = b.new_page(viewport={'width': 390, 'height': 844})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(U); pg.wait_for_timeout(300); addkid(pg, 'سارة'); pg.wait_for_timeout(500)
    pg.evaluate("location.hash='games'"); pg.wait_for_timeout(1200)
    check('opens on the child\'s grade', pg.locator('.p-gchip.on').inner_text().find('صفّي') >= 0)
    check('grade games listed', pg.locator('.p-game').count() > 20, pg.locator('.p-game').count())
    check('no sideways scrolling', pg.evaluate('document.documentElement.scrollWidth <= innerWidth'))
    for f, n in [('kg', 20), ('extra', 20), ('all', 200)]:
        pg.evaluate(f"location.hash='games-{f}'"); pg.wait_for_timeout(1000)
        check(f'filter {f}', pg.locator('.p-game').count() >= n, pg.locator('.p-game').count())
    pg.evaluate("location.hash='games'"); pg.wait_for_timeout(800)
    pg.locator('.p-game').first.click(); pg.wait_for_timeout(1200)
    check('a tile opens its game', pg.evaluate("location.hash").startswith('#unit-'), pg.evaluate("location.hash"))
    pg.evaluate("location.hash='games-kg'"); pg.wait_for_timeout(800); pg.locator('#pLuck').click(); pg.wait_for_timeout(1200)
    check('surprise game opens a kindergarten game', pg.evaluate("location.hash").startswith('#app-kg-game-'), pg.evaluate("location.hash"))
    check('no page errors', not errs, errs)
    b.close()
sys.exit(1 if bad else 0)
