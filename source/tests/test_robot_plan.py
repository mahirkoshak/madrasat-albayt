# Plan before moving: x2 loop, step playback, clear, ordered stars, limited commands, accessible names
from hlp import *
from collections import deque
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
D={'u':(0,-1),'d':(0,1),'l':(-1,0),'r':(1,0)}
def path(N,rocks,a,b):
    q=deque([(tuple(a),[])]);seen={tuple(a)}
    while q:
        c,p=q.popleft()
        if c==tuple(b): return p
        for k,(dx,dy) in D.items():
            n=(c[0]+dx,c[1]+dy)
            if 0<=n[0]<N and 0<=n[1]<N and f'{n[0]},{n[1]}' not in rocks and n not in seen: seen.add(n);q.append((n,p+[k]))
def compress(seq):
    out=[];i=0
    while i<len(seq):
        if i+1<len(seq) and seq[i]==seq[i+1]: out.append((seq[i],2));i+=2
        else: out.append((seq[i],1));i+=1
    return out
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(U);pg.wait_for_timeout(300);pg.fill('#pName','سارة');pg.click('[data-av]');pg.click('#pAdd button[type=submit]');pg.wait_for_timeout(200)
    def open_lv(l):
        pg.evaluate(f"APPS.kg.setLevel(HS.current().id,'robot',{l});HS.nav.go('app-kg');HS.nav.go('app-kg-game-robot')");pg.wait_for_timeout(400)
        return pg.evaluate("(()=>{const l=document.getElementById('app-kg')._dbg;return {N:l.N,a:l.a,b:l.b,st:l.stars,r:[...l.rocks],d:l.d,limit:l.limit}})()")
    names=None
    for l in [6,7,8]:
        lv=open_lv(l)
        if names is None: names=pg.locator('#app-kg .rb-k').evaluate_all("b=>b.map(x=>x.getAttribute('aria-label'))")
        pts=[lv['a'],*lv['st'],lv['b']]; seq=[]
        for x,y in zip(pts,pts[1:]): seq+=path(lv['N'],set(lv['r']),x,y)
        cmds=compress(seq)
        # first: add one wrong arrow then clear it all
        pg.click('.rb-k[data-d="u"]');pg.click('.rb-k.clr');assert pg.locator('.rb-prog span').count()==0
        for d,n in cmds:
            pg.click(f'.rb-k[data-d="{d}"]')
            if n==2: pg.click('.rb-k.rep')
        shown=pg.locator('.rb-prog span').count()
        r0=pg.locator('#gDots i.f').count()
        if l==7:   # step through the plan one command at a time
            for _ in cmds: pg.click('.rb-k.stp');pg.wait_for_timeout(1100)
        else: pg.click('.rb-k.go');pg.wait_for_timeout(500*len(seq)+900)
        print('level',l,'moves',len(seq),'commands',len(cmds),'shown',shown,'limit',lv['limit'],'stars',len(lv['st']),'solved',pg.locator('#gDots i.f').count()>r0); assert pg.locator('#gDots i.f').count()>r0, l
    # ordered stars: going to star 2 first does not collect it
    lv=open_lv(7); s1,s2=lv['st']
    for d in path(lv['N'],set(lv['r']),lv['a'],s2): pg.click(f'.rb-k[data-d="{d}"]')
    pg.click('.rb-k.go');pg.wait_for_timeout(500*12)
    print('star 2 before 1 collected:',pg.locator('.rb-star.got').count()); assert pg.locator('.rb-star.got').count()==0
    print('button names',names)
    print('errs',errs); assert not errs
