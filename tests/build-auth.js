// Construit les pages de test du site avec connexion (test-auth-<scénario>.html)
const fs=require('fs');
const rd=f=>fs.readFileSync(f,'utf8');
const PAGE=fs.existsSync('../src/calendrier-cours.html')?'../src/calendrier-cours.html':'calendrier-cours.html';
const RT=fs.existsSync('../site/connexion.js')?'../site/connexion.js':'site-connexion.js';
const page=rd(PAGE), runtime=rd(RT), mock=rd('mock-auth.js'), steps=rd('steps-auth.js');
const seed=JSON.parse(rd('seed-academy.json')).filter(d=>!d.path.startsWith('comptes/'));
const owner={uid:'u-own',email:'own@academie.test',pw:'secret1',displayName:'Thierry Mayrand'};
const ownDocs=[{path:'config/proprietaire',data:{uid:'u-own',cree:'2026-10-08T12:00:00Z'}},{path:'comptes/u-own',data:{role:'admin',ref:'',fiche:{nom:'Thierry Mayrand'},maj:'2026-10-08T12:00:00Z'}},{path:'profils/u-own',data:{nom:'Thierry Mayrand',courriel:'own@academie.test'}}];
const dem=(uid,nom,courriel,role,classe,statut)=>[{path:'demandes/'+uid,data:{nom,courriel,role,classe,message:'',statut,cree:'2026-10-08T13:00:00Z'}},{path:'profils/'+uid,data:{nom,courriel}}];
const SC={
  setup:{users:[],store:[],signedIn:null,seedGlobal:true},
  request:{users:[owner],store:seed.concat(ownDocs),signedIn:null},
  approve:{users:[owner,{uid:'u-lea',email:'lea@academie.test',pw:'abc123'},{uid:'u-bob',email:'bob@academie.test',pw:'abc123'}],store:seed.concat(ownDocs,dem('u-lea','Léa Tremblay','lea@academie.test','student','119','en attente'),dem('u-bob','Bob Martin','bob@academie.test','teacher','','en attente')),signedIn:'u-own'},
  refused:{users:[owner,{uid:'u-bob',email:'bob@academie.test',pw:'abc123'}],store:seed.concat(ownDocs,dem('u-bob','Bob Martin','bob@academie.test','student','','refusée')),signedIn:'u-bob'},
  signin:{users:[owner,{uid:'u-phil',email:'philippe@academie.test',pw:'prof123'}],store:seed.concat(ownDocs,[{path:'comptes/u-phil',data:{role:'teacher',ref:'e-proy',fiche:{nom:'Philippe Roy'},maj:'2026-10-08T12:00:00Z'}},{path:'profils/u-phil',data:{nom:'Philippe Roy',courriel:'philippe@academie.test'}}]),signedIn:null}
};
for(const [name,sc] of Object.entries(SC)){
  const pre=`<script>try{localStorage.clear()}catch(e){}window.__SCENARIO=${JSON.stringify(name)};window.__AUTH_SEED=${JSON.stringify({users:sc.users,store:sc.store,signedIn:sc.signedIn})};${sc.seedGlobal?'window.__SEED='+JSON.stringify(JSON.parse(rd('seed-academy.json')))+';':''}</script>`;
  fs.writeFileSync(`test-auth-${name}.html`,'<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Caserne-École</title></head><body>'+pre+'<script>'+runtime+'</script><script>'+mock+'</script>'+page+'<script>'+steps+'</script></body></html>');
}
console.log(Object.keys(SC).map(n=>'test-auth-'+n+'.html').join(' '));
