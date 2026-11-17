def back(pg):
    pg.click('#appbar .gb-back'); pg.wait_for_timeout(150)
def sec(pg, p):
    """open a unit section; leave a focused activity with the header Back first"""
    for _ in range(4):
        if pg.locator('#uTabs').is_visible(): break
        back(pg)
    pg.click(f'#uTabs [data-p={p}]'); pg.wait_for_timeout(150)
def dhome(pg):
    for _ in range(6):
        if pg.evaluate('location.hash') in ('#app-dict', ''): break
        back(pg)
def kglv(pg, g, l):
    """the parent sets the level (children no longer see level buttons); reopen the game"""
    pg.evaluate("([g,l])=>{const h=location.hash.slice(1);APPS.kg.setLevel(HS.current().id,g,l);HS.nav.go('app-kg');HS.nav.go(h)}",[g,l]); pg.wait_for_timeout(250)
def pick(pg):
    """answer a choice question: keep choosing (a wrong first answer gives a hint, not the answer) until it resolves"""
    for _ in range(4):
        if pg.locator('#uNext').count() or not pg.locator('#uQ .opt:not([disabled])').count(): break
        pg.locator('#uQ .opt:not([disabled])').first.click(); pg.wait_for_timeout(60)
