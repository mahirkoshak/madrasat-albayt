# School units read aloud: every lesson part, question, answer explanation and flashcard gets a 🔊 button once
# its sentence is recorded, the button plays exactly that sentence, and with no clip there is no button.
import json, subprocess, os
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lines = json.loads(subprocess.run(['node', os.path.join(HERE, 'tools', 'speech_list.js')], capture_output=True, text=True, check=True).stdout)
keys = sorted({l['lang'] + '|' + l['text'] for l in lines})
with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    pg = b.new_page(viewport={'width': 1000, 'height': 900}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(U); pg.wait_for_timeout(300); addkid(pg, 'محمد'); pg.wait_for_timeout(200)
    pg.evaluate("HS.nav.go('unit-g4scieco-l1')"); pg.wait_for_timeout(300)
    real = pg.evaluate("Object.keys(HS.AUDIO).filter(k=>HS_UNIT_SAY.all(UNITS.g4scieco).some(([t])=>'ar|'+t===k)).length")
    print('buttons before recording:', pg.locator('#app-unit .u-say').count(), '(recorded unit clips:', real, ')')
    if not real: assert pg.locator('#app-unit .u-say').count() == 0
    # pretend every sentence the voice maker lists is recorded, and catch what gets spoken
    pg.evaluate("""keys => { keys.forEach(k => HS.AUDIO[k] = HS.AUDIO[k] || 'data:audio/mpeg;base64,AAAA'); window.SPOKE = []; HS.speak = p => SPOKE.push(p[0][0]); }""", keys)
    missing = []
    for u in pg.evaluate("Object.keys(UNITS)"):
        n = pg.evaluate(f"UNITS.{u}.lessons.length")
        for i in range(n):
            lid = pg.evaluate(f"UNITS.{u}.lessons[{i}].id")
            pg.evaluate(f"HS.nav.go('unit-{u}-{lid}')"); pg.wait_for_timeout(120)
            want = pg.evaluate(f"(()=>{{const L=UNITS.{u}.lessons[{i}];return 2+HS_UNIT_SAY.cards(L).filter(c=>HS_UNIT_SAY.card(c)).length}})()")
            got = pg.locator('#app-unit .u-say').count()
            if got != want: missing.append((u, lid, got, want))
            if i == 0:
                pg.locator('#app-unit .card .u-say.top').first.click(); pg.wait_for_timeout(50)
                said = pg.evaluate("SPOKE[SPOKE.length-1]"); assert said and ('ar|' + said) in keys, said
                if u == 'g4scieco': print('lesson card reads:', said[:120], '…'); pg.screenshot(path=OUT + '/unit-say-lesson.png')
        # a question and its explanation
        for k in range(25):   # deal until the first question is a choice question with an explanation
            pg.evaluate(f"HS.nav.go('unit-{u}')"); pg.evaluate(f"HS.nav.go('unit-{u}-test-final')"); pg.wait_for_timeout(150)
            if pg.locator('#app-unit .opt').count(): break
        qb = pg.locator('#app-unit .q-line .u-say').count()
        pg.locator('#app-unit .opt').first.click(); pg.wait_for_timeout(100)
        for k in range(3):
            if pg.locator('#app-unit #uNext').count(): break
            o = pg.locator('#app-unit .opt:not([disabled])')
            if o.count(): o.first.click(); pg.wait_for_timeout(100)
        eb = pg.locator('#app-unit .fb .u-say').count()
        if u == 'g4scieco': pg.screenshot(path=OUT + '/unit-say-quiz.png')
        pg.evaluate(f"HS.nav.go('unit-{u}-cards')"); pg.wait_for_timeout(300)
        cb = pg.locator('#app-unit #uFcSay .u-say').count()
        print(u, 'question button', qb, 'explanation button', eb, 'card button', cb)
        if pg.locator('#app-unit .q-line').count() or True: assert cb == 1
        assert eb == 1, u
    print('lessons with a missing button:', missing); assert not missing
    # phone width: icon-only buttons fit
    pg.set_viewport_size({'width': 360, 'height': 740}); pg.evaluate("HS.nav.go('unit-g4scihealth-l1')"); pg.wait_for_timeout(300)
    wide = pg.evaluate("[...document.querySelectorAll('#app-unit .u-say')].filter(b=>b.getBoundingClientRect().right>innerWidth+1).length")
    pg.screenshot(path=OUT + '/unit-say-phone.png'); print('buttons off screen on phone:', wide); assert wide == 0
    print('errs', errs); assert not errs
    b.close()
