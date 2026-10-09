/* Caserne-École · démo : connexion et base de données simulées, gardées dans ce navigateur (localStorage).
   Sert à essayer la connexion, la demande de compte et l’approbation sans Firebase.
   Rien n’est envoyé ailleurs ; « Réinitialiser la démo » efface tout. */
(function(){
  const KEY='caserne-ecole-demo-v3';
  const copy=v=>JSON.parse(JSON.stringify(v));
  const DEMO=[
    {uid:'demo-admin',email:'admin@demo.ca',pw:'demo123',displayName:'Direction de l’Académie',label:'Administration'},
    {uid:'demo-mleduc',email:'marie.leduc@demo.ca',pw:'demo123',displayName:'Marie Leduc',label:'Enseignante · Marie Leduc'},
    {uid:'demo-alexandre',email:'alexandre.beaulieu@demo.ca',pw:'demo123',displayName:'Alexandre Beaulieu',label:'Élève · Alexandre Beaulieu'}
  ];
  function seed(){
    const now='2026-10-08T12:00:00.000Z';
    const docs=(window.__SEED||[]).filter(d=>!/^comptes\//.test(d.path)).map(d=>[d.path,copy(d.data)]);
    const get=p=>(docs.find(d=>d[0]===p)||[])[1]||{};
    const e=get('eleves/el-119-01'), t=get('enseignants/e-mleduc');
    docs.push(['config/proprietaire',{uid:'demo-admin',cree:now}]);
    docs.push(['comptes/demo-admin',{role:'admin',ref:'',fiche:{nom:'Direction de l’Académie'},maj:now}]);
    docs.push(['comptes/demo-mleduc',{role:'teacher',ref:'e-mleduc',fiche:{nom:t.nom||'Marie Leduc',fonction:t.fonction||'',statut:t.statut||'',courriel:t.courriel||'',telephone:''},maj:now}]);
    docs.push(['comptes/demo-alexandre',{role:'student',ref:'el-119-01',fiche:{nom:e.nom||'Alexandre Beaulieu',groupe:e.groupe||'c119',numero:e.numero==null?null:e.numero,fonction:e.fonction||'',naissance:e.naissance||'',parent:e.parent||'',courriel:e.courriel||'',telephone:e.telephone||''},maj:now}]);
    for(const u of DEMO) docs.push(['profils/'+u.uid,{nom:u.displayName,courriel:u.email,maj:now}]);
    return {users:DEMO.map(({uid,email,pw,displayName})=>({uid,email,pw,displayName})),store:docs,cur:null};
  }
  let state=null;
  try{state=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){state=null;}
  if(!state||!Array.isArray(state.store)) state=seed();
  const users=new Map(state.users.map(u=>[u.email.toLowerCase(),u]));
  const store=new Map(state.store);
  let cur=state.cur?[...users.values()].find(u=>u.uid===state.cur)||null:null;
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({users:[...users.values()],store:[...store],cur:cur?cur.uid:null}));}catch(e){}};
  save();

  const L=new Set(), authL=new Set();
  const fire=()=>{save();for(const l of L)l();};
  const tick=()=>new Promise(r=>setTimeout(r,60));
  const meta={fromCache:false,hasPendingWrites:false};
  const snapDoc=p=>{const v=store.get(p);return {id:p.split('/').pop(),exists:!!v,data:()=>v?copy(v):undefined,metadata:meta};};
  const ops={'==':(a,b)=>a===b,'!=':(a,b)=>a!==b,'>=':(a,b)=>a>=b,'<=':(a,b)=>a<=b,'>':(a,b)=>a>b,'<':(a,b)=>a<b};
  function q(col,f){
    const depth=col.split('/').length+1;
    const run=()=>{const docs=[];for(const [p,v] of store){if(p.split('/').length!==depth||!p.startsWith(col+'/'))continue;if(f.every(([k,o,x])=>ops[o]&&ops[o](v[k],x)))docs.push(snapDoc(p));}docs.sort((a,b)=>a.id<b.id?-1:1);return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:meta};};
    return {path:col,where:(k,o,x)=>q(col,[...f,[k,o,x]]),orderBy(){return this;},limit(){return this;},get:async()=>run(),
      onSnapshot(cb){const l=()=>setTimeout(()=>cb(run()),0);L.add(l);l();return ()=>L.delete(l);},
      doc:id=>ref(col+'/'+(id||Math.random().toString(36).slice(2)))};
  }
  function ref(p){return {id:p.split('/').pop(),path:p,get:async()=>snapDoc(p),
    set:async d=>{store.set(p,copy(d));fire();},
    update:async d=>{if(!store.has(p))throw {code:'invalid_argument',message:'Document introuvable'};store.set(p,Object.assign(store.get(p),copy(d)));fire();},
    delete:async()=>{store.delete(p);fire();},
    onSnapshot(cb){const l=()=>setTimeout(()=>cb(snapDoc(p)),0);L.add(l);l();return ()=>L.delete(l);}};}
  const err=c=>Object.assign(new Error(c),{code:c});
  const pub=u=>u?{uid:u.uid,email:u.email,displayName:u.displayName||''}:null;
  const setCur=u=>{cur=u;save();setTimeout(()=>authL.forEach(f=>f(pub(u))),0);};

  window.__DEMO_LOCAL=true;
  window.__DEMO_RESET=()=>{try{localStorage.removeItem(KEY);}catch(e){}location.reload();};
  window.__setBackend({
    demo:{accounts:DEMO.map(({email,pw,label})=>({email,pw,label}))},
    db:{doc:ref,collection:p=>q(p,[])},
    onAuth:cb=>{authL.add(cb);setTimeout(()=>cb(pub(cur)),0);return ()=>authL.delete(cb);},
    signIn:async(e,p)=>{await tick();const u=users.get(String(e).toLowerCase());if(!u||u.pw!==p)throw err('auth/invalid-credential');setCur(u);return pub(u);},
    signUp:async(e,p,n)=>{await tick();const k=String(e).toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(k))throw err('auth/invalid-email');if(users.has(k))throw err('auth/email-already-in-use');if(String(p).length<6)throw err('auth/weak-password');
      const u={uid:'demo-'+Math.random().toString(36).slice(2,10),email:k,pw:p,displayName:n||''};users.set(k,u);setCur(u);return pub(u);},
    signOut:async()=>{setCur(null);},
    reset:async()=>{throw err('demo/no-email');},
    get:async p=>{await tick();const v=store.get(p);return {exists:!!v,data:v?copy(v):undefined};},
    set:async(p,d)=>{store.set(p,copy(d));fire();},
    watch:(p,cb)=>{const l=()=>setTimeout(()=>{const v=store.get(p);cb({exists:!!v,data:v?copy(v):undefined});},0);L.add(l);l();return ()=>L.delete(l);},
    list:async p=>[...store].filter(([k])=>k.startsWith(p+'/')&&k.split('/').length===p.split('/').length+1).map(([k,v])=>({id:k.split('/').pop(),data:copy(v)}))
  });
})();
