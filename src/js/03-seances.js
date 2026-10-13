/* ---------- Calcul des cours et des examens ---------- */
function offDay(ds){
  const c=cfg();
  if((c.debut&&ds<c.debut)||(c.fin&&ds>c.fin)) return 'Hors année scolaire';
  for(const k of c.conges||[]){ if(k&&k.du&&ds>=k.du&&ds<=(k.au||k.du)) return k.nom||'Congé'; }
  return null;
}
const activeSlots=c=>(c.creneaux||[]).filter(s=>!s.au||s.au>=todayISO());
/* L’horaire d’un jour est gardé en mémoire tant que les séances, le calendrier scolaire et les affectations ne changent pas.
   Le tableau rendu est figé : qui veut le trier ou le filtrer en fait une copie. */
let _so={c:null,g:null,a:null,m:new Map()};
function sessionsOn(ds){
  const D=S.data;
  if(_so.c!==D.cours||_so.g!==D.config||_so.a!==D.candidatures) _so={c:D.cours,g:D.config,a:D.candidatures,m:new Map()};
  let r=_so.m.get(ds);
  if(!r){r=Object.freeze(sessionsOnRaw(ds));_so.m.set(ds,r);}
  return r;
}
function sessionsOnRaw(ds){
  const d=parse(ds), j=(d.getDay()+6)%7+1;
  if(j>5||offDay(ds)) return [];
  const out=[];
  for(const c of S.data.cours){
    const ann=c.annulees||[];
    if(!((c.du&&ds<c.du)||(c.au&&ds>c.au))) for(const sl of c.creneaux||[]){
      if(+sl.jour!==j||(sl.du&&ds<sl.du)||(sl.au&&ds>sl.au)) continue;
      const a=toMin(sl.debut), b=toMin(sl.fin);
      if(isNaN(a)||isNaN(b)||b<=a) continue;
      const tag=`${ds}@${sl.id}`, cancelled=ann.includes(tag);
      out.push({kind:'cours',key:`${c.id}_${sl.id}_${ds}`,c,sl,date:ds,start:a,end:b,grp:c.groupe,tch:tchOf(c,`${c.id}_${sl.id}_${ds}`),salle:String(sl.salle||c.salle||'').trim(),cancelled,movedX:cancelled?(c.extras||[]).find(x=>x.de===tag)||null:null});
    }
    for(const x of c.extras||[]){
      if(x.date!==ds) continue;
      const a=toMin(x.debut), b=toMin(x.fin);
      if(isNaN(a)||isNaN(b)||b<=a) continue;
      out.push({kind:'cours',key:`${c.id}_${x.id}_${ds}`,c,sl:{id:x.id,jour:j,debut:x.debut,fin:x.fin,salle:x.salle||''},extra:x,date:ds,start:a,end:b,grp:c.groupe,tch:tchOf(c,`${c.id}_${x.id}_${ds}`),salle:String(x.salle||c.salle||'').trim(),cancelled:ann.includes(`${ds}@${x.id}`)});
    }
  }
  return out.sort((x,y)=>x.start-y.start||x.end-y.end);
}
/* On parle d’avant-midi, d’après-midi ou de toute la journée, jamais d’heures. */
function moment(a,b){if(a<12*60&&b>13*60)return 'Toute la journée';return a<12*60?'Avant-midi':'Après-midi';}
const momentOf=s=>moment(s.start,s.end);
const momentShort=s=>({'Avant-midi':'AM','Après-midi':'PM'})[momentOf(s)]||'Journée';
const momentIn=(a,b)=>({'Avant-midi':'en avant-midi','Après-midi':'en après-midi'})[moment(a,b)]||'toute la journée';
const codeOf=c=>c&&c.code?`<span class="cc-code">${esc(c.code)}</span> `:'';
function movedLabel(s){
  const x=s.movedX;if(!x)return '';
  if(x.date===s.date) return 'Déplacé '+momentIn(toMin(x.debut),toMin(x.fin));
  const d=parse(x.date);return `Déplacé au ${WD[d.getDay()].toLowerCase()} ${dn(d)}`;
}
function examItem(e){
  const c=byId(S.data.cours,e.cours), a=toMin(e.debut), b=toMin(e.fin);
  return {kind:'exam',key:'x_'+e.id,e,c,date:e.date,start:isNaN(a)?0:a,end:isNaN(b)?(isNaN(a)?0:a+75):b,grp:e.groupe||(c&&c.groupe)||'',tch:[c&&c.enseignant,e.surveillant].filter(Boolean),salle:String(e.salle||(c&&c.salle)||'').trim()};
}
function weekItems(){
  let out=[];const from=iso(S.week), to=iso(addDays(S.week,4));
  for(let i=0;i<5;i++) out=out.concat(sessionsOn(iso(addDays(S.week,i))));
  out=out.concat(S.data.examens.filter(e=>!e.seance&&e.date>=from&&e.date<=to).map(examItem));
  return out.sort((x,y)=>x.date.localeCompare(y.date)||x.start-y.start||(x.kind==='exam'?-1:1));
}
function isPast(s){const t=todayISO();return s.date<t||(s.date===t&&s.start<=nowMin());}
const presDoc=key=>S.data.presences[key]||S.data.presTerm[key];
function attInfo(s){
  if(s.cancelled) return {state:'cancelled',c:{},marked:0,total:0,past:isPast(s),due:false};
  const els=studentsOf(s.c.groupe), p=presDoc(s.key), st=(p&&p.statuts)||{};
  const c={P:0,A:0,R:0,M:0}; let marked=0;
  for(const e of els){const v=st[e.id];if(c[v]!=null){c[v]++;marked++;}}
  const past=isPast(s);
  /* une activité (Accueil, Graduation…) n’a des présences à prendre que si on a commencé à les prendre */
  const state=els.length&&marked>=els.length?'done':marked>0?'partial':past?(isActivity(s.c)?'none':'todo'):'future';
  return {state,c,marked,total:els.length,past,doc:p,due:past&&els.length>0&&(state==='todo'||state==='partial')};
}
function statusChip(s,mode){return (!s.cancelled&&profAbsent(s)?'<span class="chip bad">Enseignant absent</span>':'')+statusChip0(s,mode);}
function statusChip0(s,mode){
  if(s.kind==='exam') return '';
  if(s.cancelled) return s.movedX?`<span class="chip info">${esc(movedLabel(s))}</span>`:'<span class="chip off">Annulé</span>';
  const moved=s.extra&&s.extra.de?'<span class="chip info">Déplacé ici</span>':'';
  if(mode==='student') return moved;
  const a=attInfo(s);
  if(a.state==='done') return moved+'<span class="chip ok">Présences faites</span>';
  if(a.state==='partial') return moved+`<span class="chip warn">${a.marked}/${a.total} marqués</span>`;
  if(a.state==='todo') return moved+'<span class="chip warn">Présences à faire</span>';
  return moved;
}
/* Numéro du cours dans l’horaire annuel : « 7.5 » devient « Cours 7.5 » */
function sessLabel(s){
  const l=s&&s.extra&&s.extra.label?String(s.extra.label).trim():'';
  if(!l||l.toLowerCase()===String(s.c&&s.c.titre||'').toLowerCase()) return '';
  /* « 8.1–8.2 » : deux cours ; « 16-6 » : un seul cours, numéroté avec un trait d’union */
  const r=/^(\d+(?:[.,-]\d+)*)\s*–\s*(\d+(?:[.,-]\d+)*)$/.exec(l)||/^(\d+(?:[.,]\d+)*)\s+-\s+(\d+(?:[.,]\d+)*)$/.exec(l);
  if(r) return `Cours ${r[1]} et ${r[2]}`;
  return /^\d+([.,-]\d+)*$/.test(l)?'Cours '+l:l;
}
function metaFor(s,mode){
  if(s.kind==='exam'){
    const e=s.e;
    return [s.c?e.titre:'',mode==='admin'?'':gName(s.grp),s.salle?'Local '+s.salle:'',e.surveillant?'Surveillance : '+shortName(tName(e.surveillant)):''].filter(Boolean).join(' · ');
  }
  const c=s.c, id=sessLabel(s), ids=(s.tch||[]).filter(t=>t&&byId(S.data.enseignants,t)), who=ids.length?shortName(tName(ids[0]))+(ids.length>1?' +'+(ids.length-1):''):shortName(tName(c.enseignant));
  if(mode==='admin') return [who,s.salle?'Local '+s.salle:'',id].filter(Boolean).join(' · ');
  if(mode==='teacher') return [gName(c.groupe),s.salle?'Local '+s.salle:'',id].filter(Boolean).join(' · ');
  return [who,s.salle?'Local '+s.salle:'',id].filter(Boolean).join(' · ');
}
/* Étiquettes d’une séance de l’horaire annuel (Pratique, Théorie, Examen, Ménage…), comme sur le site. */
const TAGCHIP={Pratique:'ok',Théorie:'info',Examen:'bad',Reprise:'bad',Simulation:'k2',Sport:'k2',Stage:'k5',Visite:'k4',Musée:'k4',Ménage:'warn','Ménage ?':'warn',Maison:'off',Congé:'off'};
const TAGTONE={Pratique:'k6',Théorie:'k0',Examen:'kx',Reprise:'kx',Simulation:'k2',Stage:'k5',Visite:'k4',Musée:'k4',Congé:'k7'};
const tagsOf=s=>(s.extra&&s.extra.tags)||(s.sl&&s.sl.type?withAct([],s.sl.type):[]);
/* Période et activité d’une séance, comme dans le formulaire du site de l’Académie */
const PERIODES=[{k:'am',label:'Avant-midi',debut:'08:00',fin:'11:00'},{k:'pm',label:'Après-midi',debut:'12:00',fin:'15:00'},{k:'jour',label:'Toute la journée',debut:'08:00',fin:'15:00'}];
const ACTIVITES=[{k:'theorie',label:'Théorie',tags:['Théorie']},{k:'pratique',label:'Pratique',tags:['Pratique']},{k:'examen',label:'Examen',tags:['Examen']},{k:'examen-t',label:'Examen théorique',tags:['Examen','Théorie']},{k:'examen-p',label:'Examen pratique',tags:['Examen','Pratique']},{k:'reprise',label:'Reprise',tags:['Reprise']},{k:'simulation',label:'Simulation',tags:['Simulation']},{k:'conge',label:'Congé / journée spéciale',tags:['Congé']},{k:'visite',label:'Visite',tags:['Visite']},{k:'stage',label:'Stage',tags:['Stage']},{k:'activite',label:'Activité',tags:[]}];
const ACT_TAGS=new Set(['Théorie','Pratique','Examen','Reprise','Simulation','Visite','Congé','Stage']);
const periodOf=(debut,fin)=>{const p=PERIODES.find(x=>x.debut===debut&&x.fin===fin);return p?p.k:'autre';};
function actOf(tags){const t=new Set(tags||[]);if(t.has('Examen')&&t.has('Théorie'))return 'examen-t';if(t.has('Examen')&&t.has('Pratique'))return 'examen-p';if(t.has('Examen'))return 'examen';if(t.has('Reprise'))return 'reprise';if(t.has('Théorie'))return 'theorie';if(t.has('Pratique'))return 'pratique';if(t.has('Simulation'))return 'simulation';if(t.has('Visite'))return 'visite';if(t.has('Congé'))return 'conge';if(t.has('Stage'))return 'stage';return 'activite';}
function withAct(tags,k){const a=ACTIVITES.find(x=>x.k===k);return (a?a.tags:[]).concat((tags||[]).filter(t=>!ACT_TAGS.has(t)));}
function periodSelect(id,debut,fin,attrs,custom){const p=custom?'autre':periodOf(debut,fin);return `<select id="${id}" ${attrs}>${PERIODES.map(x=>`<option value="${x.k}"${p===x.k?' selected':''}>${x.label}</option>`).join('')}<option value="autre"${p==='autre'?' selected':''}>${p==='autre'&&debut&&fin?`Heures précises (${fmtT(debut)} – ${fmtT(fin)})`:'Heures précises…'}</option></select>`;}
const actSelect=(id,k,attrs)=>`<select id="${id}" ${attrs}>${ACTIVITES.map(x=>`<option value="${x.k}"${k===x.k?' selected':''}>${x.label}</option>`).join('')}</select>`;
const CHORE_TAGS=new Set(['Ménage','Ménage ?']);
/* La corvée de ménage est pour toute la classe, toute la journée.
   Elle est notée dans la classe (groupes/<id>.menage : liste de dates) ; les anciennes étiquettes « Ménage »
   d’une séance de la classe ce jour-là comptent aussi. */
