/* ---------- Notifications (la cloche) ----------
   Rien de plus n’est enregistré : la liste se déduit de ce que la personne peut déjà lire — ses candidatures,
   les demandes de remplacement, les séances annulées. Ce qui a été vu est noté dans le navigateur.
   Le courriel viendra avec la connexion Firebase (il faut un serveur pour l’envoyer). */
const whoAmI=()=>(S.me&&S.me.name)||'';
const ago=t=>{if(!t)return '';const m=Math.round((Date.now()-new Date(t).getTime())/60000);if(isNaN(m))return '';if(m<1)return 'à l’instant';if(m<60)return `il y a ${m} min`;const h=Math.round(m/60);if(h<24)return `il y a ${h} h`;const d=Math.round(h/24);return d===1?'hier':d<14?`il y a ${d} jours`:shortDate(new Date(t));};
let _nf=null;
function notifs(){
  const D=S.data, who=S.role==='teacher'?S.teacher:S.role==='student'?S.group:'', day=todayISO(), k=S.role+'|'+who+'|'+day;
  if(_nf&&_nf.c===D.cours&&_nf.a===D.candidatures&&_nf.r===D.remplacements&&_nf.g===D.config&&_nf.s===D.stock&&_nf.k===k) return _nf.out;
  const out=[], recent=iso(addDays(new Date(),-7));
  const info=(date,key)=>{const s=findSess(date,key);return s?{s,txt:`${s.c.code?s.c.code+' ':''}${s.c.titre} · ${gName(s.grp)}, ${dayLabel(parse(s.date)).toLowerCase()}`}:null;};
  /* séances annulées à venir : pour l’enseignant qui les donnait, ou pour la classe */
  const cancelled=(match,pre)=>{
    for(const c of D.cours) for(const tag of c.annulees||[]){
      const [date,sid]=String(tag).split('@');if(!sid||date<day) continue;
      const x=info(date,`${c.id}_${sid}_${date}`);if(!x||!x.s.cancelled||x.s.movedX||!match(x.s)) continue;
      const a=(c.annule||{})[tag]||{};
      out.push({id:`a:${pre}:${x.s.key}`,t:a.le||'',tone:'bad',title:W('Séance annulée','Cours annulé'),text:x.txt+'.',go:{k:'sess',key:x.s.key,date}});
    }
  };
  if(S.role==='teacher'&&who){
    for(const d of D.candidatures){
      if(d.enseignant!==who||d.date<recent) continue;
      const T={approuve:d.par==='admin'?['ok','Séance attribuée','Vous donnez ']:['ok','Candidature approuvée','Vous donnez '],refuse:['bad','Candidature refusée','Pour '],retire:['warn','Séance retirée','Vous ne donnez plus ']}[d.statut], x=T&&info(d.date,d.seance);
      if(x) out.push({id:`c:${d.id}:${d.statut}`,t:d.maj||'',tone:T[0],title:T[1],text:T[2]+x.txt+'.',go:{k:'mes',tab:d.statut==='approuve'?'mine':'open'}});
    }
    cancelled(s=>(s.tch||[]).includes(who),'t:'+who);
  }else if(S.role==='student'&&who) cancelled(s=>s.grp===who,'g:'+who);
  else if(S.role==='admin'){
    for(const d of D.remplacements){
      if(d.date<day) continue;const x=info(d.date,d.seance);
      if(x&&!x.s.cancelled&&(x.s.tch||[]).includes(d.enseignant)) out.push({id:`r:${d.id}`,t:d.maj||'',tone:'warn',title:'Remplacement demandé',text:`${tName(d.enseignant)} · ${x.txt}.${d.motif?' Raison : '+d.motif:''}`,go:{k:'aff',tab:'remp'}});
    }
    for(const d of D.candidatures){
      if(d.statut!=='attente'||d.date<day) continue;const x=info(d.date,d.seance);
      if(x&&!x.s.cancelled&&byId(D.enseignants,d.enseignant)) out.push({id:`c:${d.id}:attente`,t:d.maj||'',tone:'info',title:'Nouvelle candidature',text:`${tName(d.enseignant)} · ${x.txt}.`,go:{k:'aff',tab:'cand'}});
    }
    /* stock : consommables à commander, inspections en retard, équipement à réparer */
    const A=stkAlerts();
    for(const a of A.bas) out.push({id:`s:bas:${a.id}:${a.qte}`,t:a.maj||'',tone:'warn',title:'À commander',text:`${a.nom} : ${fmtQ(a.qte)} ${a.unite||''} en stock (seuil ${fmtQ(a.seuil)}).`,go:{k:'stock',tab:'conso'}});
    for(const a of A.retard) out.push({id:`s:insp:${a.id}:${a.insp||''}`,t:a.maj||'',tone:'bad',title:'Inspection en retard',text:`${stkName(a)} : prévue le ${shortDate(parse(stkNext(a)))}.`,go:{k:'stock',tab:'mat'}});
    for(const a of A.reparer) out.push({id:`s:rep:${a.id}:${a.etat}`,t:a.maj||'',tone:a.etat==='hs'?'bad':'warn',title:a.etat==='hs'?'Équipement hors service':'Équipement à réparer',text:`${stkName(a)}.`,go:{k:'stock',tab:'epi'}});
  }
  out.sort((a,b)=>(b.t||'').localeCompare(a.t||''));
  _nf={c:D.cours,a:D.candidatures,r:D.remplacements,g:D.config,s:D.stock,k,out};
  return out;
}
const nfNew=()=>{const seen=new Set(S.nfSeen||[]);return notifs().filter(n=>!seen.has(n.id));};
function bellHTML(){
  if(S.conn!=='shared'||!allLoaded()) return '';
  const n=nfNew().length;
  return `<button type="button" class="bell" id="nf-bell" data-act="nf-open" aria-label="${n?pl(n,'nouvelle notification','nouvelles notifications'):'Notifications'}" title="Notifications">${icon('bell')}${n?`<i class="bell-n" id="nf-n">${n>9?'9+':n}</i>`:''}</button>`;
}
function notifDrawer(){
  const d=S.dr, list=notifs(), fresh=new Set(d.fresh||[]), n=list.filter(x=>fresh.has(x.id)).length;
  const empty=S.role==='admin'?'Les demandes de remplacement, les nouvelles candidatures et les alertes du stock apparaîtront ici.':S.role==='teacher'?'Vos candidatures approuvées ou refusées et vos séances annulées apparaîtront ici.':'Les séances annulées de votre classe apparaîtront ici.';
  const rows=list.map((x,i)=>`<li><button type="button" class="nf-row${fresh.has(x.id)?' new':''}" data-act="nf-go" data-i="${i}"><span class="nf-h"><span class="chip ${x.tone}">${esc(x.title)}</span><small>${esc(ago(x.t))}</small></span><span class="nf-tx">${esc(x.text)}</span></button></li>`).join('');
  return dTop('Notifications',!list.length?'Rien pour l’instant':n?pl(n,'nouvelle','nouvelles'):'Tout est vu','')
    +`<div class="dr-body">${list.length?`<ul class="nf-list">${rows}</ul>`:`<p class="help">${empty}</p>`}</div>`;
}

