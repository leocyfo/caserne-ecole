(async()=>{
/* Le site sur un téléphone de 390 × 844 px (la page tourne dans un cadre de cette taille, voir build-phone.js) */
const R=[];const ok=(name,cond,info)=>R.push((cond?'PASS ':'FAIL ')+name+(info!==undefined?' :: '+info:''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const click=el=>{if(!el)throw new Error('missing element');el.click();};
const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden';};
const rect=e=>e.getBoundingClientRect();
const lbl=e=>e.id?'#'+e.id:(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\s+/)[0]:e.tagName.toLowerCase());
const PHONE_FIRST=860; // haut de la première classe, données d’exemple affichées (937 avant l’étape 2)
const tooWide=()=>document.documentElement.scrollWidth>innerWidth+1;
const smallFields=()=>$$('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]),select,textarea').filter(vis).filter(e=>parseFloat(getComputedStyle(e).fontSize)<16).map(lbl);
const smallText=()=>{const out=[];const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while((n=tw.nextNode())){if(!n.textContent.trim())continue;const p=n.parentElement;if(!p||p.closest('.bell-n,.brand,#results,script,style'))continue;if(!vis(p))continue;
    if(parseFloat(getComputedStyle(p).fontSize)<12)out.push(lbl(p)+' « '+n.textContent.trim().slice(0,18)+' »');}
  return out;};
const closeDrawer=async()=>{for(let i=0;i<3&&$('#drawer:not([hidden])');i++){const x=$('#drawer [data-act=att-discard]')||$('#dr-close');if(!x)break;click(x);await wait(120);}};
try{
await wait(700);
ok('phone width',innerWidth===390&&matchMedia('(max-width:760px)').matches,innerWidth);

/* Toutes les pages des trois rôles : rien de plus large que l’écran, champs à 16 px, textes à 12 px au moins */
const PAGES={admin:['calendar','classes','eleves','personnel','modules','affectations','examens','annee','comptes','historique','params','nouveautes'],
  teacher:['calendar','mescours','dispos','examens','annee','profil'],student:['calendar','examens','annee','profil']};
const wide=[],fields=[],tiny=[];let seen=0;
for(const role of Object.keys(PAGES)){
  click($('[data-role='+role+']'));await wait(150);
  for(const p of PAGES[role]){
    const b=$('#nav-'+p);if(!b){wide.push(role+'/'+p+' : pas dans le menu');continue;}
    click(b);await wait(220);window.scrollTo(0,0);seen++;
    if(tooWide())wide.push(role+'/'+p+' '+document.documentElement.scrollWidth+' px');
    const f=smallFields();if(f.length)fields.push(role+'/'+p+' : '+f.slice(0,4).join(', '));
    const t=smallText();if(t.length)tiny.push(role+'/'+p+' : '+t.length+' · '+t.slice(0,3).join(' · '));
  }
}
ok('22 pages visited',seen===22,seen);
ok('no page wider than the phone',!wide.length,wide.join(' ; '));
ok('fields at 16 px (no zoom on iPhone)',!fields.length,fields.join(' ; '));
ok('text at 12 px or more',!tiny.length,tiny.join(' ; '));

/* Horaire de l’administration : la barre tient en trois rangées et la première classe arrive dans le premier écran */
click($('[data-role=admin]'));await wait(150);click($('#nav-calendar'));await wait(220);window.scrollTo(0,0);
{const kids=[...$('.ctl').children].filter(vis), tops=kids.map(k=>rect(k).top).sort((a,b)=>a-b);let rowsN=tops.length?1:0;for(let i=1;i<tops.length;i++)if(tops[i]-tops[i-1]>14)rowsN++;
 const first=$$('#main .wk-row:not(.wk-head)').filter(vis)[0], late=$('#late-pill'), add=$('#new-course');
 ok('admin toolbar on 3 rows',rowsN<=3,rowsN+' rangées · '+kids.map(lbl).join(' '));
 ok('short labels on the phone',!!late&&!!add&&/^\d+ en retard$/.test(late.innerText.replace(/\s+/g,' ').trim())&&add.innerText.replace(/\s+/g,' ').trim()==='Ajouter'&&/présences? en retard cette semaine/.test(late.title+late.textContent),(late?late.innerText:'-')+' | '+(add?add.innerText:'-'));
 ok('first class row in the first screen',!!first&&rect(first).top+scrollY<=PHONE_FIRST,first?Math.round(rect(first).top+scrollY):'-');}

/* Élèves, Personnel, Comptes : le tableau devient une liste qui tient dans l’écran, l’essentiel sur la ligne du nom */
{const bad=[];
 for(const p of ['eleves','personnel','comptes']){
   click($('#nav-'+p));await wait(250);window.scrollTo(0,0);
   const w=$('#main .tbl-wrap'), t=w&&w.querySelector('table'), rows=$$('#main .tbl.stack tbody tr').filter(vis);
   if(!t||!t.classList.contains('stack')){bad.push(p+' : pas en liste');continue;}
   if(w.scrollWidth>w.clientWidth+1||rows.some(r=>rect(r).right>innerWidth+1))bad.push(p+' : '+w.scrollWidth+' px');
   if(vis(t.querySelector('thead')))bad.push(p+' : en-têtes visibles');
   const r0=rows[0], top=r0&&r0.querySelector('.tb-top');
   if(!r0||!top||!vis(top)||Math.abs(rect(top).top-rect(r0.cells[0]).top)>30)bad.push(p+' : rien en haut à droite');
 }
 ok('students, staff and accounts as lists',!bad.length,bad.join(' ; '));
 click($('#nav-comptes'));await wait(250);
 const linked=$$('#main .tbl.stack tbody tr').filter(r=>/Élève|Enseignant/.test((r.querySelector('.tb-top')||{}).textContent||''));
 ok('accounts keep the linked record on the phone',linked.length>=2&&linked.every(r=>{const f=r.querySelector('td[data-l=Fiche]');return f&&vis(f)&&f.textContent.trim().length>2;}),linked.map(r=>{const f=r.querySelector('td[data-l=Fiche]');return f&&vis(f)?f.textContent.trim():'(cachée)';}).join(' | '));
 click($('#nav-eleves'));await wait(250);
 const r1=$$('#main .tbl.stack tbody tr').filter(vis)[0];
 const lab=r1?[...r1.querySelectorAll('td[data-l]')].filter(vis).map(td=>getComputedStyle(td,'::before').content):[];
 ok('student row shows class, absences and lateness',!!r1&&/Classe \d+/.test(r1.innerText)&&lab.some(c=>/Absences/.test(c))&&lab.some(c=>/Retards/.test(c)),lab.join(','));}

/* Enseignant : la journée et les présences à rattraper se lisent sur toute la largeur */
click($('[data-role=teacher]'));await wait(150);click($('#nav-calendar'));await wait(220);
const rows=$$('#main .panel .list .lrow').filter(vis);
ok('teacher list rows use the full width',rows.length>0&&rows.every(r=>rect(r.querySelector('.what')).width>=rect(r).width-2),rows.map(r=>Math.round(rect(r.querySelector('.what')).width)+'/'+Math.round(rect(r).width)).join(' '));
const miss=$$('#main .miss-list .lrow').filter(vis);
ok('overdue rows: title wide, button under it',miss.length>0&&miss.every(r=>{const w=r.querySelector('.what'),g=r.querySelector('.miss-go');return rect(w).width>=200&&(!g||!vis(g)||rect(g).top>=rect(w).bottom-1);}),miss.map(r=>Math.round(rect(r.querySelector('.what')).width)).join(' '));
const chips=$$('#main .lrow .ti .chore-chip').filter(vis);
ok('chore chip stays inside its title',chips.every(c=>{const t=rect(c.closest('.ti')),k=rect(c);return k.top>=t.top-1&&k.bottom<=t.bottom+1;}),chips.length);

/* Prise des présences : boutons de 44 px, rien qui dépasse */
click(miss[0]||rows[0]);await wait(300);
const ab=$$('#drawer .ab').filter(vis);
ok('attendance panel full width',!!$('#drawer')&&Math.round(rect($('#drawer')).width)===390&&$('#drawer').scrollWidth<=$('#drawer').clientWidth+1,$('#drawer')&&Math.round(rect($('#drawer')).width));
ok('P A R M buttons at 44 px',ab.length>=8&&ab.every(b=>rect(b).width>=44&&rect(b).height>=44),ab.length+' · '+(ab[0]?Math.round(rect(ab[0]).width)+'x'+Math.round(rect(ab[0]).height):''));
const all=$('#drawer [data-act=att-all]'),save=$('#drawer [data-act=att-save],#drawer [data-act=att-save-close]');
ok('mark-all, save and close at 44 px',!!all&&!!save&&rect(all).height>=44&&rect(save).height>=44&&rect($('#dr-close')).height>=44&&rect($('#dr-close')).width>=44,(all?Math.round(rect(all).height):'-')+' / '+(save?Math.round(rect(save).height):'-')+' / '+Math.round(rect($('#dr-close')).width));
const names=$$('#drawer .att-list li').filter(vis);
ok('names never under the buttons',names.length>0&&names.every(li=>{const n=rect(li.querySelector('.nm')),g=rect(li.querySelector('.att-btns'));return n.right<=g.left+1||n.bottom<=g.top+1;}),names.length);
await closeDrawer();

/* Élève : examens à venir avec le titre entier et l’étiquette dessous */
click($('[data-role=student]'));await wait(150);click($('#nav-calendar'));await wait(220);
const xm=$$('#main .xm-mini').filter(vis);
ok('next exams: full title, chip under it',xm.length>0&&xm.every(r=>{const b=r.querySelector('.xm-t b'),c=r.querySelector(':scope>.chip');return b.scrollWidth<=b.clientWidth+1&&(!c||rect(c).top>=rect(b).bottom-1);}),xm.length);
click($('[data-role=admin]'));await wait(150);click($('#nav-calendar'));await wait(150);
}catch(e){R.push('ERROR '+e.message+' '+e.stack);}
R.push('ERRS '+JSON.stringify(window.__errs));
const pre=document.createElement('pre');pre.id='results';pre.textContent=R.join('\n');document.body.appendChild(pre);
})();
