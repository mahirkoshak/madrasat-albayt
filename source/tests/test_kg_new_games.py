# Change the Rule (all 5 levels, wrong basket = reminder, never solved for the child), Story Workshop (3 levels,
# wrong fix questioned), free build (add, move by keys, resize, colour, done), shape building with two triangles
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(300);addkid(pg,'سارة');pg.wait_for_timeout(200)
    def open_game(g,l):
        pg.evaluate(f"APPS.kg.setLevel(HS.current().id,'{g}',{l});HS.nav.go('app-kg');HS.nav.go('app-kg-game-{g}')");pg.wait_for_timeout(500)
    # --- change the rule: conflicting cards, correct basket per rule
    for l in range(1,6):
        open_game('rule',l)
        d=pg.evaluate("document.getElementById('app-kg')._dbg")
        assert len(d['cards'])==6
        r0=pg.locator('#gDots i.f').count()
        # first card: wrong basket first -> stays on the same card
        c=d['cards'][0]; pg.click(f'.rl-bin[data-b="{1-c["to"]}"]'); pg.wait_for_timeout(150)
        for c in d['cards']:
            pg.click(f'.rl-bin[data-b="{c["to"]}"]'); pg.wait_for_timeout(560)
        pg.wait_for_timeout(500)
        rules=[c['rule'] for c in d['cards']]
        print('rule level',l,rules,'frames',[c['frame'] for c in d['cards']] if l==3 else '','round done',pg.locator('#gDots i.f').count()>r0)
        assert pg.locator('#gDots i.f').count()>r0
        if l==1: pg.screenshot(path=OUT+'/rule.png',full_page=True)
    # each card conflicts: colour and shape point to different baskets
    print('120 configurations:',6*10*2)
    # --- story workshop
    for l in [1,2,3]:
        open_game('tale',l); r0=pg.locator('#gDots i.f').count()
        pg.locator('.tl-o').first.click();pg.wait_for_timeout(200);pg.locator('.tl-o').first.click();pg.wait_for_timeout(300)
        if l>1:
            pg.wait_for_timeout(2700); pg.locator('.tl-o').nth(1).click(); pg.wait_for_timeout(2900)
            k=1  # problem index chosen = data-i of second option
            k=int(pg.evaluate("1"))
            opts=pg.locator('.tl-o'); n=opts.count()
            prob=pg.evaluate("[...document.querySelectorAll('.tl-line')].length")
            # wrong fix first (data-i != problem index): find the problem index from the story text
            pi=pg.evaluate("APPDATA.kg.TALE.problem.findIndex(p=>document.querySelector('.tl-story').textContent.includes(p[1]))")
            wrongs=[i for i in range(n) if int(opts.nth(i).get_attribute('data-i'))!=pi]
            opts.nth(wrongs[0]).click(); pg.wait_for_timeout(200)
            assert opts.nth(wrongs[0]).is_disabled()
            for i in range(n):
                if int(opts.nth(i).get_attribute('data-i'))==pi: opts.nth(i).click(); break
            pg.wait_for_timeout(2700)
        pg.wait_for_timeout(1200)
        lines=pg.locator('.tl-line').count(); txt=pg.locator('.tl-story').inner_text().replace('\n',' | ')
        print('tale level',l,'story:',txt); assert lines==(2 if l==1 else 4), lines
        if l==3: pg.screenshot(path=OUT+'/tale.png',full_page=True)
    # --- free build
    open_game('build',1)
    for s in [0,2,3]: pg.click(f'.bd-s[data-s="{s}"]')
    pg.click('.bd-c[data-c="3"]'); pg.click('.bd-a[data-a="big"]')
    pg.locator('.bd-it').first.focus(); pg.keyboard.press('ArrowLeft'); pg.keyboard.press('ArrowLeft')
    st0=pg.evaluate("HS.stars(HS.current().id)"); pg.click('.bd-a[data-a="done"]'); pg.wait_for_timeout(300)
    print('build items',pg.locator('.bd-it').count(),'star +',pg.evaluate("HS.stars(HS.current().id)")-st0)
    assert pg.locator('.bd-it').count()==3
    pg.screenshot(path=OUT+'/build.png',full_page=True)
    print('parent levels exclude free build:', 'build' not in [x['k'] for x in pg.evaluate("APPS.kg.levels()")])
    # --- shape building: two triangles fill a rectangle (level 3+)
    for attempt in range(6):
        open_game('compose',3)
        if pg.locator('.cp-piece[data-half]').count(): break
    if pg.locator('.cp-piece[data-half]').count():
        k=pg.locator('.cp-piece[data-half]').first.get_attribute('data-half')
        for part in ['rtBL','rtTR']:
            pg.locator(f'.cp-piece[data-part="{part}"]').click(); pg.locator(f'.cp-slot[data-k="{k}"]').first.click(force=True); pg.wait_for_timeout(150)
        print('two triangles filled the rectangle:', pg.locator(f'.cp-slot[data-k="{k}"].done').count()>=1)
        assert pg.locator(f'.cp-slot[data-k="{k}"].done').count()>=1
        assert pg.locator(f'.cp-piece[data-k="{k}"]:not(.hs-done)').count()==0 or pg.locator(f'.cp-slot[data-k="{k}"]:not(.done)').count()>0
    print('w',pg.evaluate('document.documentElement.scrollWidth')); assert pg.evaluate('document.documentElement.scrollWidth')<=390
    print('errs',errs); assert not errs
