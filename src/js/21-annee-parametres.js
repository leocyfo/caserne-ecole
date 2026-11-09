/* ---------- Pages : calendrier scolaire ---------- */
function keyDates(){
  const c=cfg(), out=[];
  if(c.debut) out.push({date:c.debut,label:'Premier jour de classe',chip:['ok','Rentrée']});
  for(const e of c.etapes||[]){if(e.du)out.push({date:e.du,label:'Début : '+(e.nom||'Étape'),chip:['info','Étape']});if(e.au)out.push({date:e.au,label:'Fin : '+(e.nom||'Étape'),chip:['info','Étape']});}
  for(const k of c.conges||[]) if(k.du) out.push({date:k.du,end:k.au&&k.au!==k.du?k.au:'',label:k.nom||'Congé',chip:['warn','Congé']});
  if(c.fin) out.push({date:c.fin,label:'Dernier jour de classe',chip:['ok','Fin']});
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}
function yearPage(){
  const c=cfg(), t=todayISO(), st=S.pg, all=!!st.all, adm=isAdmin();
  let head='';
  if(c.debut&&c.fin){
    const tot=Math.max(1,daysBetween(c.debut,c.fin)), el=Math.min(tot,Math.max(0,daysBetween(c.debut,t))), p=Math.round(el/tot*100);
    const cur=(c.etapes||[]).find(e=>e.du<=t&&t<=e.au), nx=(c.conges||[]).filter(k=>k.du>=t).sort((a,b)=>a.du.localeCompare(b.du))[0];
    head=`<div class="kpis"><div class="kpi"><span>Année scolaire</span><b>${esc(c.annee||c.debut.slice(0,4))}</b><small>Du ${esc(longDate(parse(c.debut)))} au ${esc(longDate(parse(c.fin)))}</small></div><div class="kpi"><span>Étape en cours</span><b>${esc(cur?cur.nom:'—')}</b><small>${cur?'Jusqu’au '+esc(longDate(parse(cur.au))):'Aucune étape en cours'}</small></div><div class="kpi"><span>Année écoulée</span><b>${p} %</b><div class="meter u-m8-0-0"><i style="width:${p}%"></i></div></div><div class="kpi"><span>Prochain congé</span><b class="u-fs125">${esc(nx?nx.nom:'—')}</b><small>${nx?esc(longDate(parse(nx.du)))+' · dans '+pl(daysBetween(t,nx.du),'jour','jours'):''}</small></div></div>`;
  }else if(adm) head='<div class="notice warn"><p>Indiquez le premier et le dernier jour de classe dans Paramètres pour afficher l’avancement de l’année.</p></div>';
  const items=keyDates().filter(x=>all||(x.end||x.date)>=t);
  const tl=items.length?`<ul class="tl">${items.map(x=>{const d=parse(x.date), past=(x.end||x.date)<t;
    return `<li class="${past?'past':''}">${xDate({date:x.date},'')}<span class="t">${x.exam?`<button class="link" type="button" data-act="exam" data-id="${esc(x.exam)}">${esc(x.label)}</button>`:`<b>${esc(x.label)}</b>`}<span>${esc(WD[d.getDay()]+' '+dn(d)+' '+fMonth.format(d))}${x.end?' au '+esc(shortDate(parse(x.end))):''}${x.sub?' · '+esc(x.sub):''}</span></span><span class="chip ${x.chip[0]}">${x.chip[1]}</span></li>`;}).join('')}</ul>`:'<p class="help">Aucune date à venir.</p>';
  const et=(c.etapes||[]).map((e,i)=>({e,i})).sort((a,b)=>String(a.e.du).localeCompare(String(b.e.du)));
  const cg=(c.conges||[]).map((k,i)=>({k,i})).sort((a,b)=>String(a.k.du).localeCompare(String(b.k.du)));
  const rng=(a,b)=>b&&b!==a?`${shortDate(parse(a))} au ${shortDate(parse(b))}`:shortDate(parse(a));
  return head+`<div class="two"><section class="panel"><div class="t-head u-mb6"><h2 class="u-m0">Dates importantes</h2><button class="btn sm ghost" type="button" data-act="pg-set" data-k="all" data-v="${all?'':'1'}">${all?'Masquer les dates passées':'Voir toute l’année'}</button></div>${tl}</section>
    <div class="stackp">${(()=>{const mine=x=>S.role==='teacher'?x.tch.includes(S.teacher):S.role==='student'?x.grp===S.group:true, up=allExamItems().filter(x=>x.date>=t&&mine(x)).sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start), ex=up.filter(x=>!x.rep), rp=up.find(x=>x.rep), d0=ex[0]&&parse(ex[0].date), d1=rp&&parse(rp.date);
      return `<section class="panel" id="yr-exams"><h2>Examens</h2><p class="help u-mb8">${ex.length?`<b>${ex.length}</b> ${ex.length>1?'examens à venir':'examen à venir'}. Prochain : ${esc(dayLabel(d0).toLowerCase())}.`:'Aucun examen à venir.'}${rp?` Prochaine journée de reprise : ${esc(dayLabel(d1).toLowerCase())}.`:''}</p><div class="row"><button class="btn sm" type="button" data-act="nav" data-page="examens">Voir les examens</button></div></section>`;})()}<section class="panel"><h2>Étapes</h2>${et.length?`<ul class="plist">${et.map(({e,i})=>`<li><span><b>${esc(e.nom||'Étape')}</b> <span class="muted">${esc(rng(e.du,e.au))}</span></span>${adm?`<button type="button" class="x" data-act="p-del-etape" data-i="${i}" aria-label="${esc('Retirer '+(e.nom||'cette étape'))}"${dis()}>×</button>`:''}</li>`).join('')}</ul>`:'<p class="help">Aucune étape inscrite.</p>'}
      ${adm?`<form class="inline-add u-mt10" data-form="p-add-etape"><label class="field"><span>Nom</span><input id="p-enom" maxlength="40" placeholder="Étape 1" autocomplete="off"></label><label class="field u-f0-150"><span>Du</span><input type="date" id="p-edu"></label><label class="field u-f0-150"><span>Au</span><input type="date" id="p-eau"></label><button class="btn" type="submit"${dis()}>Ajouter</button></form>`:''}</section>
    <section class="panel"><h2>Congés et journées pédagogiques</h2><p class="help u-mb8">Aucun cours n’est affiché ces jours-là.</p>${cg.length?`<ul class="plist">${cg.map(({k,i})=>`<li><span><b>${esc(k.nom||'Congé')}</b> <span class="muted">${esc(rng(k.du,k.au))}</span></span>${adm?`<button type="button" class="x" data-act="p-del-conge" data-i="${i}" aria-label="${esc('Retirer '+(k.nom||'ce congé'))}"${dis()}>×</button>`:''}</li>`).join('')}</ul>`:'<p class="help">Aucun congé inscrit.</p>'}
      ${adm?`<form class="inline-add u-mt10" data-form="p-add-conge"><label class="field"><span>Nom</span><input id="p-cnom" maxlength="60" placeholder="Journée pédagogique" autocomplete="off"></label><label class="field u-f0-150"><span>Du</span><input type="date" id="p-cdu"></label><label class="field u-f0-150"><span>Au</span><input type="date" id="p-cau"></label><button class="btn" type="submit"${dis()}>Ajouter</button></form>`:''}</section></div></div>`;
}

