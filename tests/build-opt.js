// Construit les pages du site chargé avec ses vrais fichiers d’options (tests/options/), ou sans eux :
// test-opt.html aucun, test-opt-s.html le Stock seul, test-opt-c.html la Compta seule, test-opt-2.html les deux.
const fs=require('fs');
const {assembler,option,nomsOptions}=require('../outils/assembler.js');
fs.mkdirSync('options',{recursive:true});
for(const k of nomsOptions()) fs.writeFileSync('options/'+k+'.js',option(k));
const seed=fs.readFileSync('seed-academy.json','utf8'), mock=fs.readFileSync('mock.js','utf8'), steps=fs.readFileSync('steps-options.js','utf8'), page=assembler();
/* un fichier « absent » : la page le demande, le navigateur ne le trouve pas */
const absent=sans=>'<script>window.__SANS='+JSON.stringify(sans)+';(()=>{const ap=document.head.appendChild;document.head.appendChild=function(x){if(x.tagName==="SCRIPT")for(const k of window.__SANS)x.src=x.src.replace("options/"+k+".js","options/absent-"+k+".js");return ap.call(this,x);};})();</script>';
for(const [f,sans] of [['test-opt.html',['stock','compta']],['test-opt-s.html',['compta']],['test-opt-c.html',['stock']],['test-opt-2.html',[]]])
  fs.writeFileSync(f,'<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"></head><body><script>try{localStorage.clear()}catch(e){}window.__SEED='+seed+';</script><script>'+mock+'</script>'+absent(sans)+page+'<script>'+steps+'</script></body></html>');
