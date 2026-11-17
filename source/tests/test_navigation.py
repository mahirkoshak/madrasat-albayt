import json
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
st=open(FIX/'state.json').read()
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); pg=b.new_page(viewport={'width':1280,'height':900}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'fonts' not in m.text else None)
    pg.goto(U); pg.evaluate("s=>localStorage.setItem('hs-v2',s)",st); pg.goto('about:blank')
    out=[]
    def at(h):
        pg.goto(U+'#'+h); pg.wait_for_timeout(250)
        crumbs=pg.evaluate("[...document.querySelectorAll('.gb-crumbs li')].filter(l=>!l.classList.contains('ell')).map(l=>l.textContent.trim())")
        back=pg.evaluate("(document.querySelector('.gb-back')||{}).dataset?.nav||null")
        title=pg.evaluate("document.title"); focus=pg.evaluate("document.getElementById('appbar').classList.contains('focus')")
        out.append((h,back,' > '.join(crumbs) or pg.evaluate("(document.querySelector('.gb-title')||{}).textContent||''"),title.split(' –')[0],focus))
    for h in ['home','y-g4','s-g4-sci','unit-g4scieco','unit-g4scieco-l2','unit-g4scieco-play','unit-g4scieco-play-s-living','unit-g4scieco-test-final','unit-g3sciearth-play-memory','app-kg','app-kg-game-robot','app-kg-learn-ar','app-dict','app-dict-spell','app-dict-topics','app-dict-t-ani','app-dict-w-camel%7Cani','app-dict-done','parent','shop','y-kg','bogus-route']:
        at(h)
    for o in out: print(o)
    # the logical parent of every page (header Back), and which pages are focused activities (no breadcrumb)
    PARENT={'home':None,'y-g4':'home','s-g4-sci':'y-g4','unit-g4scieco':'s-g4-sci','unit-g4scieco-l2':'unit-g4scieco','unit-g4scieco-play':'unit-g4scieco',
      'unit-g4scieco-play-s-living':'unit-g4scieco-play','unit-g4scieco-test-final':'unit-g4scieco-test','unit-g3sciearth-play-memory':'unit-g3sciearth-play',
      'app-kg':'y-kg','app-kg-game-robot':'app-kg','app-kg-learn-ar':'app-kg','app-dict':'home','app-dict-spell':'app-dict','app-dict-topics':'app-dict',
      'app-dict-t-ani':'app-dict-topics','app-dict-w-camel%7Cani':'app-dict-t-ani','app-dict-done':'app-dict','parent':'home','shop':'home','y-kg':'home','bogus-route':None}
    FOCUS={'unit-g4scieco-play-s-living','unit-g4scieco-test-final','unit-g3sciearth-play-memory','app-kg-game-robot','app-dict-spell'}
    for h,back,crumbs,title,focus in out:
        assert back==PARENT[h], (h,back,PARENT[h]); assert focus==(h in FOCUS), (h,focus)
        if focus: assert '>' not in crumbs, h
        if crumbs and '>' in crumbs: assert crumbs.split(' > ')[-1]==title, (h,crumbs,title)   # no stale titles
    print('parents, focus mode and titles: OK')
    # back/forward
    pg.goto(U+'#home'); pg.wait_for_timeout(200)
    for sel in ['[data-nav="y-g4"]','[data-nav="s-g4-sci"]','[data-nav="unit-g4scieco"]']: pg.click(sel); pg.wait_for_timeout(200)
    pg.click('a[data-p="play"]'); pg.wait_for_timeout(200); pg.click('[data-act="sort"]'); pg.wait_for_timeout(200)
    h1=pg.evaluate("location.hash"); pg.click('.gb-back'); pg.wait_for_timeout(200); h2=pg.evaluate("location.hash")
    pg.go_back(); pg.wait_for_timeout(250); h3=pg.evaluate("location.hash"); pg.go_back(); pg.wait_for_timeout(250); h4=pg.evaluate("location.hash"); pg.go_forward(); pg.wait_for_timeout(250); h5=pg.evaluate("location.hash")
    print('flow',h1,'| header Back ->',h2,'| browser back ->',h3,'->',h4,'| forward ->',h5)
    assert h2=='#unit-g4scieco-play' and h3==h1 and h4=='#unit-g4scieco-play' and h5==h1
    pg.click('.gb-crumbs a[data-nav="s-g4-sci"]') if pg.locator('.gb-crumbs a[data-nav="s-g4-sci"]').count() else None; pg.wait_for_timeout(200); print('crumb click ->',pg.evaluate("location.hash"))
    print('errors',errs); assert not errs; b.close()
