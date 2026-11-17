# every wrong choice in every unit: hints 1 and 2 never contain the right answer
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT, FIX
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME);pg=b.new_page()
    pg.goto(U);pg.wait_for_timeout(300)
    for u in ['g3sciearth','g4scieco','g4scihealth']:
        pg.evaluate(f"HS.nav.go('unit-{u}')");pg.wait_for_timeout(200)
        res=pg.evaluate("""(u)=>{const norm=t=>String(t||'').replace(/[\\u064B-\\u0652\\u0640]/g,'').replace(/\\([^)]*\\)/g,'').replace(/[«»:.،؟?!]/g,'').trim(), bare=t=>norm(t).replace(/^ال/,'');
          let n=0,leak=[],kinds={},generic=[];
          for(const q of UNITS[u].questions){ if(!['mcq','fill','pic','tf'].includes(q.t)) continue;
            const opts=q.t==='tf'?[0,1]:q.o.map((_,i)=>i), a=q.t==='tf'?(q.a?0:1):q.a;
            const right=q.t==='tf'?'':bare(q.t==='pic'&&q.labels?q.labels[q.a]:q.o[q.a]);
            for(const i of opts){ if(i===a) continue;
              for(const k of [1,2]){ const h=APPS.unit.hintFor(q,k,i); n++;
                const kind=h.startsWith('اخترت')?'choice-meaning':h.startsWith('تذكّر')||h.startsWith('تلميح ثانٍ: ')&&!h.includes('أبعدنا')?'term-in-question':'generic'; kinds[kind]=(kinds[kind]||0)+1;
                if(right && norm(h).includes(right)) leak.push([q.id,i,k,h]); if(k===1&&h.startsWith('فكّر مرة ثانية')) generic.push(q.id); } } }
          return {n,leak:leak.slice(0,5),leaks:leak.length,kinds,generic:[...new Set(generic)]};}""",u)
        print(u,res); assert res['leaks']==0, res['leak']; assert not res['generic'], ('questions without written hints', res['generic'])
    b.close()
