/* Caserne-École : branche le site sur Firebase (connexion + base de données Firestore).
   Les réglages du projet sont dans config.js (window.FIREBASE_CONFIG). La base est exposée à la page
   avec la même forme que celle de claude.ai : doc(), collection(), where(), onSnapshot()… */
const V='10.12.2';
const cfg=window.FIREBASE_CONFIG;
if(!cfg||!cfg.apiKey||!cfg.projectId){
  window.__setBackend(null);
}else{
  let mods;
  try{mods=await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)
  ]);}catch(e){mods=null;}
  if(!mods){window.__backendFailed&&window.__backendFailed();}else{
  const [{initializeApp},A,F]=mods;
  const app=initializeApp(cfg);
  const auth=A.getAuth(app);
  auth.languageCode='fr';
  const fs=F.initializeFirestore(app,{ignoreUndefinedProperties:true});

  // Les codes d’erreur de Firestore, traduits en ceux que la page connaît déjà
  const CODES={'permission-denied':'invalid_argument','unauthenticated':'revoked','unavailable':'unavailable','resource-exhausted':'quota_exceeded','not-found':'invalid_argument'};
  const wrap=e=>({code:CODES[e&&e.code]||String(e&&e.code||'unknown'),message:String(e&&e.message||e)});
  const meta=s=>({fromCache:!!(s.metadata&&s.metadata.fromCache),hasPendingWrites:!!(s.metadata&&s.metadata.hasPendingWrites)});
  const dsnap=s=>({id:s.id,exists:s.exists(),data:()=>s.data(),metadata:meta(s)});
  const qsnap=q=>({docs:q.docs.map(dsnap),size:q.size,empty:q.empty,metadata:meta(q),docChanges:()=>[]});
  const fail=e=>{throw wrap(e);};
  function docRef(path){
    const r=F.doc(fs,path);
    return {id:r.id,path,
      get:()=>F.getDoc(r).then(dsnap,fail),
      set:d=>F.setDoc(r,d).catch(fail),
      update:d=>F.updateDoc(r,d).catch(fail),
      delete:()=>F.deleteDoc(r).catch(fail),
      onSnapshot:(cb,err)=>F.onSnapshot(r,s=>cb(dsnap(s)),e=>{if(err)err(wrap(e));})};
  }
  function colRef(path,cons){
    const base=F.collection(fs,path), q=cons.length?F.query(base,...cons):base;
    return {path,
      where:(f,o,v)=>colRef(path,[...cons,F.where(f,o,v)]),
      orderBy:(f,d)=>colRef(path,[...cons,F.orderBy(f,d)]),
      limit:n=>colRef(path,[...cons,F.limit(n)]),
      get:()=>F.getDocs(q).then(qsnap,fail),
      onSnapshot:(cb,err)=>F.onSnapshot(q,s=>cb(qsnap(s)),e=>{if(err)err(wrap(e));}),
      doc:id=>docRef(path+'/'+(id||F.doc(base).id))};
  }
  const user=u=>u?{uid:u.uid,email:u.email||'',displayName:u.displayName||''}:null;
  window.__setBackend({
    db:{doc:docRef,collection:p=>colRef(p,[])},
    onAuth:cb=>A.onAuthStateChanged(auth,u=>cb(user(u))),
    signIn:(e,p)=>A.signInWithEmailAndPassword(auth,e,p).then(c=>user(c.user)),
    signUp:async(e,p,n)=>{const c=await A.createUserWithEmailAndPassword(auth,e,p);if(n){try{await A.updateProfile(c.user,{displayName:n});}catch(x){}}return {uid:c.user.uid,email:c.user.email||e,displayName:n||''};},
    signOut:()=>A.signOut(auth),
    reset:e=>A.sendPasswordResetEmail(auth,e),
    get:p=>F.getDoc(F.doc(fs,p)).then(s=>({exists:s.exists(),data:s.data()})),
    set:(p,d)=>F.setDoc(F.doc(fs,p),d),
    watch:(p,cb)=>F.onSnapshot(F.doc(fs,p),s=>cb({exists:s.exists(),data:s.data()}),()=>{}),
    list:p=>F.getDocs(F.collection(fs,p)).then(q=>q.docs.map(d=>({id:d.id,data:d.data()})))
  });
}
}
