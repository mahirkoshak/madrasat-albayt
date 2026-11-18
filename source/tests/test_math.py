# Maths units: typed answers with strategy hints, models, and every maths game played to the end
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
AR='٠١٢٣٤٥٦٧٨٩'
def toen(t): return ''.join(str(AR.index(c)) if c in AR else c for c in t)
def typ(pg,n,scope='#app-unit'):
    for d in str(n): pg.locator(f'{scope} .m-k[data-k="{d}"]').last.click()
    pg.locator(f'{scope} .m-k.ok').last.click(); pg.wait_for_timeout(150)
def ans_last(pg):   # read the product asked in the last open number question, e.g. "٧ × ٦ = ؟"
    q=toen(pg.locator('#app-unit .mg-ask .q').last.inner_text()).replace('×','*').replace('−','-').split('=')[0]
    return eval(q.replace('(','').replace(')',''))
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:300]));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(300);pg.fill('#pName','محمد');pg.click('[data-av]');pg.click('#pAdd button[type=submit]');pg.wait_for_timeout(200)
    # every lesson draws, with models
    for u in ['g3math5','g4math5']:
        n=pg.evaluate(f"UNITS.{u}.lessons.length")
        for i in range(n):
            lid=pg.evaluate(f"UNITS.{u}.lessons[{i}].id")
            pg.evaluate(f"HS.nav.go('unit-{u}-{lid}')");pg.wait_for_timeout(150)
            want=pg.evaluate(f"UNITS.{u}.lessons[{i}].blocks.filter(b=>b.t==='model').length"); got=pg.locator('#app-unit .m-model').count()
            assert got==want,(u,lid,got,want)
        print(u,'lessons',n,'all models drawn')
    pg.evaluate("HS.nav.go('unit-g3math5-l5')");pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/math-lesson.png',full_page=True)
    pg.evaluate("HS.nav.go('unit-g4math5-l6')");pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/math-lesson4.png',full_page=True)
    # typed answer: wrong (added) -> mistake hint without the answer; wrong again -> model; then right
    pg.evaluate("HS.nav.go('unit-g3math5-test')");pg.wait_for_timeout(200)
    pg.click('#app-unit [data-act=quiz][data-l=l3]');pg.wait_for_timeout(300)
    seen=0
    for k in range(12):
        if pg.locator('#app-unit .m-pad').count()==0:
            o=pg.locator('#app-unit .opt:not([disabled])')
            if o.count(): o.first.click();pg.wait_for_timeout(250)
        else:
            q=toen(pg.locator('#app-unit .quiz .q').first.inner_text())
            qid=pg.evaluate("(()=>{const t=document.querySelector('#app-unit .quiz .q').textContent;return UNITS.g3math5.questions.find(q=>q.q===t)?.id})()")
            a=pg.evaluate(f"UNITS.g3math5.questions.find(q=>q.id==='{qid}').a") if qid else None
            f=pg.evaluate(f"UNITS.g3math5.questions.find(q=>q.id==='{qid}').f") if qid else None
            if a is not None and f and not seen:
                typ(pg,f[0]+f[1]);c=pg.locator('#app-unit .coach').inner_text();print('hint1:',c[:90]);assert toen(str(a)) not in toen(c).split() and str(a) not in toen(c)
                pg.wait_for_timeout(800);typ(pg,a+f[0]);print('hint2 has model:',pg.locator('#app-unit .coach .m-model').count())
                pg.screenshot(path=OUT+'/math-hint.png',full_page=True);pg.wait_for_timeout(800);seen=1
            if a is not None: typ(pg,a)
            pg.wait_for_timeout(300)
        nx=pg.locator('#app-unit #uNext, #app-unit .btn:has-text("التالي")')
        if nx.count(): nx.first.click();pg.wait_for_timeout(250)
        if pg.locator('#app-unit .result').count(): break
    print('quiz reached result:',pg.locator('#app-unit .result').count()>0)
    print('learn',pg.evaluate("HS.data('u:g3math5').learn||HS.data('g3math5').learn"))
    # games page groups
    pg.evaluate("HS.nav.go('unit-g3math5-play')");pg.wait_for_timeout(300)
    print('groups',pg.locator('#app-unit .gp-h').all_inner_texts())
    pg.screenshot(path=OUT+'/math-games.png',full_page=True)
    def nextb():
        n=pg.locator('#app-unit .lab-next .btn');
        if n.count(): n.last.click();pg.wait_for_timeout(250);return True
        return False
    # break apart
    pg.evaluate("HS.nav.go('unit-g3math5-play-lab-break')");pg.wait_for_timeout(300)
    for r in range(5):
        pg.locator('#app-unit .mg-splits .opt').first.click();pg.wait_for_timeout(200)
        if r==0: pg.screenshot(path=OUT+'/math-break.png',full_page=True)
        for s in range(3):
            if pg.locator('#app-unit .mg-ask .m-k:not([disabled])').count()==0: break
            typ(pg,ans_last(pg));pg.wait_for_timeout(200)
        nextb()
    print('break end:',pg.locator('#app-unit .result h2').inner_text())
    # pair game
    pg.evaluate("HS.nav.go('unit-g3math5-play-lab-pair')");pg.wait_for_timeout(300)
    for r in range(5):
        pg.locator('#app-unit .pr-card').nth(0).click();pg.locator('#app-unit .pr-card').nth(1).click();pg.wait_for_timeout(200)
        typ(pg,ans_last(pg));pg.wait_for_timeout(200);typ(pg,ans_last(pg));pg.wait_for_timeout(200);nextb()
    print('pair end:',pg.locator('#app-unit .result h2').inner_text())
    # table game
    pg.evaluate("HS.nav.go('unit-g3math5-play-lab-table')");pg.wait_for_timeout(300)
    pg.locator('#app-unit .tb-c[data-r="7"][data-c="8"]').click();pg.wait_for_timeout(150)
    print('table twin:',pg.locator('#app-unit .tb-c.twin').count(),pg.locator('#app-unit .tb-show .mg-fact').inner_text())
    pg.click('#tbGo');pg.wait_for_timeout(200)
    for r in range(8):
        h=pg.locator('#app-unit .tb-c.hid').first; rr,cc=int(h.get_attribute('data-r')),int(h.get_attribute('data-c'));h.click();pg.wait_for_timeout(150)
        typ(pg,rr*cc);pg.wait_for_timeout(1000)
    print('table end:',pg.locator('#app-unit .result h2').inner_text())
    # product game: play until it ends
    pg.evaluate("HS.nav.go('unit-g3math5-play-lab-pg')");pg.wait_for_timeout(300)
    pg.screenshot(path=OUT+'/math-pg0.png',full_page=True)
    for t in range(40):
        if pg.locator('#app-unit .result').count(): break
        fs=pg.locator('#app-unit .pg-f:not(.has)')
        if fs.count()==0: pg.locator('#app-unit .pg-clip').nth(1).click();fs=pg.locator('#app-unit .pg-f:not(.has)')
        fs.nth(t%fs.count()).click();pg.wait_for_timeout(150)
        typ(pg,ans_last(pg));pg.wait_for_timeout(2300)
        if t==2: pg.screenshot(path=OUT+'/math-pg.png',full_page=True)
    print('pg end:',pg.locator('#app-unit .result .lead').inner_text() if pg.locator('#app-unit .result').count() else 'still playing')
    # grade 4 games
    pg.evaluate("HS.nav.go('unit-g4math5-play-lab-factor')");pg.wait_for_timeout(300)
    for r in range(3):
        n=int(toen(pg.locator('#app-unit .mg-fact').inner_text()).split()[0])
        for rows in range(1,n+1):
            while int(toen(pg.locator('#app-unit .fc-ctl b').inner_text()))<rows: pg.click('#fcP');pg.wait_for_timeout(20)
            if pg.locator('#fcKeep').count(): pg.click('#fcKeep');pg.wait_for_timeout(60)
            if pg.locator('#app-unit .lab-next').count(): break
        if r==0: pg.screenshot(path=OUT+'/math-factor.png',full_page=True)
        nextb()
    print('factor end:',pg.locator('#app-unit .result h2').inner_text())
    pg.evaluate("HS.nav.go('unit-g4math5-play-lab-area')");pg.wait_for_timeout(300)
    for r in range(4):
        while pg.locator('#app-unit .m-slot').count():
            pg.locator('#app-unit .m-slot').first.click();pg.wait_for_timeout(150);typ(pg,ans_last(pg));pg.wait_for_timeout(800)
        if r==0: pg.screenshot(path=OUT+'/math-area.png',full_page=True)
        typ(pg,ans_last(pg));pg.wait_for_timeout(200);nextb()
    print('area end:',pg.locator('#app-unit .result h2').inner_text())
    pg.evaluate("HS.nav.go('unit-g4math5-play-lab-regroup')");pg.wait_for_timeout(300)
    for r in range(4):
        pg.click('#rgJoin');pg.wait_for_timeout(150)
        while pg.locator('#rgSwap').count(): pg.click('#rgSwap');pg.wait_for_timeout(100)
        if r==0: pg.screenshot(path=OUT+'/math-regroup.png',full_page=True)
        q=toen(pg.locator('#app-unit .mg-fact').inner_text()).replace('×','*').split('=')[0];typ(pg,eval(q));pg.wait_for_timeout(200);nextb()
    print('regroup end:',pg.locator('#app-unit .result h2').inner_text())
    print('w',pg.evaluate('document.documentElement.scrollWidth'))
    print('errs',errs); assert not errs
