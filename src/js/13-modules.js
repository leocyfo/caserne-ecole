/* ---------- Administration : modules du programme ----------
   Le catalogue est dans config/ecole.competences : { code, nom, heuresT, heuresP, heures, charge, cours[], examens[] }.
   · COURS du module : { id, num, type, requis } — ce qui compose le module, pareil pour toutes les classes.
   · EXAMENS du module : { id, type (t : théorique, p : pratique), nom }.
   · SÉANCE : un cours ou un examen donné à une classe, à une date. Chaque classe a son document cours/<id> (sigle M7) ;
     ses séances pointent vers les cours (x.cours) ou les examens (x.examens) du module.
   · CHARGÉ DE COURS (charge) : l’enseignant du module ; il donne ses séances à toutes les classes. */
const modList=()=>comps().map(k=>({id:String(k.code),nom:k.nom,k}));
const modCourses=code=>S.data.cours.filter(c=>modKey(c)===+code);
const modT=k=>k.heuresT!=null&&k.heuresT!==''?+k.heuresT:null;
const modP=k=>k.heuresP!=null&&k.heuresP!==''?+k.heuresP:null;
const modTot=k=>modT(k)!=null||modP(k)!=null?(modT(k)||0)+(modP(k)||0):(+k.heures||0);
const hTxt=v=>v==null?'<span class="muted">—</span>':v+' h';
const COURS_TYPES=['theorie','pratique','simulation','visite','stage','activite'];
const actLabel=k=>(ACTIVITES.find(a=>a.k===k)||{}).label||'';
const EXAM_T={t:'Théorique',p:'Pratique'};
const examActOf=e=>e.type==='t'?'examen-t':e.type==='p'?'examen-p':'examen';
const mCours=k=>(k&&Array.isArray(k.cours)?k.cours:[]).slice().sort((a,b)=>collator.compare(String(a.num),String(b.num)));
const mExams=k=>(k&&Array.isArray(k.examens)?k.examens:[]);
const xCours=(k,x)=>k&&x&&Array.isArray(x.cours)?x.cours.map(id=>(k.cours||[]).find(c=>c.id===id)).filter(Boolean):[];
const xExams=(k,x)=>k&&x&&Array.isArray(x.examens)?x.examens.map(id=>(k.examens||[]).find(e=>e.id===id)).filter(Boolean):[];
const cReq=c=>c.requis==null||c.requis===''?1:Math.max(0,Math.min(9,+c.requis||0));
const autoLabel=a=>a.length===2?a.join('–'):a.join(', ');
const chargeName=k=>k&&k.charge&&byId(S.data.enseignants,k.charge)?tName(k.charge):'';
/* Dans quelles classes chaque cours et chaque examen du module est à l’horaire */
function modUse(code){
  const use={};
  for(const c of modCourses(code)) for(const x of datedOf(c)) for(const id of (x.cours||[]).concat(x.examens||[])) (use[id]||(use[id]=new Set())).add(c.groupe);
  return {use,n:id=>use[id]?use[id].size:0};
}
function chargeSelect(id,cur,k){
  const ts=teachers(), curT=cur?byId(S.data.enseignants,cur):null;
  const opt=t=>`<option value="${esc(t.id)}"${cur===t.id?' selected':''}>${esc(t.nom)}${k&&!(t.competences||[]).some(x=>+x===+k.code)?' (hors compétences)':''}</option>`;
  return `<select id="${id}"><option value="">À choisir plus tard</option>${ts.map(opt).join('')}${curT&&!ts.includes(curT)?opt(curT):''}</select>`;
}
/* Heures planifiées du module pour une classe, par type ; la reprise ne compte pas */
function modHours(c){
  let T=0,P=0,O=0,ex=0;const rep=[], ann=(c&&c.annulees)||[];
  for(const x of datedOf(c)){
    if(ann.includes(`${x.date}@${x.id}`)) continue;
    const m=sessMinutes(x), tg=x.tags||[];
    if(tg.includes('Reprise')&&!tg.includes('Examen')){rep.push(x.date);continue;}
    if(tg.includes('Examen')) ex++;
    if(tg.includes('Théorie')) T+=m; else if(tg.includes('Pratique')) P+=m; else O+=m;
  }
  return {T:Math.round(T/60),P:Math.round(P/60),O:Math.round(O/60),ex,rep:rep.sort()};
}
function modulesPage(){
  if(S.pg.fiche) return moduleFiche();
  const ms=modList(), st=S.pg, can=isAdmin()&&S.conn==='shared', tot=ms.reduce((n,m)=>n+modTot(m.k),0);
  const add=st.adding&&can?`<section class="panel cl-add"><form class="inline-add" data-form="md-add">
      <label class="field" style="flex:0 1 90px"><span>N°</span><input type="number" id="md-code" min="1" step="1" inputmode="numeric" required></label>
      <label class="field" style="flex:2 1 240px"><span>Nom du module</span><input id="md-nom" maxlength="90" autocomplete="off" required></label>
      <label class="field" style="flex:0 1 130px"><span>Heures de théorie</span><input type="number" id="md-ht" min="0" step="1" inputmode="numeric"></label>
      <label class="field" style="flex:0 1 130px"><span>Heures de pratique</span><input type="number" id="md-hp" min="0" step="1" inputmode="numeric"></label>
      <label class="field" style="flex:1 1 200px"><span>Chargé de cours</span>${chargeSelect('md-charge','',null)}</label>
      <button class="btn primary" type="submit"${dis()}>Créer le module</button><button class="btn ghost" type="button" data-act="pg-set" data-k="adding" data-v="">Annuler</button></form></section>`:'';
  const tb=`<div class="toolbar"><p class="summary" style="margin:0"><span><b>${ms.length}</b>${ms.length>1?'modules':'module'}</span><span><b>${tot}</b>heures au programme</span></p><span class="grow"></span>${can&&!st.adding?`<button class="btn primary" type="button" id="md-add-open" data-act="pg-set" data-k="adding" data-v="1">${icon('plus')}Créer un module</button>`:''}</div>`;
  if(!ms.length) return tb+add+(st.adding?'':emptyBox('Aucun module pour l’instant','Créez les modules du programme : leur numéro, leur nom, leurs heures de théorie et de pratique et leur chargé de cours.'));
  const rows=ms.map(({k})=>{const n=new Set(modCourses(k.code).map(c=>c.groupe)).size, ch=chargeName(k), nc=mCours(k).length;
    return xRow('md-cols',`id="md-${esc(k.code)}" data-act="module" data-id="${esc(k.code)}"`,`<span class="cl-num md-num" aria-hidden="true">M${esc(k.code)}</span><div class="xm-t"><b>${esc(k.nom)}</b></div><span class="xm-m md-ch">${ch?esc(ch):'<span class="muted">À choisir</span>'}</span><span class="md-h">${hTxt(modT(k))}</span><span class="md-h">${hTxt(modP(k))}</span><span class="md-h"><b>${modTot(k)} h</b></span><span class="md-h">${nc||'<span class="muted">—</span>'}</span><span class="md-h">${n||'<span class="muted">—</span>'}</span>${icon('right')}`,'Ouvrir le module '+k.nom);}).join('');
  return tb+add+xList('md-cols',[['Module'],[''],['Chargé de cours'],['Théorie','n'],['Pratique','n'],['Total','n'],['Cours','n'],['Classes','n'],['']],rows);
}
function moduleFiche(){
  const list=modList(), cur=list.find(m=>m.id===String(S.pg.fiche));
  if(!cur&&S.pg.justAdded===String(S.pg.fiche)) return '<p class="help">Ouverture du module…</p>';
  if(!cur){S.pg.fiche=null;return modulesPage();}
  if(S.pg.justAdded===cur.id) S.pg.justAdded=null;
  const k=cur.k, st=S.pg, cs=modCourses(k.code), gs=groups(), can=isAdmin()&&S.conn==='shared', U=modUse(k.code), kc=mCours(k), ke=mExams(k), ch=chargeName(k), code=esc(k.code);
  const item=m=>`<span class="fl-row"><span class="cl-num sm md-num" aria-hidden="true">M${esc(m.k.code)}</span><span class="fl-txt"><span class="fl-name">${esc(m.nom)}</span><span class="fl-sub">${modTot(m.k)} h</span></span></span>`;
  const nG=new Set(cs.map(c=>c.groupe)).size;
  const head=ficheHead(k.nom,`<span class="chip off">${nG?pl(nG,'classe','classes'):'Aucune classe'}</span><span class="chip ${ch?'k0':'warn'}" id="md-charge-chip">${ch?'Chargé de cours · '+esc(ch):'Chargé de cours à choisir'}</span>`,'',[['Théorie',hTxt(modT(k)),''],['Pratique',hTxt(modP(k)),''],['Total',modTot(k)+' h',''],['Cours',String(kc.length),''],['Examens',String(ke.length),'']],`<span class="cl-num lg md-num" aria-hidden="true">M${code}</span>`);
  const useCell=id=>{const n=U.n(id);return `<span class="md-h">${n?`${n}<small class="muted"> sur ${gs.length}</small>`:'<span class="muted">—</span>'}</span>`;};
  /* × d’une ligne : on confirme ; si le cours ou l’examen est déjà à l’horaire, on explique pourquoi il reste */
  const delCell=(key,act,id,lbl)=>{if(!can)return '';const n=U.n(id);
    if(st[key]!==id) return `<button type="button" class="x" data-act="pg-set" data-k="${key}" data-v="${esc(id)}" aria-label="${esc('Retirer '+lbl)}" title="Retirer">×</button>`;
    return n?`<span class="muted sm md-why">À l’horaire de ${pl(n,'classe','classes')} : retirez d’abord ses séances.</span><button class="btn sm ghost" type="button" data-act="pg-set" data-k="${key}" data-v="">OK</button>`
      :`<button class="btn sm danger" type="button" data-act="${act}" data-code="${code}" data-id="${esc(id)}"${dis()}>Retirer</button><button class="btn sm ghost" type="button" data-act="pg-set" data-k="${key}" data-v="">Non</button>`;};
  const content=tab=>{
    if(tab==='reglages'){
      const nS=cs.reduce((n,c)=>n+datedOf(c).length,0), left=[kc.length?pl(kc.length,'cours','cours'):'',ke.length?pl(ke.length,'examen','examens'):'',nS?pl(nS,'séance à l’horaire','séances à l’horaire'):''].filter(Boolean), blocked=left.length>0, conf=st.ask==='mod'&&!blocked;
      return `<div class="fiche-two"><section class="panel"><h2>Le module</h2><form class="stackf" data-form="md-save" data-code="${code}">
          <label class="field"><span>Nom du module</span><input id="md-nom" value="${esc(k.nom)}" maxlength="90" autocomplete="off" required></label>
          <div class="grid2"><label class="field"><span>Heures de théorie requises</span><input type="number" id="md-ht" value="${modT(k)==null?'':modT(k)}" min="0" step="1" inputmode="numeric"></label><label class="field"><span>Heures de pratique requises</span><input type="number" id="md-hp" value="${modP(k)==null?'':modP(k)}" min="0" step="1" inputmode="numeric"></label></div>
          <label class="field" style="max-width:340px"><span>Chargé de cours</span>${chargeSelect('md-charge',k.charge||'',k)}</label>
          <p class="help">Le chargé de cours donne les séances du module à toutes les classes. Dans la fenêtre d’une séance, on peut le retirer ou lui ajouter des enseignants.</p>
          <div class="row"><button class="btn primary" type="submit"${can?dis():' disabled'}>Enregistrer</button></div></form></section>
        <section class="panel"><h2>Supprimer le module</h2>
          ${blocked?`<p class="help" id="md-del-why">Un module qui a des cours ne peut pas être supprimé. Il reste ${esc(left.join(', '))}.</p>`:'<p class="help">Ce module n’a aucun cours : il peut être supprimé.</p>'}
          ${conf?`<div class="confirm" style="margin-top:10px"><p>Supprimer le module M${code} ?</p><div class="row"><button class="btn sm danger" type="button" data-act="md-del" data-code="${code}"${dis()}>Supprimer</button><button class="btn sm ghost" type="button" data-act="pg-set" data-k="ask" data-v="">Annuler</button></div></div>`:`<div class="row" style="margin-top:10px"><button class="btn sm danger" type="button" id="md-ask" data-act="pg-set" data-k="ask" data-v="mod"${can&&!blocked?dis():' disabled'}>Supprimer le module</button></div>`}</section></div>`;
    }
    if(tab==='cours'){
      const tSel=(id,v,attrs)=>`<select id="${id}" ${attrs}>${COURS_TYPES.map(t=>`<option value="${t}"${v===t?' selected':''}>${actLabel(t)}</option>`).join('')}${COURS_TYPES.includes(v)?'':`<option value="${esc(v)}" selected>${esc(actLabel(v)||'Autre')}</option>`}</select>`;
      const form=can?`<section class="panel md-add"><h2>Ajouter un cours au module</h2><form class="inline-add" data-form="mc-add" data-code="${code}">
        <label class="field" style="flex:0 1 170px"><span>Numéro du cours</span><input id="mc-num" maxlength="30" autocomplete="off" placeholder="Ex. ${code}.${kc.length+1}" required></label>
        <label class="field" style="flex:0 1 200px"><span>Type de cours</span>${tSel('mc-type','theorie','')}</label>
        <label class="field" style="flex:0 1 170px"><span>Enseignants requis</span><input type="number" id="mc-req" min="0" max="9" step="1" value="1" inputmode="numeric"></label>
        <button class="btn primary" type="submit"${dis()}>Ajouter le cours</button></form></section>`:'';
      const hasR=ressAll().length>0;
      const rsCell=c=>{const names=ressNames(c.ress||[]), on=st.rc===c.id;
        return can&&hasR?`<button type="button" class="md-rs-b" id="mc-rs-${esc(c.id)}" data-act="pg-set" data-k="rc" data-v="${on?'':esc(c.id)}" aria-expanded="${on}" title="Choisir les locaux et équipements de ce cours">${names?esc(names):'<span class="muted">Aucun</span>'}</button>`:`<span class="xm-m">${names?esc(names):'<span class="muted">—</span>'}</span>`;};
      const rows=kc.map(c=>{const r=cReq(c), at=`data-code="${code}" data-id="${esc(c.id)}"`;
        return `<article class="xm-row xm-cols md-c" id="mc-${esc(c.id)}"><div class="xm-t"><b>${esc(c.num)}</b></div>
          ${can?tSel('mc-t-'+c.id,c.type,`data-mc="type" ${at} aria-label="${esc('Type du cours '+c.num)}"${dis()}`):`<span class="xm-m">${esc(actLabel(c.type))}</span>`}
          ${can?`<div class="af-req" role="group" aria-label="${esc('Enseignants requis pour le cours '+c.num)}"><button type="button" class="icon-btn" id="mc-rm-${esc(c.id)}" data-act="mc-req" ${at} data-d="-1" aria-label="Un enseignant de moins"${S.busy||r<=0?' disabled':''}>−</button><b id="mc-rn-${esc(c.id)}">${r}</b><button type="button" class="icon-btn" id="mc-rp-${esc(c.id)}" data-act="mc-req" ${at} data-d="1" aria-label="Un enseignant de plus"${S.busy||r>=9?' disabled':''}>+</button></div>`:`<span class="md-h">${r}</span>`}
          ${rsCell(c)}${useCell(c.id)}<div class="xm-end">${delCell('askc','mc-del',c.id,'le cours '+c.num)}</div></article>${can&&hasR&&st.rc===c.id?`<div class="md-rs" id="mc-rsp-${esc(c.id)}"><div class="pk-list">${ressPicks(c.ress||[],`data-mcr="1" ${at}`)}</div></div>`:''}`;}).join('');
      const listH=kc.length?`<div class="cl-list xm-list"><div class="xm-hd xm-cols md-c" aria-hidden="true"><span>Cours</span><span>Type</span><span>Ens. requis</span><span>Locaux et équipements</span><span class="n">Classes à l’horaire</span><span></span></div>${rows}</div>`:`<section class="panel"><p class="help" id="mc-none">Ce module n’a pas encore de cours.</p></section>`;
      return `<p class="help md-lead">Les cours composent le module et valent pour toutes les classes. Leurs dates se choisissent classe par classe, dans l’onglet Séances.</p>${form}${listH}`;
    }
    if(tab==='examens'){
      const eSel=(id,v,attrs)=>`<select id="${id}" ${attrs}>${EXAM_T[v]?'':'<option value="" selected>Type à préciser</option>'}${Object.entries(EXAM_T).map(([t,l])=>`<option value="${t}"${v===t?' selected':''}>${l}</option>`).join('')}</select>`;
      const form=can?`<section class="panel md-add"><h2>Ajouter un examen au module</h2><form class="inline-add" data-form="me-add" data-code="${code}">
        <label class="field" style="flex:0 1 200px"><span>Type d’examen</span>${eSel('me-type','t','')}</label>
        <label class="field" style="flex:1 1 220px"><span>Nom de l’examen</span><input id="me-nom" maxlength="60" autocomplete="off" placeholder="Ex. Examen final" required></label>
        <button class="btn primary" type="submit"${dis()}>Ajouter l’examen</button></form></section>`:'';
      const rows=ke.map(e=>`<article class="xm-row xm-cols md-e" id="me-${esc(e.id)}"><div class="xm-t"><b>${esc(e.nom)}</b></div>
          ${can?eSel('me-t-'+e.id,e.type||'',`data-me="type" data-code="${code}" data-id="${esc(e.id)}" aria-label="${esc('Type de l’examen '+e.nom)}"${dis()}`):`<span class="xm-m">${esc(EXAM_T[e.type]||'—')}</span>`}
          ${useCell(e.id)}<div class="xm-end">${delCell('aske','me-del',e.id,'l’examen '+e.nom)}</div></article>`).join('');
      const listH=ke.length?`<div class="cl-list xm-list"><div class="xm-hd xm-cols md-e" aria-hidden="true"><span>Examen</span><span>Type</span><span class="n">Classes à l’horaire</span><span></span></div>${rows}</div>`:`<section class="panel"><p class="help" id="me-none">Ce module n’a pas encore d’examen.</p></section>`;
      return `<p class="help md-lead">Un examen est théorique ou pratique et vaut pour toutes les classes. Sa date se choisit classe par classe, dans l’onglet Séances.</p>${form}${listH}`;
    }
    if(!gs.length) return '<section class="panel"><p class="help">Créez d’abord une classe : les séances d’un module se planifient classe par classe.</p></section>';
    const gid=gs.some(g=>g.id===st.mg)?st.mg:((gs.find(g=>cs.some(c=>c.groupe===g.id))||gs[0]).id);
    const c=cs.find(x=>x.groupe===gid)||null, H=c?modHours(c):{T:0,P:0,O:0,ex:0,rep:[]};
    const meter=(lbl,got,need)=>{const p=need?Math.min(100,Math.round(got/need*100)):0, cls=need&&got>=need?'ok':'';
      return `<div class="md-m ${cls}"><span>${lbl}</span><b>${got} h${need!=null?` <small>/ ${need} h</small>`:''}</b>${need?`<div class="meter${cls?'':' todo'}" aria-hidden="true"><i style="width:${p}%"></i></div>`:''}</div>`;};
    const sum=`<div class="md-sum">${meter('Théorie planifiée',H.T,modT(k))}${meter('Pratique planifiée',H.P,modP(k))}<div class="md-m"><span>Examens</span><b>${H.ex}</b></div><div class="md-m"><span>Reprise</span><b>${H.rep.length?H.rep.map(d=>esc(dn(parse(d))+' '+fMonthS.format(parse(d)))).join(', '):'<span class="muted">Aucune date</span>'}</b></div></div>`;
    const sel=`<select id="md-g" aria-label="Classe">${gs.map(g=>`<option value="${esc(g.id)}"${g.id===gid?' selected':''}>${esc(g.nom)}${cs.some(x=>x.groupe===g.id)?'':' (aucune séance)'}</option>`).join('')}</select>`;
    const xs=c?datedOf(c).slice().sort((a,b)=>a.date.localeCompare(b.date)||String(a.debut).localeCompare(String(b.debut))):[], today=todayISO();
    const rows=xs.map(x=>{const s=findSess(x.date,`${c.id}_${x.id}_${x.date}`), ann=(c.annulees||[]).includes(`${x.date}@${x.id}`), past=x.date<today, a=s&&!ann?staffing(s):null, ask=st.askx===x.id, rep=(x.tags||[]).includes('Reprise');let lab=s?sessLabel(s):'';
      const es=xExams(k,x), lk=xCours(k,x).length>0, linked=lk||es.length>0, tl=actLabel(actOf(x.tags||[]));
      if(es.length&&!lk) lab='Examen '+es.map(e=>e.nom).join(', ');
      const req=!lk&&s&&!ann&&can&&!past?`<div class="af-req" role="group" aria-label="Enseignants requis"><button type="button" class="icon-btn" data-act="af-req" ${sAt(s)} data-d="-1" aria-label="Un enseignant de moins"${S.busy||a.requis<=0?' disabled':''}>−</button><b>${a.requis}</b><button type="button" class="icon-btn" data-act="af-req" ${sAt(s)} data-d="1" aria-label="Un enseignant de plus"${S.busy||a.requis>=9?' disabled':''}>+</button></div>`:`<span class="md-h">${a?a.requis:'—'}</span>`;
      return `<article class="xm-row xm-cols md-x${past?' is-past':''}" id="mx-${esc(x.id)}">${xDate({date:x.date},rep?'rep':'')}<div class="xm-t"><b>${esc(lab||(rep?'Reprise':'Séance'))}</b><small>${esc(moment(toMin(x.debut),toMin(x.fin)))}${ann?' · annulée':''}</small></div>
        ${can&&!linked?actSelect('mx-t-'+x.id,actOf(x.tags||[]),`data-mod="type" data-c="${esc(c.id)}" data-x="${esc(x.id)}" aria-label="Type de la séance"${dis()}`):`<span class="xm-m">${esc(tl)}</span>`}
        ${req}${a?affCell(a):'<span class="md-h muted">—</span>'}
        <div class="xm-end">${!can?'':ask?`<button class="btn sm danger" type="button" data-act="md-del-x" data-c="${esc(c.id)}" data-x="${esc(x.id)}"${dis()}>Supprimer</button><button class="btn sm ghost" type="button" data-act="pg-set" data-k="askx" data-v="">Non</button>`:`<button type="button" class="x" data-act="pg-set" data-k="askx" data-v="${esc(x.id)}" aria-label="${esc('Supprimer la séance du '+dayLabel(parse(x.date)))}" title="Supprimer cette séance">×</button>`}</div></article>`;}).join('');
    const pkey=k.code+'|'+gid, pick=new Set(st.pick&&st.pick.key===pkey?st.pick.items:[]), done=id=>!!(U.use[id]&&U.use[id].has(gid));
    const form=!can?'':kc.length||ke.length?`<section class="panel md-add"><h2>Ajouter une séance à ${esc(gName(gid))}</h2><form class="stackf" data-form="md-add-x" data-code="${code}" data-g="${esc(gid)}">
        <fieldset class="pk-set"><legend>Cours ou examen donné</legend><div class="pk-list" id="mx-picks">${pickList(k,pick,done,`data-key="${esc(pkey)}"${dis()}`)}</div></fieldset>
        <div class="mx-row"><label class="field" style="flex:0 1 170px"><span>Date</span><input type="date" id="mx-date" required></label>
        <label class="field" style="flex:0 1 180px"><span>Moment</span><select id="mx-per">${PERIODES.map(p=>`<option value="${p.k}"${p.k==='jour'?' selected':''}>${p.label}</option>`).join('')}</select></label>
        <button class="btn primary" type="submit"${dis()}>Ajouter la séance</button></div>
        <p class="help">Une séance peut couvrir plusieurs cours. Un crochet marque ce qui est déjà à l’horaire de la classe.</p></form></section>`
      :`<section class="panel md-add"><p class="help" id="mx-nocours">Ajoutez d’abord les cours du module, dans l’onglet Cours : une séance est un cours donné à une classe, à une date.</p></section>`;
    const listH=xs.length?`<div class="cl-list xm-list"><div class="xm-hd xm-cols md-x" aria-hidden="true"><span>Date</span><span>Séance</span><span>Type</span><span>Ens. requis</span><span>Enseignants</span><span></span></div>${rows}</div>`:`<section class="panel"><p class="help">Aucune séance de ce module pour ${esc(gName(gid))}.</p></section>`;
    return `<div class="st-bar">${sel}<span class="grow"></span><p class="summary" style="margin:0"><span><b>${xs.length}</b>${xs.length>1?'séances':'séance'}</span></p></div>${sum}${form}${listH}`;
  };
  return ficheShell('modules',list,cur,item,head,[['cours','Cours'],['examens','Examens'],['seances','Séances'],['reglages','Réglages']],content);
}
/* Les cours et les examens d’un module, à cocher pour composer une séance (plus la reprise) */
function pickList(k,pick,done,attrs){
  const pk=(v,lbl,sub,d)=>`<label class="pk${d?' done':''}"><input type="checkbox" data-pick="${esc(v)}" ${attrs}${pick.has(v)?' checked':''}><span>${lbl}${sub?`<small>${sub}</small>`:''}</span></label>`;
  return mCours(k).map(c=>pk('c:'+c.id,esc(c.num),esc(actLabel(c.type)),done(c.id))).join('')+mExams(k).map(e=>pk('e:'+e.id,'Examen '+esc(e.nom),esc(EXAM_T[e.type]||''),done(e.id))).join('')+pk('rep','Reprise','',false);
}
/* Enregistre le catalogue des modules, puis accorde le nom et les heures des cours des classes */
async function saveModule(code,vals,isNew){
  const c=configDoc(), i=c.competences.findIndex(x=>+x.code===+code);
  if(isNew&&i>=0){toast(`Le module M${code} existe déjà.`,'bad');return false;}
  const tot=vals.heuresT!=null||vals.heuresP!=null?(vals.heuresT||0)+(vals.heuresP||0):(i>=0?+c.competences[i].heures||0:0);
  const k=Object.assign({cours:[],examens:[]},i>=0?c.competences[i]:{code:+code},{nom:vals.nom,heuresT:vals.heuresT,heuresP:vals.heuresP,heures:tot,charge:vals.charge||''});
  delete k.requis;
  if(i>=0)c.competences[i]=k;else c.competences.push(k);
  c.competences.sort((a,b)=>a.code-b.code);
  if(!await saveConfig(c,isNew?`Module M${code} créé`:'Module enregistré')) return false;
  const stale=modCourses(code).filter(x=>x.titre!==k.nom||(+x.heures||0)!==tot);
  if(stale.length) await runAll(stale.map(x=>()=>col('cours').doc(x.id).update({titre:k.nom,heures:tot||null})),'');
  return true;
}
/* Modifie la structure d’un module (ses cours, ses examens) : fn reçoit la copie du module et la change */
async function editModule(code,fn,msg){
  if(S.busy) return false;
  const c=configDoc(), k=c.competences.find(x=>String(x.code)===String(code));if(!k) return false;
  k.cours=(k.cours||[]).map(x=>Object.assign({},x));k.examens=(k.examens||[]).map(x=>Object.assign({},x));
  const r=fn(k);if(r===false) return false;
  return saveConfig(c,typeof msg==='function'?msg():msg);
}
/* Après un changement de type dans le module : les séances de toutes les classes suivent */
async function syncSeances(code,fn){
  const jobs=[];
  for(const c of modCourses(code)){const doc=courseDoc(c);let ch=false;for(const x of doc.extras) if(fn(x)) ch=true;if(ch) jobs.push(()=>putCours(c.id,doc));}
  if(jobs.length) await runAll(jobs,'');
}
const numOrNull=v=>{const s=String(v==null?'':v).trim();if(s==='')return null;const n=Math.round(+s);return isNaN(n)||n<0?null:n;};