let choreMemo=new Map();
function choreDay(gid,date){
  if(!gid||!date) return '';
  const k=gid+'|'+date;if(choreMemo.has(k)) return choreMemo.get(k);
  let r='';
  const g=byId(S.data.groupes,gid);
  if(g&&Array.isArray(g.menage)&&g.menage.includes(date)) r='oui';
  else for(const x of sessionsOn(date)){
    if(x.grp!==gid||x.kind==='exam'||x.cancelled) continue;
    const t=tagsOf(x);if(t.includes('Ménage')){r='oui';break;}if(t.includes('Ménage ?'))r='maybe';
  }
  choreMemo.set(k,r);return r;
}
const choreOf=s=>!s||s.kind==='exam'||s.cancelled?'':choreDay(s.grp,s.date);
async function setChoreDay(gid,date,on){
  const g=byId(S.data.groupes,gid);if(!g||S.busy)return;
  const days=new Set(Array.isArray(g.menage)?g.menage:[]);
  if(on) days.add(date); else days.delete(date);
  const jobs=[()=>col('groupes').doc(gid).update({menage:[...days].sort()})];
  // en retirant la corvée, les anciennes étiquettes « Ménage » des séances de ce jour disparaissent aussi
  if(!on) for(const c of S.data.cours.filter(c=>c.groupe===gid)){
    if(!(c.extras||[]).some(x=>x.date===date&&(x.tags||[]).some(t=>CHORE_TAGS.has(t)))) continue;
    const doc=courseDoc(c);doc.extras.forEach(x=>{if(x.date===date)x.tags=(x.tags||[]).filter(t=>!CHORE_TAGS.has(t));});
    jobs.push(()=>putCours(c.id,doc));
  }
  S.busy=true;render();
  await write(async()=>{for(const j of jobs)await j();},on?'Corvée de ménage ajoutée pour la journée':'Corvée de ménage retirée');
  S.busy=false;render();
}
const choreChip=s=>{const k=choreOf(s);return k?`<span class="chore-chip${k==='maybe'?' maybe':''}" title="${k==='maybe'?'Corvée de ménage à confirmer':'Corvée de ménage de la classe, toute la journée'}">${icon('broom')}Ménage${k==='maybe'?' ?':''}</span>`:'';};
const choreNote=s=>{const k=choreOf(s);return k?`<div class="chore-note${k==='maybe'?' maybe':''}">${icon('broom')}<p><b>Corvée de ménage${k==='maybe'?' à confirmer':''}</b>La classe ${k==='maybe'?'aura peut-être':'a'} la corvée de ménage toute la journée.</p></div>`:'';};
const sessTone=s=>{for(const t of tagsOf(s)) if(TAGTONE[t]) return TAGTONE[t];return tone(s.c);};
const datedOf=c=>(c&&c.extras||[]).filter(x=>!x.de);
const sessMinutes=x=>x.minutes!=null?+x.minutes:Math.max(0,toMin(x.fin)-toMin(x.debut));
function filterItems(items,mode){
  if(mode==='teacher') return items.filter(s=>s.tch.includes(S.teacher));
  if(mode==='student') return items.filter(s=>s.grp===S.group);
  const f=S.filtre;
  if(!f) return items;
  return f.startsWith('g:')?items.filter(s=>s.grp===f.slice(2)):items.filter(s=>s.tch.includes(f.slice(2)));
}

