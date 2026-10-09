(async()=>{
const R=[];const ok=(name,cond,info)=>R.push((cond?'PASS ':'FAIL ')+name+(info!==undefined?' :: '+info:''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const click=el=>{if(!el)throw new Error('missing element');el.click();};
const type=(id,v)=>{const i=$(id);if(!i)throw new Error('missing '+id);i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));};
const submit=id=>{const f=$(id);if(!f)throw new Error('missing '+id);f.requestSubmit();};
const gateOpen=()=>!$('#gate').hidden;
const until=async(fn,ms=3000)=>{const t=Date.now();while(Date.now()-t<ms){if(fn())return true;await wait(50);}return false;};
const store=()=>window.__store;
try{
await wait(300);
const SC=window.__SCENARIO;
if(SC==='setup'){
  ok('setup screen',!!$('#g-form-setup')&&/Première installation/.test($('#gate').textContent));
  type('#g-nom','Thierry Mayrand');type('#g-courriel','admin@academie.test');type('#g-mdp','123');
  submit('#g-form-setup');await wait(150);
  ok('short password refused',/6 caractères/.test($('#gate').textContent)&&$('#g-courriel').value==='admin@academie.test');
  type('#g-mdp','secret123');submit('#g-form-setup');
  await until(()=>!gateOpen());await wait(500);
  const own=store().get('config/proprietaire');
  ok('owner created',!!own&&store().get('comptes/'+own.uid).role==='admin'&&store().get('profils/'+own.uid).nom==='Thierry Mayrand');
  ok('admin app',!gateOpen()&&!!$('#nav-comptes')&&!$('#logout-btn').hidden&&/Thierry Mayrand/.test($('#person').textContent));
  ok('import button',!!$('#import-demo'));
  click($('#import-demo'));
  await until(()=>$$('#main .week button.cc').length>20,5000);await wait(300);
  ok('demo imported',$$('#main .week button.cc').length>20&&!!store().get('cours/k119-m08')&&!store().get('comptes/exemple-e-mleduc'),$$('#main .week button.cc').length);
}
if(SC==='request'){
  ok('login screen',!!$('#g-form-login')&&gateOpen());
  type('#g-courriel','own@academie.test');type('#g-mdp','mauvais');submit('#g-form-login');await wait(200);
  ok('wrong password',/incorrect/.test($('#gate').textContent));
  click($('#g-forgot'));await wait(150);
  ok('reset email',window.__resetSent==='own@academie.test'&&/nouveau mot de passe/.test($('#gate').textContent));
  click($('#g-tab-request'));await wait(80);
  ok('request form',!!$('#g-form-request'));
  type('#g-nom','Léa Tremblay');type('#g-courriel','lea@academie.test');type('#g-mdp','abc123');
  ok('no role or class to choose',!$('#g-role')&&!$('#g-classe')&&/choisit votre rôle et votre classe/.test($('#gate').textContent));
  type('#g-message','Je commence cette semaine.');submit('#g-form-request');
  await until(()=>/En attente/.test($('#gate').textContent));
  const dem=[...store()].find(([k,v])=>k.startsWith('demandes/')&&v.nom==='Léa Tremblay');
  ok('pending screen',/En attente/.test($('#gate').textContent)&&/lea@academie.test/.test($('#gate').textContent));
  ok('request stored',!!dem&&dem[1].statut==='en attente'&&dem[1].message==='Je commence cette semaine.'&&!('role' in dem[1])&&!('classe' in dem[1])&&store().get('profils/'+dem[0].split('/')[1]).nom==='Léa Tremblay');
  // l’administration approuve : la personne entre sans recharger
  const uid=dem[0].split('/')[1];
  window.__mockSet('comptes/'+uid,{role:'student',ref:'el-119-12',fiche:{nom:'Léa Tremblay',groupe:'c119',numero:12,fonction:'',naissance:'',parent:'',courriel:'',telephone:''},maj:new Date().toISOString()});
  await until(()=>!gateOpen());await wait(600);
  ok('enters when approved',!gateOpen()&&/élève/i.test($('#ws-label').textContent)&&/Léa Tremblay/.test($('#person').textContent)&&!$('#nav-comptes'));
}
if(SC==='approve'){
  await until(()=>!gateOpen());await wait(600);
  ok('owner signed in',!gateOpen()&&!!$('#nav-comptes'));
  click($('#nav-comptes'));await wait(200);
  ok('requests panel',!!$('#dem-panel')&&/Léa Tremblay/.test($('#dem-panel').textContent)&&/Bob Martin/.test($('#dem-panel').textContent)&&!/Accès dans Partager/.test($('#main').textContent));
  click($('#dm-ok-u-lea'));await wait(200);
  ok('approve drawer',/Demande de Léa Tremblay/.test($('#drawer').textContent)&&$('#ac-ref').value==='el-119-12'&&$('#ac-role-student').getAttribute('aria-pressed')==='true'&&/Approuver et créer/.test($('#ac-save').textContent));
  click($('#ac-save'));await wait(300);
  ok('account created',(store().get('comptes/u-lea')||{}).ref==='el-119-12'&&store().get('demandes/u-lea').statut==='approuvée');
  ok('request leaves panel',!/Léa Tremblay/.test(($('#dem-panel')||{textContent:''}).textContent));
  click($('#dm-no-u-bob'));await wait(250);
  ok('request refused',store().get('demandes/u-bob').statut==='refusée'&&!$('#dem-panel'));
  click($('#person-btn'));await wait(150);
  ok('profile logout',!!$('#pf-logout')&&/own@academie.test/.test($('#main').textContent));
}
if(SC==='refused'){
  await until(()=>/refusée/.test($('#gate').textContent));
  ok('refused screen',/n’a pas été acceptée/.test($('#gate').textContent));
  click($('#g-again'));await wait(100);
  ok('new request form',!!$('#g-form-request2')&&$('#g-nom').value==='Bob Martin');
  type('#g-message','Élève de la classe 121');submit('#g-form-request2');
  await until(()=>/En attente/.test($('#gate').textContent));
  ok('request resent',store().get('demandes/u-bob').statut==='en attente'&&store().get('demandes/u-bob').message==='Élève de la classe 121');
}
if(SC==='demo-login'){
  await until(()=>!!$('#g-demo'));
  ok('demo box',$$('#g-demo button[data-g=demo]').length===3&&/demo123/.test($('#g-demo').textContent));
  click($('#g-demo-2'));await until(()=>!gateOpen());await wait(700);
  ok('student demo login',!gateOpen()&&/élève/i.test($('#ws-label').textContent)&&/Alexandre Beaulieu/.test($('#person').textContent)&&!$('#logout-btn').hidden);
  ok('demo session kept',JSON.parse(localStorage.getItem('caserne-ecole-demo-v5')).cur==='demo-alexandre');
}
if(SC==='demo-request'){
  await until(()=>!!$('#g-demo'));
  click($('#g-tab-request'));await wait(80);
  ok('demo request hint',/la demande reste dans ce navigateur/.test($('#gate').textContent));
  type('#g-nom','Zoé Test');type('#g-courriel','zoe@exemple.ca');type('#g-mdp','abc123');
  submit('#g-form-request');
  await until(()=>/En attente/.test($('#gate').textContent));
  ok('demo pending hint',/compte Administration/.test($('#gate').textContent));
  const saved=JSON.parse(localStorage.getItem('caserne-ecole-demo-v5'));
  ok('demo request saved',saved.store.some(([p,v])=>p.startsWith('demandes/')&&v.nom==='Zoé Test'&&v.statut==='en attente')&&saved.users.some(u=>u.email==='zoe@exemple.ca'));
}
if(SC==='signin'){
  ok('login first',!!$('#g-form-login'));
  type('#g-courriel','philippe@academie.test');type('#g-mdp','prof123');submit('#g-form-login');
  await until(()=>!gateOpen());await wait(600);
  ok('teacher enters',!gateOpen()&&/enseignant/i.test($('#ws-label').textContent)&&/Philippe Roy/.test($('#person').textContent)&&!$('#sel-teacher'));
}
}catch(e){R.push('ERROR '+e.message+' '+e.stack);}
R.push('ERRS '+JSON.stringify(window.__errs));
const pre=document.createElement('pre');pre.id='results';pre.textContent=R.join('\n');document.body.appendChild(pre);
})();
