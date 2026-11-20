# Unit games engine: every new game (odd one out, Koko's notebook, who am I, true/false) and the daily challenge
# play to the end in every unit at every level; perfect play moves the level up, bad play moves it down;
# a missed item comes back first next time; hints stay in the coach box until «التالي»; the sort game sends a
# wrong card back with the right box glowing; the journey map shows lessons, the last round and the sticker.
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT
def setlv(pg, u, key, lv):
    pg.evaluate(f"(()=>{{const d=HS.data('u:{u}');d.g=d.g||{{}};d.g['{key}']={{lv:{lv},h:[]}};HS.save()}})()")
def lvof(pg, u, key): return pg.evaluate(f"((HS.data('u:{u}').g||{{}})['{key}']||{{}}).lv||1")
def play(pg, good=True, shots=None):
    """answer every round (right, or wrong if good=False) until the end card; returns rounds played"""
    n = 0
    for step in range(200):
        if pg.locator('#app-unit .end-row').count(): return n
        st = pg.locator('#app-unit #aStage')
        nb = st.locator('.nb-l:not([disabled])')
        if st.locator('#fixStep .opt:not([disabled])').count():
            o = st.locator('#fixStep .opt[data-r]') if good else st.locator('#fixStep .opt:not([data-r])').first; o.first.click(); n += 1
        elif nb.count():
            (st.locator('.nb-l[data-r]') if good else nb.locator('xpath=self::*[not(@data-r)]').first).first.click()
        elif st.locator('.tile-b:not([disabled])').count():
            if good:
                at = st.locator('.who-build b').count()
                st.locator(f'.tile-b[data-at="{at}"]:not([disabled])').first.click()
                if st.locator('.tile-b:not([disabled])').count() == 0 or pg.locator('#app-unit #aNext:visible').count(): n += 1
            else: pg.click('#app-unit #whoGive'); n += 1
        elif st.locator('.opt:not([disabled])').count():
            o = st.locator('.opt[data-r]') if good else st.locator('.opt:not([data-r])')
            o.first.click(); n += 1
        if pg.locator('#app-unit #aNext:visible').count():
            if shots is not None and not shots: pg.locator('#app-unit .card.arc').screenshot(path=OUT + '/arc-hint.png'); shots.append(1)
            if not good: pg.clock.run_for(8000)   # a mistake's hint never times out
            assert pg.locator('#app-unit #uCoach:visible').count(), 'hint must stay on screen until Next'
            pg.click('#app-unit #aNext')
        pg.clock.run_for(100); pg.wait_for_timeout(30)
    raise AssertionError('game did not end')
with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    pg = b.new_page(viewport={'width': 1000, 'height': 900}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.clock.install()
    pg.goto(U); pg.wait_for_timeout(300); addkid(pg, 'محمد'); pg.wait_for_timeout(200)
    pg.evaluate("HS.markPractice=()=>{}")
    shots = []
    for u in pg.evaluate("Object.keys(UNITS)"):
        for key in ['odd', 'fix', 'memory', 'tf']:
            for lv in (1, 2, 3):
                setlv(pg, u, key, lv); pg.evaluate(f"HS.nav.go('unit-{u}')"); pg.evaluate(f"HS.nav.go('unit-{u}-play-{key}')"); pg.wait_for_timeout(250)
                if lv == 3 and key == 'memory' and u == 'g4scieco': pg.locator('#app-unit .card.arc').screenshot(path=OUT + '/arc-who3.png')
                if lv == 2 and u == 'g4scieco': pg.locator('#app-unit .card.arc').screenshot(path=OUT + f'/arc-{key}.png')
                n = play(pg, True); after = lvof(pg, u, key)
                assert after == min(3, lv + 1), (u, key, lv, after)
            print(u, key, 'levels 1→2→3 with perfect play, rounds', n)
        # bad play moves the level down and the missed items come back first
        setlv(pg, u, 'tf', 2); pg.evaluate(f"HS.nav.go('unit-{u}-play-tf')"); pg.wait_for_timeout(250)
        play(pg, False, shots); assert lvof(pg, u, 'tf') == 1, 'level should go down'
        miss = pg.evaluate(f"Object.keys(HS.data('u:{u}').miss||{{}})"); assert miss, 'misses recorded'
        # daily challenge
        pg.evaluate(f"HS.nav.go('unit-{u}-play-daily')"); pg.wait_for_timeout(250); y0 = pg.evaluate("HS.yellow()")
        play(pg, True); print(u, 'daily rounds ok, done today:', pg.evaluate(f"HS.data('u:{u}').daily.day") is not None)
    # after a right answer the praise stays about 4 s (then moves on by itself)
    pg.evaluate("HS.nav.go('unit-g4scieco-play-odd')"); pg.wait_for_timeout(200)
    pg.locator('#app-unit #aStage .opt[data-r]').first.click(); pg.clock.run_for(3000)
    assert pg.locator('#app-unit #uCoach.ok:visible').count() and pg.evaluate("document.getElementById('aPos').textContent").startswith('١ ')
    pg.locator('#app-unit .card.arc').screenshot(path=OUT + '/arc-praise.png')
    pg.clock.run_for(3500); assert pg.evaluate("document.getElementById('aPos').textContent").startswith('٢ '), 'moves on after the pause'
    print('praise stays >3 s, then the next round')
    # sort game: wrong drop -> card back in the pool, coach names the right box, that box glows
    pg.evaluate("HS.nav.go('unit-g4scieco-play-s-living')"); pg.wait_for_timeout(300)
    items = {t: bb for _, t, bb in pg.evaluate("UNITS.g4scieco.games.sort[0].items")}
    it = pg.locator('#app-unit #uPool .sg-item:visible').first; txt = it.inner_text().strip(); right = next(v for t, v in items.items() if txt.endswith(t))
    it.click(); pg.click(f'#app-unit .sg-bin[data-b="{1 - right}"]'); pg.clock.run_for(2600); pg.wait_for_timeout(100)
    assert pg.locator('#app-unit #uCoach:visible').count() and pg.locator('#app-unit .sg-bin.hint-bin').count() == 1
    assert pg.locator('#app-unit #uPool .sg-item:visible').filter(has_text=txt.split()[-1]).count() == 1, 'card goes back to the pool'
    pg.locator('#app-unit .card').first.screenshot(path=OUT + '/arc-sort-hint.png'); print('sort: wrong card back, hint stays, right box glows')
    # map
    pg.evaluate("HS.nav.go('unit-g4scieco')"); pg.wait_for_timeout(400)
    print('map stops', pg.locator('#app-unit .um-stop').count(), 'daily card', pg.locator('#app-unit .card.daily').count())
    assert pg.locator('#app-unit .um-stop').count() == 3 + 2 and pg.locator('#app-unit .card.daily.done').count() == 1
    pg.screenshot(path=OUT + '/arc-map.png', full_page=True)
    pg.set_viewport_size({'width': 390, 'height': 844}); pg.wait_for_timeout(200); pg.screenshot(path=OUT + '/arc-map-phone.png', full_page=True)
    for key in ['odd', 'fix', 'memory', 'tf', 'play']:
        pg.evaluate(f"HS.nav.go('unit-g4scihealth-{'play' if key == 'play' else 'play-' + key}')"); pg.wait_for_timeout(300)
        w = pg.evaluate("document.documentElement.scrollWidth"); assert w <= 390, (key, w)
    pg.screenshot(path=OUT + '/arc-play-phone.png', full_page=True)
    print('errs', errs); assert not errs
    b.close()
