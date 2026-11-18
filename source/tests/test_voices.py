# Voice tools: ElevenLabs in the voice maker and the blind listening test (ElevenLabs, Azure, Hugging Face stand-ins)
import json, os
from playwright.sync_api import sync_playwright
from _util import CHROME, OUT
REPO=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
MP3=open(os.path.join(REPO,'assets','audio',sorted(os.listdir(os.path.join(REPO,'assets','audio')))[0]),'rb').read()
calls=[]
def eleven(route):
    u=route.request.url; calls.append(('el',u.split('?')[0].replace('https://api.elevenlabs.io','')))
    if route.request.headers.get('xi-api-key')!='sk_test': return route.fulfill(status=401,body='{}')
    if '/v1/voices/add/' in u: return route.fulfill(status=200,content_type='application/json',body='{"voice_id":"lib2"}')
    if u.endswith('/v1/voices'): return route.fulfill(status=200,content_type='application/json',body=json.dumps({'voices':[{'voice_id':'my1','name':'صوتي'}]}))
    if '/v1/shared-voices' in u: return route.fulfill(status=200,content_type='application/json',body=json.dumps({'voices':[{'voice_id':'lib2','public_owner_id':'own','name':'Amal','accent':'saudi','gender':'female','preview_url':'https://x/p.mp3'}]}))
    if u.endswith('/v1/models'): return route.fulfill(status=200,content_type='application/json',body=json.dumps([{'model_id':'eleven_multilingual_v2','name':'Multilingual v2','can_do_text_to_speech':True,'languages':[{'language_id':'ar'}]},{'model_id':'eleven_v3','name':'Eleven v3','can_do_text_to_speech':True,'languages':[{'language_id':'ar'}]},{'model_id':'eleven_en','name':'EN','can_do_text_to_speech':True,'languages':[{'language_id':'en'}]}]))
    if '/v1/text-to-speech/' in u:
        b=json.loads(route.request.post_data); calls.append(('tts',b['model_id'],b['text'][:12]))
        return route.fulfill(status=200,content_type='audio/mpeg',body=MP3)
    route.fulfill(status=404,body='')
GRADIO="""export const handle_file=b=>({blob:b});
export const Client={connect:async n=>({predict:async(ep,a)=>{window.__gr=(window.__gr||[]).concat([[n,ep,a.gen_txt_input||a.text]]);if(n.includes('lahgtna'))throw new Error('busy');return {data:[{url:'https://hf.example/out.mp3'}]}}})};"""
with sync_playwright() as p:
    b=p.chromium.launch(**CHROME); errs=[]
    ctx=b.new_context(viewport={'width':900,'height':900}); pg=ctx.new_page(); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('https://api.elevenlabs.io/**',eleven)
    pg.route('https://cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,content_type='application/javascript',body=GRADIO))
    pg.route('https://hf.example/**',lambda r:r.fulfill(status=200,content_type='audio/mpeg',body=MP3))
    def site(route):   # the published site files, as GitHub Pages would serve them
        f=os.path.join(REPO,route.request.url.split('site.test/')[1].split('?')[0])
        ct='text/html' if f.endswith('.html') else 'audio/mpeg' if f.endswith('.mp3') else 'application/octet-stream'
        route.fulfill(status=200,content_type=ct,body=open(f,'rb').read()) if os.path.isfile(f) else route.fulfill(status=404,body='')
    pg.route('https://site.test/**',site)
    # ---- listening test
    pg.goto('https://site.test/voice-test.html');pg.wait_for_timeout(300)
    print('sentences',pg.evaluate("TEST.length"),'with current clip',pg.evaluate("TEST.filter(t=>t.site).length"),'ref',pg.evaluate("!!REF.url"))
    pg.click('#go');pg.wait_for_timeout(200);print('needs eleven key:',pg.inner_text('#msg'))
    pg.fill('#elKey','bad');pg.click('#elLoad');pg.wait_for_timeout(400);print('bad key:',pg.inner_text('#elMsg'))
    pg.fill('#elKey','sk_test');pg.check('#elRemember');pg.click('#elLoad');pg.wait_for_timeout(500);print('loaded:',pg.inner_text('#elMsg'))
    print('model picked:',pg.input_value('#elModel'),'| voices:',pg.evaluate("[...document.querySelectorAll('#elVoice option')].map(o=>o.textContent)"))
    pg.select_option('#elVoice','lib:own:lib2');pg.check('.src[value=lahgtna]')
    pg.click('#go');pg.wait_for_timeout(6000)
    print('prepared:',pg.inner_text('#msg'))
    print('library voice added, then used:',[c for c in calls if c[0]=='el' and 'add' in c[1]], [c for c in calls if c[0]=='tts'][:1])
    print('gradio calls',len(pg.evaluate("window.__gr||[]")),pg.evaluate("(window.__gr||[]).slice(0,1)"))
    n=pg.locator('.q').count();print('questions',n,'samples per q',pg.locator('.q').first.locator('.s').count(),'failed shown',pg.locator('.q').first.locator('.fail').count())
    pg.screenshot(path=OUT+'/voice-test.png',full_page=False)
    # vote: always pick the ElevenLabs sample (find it by data-src) in 5 sentences, Habibi in 2; mark one pronunciation error
    for i in range(7):
        src='eleven' if i<5 else 'habibi'
        pg.locator(f'.q[data-i="{i}"] .s[data-src="{src}"] .pick').click();pg.wait_for_timeout(50)
    pg.locator('.q[data-i="1"] .s[data-src="habibi"] .bad input').check()
    labels=pg.evaluate("[...document.querySelectorAll('.q[data-i=\"0\"] .s')].map(s=>s.querySelector('.lab').textContent+'='+s.dataset.src)");print('blind order q0:',labels)
    pg.click('#reveal');pg.wait_for_timeout(300);print('result:',pg.inner_text('#tally').replace('\n',' | '));print('advice:',pg.inner_text('#advice'))
    pg.screenshot(path=OUT+'/voice-result.png',full_page=False)
    pg.reload();pg.wait_for_timeout(500);print('key remembered after reload:',pg.input_value('#elKey')=='sk_test','votes kept:',len(pg.evaluate("Object.keys(votes)")))
    # ---- voice maker with ElevenLabs
    calls.clear();pg.goto('https://site.test/voice-maker.html');pg.wait_for_timeout(400)
    pg.check('[name=prov][value=eleven]');print('eleven box shown:',pg.is_visible('#elBox'))
    pg.wait_for_timeout(500);pg.select_option('#elVoice','my1')
    pg.click('#elTry');pg.wait_for_timeout(300);print('try:',[c for c in calls if c[0]=='tts'][-1:])
    pg.select_option('#what','ar');pg.check('#onlyNew')
    pg.evaluate("HAVE.clear(); LINES.splice(6)")   # record only a few sentences in the test
    with pg.expect_download(timeout=30000) as d: pg.click('#go')
    z=d.value.path();import zipfile;zf=zipfile.ZipFile(z);names=zf.namelist();info=json.loads(zf.read('voices.json'))
    print('zip',len(names),'files; provider',info['provider'],'voice',info['voices']['ar'],'| msg:',pg.inner_text('#msg'))
    print('errs',errs); assert not errs and info['provider']['ar']=='eleven'
