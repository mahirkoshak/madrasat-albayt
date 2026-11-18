from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
R=['home','y-g4','s-g4-sci','unit-g4scieco','unit-g4scieco-l2','unit-g4scieco-play','unit-g3sciearth-play-lab-erosion','unit-g4scieco-test-final','app-kg','app-kg-game-robot','app-dict','parent']
bad=[]
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME)
    for w in [320,390,768,1024,1280]:
        pg=b.new_page(viewport={'width':w,'height':800});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(U);pg.wait_for_timeout(300);addkid(pg,'محمد');pg.wait_for_timeout(200)
        for r in R:
            pg.evaluate(f"HS.nav.go('{r}')");pg.wait_for_timeout(350)
            sw=pg.evaluate('document.documentElement.scrollWidth')
            # elements sticking out of the viewport horizontally
            out=pg.evaluate("""()=>[...document.querySelectorAll('button,a,input,select,.card,svg')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>innerWidth+1||r.left<-1)&&getComputedStyle(e).visibility!=='hidden'&&e.offsetParent}).slice(0,3).map(e=>e.className.baseVal!==undefined?'svg':(e.tagName+'.'+e.className).slice(0,40))""")
            if sw>w or out: bad.append((w,r,sw,out))
            if w in (320,1280) and r in ('unit-g4scieco-l2','home','unit-g3sciearth-play-lab-erosion'): pg.screenshot(path=f'{OUT}/w{w}-{r}.png')
        if errs: bad.append((w,'errors',errs[:2]))
        pg.close()
print('problems:',bad or 'none'); assert not bad
