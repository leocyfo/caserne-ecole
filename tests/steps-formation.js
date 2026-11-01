(async()=>{
const R=[];const ok=(name,cond,info)=>R.push((cond?'PASS ':'FAIL ')+name+(info!==undefined?' :: '+info:''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const click=el=>{if(!el)throw new Error('missing element');el.click();};
const navBtn=p=>{if(!$('#nav-'+p)&&$('#nav .nav-back'))click($('#nav .nav-back'));const b=$('#nav-'+p);if(b)return b;const g={personnel:'eleves'}[p];if(g&&$('#nav-'+g))click($('#nav-'+g));return $('#tab-'+p)||$('#nav-'+p);};
const pick=(sel,v)=>{const x=$(sel);x.value=v;x.dispatchEvent(new Event('change',{bubbles:true}));};
const typeIn=(sel,v)=>{const i=$(sel);i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));};
const key=(el,k,o)=>el.dispatchEvent(new KeyboardEvent('keydown',Object.assign({key:k,bubbles:true,cancelable:true},o||{})));
const coll=p=>[...window.__store.entries()].filter(([k])=>k.startsWith(p+'/')).map(([k,v])=>Object.assign({id:k.slice(p.length+1)},v));
const sub=async()=>{$('#drawer form').requestSubmit();await wait(400);};
const fo=async k=>{if(!$('#fo-'+k)){click(navBtn('formation'));await wait(250);}click($('#fo-'+k));await wait(250);};
try{
await wait(600);
/* ---------- menu de la formation et tableau de bord ---------- */
click(navBtn('formation'));await wait(300);
ok('formation side menu',$('#nav-formation').classList.contains('nav-back')&&$$('#nav [data-k=fo]').length===12&&$('#fo-dash').getAttribute('aria-current')==='page'&&!!$('#fo-prereq .nav-todo.bad')&&!!$('#fo-certs .nav-todo.bad'),$$('#nav [data-k=fo]').length);
ok('dashboard',$$('#main .xm-tile').length===4&&/11/.test($('#fod-grilles').textContent)&&/Préalables manquants/.test($('#fod-pre').textContent)&&$$('#fod-todo li').length>3&&$$('#fod-last li').length===8);
/* ---------- grilles pratiques ---------- */
await fo('grilles');
ok('grilles list',$$('#main .xm-row.xm-fg').length===11&&/ENPQ/.test($('#main .xm-list').textContent));
click($('#fo-g-new'));await wait(150);
$('#fg-nom').value='Monter une échelle';$('#fg-mod').value='5';$('#fg-pts').value='! Vérifier l’échelle\nMonter en gardant trois points d’appui\n! Se sécuriser en haut';$('#fg-seuil').value='80';$('#fg-temps').value='2';
await sub();
const ng=coll('grilles').find(g=>g.nom==='Monter une échelle');
ok('grille created',!!ng&&ng.points.length===3&&ng.points[0].crit&&!ng.points[1].crit&&ng.points[2].crit&&ng.module===5&&ng.temps===2&&ng.autre===true&&!$('#drawer form')&&$$('#main .xm-row.xm-fg').length===12,JSON.stringify(ng&&ng.points));
/* ---------- évaluer : chronomètre, points critiques, signature, deuxième essai avec un autre évaluateur ---------- */
await fo('eval');
pick('#fo-g','c119');await wait(150);pick('#fo-gr',ng.id);await wait(150);
ok('eval list',$$('.fo-er').length===12&&!!$('#fo-ev-el-119-04')&&$('#fo-grp').disabled);
click($('#fo-ev-el-119-04'));await wait(150);
ok('sheet opens',/Monter une échelle/.test($('#dr-title').textContent)&&$$('.fo-pt').length===3&&$$('.fo-pt.crit').length===2&&/essai 1 sur 2/.test($('#drawer').textContent));
click($('#fo-run'));await wait(1300);click($('#fo-run'));await wait(60);
ok('stopwatch',/^00:0[1-9]$/.test($('#fo-chrono').textContent)&&/Reprendre/.test($('#fo-run').textContent),$('#fo-chrono').textContent);
click($('[data-fo-pt="0"]'));await wait(40);click($('[data-fo-pt="1"]'));await wait(40);
ok('critical point missed',/Point critique manqué/.test($('#fo-score').textContent)&&/2 \/ 3/.test($('#fo-score').textContent));
const ev0=coll('evaluations').length;
await sub();
ok('evaluator must sign',coll('evaluations').length===ev0&&/confirmation de l’évaluateur/.test($('#drawer').textContent));
click($('#fo-sig-ev'));await wait(30);await sub();
const e1=coll('evaluations').filter(v=>v.grille===ng.id&&v.eleve==='el-119-04');
ok('failed attempt saved',e1.length===1&&e1[0].resultat==='echec'&&e1[0].motif==='Point critique manqué'&&e1[0].essai===1&&e1[0].temps>=1&&e1[0].sig.ev&&!e1[0].sig.el&&e1[0].score===67,JSON.stringify(e1[0]&&{r:e1[0].resultat,m:e1[0].motif,s:e1[0].score,t:e1[0].temps}));
ok('student marked to retake',/À reprendre/.test($$('.fo-er')[3].textContent)&&/Reprendre/.test($('#fo-ev-el-119-04').textContent));
click($('#fo-ev-el-119-04'));await wait(150);
ok('second attempt needs another evaluator',/essai 2 sur 2/.test($('#drawer').textContent)&&!!$('#fo-same'));
click($('[data-act=fo-allpts]'));await wait(40);click($('#fo-sig-ev'));await wait(30);await sub();
ok('same evaluator refused',coll('evaluations').filter(v=>v.grille===ng.id).length===1&&/autre évaluateur/.test($('#drawer .form-err').textContent));
const other=[...$('#fo-ens').options].map(o=>o.value).find(v=>v!==e1[0].ens);pick('#fo-ens',other);await wait(60);
ok('other evaluator accepted',!$('#fo-same'));
click($('#fo-sig-el'));await wait(30);await sub();
const e2=coll('evaluations').filter(v=>v.grille===ng.id&&v.eleve==='el-119-04'&&v.essai===2)[0];
ok('second attempt passed',!!e2&&e2.resultat==='reussi'&&e2.score===100&&e2.ens===other&&!!e2.sig.el&&/Réussie/.test($$('.fo-er')[3].textContent));
/* ---------- réussite en groupe ---------- */
click($('[data-act=fo-sel][data-id=el-119-05]'));await wait(80);click($('[data-act=fo-sel][data-id=el-119-06]'));await wait(80);
ok('group selection',!$('#fo-grp').disabled&&/\(2\)/.test($('#fo-grp').textContent));
click($('#fo-grp'));await wait(150);
ok('group drawer',/Réussite en groupe/.test($('#drawer').textContent)&&$$('#drawer .plist li').length===2);
click($('#fo-sig-ev'));await wait(30);$('#drawer form').requestSubmit();await wait(700);
const lot=coll('evaluations').filter(v=>v.grille===ng.id&&v.lot);
ok('group success saved',lot.length===2&&lot.every(v=>v.resultat==='reussi'&&v.score===100&&v.lot===lot[0].lot&&v.coches.every(Boolean))&&$$('.fo-er.done').length===3);
/* ---------- carnets ---------- */
await fo('carnet');
pick('#fo-g','c119');await wait(150);
ok('carnet matrix',$$('#fo-mat tbody tr').length===12&&$$('#fo-mat thead .fo-gh').length===12&&$$('#fo-mat .fo-c.ok').length>30&&$$('.fo-leg li').length===12);
click($('#fo-mat .fo-c.ok .fo-cb'));await wait(150);
ok('carnet cell opens the evaluation',/Évaluation pratique/.test($('#drawer').textContent)&&/Réussie/.test($('#drawer').textContent));
click($('#dr-close'));await wait(60);
/* ---------- préalables ---------- */
await fo('prereq');
ok('prerequisites',$$('#fo-pre-up .plist>li').length>3&&/M8/.test($('#fo-pre-up').textContent)&&/essai d’ajustement du masque|revêtir l’ari/i.test($('#fo-pre-up').textContent));
click($('#fo-pre-8'));await wait(150);
ok('prerequisite drawer',$$('#drawer input[name=pg]:checked').length===3&&$$('#drawer input[name=pc]:checked').length===1);
click($('#drawer input[name=pc]:checked'));await wait(20);await sub();
const pre8=window.__store.get('config/ecole').formation.prereq['8'];
ok('prerequisite saved',!!pre8&&pre8.grilles.length===3&&!pre8.certs.length);
/* ---------- certificats ---------- */
await fo('certs');
pick('#fo-g','c119');await wait(150);
ok('certificates table',$$('#fo-certs-t tbody tr').length===12&&$$('#fo-certs-t .chip.bad').length>=1);
click($$('#fo-certs-t [data-act=fo-certs]').find(b=>/William Deschamps/.test(b.textContent)));await wait(150);
$('#fc-o-ps').value='2026-10-01';$('#fc-e-ps').value='';await sub();
const cw=(window.__store.get('certificats/el-119-05')||{}).items||[];
ok('certificate renewed',(cw.find(x=>x.type==='ps')||{}).expire==='2029-10-01',JSON.stringify(cw));
/* ---------- dossier ENPQ : prêts, frais d’examen, inscription ---------- */
await fo('enpq');
pick('#fo-g','c122');await wait(150);pick('#fo-ef','pret');await wait(150);
const rows=$$('#fo-enpq-t tbody tr');
ok('ENPQ ready list',rows.length>=3&&rows.every(r=>/Prêt/.test(r.textContent)),rows.length);
const ids=$$('#fo-enpq-t [data-act=fo-esel]').slice(0,2).map(i=>i.dataset.id);
for(const id of ids){click($(`#fo-enpq-t [data-act=fo-esel][data-id="${id}"]`));await wait(60);}
const cp0=coll('compta').length;
click($('#fo-enpq-fees'));await wait(800);
const fees=coll('compta').filter(x=>x.type==='chg'&&x.note==='ENPQ');
ok('exam fees added',coll('compta').length===cp0+4&&fees.length===4&&fees.filter(x=>x.ttc===34430).length===2&&fees.filter(x=>x.ttc===46000).length===2);
for(const id of ids){click($(`#fo-enpq-t [data-act=fo-esel][data-id="${id}"]`));await wait(60);}
click($('#fo-enpq-sent'));await wait(800);
ok('marked registered',ids.every(id=>(window.__store.get('dossiers-enpq/'+id)||{}).envoye==='2026-10-09'));
click($('#fo-enpq-csv'));await wait(200);
ok('ENPQ export',$$('.toast').some(t=>/candidats-enpq\.csv/.test(t.textContent)));
/* ---------- relevé de formation ---------- */
await fo('releve');
ok('training record',!!$('#fo-rel')&&/Heures de formation suivies/.test($('#fo-rel').textContent)&&/Évaluations pratiques/.test($('#fo-rel').textContent)&&$$('#fo-rel table').length>=3&&!!$('#fo-print'));
/* ---------- banque de questions ---------- */
await fo('quest');
ok('question bank',$$('#main .xm-row.xm-qb').length===35&&!!$('#qb-hard')&&$$('#qb-hard li').length>=1);
click($('#qb-imp'));await wait(150);
typeIn('#qi-txt','Quelle couleur a un extincteur à eau ? ; Rouge ; Vert ; Bleu ; A\nLigne sans format\nCombien de pompiers dans une équipe de recherche ? ; Un ; Deux ; Trois ; B');await wait(40);
ok('import preview',/2 questions prêtes/.test($('#qi-sum').textContent)&&/lignes ignorées : 2/.test($('#qi-sum').textContent));
$('#drawer form').requestSubmit();await wait(700);
const qs=coll('questions');
ok('questions imported',qs.length===37&&qs.some(q=>/équipe de recherche/.test(q.texte)&&q.bonne===1&&q.choix.length===3));
click($('#qb-new'));await wait(150);
$('#qq-texte').value='Le monoxyde de carbone est :';$('#qq-c0').value='Inodore et toxique';$('#qq-c1').value='Bleu et sans danger';$('#qq-c2').value='Plus lourd que l’eau';
click($$('#drawer input[name=qq-bonne]')[0]);await sub();
ok('question added',coll('questions').some(q=>/monoxyde/.test(q.texte)&&q.bonne===0&&q.choix.length===3));
/* ---------- examens blancs ---------- */
await fo('blancs');
ok('practice exams',$$('#main .xm-row.xm-qe').length===2&&/Ouvert/.test($('#main .xm-list').textContent)&&/À venir/.test($('#main .xm-list').textContent));
click($('#qb-b-new'));await wait(150);
{const r=(e=>({left:e.offsetLeft,top:e.offsetTop,right:e.offsetLeft+e.offsetWidth,bottom:e.offsetTop+e.offsetHeight,width:e.offsetWidth,height:e.offsetHeight}))($('#drawer')),k=$$('#drawer input[name=qe-m]').map(i=>i.closest('.ck').getBoundingClientRect());
 ok('practice exam: centered window, modules in 2 columns',$('#drawer').classList.contains('sh-center')&&Math.round(r.width)===840&&Math.abs(r.left+r.right-innerWidth)<2&&k[0].top===k[1].top&&k[1].left>k[0].right,Math.round(r.width));}
$('#qe-nom').value='Blanc · premiers soins';click($('#drawer input[name=qe-m][value="11"]'));$('#qe-nb').value='5';await sub();
ok('practice exam created',coll('ex-blancs').length===3&&coll('ex-blancs').some(x=>x.nom==='Blanc · premiers soins'&&x.modules.join()==='11'&&x.nb===5));
/* ---------- l’élève : carnet, signature, examen blanc, entraînement, présence ---------- */
click($('[data-role=student]'));await wait(200);pick('#sel-group','c119');await wait(200);
ok('student menu',!!$('#nav-formation')&&/Ma formation/.test($('#nav-formation').textContent)&&!!$('#qr-in'));
click(navBtn('formation'));await wait(250);
ok('student sub menu',$$('#nav [data-k=fo]').length===6&&$('#fo-carnet').getAttribute('aria-current')==='page'&&!!$('#fo-mycarnet')&&!!$('#fo-tosign'));
const uns=coll('evaluations').find(v=>v.eleve==='el-119-01'&&!v.sig.el);
click($(`#fo-mycarnet [data-act=fo-view][data-id="${uns.id}"]`)||$$('#fo-mycarnet [data-act=fo-view]').find(b=>b.dataset.id===uns.id));await wait(150);
click($('#fo-sign'));await wait(300);
ok('student signs',!!(window.__store.get('evaluations/'+uns.id).sig.el)&&!$('#fo-sign'));
click($('#dr-close'));await wait(60);
click($('#fo-blancs'));await wait(200);
ok('student practice exams',$$('.qb-card').length===2&&!!$('#qb-start-b-s1'),$$('.qb-card').length);
click($('#qb-start-b-s1'));await wait(500);
const t1=coll('ex-tentatives').find(t=>t.eleve==='el-119-01'&&t.exam==='b-s1');
ok('attempt started',!!t1&&t1.q.length===20&&!t1.fin&&!!$('#qb-take')&&/Question 1 sur 20/.test($('#qb-take').textContent));
click($('#qb-o0'));await wait(200);click($('#qb-next'));await wait(100);click($('#qb-o1'));await wait(200);
ok('answers saved',(window.__store.get('ex-tentatives/'+t1.id).r||[]).filter(x=>x!=null).length===2&&$$('.qb-dot.done').length===2);
click($('#qb-finish'));await wait(80);
ok('hand in asks first',/18 questions sont sans réponse/.test($('.qb-end').textContent));
click($('#qb-finish-yes'));await wait(400);
const t2=window.__store.get('ex-tentatives/'+t1.id);
ok('attempt handed in',!!t2.fin&&t2.total===20&&t2.pct===Math.round(t2.score/20*100)&&!!$('#qb-result')&&$$('.qb-cor').length===20);
click($('[data-act=qb-back]'));await wait(150);
click($('#fo-train'));await wait(150);click($('#qb-train-go'));await wait(150);
click($('#qb-train-q .qb-opt'));await wait(100);
ok('training feedback',!!$('#qb-fb')&&/réponse/.test($('#qb-fb').textContent)&&!!$('#qb-tnext'));
click($('#fo-certs'));await wait(150);ok('my certificates',$$('#fo-mycerts li').length===4);
click($('#fo-enpq'));await wait(150);ok('my ENPQ file',!!$('#fo-myenpq')&&$$('#fo-myenpq li').length>=6);
/* ---------- présence par code QR ---------- */
click($('[data-role=admin]'));await wait(200);
click(navBtn('classes'));await wait(200);click($('#cl-c119'));await wait(200);click($('#fi-tab-rattraper'));await wait(150);
click($('[data-act=open-att]'));await wait(150);
click($('#qr-open'));await wait(1500);
const code=($('#qr-code')||{}).textContent||'';
ok('QR code shown',/^[A-Z2-9]{6}$/.test(code)&&!!$('#qr-img')&&/0<\/b> sur 12/.test($('#qr-n').innerHTML),code);
click($('#dr-close'));await wait(80);if($('[data-act=att-discard]')){click($('[data-act=att-discard]'));await wait(60);}
click($('[data-role=student]'));await wait(200);pick('#sel-group','c119');await wait(150);
click($('#qr-in'));await wait(150);$('#qr-c').value=code.toLowerCase();await sub();
ok('student signals presence',coll('presences-qr').some(x=>x.code===code&&x.eleve==='el-119-01')&&!$('#drawer form'));
click($('[data-role=admin]'));await wait(200);
click(navBtn('classes'));await wait(200);click($('#cl-c119'));await wait(200);click($('#fi-tab-rattraper'));await wait(150);
click($('[data-act=open-att]'));await wait(300);
ok('teacher sees the scan',!!$('#qr-mark')&&/1<\/b> sur 12/.test($('#qr-n').innerHTML)&&/Alexandre Beaulieu/.test($('#qr-n').textContent));
click($('#qr-mark'));await wait(60);click($('[data-act=att-save]'));await wait(400);
ok('marked present',coll('presences').some(p=>p.statuts&&p.statuts['el-119-01']==='P'&&p.maj&&p.maj.startsWith('2026-10-09')));
click($('#dr-close'));await wait(60);
/* ---------- proposer des enseignants ---------- */
click(navBtn('affectations'));await wait(250);
ok('propose button',!!$('#af-auto'));
click($('#af-auto'));await wait(300);
const nPlan=$$('.af-plan input[data-afp]').length;
ok('proposals',nPlan>0&&$$('.af-plan>li').length>0,nPlan);
const ap0=coll('candidatures').filter(c=>c.statut==='approuve').length;
click($('#af-auto-go'));await wait(1500);
ok('proposals assigned',coll('candidatures').filter(c=>c.statut==='approuve').length===ap0+nPlan,coll('candidatures').filter(c=>c.statut==='approuve').length+' / '+(ap0+nPlan));
/* ---------- recherche Ctrl+K ---------- */
key(document,'k',{ctrlKey:true});await wait(100);
ok('search opens',!!$('#cmdk')&&!$('#cmdk').hidden&&document.activeElement===$('#cmdk-q')&&$$('.ck-it').length>3);
typeIn('#cmdk-q','beaulieu');await wait(60);
ok('search finds the student',/Alexandre Beaulieu/.test(($('.ck-it.on')||{}).textContent||''));
key($('#cmdk-q'),'Enter');await wait(250);
ok('search opens the file',$('#cmdk').hidden&&/Alexandre Beaulieu/.test(($('#fi-name')||{}).textContent||''));
key(document,'k',{ctrlKey:true});await wait(100);typeIn('#cmdk-q','proposer');await wait(60);key($('#cmdk-q'),'Enter');await wait(400);
ok('search runs an action',!!$('.af-plan')||/Enseignants proposés/.test(($('#drawer')||{}).textContent||''));
click($('#dr-close'));await wait(60);
key(document,'k',{ctrlKey:true});await wait(60);key($('#cmdk-q'),'Escape');await wait(60);
ok('search closes',$('#cmdk').hidden);
/* ---------- vues enregistrées ---------- */
click(navBtn('eleves'));await wait(250);
pick('#s-g','c120');await wait(150);
click($('#sv-save'));await wait(100);$('#sv-nom').value='Classe 120';$('[data-form=sv-save]').requestSubmit();await wait(150);
ok('view saved',!!$('#sv-0')&&$('#sv-0').getAttribute('aria-pressed')==='true'&&/Classe 120/.test($('#sv-bar').textContent));
click($('#sv-def'));await wait(150);
ok('base view',$('#s-g').value===''&&$('#sv-def').getAttribute('aria-pressed')==='true');
click($('#sv-0'));await wait(150);
ok('saved view restored',$('#s-g').value==='c120'&&$$('#main tbody tr[data-id]').length===10);
click($('#sv-bar .sv-x'));await wait(150);
ok('view removed',!$('#sv-bar'));
/* ---------- modification sur place ---------- */
pick('#s-g','');await wait(150);
const row=$('#main tbody tr[data-id]'), rid=row.dataset.id;
click(row.querySelector('.ie-btn'));await wait(60);
ok('inline field',!!$('#ie-in')&&!$('#fi-name'));
$('#ie-in').value='450 555 0199';key($('#ie-in'),'Enter');await wait(300);
ok('inline saved',window.__store.get('eleves/'+rid).telephone==='450 555 0199'&&!$('#ie-in')&&/450 555 0199/.test($(`#main tbody tr[data-id="${rid}"]`).textContent));
click($(`#main tbody tr[data-id="${rid}"] .ie-btn`));await wait(60);$('#ie-in').value='000';key($('#ie-in'),'Escape');await wait(200);
ok('inline cancel',window.__store.get('eleves/'+rid).telephone==='450 555 0199'&&!$('#ie-in'),window.__store.get('eleves/'+rid).telephone+' / '+!!$('#ie-in'));
click(navBtn('personnel'));await wait(250);
const sr=$$('#main tbody tr').find(r=>r.querySelector('[data-k=pe-st]')), sid=sr.querySelector('[data-k=pe-st]').dataset.id;
click(sr.querySelector('[data-k=pe-st]'));await wait(60);pick('#ie-in','En congé');await wait(300);
ok('inline status',window.__store.get('enseignants/'+sid).statut==='En congé');
/* ---------- hors ligne ---------- */
window.dispatchEvent(new Event('offline'));await wait(100);
ok('offline notice',!!$('#offline-note')&&/Hors ligne/.test($('#offline-note').textContent));
click(navBtn('eleves'));await wait(200);
{const r2=$('#main tbody tr[data-id]'), i2=r2.dataset.id;click(r2.querySelector('.ie-btn'));await wait(60);$('#ie-in').value='819 555 0101';key($('#ie-in'),'Enter');await wait(300);
 ok('offline write kept',window.__store.get('eleves/'+i2).telephone==='819 555 0101'&&$$('.toast').some(t=>/envoyé au retour du réseau/.test(t.textContent)));}
window.dispatchEvent(new Event('online'));await wait(100);
ok('back online',!$('#offline-note')&&$$('.toast').some(t=>/De retour en ligne/.test(t.textContent)));
/* ---------- services incendie ---------- */
await fo('serv');await wait(300);
ok('fire departments',$$('#main .xm-row.xm-sv').length===3&&coll('rapports-service').length===3,coll('rapports-service').length);
const rep=window.__store.get('rapports-service/s-stjerome');
click($('[data-act=svc-edit][data-id=s-stjerome]'));await wait(150);
{const r=(e=>({left:e.offsetLeft,top:e.offsetTop,right:e.offsetLeft+e.offsetWidth,bottom:e.offsetTop+e.offsetHeight,width:e.offsetWidth,height:e.offsetHeight}))($('#drawer'));ok('department: large sheet',$('#drawer').classList.contains('sh-sheet')&&Math.round(r.width)===980&&Math.round(r.top)===24&&Math.round(innerHeight-r.bottom)===24,Math.round(r.width));}
click($('#dr-close'));await wait(60);
ok('report content',!!rep&&rep.eleves.length===coll('eleves').filter(e=>e.service==='s-stjerome').length&&rep.factures.length===1&&rep.factures[0].num==='F-2026-001');
click($('[data-act=svc-view][data-id=s-stjerome]'));await wait(300);
ok('department view',/service incendie/i.test($('#ws-label').textContent)&&$$('#svc-t tbody tr').length===rep.eleves.length&&/F-2026-001/.test($('#svc-fact').textContent)&&$$('#nav button').length===1);
click($('[data-role=admin]'));await wait(200);
click(navBtn('comptes'));await wait(200);click($('#ac-new'));await wait(150);click($('#ac-role-service'));await wait(80);
ok('department account role',[...$('#ac-ref').options].some(o=>/Saint-Jérôme/.test(o.textContent)));
click($('#dr-close'));await wait(60);
/* ---------- la cloche ---------- */
click($('#nf-bell'));await wait(150);
{const r=(e=>({left:e.offsetLeft,top:e.offsetTop,right:e.offsetLeft+e.offsetWidth,bottom:e.offsetTop+e.offsetHeight,width:e.offsetWidth,height:e.offsetHeight}))($('#drawer')),b=$('#nf-bell').getBoundingClientRect();
 ok('bell: bubble under the bell',$('#drawer').classList.contains('sh-pop')&&r.top>=b.bottom&&r.right<=innerWidth&&r.bottom<=innerHeight&&r.right>=b.left,[Math.round(r.top),Math.round(b.bottom)].join(' '));}
ok('bell: certificates and prerequisites',$$('.nf-row').some(r=>/Certificats/.test(r.textContent))&&$$('.nf-row').some(r=>/préalables/.test(r.textContent)));
click($('#dr-close'));await wait(60);
}catch(e){R.push('ERROR '+e.message+' '+e.stack);}
R.push('ERRS '+JSON.stringify(window.__errs));
const pre=document.createElement('pre');pre.id='results';pre.textContent=R.join('\n');document.body.appendChild(pre);
})();
