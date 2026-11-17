import json
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
store={}; pages=[]; queues={}
MOCK=open(FIX/'fbmock.js').read()
def mk(browser,name):
    ctx=browser.new_context(viewport={'width':400,'height':860})
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('https://www.gstatic.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=MOCK if 'app-compat' in r.request.url else '/*ok*/'))
    def db(op,path,data):
        if op=='set':
            store[path]=json.loads(data)
            for k,q in queues.items():
                if k!=name: q.append([path,store[path],'modified'])
            return ''
        if op=='del':
            store.pop(path,None)
            for k,q in queues.items():
                if k!=name: q.append([path,None,'removed'])
            return ''
        if op=='cas':
            o=json.loads(data); cur=store.get(path); curh=cur['h'] if cur else None
            if o['expect']!='*' and o['expect']!=curh: return 'conflict'
            store[path]=o['d']
            for k,q in queues.items(): q.append([path,store[path],'modified'])
            return 'ok'
        if op=='poll':
            q=queues[name][:]; queues[name].clear(); return json.dumps(q)
        if op=='get': return json.dumps(store[path]) if path in store else ''
        if op=='list':
            pre=path+'/'; return json.dumps([[k[len(pre):],v] for k,v in store.items() if k.startswith(pre) and '/' not in k[len(pre):]])
    queues[name]=[]
    pg.expose_function('__db',db)
    pg.goto(U);pg.wait_for_timeout(300); pages.append(pg); pg._errs=errs; return pg
def addkid(pg,name,av):
    if pg.locator('#pNew').count(): pg.click('#pNew')
    pg.fill('#pName',name);pg.click(f'[data-av]');pg.click('#pAdd button[type=submit]');pg.wait_for_timeout(200)
def stars(pg,name): return pg.evaluate("n=>{const p=HS.profiles().find(x=>x.name===n);return p?[HS.earned(p.id),HS.stars(p.id)]:null}",name)
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME)
    A=mk(b,'A'); B=mk(b,'B')
    # each iPad already has its own local kids & stars
    addkid(A,'محمد','🦁'); A.evaluate("HS.addStars(30)"); addkid(A,'سارة','🦄'); A.evaluate("HS.addStars(12)")
    addkid(B,'محمد','🦁'); B.evaluate("HS.addStars(5)")
    A.wait_for_timeout(200);B.wait_for_timeout(200)
    # A creates family
    A.goto(U+'#parent');A.wait_for_timeout(300);A.click('#ppSyncNew');A.wait_for_timeout(1200)
    code=A.evaluate("HS.sync.family()");print('code',code,'status',A.evaluate("HS.sync.status()"),'docs',sorted(store))
    A.screenshot(path=OUT+'/sync_parent.png',full_page=True)
    # B joins via link
    queues['B'].clear()
    B.goto('about:blank');B.goto(U+'#join-'+code);B.wait_for_timeout(1800)
    print('B kids',[x['name'] for x in B.evaluate("HS.profiles()")],'B محمد',stars(B,'محمد'),'B سارة',stars(B,'سارة'))
    A.wait_for_timeout(1800)
    print('A محمد',stars(A,'محمد'),'A kids',len(A.evaluate("HS.profiles()")))
    # live: B earns stars for سارة, A sees
    B.evaluate("(()=>{const s=HS.profiles().find(x=>x.name==='سارة');HS.setCurrent(s.id);HS.addStars(7)})()");B.wait_for_timeout(2200)
    print('A sees سارة',stars(A,'سارة'))
    # concurrent: both add stars to محمد before syncing
    A.evaluate("(()=>{const s=HS.profiles().find(x=>x.name==='محمد');HS.setCurrent(s.id);HS.addStars(3)})()")
    B.evaluate("(()=>{const s=HS.profiles().find(x=>x.name==='محمد');HS.setCurrent(s.id);HS.addStars(4)})()")
    A.wait_for_timeout(3500);B.wait_for_timeout(3500)
    A.wait_for_timeout(2000)
    print('after concurrent محمد A',stars(A,'محمد'),'B',stars(B,'محمد'),'online',json.loads(store['families/'+code+'/kids/'+A.evaluate("HS.profiles().find(x=>x.name==='محمد').id")]['d'])['stars'])
    # shop: B buys, A parent approves
    B.evaluate("HS.buy('r7')");B.wait_for_timeout(2500)
    print('A sees coupon',A.evaluate("HS.waitingCount()"))
    # settings shared, sound not
    A.evaluate("HS.setSetting('kgMinutes',20);HS.setSetting('sound',false)");A.wait_for_timeout(2500)
    print('B kgMinutes',B.evaluate("HS.settings().kgMinutes"),'B sound',B.evaluate("HS.settings().sound"))
    # dictionary progress syncs
    A.evaluate("(()=>{HS.srs.record('dict','apple|food',true);HS.save()})()");A.wait_for_timeout(2500)
    print('B dict apple box',B.evaluate("HS.srs.box('dict','apple|food')"))
    # delete kid on A
    A.evaluate("(()=>{const s=HS.profiles().find(x=>x.name==='سارة');HS.removeProfile(s.id)})()");A.wait_for_timeout(2500)
    print('B kids after delete',[x['name'] for x in B.evaluate("HS.profiles()")])
    B.goto('about:blank');B.goto(U+'#parent');B.wait_for_timeout(1500);print('B status',B.evaluate("HS.sync.status()"))
    print('errs',A._errs,B._errs)
