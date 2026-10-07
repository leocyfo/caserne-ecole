/* Démo hors claude.ai : imite la base de données et l’identité de claude.ai.
   Les données restent dans ce navigateur (localStorage) ; rien n’est partagé entre visiteurs. */
(function(){
  const KEY='calendrier-cours-demo-db';
  let saved=null;
  try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){saved=null;}
  const store=new Map(Array.isArray(saved)?saved:(window.__SEED||[]).map(d=>[d.path,d.data]));
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify([...store]));}catch(e){}};
  const copy=v=>JSON.parse(JSON.stringify(v));
  const listeners=new Set();
  const fire=()=>{for(const l of listeners)l();};
  const meta={fromCache:false,hasPendingWrites:false};
  const snapDoc=path=>{const v=store.get(path);return {id:path.split('/').pop(),exists:!!v,data:()=>v?Object.freeze(copy(v)):undefined,metadata:meta};};
  const ops={'==':(a,b)=>a===b,'!=':(a,b)=>a!==b,'>=':(a,b)=>a>=b,'<=':(a,b)=>a<=b,'>':(a,b)=>a>b,'<':(a,b)=>a<b};
  const later=fn=>new Promise(r=>setTimeout(()=>{fn();r();},0));
  function query(colPath,filters){
    const depth=colPath.split('/').length+1;
    const run=()=>{
      const docs=[];
      for(const [p,v] of store){
        if(p.split('/').length!==depth||!p.startsWith(colPath+'/'))continue;
        if(filters.every(([f,o,x])=>ops[o]&&ops[o](v[f],x)))docs.push(snapDoc(p));
      }
      docs.sort((a,b)=>a.id<b.id?-1:1);
      return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:meta};
    };
    return {
      path:colPath,
      where:(f,o,x)=>query(colPath,[...filters,[f,o,x]]),
      orderBy(){return this;},limit(){return this;},
      get:async()=>run(),
      onSnapshot(cb){const l=()=>setTimeout(()=>cb(run()),0);listeners.add(l);l();return ()=>listeners.delete(l);},
      doc:id=>docRef(colPath+'/'+(id||Math.random().toString(36).slice(2)))
    };
  }
  function docRef(path){
    return {
      id:path.split('/').pop(),path,
      get:async()=>snapDoc(path),
      set:d=>later(()=>{store.set(path,copy(d));persist();fire();}),
      update:async d=>{if(!store.has(path))throw {code:'invalid_argument',message:'Document introuvable'};await later(()=>{store.set(path,Object.assign(store.get(path),copy(d)));persist();fire();});},
      delete:()=>later(()=>{store.delete(path);persist();fire();}),
      onSnapshot(cb){const l=()=>setTimeout(()=>cb(snapDoc(path)),0);listeners.add(l);l();return ()=>listeners.delete(l);}
    };
  }
  const db={doc:docRef,collection:p=>query(p,[])};
  const me={id:'demo-vous',name:'Vous (démo)',avatarUrl:'',color:'#2C4F78',email:null,isOwner:true,canEdit:true};
  const prof=id=>({id,name:id===me.id?me.name:'',avatarUrl:'',color:'#5B7BA6',email:null,isMe:id===me.id,guest:false});
  const user={
    isOwner:async()=>true,canEdit:async()=>true,can:async()=>true,id:async()=>me.id,me:async()=>Object.assign({},me),
    profiles:async ids=>{const r={};for(const i of [].concat(ids))r[i]=prof(i);return r;},
    search:async()=>[]
  };
  window.claude={use:async n=>n==='db'?db:n==='user'?user:null};
  window.__DEMO_LOCAL=true;
  window.__DEMO_RESET=()=>{try{localStorage.removeItem(KEY);}catch(e){}location.reload();};
})();
