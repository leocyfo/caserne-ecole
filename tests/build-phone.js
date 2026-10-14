// Construit test-phone.html : la page de l’Académie dans un cadre de 390 × 844 px, la taille d’un téléphone
// (Chrome sans fenêtre ne descend pas sous 500 px). Les résultats du cadre sont recopiés dans la page.
const fs=require('fs');
const page=require('../outils/assembler.js').assembler();
const seed=fs.readFileSync('seed-academy.json','utf8');
const inner='<!doctype html><html lang="fr"><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"></head><body><script>window.__SEED='+seed+';</script><script>'+fs.readFileSync('mock.js','utf8')+'</script>'+page+'<script>'+fs.readFileSync('steps-phone.js','utf8')+'</script></body></html>';
// La page devient une chaîne JavaScript : « </ » et « <!-- » sont neutralisés pour ne pas fermer le script qui la contient
const str=JSON.stringify(inner).replace(/<\//g,'<\\/').replace(/<!--/g,'<\\!--');
fs.writeFileSync('test-phone.html','<!doctype html><html lang="fr"><head><meta charset=utf-8></head><body style="margin:0">'
  +'<iframe id="phone" title="Téléphone" style="display:block;width:390px;height:844px;border:0"></iframe>'
  +'<script>const f=document.getElementById("phone");f.srcdoc='+str+';'
  +'const t=setInterval(()=>{try{const r=f.contentDocument&&f.contentDocument.getElementById("results");if(r){clearInterval(t);const p=document.createElement("pre");p.id="results";p.textContent=r.textContent;document.body.appendChild(p);}}catch(e){}},200);</script>'
  +'</body></html>');