/* ---------- Pages : paramètres ----------
   Onze sections (dans le menu de gauche). Chaque réglage est gardé dans config/ecole et agit vraiment sur le site ;
   un champ absent garde le fonctionnement par défaut.
   École : nom, nomCourt, resp, programme, web, adresse, tel, courriel   Annonces : annonces [] (voir 21-annonces.js)
   Année : annee, debut, fin   Horaire : moments { am, pm }, requisDef, horizon, vueCal, menage
   Résultats : seuil, notesEleves, presOk, presWarn, motivePresent, retardPresent
   Élèves : grades [{ nom, c }]   Personnel : fonctions []   Droits : perms { cand, auto, remp, pres, notes }
   Menu : couleur, couleurPerso, vueDefaut, ouverture, menuMasque [], menuNoms {}   Notifications : notifs { … }
   Impression : impLogo, impCoord, impDate, pied, impSign */
const PS_TABS=[['ecole','École','gear'],['annonces','Annonces','mega'],['annee','Année scolaire','year'],['horaire','Horaire','cal'],['resultats','Résultats et présences','exam'],['eleves','Élèves','users'],['personnel','Personnel','user'],['acces','Droits et accès','key'],['menu','Menu et affichage','layers'],['notifs','Notifications','bell'],['impression','Impression','print'],['donnees','Données','down']];
const COULEURS=[['','Rouge pompier','#C62F2A','#AD2722'],['orange','Orange','#C2410C','#9A3412'],['vert','Vert','#15803D','#166534'],['bleu','Bleu','#1D4ED8','#1E40AF'],['bordeaux','Bordeaux','#9F1239','#881337'],['ardoise','Ardoise','#334155','#1E293B']];
/* Entrées du menu que l’administration peut masquer ou renommer (le calendrier, les paramètres et les nouveautés restent toujours) */
const MENU_OPT=[['affectations','Affectations'],['classes','Classes'],['eleves','Élèves et personnel'],['modules','Modules et examens'],['stock','Stock'],['compta','Compta'],['comptes','Comptes'],['historique','Historique']];
const NF_OPT=[['cand','Administration','Les nouvelles candidatures des enseignants'],['remp','Administration','Les demandes de remplacement'],['stock','Administration','Le stock : inspections en retard, consommables sous le seuil'],['compta','Administration','La compta : élèves en retard de paiement, paie à approuver'],['aff','Enseignants','Leurs candidatures approuvées ou refusées, les séances qu’on leur attribue ou retire'],['annulT','Enseignants','Leurs séances annulées'],['annulE','Élèves','Les séances annulées de leur classe']];
/* Ce que les enseignants peuvent faire (tout est permis par défaut, sauf l’approbation automatique) */
const PERM_OPT=[['cand','Postuler aux séances à pourvoir','Les séances qui cherchent un enseignant leur sont proposées selon leurs disponibilités.'],['auto','Candidatures approuvées automatiquement','S’il reste une place, la séance est attribuée sans attendre l’administration.'],['remp','Demander un remplacement','Pour une séance qui leur est attribuée.'],['pres','Prendre les présences de leurs séances',''],['notes','Saisir les résultats des examens qu’ils donnent ou surveillent',''],['paieEns','Voir leurs relevés de paie','Dans leur profil : chaque mois approuvé, les heures et le montant.']];
const PERM_EL=[['equipEl','Leur équipement attribué','Dans leur profil, avec leur feuille de dotation.'],['compteEl','Leur compte','Solde, retard, prochaine échéance, paiements et reçus.']];
/* Grades des élèves dans la classe, du plus haut au plus bas ; la couleur sert aux cartes et aux étiquettes */
const GRADE_C=[['cap','Rouge foncé','#9F2D35'],['lt','Marine','#1E3A5F'],['vert','Vert forêt','#1F5F45'],['or','Doré','#8A6416'],['gris','Gris','#4B5563']];
const GRADES_DEF=[{nom:'Capitaine',c:'cap'},{nom:'Lieutenant 1',c:'lt'},{nom:'Lieutenant 2',c:'lt'}];
const FONCTIONS_DEF=FONCTIONS.slice();
const ACCUEIL_OPT=[['accueil','Accueil'],['calendar','Calendrier'],['affectations','Affectations'],['classes','Classes'],['eleves','Élèves et personnel'],['modules','Modules et examens']];
const nfOn=k=>((cfg().notifs||{})[k])!==false;
const permOn=k=>{const v=(cfg().perms||{})[k];return k==='auto'?v===true:v!==false;};
const presOk=()=>{const n=+cfg().presOk;return n>=1&&n<=100?n:95;};
const presWarn=()=>{const n=cfg().presWarn;return n!==''&&n!=null&&+n>=0&&+n<=presOk()?+n:Math.min(90,presOk());};
const reqDef=()=>{const n=cfg().requisDef;return n===''||n==null||isNaN(+n)?1:Math.max(0,Math.min(9,Math.round(+n)));};
const horizonJ=()=>{const n=Math.round(+cfg().horizon);return n>=7&&n<=365?n:150;};
const gradesL=()=>{const g=cfg().grades;return Array.isArray(g)&&g.length?g.filter(x=>x&&String(x.nom||'').trim()):GRADES_DEF;};
const menuNom=k=>String((cfg().menuNoms||{})[k]||'').trim();
const okHex=h=>/^#[0-9a-f]{6}$/i.test(h||'');
/* une teinte plus foncée pour le survol d’une couleur choisie librement */
const darker=h=>'#'+[1,3,5].map(i=>pad(Math.round(parseInt(h.slice(i,i+2),16)*.82).toString(16))).join('');
/* Applique les réglages qui changent l’apparence ou les listes : heures des moments, couleur principale, fonctions du personnel */
let cfgInit=false;
function applyConfig(){
  const c=cfg(), m=c.moments, am=PERIODES[0], pm=PERIODES[1], jr=PERIODES[2];
  const ok=t=>/^\d{1,2}:\d{2}$/.test(t||'');
  am.debut=m&&m.am&&ok(m.am.debut)?m.am.debut:'08:00';am.fin=m&&m.am&&ok(m.am.fin)?m.am.fin:'11:00';
  pm.debut=m&&m.pm&&ok(m.pm.debut)?m.pm.debut:'12:00';pm.fin=m&&m.pm&&ok(m.pm.fin)?m.pm.fin:'15:00';
  jr.debut=am.debut;jr.fin=pm.fin;
  const st=document.documentElement.style, col=c.couleur==='perso'&&okHex(c.couleurPerso)?['perso','',c.couleurPerso,darker(c.couleurPerso)]:COULEURS.find(x=>x[0]===(c.couleur||''))||COULEURS[0];
  if(col[0]){st.setProperty('--accent',col[2]);st.setProperty('--accent-hover',col[3]);st.setProperty('--today',col[2]);}
  else{st.removeProperty('--accent');st.removeProperty('--accent-hover');st.removeProperty('--today');}
  const fl=Array.isArray(c.fonctions)&&c.fonctions.length?c.fonctions:FONCTIONS_DEF;
  if(fl.join('|')!==FONCTIONS.join('|')) FONCTIONS.splice(0,FONCTIONS.length,...fl);
  /* à l’ouverture du site : la vue du calendrier et la page d’accueil choisies (si la personne n’a rien choisi elle-même) */
  if(!cfgInit&&S.data.config){cfgInit=true;
    if(c.vueCal==='jour'&&!prefs.view) S.view='jour';
    if(S.role==='admin'&&S.page==='accueil'&&c.ouverture&&c.ouverture!=='accueil'&&navGroup(c.ouverture)) S.page=c.ouverture;}
}
/* Durée d’un moment (minutes) : la journée compte l’avant-midi et l’après-midi */
const perMin=p=>p.k==='jour'?(toMin(PERIODES[0].fin)-toMin(PERIODES[0].debut))+(toMin(PERIODES[1].fin)-toMin(PERIODES[1].debut)):toMin(p.fin)-toMin(p.debut);
function paramsPage(){
  const c=cfg(), st=S.pg, tab=PS_TABS.some(t=>t[0]===st.ps)?st.ps:'ecole', can=isAdmin()&&S.conn==='shared', off=can?'':' disabled';
  const fld=(id,lbl,val,attrs)=>`<label class="field"><span>${lbl}</span><input id="${id}" value="${esc(val==null?'':val)}" ${attrs||''}${off}></label>`;
  const area=(id,lbl,val,attrs)=>`<label class="field"><span>${lbl}</span><textarea id="${id}" ${attrs||''}${off}>${esc(val==null?'':val)}</textarea></label>`;
  const sel=(id,lbl,opts,v,attrs)=>`<label class="field"><span>${lbl}</span><select id="${id}" ${attrs||''}${off}>${opts.map(([k,l])=>`<option value="${esc(k)}"${String(v)===k?' selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
  const chk=(id,lbl,on,sub,attrs)=>`<label class="ps-chk"><input type="checkbox" id="${id}" ${attrs||''}${on?' checked':''}${off}><span><b>${lbl}</b>${sub?`<small>${sub}</small>`:''}</span></label>`;
  const card=(title,body,cls)=>`<section class="panel ps-card${cls?' '+cls:''}"><h3>${title}</h3>${body}</section>`;
  /* une section = un formulaire : un titre, des cartes côte à côte, un bouton Enregistrer qui reste en bas de l’écran */
  const form=(title,lead,cards,after)=>`<form data-form="p-save" class="ps-form" novalidate><div class="ps-top"><h2 class="ps-h">${title}</h2>${lead?`<p class="help">${lead}</p>`:''}</div><div class="ps-cards">${cards}</div>
    <div class="ps-save"><button class="btn primary" type="submit" id="ps-save"${dis()}${off}>Enregistrer</button><span class="help">${can?'Les changements s’appliquent à tout le monde dès l’enregistrement.':'Seule l’administration modifie les paramètres.'}</span></div></form>${after||''}`;
  const block=(title,lead,body)=>`<div class="ps-top"><h2 class="ps-h">${title}</h2>${lead?`<p class="help">${lead}</p>`:''}</div>${body}`;
  let body='';
  if(tab==='ecole'){
    body=form('L’école','Le nom paraît dans le menu et en tête des documents imprimés, avec les coordonnées.',
      card('Identité',`${fld('p-nom','Nom de l’établissement',c.nom,'maxlength="80" autocomplete="off"')}
        ${fld('p-court','Nom court (dans le menu, facultatif)',c.nomCourt,'maxlength="30" autocomplete="off" placeholder="Ex. Académie"')}
        ${fld('p-resp','Direction ou responsable',c.resp,'maxlength="80" autocomplete="off"')}
        ${fld('p-prog','Programme (en tête des feuilles imprimées)',c.programme,'maxlength="120" autocomplete="off" placeholder="Ex. DEP 5322 – Intervention en sécurité incendie"')}`)
      +card('Coordonnées',`${fld('p-adresse','Adresse',c.adresse,'maxlength="120" autocomplete="off"')}
        <div class="grid2">${fld('p-tel','Téléphone',c.tel,'maxlength="30" autocomplete="off"')}${fld('p-courriel','Courriel',c.courriel,'type="email" maxlength="80" autocomplete="off"')}</div>
        ${fld('p-web','Site web',c.web,'maxlength="100" autocomplete="off" placeholder="https://"')}`)
,
      `<section class="panel ps-card ps-wide"><h3>Programme</h3><p class="help">${pl(comps().length,'module','modules')}. Leur nom, leurs heures de théorie et de pratique et leurs cours se gèrent dans Modules et examens.</p><div class="row"><button class="btn sm" type="button" id="p-modules" data-act="nav" data-page="modules">Ouvrir les modules</button></div></section>`);
  }else if(tab==='annonces'){
    body=annSection(can);
  }else if(tab==='annee'){
    body=form('Année scolaire','Aucune séance ne peut être placée hors de ces dates.',
      card('Dates de l’année',`${fld('p-annee','Année scolaire',c.annee,'maxlength="20" placeholder="2026–2027" autocomplete="off"')}
        <div class="grid2">${fld('p-debut','Premier jour de classe',c.debut,'type="date"')}${fld('p-fin','Dernier jour de classe',c.fin,'type="date"')}</div>`)
      +card('Calendrier scolaire',`<p class="help">${pl((c.etapes||[]).length,'étape','étapes')} et ${pl((c.conges||[]).length,'congé ou journée pédagogique','congés ou journées pédagogiques')}. Aucun cours n’est affiché les jours de congé.</p>
        <div class="row"><button class="btn sm" type="button" id="p-annee-go" data-act="nav" data-page="annee">Étapes et congés</button></div>`),
      `<div class="ps-cards">${archivesHTML(can)}</div>`);
  }else if(tab==='horaire'){
    body=form('Horaire','Le site parle en moments ; ces heures servent aux nouvelles séances et au calcul des heures enseignées.',
      card('Moments de la journée',`<div class="ps-times"><span class="ps-tl">Avant-midi</span>${fld('p-am-d','Début',PERIODES[0].debut,'type="time" step="900"')}${fld('p-am-f','Fin',PERIODES[0].fin,'type="time" step="900"')}
        <span class="ps-tl">Après-midi</span>${fld('p-pm-d','Début',PERIODES[1].debut,'type="time" step="900"')}${fld('p-pm-f','Fin',PERIODES[1].fin,'type="time" step="900"')}</div>
        <p class="help" id="p-jour">Toute la journée : de ${esc(PERIODES[0].debut.replace(':',' h '))} à ${esc(PERIODES[1].fin.replace(':',' h '))}.${c.moments&&can?' <button type="button" class="link" id="p-mom-reset" data-act="p-mom-reset">Revenir aux heures par défaut</button>':''}</p>`)
      +card('Séances',`${fld('p-req','Enseignants requis par défaut pour un cours',reqDef(),'type="number" min="0" max="9" step="1" inputmode="numeric"')}
        ${fld('p-horizon','Séances proposées aux enseignants jusqu’à (jours)',horizonJ(),'type="number" min="7" max="365" step="1" inputmode="numeric"')}
        ${sel('p-vuecal','Le calendrier s’ouvre sur',[['semaine','La semaine'],['jour','Une journée']],c.vueCal||'semaine')}
        <p class="help">Chaque personne peut ensuite changer de vue ; son choix reste pour elle.</p>`)
      +card('Corvées',chk('p-menage','Corvées de ménage',c.menage!==false,'Les journées de corvée de chaque classe paraissent dans l’horaire, en jaune.')),
      acad()?`<section class="panel ps-card ps-wide">${ressPanel()}</section>`:'');
  }else if(tab==='resultats'){
    body=form('Résultats et présences','Ces seuils colorent les taux et décident des réussites partout dans le site.',
      card('Examens',`${fld('p-seuil','Seuil de réussite des examens (%)',seuil(),'type="number" min="1" max="100" step="1" inputmode="numeric"')}
        ${chk('p-notes-el','Les élèves voient leurs notes en %',c.notesEleves!==false,'Sinon, ils voient seulement réussi, échec ou absent.')}`)
      +card('Couleurs des présences',`<div class="grid2">${fld('p-pres-ok','Bonne (vert) à partir de (%)',presOk(),'type="number" min="1" max="100" step="1" inputmode="numeric"')}${fld('p-pres-warn','À surveiller (orange) à partir de (%)',presWarn(),'type="number" min="0" max="100" step="1" inputmode="numeric"')}</div>
        <p class="help">Sous le seuil orange, le taux est en rouge.</p>`)
      +card('Calcul du taux de présence',`${chk('p-retard','Les retards comptent comme des présences',c.retardPresent!==false,'Un retard (R) ne fait pas baisser le taux.')}
        ${chk('p-motive','Les absences motivées comptent comme des présences',c.motivePresent===true,'Une absence motivée (M) ne fait plus baisser le taux.')}`));
  }else if(tab==='eleves'){
    const gs=gradesL(), rows=gs.concat(Array.from({length:Math.max(2,8-gs.length)},()=>({nom:'',c:'gris'}))).slice(0,10);
    body=form('Élèves','Les grades qu’un élève peut avoir dans sa classe.',
      card('Grades dans la classe',`<div class="ps-grades">${rows.map((g,i)=>`<div class="ps-grade"><span class="ps-gi">${i+1}</span>
          <label class="field"><span class="vh">Grade ${i+1}</span><input id="p-grade-${i}" data-grade="${i}" value="${esc(g.nom)}" maxlength="30" autocomplete="off" placeholder="${i<gs.length?'':'Nouveau grade'}"${off}></label>
          <label class="field"><span class="vh">Couleur du grade ${i+1}</span><select id="p-grade-c-${i}" data-grade-c="${i}"${off}>${GRADE_C.map(([k,l])=>`<option value="${k}"${(g.c||'gris')===k?' selected':''}>${l}</option>`).join('')}</select></label>
          <span class="ps-gs" style="background:${(GRADE_C.find(x=>x[0]===g.c)||GRADE_C[4])[2]}" aria-hidden="true"></span></div>`).join('')}</div>
        <p class="help">Du plus haut au plus bas : l’ordre sert au tri par grade. Laissez une ligne vide pour retirer un grade ; les élèves qui l’ont le gardent jusqu’à ce qu’on modifie leur fiche.</p>`,'ps-wide'));
  }else if(tab==='personnel'){
    body=form('Personnel','Les fonctions proposées dans le dossier d’un membre du personnel.',
      card('Fonctions du personnel',`${area('p-fonctions','Une fonction par ligne',FONCTIONS.join('\n'),'rows="8" maxlength="600"')}
        <p class="help">La première est proposée par défaut. Une fonction retirée reste au dossier des personnes qui l’ont.</p>
        ${can&&Array.isArray(c.fonctions)?'<div class="row"><button type="button" class="link" id="p-fn-reset" data-act="p-fn-reset">Revenir aux fonctions par défaut</button></div>':''}`)
      +card('Le personnel en chiffres',`<dl class="facts"><div><dt>Membres</dt><dd>${staff().length}</dd></div><div><dt>Enseignants</dt><dd>${teachers().length}</dd></div></dl>
        <div class="row u-mt10"><button class="btn sm" type="button" data-act="nav" data-page="personnel">Ouvrir le personnel</button></div>`));
  }else if(tab==='acces'){
    const nA=(S.data.comptes||[]).length, nD=(S.data.demandes||[]).filter(d=>d.statut==='en attente'||!d.statut).length;
    body=form('Droits et accès','Ce que les enseignants peuvent faire eux-mêmes. L’administration garde toujours tous les droits.',
      card('Les enseignants peuvent',`<div class="ps-list">${PERM_OPT.filter(x=>optRow(x[0])).map(([k,l,s])=>chk('p-perm-'+k,l,permOn(k),s,'data-perm="'+k+'"')).join('')}</div>`,'ps-wide')
      +(PERM_EL.some(x=>optRow(x[0]))?card('Les élèves voient',`<div class="ps-list">${PERM_EL.filter(x=>optRow(x[0])).map(([k,l,s])=>chk('p-perm-'+k,l,permOn(k),s,'data-perm="'+k+'"')).join('')}</div>`,'ps-wide'):''),
      `<div class="ps-cards"><section class="panel ps-card"><h3>Comptes</h3><dl class="facts"><div><dt>Comptes</dt><dd>${nA}</dd></div><div><dt>Demandes en attente</dt><dd class="${nD?'need-t':''}">${nD}</dd></div></dl>
        <div class="row u-mt10"><button class="btn sm" type="button" id="p-comptes" data-act="nav" data-page="comptes">Gérer les comptes</button></div></section>
      <section class="panel ps-card"><h3>Qui voit quoi</h3>${siteMode()?'<p class="help">Chaque personne a son compte sur le site, approuvé dans le menu Comptes. Son rôle décide de ce qu’elle voit.</p>':'<p class="help">Chaque profil suit le niveau de partage de cette page dans claude.ai : Éditeur, Contributeur ou Lecteur.</p>'}
        <ul class="access"><li><b>Administrateur</b><span>Tous les menus, y compris les comptes, les dossiers et les présences du personnel, et ces paramètres.</span></li><li><b>Enseignant</b><span>Son horaire, ses disponibilités, les séances à pourvoir et ses candidatures, ainsi que les présences et les examens de ses séances (selon les droits ci-dessus).</span></li><li><b>Élève</b><span>L’horaire et les examens de sa classe, ses propres résultats et le calendrier scolaire.</span></li></ul></section></div>`);
  }else if(tab==='menu'){
    const cur=c.couleur==='perso'&&okHex(c.couleurPerso)?'perso':c.couleur||'', ph=okHex(c.couleurPerso)?c.couleurPerso:'#C62F2A';
    body=form('Menu et affichage','La couleur principale sert aux boutons, à la page ouverte du menu et aux repères du jour.',
      card('Couleur principale',`<div class="ps-colors">${COULEURS.map(([k,l,h])=>`<label class="ps-color"><input type="radio" name="p-couleur" id="p-col-${k||'rouge'}" value="${k}"${cur===k?' checked':''}${off}><span class="ps-sw" style="background:${h}"></span><span>${l}</span></label>`).join('')}
        <label class="ps-color"><input type="radio" name="p-couleur" id="p-col-perso" value="perso"${cur==='perso'?' checked':''}${off}><span>Autre</span><input type="color" id="p-col-hex" value="${esc(ph)}" aria-label="Choisir une autre couleur"${off}></label></div>`,'ps-wide')
      +card('Ouverture et listes',`<div class="grid2">${sel('p-ouverture','Page d’ouverture de l’administration',ACCUEIL_OPT,c.ouverture||'accueil')}
        ${sel('p-vue','Affichage des listes par défaut',VIEW_M.map(([k,l])=>[k,l]),c.vueDefaut||'list')}</div>
        <p class="help">Chaque personne peut changer l’affichage d’une liste avec les boutons à côté de la cloche ; son choix reste pour elle.</p>`)
      +card('Entrées du menu de l’administration',`<div class="ps-menu">${MENU_OPT.filter(x=>optRow(x[0])).map(([k,l])=>`<div class="ps-mrow"><label class="ps-mchk"><input type="checkbox" id="p-menu-${k}" data-menu="${k}"${!(c.menuMasque||[]).includes(k)?' checked':''}${off}><span>${l}</span></label>
          <label class="field"><span class="vh">Nom affiché pour ${l}</span><input id="p-mnom-${k}" data-menu-nom="${k}" value="${esc(menuNom(k))}" maxlength="28" autocomplete="off" placeholder="${esc(l)}"${off}></label></div>`).join('')}</div>
        <p class="help">Décochez pour masquer une entrée ; écrivez un autre nom pour la renommer. Le calendrier, les paramètres et les nouveautés restent toujours.</p>`,'ps-wide'));
  }else if(tab==='notifs'){
    const grp=w=>`<div class="ps-list">${NF_OPT.filter(x=>x[1]===w&&optRow(x[0])).map(([k,,l])=>chk('p-nf-'+k,l,nfOn(k),'','data-nf="'+k+'"')).join('')}</div>`;
    body=form('Notifications','Ce que la cloche annonce. Une notification coupée n’apparaît plus pour personne.',
      card('Pour l’administration',grp('Administration'))+card('Pour les enseignants',grp('Enseignants'))+card('Pour les élèves',grp('Élèves')));
  }else if(tab==='impression'){
    body=form('Impression','L’horaire de la semaine, les feuilles de présences et les relevés de résultats.',
      card('En-tête',`${chk('p-imp-logo','Le logo de l’Académie',c.impLogo!==false,'À gauche du titre.')}
        ${chk('p-imp-coord','Les coordonnées de l’école',c.impCoord!==false,'Direction, adresse, téléphone et courriel, à droite du titre.')}
        ${chk('p-imp-date','La date d’impression',c.impDate===true,'« Imprimé le … », sous le nom de l’école.')}`)
      +card('Bas de page',`${fld('p-pied','Mention sous l’en-tête',c.pied,'maxlength="140" autocomplete="off" placeholder="Ex. Document confidentiel — usage interne"')}
        ${fld('p-sign','Ligne de signature au bas de chaque page',c.impSign,'maxlength="60" autocomplete="off" placeholder="Ex. Signature de la direction"')}`));
  }else{
    const n=S.conn==='shared'?exampleCount():0, ask=!!st.reset;
    const exp=(id,v,t,s)=>`<div><b>${t}</b><small>${s}</small><button class="btn sm" type="button" id="${id}" data-act="p-export" data-v="${v}">${icon('down')}Exporter</button></div>`;
    body=block('Données','Des copies à garder en sauvegarde ou à ouvrir dans Excel, et la remise à zéro des réglages.',
      `<div class="ps-cards"><section class="panel ps-card ps-wide"><h3>Exporter</h3><div class="ps-exp">
        ${exp('p-exp-json','json','Toutes les données','Réglages, classes, élèves, personnel, horaire, résultats, candidatures et disponibilités (fichier JSON).')}
        ${exp('p-exp-el','eleves','Liste des élèves','Numéro, nom, classe, grade, courriel, téléphone (CSV pour Excel).')}
        ${exp('p-exp-pers','personnel','Liste du personnel','Nom, fonction, statut, courriel, téléphone (CSV pour Excel).')}
        ${exp('p-exp-seances','seances','Horaire de l’année','Chaque séance : date, heures, classe, cours, enseignants, annulée ou non (CSV pour Excel).')}
      </div></section>
      <section class="panel ps-card"><h3>Réglages par défaut</h3><p class="help">Remet la couleur, le menu, l’ouverture, les droits des enseignants, les notifications et l’impression comme au départ. L’école, l’année, l’horaire, les grades et les fonctions ne changent pas.</p>
        ${can?ask?`<div class="row"><button class="btn sm danger" type="button" id="p-reset-go" data-act="p-reset">Oui, tout remettre</button><button class="btn sm ghost" type="button" data-act="pg-set" data-k="reset" data-v="">Annuler</button></div>`:'<div class="row"><button class="btn sm" type="button" id="p-reset" data-act="pg-set" data-k="reset" data-v="1">Remettre les réglages par défaut</button></div>':''}</section>
      <section class="panel ps-card"><h3>Données d’exemple</h3><p class="help">${n?`${pl(n,'élément d’exemple est encore présent','éléments d’exemple sont encore présents')}. Les effacer laisse ce que vous avez ajouté vous-même.`:'Aucune donnée d’exemple.'}</p>${n&&can?'<div class="row"><button class="btn sm danger" type="button" id="p-clear-ex" data-act="clear-ex">Effacer les exemples</button></div>':''}</section></div>`);
  }
  return `<div class="ps-body">${body}</div>`;
}
/* Les réglages que « Remettre les réglages par défaut » efface */
const PS_RESET=['couleur','couleurPerso','vueDefaut','ouverture','menuMasque','menuNoms','perms','notifs','impLogo','impCoord','impDate','impSign','pied'];
/* Exports de la page Données */
async function exportData(kind){
  const D=S.data, day=todayISO();
  if(kind==='json'){
    const strip=a=>(a||[]).map(x=>Object.assign({},x));
    const out={exporte:new Date().toISOString(),site:'PompierNote',config:D.config,groupes:strip(D.groupes),eleves:strip(D.eleves),enseignants:strip(D.enseignants),dossiersPersonnel:D.dossiers,cours:strip(RAWC),examens:strip(D.examens),resultats:D.resultats,candidatures:strip(D.candidatures),remplacements:strip(D.remplacements),disponibilites:D.dispos,presencesPersonnel:D.staffPres,comptes:strip(D.comptes)};
    return saveFile(`pompiernote-donnees-${day}.json`,new Blob([JSON.stringify(out,null,2)],{type:'application/json'}));
  }
  if(kind==='eleves') return saveFile(`pompiernote-eleves-${day}.csv`,new Blob([csvText([['Numéro','Nom','Classe','Grade','Courriel','Téléphone','Date de naissance','Contact d’urgence']].concat(sortElsByClass(D.eleves).map(e=>[e.numero,e.nom,gName(e.groupe),e.fonction,e.courriel,e.telephone,e.naissance,e.parent])))],{type:'text/csv'}));
  if(kind==='seances'){
    const c=cfg(), a=c.debut||yearStart(), b=c.fin||iso(addDays(parse(a),365));
    const rows=sessionsBetween(a,b).filter(s=>s.kind==='cours').sort((x,y)=>x.date.localeCompare(y.date)||x.start-y.start||gName(x.grp).localeCompare(gName(y.grp)));
    const hm=v=>pad(Math.floor(v/60))+':'+pad(v%60);
    return saveFile(`pompiernote-horaire-${day}.csv`,new Blob([csvText([['Date','Début','Fin','Moment','Classe','Code','Cours','Enseignants','Annulée']].concat(rows.map(s=>[s.date,hm(s.start),hm(s.end),momentOf(s),gName(s.grp),s.c.code||'',s.c.titre||'',(s.tch||[]).map(tName).join(', '),s.cancelled?'Oui':''])))],{type:'text/csv'}));
  }
  return saveFile(`pompiernote-personnel-${day}.csv`,new Blob([csvText([['Nom','Fonction','Statut','Courriel','Téléphone']].concat(staff().map(p=>[p.nom,p.fonction||'Enseignant',p.statut||'Actif',p.courriel,(D.dossiers[p.id]||{}).telephone])))],{type:'text/csv'}));
}
