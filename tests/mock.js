window.__errs=[];window.addEventListener('error',e=>window.__errs.push(String(e.message)));
window.addEventListener('unhandledrejection',e=>window.__errs.push('rej:'+String(e.reason&&e.reason.message||e.reason)));
const store=new Map();(window.__SEED||[]).forEach(d=>store.set(d.path,JSON.parse(JSON.stringify(d.data))));
window.__store=store;const L=new Set();
const snapDoc=(path)=>{const v=store.get(path);return {id:path.split('/').pop(),exists:!!v,data:()=>v?Object.freeze(JSON.parse(JSON.stringify(v))):undefined,metadata:{fromCache:false,hasPendingWrites:false}};};
const ops={'==':(a,b)=>a===b,'>=':(a,b)=>a>=b,'<=':(a,b)=>a<=b,'>':(a,b)=>a>b,'<':(a,b)=>a<b,'!=':(a,b)=>a!==b};
function q(colPath,filters){
  const run=()=>{const docs=[];for(const [p,v] of store){const seg=p.split('/');if(seg.length!==colPath.split('/').length+1||!p.startsWith(colPath+'/'))continue;if(filters.every(([f,o,x])=>ops[o](v[f],x)))docs.push(snapDoc(p));}docs.sort((a,b)=>a.id<b.id?-1:1);return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{fromCache:false,hasPendingWrites:false}};};
  return {where:(f,o,x)=>q(colPath,[...filters,[f,o,x]]),orderBy(){return this;},limit(){return this;},get:async()=>run(),
    onSnapshot(cb){const l={fire:()=>setTimeout(()=>cb(run()),0)};L.add(l);l.fire();return ()=>L.delete(l);},
    doc:(id)=>docRef(colPath+'/'+(id||Math.random().toString(36).slice(2))),path:colPath};
}
const fire=()=>{for(const l of L)l.fire();};
function docRef(path){return {id:path.split('/').pop(),path,get:async()=>snapDoc(path),
  set:async(d)=>{await new Promise(r=>setTimeout(r,5));store.set(path,JSON.parse(JSON.stringify(d)));fire();},
  update:async(d)=>{await new Promise(r=>setTimeout(r,5));if(!store.has(path))throw {code:'invalid_argument'};store.set(path,Object.assign(store.get(path),JSON.parse(JSON.stringify(d))));fire();},
  delete:async()=>{await new Promise(r=>setTimeout(r,5));store.delete(path);fire();},
  onSnapshot(cb){const l={fire:()=>setTimeout(()=>cb(snapDoc(path)),0)};L.add(l);l.fire();return ()=>L.delete(l);}};}
const db={doc:docRef,collection:(p)=>q(p,[])};
const U=Object.assign({id:'u1',isOwner:true,canEdit:true,can:true},window.__USER||{});
const PEOPLE={u1:'Thierry Mayrand',u2:'Julie Tremblay',u3:'Léo Gagnon',u8:'Philippe Roy',u9:'Alexandre Beaulieu'};
const AV='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#5B7BA6"/></svg>');
const prof=id=>({id,name:PEOPLE[id]||'',avatarUrl:AV,color:'#5B7BA6',email:null,isMe:id===U.id,guest:false});
const user={canEdit:async()=>U.canEdit,can:async()=>U.can,id:async()=>U.id,isOwner:async()=>U.isOwner,
  me:async()=>Object.assign(prof(U.id),{isOwner:U.isOwner,canEdit:U.canEdit}),
  profiles:async(ids)=>{const r={};for(const i of [].concat(ids))r[i]=prof(i);return r;},
  search:async(q)=>Object.keys(PEOPLE).filter(i=>PEOPLE[i].toLowerCase().includes(String(q).toLowerCase())).map(prof)};
const room={onPeers:(h)=>{const peers=[U.id,'u3'].map((by,i)=>({peer:'p'+i,by,isMe:by===U.id,sameTab:by===U.id,kind:'viewer',guest:false,presence:{},updatedAt:0}));setTimeout(()=>h({peers,joined:peers,left:[],updated:[]}),30);return ()=>{};}};
window.claude={use:async(n)=>{await new Promise(r=>setTimeout(r,20));return n==='db'?db:n==='user'?user:n==='room'?room:null;}};
