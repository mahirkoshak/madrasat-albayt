# Outbreak Detective: register logic for every case, counter-example feedback, explain + stop steps, saved progress
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(300);pg.fill('#pName','محمد');pg.click('[data-av]');pg.click('#pAdd button[type=submit]');pg.wait_for_timeout(200)
    # data: the key column separates sick from healthy; no other column does
    bad=pg.evaluate("""(()=>{const out=[];for(const c of APPS.unit.labs().g4scihealth.outbreak.challenges){
      const val=(r,k)=>(c.same&&c.same[r[k+1]])||r[k+1], sick=c.rows.filter(r=>r[4]), well=c.rows.filter(r=>!r[4]);
      c.cols.forEach((_,k)=>{const sv=new Set(sick.map(r=>val(r,k))), sep=!!(sick.length&&sv.size===1&&!well.some(r=>sv.has(val(r,k))));
        if(sep!==(k===c.key)) out.push([c.id,k,sep]);});}return out;})()""")
    print('register problems',bad); assert not bad
    pg.evaluate("HS.nav.go('unit-g4scihealth-play')");pg.wait_for_timeout(300)
    assert pg.locator('#app-unit [data-act=lab][data-g=outbreak]').count()==1
    pg.click('#app-unit [data-act=lab]');pg.wait_for_timeout(300);pg.click('#labGo');pg.wait_for_timeout(200)
    C=pg.evaluate("APPS.unit.labs().g4scihealth.outbreak.challenges.map(c=>({key:c.key,route:c.route,a:c.correctAnswer,s:c.stop.a,title:c.title}))")
    for i,c in enumerate(C):
        print('case',c['title'])
        assert pg.locator('#labRun').is_disabled()
        pg.click('[data-pr="0"]');pg.click('#labRun');pg.wait_for_timeout(300)
        if c['key']>=0:
            wrong=[k for k in range(3) if k!=c['key']][0]
            pg.click(f'.ob-col[data-k="{wrong}"]');pg.wait_for_timeout(100)
            fb=pg.locator('#obCoach').inner_text(); print('  wrong column ->',fb[:90]); assert 'في السجلّ' in fb
            pg.click(f'.ob-col[data-k="{c["key"]}"]')
        else: pg.click('#obNone')
        pg.wait_for_timeout(800); print('  ',pg.locator('.lab-cmp').inner_text()[:80])
        if i==0: pg.screenshot(path=OUT+'/outbreak.png',full_page=True)
        o=pg.locator('.lab-why .opt')
        for j in range(o.count()):
            if c['a'] in o.nth(j).inner_text(): o.nth(j).click();break
        pg.wait_for_timeout(300)
        o=pg.locator('.lab-why').last.locator('.opt')
        for j in range(o.count()):
            if c['s'] in o.nth(j).inner_text(): o.nth(j).click();break
        pg.wait_for_timeout(300)
        pg.click('.lab-next .btn');pg.wait_for_timeout(300)
    rec=pg.evaluate("HS.data('u:g4scihealth').labs||HS.data('g4scihealth').labs"); print('rec',rec)
    assert len(rec['outbreak']['done'])==5
    print('w',pg.evaluate('document.documentElement.scrollWidth')); assert pg.evaluate('document.documentElement.scrollWidth')<=390
    print('errs',errs); assert not errs