/* ---------- Vocabulaire : un MODULE (M7 Autopompe) a des COURS (une journée ou une demi-journée d’une classe).
   Ce qui n’appartient à aucun module (Accueil, Graduation…) est une ACTIVITÉ.
   Une école sans catalogue de modules garde l’ancien fonctionnement : un cours et ses périodes de la semaine. ---------- */
const acad=()=>comps().length>0;
/* Vocabulaire : avec des modules, ce qui est à l’horaire d’une classe est une « séance » (un cours du module donné
   à une date) ; dans une école sans modules, on garde « cours ». W(mot pour l’académie, mot d’origine). */
const W=(a,b)=>acad()?a:b;
const isActivity=c=>acad()&&!!c&&modKey(c)==null;
/* Heures prévues : celles du module du programme, sinon celles inscrites sur le cours */
const heuresOf=c=>{const m=acad()?modOf(c):null;return m?modTot(m):(+(c&&c.heures)||0);};
/* Un seul formulaire pour ajouter une séance : depuis le calendrier, une classe ou un module */
function openAddCourse(preset){
  const gs=groups();
  const draft=Object.assign({groupe:S.filtre.startsWith('g:')?S.filtre.slice(2):((gs[0]||{}).id||''),module:'',titre:'',date:'',per:'jour',type:'activite',items:[]},preset||{});
  openDrawer({kind:'addc',draft,err:''});
}
function addCourseDrawer(){
  const d=S.dr, f=d.draft, act=f.module==='__act', k=!act&&f.module?comps().find(x=>String(x.code)===String(f.module)):null;
  const gOpts='<option value="">Choisir une classe</option>'+groups().map(g=>`<option value="${esc(g.id)}"${f.groupe===g.id?' selected':''}>${esc(g.nom)}</option>`).join('');
  const mOpts='<option value="">Choisir un module…</option>'+comps().map(x=>`<option value="${esc(x.code)}"${String(f.module)===String(x.code)?' selected':''}>M${esc(x.code)} · ${esc(x.nom)}</option>`).join('')+`<option value="__act"${act?' selected':''}>Autre activité, sans module…</option>`;
  const U=k?modUse(k.code):null, done=id=>!!(U&&f.groupe&&U.use[id]&&U.use[id].has(f.groupe));
  const picks=!k?'':mCours(k).length||mExams(k).length
    ?`<fieldset class="pk-set"><legend>Cours ou examen donné</legend><div class="pk-list" id="ac-picks">${pickList(k,new Set(f.items||[]),done,'')}</div><p class="help">Une séance peut couvrir plusieurs cours. Un crochet marque ce qui est déjà à l’horaire de la classe.</p></fieldset>`
    :`<p class="help" id="ac-nocours">Ce module n’a pas encore de cours. Ajoutez-les dans le menu Modules, puis planifiez ses séances.</p>`;
  const body=`<form id="ac-form" data-form="addc" novalidate>
    <div class="grid2"><label class="field"><span>Classe</span><select id="ac-g" data-f="groupe">${gOpts}</select></label><label class="field"><span>Module</span><select id="ac-m" data-f="module">${mOpts}</select></label></div>
    ${act?`<div class="grid2"><label class="field"><span>Nom de l’activité</span><input id="ac-titre" data-f="titre" value="${esc(f.titre)}" maxlength="80" placeholder="Ex. Accueil, Graduation" autocomplete="off"></label><label class="field"><span>Type</span>${actSelect('ac-type',f.type,'data-f="type"')}</label></div>`:''}
    ${picks}
    <div class="grid2"><label class="field"><span>Date</span><input type="date" id="ac-date" data-f="date" value="${esc(f.date)}"></label><label class="field"><span>Moment</span><select id="ac-per" data-f="per">${PERIODES.map(p=>`<option value="${p.k}"${f.per===p.k?' selected':''}>${p.label}</option>`).join('')}</select></label></div>
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}</form>`;
  return dTop(act?'Ajouter une activité':'Ajouter une séance',k?`<span class="chip k${(+k.code)%8}">M${esc(k.code)}</span><span>${esc(k.nom)}</span>`:act?esc(f.titre||'Activité'):'Nouvelle séance',f.date?esc(dayLabel(parse(f.date))):'')
    +`<div class="dr-body">${body}</div><div class="dr-foot"><button class="btn primary" type="submit" form="ac-form"${dis()}>${act?'Ajouter l’activité':'Ajouter la séance'}</button></div>`;
}
/* Ajoute une séance à une classe : un ou plusieurs cours (ou examens) du module, ou une activité sans module.
   o.items : 'c:<id>' (cours), 'e:<id>' (examen), 'rep' (reprise). Renvoie un message d’erreur, ou '' */
