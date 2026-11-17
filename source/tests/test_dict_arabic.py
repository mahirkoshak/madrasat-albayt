from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':400,'height':860})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(300)
    pg.fill('#pName','محمد');pg.click('[data-av]');pg.click('#pAdd button[type=submit]');pg.wait_for_timeout(200)
    pg.goto('about:blank');pg.goto(U+'#app-dict');pg.wait_for_timeout(400)
    W=lambda: pg.evaluate('document.documentElement.scrollWidth')
    # dice on home
    w0=pg.locator('.d-wod b').inner_text(); seen={w0}
    for i in range(6): pg.click('.d-dice');pg.wait_for_timeout(80);seen.add(pg.locator('.d-wod b').inner_text())
    print('dice home distinct',len(seen))
    pg.click('[data-mode=ar]');pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/a_home.png',full_page=True)
    print('ar wod',pg.locator('.d-wod b').inner_text(),'| src',pg.locator('.d-wod .ar').inner_text(),'w',W())
    pg.click('.d-wod');pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/a_word.png',full_page=True)
    w1=pg.locator('.d-word .w span').inner_text();pg.click('.d-word [data-a=dice]');pg.wait_for_timeout(200)
    print('word dice',w1,'->',pg.locator('.d-word .w span').inner_text(),'arabic say btns',pg.locator('.d-word .w .d-say').count())
    back(pg);pg.wait_for_timeout(150);print('back to',pg.locator('.d-h1').count() and 'home' or pg.locator('.d-word').count() and 'word')
    dhome(pg);pg.click('[data-a=az]');pg.wait_for_timeout(150);print('ar letters',pg.locator('.d-az button').count());pg.click('.d-az button >> nth=1');pg.wait_for_timeout(150)
    print('ب words',pg.locator('.d-row .tg').all_inner_texts()[:5]); pg.screenshot(path=OUT+'/a_list.png',full_page=True)
    dhome(pg)
    # practice each box in Arabic mode
    for bx in [0,1,2,3]:
        pg.evaluate("""(b)=>{const d=HS.data('dictar');d.srs={};APPDATA.dict.RAW.trim().split('\\n').forEach(l=>{const p=l.split('|');if(b)d.srs[p[0]+'|'+p[7]]={b:b,c:1,w:0,t:Date.now(),due:0}});}""",bx)
        dhome(pg);pg.wait_for_timeout(100);pg.click('[data-a=practice]');pg.wait_for_timeout(200)
        n=0;modes=set()
        for k in range(30):
            if pg.locator('.d-bigem').count(): break
            T=pg.evaluate("document.getElementById('app-dict')._dbg")
            if pg.locator('.d-tile-l').count():
                modes.add('tiles')
                for ch in T: pg.locator(f'.d-tile-l[data-c="{ch}"]:not([disabled])').first.click();pg.wait_for_timeout(20)
            elif pg.locator('#dType').count():
                modes.add('type'); pg.fill('#dType', T if k%3 else T[:-1]+'ه'); pg.click('#dTypeF button')
            elif pg.locator('.d-opt').count():
                modes.add('opt'); pg.locator('.d-opt[data-ok=true]').click()
            pg.wait_for_timeout(120)
            if k==0: pg.screenshot(path=f'{OUT}/a_p{bx}.png',full_page=True)
            if pg.locator('.d-fb .bad').count() and bx==3 and n==0: pg.screenshot(path=OUT+'/a_wrong.png',full_page=True); n=1
            if pg.locator('#dNext').count(): pg.click('#dNext')
            pg.wait_for_timeout(80)
        print('box',bx,modes,'finished',pg.locator('.d-bigem').count(),'w',W())
    print('ar progress',pg.evaluate("Object.keys(HS.data('dictar').srs).length"),'en untouched',pg.evaluate("Object.keys(HS.data('dict').srs||{}).length"))
    pg.goto('about:blank');pg.goto(U+'#parent');pg.wait_for_timeout(300);print('parent ar line',pg.locator('text=📝 عربي').count())
    print(errs[:5])
