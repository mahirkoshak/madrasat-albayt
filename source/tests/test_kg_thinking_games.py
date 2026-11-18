from hlp import *
from playwright.sync_api import sync_playwright
from collections import deque
from _util import U, CHROME, OUT, FIX
D={'u':(0,-1),'d':(0,1),'l':(-1,0),'r':(1,0)}
def path(N,rocks,a,b):
    q=deque([(tuple(a),[])]);seen={tuple(a)}
    while q:
        c,pth=q.popleft()
        if c==tuple(b): return pth
        for k,(dx,dy) in D.items():
            n=(c[0]+dx,c[1]+dy)
            if 0<=n[0]<N and 0<=n[1]<N and f'{n[0]},{n[1]}' not in rocks and n not in seen: seen.add(n);q.append((n,pth+[k]))
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME)
    pg=b.new_page(viewport={'width':400,'height':860})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(400)
    addkid(pg,'سارة');pg.wait_for_timeout(200)
    pg.goto(U+'#app-kg');pg.wait_for_timeout(400)
    pg.screenshot(path=OUT+'/k0.png',full_page=True)
    def lvl(l):
        pg.evaluate("([g,l])=>{APPS.kg.setLevel(HS.profiles()[0].id,g,l);HS.nav.go('app-kg');HS.nav.go('app-kg-game-'+g)}",[G[0],l]);pg.wait_for_timeout(300)
    G=['']
    def tap(sel_a,sel_b): pg.locator(sel_a).first.click();pg.locator(sel_b).first.dispatch_event('click') if False else pg.locator(sel_b).first.click(force=True);pg.wait_for_timeout(60)
    def solve(g,l):
        if g=='puzzle':
            n=pg.locator('.pz-piece').count()
            n=pg.locator('.pz-slot').count()
            if pg.locator('.pz-piece[data-i="x"]').count(): tap('.pz-piece[data-i="x"]','.pz-slot[data-i="0"]')
            for i in range(n): tap(f'.pz-piece[data-i="{i}"]',f'.pz-slot[data-i="{i}"]')
        elif g=='compose':
            for _ in range(10):
                pc=pg.locator('.cp-piece[data-k]:not(.hs-done)')
                if not pc.count(): break
                k=pc.first.get_attribute('data-k'); tap(f'.cp-piece:not(.hs-done)[data-k="{k}"]',f'.cp-slot:not(.done)[data-k="{k}"]')
        elif g=='where':
            if pg.locator('.wt-opt').count():
                for i in range(3):
                    o=pg.locator(f'.wt-opt[data-i="{i}"]')
                    if o.is_enabled(): o.click();pg.wait_for_timeout(100)
                    if pg.locator('.wt-opt.ok').count(): break
            else:
                z=pg.evaluate("document.getElementById('app-kg')._dbg"); tap('.wt-target',f'.wt-zone[data-z="{z}"]')
        elif g=='robot':
            lv=pg.evaluate("(()=>{const l=document.getElementById('app-kg')._dbg;return {N:l.N,a:l.a,b:l.b,st:l.stars,r:[...l.rocks],d:l.d}})()")
            r=set(lv['r']); import itertools
            best=None
            for perm in [lv['st']]:   # stars are taken in order now
                pts=[lv['a'],*perm,lv['b']]; seq=[]
                for x,y in zip(pts,pts[1:]): seq+=path(lv['N'],r,x,y)
                if best is None or len(seq)<len(best): best=seq
            seq=best; assert len(seq)==lv['d'],(len(seq),lv['d'])
            for k in seq: pg.click(f'.rb-k[data-d="{k}"]');pg.wait_for_timeout(80 if l==1 else 30)
            if pg.locator('.rb-k.go').count(): pg.click('.rb-k.go');pg.wait_for_timeout(500*len(seq)+600)
        elif g=='story':
            if pg.locator('.st-slot.q').count():
                for i in range(3):
                    c=pg.locator(f'.st-card[data-i="{i}"]')
                    if c.is_enabled(): c.click();pg.wait_for_timeout(100)
                    if pg.locator('.st-slot.q.filled').count(): break
            else:
                for i in range(6):
                    c=pg.locator(f'.st-card[data-i="{i}"]')
                    if c.count(): c.click();pg.wait_for_timeout(60)
    def done_chk(g,l):
        if g=='puzzle' and l==5: pg.screenshot(path=OUT+'/kp5.png',full_page=True)
    for g in ['puzzle','compose','where','robot','story']:
        pg.click('[data-nav="app-kg"], #k-game .back',timeout=1500) if False else None
        pg.goto('about:blank');pg.goto(U+'#app-kg');pg.wait_for_timeout(300)
        G[0]=g;pg.click(f'[data-game="{g}"]');pg.wait_for_timeout(300)
        for l in range(1,9 if g in ('puzzle','robot') else 6):
            lvl(l); r0=pg.locator('#gDots i.f').count()
            pg.screenshot(path=f'{OUT}/k_{g}{l}.png',full_page=True)
            solve(g,l)
            pg.wait_for_timeout(8000 if g=='story' else 900)
            if done_chk(g,l): pass
            done=pg.locator('#gDots i.f').count()
            w=pg.evaluate('document.documentElement.scrollWidth')
            print(g,l,'solved' if done>r0 else 'NOT SOLVED',done,'w',w); assert done>r0 and w<=400, (g,l)
    # adaptive: robot level 1, solve a full round → level up
    pg.goto('about:blank');pg.goto(U+'#app-kg');pg.wait_for_timeout(300);G[0]='where';pg.click('[data-game="where"]');lvl(1)
    for i in range(5): solve('where',1);pg.wait_for_timeout(2500)
    print('where after round level', pg.evaluate("HS.data('kg').lv.where"))
    print('ERRS',errs[:5])
