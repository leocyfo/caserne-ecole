/* PompierNote : garde le site sur l’appareil pour l’ouvrir sans réseau (présences et évaluations sur le terrain).
   Les fichiers passent par le réseau quand il est là (toujours la dernière version) ; sans réseau, la copie gardée sert.
   La base elle-même garde ses données sur l’appareil (site/firebase.js) et envoie les modifications au retour du réseau. */
const COPIE='pompiernote-v3';
const FICHIERS=['./','./index.html','./demo.html','./config.js','./site/connexion.js','./site/firebase.js','./demo/connexion-demo.js','./demo/donnees.js','./site/logo.svg','./site/embleme.svg','./site/embleme-blanc.svg','./site/icone-180.png'];
const EXTERNES=/^https:\/\/(www\.gstatic\.com\/firebasejs\/|fonts\.googleapis\.com\/|fonts\.gstatic\.com\/|cdnjs\.cloudflare\.com\/|cdn\.jsdelivr\.net\/)/;
/* Un fichier d’option peut manquer sur un site qui ne l’a pas : le reste est gardé quand même */
const OPTIONS=['./options/stock.js','./options/compta.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(COPIE).then(c=>Promise.all([c.addAll(FICHIERS),...OPTIONS.map(f=>c.add(f).catch(()=>{}))])).catch(()=>{}).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==COPIE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin!==self.location.origin&&!EXTERNES.test(r.url)) return;
  e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(COPIE).then(x=>x.put(r,c));}return res;})
    .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):null)).then(m=>m||Response.error())));
});
