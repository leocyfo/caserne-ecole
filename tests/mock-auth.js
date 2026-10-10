/* Horloge figée pour les tests : vendredi 9 octobre 2026, 16 h (le temps continue d’avancer à partir de là). */
(()=>{const R=Date,T0=new R(2026,9,9,16,0,0).getTime(),R0=R.now();class FixedDate extends R{constructor(...a){if(a.length)super(...a);else super(T0+(R.now()-R0));}static now(){return T0+(R.now()-R0);}}window.Date=FixedDate;})();
/* Service de connexion simulé (remplace Firebase dans les tests). État de départ : window.__AUTH_SEED. */
(function(){
  window.__errs=window.__errs||[];
  window.addEventListener('error',e=>window.__errs.push(String(e.message)));
  window.addEventListener('unhandledrejection',e=>window.__errs.push('rej:'+String(e.reason&&(e.reason.message||e.reason.code)||e.reason)));
  window.__NO_RELOAD=true;
  const S0=window.__AUTH_SEED||{};
  const copy=v=>JSON.parse(JSON.stringify(v));
  const users=new Map((S0.users||[]).map(u=>[u.email,u]));
  const store=new Map((S0.store||[]).map(d=>[d.path,copy(d.data)]));
  window.__store=store;window.__users=users;
  let cur=S0.signedIn?[...users.values()].find(u=>u.uid===S0.signedIn)||null:null;
  const L=new Set(), authL=new Set();
  const fire=()=>{for(const l of L)l();};
  const tick=()=>new Promise(r=>setTimeout(r,5));
  const meta={fromCache:false,hasPendingWrites:false};
  const snapDoc=p=>{const v=store.get(p);return {id:p.split('/').pop(),exists:!!v,data:()=>v?copy(v):undefined,metadata:meta};};
  const ops={'==':(a,b)=>a===b,'>=':(a,b)=>a>=b,'<=':(a,b)=>a<=b,'>':(a,b)=>a>b,'<':(a,b)=>a<b,'!=':(a,b)=>a!==b};
  function q(col,f){
    const run=()=>{const docs=[];for(const [p,v] of store){if(p.split('/').length!==col.split('/').length+1||!p.startsWith(col+'/'))continue;if(f.every(([k,o,x])=>ops[o](v[k],x)))docs.push(snapDoc(p));}docs.sort((a,b)=>a.id<b.id?-1:1);return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:meta};};
    return {path:col,where:(k,o,x)=>q(col,[...f,[k,o,x]]),orderBy(){return this;},limit(){return this;},get:async()=>run(),
      onSnapshot(cb){const l=()=>setTimeout(()=>cb(run()),0);L.add(l);l();return ()=>L.delete(l);},doc:id=>ref(col+'/'+(id||Math.random().toString(36).slice(2)))};
  }
  function ref(p){return {id:p.split('/').pop(),path:p,get:async()=>snapDoc(p),
    set:async d=>{await tick();store.set(p,copy(d));fire();},
    update:async d=>{await tick();if(!store.has(p))throw {code:'invalid_argument'};store.set(p,Object.assign(store.get(p),copy(d)));fire();},
    delete:async()=>{await tick();store.delete(p);fire();},
    onSnapshot(cb){const l=()=>setTimeout(()=>cb(snapDoc(p)),0);L.add(l);l();return ()=>L.delete(l);}};}
  const err=c=>Object.assign(new Error(c),{code:c});
  const pub=u=>u?{uid:u.uid,email:u.email,displayName:u.displayName||''}:null;
  const setCur=u=>{cur=u;setTimeout(()=>authL.forEach(f=>f(pub(u))),0);};
  window.__mockSet=(p,d)=>{store.set(p,copy(d));fire();};
  window.__setBackend({
    db:{doc:ref,collection:p=>q(p,[])},
    onAuth:cb=>{authL.add(cb);setTimeout(()=>cb(pub(cur)),0);return ()=>authL.delete(cb);},
    signIn:async(e,p)=>{await tick();const u=users.get(e);if(!u||u.pw!==p)throw err('auth/invalid-credential');setCur(u);return pub(u);},
    signUp:async(e,p,n)=>{await tick();if(users.has(e))throw err('auth/email-already-in-use');if(String(p).length<6)throw err('auth/weak-password');const u={uid:'u-'+Math.random().toString(36).slice(2,8),email:e,pw:p,displayName:n};users.set(e,u);setCur(u);return pub(u);},
    signOut:async()=>{setCur(null);},
    reset:async e=>{await tick();window.__resetSent=e;},
    get:async p=>{await tick();const v=store.get(p);return {exists:!!v,data:v?copy(v):undefined};},
    set:async(p,d)=>{await tick();store.set(p,copy(d));fire();},
    watch:(p,cb)=>{const l=()=>setTimeout(()=>{const v=store.get(p);cb({exists:!!v,data:v?copy(v):undefined});},0);L.add(l);l();return ()=>L.delete(l);},
    list:async p=>[...store].filter(([k])=>k.startsWith(p+'/')&&k.split('/').length===p.split('/').length+1).map(([k,v])=>({id:k.split('/').pop(),data:copy(v)}))
  });
})();
