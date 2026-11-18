from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':400,'height':860})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(300)
    addkid(pg,'محمد');pg.wait_for_timeout(200)
    pg.click('[data-nav="s-g4-sci"]');pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/h0.png',full_page=True)
    pg.click('[data-nav="unit-g4scihealth"]');pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/h1.png',full_page=True)
    print('speak buttons',pg.locator('#scr-unit .say, #uFcSay').count())
    for l in ['l1','l2','l3','l4']:
        sec(pg,f'{l}');pg.wait_for_timeout(200)
        if l in('l1','l4'): pg.screenshot(path=f'{OUT}/h_{l}.png',full_page=True)
        print(l,'w',pg.evaluate('document.documentElement.scrollWidth'),'say',pg.locator('#scr-unit .say').count())
        pg.click('[data-act=quiz][data-mode=lesson]');pg.wait_for_timeout(200)
        types=[]
        for step in range(40):
            if pg.locator('#uGoRetry').count(): pg.click('#uGoRetry');continue
            if pg.locator('#uAgain').count(): break
            if pg.locator('.mt-item').count():
                types.append('match')
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
                types.append('opt'); pick(pg)
            pg.wait_for_timeout(100)
            if pg.locator('#uNext').count(): pg.click('#uNext')
            pg.wait_for_timeout(100)
        print(l,'types',len(types),set(types))
    sec(pg,'play');pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/h_play.png',full_page=True)
    for g in ['g1','g2','g3','g4']:
        pg.click(f'[data-act=sort][data-g={g}]');pg.wait_for_timeout(200)
        n=pg.locator('.sg-item').count()
        back(pg);pg.wait_for_timeout(150)
        print(g,'items',n)
    pg.click('[data-act=order]');pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/h_ord.png',full_page=True)
    sec(pg,'cards');pg.wait_for_timeout(300);print('fc',pg.locator('#uFcT').inner_text())
    sec(pg,'test');pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/h_test.png',full_page=True)
    print(errs[:5])
