from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':400,'height':860})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(U);pg.wait_for_timeout(300)
    addkid(pg,'محمد');pg.wait_for_timeout(200)
    pg.screenshot(path=OUT+'/h_home.png',full_page=True)
    pg.click('[data-nav="app-dict"]');pg.wait_for_timeout(300)
    print('in g4?',end=' ');pg.goto('about:blank');pg.goto(U+'#y-g4');pg.wait_for_timeout(200);print(pg.locator('[data-nav="app-dict"]').count())
    pg.goto('about:blank');pg.goto(U+'#app-dict');pg.wait_for_timeout(300)
    for v in ['0','3','4','5']:
        pg.click(f'[data-lv="{v}"]');pg.wait_for_timeout(150)
        print(v,pg.locator('.d-progress .m-row span').inner_text(),'w',pg.evaluate('document.documentElement.scrollWidth'))
    pg.screenshot(path=OUT+'/h_dict.png',full_page=True)
    pg.click('[data-a=topics]');pg.wait_for_timeout(100);print('topics',pg.locator('.d-topic').count())
    dhome(pg);pg.click('.d-wod');pg.wait_for_timeout(150);print('word level',pg.locator('.d-word .pos').inner_text())
    print('bar back',pg.evaluate("document.querySelector('[data-nav=home]') ? 'home link' : 'none'"))
    for q in ['Friday','الجمعة','falcon','ثوب']:
        dhome(pg);pg.fill('#dQ',q);pg.press('#dQ','Enter');pg.wait_for_timeout(150);print(q,pg.locator('.d-row .tg').all_inner_texts()[:3])
    print(errs)
