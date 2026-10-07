const fs=require('fs');const page=fs.readFileSync('../src/calendrier-cours.html','utf8');
const seed=JSON.parse(fs.readFileSync('seed-academy.json','utf8'));
const mk=(file,user,acct)=>{const sd=seed.concat([{path:'comptes/'+user.id,data:acct}]);
fs.writeFileSync(file,'<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"></head><body><script>try{localStorage.clear()}catch(e){}window.__USER='+JSON.stringify(user)+';window.__SEED='+JSON.stringify(sd)+';</script><script>'+fs.readFileSync('mock.js','utf8')+'</script>'+page+'<script>'+fs.readFileSync('steps-lock.js','utf8')+'</script></body></html>');};
const fe=seed.find(d=>d.path==='eleves/el-119-01').data;
mk('test-lock-s.html',{id:'u9',isOwner:false,canEdit:false,can:false},{role:'student',ref:'el-119-01',fiche:{nom:fe.nom,groupe:fe.groupe,numero:fe.numero,fonction:fe.fonction,naissance:'',parent:'',courriel:fe.courriel,telephone:fe.telephone}});
mk('test-lock-t.html',{id:'u8',isOwner:false,canEdit:false,can:true},{role:'teacher',ref:'e-proy',fiche:{nom:'Philippe Roy',fonction:'Enseignant',statut:'Actif',courriel:'philippe@ecole.example',telephone:''}});
