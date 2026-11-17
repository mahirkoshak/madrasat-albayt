from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':1024,'height':800})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(U);pg.wait_for_timeout(300)
    for h in ['y-kg','s-g4-sci','s-g3-sci']:
        pg.evaluate(f"HS.nav.go('{h}')");pg.wait_for_timeout(200)
        print(h, pg.locator('#pView .p-card small').all_inner_texts()[:3])
    for u in ['g4scieco','g4scihealth','g3sciearth']:
        pg.evaluate(f"HS.nav.go('unit-{u}-play')");pg.wait_for_timeout(250)
        print(u,'play buttons',pg.locator('#app-unit .game-pick .gp').count(),'count()',pg.evaluate(f"HS.nav.count({{unit:'{u}'}}).games"))
    pg.evaluate("HS.nav.go('app-kg')");pg.wait_for_timeout(200)
    print('kg games visible',pg.locator('#app-kg [data-game]').count(),pg.evaluate("APPS.kg.counts()"))
    print(errs); assert not errs
