from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME)
    pg=b.new_page(viewport={'width':400,'height':800})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(500);pg.screenshot(path=OUT+'/a1.png',full_page=True)
    # add profile
    addkid(pg,'محمد');pg.wait_for_timeout(300)
    addkid(pg,'سارة');pg.wait_for_timeout(300)
    pg.screenshot(path=OUT+'/a2.png',full_page=True)
    pg.click('[data-kid]:has-text("محمد")')
    pg.click('[data-nav="s-g4-sci"]');pg.click('[data-nav="unit-g4scieco"]');pg.wait_for_timeout(400)
    pg.screenshot(path=OUT+'/a3.png',full_page=True)
    # lesson
    sec(pg,'l2');pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/a4.png',full_page=True)
    # lesson quiz: answer all, handle every type
    pg.click('[data-act=quiz][data-mode=lesson]');pg.wait_for_timeout(200)
    types=[]
    for step in range(40):
        if pg.locator('#uGoRetry').count(): pg.click('#uGoRetry');continue
        if pg.locator('#uAgain').count(): break
        if pg.locator('.mt-item').count():
            types.append('match')
            items=pg.locator('.mt-item:not(.hs-done)')
            while pg.locator('.mt-item:not(.hs-done)').count():
                it=pg.locator('.mt-item:not(.hs-done)').first; i=it.get_attribute('data-i')
                it.click(); pg.click(f'.mt-row[data-i="{i}"]'); pg.wait_for_timeout(50)
        elif pg.locator('.pool button').count() and pg.locator('#uQ .slots').count():
            types.append('order')
            for k in range(10):
                bt=pg.locator(f'.pool button[data-i="{k}"]')
                if not bt.count(): break
                bt.click(); pg.wait_for_timeout(30)
        elif pg.locator('#uQ .opt').count():
            types.append(pg.locator('#uQ .opts').get_attribute('class'))
            pick(pg)
        pg.wait_for_timeout(100)
        if pg.locator('#uNext').count(): pg.click('#uNext')
        pg.wait_for_timeout(100)
    print('types',types)
    pg.screenshot(path=OUT+'/a5.png',full_page=True)
    # home shows review
    sec(pg,'home');pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/a6.png',full_page=True)
    print('due card', pg.locator('.card.due h3').inner_text())
    # games
    sec(pg,'play');pg.click('[data-act=sort][data-g=role]');pg.wait_for_timeout(200)
    # drag test with mouse
    it=pg.locator('.sg-item').first; bin=pg.locator('.sg-bin').first
    ib=it.bounding_box(); bb=bin.bounding_box()
    pg.mouse.move(ib['x']+20,ib['y']+20);pg.mouse.down();pg.mouse.move(ib['x']+60,ib['y']+60,steps=5);pg.mouse.move(bb['x']+40,bb['y']+60,steps=10);pg.mouse.up();pg.wait_for_timeout(1500)
    print('after drag remaining',pg.inner_text('#uLeft'))
    pg.screenshot(path=OUT+'/a7.png',full_page=True)
    # tap-tap rest
    for _ in range(12):
        its=pg.locator('.sg-item:not(.hs-done)')
        if not its.count(): break
        its.first.click(); pg.locator('.sg-bin').nth(1).click(); pg.wait_for_timeout(1300)
    pg.wait_for_timeout(900);print('sort end:',pg.locator('.result h2').count())
    back(pg);pg.click('[data-act=memory]');pg.wait_for_timeout(200)
    pg.screenshot(path=OUT+'/a8.png',full_page=True)
    back(pg);pg.click('[data-act=order]');pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/a9.png',full_page=True)
    sec(pg,'cards');pg.wait_for_timeout(300);pg.click('#uFcKnow');pg.click('#uFcAgain');pg.screenshot(path=OUT+'/a10.png',full_page=True)
    sec(pg,'test');pg.click('[data-act=speed]');pg.wait_for_timeout(300)
    for _ in range(5):
        if pg.locator('#uQ .opt:not([disabled])').count(): pg.locator('#uQ .opt:not([disabled])').first.click()
        pg.wait_for_timeout(1200)
    pg.screenshot(path=OUT+'/a11.png',full_page=True)
    # KG
    pg.click('#appbar [data-nav=home]');pg.click('[data-kid]:has-text("سارة")');pg.click('.p-explore');pg.click('[data-nav="y-kg"]');pg.click('[data-nav="app-kg"]');pg.wait_for_timeout(300)
    pg.click('#app-kg [data-game=basket]');pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/a12.png',full_page=True)
    back(pg);pg.click('#app-kg [data-game=memory]');pg.wait_for_timeout(200)
    cards=pg.locator('.kmem .mc'); n=cards.count(); print('kg mem cards',n)
    pg.screenshot(path=OUT+'/a13.png',full_page=True)
    for g in ['letters','first','count','col','shp','ani','odd','pat']:
        back(pg);pg.click(f'#app-kg [data-game={g}]')
        for l in [1,2,3]:
            kglv(pg,g,l); assert pg.locator('#gOpts .opt').count()>=3, (g,l)
    # answer correctly 5 times on letters to test level up
    back(pg);pg.click('#app-kg [data-game=ani]');kglv(pg,'ani',1)
    pg.evaluate("1")
    pg.click('#appbar [data-nav=home]');pg.click('#gbMenuBtn');pg.click('#appbar [data-nav=parent]');pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/a14.png',full_page=True)
    print('width',pg.evaluate('document.documentElement.scrollWidth'))
    print('ERRORS',errs or 'none'); assert not errs
    b.close()
