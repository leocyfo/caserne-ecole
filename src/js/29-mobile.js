/* ---------- Téléphone : coquille mobile ----------
   Sur un écran étroit (jusqu’à 760 px, comme les styles de téléphone), le menu de gauche cède la place à :
   - des onglets en bas (4 pages selon le rôle + « Plus ») ;
   - « Plus » : une feuille qui monte du bas avec tout le menu, le profil, la recherche et la déconnexion ;
   - les sections des pages à sous-menu (Paramètres, Stock, Compta, Formation) en pastilles sous le titre.
   Le menu de gauche reste rendu (caché) : c’est lui que le site met à jour, on le relit ici. Styles : 20-mobile.css.
   Sur un grand écran, rien ne change. */
const M={more:false,close:false,mq:matchMedia('(max-width:760px)')};
const mOn=()=>M.mq.matches;
/* Les 4 onglets de chaque rôle (s’ils sont dans son menu) ; le reste va dans « Plus » */
const M_TABS={admin:['accueil','calendar','classes','eleves'],teacher:['accueil','calendar','mescours','examens'],student:['accueil','calendar','examens','formation'],service:['recrues']};
const M_SHORT={calendar:'Horaire',eleves:'Élèves',modules:'Modules',mescours:'Séances',recrues:'Recrues',accueil:'Accueil',examens:'Examens',classes:'Classes'};
const M_IC={
  more:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'
};
const mIcon=k=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${M_IC[k]||IC[k]||''}</svg>`;
const mShort=(k,l)=>k==='formation'?(S.role==='teacher'?'Évaluations':'Formation'):M_SHORT[k]||navLbl(k,l);
function mEls(){
  if($('#mtabs')) return;
  const tabs=document.createElement('nav');tabs.id='mtabs';tabs.className='mtabs';tabs.setAttribute('aria-label','Menu principal');
  const more=document.createElement('div');more.id='mmore';more.className='mmore';more.hidden=true;
  const sub=document.createElement('nav');sub.id='msub';sub.className='msub';sub.hidden=true;sub.setAttribute('aria-label','Sections');
  document.body.appendChild(tabs);document.body.appendChild(more);
  $('#heading').after(sub);
}
function mTabs(){
  const shown=navShown(), keys=shown.map(n=>n[0]);
  const pick=(M_TABS[S.role]||[]).filter(k=>keys.includes(k));
  for(const k of keys){if(pick.length>=4)break;if(!pick.includes(k))pick.push(k);}
  return {shown,pick:pick.slice(0,4).map(k=>shown.find(n=>n[0]===k))};
}
function mMoreHTML(shown,cur){
  const secs=[];let sec={t:'',items:[]};
  for(const n of shown){if(n[3]&&sec.items.length){secs.push(sec);sec={t:n[3],items:[]};}else if(n[3])sec.t=n[3];sec.items.push(n);}
  if(sec.items.length) secs.push(sec);
  const person=(($('#person')||{}).innerHTML||'').replace(/\sid="[^"]*"/g,'');
  return `<div class="mm-in" role="dialog" aria-modal="true" aria-label="Menu"><div class="mm-grab"></div>
    <div class="mm-top"><span class="mm-brand"><span class="lg"><img src="site/embleme-blanc.svg" alt=""></span><span><b>Pompier<i>Note</i></b><small>${esc(($('#ws-label')||{}).textContent||'')}</small></span></span><button type="button" class="mm-x" data-act="m-close" aria-label="Fermer le menu">${icon('x')}</button></div>
    <div class="mm-person">${person}</div>
    <button type="button" class="mm-search" data-act="cmdk">${mIcon('search')}<span>Rechercher une page, un élève, un cours…</span></button>
    ${secs.map(s=>`${s.t?`<div class="mm-sec">${esc(s.t)}</div>`:''}<div class="mm-grid">${s.items.map(([k,l,i,,,todo])=>`<button type="button" data-act="nav" data-page="${k}"${cur===k?' aria-current="page"':''}>${icon(i)}<span>${esc(navLbl(k,l))}</span>${todo?`<i class="mm-todo">${esc(todo)}</i>`:''}${k==='nouveautes'&&nvUnseen()?`<i class="mm-todo">${nvUnseen()>9?'9+':nvUnseen()}</i>`:''}</button>`).join('')}</div>`).join('')}
    ${siteMode()?`<button type="button" class="mm-out" data-act="logout">${mIcon('out')}Se déconnecter</button>`:''}</div>`;
}
/* Sous-menu de la page : on reprend les entrées que le site a mises dans le menu de gauche (sans leurs id) */
function mSubHTML(){
  const nav=$('#nav');if(!nav||!nav.querySelector('.nav-back')) return '';
  return [...nav.querySelectorAll('li>button:not(.nav-back)')].map(b=>{
    const attrs=[...b.attributes].filter(a=>a.name.startsWith('data-')||a.name==='aria-current'||a.name==='title').map(a=>` ${a.name}="${esc(a.value)}"`).join('');
    return `<button type="button"${attrs}>${b.innerHTML}</button>`;
  }).join('');
}
function mRender(){
  if(!$('#heading')) return;
  const html=document.documentElement;
  if(!mOn()){
    /* grand écran : la coquille mobile disparaît, le menu de gauche revient */
    if(html.classList.contains('m')){html.classList.remove('m');$('#mtabs').hidden=true;$('#msub').hidden=true;const mm=$('#mmore');mm.hidden=true;mm.innerHTML='';mm._h='';if(!S.dr)document.body.classList.remove('lock');}
    M.more=false;return;
  }
  mEls();html.classList.add('m');$('#mtabs').hidden=false;
  const {shown,pick}=mTabs(), cur=(navGroup(S.page)||[])[0]||S.page, inPick=pick.some(n=>n&&n[0]===cur);
  const restTodo=shown.some(n=>n[5]&&!pick.some(p=>p&&p[0]===n[0]));
  setHTML($('#mtabs'),pick.filter(Boolean).map(([k,l,i,,,todo])=>`<button type="button" data-act="nav" data-page="${k}"${cur===k&&!M.more?' aria-current="page"':''}>${icon(i)}<span>${esc(mShort(k,l))}</span>${todo?'<i class="m-dot"></i>':''}</button>`).join('')
    +`<button type="button" id="m-more" data-act="m-more" aria-expanded="${M.more}" aria-controls="mmore"${!inPick||M.more?' aria-current="page"':''}>${mIcon('more')}<span>Plus</span>${restTodo||nvUnseen()?'<i class="m-dot"></i>':''}</button>`);
  const sub=$('#msub'), sh=mSubHTML();
  sub.hidden=!sh;setHTML(sub,sh);
  const mm=$('#mmore');
  if(M.more){setHTML(mm,mMoreHTML(shown,cur));if(mm.hidden){mm.hidden=false;document.body.classList.add('lock');const x=mm.querySelector('.mm-x');if(x)x.focus({preventScroll:true});}}
  else if(!mm.hidden){mm.hidden=true;mm.innerHTML='';mm._h='';if(!S.dr)document.body.classList.remove('lock');}
  const c=sub.querySelector('[aria-current="page"]');if(c&&sub._cur!==c.dataset.v){sub._cur=c.dataset.v;c.scrollIntoView({block:'nearest',inline:'center'});}
}
/* Aperçu de l’espace élève sur téléphone (un administrateur qui choisit « Élève » dans le bandeau) : un élève est dans
   une classe, on choisit donc l’ÉLÈVE affiché (sa classe suit), et non une classe. Avec un vrai compte élève, rien à choisir. */
{const _idSel=identitySelect;identitySelect=function(){
  if(!mOn()||S.role!=='student'||locked()) return _idSel();
  const o=groups().map(g=>{const els=studentsOf(g.id);return els.length?`<optgroup label="${esc(g.nom)}">${els.map(e=>`<option value="${esc(e.id)}"${e.id===S.student?' selected':''}>${esc(e.nom)}</option>`).join('')}</optgroup>`:'';}).join('');
  return o?`<label class="m-apercu"><span>Aperçu</span><select id="m-sel-eleve" aria-label="Élève affiché (aperçu)">${o}</select></label>`:'';
};}
document.addEventListener('change',e=>{
  if(e.target.id!=='m-sel-eleve') return;
  S.student=e.target.value;const el=byId(S.data.eleves,e.target.value);if(el)S.group=el.groupe;savePrefs();render();
});
/* Horaire de l’élève sur téléphone : pas de bloc « Prochains examens » (ils sont dans l’onglet Examens) */
{const _sm=studentMain;studentMain=function(){const h=_sm();return mOn()?h.replace(/<section class="panel"><h2>Prochains examens<\/h2>[\s\S]*?<\/section>/,''):h;};}
/* Le site redessine son menu dans renderSide ; on redessine les onglets juste après */
{const _side=renderSide;renderSide=function(){_side();try{mRender();}catch(e){console.error(e);}};}
/* Un choix dans « Plus » (ou un toucher à côté) ferme la feuille. On le note avant que le site redessine
   la page (le bouton touché n’est alors plus dans la feuille), puis on ferme après son traitement. */
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');
  M.close=M.more&&(e.target.id==='mmore'||!!(b&&b.closest('#mmore')&&b.dataset.act!=='m-more'));
},true);
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');
  if(b&&b.dataset.act==='m-more'){M.more=!M.more;mRender();return;}
  if(M.close){M.close=false;M.more=false;mRender();}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&M.more){M.more=false;mRender();const t=$('#m-more');if(t)t.focus();}});
/* on passe de l’ordinateur au téléphone (fenêtre rétrécie, tablette tournée) : tout est redessiné */
if(M.mq.addEventListener) M.mq.addEventListener('change',()=>render());else if(M.mq.addListener) M.mq.addListener(()=>render());
try{mRender();}catch(e){}
