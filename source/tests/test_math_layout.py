# Maths layout: every page of both maths units at phone, tablet and desktop widths: nothing wider than the screen,
# nothing sticking out of its card, keypad buttons big enough to tap
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME)
    probs=[]
    for W,H in [(360,740),(768,1024),(1280,800)]:
        pg=b.new_page(viewport={'width':W,'height':H})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(U);pg.wait_for_timeout(300);addkid(pg,'محمد');pg.wait_for_timeout(200)
        for u in ['g3math5','g4math5']:
            routes=pg.evaluate(f"""(()=>{{const U=UNITS.{u},r=['','-cards','-play','-test','-play-memory','-play-speed'];
              U.lessons.forEach(l=>r.push('-'+l.id));U.games.sort.forEach(g=>r.push('-play-s-'+g.id));U.games.order.forEach(g=>r.push('-play-o-'+g.id));
              Object.keys(APPS.unit.labs().{u}||{{}}).forEach(k=>r.push('-play-lab-'+k));U.lessons.forEach(l=>r.push('-test-'+l.id));return r}})()""")
            for r in routes:
                pg.evaluate(f"HS.nav.go('unit-{u}{r}')");pg.wait_for_timeout(250)
                # open the first step of games that start with a choice, so the inner screens are measured too
                if r.endswith('lab-break'): pg.locator('#app-unit .mg-splits .opt').first.click();pg.wait_for_timeout(150)
                if r.endswith('lab-area'): pg.locator('#app-unit .m-slot').first.click();pg.wait_for_timeout(150)
                if r.endswith('lab-regroup'): pg.click('#rgJoin');pg.wait_for_timeout(150)
                if r.endswith('lab-pair'): pg.locator('#app-unit .pr-card').nth(0).click();pg.locator('#app-unit .pr-card').nth(1).click();pg.wait_for_timeout(150)
                if r.endswith('lab-table'): pg.locator('#app-unit .tb-c').nth(55).click();pg.wait_for_timeout(150)
                bad=pg.evaluate("""(()=>{const W=innerWidth,o=[];
                  if(document.documentElement.scrollWidth>W)o.push('page '+document.documentElement.scrollWidth);
                  document.querySelectorAll('#app-unit .m-model,#app-unit .m-pad,#app-unit .pg-board,#app-unit .pg-strip,#app-unit .opts,#app-unit .pr-cards,#app-unit .fc-ctl,#app-unit .mt-table,#app-unit .tb-wrap').forEach(e=>{
                    const r=e.getBoundingClientRect(),c=(e.closest('.card')||document.body).getBoundingClientRect();
                    if(r.width&&(r.right>c.right+1||r.left<c.left-1))o.push(e.className.split(' ')[0]+' sticks out '+Math.round(r.left-c.left)+'/'+Math.round(c.right-r.right))});
                  document.querySelectorAll('#app-unit .m-k,#app-unit .pg-f,#app-unit .tb-c').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&(r.width<28||r.height<28))o.push('small '+e.className)});
                  return [...new Set(o)]})()""")
                if bad: probs.append((W,u+r,bad))
            if W==1280: pass
        for r in ['unit-g3math5-play-lab-pg','unit-g4math5-play-lab-area','unit-g3math5-play-lab-table']:
            pg.evaluate(f"HS.nav.go('{r}')");pg.wait_for_timeout(300);pg.screenshot(path=f"{OUT}/math-{W}-{r.split('-')[-1]}.png",full_page=True)
        if errs: probs.append((W,'errors',errs))
        pg.close()
    for x in probs: print(x)
    print('layout problems:',len(probs)); assert not probs
