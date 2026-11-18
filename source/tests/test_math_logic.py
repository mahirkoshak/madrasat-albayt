# Maths: content checks, every typed question answered wrong twice (hints never give the answer) then right,
# the three-in-a-row computer, keyboard input, speed round with typed answers
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
AR='٠١٢٣٤٥٦٧٨٩'
toar=lambda n:''.join(AR[int(d)] for d in str(n))
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:300]));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.goto(U);pg.wait_for_timeout(300);addkid(pg,'محمد');pg.wait_for_timeout(200)
    # A. content
    bad=pg.evaluate("""(()=>{const bad=[];
      for(const u of ['g3math5','g4math5']){const U=UNITS[u],ids=new Set(),L=new Set(U.lessons.map(l=>l.id));
        for(const q of U.questions){
          if(ids.has(q.id))bad.push(u+' dup '+q.id);ids.add(q.id);
          if(!L.has(q.l))bad.push(u+' lesson '+q.id);
          if(q.t==='num'){if(!Number.isInteger(q.a)||q.a<0)bad.push(u+' a '+q.id);if(q.f&&q.f[0]*q.f[1]!==q.a)bad.push(u+' f≠a '+q.id);}
          if(['mcq','fill','pic'].includes(q.t)&&!(q.a>=0&&q.a<q.o.length))bad.push(u+' idx '+q.id);
          if(q.t!=='num'&&!q.ex)bad.push(u+' no ex '+q.id);
          if(q.mis)for(const k in q.mis)if(+k===q.a)bad.push(u+' mis on right '+q.id);
        }
        for(const g of U.games.sort)for(const it of g.items)if(!(it[2]>=0&&it[2]<g.bins.length))bad.push(u+' bin '+g.id);
        for(const l of U.lessons)for(const b of l.blocks)if(b.t==='model'&&!APPS.unit.mathModel(b))bad.push(u+' model '+l.id);
      }return bad})()""")
    print('content problems:',bad); assert not bad
    # sort games: are the bins right? (×3 family, ×9 family, factors of 24, regrouping)
    chk=pg.evaluate("""(()=>{const n=t=>+[...t].map(c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).join('');const bad=[];
      const g3=UNITS.g3math5.games.sort, g4=UNITS.g4math5.games.sort;
      for(const [,t,bin] of g3[0].items){const v=n(t),ok=v%3===0&&v<=30;if(ok!==(bin===0))bad.push('x3 '+t)}
      for(const [,t,bin] of g3[1].items){const v=n(t),ok=v%9===0&&v<=90;if(ok!==(bin===0))bad.push('x9 '+t)}
      for(const [,t,bin] of g4[0].items){const v=n(t);if((24%v===0)!==(bin===0))bad.push('f24 '+t)}
      for(const [,t,bin] of g4[1].items){const [a,b]=t.split(' × ').map(n);if(((b%10)*a>=10)!==(bin===0))bad.push('rg '+t)}
      return bad})()""")
    print('sort bins wrong:',chk); assert not chk
    # B. every typed question: two wrong answers, hints checked, then the right answer
    pg.evaluate("document.body.insertAdjacentHTML('beforeend','<div id=tq style=\"position:fixed;inset:0;background:#fff;z-index:99;overflow:auto\"></div>')")
    leaks=[];n=0
    for u in ['g3math5','g4math5']:
        qs=pg.evaluate(f"UNITS.{u}.questions.filter(q=>q.t==='num').map(q=>q.id)")
        for qid in qs:
            pg.evaluate(f"""window._r=null;const q=UNITS.{u}.questions.find(q=>q.id==='{qid}');document.getElementById('tq').innerHTML='';
              APPS.unit.renderQ('{u}',q,document.getElementById('tq'),(ok,info)=>window._r={{ok,info}})""")
            a=pg.evaluate(f"UNITS.{u}.questions.find(q=>q.id==='{qid}').a")
            for w in [a+1 if a>1 else a+2, a*10+3]:
                for d in str(w): pg.click(f'#tq .m-k[data-k="{d}"]')
                pg.click('#tq .m-k.ok');pg.wait_for_timeout(30)
                c=pg.locator('#tq .coach').inner_text()
                words=[x.strip('.،:؟()!') for x in c.split()]
                qwords=[x.strip('.،:؟()!') for x in pg.evaluate(f"UNITS.{u}.questions.find(q=>q.id==='{qid}').q").split()]
                if (toar(a) in words or str(a) in words) and toar(a) not in qwords: leaks.append((qid,c))   # an answer already in the question (9 × 1) is not a leak
                pg.wait_for_timeout(720)
            for d in str(a): pg.click(f'#tq .m-k[data-k="{d}"]')
            pg.click('#tq .m-k.ok');pg.wait_for_timeout(30)
            r=pg.evaluate('window._r'); assert r and r['info'].get('fixed'),(qid,r); n+=1
    print('typed questions checked:',n,'| hints that showed the answer:',leaks); assert not leaks
    # keyboard: digits typed into the newest keypad only, Arabic digits work, Enter checks
    pg.evaluate("""document.getElementById('tq').innerHTML='<div id=k1></div><div id=k2></div>';window._k=[];
      APPS.unit.renderQ('g3math5',{id:'k1',t:'num',q:'٣ × ٤',a:12,f:[3,4]},document.getElementById('k1'),ok=>_k.push('k1'+ok));
      APPS.unit.renderQ('g3math5',{id:'k2',t:'num',q:'٢ × ٤',a:8,f:[2,4]},document.getElementById('k2'),ok=>_k.push('k2'+ok))""")
    pg.keyboard.insert_text('٨') if False else pg.evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'٨'}))");pg.keyboard.press('Enter');pg.wait_for_timeout(100)
    print('keyboard:',pg.evaluate('_k'),'| old box:',pg.locator('#k1 .m-box-ans').inner_text()); assert pg.evaluate('_k')==['k2true'] and pg.locator('#k1 .m-box-ans').inner_text()=='؟'
    pg.evaluate("document.getElementById('tq').remove()")
    # C. three-in-a-row computer
    t=pg.evaluate("""(()=>{const T=APPS.unit.labs().g3math5.pg.test,o=[];
      o.push('lines '+T.lines.length);
      // win now: computer owns 0,1 (20,36); square 2 is 12 = 3×4 reachable from clips [3,9] by moving 9→4
      let own=Array(25).fill(0);own[0]=2;own[1]=2;let m=T.pick(own,[3,9]);o.push('win '+(m&&m.i));
      // block: child owns 5,6 (54,45); square 7 is 8 = 2×4 from clips [2,9]
      own=Array(25).fill(0);own[5]=1;own[6]=1;m=T.pick(own,[2,9]);o.push('block '+(m&&m.i));
      // nothing reachable covers anything
      own=Array(25).fill(1);m=T.pick(own,[2,3]);o.push('none '+m);
      // every move it picks covers a free square with the right product
      let okAll=true;for(let k=0;k<300;k++){own=Array(25).fill(0).map(()=>Math.random()<.5?1:0);const c=[2+(k%8),2+((k*3)%8)];m=T.pick(own,c);
        if(m&&(own[m.i]||T.board[m.i]!==m.c[0]*m.c[1]||(m.c[0]!==c[0]&&m.c[1]!==c[1])))okAll=false}
      o.push('valid '+okAll);return o})()""")
    print('computer:',t); assert t==['lines 48','win 2','block 7','none null','valid true']
    # D. duplicate product: the child chooses the square
    pg.evaluate("HS.nav.go('unit-g3math5-play-lab-pg')");pg.wait_for_timeout(300)
    def pick_move(clips):
        for a_,b_ in [(3,4),(4,3),(2,6),(6,2)]:   # 12 is on the board twice: 3×4 or 2×6
            if a_ in clips:
                j=1 if clips[0]==clips[1] else 1-clips.index(a_)
                if clips[j]!=b_: return (j,b_)   # a move that changes the clips (not already 12)
    for k in range(20):   # deal again until a move to 12 exists
        clips=[int(''.join(str(AR.index(c)) for c in x.inner_text() if c in AR)) for x in pg.locator('#app-unit .pg-clip').all()]
        mv=pick_move(clips)
        if mv: break
        pg.evaluate("HS.nav.go('unit-g3math5');");pg.evaluate("HS.nav.go('unit-g3math5-play-lab-pg')");pg.wait_for_timeout(200)
    assert mv, clips
    pg.locator('#app-unit .pg-clip').nth(mv[0]).click();pg.locator(f'#app-unit .pg-f[data-f="{mv[1]}"]').click();pg.wait_for_timeout(150)
    for d in '12': pg.locator(f'#app-unit .pg-ask .m-k[data-k="{d}"]').click()
    pg.locator('#app-unit .pg-ask .m-k.ok').click();pg.wait_for_timeout(200)
    picks=pg.locator('#app-unit .pg-c.pick').count();print('squares to choose from:',picks,pg.locator('#app-unit .mg-say').inner_text())
    pg.screenshot(path=OUT+'/math-pg-pick.png',full_page=True)
    assert picks==2
    pg.locator('#app-unit .pg-c.pick').last.click();pg.wait_for_timeout(2200)
    print('after pick: mine',pg.locator('#app-unit .pg-c.o1').count(),'computer',pg.locator('#app-unit .pg-c.o2').count())
    # E. speed round includes typed answers and runs to the end
    pg.evaluate("HS.nav.go('unit-g3math5-play-speed')");pg.wait_for_timeout(300)
    types=set()
    for k in range(30):
        if pg.locator('#app-unit #uQ .m-k[data-k="1"]:not([disabled])').count():
            types.add('num');pg.locator('#app-unit #uQ .m-k[data-k="1"]').click();pg.locator('#app-unit #uQ .m-k.ok').click()
        elif pg.locator('#app-unit #uQ .opt:not([disabled])').count(): types.add('choice');pg.locator('#app-unit #uQ .opt:not([disabled])').first.click()
        pg.wait_for_timeout(400)
        if len(types)==2: break
    assert types=={'num','choice'}
    print('speed round types:',types)
    print('errs',errs); assert not errs
