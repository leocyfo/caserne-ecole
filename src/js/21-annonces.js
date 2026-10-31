/* ---------- Annonces ----------
   config/ecole.annonces : [{ id, titre, texte, niv info|warn|urgent, pub tous|teacher|student|classes, classes [ids],
     profs (aussi l’enseignant principal de ces classes), du, au (dates, facultatives), epingle, fermable,
     ou toutes|calendrier (pages où elle paraît), lien { texte, url }, actif (publiée, sinon brouillon), cree, maj, par }]
   Elles paraissent sous le bandeau de démo (#annonces) et dans la cloche. Une annonce « fermable » (jamais une urgente)
   peut être masquée par chaque personne : c’est noté dans son navigateur (S.annVu) ; la modifier la fait réapparaître. */
const AN_NIV=[['info','Information','info'],['warn','Important','warn'],['urgent','Urgent','bad']];
const AN_PUB=[['tous','Tout le monde'],['teacher','Les enseignants'],['student','Les élèves'],['classes','Des classes précises']];
const AN_ST={cours:['ok','En cours'],prog:['info','Programmée'],brouillon:['off','Brouillon'],fini:['off','Terminée']};
const AN_MODELES=[
  ['tempete','Fermeture (tempête)','École fermée aujourd’hui','En raison des conditions météo, l’école est fermée aujourd’hui. Les séances seront reprises ; surveillez les annonces.','urgent'],
  ['evac','Exercice d’évacuation','Exercice d’évacuation','Un exercice d’évacuation aura lieu [jour] à [heure]. Suivez les consignes des instructeurs.','warn'],
  ['examen','Rappel d’examen','Examen à venir','Rappel : examen de [module] le [jour]. Présentez-vous 15 minutes à l’avance avec votre équipement complet.','warn'],
  ['local','Changement de local','Changement de local','La séance de [jour] se donne exceptionnellement à [local].','info'],
  ['tenue','Tenue exigée','Tenue de service','Tenue de service complète exigée [jour], pour [raison].','info'],
  ['conge','Congé','Congé','Aucun cours le [jour] : [raison]. Bon congé !','info']];
