# Erosion Lab + Food-Web Shock: predict gate, run, compare, why-with-hints, progress saved, model checks
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(300);addkid(pg,'محمد');pg.wait_for_timeout(200)
    # model: food-web spread
    print('drought',pg.evaluate("APPS.unit.labs().g4scieco.web.spread('grass',-1)"))
    print('snake',pg.evaluate("APPS.unit.labs().g4scieco.web.spread('snake',-1)"))
    print('hawk',pg.evaluate("APPS.unit.labs().g4scieco.web.spread('hawk',-1)"))
    # games page lists the lab; route from the button
    pg.evaluate("HS.nav.go('unit-g3sciearth-play')");pg.wait_for_timeout(300)
    print('groups',pg.locator('#app-unit .gp-h').all_inner_texts())
    pg.click('#app-unit [data-act=lab]');pg.wait_for_timeout(300)
    print('hash',pg.evaluate('location.hash'),'| crumbs/title',pg.locator('#appbar .gb-title').inner_text())
    pg.screenshot(path=OUT+'/lab0.png',full_page=True)
    pg.click('#labGo');pg.wait_for_timeout(300)
    print('run disabled before prediction:',pg.locator('#labRun').is_disabled())
    pg.click('[data-pr=A]')   # wrong prediction (B is steeper)
    pg.click('#labRun');pg.wait_for_timeout(3400)
    print('compare:',pg.locator('.lab-cmp').inner_text())
    pg.screenshot(path=OUT+'/lab1.png',full_page=True)
    # why: pick a wrong option first -> misconception hint, not the answer
    opts=pg.locator('.lab-why .opt'); right=pg.evaluate("APPS.unit.labs().g3sciearth.erosion.challenges[0].correctAnswer")
    for i in range(opts.count()):
        if right not in opts.nth(i).inner_text(): opts.nth(i).click();break
    pg.wait_for_timeout(200)
    print('hint:',pg.locator('.lab-why .coach').inner_text(),'| answer shown:',pg.locator('.lab-why .opt.ok').count())
    for i in range(opts.count()):
        if right in opts.nth(i).inner_text(): opts.nth(i).click();break
    pg.wait_for_timeout(300); print('why fb:',pg.locator('.lab-why .fb b').first.inner_text())
    pg.screenshot(path=OUT+'/lab2.png',full_page=True)
    pg.click('.lab-next .btn');pg.wait_for_timeout(300);print('next:',pg.locator('.lab h2').first.inner_text()[:60])
    # garden fix: wrong fix first -> evidence says try again
    for c in range(2):
        pg.locator('[data-pr=B]').click();pg.click('#labRun');pg.wait_for_timeout(3300)
        o=pg.locator('.lab-why .opt');r=pg.evaluate(f"APPS.unit.labs().g3sciearth.erosion.challenges[{c+1}].correctAnswer")
        for i in range(o.count()):
            if r in o.nth(i).inner_text(): o.nth(i).click();break
        if c==1:
            pass
        pg.wait_for_timeout(200);pg.click('.lab-next .btn');pg.wait_for_timeout(300)
    print('garden:',pg.locator('.lab h2').first.inner_text()[:50])
    pg.click('[data-fx="2"]');pg.click('#labRun');pg.wait_for_timeout(3300);print('wrong fix ->',pg.locator('.lab-cmp').inner_text())
    pg.click('[data-fx="0"]');pg.click('#labRun');pg.wait_for_timeout(3300);print('right fix ->',pg.locator('.lab-cmp').inner_text())
    pg.screenshot(path=OUT+'/lab3.png',full_page=True)
    print('rec',pg.evaluate("HS.data('u:g3sciearth').labs||HS.data('g3sciearth').labs"))
    # reload keeps the place (deep link)
    pg.reload();pg.wait_for_timeout(500);print('after reload:',pg.evaluate('location.hash'),pg.locator('.lab h2').first.inner_text()[:30])
    # food web
    pg.evaluate("HS.nav.go('unit-g4scieco-play-lab-web')");pg.wait_for_timeout(300);pg.click('#labGo');pg.wait_for_timeout(200)
    pg.locator('[data-ask=rabbit] [data-v="-1"]').click();pg.locator('[data-ask=lizard] [data-v="0"]').click()
    pg.click('#labRun');pg.wait_for_timeout(3300)
    print('web compare:',pg.locator('.lab-cmp-list').inner_text().replace('\n',' | '))
    print('badges',pg.evaluate("[...document.querySelectorAll('.fw-n.up,.fw-n.dn')].map(n=>n.dataset.n+(n.classList.contains('up')?'+':'-'))"))
    pg.screenshot(path=OUT+'/lab4.png',full_page=True)
    print('w',pg.evaluate('document.documentElement.scrollWidth'))
    print('errs',errs); assert not errs
