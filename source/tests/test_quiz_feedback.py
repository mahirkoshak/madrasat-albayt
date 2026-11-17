from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(300);pg.fill('#pName','محمد');pg.click('[data-av]');pg.click('#pAdd button[type=submit]');pg.wait_for_timeout(200)
    pg.evaluate("HS.nav.go('unit-g3sciearth-test-l1')");pg.wait_for_timeout(400)
    leaks=0; seen=0
    for k in range(8):
        q=pg.evaluate("(()=>{const t=document.querySelector('#uQ .q').textContent;return UNITS.g3sciearth.questions.find(x=>x.q.replace('____','؟')===t||x.q===t)||UNITS.g3sciearth.questions.find(x=>t.startsWith(x.q.split('____')[0]))})()")
        if not q or q['t'] not in ('mcq','fill','pic','tf'):
            # solve non-choice questions any way
            # matching: tap a card, then the row with the same pair index · ordering: tap items in order
            for i in range(8):
                it=pg.locator(f'#uQ .mt-item[data-i="{i}"]')
                if it.count(): it.click(); pg.locator(f'#uQ .mt-row[data-i="{i}"]').click(); pg.wait_for_timeout(60)
                ob=pg.locator(f'#uQ .pool button[data-i="{i}"]')
                if ob.count(): ob.click(); pg.wait_for_timeout(40)
            pg.wait_for_timeout(200)
            if pg.locator('#uNext').count(): pg.click('#uNext');pg.wait_for_timeout(200)
            continue
        a=q['a'] if q['t']!='tf' else (0 if q['a'] else 1)
        right=(q.get('labels') or q.get('o') or ['صح','خطأ'])[a]
        wrong=pg.locator(f'#uQ .opt:not([data-i="{a}"])')
        wrong.first.click();pg.wait_for_timeout(150)
        hint=pg.locator('#uQ .coach').inner_text() if pg.locator('#uQ .coach').count() else ''
        shown_ok=pg.locator('#uQ .opt.ok').count()
        seen+=1
        if right.replace('ال','',1) in hint.replace('ال',''): leaks+=1
        print(q['id'],q['t'],'| ok shown after 1st wrong:',shown_ok,'| hint:',hint[:110])
        if k==0: pg.screenshot(path=OUT+'/coach1.png',full_page=True)
        if k%2: pg.locator(f'#uQ .opt[data-i="{a}"]').click()
        else:
            for _ in range(3):
                w=pg.locator(f'#uQ .opt:not([data-i="{a}"]):not([disabled])')
                if not w.count() or pg.locator('#uNext').count(): break
                w.first.click();pg.wait_for_timeout(100)
            if not pg.locator('#uNext').count(): pg.locator(f'#uQ .opt[data-i="{a}"]').click()
        pg.wait_for_timeout(150)
        print('   feedback:',pg.locator('#uFb b').first.inner_text(),'| right shown:',pg.locator('#uFb .right').count())
        if k==1: pg.screenshot(path=OUT+'/coach2.png',full_page=True)
        pg.click('#uNext');pg.wait_for_timeout(200)
    print('leaks',leaks,'of',seen); assert leaks==0
    print('learn',pg.evaluate("HS.data('u:g3sciearth').learn||HS.data('g3sciearth').learn"))
    pg.evaluate("HS.nav.go('parent')");pg.wait_for_timeout(400)
    if pg.locator('#pinI').count(): print('PIN gate')
    print(pg.locator('.pp-learn').first.inner_text()[:400]); pg.locator('.pp-learn details').first.click()
    pg.locator('.pp-learn').first.screenshot(path=OUT+'/pp-learn.png')
    print('errs',errs); assert not errs
