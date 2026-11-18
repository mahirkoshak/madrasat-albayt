# Onboarding (who sets up), diamonds vs stars, required parent PIN, the lock, focus question, main page, explore,
# happy avatar, and Google sign-in that joins the same family on a second device (Firebase stand-in)
import json
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
store={}; queues={}
MOCK=open(FIX/'fbmock.js').read()
def mk(browser,name,w=400):
    ctx=browser.new_context(viewport={'width':w,'height':860})
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('https://www.gstatic.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=MOCK if 'app-compat' in r.request.url else '/*ok*/'))
    def db(op,path,data):
        if op=='set':
            store[path]=json.loads(data)
            for k,q in queues.items():
                if k!=name: q.append([path,store[path],'modified'])
            return ''
        if op=='del': store.pop(path,None); return ''
        if op=='cas':
            o=json.loads(data); cur=store.get(path); curh=cur['h'] if cur else None
            if o['expect']!='*' and o['expect']!=curh: return 'conflict'
            store[path]=o['d']
            for k,q in queues.items(): q.append([path,store[path],'modified'])
            return 'ok'
        if op=='poll': q=queues[name]; out=json.dumps(q[:]); q.clear(); return out
        if op=='get': return json.dumps(store[path]) if path in store else ''
        if op=='list':
            pre=path+'/'; return json.dumps([[k[len(pre):],v] for k,v in store.items() if k.startswith(pre) and '/' not in k[len(pre):]])
    queues[name]=[]
    pg.expose_function('__db',db)
    pg.goto(U);pg.wait_for_timeout(300); pg._errs=errs; return pg
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME)
    pg=mk(b,'A')
    # 1. first visit asks who is setting up
    print('first screen:',pg.locator('[data-who]').count(),'choices')
    pg.screenshot(path=OUT+'/onb-who.png',full_page=True)
    # 2. a child sets up: name, picture, grade; no focus, flagged for the parent
    pg.click('[data-who=kid]');pg.wait_for_timeout(150)
    print('next disabled without name -> stays:',end=' ');pg.click('#wzNext');pg.wait_for_timeout(100);print(pg.locator('#wzName').count()==1)
    pg.fill('#wzName','محمد');pg.locator('[data-av]').nth(2).click();pg.click('#wzNext');pg.wait_for_timeout(150)
    print('grade next disabled before choosing:',pg.locator('#wzNext').is_disabled())
    pg.click('[data-grade=g4]');pg.screenshot(path=OUT+'/onb-grade.png',full_page=True);pg.click('#wzNext');pg.wait_for_timeout(200)
    pg.screenshot(path=OUT+'/onb-done.png',full_page=True)
    k=pg.evaluate("HS.current()");print('kid:',k['name'],k['grade'],k.get('focus'),'needFocus',k.get('needFocus'))
    assert k['grade']=='g4' and k.get('needFocus')
    pg.click('#wzGo');pg.wait_for_timeout(300)
    # 3. main page: own grade, explore, dictionary with a suggested level, no other grades
    home=pg.evaluate("[!!document.getElementById('pMy'),!!document.querySelector('.p-explore'),!!document.querySelector('.p-lv'),document.querySelectorAll('#portal [data-nav^=\"y-\"]').length]")
    print('home: my grade, explore, dict level, other-grade cards =',home); assert home[:3]==[True,True,True] and home[3]==0
    pg.screenshot(path=OUT+'/onb-home.png',full_page=True)
    # 4. stars: not focus yet -> 10 stars become 1 diamond
    pg.evaluate("location.hash='unit-g4math5'");pg.wait_for_timeout(300)
    pg.evaluate("HS.addStars(7)");print('7 stars ->',pg.evaluate("[HS.diamonds(),HS.toNextDiamond(),HS.yellow()]"))
    pg.evaluate("HS.addStars(5)");r=pg.evaluate("[HS.diamonds(),HS.toNextDiamond(),HS.yellow()]");print('12 stars ->',r); assert r==[1,2,12]
    print('bar shows:',pg.locator('.gb-stars').inner_text().replace('\n',' '))
    # 5. the lock: no PIN yet -> must set one; then the focus question for محمد
    pg.click('#appbar .gb-lock');pg.wait_for_timeout(300)
    print('set-PIN form:',pg.locator('#pinI2').count()==1)
    pg.fill('#pinI','12');pg.fill('#pinI2','12');pg.click('#pinF button[type=submit]');pg.wait_for_timeout(100);print('short PIN refused:',pg.locator('#pinE').inner_text())
    pg.fill('#pinI','2580');pg.fill('#pinI2','2580');pg.click('#pinF button[type=submit]');pg.wait_for_timeout(300)
    print('asked about focus:',pg.locator('[data-f]').count(),'subjects |',pg.locator('#wzT').inner_text())
    pg.screenshot(path=OUT+'/onb-focus.png',full_page=True)
    pg.click('[data-f=math]');pg.click('#wzNext');pg.wait_for_timeout(250)
    k=pg.evaluate("HS.current()");print('focus saved:',k.get('focus'),'needFocus',k.get('needFocus')); assert k['focus']==['math'] and not k.get('needFocus')
    pg.click('#wzGo');pg.wait_for_timeout(300);print('back on parent page:',pg.locator('.pp-focus').count()>0)
    # 6. focus subject earns diamonds directly; other subjects earn stars
    pg.evaluate("location.hash='unit-g4math5-test'");pg.wait_for_timeout(300);before=pg.evaluate("HS.diamonds()")
    pg.evaluate("HS.addStars(2)");print('math (focus) +2 ->',pg.evaluate("HS.diamonds()")-before,'diamonds'); assert pg.evaluate("HS.diamonds()")-before==2
    pg.evaluate("location.hash='unit-g4scieco'");pg.wait_for_timeout(300);d0=pg.evaluate("[HS.diamonds(),HS.yellow()]")
    pg.evaluate("HS.addStars(3)");d1=pg.evaluate("[HS.diamonds(),HS.yellow()]");print('science (not focus) +3 ->',d1[0]-d0[0],'diamonds',d1[1]-d0[1],'stars'); assert d1[0]==d0[0] and d1[1]-d0[1]==3
    # 7. a happy face on correct answers
    pg.evaluate("HS.fx('ok')");pg.wait_for_timeout(100);print('avatar smiles:',pg.evaluate("document.querySelector('.gb-av .hs-av-img').src.includes('happy')"))
    # 8. shop is priced in diamonds; buying spends diamonds
    pg.evaluate("(()=>{const p=HS.profileData();p.dia+=40;HS.save()})()");pg.evaluate("location.hash='shop'");pg.wait_for_timeout(300)
    print('shop balance:',pg.locator('.sh-bal').inner_text())
    d=pg.evaluate("HS.diamonds()");pg.evaluate("HS.buy('r7')");print('bought r7 (25):',d,'->',pg.evaluate("HS.diamonds()"))
    pg.evaluate("location.hash='home'");pg.wait_for_timeout(300);print('lock badge:',pg.locator('.gb-badge').inner_text())
    # 9. a parent sets up a second child (PIN already set: asked to unlock in a new session)
    pg.evaluate("sessionStorage.clear()");addkid(pg,'سارة',who='parent',grade='kg',focus=['letters','numbers'])
    s=pg.evaluate("HS.current()");print('parent-made KG child:',s['grade'],s['focus'],s.get('needFocus'))
    pg.evaluate("location.hash='app-kg-game-count'");pg.wait_for_timeout(400);d=pg.evaluate("HS.diamonds()");pg.evaluate("HS.addStars(1)");print('KG numbers game (focus) ->',pg.evaluate("HS.diamonds()")-d,'diamond')
    pg.evaluate("location.hash='app-kg-game-col'");pg.wait_for_timeout(400);d=pg.evaluate("HS.diamonds()");pg.evaluate("HS.addStars(1)");print('KG colours game (not focus) ->',pg.evaluate("HS.diamonds()")-d,'diamonds')
    pg.evaluate("location.hash='explore'");pg.wait_for_timeout(300);print('explore lists',pg.locator('#portal .p-card').count(),'cards');pg.screenshot(path=OUT+'/onb-explore.png',full_page=True)
    # 10. Google sign-in starts a family; a second device signs in with the same account and gets the children
    unlock(pg);pg.evaluate("location.hash='parent'");pg.wait_for_timeout(400);pg.screenshot(path=OUT+'/onb-parent.png',full_page=True)
    pg.click('#ppSignG');pg.wait_for_timeout(2500)
    print('signed in:',pg.evaluate("HS.sync.account()"),'family',pg.evaluate("HS.sync.family()"),'parents doc',store.get('parents/parent1'))
    B=mk(b,'B',w=1280)
    unlock(B);B.evaluate("location.hash='parent'");B.wait_for_timeout(500);B.click('#ppSignG');B.wait_for_timeout(3000)
    print('device B family',B.evaluate("HS.sync.family()")==pg.evaluate("HS.sync.family()"),'kids',[x['name'] for x in B.evaluate("HS.profiles()")])
    # remote control: B (parent's phone) approves محمد's gift and changes سارة's focus; A sees both
    mid=B.evaluate("HS.profiles().find(x=>x.name==='محمد').id");oid=B.evaluate(f"HS.orders('{mid}').find(o=>o.st==='wait').id")
    B.evaluate(f"HS.settleOrder('{mid}','{oid}','done')");sid=B.evaluate("HS.profiles().find(x=>x.name==='سارة').id")
    B.evaluate(f"HS.updateProfile('{sid}',{{focus:['think']}})");B.wait_for_timeout(3500);pg.wait_for_timeout(1500)
    print('A sees approval:',pg.evaluate(f"HS.orders('{mid}').find(o=>o.id==='{oid}').st"),'| A sees focus:',pg.evaluate(f"HS.profiles().find(x=>x.id==='{sid}').focus"))
    B.screenshot(path=OUT+'/onb-parent-desktop.png',full_page=True)
    print('errs',pg._errs,B._errs); assert not pg._errs and not B._errs