async function addCourseDay(o){
  const gid=o.groupe, date=o.date, per=PERIODES.find(p=>p.k===o.per)||PERIODES[2];
  const mk=o.module&&o.module!=='__act'?comps().find(x=>String(x.code)===String(o.module)):null, titre=mk?mk.nom:String(o.titre||'').trim();
  if(!gid) return 'Choisissez la classe.';
  if(!mk&&o.module!=='__act') return 'Choisissez le module, ou « Autre activité ».';
  if(!titre) return 'Écrivez le nom de l’activité.';
  const items=o.items||[], ks=mk?mCours(mk).filter(c=>items.includes('c:'+c.id)):[], es=mk?mExams(mk).filter(e=>items.includes('e:'+e.id)):[], rep=items.includes('rep');
  if(mk&&!ks.length&&!es.length&&!rep) return mCours(mk).length||mExams(mk).length?'Cochez le cours ou l’examen donné à cette séance.':'Ce module n’a pas encore de cours : ajoutez-les dans le menu Modules.';
  if(!date) return 'Indiquez la date de la séance.';
  const dd=parse(date), j=dd.getDay(), off=offDay(date);
  if(j===0||j===6) return 'Cette date tombe une fin de semaine.';
  if(off) return `Le ${dn(dd)} ${fMonth.format(dd)} n’est pas un jour de classe (${off}).`;
  const a0=toMin(per.debut), b0=toMin(per.fin), clash=sessionsOn(date).find(x=>x.grp===gid&&!x.cancelled&&x.start<b0&&a0<x.end);
  if(clash) return `${gName(gid)} a déjà ${clash.c.titre} ${momentIn(clash.start,clash.end)} ce jour-là.`;
  const x={id:'a'+date.replace(/-/g,'')+per.k+Math.random().toString(36).slice(2,5),date,debut:per.debut,fin:per.fin,tags:[],label:titre,minutes:per.k==='jour'?360:180};
  if(!mk) x.tags=withAct([],o.type||'activite');
  else if(es.length||ks.length){
    x.tags=withAct([],es.length?examActOf(es[0]):ks[0].type);
    x.label=autoLabel(ks.map(c=>c.num).concat(es.map(e=>e.nom)));
    if(ks.length) x.cours=ks.map(c=>c.id);
    if(es.length) x.examens=es.map(e=>e.id);
  }else{x.tags=['Reprise'];x.label='Reprise';}
  const c0=mk?modCourses(mk.code).find(c=>c.groupe===gid):S.data.cours.find(c=>c.groupe===gid&&modKey(c)==null&&String(c.titre||'').trim().toLowerCase()===titre.toLowerCase());
  const msg=o.quiet?'':mk?'Séance ajoutée':'Activité ajoutée';let ok;
  if(c0){const doc=courseDoc(c0);doc.extras.push(x);ok=await affWrite(()=>putCours(c0.id,doc),msg);}
  else ok=await affWrite(()=>putCours(genId('c'),{titre,code:mk?'M'+mk.code:'',couleur:mk?(+mk.code)%8:7,groupe:gid,enseignant:'',salle:'',du:'',au:'',heures:mk?modTot(mk)||null:null,creneaux:[],annulees:[],extras:[x]}),msg);
  if(ok) logEv('horaire',mk?'a ajouté la séance':'a ajouté l’activité',`${mk?'M'+mk.code+' ':''}${titre}${mk&&x.label?' ('+x.label+')':''} · ${gName(gid)}, ${dayLabel(dd).toLowerCase()}`);
  return ok?'':'L’enregistrement a échoué.';
}

