// Minimal stand-in for the Firebase compat SDK, backed by the test runner (window.__db) so two browsers share it.
(function(){
  const L = {}; // path -> [cb]
  window.__notify = (path, data, type) => {
    // doc listeners
    (L[path]||[]).forEach(cb => cb(docSnap(path, data)));
    // collection listeners (parent path)
    const parent = path.split('/').slice(0,-1).join('/'), id = path.split('/').pop();
    (L[parent+'#col']||[]).forEach(cb => cb({ docChanges: () => [{ type, doc: { id, data: () => data, metadata: { hasPendingWrites: false } } }] }));
  };
  const docSnap = (path, data) => ({ exists: !!data, id: path.split('/').pop(), data: () => data, metadata: { hasPendingWrites: false } });
  function docRef(path) { return { _p: path,
    set: d => window.__db('set', path, JSON.stringify(d)),
    delete: () => window.__db('del', path, ''),
    get: async () => { const r = await window.__db('get', path, ''); return docSnap(path, r ? JSON.parse(r) : null); },
    onSnapshot: (a, b, c) => { const cb = typeof a === 'function' ? a : b; (L[path] = L[path] || []).push(cb); docRef(path).get().then(s => { if (s.exists) cb(s); }); return () => {}; },
    collection: n => colRef(path + '/' + n) }; }
  function colRef(path) { return {
    doc: id => docRef(path + '/' + id),
    get: async () => { const r = JSON.parse(await window.__db('list', path, '')); return { forEach: f => r.forEach(([id, d]) => f({ id, data: () => d })) }; },
    onSnapshot: (cb) => { (L[path + '#col'] = L[path + '#col'] || []).push(cb);
      colRef(path).get().then(s => { const ch = []; s.forEach(d => ch.push({ type: 'added', doc: { id: d.id, data: d.data, metadata: { hasPendingWrites: false } } })); cb({ docChanges: () => ch }); }); return () => {}; } }; }
  setInterval(async () => { const q = JSON.parse(await window.__db('poll', '', '')); q.forEach(([p, d, t]) => window.__notify(p, d, t)); }, 250);
  window.firebase = { apps: [], initializeApp: () => window.firebase.apps.push(1),
    auth: (() => {   // one auth object: anonymous by default; signInWithPopup signs in a parent (window.__parentUid)
      const A = { currentUser: null, _l: [],
        onAuthStateChanged(cb) { A._l.push(cb); setTimeout(() => cb(A.currentUser), 0); return () => { A._l = A._l.filter(x => x !== cb); }; },
        async signInAnonymously() { A.currentUser = { uid: 'anon' + Math.random().toString(36).slice(2, 7), isAnonymous: true }; A._l.forEach(f => f(A.currentUser)); return { user: A.currentUser }; },
        async signInWithPopup(p) { A.currentUser = { uid: window.__parentUid || 'parent1', isAnonymous: false, email: 'parent@example.com', displayName: 'Parent', provider: p.id }; A._l.forEach(f => f(A.currentUser)); return { user: A.currentUser }; },
        async signOut() { A.currentUser = null; A._l.forEach(f => f(null)); } };
      const f = () => A; f.GoogleAuthProvider = function () { this.id = 'google.com'; }; f.OAuthProvider = function (id) { this.id = id; this.addScope = () => {}; };
      return f; })(),
    firestore: () => ({ collection: n => colRef(n),
      runTransaction: async fn => {   // like Firestore: if the doc changed after we read it, run fn again
        for (let i = 0; i < 6; i++) {
          const reads = {}, sets = [];
          await fn({ get: async ref => { const s = await ref.get(); reads[ref._p] = s.exists ? s.data().h : null; return s; }, set: (ref, d) => sets.push([ref, d]) });
          let ok = true;
          for (const [ref, d] of sets) { const r = await window.__db('cas', ref._p, JSON.stringify({ expect: ref._p in reads ? reads[ref._p] : '*', d })); if (r !== 'ok') { ok = false; break; } }
          if (ok) return;
        }
        throw new Error('contention');
      } }) };
})();
