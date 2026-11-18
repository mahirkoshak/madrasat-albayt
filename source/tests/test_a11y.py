import json
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
st=open(FIX/'state.json').read()
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); out={}
    # 1) keyboard walk on home + avatar radio keys; 2) reduced motion; 3) deep-link refresh; 4) emoji profiles intact; 5) names on buttons
    c=b.new_context(viewport={'width':1280,'height':900},reduced_motion='reduce'); pg=c.new_page(); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'fonts' not in m.text else None)
    pg.goto(U); pg.evaluate("s=>localStorage.setItem('hs-v2',s)",st); pg.goto('about:blank'); pg.goto(U+'#home'); pg.wait_for_timeout(500)
    seq=[]
    for i in range(14):
        pg.keyboard.press('Tab'); seq.append(pg.evaluate("(()=>{const e=document.activeElement;const cs=getComputedStyle(e);return (e.getAttribute('aria-label')||e.innerText||'').trim().slice(0,28)+' |outline:'+cs.outlineStyle})()"))
    out['tab order']=seq
    out['unnamed buttons']=pg.evaluate("[...document.querySelectorAll('button,a')].filter(e=>!(e.getAttribute('aria-label')||e.innerText.trim())).map(e=>e.outerHTML.slice(0,80))")
    out['imgs without alt attr']=pg.evaluate("[...document.images].filter(i=>!i.hasAttribute('alt')).length")
    out['small targets']=pg.evaluate("[...document.querySelectorAll('#portal button,#portal a')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.height<44||r.width<44)}).map(e=>(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,20)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height))")
    out['reduced motion transition']=pg.evaluate("getComputedStyle(document.querySelector('.p-card')).transitionDuration")
    out['emoji profile kept']=pg.evaluate("JSON.parse(localStorage.getItem('hs-v2')).profiles.map(p=>p.avatar)")
    # new child via keyboard picker
    pg.click('#pNew'); pg.wait_for_timeout(200); pg.click('[data-who=kid]'); pg.wait_for_timeout(150)
    pg.fill('#wzName','ليان'); pg.focus('.p-av.on'); pg.keyboard.press('ArrowLeft'); pg.keyboard.press('ArrowLeft')
    sel=pg.evaluate("document.activeElement.dataset.av"); pg.click('#wzNext'); pg.wait_for_timeout(150)
    pg.click('[data-grade=g4]'); pg.click('#wzNext'); pg.wait_for_timeout(150); pg.click('#wzGo'); pg.wait_for_timeout(300)
    out['keyboard picked']=sel; out['saved avatar']=pg.evaluate("HS.current().avatar"); out['ids unchanged']=pg.evaluate("HS.profiles().map(p=>p.id)")
    out['stars kept']=pg.evaluate("[HS.stars('pa'),HS.stars('pb')]")
    # deep link refresh + back
    for h in ['#unit-g4scieco-l1','#app-dict','#app-kg','#parent','#shop','#y-g3','#s-g4-sci','#y-g4']:
        pg.goto(U+h); pg.wait_for_timeout(400); out[h]=pg.evaluate("[location.hash, document.title, [...document.querySelectorAll('.screen.on')].map(s=>s.id).join()]")
    pg.goto(U+'#y-g4'); pg.wait_for_timeout(200); pg.click('[data-nav="s-g4-sci"]'); pg.wait_for_timeout(200); pg.click('#appbar .gb-back'); pg.wait_for_timeout(200); out['back from subject']=pg.evaluate("location.hash")
    pg.click('[data-nav="s-g4-sci"]'); pg.wait_for_timeout(200); pg.go_back(); pg.wait_for_timeout(300); out['browser back']=pg.evaluate("location.hash")
    pg.goto(U+'#unit-g4scieco'); pg.wait_for_timeout(300); pg.click('#appbar .gb-back'); pg.wait_for_timeout(300); out['app bar back']=pg.evaluate("location.hash")
    out['errors']=errs
    for k,v in out.items(): print(k,':',v)
    b.close()
