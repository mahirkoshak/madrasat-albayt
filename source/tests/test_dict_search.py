from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':400,'height':860})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(300)
    addkid(pg,'محمد');pg.wait_for_timeout(200)
    pass
    pg.click('[data-nav="app-dict"]');pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/x1.png',full_page=True)
    def w(): return pg.evaluate('document.documentElement.scrollWidth')
    print('home w',w())
    for q in ['apple','تفاحه','أسد','ele','قلم']:
        pg.fill('#dQ',q);pg.press('#dQ','Enter');pg.wait_for_timeout(200)
        print(q,'->',pg.locator('.d-row .tg').all_inner_texts()[:4])
        dhome(pg);pg.wait_for_timeout(150)
    pg.fill('#dQ','elephant');pg.press('#dQ','Enter');pg.wait_for_timeout(200);pg.click('.d-row');pg.wait_for_timeout(200)
    pg.screenshot(path=OUT+'/x2.png',full_page=True);print('word w',w())
    pg.click('[data-mine]');pg.wait_for_timeout(200);print('mine',pg.evaluate("HS.data('dict').mine"))
    dhome(pg)
    pg.click('[data-a=topics]');pg.wait_for_timeout(150);pg.click('[data-t=ani]');pg.wait_for_timeout(150);print('animals',pg.locator('.d-row').count())
    pg.click('.d-row >> nth=2');pg.wait_for_timeout(150);pg.click('[data-nav-w]');pg.wait_for_timeout(150);print('nav ok',pg.locator('.d-word .w span').inner_text())
    dhome(pg);pg.click('[data-a=az]');pg.wait_for_timeout(150);pg.click('[data-l=B]');print('B words',pg.locator('.d-row').count())
    # practice all modes: force boxes
    dhome(pg);pg.wait_for_timeout(150)
    modes=set()
    for b_ in [0,1,2,3]:
        pg.evaluate(f"""(()=>{{const d=HS.data('dict');d.srs={{}};}})()""")
        pg.click('[data-a=practice]');pg.wait_for_timeout(200)
        for k in range(12):
            if pg.locator('.d-bigem').count(): break
            if pg.locator('.d-opt').count():
                modes.add('opt'); ok=pg.locator('.d-opt[data-ok=true]'); ok.click()
            elif pg.locator('.d-tile-l').count():
                modes.add('tiles')
                word=pg.evaluate("document.querySelector('.d-clue') && 0")
                # find target word via P? read from srs by solving: use letters order of answer via global id
                cur=pg.evaluate("(()=>{const ids=[...document.querySelectorAll('.d-tile-l')];return ids.length})()")
                break
            elif pg.locator('#dType').count():
                modes.add('type'); pg.fill('#dType','zzz');pg.click('#dTypeF button')
            pg.wait_for_timeout(150)
            if pg.locator('#dNext').count(): pg.click('#dNext')
            pg.wait_for_timeout(120)
        if b_==0: pg.screenshot(path=OUT+'/x3.png',full_page=True)
        dhome(pg);pg.wait_for_timeout(150)
        # set all words box to next level for next loop
        pg.evaluate(f"""(()=>{{const d=HS.data('dict');d.srs={{}};const W=APPDATA.dict.RAW.trim().split('\\n').map(l=>{{const p=l.split('|');return p[0]+'|'+p[7]}});W.forEach(id=>d.srs[id]={{b:{b_+1},c:1,w:0,t:Date.now(),due:0}});}})()""")
        pg.click('[data-a=practice]');pg.wait_for_timeout(200)
        print('box',b_+1,'mode', 'opts' if pg.locator('.d-opt').count() else 'tiles' if pg.locator('.d-tile-l').count() else 'type' if pg.locator('#dType').count() else '?', 'w',w())
        pg.screenshot(path=f'{OUT}/xb{b_+1}.png',full_page=True)
        if pg.locator('#dType').count():
            pg.fill('#dType','wrnog');pg.click('#dTypeF button');pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/xwrong.png',full_page=True)
        dhome(pg);pg.wait_for_timeout(150)
    print('modes',modes)
    unlock(pg);pg.goto('about:blank');pg.goto(U+'#parent');pg.wait_for_timeout(300);print('parent has dict',pg.locator('text=قاموسي').count())
    print(errs[:5])
