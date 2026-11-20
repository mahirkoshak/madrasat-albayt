"""World atlas: every page opens without errors, Palestine is on the map (not Israel), games answer and record progress."""
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT
def check(what, ok, info=''):
    print(('ok  ' if ok else 'FAIL'), what, '' if ok else info); assert ok, what
with sync_playwright() as p:
    b = p.chromium.launch(**CHROME); pg = b.new_page(viewport={'width': 390, 'height': 844})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto(U); pg.wait_for_timeout(300); addkid(pg, 'سارة'); pg.wait_for_timeout(300)
    out = {}
    for h in ['app-atlas', 'app-atlas-map', 'app-atlas-p-gulf', 'app-atlas-p-world', 'app-atlas-p-mount', 'app-atlas-c-PSX', 'app-atlas-c-SAU',
              'app-atlas-f-v-nile', 'app-atlas-c-AS', 'app-atlas-passport', 'app-atlas-quick', 'app-atlas-g-gulf-tour', 'app-atlas-g-seas-find']:
        pg.evaluate(f"location.hash='{h}'"); pg.wait_for_timeout(900)
        out[h] = pg.locator('#app-atlas .am-svg').count()
    check('every atlas page draws a map', all(v >= 1 for v in out.values()), out)
    check('no Israel in the data', pg.evaluate("!APPDATA.atlas.countries.some(c => c.id === 'ISR' || /إسرائيل/.test(c.ar))"))
    check('Palestine with Jerusalem as capital', pg.evaluate("(c => c && c.cap.ar === 'القدس')(APPDATA.atlas.countries.find(c => c.id === 'PSX'))"))
    check('no Israel shape on the map', pg.evaluate("!document.querySelector('#app-atlas [data-id=ISR]')"))
    pg.evaluate("location.hash='app-atlas-g-gulf-name'"); pg.wait_for_timeout(1200)
    for _ in range(4):
        for i in range(pg.locator('.a-opt').count()):
            o = pg.locator('.a-opt').nth(i)
            if o.is_enabled(): o.click(); pg.wait_for_timeout(120)
            if pg.locator('#aNext').count(): break
        if pg.locator('#aNext').count(): pg.locator('#aNext').click(); pg.wait_for_timeout(400)
    check('answers are recorded', pg.evaluate("Object.keys(HS.data('atlas').srs || {}).length") >= 3)
    pg.evaluate("location.hash='app-atlas-g-gulf-find'"); pg.wait_for_timeout(1200)
    name = pg.locator('#aAsk b').inner_text()
    cid = pg.evaluate(f"APPDATA.atlas.countries.find(c => c.ar === {name!r}).id")
    lab = pg.evaluate(f"(() => {{ const c = APPDATA.atlas.countries.find(c => c.id === '{cid}'), svg = document.querySelector('#app-atlas .am-svg'), r = svg.getBoundingClientRect(), v = svg.viewBox.baseVal; return [r.left + (c.lab[0] - v.x) / v.width * r.width, r.top + (c.lab[1] - v.y) / v.height * r.height]; }})()")
    pg.mouse.click(lab[0], lab[1]); pg.wait_for_timeout(400)
    check('tapping the asked country on the map answers', pg.locator('#aNext').count() == 1, pg.locator('#aFb').inner_text())
    check('no page errors', not errs, errs)
