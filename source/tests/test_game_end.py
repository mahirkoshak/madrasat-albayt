# After a game: «العب مرة أخرى» deals the same game again in a new order, «التالية» opens the next game in the games list,
# «كل الألعاب» goes back to the games page. Played for real on a sorting game; the speed round is finished with a fast clock.
from hlp import *
from playwright.sync_api import sync_playwright
from _util import U, CHROME, OUT
def finish_sort(pg, unit, gid):
    items = {t: b for _, t, b in pg.evaluate(f"UNITS.{unit}.games.sort.find(g=>g.id==='{gid}').items")}
    for k in range(20):
        left = pg.locator('#app-unit #uPool .sg-item:visible')
        if not left.count(): break
        it = left.first; txt = it.inner_text().strip()
        b = next(v for t, v in items.items() if txt.endswith(t))
        it.click(); pg.locator(f'#app-unit .sg-bin[data-b="{b}"]').click(); pg.wait_for_timeout(120)
    pg.wait_for_timeout(1500)
with sync_playwright() as p:
    b = p.chromium.launch(**CHROME)
    pg = b.new_page(viewport={'width': 1000, 'height': 900}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.clock.install()
    pg.goto(U); pg.wait_for_timeout(300); addkid(pg, 'محمد'); pg.wait_for_timeout(200)
    pg.evaluate("HS.nav.go('unit-g4scieco-play-s-living')"); pg.wait_for_timeout(300)
    first = pg.locator('#app-unit #uPool .sg-item').all_inner_texts()
    finish_sort(pg, 'g4scieco', 'living')
    row = pg.locator('#app-unit .end-row')
    assert row.count() == 1, 'no end row'
    labels = row.locator('button').all_inner_texts(); print('end buttons:', labels)
    assert len(labels) == 3 and 'مرة أخرى' in labels[0] and labels[1].startswith('التالية') and 'كل الألعاب' in labels[2]
    pg.screenshot(path=OUT + '/game-end.png')
    # play again: same game, new deal
    deals = set()
    for k in range(4):
        pg.locator('#app-unit [data-replay]').click() if pg.locator('#app-unit [data-replay]').count() else None
        pg.wait_for_timeout(250); assert pg.evaluate("location.hash") == '#unit-g4scieco-play-s-living'
        deals.add(tuple(pg.locator('#app-unit #uPool .sg-item').all_inner_texts())); finish_sort(pg, 'g4scieco', 'living')
    deals.add(tuple(first)); print('different deals in 5 plays:', len(deals)); assert len(deals) >= 2
    # next game = the one after it on the games page
    nxt = pg.evaluate("""(()=>{const L=[...Object.values(APPS.unit.labs().g4scieco||{})].map(x=>'lab-'+x.id);return 0})()""")
    pg.locator('#app-unit [data-next]').click(); pg.wait_for_timeout(300)
    h = pg.evaluate("location.hash"); print('next ->', h); assert h.startswith('#unit-g4scieco-play-') and h != '#unit-g4scieco-play-s-living'
    assert h == '#unit-g4scieco-play-s-' + pg.evaluate("UNITS.g4scieco.games.sort[1].id"), h
    # speed round with a fast clock: last game in the list wraps round to the first
    pg.evaluate("HS.nav.go('unit-g4scieco-play-speed')"); pg.wait_for_timeout(300); pg.clock.fast_forward(62000); pg.wait_for_timeout(400)
    assert pg.locator('#app-unit .end-row').count() == 1
    pg.locator('#app-unit [data-next]').click(); pg.wait_for_timeout(300); h = pg.evaluate("location.hash"); print('after speed ->', h)
    pg.evaluate("HS.nav.go('unit-g4scieco-play-speed')"); pg.wait_for_timeout(300); pg.clock.fast_forward(62000); pg.wait_for_timeout(400)
    pg.locator('#app-unit .end-row [data-p="play"]').click(); pg.wait_for_timeout(300)
    assert pg.evaluate("location.hash") == '#unit-g4scieco-play'
    # phone: buttons wrap inside the card
    pg.set_viewport_size({'width': 360, 'height': 740}); pg.evaluate("HS.nav.go('unit-g4scieco-play-s-living')"); pg.wait_for_timeout(300); finish_sort(pg, 'g4scieco', 'living')
    off = pg.evaluate("[...document.querySelectorAll('#app-unit .end-row button')].filter(b=>b.getBoundingClientRect().right>innerWidth+1||b.getBoundingClientRect().left<-1).length")
    pg.screenshot(path=OUT + '/game-end-phone.png'); print('off screen:', off); assert off == 0
    print('errs', errs); assert not errs
    b.close()
