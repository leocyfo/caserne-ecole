(async()=>{
/* Le site avec ses vrais fichiers d’options, ou sans eux (voir build-opt.js) : le fichier décide de ce qui s’affiche */
const R=[];const ok=(name,cond,info)=>R.push((cond?'PASS ':'FAIL ')+name+(info!==undefined?' :: '+info:''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const click=el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
const C=()=>window.__store.get('config/ecole');
const SANS=window.__SANS, sk=!SANS.includes('stock'), cp=!SANS.includes('compta');
const menu=async()=>{const b=$('.nav-back');if(b){click(b);await wait(120);}};
const go=async p=>{await menu();click($(`#nav [data-page="${p}"]`));await wait(150);};
const para=async t=>{await go('params');click($('#ps-'+t));await wait(100);};
const role=async r=>{click($(`[data-role=${r}]`));await wait(150);};
const noErr=(name)=>ok(name,!(window.__errs||[]).length,(window.__errs||[]).slice(0,2).join(' | '));
const nCompta=()=>[...window.__store.keys()].filter(k=>k.startsWith('compta/')).length;
/* le formulaire de réapprovisionnement d’un consommable */
const conso=([...window.__store.entries()].find(([k,v])=>k.startsWith('stock/')&&v.suivi==='qte')||[''])[0].slice(6);
const restock=async()=>{const a=document.createElement('button');a.dataset.act='stk-go';a.dataset.id=conso;a.dataset.v='reappro';document.body.appendChild(a);click(a);a.remove();await wait(120);};
try{
await wait(500);

/* Le menu suit les fichiers */
ok('stock in the menu only with its file',!!$('#nav-stock')===sk);
ok('compta in the menu only with its file',!!$('#nav-compta')===cp);
ok('stock styles only with its file',[...document.querySelectorAll('style')].some(x=>/\.stk-seg/.test(x.textContent))===sk);
{const pages=$$('#nav button[data-page]').map(b=>b.dataset.page);
 for(const p of pages) await go(p);
 ok('every page opens',pages.length>=10,pages.length);noErr('no error on any page');}

/* Paramètres : seulement ce qui existe */
const db=await window.claude.use('db');
await para('menu');
ok('no options section in the settings',!$('#ps-options'));
ok('menu settings follow the files',!!$('#p-menu-stock')===sk&&!!$('#p-menu-compta')===cp&&!!$('#p-menu-classes'));
click($('#ps-notifs'));await wait(100);
ok('notification settings follow the files',!!$('#p-nf-stock')===sk&&!!$('#p-nf-compta')===cp&&!!$('#p-nf-cand'));
click($('#ps-acces'));await wait(100);
ok('rights follow the files',!!$('#p-perm-equipEl')===sk&&!!$('#p-perm-compteEl')===cp&&!!$('#p-perm-paieEns')===cp&&!!$('#p-perm-cand'));

/* Dossier d’un élève, frais, recherche */
await go('eleves');
click($('[data-act=student]'));await wait(450);
ok('student file tabs',$$('.dos-tab').length===(sk?6:5)&&!!$('#fi-tab-equipement')===sk&&!!$('#fi-tab-documents'));
if(sk){click($('#fi-tab-equipement'));await wait(100);ok('equipment tab works',!!$('#fi-equip'));}
await go('formation');
click($('#fo-enpq'));await wait(120);
ok('ENPQ fees follow compta',!!$('#fo-enpq-fees')===cp&&!!$('#fo-enpq-csv'));
ok('fees requirement follows compta',/Frais à jour/.test($('#main').textContent)===cp||!cp&&!/Frais à jour/.test($('#main').textContent));
click($('#fo-regl'));await wait(120);
ok('formation settings follow compta',!!$('#fr-frais')===cp&&!!$('#fr-pieces'));
click($('[data-act=cmdk]'));await wait(100);
{const q=$('#cmdk-q');q.value='stock';q.dispatchEvent(new Event('input',{bubbles:true}));await wait(100);
 ok('search follows stock',/Stock/.test($('#cmdk-l').textContent)===sk,$('#cmdk-l').textContent.slice(0,80));
 q.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await wait(60);}

/* Ce qui n’est pas à l’écran n’est pas perdu en enregistrant */
if(!sk&&!cp){
 await db.doc('config/ecole').set(Object.assign({},C(),{perms:Object.assign({},C().perms,{paieEns:false}),notifs:Object.assign({},C().notifs,{stock:false}),menuMasque:['compta'],menuNoms:{compta:'Argent'}}));await wait(60);
 await para('menu');$('#p-menu-classes').closest('form').requestSubmit();await wait(300);
 click($('#ps-notifs'));await wait(100);$('#p-nf-cand').closest('form').requestSubmit();await wait(300);
 click($('#ps-acces'));await wait(100);$('#p-perm-cand').closest('form').requestSubmit();await wait(300);
 ok('hidden settings kept',C().perms.paieEns===false&&C().perms.cand!==undefined&&C().notifs.stock===false&&C().notifs.cand!==undefined&&C().menuMasque.includes('compta')&&C().menuNoms.compta==='Argent',JSON.stringify([C().perms,C().notifs,C().menuMasque,C().menuNoms]));
 await db.doc('config/ecole').set(Object.assign({},C(),{perms:Object.assign({},C().perms,{paieEns:true}),notifs:Object.assign({},C().notifs,{stock:true}),menuMasque:[],menuNoms:{}}));await wait(60);
 await go('formation');click($('#fo-regl'));await wait(120);
 $('#fr-save').closest('form').requestSubmit();await wait(300);
 ok('exam fees kept when their field is hidden',C().formation.frais.length>0,JSON.stringify(C().formation.frais));
}

/* Les pages de l’option, et le lien entre le Stock et la Compta */
if(sk){
 await menu();click($('#nav-stock'));await wait(200);
 ok('stock page',!!$('#sk-dash')&&$$('#nav [data-k=sk]').length===13&&!!$('#skd-out'));
 for(const t of $$('#nav [data-k=sk]').map(b=>b.id)){click($('#'+t));await wait(70);}
 noErr('every stock section opens');
 const n=nCompta();
 await restock();
 ok('expense note follows compta',!!$('#sx-qte')&&/Compta/.test($('#drawer').textContent)===cp);
 $('#sx-qte').value='2';$('#sx-cout').value='25,00';$('#sx-qte').closest('form').requestSubmit();await wait(350);
 ok('a cost becomes an expense only with compta',nCompta()===n+(cp?1:0),n+' → '+nCompta());
 const cl=$('#dr-close');if(cl){click(cl);await wait(60);}
}
if(cp){
 await menu();click($('#nav-compta'));await wait(200);
 ok('compta page',!!$('#cpt-dash')&&$$('#nav [data-k=cp]').length===9&&!!$('#main .kpi'));
 for(const t of $$('#nav [data-k=cp]').map(b=>b.id)){click($('#'+t));await wait(70);}
 noErr('every compta section opens');
}

/* Les autres rôles */
await role('teacher');
ok('teacher material follows stock',!!$('#nav-stock')===sk&&!!$('#nav-mescours'));
click($('#nav-profil'));await wait(120);
ok('teacher pay follows compta',!!$('#pf-paie')===cp&&/Mes informations/.test($('#main').textContent));
await role('student');
click($('#nav-profil'));await wait(120);
ok('student panels follow the files',!!$('#pf-equip')===sk&&(!cp?!$('#pf-compte'):true)&&/Mes informations/.test($('#main').textContent));
await role('service');
ok('service invoices follow compta',!!$('#svc-fact')===cp&&/Factures à payer/.test($('#main').textContent)===cp);
await role('admin');
noErr('no page error at the end');
}catch(err){R.push('ERROR '+(err&&err.stack||err));}
R.push('ERRS '+JSON.stringify(window.__errs||[]));
const p=document.createElement('pre');p.id='results';p.textContent=R.join('\n');document.body.appendChild(p);
})();
