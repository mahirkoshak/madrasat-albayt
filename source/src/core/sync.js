/* ============================================================
   ONLINE SYNC (Firebase) – the same children, stars and progress on every device of a family.
   - A family has a secret code (12 letters). Each device joins it once (parent page, or a #join-CODE link).
   - The device keeps working offline from localStorage; sync runs in the background when online.
   - Firestore layout:  families/{code}              { d: JSON(profiles + shared settings), t, h }
                        families/{code}/kids/{id}     { d: JSON(that child's progress), t, h }
     One document per child, so two children playing on two iPads never overwrite each other.
   - If the same child changed on two devices at once, the changes are MERGED (three-way, against the last
     synced copy): stars add up, days and coupons are combined, spaced-repetition cards keep the newest review.
   - Device-only settings (sound, mute, which Arabic voice, interface language) are not shared.
   Needs window.HS_FIREBASE (firebase-config.js). Without it, nothing here runs.
   ============================================================ */
(function () {
  const CFG = window.HS_FIREBASE, HS = window.HS;
  const FKEY = 'hs-family', MKEY = 'hs-sync-meta';
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const LOCAL_ONLY = ['sound', 'arVoice', 'mute', 'lang'];
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} } };
  let fam = ls.get(FKEY), meta = {}, db = null, famRef = null, unsub = [], status = 'off', lastSync = 0, pushT = null, starting = null;
  try { meta = JSON.parse(ls.get(MKEY) || '{}'); } catch (e) { meta = {}; }
  meta.kids = meta.kids || {};
  const saveMeta = () => ls.set(MKEY, JSON.stringify(meta));
  const setStatus = s => { status = s; HS._emit('sync', s); };
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + ':' + s.length; };
  const clone = o => o == null ? o : JSON.parse(JSON.stringify(o));

  /* ---------- the pieces that sync ---------- */
  const S = () => HS._state();
  function famPiece() {
    const st = S(), settings = {};
    Object.keys(st.settings).forEach(k => { if (!LOCAL_ONLY.includes(k)) settings[k] = st.settings[k]; });
    return { profiles: st.profiles, settings };
  }
  const kidJson = pid => JSON.stringify(S().p[pid]);
  function applyFam(piece) {
    const st = S();
    st.profiles = piece.profiles || [];
    Object.keys(piece.settings || {}).forEach(k => { if (!LOCAL_ONLY.includes(k)) st.settings[k] = piece.settings[k]; });
    if (st.current && !st.profiles.some(p => p.id === st.current)) st.current = st.profiles[0] ? st.profiles[0].id : null;
  }

  /* ---------- merging two versions of the same thing ----------
     base = the version both devices last agreed on (undefined on a first join) */
  const isCard = o => o && typeof o === 'object' && typeof o.t === 'number' && 'b' in o;   // spaced-repetition card
  function merge(base, a, b, key) {
    if (JSON.stringify(a) === JSON.stringify(b)) return clone(a);
    if (a === undefined) return clone(b);
    if (b === undefined) return clone(a);
    if (typeof a === 'number' && typeof b === 'number') {
      if (typeof base === 'number') return b + (a - base);                  // both changes count (e.g. stars from two devices)
      return ['stars', 'spent', 'dia', 'diaSpent'].includes(key) ? a + b : Math.max(a, b);   // first join: separate histories add up
    }
    if (typeof a === 'boolean' && typeof b === 'boolean') return a || b;
    if (Array.isArray(a) && Array.isArray(b)) {
      const objs = a.concat(b).every(x => x && typeof x === 'object' && 'id' in x);
      if (objs) {   // e.g. shop coupons: one list, each coupon merged; a settled coupon beats a waiting one
        const byId = new Map(); b.forEach(x => byId.set(x.id, clone(x)));
        a.forEach(x => { const y = byId.get(x.id); if (!y) byId.set(x.id, clone(x)); else if (y.st === 'wait' && x.st && x.st !== 'wait') byId.set(x.id, clone(x)); });
        return [...byId.values()].sort((p, q) => (p.t || 0) - (q.t || 0));
      }
      const out = b.slice(); a.forEach(x => { if (!out.some(y => JSON.stringify(y) === JSON.stringify(x))) out.push(x); });   // e.g. practice days, my words
      return out;
    }
    if (isCard(a) && isCard(b)) return clone(a.t >= b.t ? a : b);             // the most recent review wins
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const out = {};
      new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => { out[k] = merge(base && typeof base === 'object' ? base[k] : undefined, a[k], b[k], k); });
      return out;
    }
    if (base !== undefined && JSON.stringify(a) === JSON.stringify(base)) return clone(b);   // only the other side changed
    if (base !== undefined && JSON.stringify(b) === JSON.stringify(base)) return clone(a);
    return clone(b);   // both changed a plain value: the online copy wins
  }

  /* ---------- Firebase ---------- */
  const loadScript = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  async function connect() {
    if (db) return;
    if (!window.firebase || !window.firebase.firestore) {
      await loadScript(SDK + 'firebase-app-compat.js');
      await loadScript(SDK + 'firebase-auth-compat.js');
      await loadScript(SDK + 'firebase-firestore-compat.js');
    }
    if (!firebase.apps.length) firebase.initializeApp(CFG);
    const auth = firebase.auth();
    // a parent who signed in with Google or Apple stays signed in on this device; otherwise an anonymous session
    await new Promise(ok => {   // wait until Firebase knows whether someone is already signed in here
      let done = false, un = null; const end = () => { if (done) return; done = true; if (typeof un === 'function') setTimeout(un, 0); ok(); };
      if (!auth.onAuthStateChanged) return ok();
      un = auth.onAuthStateChanged(end); setTimeout(end, 4000);
    });
    if (!auth.currentUser) await auth.signInAnonymously();
    db = firebase.firestore();
  }
  /* ---------- parent account (Google / Apple) ----------
     parents/{uid} = { fam }: the family this parent belongs to. Signing in on any device joins that family,
     so the children, diamonds and progress appear there, and the parent can approve gifts and change focus
     subjects from their own phone. Rules: a parent can only read and write their own parents/{uid}. */
  const account = () => { try { const u = firebase.auth().currentUser; return u && !u.isAnonymous ? u : null; } catch (e) { return null; } };
  async function signIn(kind) {
    if (!CFG) throw new Error('off');
    await connect();
    const auth = firebase.auth();
    const prov = kind === 'apple' ? new firebase.auth.OAuthProvider('apple.com') : new firebase.auth.GoogleAuthProvider();
    if (kind === 'apple') { prov.addScope('email'); prov.addScope('name'); }
    let cred;
    try { cred = await auth.signInWithPopup(prov); }
    catch (e) { if (e && /popup-blocked|operation-not-supported/.test(e.code || '')) { try { sessionStorage.setItem('hs-signin', '1'); } catch (x) {} await auth.signInWithRedirect(prov); return null; } throw e; }
    return afterSignIn(cred && cred.user);
  }
  async function afterSignIn(user) {
    if (!user || user.isAnonymous) return null;
    const ref = db.collection('parents').doc(user.uid), snap = await ref.get(), have = snap.exists && snap.data().fam;
    if (have && have !== fam) { fam = have; ls.set(FKEY, fam); meta = { kids: {} }; saveMeta(); await start(false); }   // this parent's family: join it
    else if (!have) {
      if (!fam) { fam = newCode(); ls.set(FKEY, fam); await start(true); }                                            // first time: start a family
      else if (!famRef) await start();
      await ref.set({ fam, t: Date.now() });
    } else if (!famRef) await start();
    HS._emit('sync', status); return user;
  }
  // a redirect sign-in (used when a popup is blocked) finishes here when the page comes back
  async function finishRedirect() {
    try { await connect(); const r = firebase.auth().getRedirectResult ? await firebase.auth().getRedirectResult() : null; if (r && r.user) await afterSignIn(r.user); } catch (e) { console.warn('sign-in', e); }
  }
  const kidsRef = () => famRef.collection('kids');
  const wrap = json => ({ d: json, h: hash(json), t: Date.now() });

  /** Save one document safely: read what is online now; if another device changed it since we last synced,
      merge both changes first, then write (a transaction, so two devices can't overwrite each other). */
  async function pushDoc(ref, json, m, mergeFn) {
    const h = hash(json);
    if (m && m.h === h) return null;
    let out = null;
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      let final = json;
      if (snap.exists && (!m || snap.data().h !== m.h)) {
        const r = snap.data();
        if (r.h !== h) final = JSON.stringify(mergeFn(m ? JSON.parse(m.base) : undefined, JSON.parse(json), JSON.parse(r.d)));
      }
      const w = wrap(final); tx.set(ref, w); out = { final, h: w.h, t: w.t, merged: final !== json };
    });
    return out;
  }
  async function pushFam() {
    const r = await pushDoc(famRef, JSON.stringify(famPiece()), meta.fam, mergeFam);
    if (!r) return;
    meta.fam = { h: r.h, base: r.final, t: r.t }; saveMeta();
    if (r.merged) { applyFam(JSON.parse(r.final)); changed(); }
  }
  async function pushKid(pid) {
    if (!S().p[pid]) return;
    const r = await pushDoc(kidsRef().doc(pid), kidJson(pid), meta.kids[pid], merge);
    if (!r) return;
    meta.kids[pid] = { h: r.h, base: r.final, t: r.t }; saveMeta();
    if (r.merged) { S().p[pid] = JSON.parse(r.final); changed(); }
  }
  async function pushAll() {
    if (!famRef) return;
    try {
      await pushFam();
      const st = S(), live = new Set(st.profiles.map(p => p.id).concat(st.p.guest ? ['guest'] : []));
      for (const pid of Object.keys(st.p)) if (live.has(pid)) await pushKid(pid);
      for (const pid of Object.keys(meta.kids)) if (!live.has(pid)) { await kidsRef().doc(pid).delete().catch(() => {}); delete meta.kids[pid]; saveMeta(); }   // a deleted child
      lastSync = Date.now(); setStatus('on');
    } catch (e) { setStatus(navigator.onLine ? 'error' : 'offline'); }
  }
  const changed = () => { HS._persist(); HS._emit('profile'); HS._emit('stars'); HS._emit('synced'); };

  /* a newer online copy arrived: take it, or merge it with local changes that were not sent yet */
  function onFam(doc) {
    if (!doc.exists || doc.metadata.hasPendingWrites) return;
    const r = doc.data(), local = JSON.stringify(famPiece());
    if (meta.fam && r.h === meta.fam.h) return;
    const base = meta.fam ? JSON.parse(meta.fam.base) : undefined, remote = JSON.parse(r.d);
    const localChanged = !meta.fam || hash(local) !== meta.fam.h;
    const next = localChanged ? mergeFam(base, JSON.parse(local), remote) : remote;
    applyFam(next); meta.fam = { h: r.h, base: r.d, t: r.t }; saveMeta();
    changed(); if (localChanged) schedulePush(); else { lastSync = Date.now(); setStatus('on'); }
  }
  function mergeFam(base, a, b) {
    const out = { settings: merge(base && base.settings, a.settings, b.settings), profiles: b.profiles.slice() };
    const removed = new Set(((base && base.profiles) || []).filter(p => !a.profiles.some(x => x.id === p.id)).map(p => p.id));   // deleted here
    a.profiles.forEach(p => { if (!out.profiles.some(x => x.id === p.id)) out.profiles.push(p); });
    out.profiles = out.profiles.filter(p => !removed.has(p.id));
    return out;
  }
  function onKids(snap) {
    let any = false;
    snap.docChanges().forEach(ch => {
      const pid = ch.doc.id, st = S();
      if (ch.type === 'removed') { if (st.p[pid] && !st.profiles.some(p => p.id === pid)) { delete st.p[pid]; any = true; } delete meta.kids[pid]; return; }
      if (ch.doc.metadata.hasPendingWrites) return;
      const r = ch.doc.data(), m = meta.kids[pid];
      if (m && m.h === r.h) return;
      const localJson = st.p[pid] ? kidJson(pid) : null;
      if (localJson && hash(localJson) === r.h) { meta.kids[pid] = { h: r.h, base: r.d, t: r.t }; return; }
      const localChanged = localJson && (!m || hash(localJson) !== m.h);
      st.p[pid] = localChanged ? merge(m ? JSON.parse(m.base) : undefined, JSON.parse(localJson), JSON.parse(r.d)) : JSON.parse(r.d);
      meta.kids[pid] = { h: r.h, base: r.d, t: r.t };
      any = true; if (localChanged) schedulePush();
    });
    saveMeta();
    if (any) changed();
    lastSync = Date.now(); if (status !== 'error') setStatus('on');
  }

  /* first connection of this device to a family that already has data: children with the same name become one */
  async function firstJoin() {
    const [fd, kids] = await Promise.all([famRef.get(), kidsRef().get()]);
    if (!fd.exists) return pushAll();   // a brand-new family: this device's data starts it
    const st = S(), remote = JSON.parse(fd.data().d), map = {};
    st.profiles.forEach(lp => {
      const twin = remote.profiles.find(rp => rp.id === lp.id) || remote.profiles.find(rp => rp.name.trim() === lp.name.trim());
      if (twin) map[lp.id] = twin.id; else remote.profiles.push(lp);
    });
    const remoteKids = {}; kids.forEach(d => { remoteKids[d.id] = d.data(); });
    const p = {};
    Object.keys(remoteKids).forEach(pid => { p[pid] = JSON.parse(remoteKids[pid].d); });
    Object.keys(st.p).forEach(lid => {
      const rid = map[lid] || (lid === 'guest' ? 'guest' : lid);
      p[rid] = p[rid] ? merge(undefined, st.p[lid], p[rid]) : st.p[lid];
    });
    if (st.current && map[st.current]) st.current = map[st.current];
    st.p = p;
    applyFam({ profiles: remote.profiles, settings: merge(undefined, famPiece().settings, remote.settings) });
    meta.fam = { h: fd.data().h, base: fd.data().d, t: fd.data().t };
    Object.keys(remoteKids).forEach(pid => { meta.kids[pid] = { h: remoteKids[pid].h, base: remoteKids[pid].d, t: remoteKids[pid].t }; });
    saveMeta(); changed();
    await pushAll();
  }

  async function start(isNew) {
    if (!CFG || !fam) return;
    if (starting) return starting;
    setStatus('connecting');
    starting = (async () => {
      try {
        await connect();
        famRef = db.collection('families').doc(fam);
        if (!meta.joined || meta.joined !== fam) { meta = { kids: {}, joined: fam }; saveMeta(); if (isNew) await pushAll(); else await firstJoin(); }
        else await pushAll();
        unsub.forEach(u => u()); unsub = [famRef.onSnapshot({ includeMetadataChanges: false }, onFam, () => setStatus('error')),
          kidsRef().onSnapshot(onKids, () => setStatus('error'))];
      } catch (e) { setStatus(navigator.onLine ? 'error' : 'offline'); console.warn('sync', e); }
      starting = null;
    })();
    return starting;
  }
  function schedulePush(now) {
    if (!famRef) return;
    clearTimeout(pushT);
    pushT = setTimeout(pushAll, now ? 0 : 1500);
  }
  HS.onSaved = now => { if (fam) { if (famRef) schedulePush(now); else if (!starting) start(); } };
  addEventListener('online', () => { if (fam) famRef ? pushAll() : start(); });
  addEventListener('offline', () => { if (fam) setStatus('offline'); });

  /* ---------- public ---------- */
  const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const newCode = () => { const a = new Uint32Array(12); crypto.getRandomValues(a); return [...a].map(x => ABC[x % ABC.length]).join(''); };
  const clean = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  HS.sync = {
    available: () => !!CFG,
    family: () => fam,
    pretty: c => (c || fam || '').replace(/(.{4})(?=.)/g, '$1-'),
    status: () => status,
    lastSync: () => lastSync,
    joinLink: () => location.href.split('#')[0] + '#join-' + fam,
    /** start a new family with this device's children */
    create() { fam = newCode(); ls.set(FKEY, fam); return start(true); },
    /** join an existing family; this device's children are merged in */
    join(code) { const c = clean(code); if (c.length !== 12) return Promise.reject(new Error('code')); fam = c; ls.set(FKEY, fam); return start(false); },
    /** stop syncing on this device (its data stays here) */
    leave() { unsub.forEach(u => u()); unsub = []; famRef = null; fam = null; ls.set(FKEY, null); meta = { kids: {} }; saveMeta(); setStatus('off'); },
    now: () => schedulePush(true),
    /** the signed-in parent ({ name, email }) or null */
    account: () => { const u = account(); return u ? { name: u.displayName || '', email: u.email || '' } : null; },
    /** sign a parent in with 'google' or 'apple' and join (or start) their family */
    signIn,
    /** sign the parent out on this device; syncing goes on with the family code */
    async signOut() { try { await firebase.auth().signOut(); await firebase.auth().signInAnonymously(); } catch (e) {} HS._emit('sync', status); }
  };
  try { if (CFG && sessionStorage.getItem('hs-signin') === '1') { sessionStorage.removeItem('hs-signin'); setTimeout(finishRedirect, 0); } } catch (e) {}
  if (CFG && fam) setTimeout(() => start(), 0);
})();
