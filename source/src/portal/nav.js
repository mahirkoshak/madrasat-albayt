/* ============================================================
   NAVIGATION MODEL: one place that knows where every page sits.
   From CATALOG (grades → subjects → units/apps) and each app's own pages it derives, for any route:
     HS.nav.chain(route)   [{route, title, focus?}] from Home to the page itself
     HS.nav.parent(route)  the logical parent (what "Back" opens), never browser history
     HS.nav.title(route)   page title
     HS.nav.place(route)   { grade, subject, unit, app } of the page
   Routes are the URL hash without '#':
     home · parent · shop · y-<grade> · s-<grade>-<subject> · app-<app>[-<page>] · unit-<unit>[-<page>[-<activity>]]
   An app describes its own pages with APPS.<app>.nav(sub) → [{route, title, focus?}] below its root
   (focus: a game or quiz in progress; the header becomes compact and hides the breadcrumb).
   Counts shown on menu cards (games, lessons) come from the apps' data: HS.nav.count(item).
   ============================================================ */
(function () {
  const HOME = { route: 'home', title: 'الرئيسية' };
  const routeOf = o => o.unit ? 'unit-' + o.unit : o.app ? 'app-' + o.app : null;

  /** catalog path to a grade, subject or unit/app item: [{route, title, item, kind}] (without Home) */
  function catalogPath(test) {
    for (const y of CATALOG) {
      const yr = y.app ? 'app-' + y.app : 'y-' + y.id;
      const yN = { route: yr, title: y.name, item: y, kind: 'grade' };
      if (test(y, yr)) return [yN];
      for (const s of y.subjects || []) {
        const sr = s.app ? 'app-' + s.app : 's-' + y.id + '-' + s.id;
        const sN = { route: sr, title: s.name, item: s, kind: 'subject' };
        if (test(s, sr)) return [yN, sN];
        for (const u of s.units || []) {
          const ur = routeOf(u);
          if (ur && test(u, ur)) return [yN, sN, { route: ur, title: u.name, item: u, kind: 'unit' }];
        }
      }
    }
    return null;
  }

  /** split a route into its base (a catalog route) and the app page below it */
  function parse(route) {
    route = String(route || 'home').replace(/^#/, '');
    let m;
    if ((m = route.match(/^app-([a-z0-9]+)(?:-(.+))?$/i))) return { base: 'app-' + m[1], app: m[1], sub: m[2] || '' };
    if ((m = route.match(/^unit-([a-z0-9]+)(?:-(.+))?$/i))) return { base: 'unit-' + m[1], app: 'unit', unit: m[1], sub: m[2] || '' };
    return { base: route };
  }

  function chain(route) {
    const p = parse(route);
    if (p.base === 'home' || !p.base) return [HOME];
    if (p.base === 'parent') return [HOME, { route: 'parent', title: 'صفحة الأب' }];
    if (p.base === 'shop') return [HOME, { route: 'shop', title: 'متجر النجوم' }];
    const path = catalogPath((o, r) => r === p.base);
    const out = [HOME, ...(path || []).map(({ route, title }) => ({ route, title }))];
    if (!path) {   // not in the menu (e.g. a unit opened by link): still give it a title
      if (p.unit && window.UNITS && UNITS[p.unit]) out.push({ route: p.base, title: UNITS[p.unit].title });
      else return [HOME];
    }
    const app = window.APPS && APPS[p.app];
    if (app && typeof app.nav === 'function') {
      try { out.push(...(app.nav(p.unit ? p.unit + (p.sub ? '-' + p.sub : '') : p.sub) || [])); } catch (e) {}
    }
    return out;
  }
  const last = a => a[a.length - 1];

  HS.nav = {
    chain,
    parse,
    parent: route => { const c = chain(route); return c.length > 1 ? c[c.length - 2].route : null; },
    title: route => last(chain(route)).title,
    focus: route => !!last(chain(route)).focus,
    /** grade / subject / unit of a page, from the catalog */
    place(route) {
      const p = parse(route), path = catalogPath((o, r) => r === p.base) || [];
      const pick = k => (path.find(x => x.kind === k) || {}).item || null;
      return { grade: pick('grade'), subject: pick('subject'), unit: pick('unit'), app: p.app || null };
    },
    /** open a route. replace: change the address without a new history entry (redirects) */
    go(route, replace) {
      const h = '#' + String(route).replace(/^#/, '');
      if (replace) { try { history.replaceState(null, '', h); } catch (e) {} window.dispatchEvent(new HashChangeEvent('hashchange')); }
      else if (location.hash === h) window.dispatchEvent(new HashChangeEvent('hashchange'));
      else location.hash = h;
    },
    /** what a menu card says about its contents, counted from the data (never typed by hand) */
    count(item) {
      if (item.unit && window.UNITS && UNITS[item.unit]) {
        const u = UNITS[item.unit], g = u.games || {};
        const games = (g.sort || []).length + (g.order || []).length + (u.lessons.length ? 1 : 0) + 1 + ((window.APPS && APPS.unit && APPS.unit.labCount) ? APPS.unit.labCount(u.id) : 0);
        return { lessons: u.lessons.length, games, questions: u.questions.length };
      }
      if (item.app && window.APPS && APPS[item.app] && typeof APPS[item.app].counts === 'function') return APPS[item.app].counts();
      return null;
    },
    /** the line under a menu card: topic text from the catalog + counts from the data, never typed by hand */
    desc(item) {
      const c = this.count(item); if (!c) return item.desc || item.sub || '';
      if (item.unit) { const u = UNITS[item.unit];
        return [HS.count(c.lessons, HS.N.lesson), HS.count(u.glossary.length, HS.N.term), HS.count(c.games, HS.N.game), HS.count(c.questions, HS.N.q)].join(' · '); }
      return [item.desc, HS.count(c.games, HS.N.game)].filter(Boolean).join(' · ');
    },
    routeOf,
  };
})();
