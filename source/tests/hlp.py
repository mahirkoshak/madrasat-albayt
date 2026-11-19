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
def addkid(pg, name, who='kid', grade='g4', focus=(), pin='2580'):
    """add a child through the setup steps (#setup): who → name and picture → grade (→ focus → PIN for a parent)"""
    if not pg.locator('[data-who]').count():
        if pg.locator('#pNew').count(): pg.click('#pNew')
        else: pg.evaluate("location.hash='setup'")
        pg.wait_for_timeout(200)
    pg.click(f'[data-who={who}]'); pg.wait_for_timeout(150)
    if pg.locator('#pinI').count():   # a parent and a PIN exists: unlock
        pg.fill('#pinI', pin); pg.click('#pinF button[type=submit]'); pg.wait_for_timeout(150)
    pg.fill('#wzName', name); pg.locator('[data-av]').first.click(); pg.click('#wzNext'); pg.wait_for_timeout(120)
    pg.click(f'[data-grade={grade}]'); pg.wait_for_timeout(100); pg.click('#wzNext'); pg.wait_for_timeout(120)
    if who == 'parent':
        for f in focus: pg.click(f'[data-f={f}]'); pg.wait_for_timeout(60)
        pg.click('#wzNext'); pg.wait_for_timeout(120)
        if pg.locator('#wzPin').count():
            pg.fill('#wzPin', pin); pg.fill('#wzPin2', pin); pg.click('#wzNext'); pg.wait_for_timeout(120)
    pg.click('#wzGo'); pg.wait_for_timeout(250)
def unlock(pg, pin='2580'):
    """parent page without typing: set the PIN and mark this browser session as unlocked"""
    pg.evaluate(f"HS.setSetting('pin','{pin}');sessionStorage.setItem('hs-pin','1');sessionStorage.setItem('hs-focus-later','1')")
def ptab(pg, tab):
    """parent page: open a tab: 'shop' (gifts), 'settings', or a child's tab by profile id ('k:<id>')"""
    pg.click(f'[data-ptab="{tab}"]'); pg.wait_for_timeout(200)