/* La liste ; l’ancienne annonce unique (config.annonce) est reprise telle quelle */
function annList(){
  const c=cfg();if(Array.isArray(c.annonces)) return c.annonces;
  const a=c.annonce;return a&&String(a.texte||'').trim()?[{id:'a0',titre:'',texte:a.texte,niv:a.ton==='warn'?'warn':'info',pub:a.pub||'tous',classes:[],actif:a.on===true,fermable:true,ou:'toutes'}]:[];
}
const annState=a=>{const t=todayISO();return !a.actif?'brouillon':a.du&&t<a.du?'prog':a.au&&t>a.au?'fini':'cours';};
const annKey=a=>a.id+'@'+(a.maj||a.cree||'');
const annNiv=a=>AN_NIV.some(x=>x[0]===a.niv)?a.niv:'info';
/* ordre : urgentes, épinglées, importantes, puis les plus récentes */
const annRank=a=>annNiv(a)==='urgent'?0:a.epingle?1:annNiv(a)==='warn'?2:3;
const annSort=(a,b)=>annRank(a)-annRank(b)||String(b.maj||b.cree||'').localeCompare(String(a.maj||a.cree||''));
/* Pour la personne affichée ? (l’administration voit toutes celles en cours) */
function annFor(a,anyPage){
  if(annState(a)!=='cours') return false;
  if(!anyPage&&a.ou==='calendrier'&&S.page!=='calendar') return false;
  if(S.role==='admin') return true;
  const p=a.pub||'tous', cl=a.classes||[];
  if(p==='tous') return true;
  if(p==='teacher') return S.role==='teacher';
  if(p==='student') return S.role==='student';
  if(p==='classes') return S.role==='student'?cl.includes(S.group):S.role==='teacher'&&!!a.profs&&principalClasses(S.teacher).some(g=>cl.includes(g.id));
  return false;
}
function annAud(a){
  const p=a.pub||'tous';if(p!=='classes') return (AN_PUB.find(x=>x[0]===p)||AN_PUB[0])[1];
  const n=(a.classes||[]).map(gName).filter(Boolean);
  return (n.length?'Élèves de '+n.join(', '):'Aucune classe')+(a.profs?', et leur enseignant principal':'');
}
/* Le texte : retours à la ligne gardés, adresses web cliquables */
const annText=t=>esc(t||'').replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)»])/g,'<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n/g,'<br>');
function annNotice(a,preview){
  const niv=annNiv(a), adm=S.role==='admin', url=a.lien&&a.lien.url;
  const meta=[a.epingle?icon('pin')+'Épinglée':'',adm?esc(annAud(a)):'',a.par?'Par '+esc(a.par):'',a.maj||a.cree?esc(ago(a.maj||a.cree)):'',a.au?'Jusqu’au '+esc(shortDate(parse(a.au))):''].filter(Boolean);
  return `<div class="notice ann ${niv==='urgent'?'bad':niv}"${preview?'':` id="ann-${esc(a.id)}"`} role="${niv==='urgent'&&!preview?'alert':'status'}">
    <span class="ann-ic" aria-hidden="true">${icon('mega')}</span>
    <div class="ann-b">${a.titre?`<b class="ann-t">${niv==='urgent'?'<span class="ann-u">Urgent</span>':''}${esc(a.titre)}</b>`:niv==='urgent'?'<b class="ann-t"><span class="ann-u">Urgent</span></b>':''}<p>${annText(a.texte)||'<span class="muted">Votre message paraîtra ici.</span>'}</p>${meta.length?`<small class="ann-m">${meta.join(' · ')}</small>`:''}</div>
    <div class="ann-a">${url?`<a class="btn sm" href="${esc(url)}" target="_blank" rel="noopener">${esc(a.lien.texte||'En savoir plus')}${icon('ext')}</a>`:''}${!preview&&adm&&isAdmin()&&S.conn==='shared'?`<button class="btn sm ghost" type="button" data-act="an-edit" data-id="${esc(a.id)}">Modifier</button>`:''}${!preview&&a.fermable!==false&&niv!=='urgent'?`<button class="ann-x" type="button" data-act="an-hide" data-id="${esc(a.id)}" aria-label="Masquer cette annonce" title="Masquer (elle reste dans la cloche)">${icon('x')}</button>`:''}</div></div>`;
}
/* Sous le bandeau : urgentes et épinglées d’abord ; au-delà de deux, les autres se déplient */
function annoncesHTML(){
  const vu=new Set(S.annVu||[]), vis=annList().filter(a=>annFor(a)&&!vu.has(annKey(a))).sort(annSort);
  if(!vis.length) return '';
  const max=S.annAll?vis.length:2, more=vis.length-max;
  return vis.slice(0,max).map(a=>annNotice(a)).join('')
    +(more>0?`<button type="button" class="ann-more" id="ann-more" data-act="an-all">${icon('down')}Voir ${pl(more,'autre annonce','autres annonces')}</button>`:S.annAll&&vis.length>2?`<button type="button" class="ann-more" id="ann-more" data-act="an-all">${icon('up')}Réduire</button>`:'');
}
/* Dans la cloche : les annonces en cours pour la personne (même masquées) */
function annNotifs(){
  if(S.role==='admin') return [];
  return annList().filter(a=>annFor(a,true)).map(a=>({id:'an:'+annKey(a),t:a.maj||a.cree||'',tone:annNiv(a)==='urgent'?'bad':annNiv(a)==='warn'?'warn':'info',title:annNiv(a)==='urgent'?'Annonce urgente':'Annonce',text:(a.titre?a.titre+' — ':'')+a.texte,go:{k:'ann',id:a.id,cal:a.ou==='calendrier'}}));
}
/* ---------- Paramètres > Annonces ---------- */
function annSection(can){
  const st=S.pg, list=annList(), cnt={cours:0,prog:0,brouillon:0,fini:0};
  for(const a of list) cnt[annState(a)]++;
  const f=['cours','prog','brouillon','fini'].includes(st.af)?st.af:'', rows=list.filter(a=>!f||annState(a)===f).sort((a,b)=>['cours','prog','brouillon','fini'].indexOf(annState(a))-['cours','prog','brouillon','fini'].indexOf(annState(b))||annSort(a,b));
  const seg=`<div class="seg" role="group" aria-label="Annonces affichées">${[['','Toutes',list.length],['cours','En cours',cnt.cours],['prog','Programmées',cnt.prog],['brouillon','Brouillons',cnt.brouillon],['fini','Terminées',cnt.fini]].map(([k,l,n])=>`<button type="button" id="an-f-${k||'tout'}" data-act="pg-set" data-k="af" data-v="${k}" aria-pressed="${f===k}">${l} · ${n}</button>`).join('')}</div>`;
  const dn=d=>shortDate(parse(d));
  const row=a=>{const s=annState(a), niv=annNiv(a), del=st.andel===a.id;
    const when=a.du&&a.au?`Du ${dn(a.du)} au ${dn(a.au)}`:a.du?`À partir du ${dn(a.du)}`:a.au?`Jusqu’au ${dn(a.au)}`:'Sans date de fin';
    return `<li class="an-row n-${niv} st-${s}" id="an-r-${esc(a.id)}"><div class="an-main"><div class="an-h"><span class="chip ${AN_ST[s][0]}">${AN_ST[s][1]}</span><span class="chip ${AN_NIV.find(x=>x[0]===niv)[2]}">${AN_NIV.find(x=>x[0]===niv)[1]}</span>${a.epingle?`<span class="chip off">${icon('pin')}Épinglée</span>`:''}<b>${esc(a.titre||String(a.texte).slice(0,60))}</b></div>
        <p class="an-x">${esc(a.texte)}</p>
        <small class="an-meta">${esc(annAud(a))} · ${esc(when)}${a.ou==='calendrier'?' · sur le calendrier':''}${a.par?' · par '+esc(a.par):''}${a.maj?' · modifiée '+esc(ago(a.maj)):''}</small></div>
      ${can?`<div class="an-act"><button class="btn sm" type="button" data-act="an-edit" data-id="${esc(a.id)}">Modifier</button><button class="btn sm ghost" type="button" data-act="an-dup" data-id="${esc(a.id)}">${icon('copy')}Dupliquer</button>
        ${s==='cours'?`<button class="btn sm ghost" type="button" data-act="an-end" data-id="${esc(a.id)}"${dis()}>Terminer</button>`:s==='brouillon'?`<button class="btn sm ghost" type="button" data-act="an-on" data-id="${esc(a.id)}"${dis()}>Publier</button>`:s==='prog'?`<button class="btn sm ghost" type="button" data-act="an-now" data-id="${esc(a.id)}"${dis()}>Publier maintenant</button>`:`<button class="btn sm ghost" type="button" data-act="an-again" data-id="${esc(a.id)}"${dis()}>Republier</button>`}
        ${del?`<button class="btn sm danger" type="button" data-act="an-del" data-id="${esc(a.id)}"${dis()}>Supprimer</button><button class="btn sm ghost" type="button" data-act="pg-set" data-k="andel" data-v="">Annuler</button>`:`<button class="btn sm ghost" type="button" data-act="pg-set" data-k="andel" data-v="${esc(a.id)}" aria-label="Supprimer l’annonce">Supprimer</button>`}</div>`:''}</li>`;};
  const top=`<div class="ps-top an-top"><div><h2 class="ps-h">Annonces</h2><p class="help">Un bandeau en haut des pages, pour tout le monde ou pour certaines personnes. Les annonces paraissent aussi dans la cloche.</p></div>${can&&!st.aed?`<button class="btn primary" type="button" id="an-new" data-act="an-new">${icon('plus')}Nouvelle annonce</button>`:''}</div>`;
  return top+(st.aed&&can?annEditor():'')
    +`<section class="panel ps-card"><div class="an-bar">${seg}</div>${rows.length?`<ul class="an-list">${rows.map(row).join('')}</ul>`:`<p class="help">${list.length?'Aucune annonce dans cette liste.':'Aucune annonce pour l’instant. « Nouvelle annonce » en publie une ; un modèle aide à démarrer.'}</p>`}</section>`;
}
function annEditor(){
  const st=S.pg, isNew=st.aed==='new', src=isNew?(st.adup?annList().find(x=>x.id===st.adup):null):annList().find(x=>x.id===st.aed);
  const dr=st.adraft&&st.adraft._for===st.aed+'|'+(st.adup||'')?st.adraft:null;
  const a=dr?dr:src?Object.assign({},src,isNew?{titre:(src.titre||'')+(src.titre?' (copie)':''),du:'',au:''}:{}):{niv:'info',pub:'tous',classes:[],fermable:true,ou:'toutes'};
  const gs=groups(), lk=a.lien||{};
  const chk=(id,l,on,sub)=>`<label class="ps-chk"><input type="checkbox" id="${id}"${on?' checked':''}><span><b>${l}</b>${sub?`<small>${sub}</small>`:''}</span></label>`;
  return `<form class="ps-form an-ed" data-form="an-save" novalidate><div class="ps-cards">
    <section class="panel ps-card"><h3>${isNew?'Nouvelle annonce':'Modifier l’annonce'}</h3>
      ${isNew&&!st.adup?`<label class="field"><span>Partir d’un modèle (facultatif)</span><select id="an-modele"><option value="">Aucun modèle</option>${AN_MODELES.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select></label>`:''}
      <label class="field"><span>Titre (facultatif)</span><input id="an-titre" maxlength="80" autocomplete="off" value="${esc(a.titre||'')}" placeholder="Ex. Exercice d’évacuation"></label>
      <label class="field"><span>Message</span><textarea id="an-texte" maxlength="600" rows="4" placeholder="Ce que les personnes doivent savoir. Une adresse web devient un lien.">${esc(a.texte||'')}</textarea></label>
      <fieldset><legend>Importance</legend><div class="ps-colors">${AN_NIV.map(([k,l])=>`<label class="ps-color an-niv-${k}"><input type="radio" name="an-niv" id="an-niv-${k}" value="${k}"${annNiv(a)===k?' checked':''}><span class="ps-sw"></span><span>${l}</span></label>`).join('')}</div></fieldset>
      <p class="help">Une annonce urgente ne peut pas être masquée et passe avant les autres.</p></section>
    <section class="panel ps-card"><h3>Pour qui et quand</h3>
      <label class="field"><span>Pour qui</span><select id="an-pub">${AN_PUB.map(([k,l])=>`<option value="${k}"${(a.pub||'tous')===k?' selected':''}>${l}</option>`).join('')}</select></label>
      <div id="an-cls-box"${(a.pub||'tous')==='classes'?'':' hidden'}><div class="an-cls">${gs.map(g=>`<label class="ps-mchk"><input type="checkbox" id="an-cl-${esc(g.id)}" data-an-cl="${esc(g.id)}"${(a.classes||[]).includes(g.id)?' checked':''}><span>${esc(g.nom)}</span></label>`).join('')||'<p class="help">Aucune classe.</p>'}</div>
        ${chk('an-profs','Aussi l’enseignant principal de ces classes',!!a.profs,'')}</div>
      <div class="grid2"><label class="field"><span>À partir du (facultatif)</span><input type="date" id="an-du" value="${esc(a.du||'')}"></label><label class="field"><span>Jusqu’au (facultatif)</span><input type="date" id="an-au" value="${esc(a.au||'')}"></label></div>
      <p class="help">Sans date, elle paraît dès la publication et jusqu’à ce que vous la terminiez. Le jour indiqué est compris.</p></section>
    <section class="panel ps-card"><h3>Options</h3>
      ${chk('an-epingle','Épingler en haut',!!a.epingle,'Elle passe avant les autres annonces.')}
      ${chk('an-fermable','Chacun peut la masquer',a.fermable!==false,'Elle reste alors dans la cloche.')}
      ${chk('an-cal','Seulement sur le calendrier',a.ou==='calendrier','Sinon, en haut de toutes les pages.')}
      <div class="grid2"><label class="field"><span>Bouton : libellé</span><input id="an-lien-t" maxlength="30" autocomplete="off" value="${esc(lk.texte||'')}" placeholder="En savoir plus"></label><label class="field"><span>Bouton : lien</span><input id="an-lien-u" type="url" maxlength="300" autocomplete="off" value="${esc(lk.url||'')}" placeholder="https://"></label></div></section>
    <section class="panel ps-card ps-wide"><h3>Aperçu</h3><div class="an-prev" id="an-prev">${annNotice(Object.assign({},a,{par:S.me.name||a.par||''}),true)}</div></section></div>
    <div class="ps-save"><button class="btn primary" type="submit" id="an-pub-go"${dis()}>${icon('mega')}Publier</button><button class="btn" type="button" id="an-draft" data-act="an-draft"${dis()}>Enregistrer comme brouillon</button><button class="btn ghost" type="button" data-act="an-cancel">Annuler</button></div></form>`;
}
/* Ce que contient le formulaire (aperçu et enregistrement) */
function annFromForm(f){
  const q=id=>f.querySelector('#'+id), v=id=>q(id)?String(q(id).value).trim():'', pub=v('an-pub')||'tous', url=v('an-lien-u');
  return {titre:v('an-titre'),texte:v('an-texte'),niv:(f.querySelector('[name=an-niv]:checked')||{}).value||'info',pub,classes:pub==='classes'?[...f.querySelectorAll('[data-an-cl]:checked')].map(x=>x.dataset.anCl):[],
    profs:pub==='classes'&&!!(q('an-profs')&&q('an-profs').checked),du:v('an-du'),au:v('an-au'),epingle:!!q('an-epingle').checked,fermable:!!q('an-fermable').checked,ou:q('an-cal').checked?'calendrier':'toutes',lien:url?{texte:v('an-lien-t'),url}:null};
}
function annPreview(f){const p=$('#an-prev');if(!p) return;const a=annFromForm(f);a.par=S.me.name||'';p.innerHTML=annNotice(a,true);const box=$('#an-cls-box');if(box)box.hidden=a.pub!=='classes';}
function annModele(f,k){
  const m=AN_MODELES.find(x=>x[0]===k);if(!m) return;
  f.querySelector('#an-titre').value=m[2];f.querySelector('#an-texte').value=m[3];const r=f.querySelector('#an-niv-'+m[4]);if(r)r.checked=true;
  annPreview(f);
}
async function annWrite(list,msg){
  const c=configDoc();
  /* au-delà de 60, les plus anciennes annonces terminées s’effacent */
  const fin=list.filter(a=>annState(a)==='fini').sort((a,b)=>String(a.maj||a.cree||'').localeCompare(String(b.maj||b.cree||'')));
  while(list.length>60&&fin.length){const x=fin.shift();list=list.filter(a=>a!==x);}
  c.annonces=list;delete c.annonce;
  return saveConfig(c,msg);
}
async function annSave(f,actif){
  const a=annFromForm(f);
  if(!a.texte){toast('Écrivez le message de l’annonce.','bad');f.querySelector('#an-texte').focus();return;}
  if(a.pub==='classes'&&!a.classes.length){toast('Choisissez au moins une classe.','bad');return;}
  if(a.du&&a.au&&a.au<a.du){toast('La date de fin précède la date de début.','bad');return;}
  if(a.lien&&!/^https?:\/\/[^\s]+\.[^\s]+$/i.test(a.lien.url)){toast('Le lien du bouton doit être une adresse web complète (https://…).','bad');return;}
  const st=S.pg, now=new Date().toISOString(), id=st.aed==='new'?'an'+Date.now().toString(36):st.aed, old=annList().find(x=>x.id===id)||{};
  Object.assign(a,{id,actif,cree:old.cree||now,maj:now,par:old.par||S.me.name||''});
  const msg=!actif?'Brouillon enregistré':annState(a)==='prog'?`Annonce programmée pour le ${shortDate(parse(a.du))}`:annState(a)==='fini'?'Annonce enregistrée (sa date de fin est passée)':'Annonce publiée';
  if(await annWrite([a,...annList().filter(x=>x.id!==id)],msg)){S.pg.aed='';S.pg.adup='';S.pg.adraft=null;render();}
}
/* Actions sur une annonce de la liste */
async function annSet(id,ch,msg){
  const list=annList().map(a=>a.id===id?Object.assign({},a,ch(a),{maj:new Date().toISOString()}):a);
  await annWrite(list,msg);
}
