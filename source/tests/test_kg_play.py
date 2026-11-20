# The six newer kindergarten games (race, quick look, more, size order, same sound, feelings), every level,
# plus the redesigned kindergarten home page (game of the day, level dots, focus groups, «new» badges)
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME)
    for W,H,tag in [(390,844,'phone'),(1100,900,'wide')]:
        pg=b.new_page(viewport={'width':W,'height':H})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        pg.goto(U);pg.wait_for_timeout(300);addkid(pg,'سارة');pg.wait_for_timeout(200)
        pg.evaluate("HS.nav.go('app-kg')");pg.wait_for_timeout(600)
        print(tag,'games',pg.locator('#app-kg [data-game]').count(),'learn',pg.locator('#app-kg [data-learn]').count(),'today:',pg.inner_text('#kToday').replace('\n',' | '),'new badges',pg.locator('#app-kg .mi.new').count())
        assert pg.locator('#app-kg [data-game]').count()==24 and pg.locator('#app-kg .mi.new').count()==6
        pg.screenshot(path=f'{OUT}/kg-home-{tag}.png',full_page=True)
        if tag=='wide': pg.close(); continue
        def open_game(g,l):
            pg.evaluate(f"APPS.kg.setLevel(HS.current().id,'{g}',{l});HS.nav.go('app-kg');HS.nav.go('app-kg-game-{g}')");pg.wait_for_timeout(500)
        def dots(): return pg.locator('#gDots i.f').count()
        def right(wrong_first=False):
            if wrong_first:
                w=pg.locator('#gArea .opt:not([data-r])').first; w.click(); pg.wait_for_timeout(150); assert w.is_disabled()
            pg.locator('#gArea .opt[data-r]').click(); pg.wait_for_timeout(2400 if not wrong_first else 3200)
        for g in ([] if 0 else ['quick','more','sound','feel']):
            for l in [1,2,3]:
                open_game(g,l); d0=dots()
                if g=='quick': pg.wait_for_timeout(2300); assert 'hid' in pg.get_attribute('.qk-show','class')
                q=pg.inner_text('#gQ'); n=pg.locator('#gArea .opt').count()
                right(wrong_first=(l==2)); 
                print(g,l,'q:',q,'| options',n,'| next question', dots()>d0)
                assert dots()>d0
                if l==3: pg.screenshot(path=f'{OUT}/kg-{g}.png',full_page=True)
        for l in [1,2,3]:
            open_game('size',l); n=pg.locator('.sz-it').count(); down='الأكبر إلى' in pg.inner_text('#gQ'); d0=dots()
            sizes=sorted([int(pg.locator('.sz-it').nth(i).get_attribute('data-s')) for i in range(n)],reverse=down)
            # wrong first: the biggest when the smallest is wanted
            pg.locator(f'.sz-it[data-s="{sizes[-1]}"]').click(); pg.wait_for_timeout(150)
            assert pg.locator('.sz-it.used').count()==0
            for s in sizes: pg.locator(f'.sz-it[data-s="{s}"]').click(); pg.wait_for_timeout(120)
            pg.wait_for_timeout(2400); print('size',l,'items',n,'down' if down else 'up','done',dots()>d0); assert dots()>d0
            if l==3: pg.screenshot(path=f'{OUT}/kg-size.png',full_page=True)
        for l in [1,2,3]:
            open_game('race',l); d0=dots(); turns=0
            while turns<20:
                pg.wait_for_timeout(1500); sp=pg.locator('.rc-spin')
                if not sp.count(): break
                if sp.is_disabled(): continue
                sp.click(); pg.wait_for_timeout(1000); turns+=1
                pos=int(pg.get_attribute('#gArea .tk','data-pos')); tg=int(pg.get_attribute('#gArea .tk','data-target'))
                if turns==1:   # a wrong square first: nothing moves
                    pg.click(f'.rc-sq[data-n="{tg+1 if tg<10 else 1}"]'); pg.wait_for_timeout(150); assert pg.locator('.rc-sq.past').count()==pos
                if l<3:
                    for n in range(pos+1,tg+1): pg.click(f'.rc-sq[data-n="{n}"]'); pg.wait_for_timeout(120)
                else: pg.click(f'.rc-sq[data-n="{tg}"]'); pg.wait_for_timeout(600+520*(tg-pos))
                if l==2 and turns==2: pg.screenshot(path=f'{OUT}/kg-race.png',full_page=True)
                if tg==10: pg.wait_for_timeout(3200); break
            print('race',l,'turns',turns,'race done',dots()>d0); assert dots()>d0
        pg.evaluate("HS.nav.go('app-kg')");pg.wait_for_timeout(400)
        print('after play: new badges',pg.locator('#app-kg .mi.new').count(),'| race level dots',pg.locator('[data-game="race"] .mi-lv i.f').count())
        rep=[x['k'] for x in pg.evaluate("APPS.kg.report(HS.current().id)")]
        assert all(k in rep for k in ['race','quick','more','size','sound','feel'])
        print('errors',errs); assert not errs
        pg.close()
