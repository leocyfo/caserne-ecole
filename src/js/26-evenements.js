/* ---------- Événements ---------- */
function setWeek(d){S.week=d;S.day=defaultDay();subWeek();render();}
function setRole(r){if(r===S.role)return;S.role=r;S.page='calendar';S.pg={};S.dr=null;S.confirmClear=false;savePrefs();render();}
function goPage(p){if(p==='presences')p='classes';S.page=p;S.pg={};if(p==='eleves'||p==='classes')ensureTerm();render();window.scrollTo({top:0});}
function openSession(key,date){
  const s=date?findSess(date,key):weekItems().find(x=>x.key===key);if(!s)return;
  const base={key,coursId:s.c.id,slotId:s.sl.id,date:s.date};
  if(S.role==='admin'&&!date) openCourse(s.c.id,{key,date:s.date,slotId:s.sl.id});
  else if(S.role!=='student'&&!s.cancelled) openDrawer(Object.assign({kind:'att',dirty:false,draft:{statuts:{},note:''}},base));
  else openDrawer(Object.assign({kind:'info'},base));
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled)return;
  const a=b.dataset.act, d=S.dr, pg=S.pg;
  switch(a){
    case 'role':setRole(b.dataset.role);break;
    case 'demo-reset':if(window.__DEMO_RESET)window.__DEMO_RESET();break;
    case 'ac-new':openAccount(null);break;
    case 'ac-approve':{const x=S.data.demandes.find(q=>q.id===b.dataset.id);if(!x)break;const g=guessAcct(x);openAccount(byId(S.data.comptes,x.id)?x.id:null,{draft:{uid:x.id,role:g.role,ref:g.ref},demande:x});break;}
    case 'ac-refuse':{if(S.busy)break;const id=b.dataset.id;S.busy=true;render();await write(()=>col('demandes').doc(id).update({statut:'refusée',traitee:new Date().toISOString()}),'Demande refusée');S.busy=false;render();break;}
    case 'logout':if(window.__AUTH)window.__AUTH.signOut();break;
    case 'import-demo':importDemo();break;
    case 'ac-edit':openAccount(b.dataset.id);break;
    case 'ac-filter':pg.r=b.dataset.v;render();break;
    case 'ac-pick':if(d&&d.kind==='acct'){d.draft.uid=b.dataset.uid;d.over=false;d.err='';renderDrawer();}break;
    case 'ac-change':if(d&&d.kind==='acct'){d.draft.uid='';d.over=false;d.q='';d.hits=[];renderDrawer();const q=$('#ac-q');if(q)q.focus();}break;
    case 'ac-role':if(d&&d.kind==='acct'&&d.draft.role!==b.dataset.v){d.draft.role=b.dataset.v;d.draft.ref='';d.err='';renderDrawer();}break;
    case 'ac-del':if(d){d.confirmDel=true;renderDrawer();}break;
    case 'ac-del-no':if(d){d.confirmDel=false;renderDrawer();}break;
    case 'ac-del-yes':{if(!d||S.busy)break;S.busy=true;renderDrawer();const ok=await write(()=>col('comptes').doc(d.id).delete(),'Compte supprimé');S.busy=false;if(ok&&S.dr===d)S.dr=null;render();break;}
    case 'nav':goPage(b.dataset.page);break;
    case 'prev':if(dayMode())stepDay(-1);else setWeek(addDays(S.week,-7));break;
    case 'next':if(dayMode())stepDay(1);else setWeek(addDays(S.week,7));break;
    case 'today':if(dayMode())setDay(weekday(new Date()));else setWeek(baseMonday());break;
    case 'view':{const v=b.dataset.v==='jour'?'jour':'semaine';if(v===S.view)break;S.view=v;if(v==='jour')S.dayDate=initDay();savePrefs();render();break;}
    case 'day':S.day=+b.dataset.i;render();break;
    case 'sess':openSession(b.dataset.key);break;
    case 'open-att':openSession(b.dataset.key,b.dataset.date);break;
    case 'new-course':if(acad())openAddCourse(Object.assign({},b.dataset.g?{groupe:b.dataset.g}:null,b.dataset.m?{module:b.dataset.m}:null,b.dataset.type?{type:b.dataset.type}:null));else openCourse(null,null,b.dataset.g?{groupe:b.dataset.g}:null);break;
    case 'edit-course':openCourse(b.dataset.id);break;
    case 'see-group':S.filtre='g:'+b.dataset.id;S.fmode='g';savePrefs();goPage('calendar');break;
    case 'toggle-size':S.compact=!S.compact;savePrefs();render();break;
    case 'side':S.sideMini=!S.sideMini;savePrefs();render();break;
    case 'demo':{S.demoHidden=!S.demoHidden;savePrefs();render();const f=$(demoHidden()?'#demo-show':'#demo-hide');if(f)f.focus();break;}
    case 'fmode':if(S.fmode!==b.dataset.v){S.fmode=b.dataset.v;S.filtre='';savePrefs();render();}break;
    case 'filt':{
      const v=b.dataset.v, prev=S.filtre;
      if(v.startsWith('g:')){
        const t=rowTop(v.slice(2));
        if(t!=null){S.rowAnchor={id:v.slice(2),top:t};S._pin={id:v.slice(2),top:t};}
      }else if(!v&&prev.startsWith('g:')){
        const id=prev.slice(2), a=S.rowAnchor&&S.rowAnchor.id===id?S.rowAnchor:null;
        S._pin={id,top:a?a.top:96};
      }
      S.filtre=v;savePrefs();render();break;
    }
    case 'add-at':{
      if(acad()){const busy0=sessionsOn(b.dataset.date).filter(x=>x.grp===b.dataset.g&&!x.cancelled), am=busy0.some(x=>x.start<11*60), pm=busy0.some(x=>x.end>12*60);openAddCourse({groupe:b.dataset.g,date:b.dataset.date,per:am&&!pm?'pm':!am&&pm?'am':'jour'});break;}
      const ds=b.dataset.date, g=b.dataset.g, j=(parse(ds).getDay()+6)%7+1, busy=sessionsOn(ds).filter(s=>s.grp===g&&!s.cancelled);
      const free=periodOptions().find(k=>{const [x,y]=k.split('-').map(toMin);return !busy.some(s=>s.start<y&&x<s.end);})||'08:15-09:30';
      const [deb,fin]=free.split('-');
      openCourse(null,null,{groupe:g,creneaux:[{id:slotId(),jour:String(j),debut:deb,fin,salle:''}]});break;}
    case 'move-open':if(d&&d.sess)openMove(d.sess.key,d.sess.date,d.sess.date,null);break;
    case 'mv-apply':await applyMove();break;
    case 'x-extra':{
      if(!d||!d.id||S.busy)break;const c=byId(S.data.cours,d.id);if(!c)break;
      const doc=courseDoc(c), x=doc.extras.find(e=>e.id===b.dataset.id);if(!x)break;
      doc.extras=doc.extras.filter(e=>e.id!==x.id);if(x.de)doc.annulees=doc.annulees.filter(t=>t!==x.de);
      S.busy=true;renderDrawer();await write(()=>putCours(c.id,doc),'Cours remis à son horaire habituel');S.busy=false;render();break;}
    case 'exam':openExam(b.dataset.id);break;
    case 'sess-at':{const s=findSess(b.dataset.date,b.dataset.key);if(!s)break;const base={key:s.key,coursId:s.c.id,slotId:s.sl.id,date:s.date};
      if(S.role==='admin')openCourse(s.c.id,{key:s.key,date:s.date,slotId:s.sl.id});else if(S.role==='teacher'&&!s.cancelled)openDrawer(Object.assign({kind:'att',dirty:false,draft:{statuts:{},note:''}},base));else openDrawer(Object.assign({kind:'info'},base));break;}
    case 'x-res-all':{if(!d||d.kind!=='exam')break;const r=d.draft.resultats||(d.draft.resultats={});for(const el of studentsOf(d.draft.groupe))if(!r[el.id])r[el.id]='reussi';renderDrawer();break;}
    case 'x-open':openSessExam(b.dataset.key);break;
    case 'x-rep':await setRetake(b.dataset.key,b.dataset.el,true,'',null);break;
    case 'rp-set':await setRetake(b.dataset.key,b.dataset.el,b.dataset.v==='ok',b.dataset.date||'',null);break;
    case 'rp-undo':await setRetake(b.dataset.key,b.dataset.el,null);break;
    case 'rd-mod-del':await repModules(b.dataset.date,b.dataset.m,false);break;
    case 'x-res':{if(!d||d.kind!=='exam')break;const r=d.draft.resultats||(d.draft.resultats={}),id=b.dataset.el,v=b.dataset.v;if(r[id]===v)delete r[id];else r[id]=v;if(d.draft.pct)delete d.draft.pct[id];renderDrawer();break;}
    case 'new-exam':if(acad())openAddCourse(S.pg.g?{groupe:S.pg.g}:null);else openExam(null,b.dataset.cours?{cours:b.dataset.cours,date:b.dataset.date||''}:null);break;
    case 'student':openFiche('eleves',b.dataset.id);break;
    case 'st-edit':openStudent(b.dataset.id);break;
    case 'new-student':openStudent(null);break;
    case 'staff':openFiche('personnel',b.dataset.id);break;
    case 'sf-edit':openStaff(b.dataset.id);break;
    case 'fi-back':closeFiche();break;
    case 'fi-tab':S.pg.tab=b.dataset.v;render();break;
    case 'fi-og':{const og=Object.assign({},S.pg.og||{});og[b.dataset.g]=!og[b.dataset.g];S.pg.og=og;render();break;}
    case 'fi-step':ficheStep(+b.dataset.d);break;
    case 'fi-acct':openAccount(null,{draft:{uid:'',role:b.dataset.role,ref:b.dataset.id}});break;
    case 'see-teacher':S.filtre='e:'+b.dataset.id;S.fmode='e';savePrefs();goPage('calendar');break;
    case 'new-staff':openStaff(null);break;
    case 'pg-set':pg[b.dataset.k]=b.dataset.v;render();break;
    case 'close':closeDrawer();break;
    case 'clear-ex':S.confirmClear=true;render();window.scrollTo({top:0,behavior:'smooth'});break;
    case 'clear-ex-no':S.confirmClear=false;render();break;
    case 'clear-ex-yes':if(!S.busy)await clearExamples();break;
    /* présences d’un cours */
    case 'att-set':{if(!d)break;const id=b.dataset.el,v=b.dataset.v;if(d.draft.statuts[id]===v)delete d.draft.statuts[id];else d.draft.statuts[id]=v;d.dirty=true;d.confirmClose=false;renderDrawer();break;}
    case 'att-all':{if(!d)break;const s=findSess(d.date,d.key);if(!s)break;for(const el of studentsOf(s.c.groupe))if(!d.draft.statuts[el.id])d.draft.statuts[el.id]='P';d.dirty=true;renderDrawer();break;}
    case 'att-save':await saveAtt(false);break;
    case 'att-save-close':await saveAtt(true);break;
    case 'att-discard':closeDrawer(true);break;
    case 'att-keep':if(d){d.confirmClose=false;renderDrawer();}break;
    /* présences du personnel */
    case 'sp-day':case 'sp-week':{
      const dr=pg.sdraft;if(dr&&dr.dirty){toast('Enregistrez les présences de ce jour avant de changer de jour.','bad');break;}
      pg.sdate=a==='sp-day'?b.dataset.date:iso(addDays(monday(parse(pg.sdate||lastSchoolDay())),+b.dataset.n));pg.sdraft=null;render();break;}
    case 'sp-set':{const dr=staffDraft(),id=b.dataset.id,v=b.dataset.v;if(dr.statuts[id]===v)delete dr.statuts[id];else dr.statuts[id]=v;dr.dirty=true;render();break;}
    case 'sp-all':{const dr=staffDraft();for(const p of staff())if(p.statut!=='Inactif'&&!dr.statuts[p.id])dr.statuts[p.id]=p.statut==='En congé'?'C':'P';dr.dirty=true;render();break;}
    case 'sp-save':{if(S.busy)break;const dr=staffDraft(),ds=dr.date;S.busy=true;render();const ids=Object.entries(dr.statuts).filter(([,v])=>v==='A'||v==='C'||v==='F').map(([k])=>k);
      const ok=await write(async()=>{await col('presences-personnel').doc(ds).set({date:ds,statuts:Object.assign({},dr.statuts),maj:new Date().toISOString()});await col('profs-absents').doc(ds).set({date:ds,ids});},'Présences du personnel enregistrées');S.busy=false;if(ok){dr.dirty=false;pg.sdraft=null;}render();break;}
    /* cours */
    case 'c-add-slot':{if(!d)break;const last=d.draft.creneaux[d.draft.creneaux.length-1];d.draft.creneaux.push({type:last&&last.type||'theorie',custom:!!(last&&last.custom),id:slotId(),jour:last?String(Math.min(5,+last.jour+1)):'1',debut:last?last.debut:'08:15',fin:last?last.fin:'09:30',salle:''});d.warn=null;renderDrawer();break;}
    case 'c-del-slot':if(d&&d.draft.creneaux.length>1){d.draft.creneaux.splice(+b.dataset.i,1);d.warn=null;renderDrawer();}break;
    case 'c-del':case 'x-del':case 'st-del':case 'sf-del':if(d){d.confirmDel=true;renderDrawer();}break;
    case 'c-del-no':case 'x-del-no':case 'st-del-no':case 'sf-del-no':if(d){d.confirmDel=false;renderDrawer();}break;
    case 'c-del-yes':case 'x-del-yes':case 'st-del-yes':case 'sf-del-yes':{
      if(!d||S.busy)break;
      const job=a==='c-del-yes'?()=>col('cours').doc(d.id).delete():a==='x-del-yes'?()=>col('examens').doc(d.id).delete():a==='st-del-yes'?async()=>{await col('eleves').doc(d.id).delete();await dropAccounts(d.id);}:async()=>{await col('enseignants').doc(d.id).delete();await col('dossiers-personnel').doc(d.id).delete();await dropAccounts(d.id);};
      S.busy=true;renderDrawer();const ok=await write(job,'Supprimé');S.busy=false;if(ok&&S.dr===d)S.dr=null;render();break;}
    case 'goto-att':if(d&&d.sess){const s=findSess(d.sess.date,d.sess.key);if(s)openDrawer({kind:'att',key:s.key,coursId:s.c.id,slotId:s.sl.id,date:s.date,dirty:false,draft:{statuts:{},note:''}});}break;
    case 's-cancel':{
      if(!d||!d.sess||S.busy)break;const c=byId(S.data.cours,d.id);if(!c)break;
      const tag=`${d.sess.date}@${d.sess.slotId}`, arr=[...(c.annulees||[])], i=arr.indexOf(tag);
      if(i>=0)arr.splice(i,1);else arr.push(tag);
      const mark={[tag]:i>=0?null:{le:new Date().toISOString(),par:whoAmI()}};
      const se0=findSess(d.sess.date,d.sess.key);
      S.busy=true;renderDrawer();const okC=await write(()=>col('cours').doc(c.id).update({annulees:arr,annule:mark}),i>=0?W('Séance rétablie','Cours rétabli'):W('Séance annulée','Cours annulé pour cette date'));S.busy=false;
      if(okC&&se0) logEv('horaire',i>=0?W('a rétabli la séance','a rétabli le cours'):W('a annulé la séance','a annulé le cours'),sObj(se0),se0);
      render();break;}
    /* classes */
    case 'class':openFiche('classes',b.dataset.id);break;
    case 'module':{const mg=b.dataset.g;openFiche('modules',String(b.dataset.id));if(mg){S.pg.mg=mg;S.pg.tab='seances';render();}break;}
    case 'sx-del-yes':{if(!d||!d.sess||S.busy)break;const c0=byId(S.data.cours,d.id);if(!c0)break;const doc=courseDoc(c0), xid=d.sess.slotId;doc.extras=doc.extras.filter(x=>x.id!==xid&&!(x.de&&String(x.de).endsWith('@'+xid)));doc.annulees=doc.annulees.filter(t=>!String(t).endsWith('@'+xid));S.dr=null;const se0=findSess(d.sess.date,d.sess.key);if(await affWrite(()=>putCours(c0.id,doc),acad()?'Séance supprimée':'Cours supprimé')&&se0)logEv('horaire',W('a supprimé la séance','a supprimé le cours'),sObj(se0));break;}
    /* affectations */
    case 'af-apply':{const se=findSess(b.dataset.date,b.dataset.key);if(!se||!S.teacher)break;if(await affSetStatus(se,S.teacher,'attente','Candidature envoyée'))logEv('aff','a postulé à la séance',sObj(se),se);break;}
    case 'af-withdraw':{const id=candId(b.dataset.key,S.teacher), c0=byId(S.data.candidatures,id);if(!c0||c0.statut!=='attente')break;const se=findSess(c0.date,c0.seance);if(await affWrite(()=>col('candidatures').doc(id).delete(),'Candidature retirée')&&se)logEv('aff','a retiré sa candidature à la séance',sObj(se),se);break;}
    case 'af-remp-cancel':{const id=candId(b.dataset.key,S.teacher), r0=byId(S.data.remplacements,id);if(!r0)break;const se=findSess(r0.date,r0.seance);if(await affWrite(()=>col('remplacements').doc(id).delete(),'Demande de remplacement annulée')&&se)logEv('aff','a annulé sa demande de remplacement pour la séance',sObj(se),se);break;}
    case 'af-remp-no':{const id=b.dataset.id, r0=byId(S.data.remplacements,id);if(!r0)break;const se=findSess(r0.date,r0.seance);if(await affWrite(()=>col('remplacements').doc(id).delete(),'Demande de remplacement refusée')&&se)logEv('aff',`a refusé la demande de remplacement de ${tName(r0.enseignant)} pour la séance`,sObj(se),se);break;}
    case 'af-approve':case 'af-refuse':{const c0=byId(S.data.candidatures,b.dataset.id);if(!c0)break;const ok=a==='af-approve', se=findSess(c0.date,c0.seance);if(await affWrite(()=>col('candidatures').doc(c0.id).update({statut:ok?'approuve':'refuse',maj:new Date().toISOString()}),ok?`${tName(c0.enseignant)} est approuvé pour ${W('cette séance','ce cours')}`:'Candidature refusée')&&se)logEv('aff',`${ok?'a approuvé':'a refusé'} la candidature de ${tName(c0.enseignant)} pour la séance`,sObj(se),se);break;}
    case 'af-retire':{const se=findSess(b.dataset.date,b.dataset.key);if(!se)break;if(await affSetStatus(se,b.dataset.t,'retire',`${tName(b.dataset.t)} est retiré de ${W('cette séance','ce cours')}`))logEv('aff',`a retiré ${tName(b.dataset.t)} de la séance`,sObj(se),se);break;}
    case 'af-req':{const se=findSess(b.dataset.date,b.dataset.key);if(!se||S.busy)break;await affReq(se,+b.dataset.d||0);break;}
    /* disponibilités */
    case 'dp-month':{const ym=/^\d{4}-\d{2}$/.test(pg.dm||'')?pg.dm:todayISO().slice(0,7), [Y,M]=ym.split('-').map(Number), x=new Date(Y,M-1+(+b.dataset.n||0),1);pg.dm=x.getFullYear()+'-'+pad(x.getMonth()+1);render();const f=$('#'+b.id);if(f)f.focus({preventScroll:true});break;}
    case 'dp-day':{const dr=pg.dd;if(!dr||dispoLocked(b.dataset.date))break;const cur=dr.jours[b.dataset.date]||'', nx={'':'J',J:'AM',AM:'PM',PM:''}[cur];if(nx)dr.jours[b.dataset.date]=nx;else delete dr.jours[b.dataset.date];dr.dirty=true;render();const f=$('#'+b.id);if(f)f.focus({preventScroll:true});break;}
    case 'dp-col':case 'dp-all':case 'dp-none':{const dr=pg.dd;if(!dr)break;const ym=/^\d{4}-\d{2}$/.test(pg.dm||'')?pg.dm:todayISO().slice(0,7);
      const ds=dispoMonthDays(ym).filter(x=>!dispoLocked(x.ds)&&(a!=='dp-col'||x.j===+b.dataset.j)).map(x=>x.ds), on=a==='dp-all'||(a==='dp-col'&&!ds.every(x=>dr.jours[x]==='J'));
      for(const x of ds){if(on)dr.jours[x]='J';else delete dr.jours[x];}
      if(ds.length){dr.dirty=true;render();}break;}
    case 'dp-save':{const dr=pg.dd;if(!dr||!dr.dirty||S.busy)break;const lim=iso(addDays(new Date(),-45)), jours={};for(const [k,v] of Object.entries(dr.jours))if(k>=lim&&DISPO[v])jours[k]=v;
      S.busy=true;render();const ok=await write(()=>col('disponibilites').doc(dr.tid).set({jours,maj:new Date().toISOString()}),'Disponibilités enregistrées');S.busy=false;if(ok)dr.dirty=false;render();break;}
    /* modules */
    case 'md-del':{if(S.busy)break;const code=b.dataset.code, c0=configDoc(), k0=c0.competences.find(x=>String(x.code)===String(code));if(!k0)break;
      /* Un module qui a des cours ne se supprime pas */
      if(mCours(k0).length||mExams(k0).length||modCourses(code).some(c=>datedOf(c).length)){pg.ask='';toast(`Le module M${code} a des cours : il ne peut pas être supprimé.`,'bad');render();break;}
      c0.competences=c0.competences.filter(x=>String(x.code)!==String(code));pg.fiche=null;pg.ask='';if(await saveConfig(c0,`Module M${code} supprimé`))logEv('module',`a supprimé le module M${code}`,k0.nom||'');break;}
    case 'mc-req':{const id=b.dataset.id;let n=0;
      await editModule(b.dataset.code,m=>{const c=m.cours.find(x=>x.id===id);if(!c)return false;c.requis=n=Math.max(0,Math.min(9,cReq(c)+(+b.dataset.d||0)));},()=>pl(n,'enseignant requis','enseignants requis'));break;}
    case 'mc-del':case 'me-del':{const id=b.dataset.id, code=b.dataset.code, ex=a==='me-del';
      if(modUse(code).n(id)){toast('Déjà à l’horaire d’une classe : retirez d’abord ses séances.','bad');break;}
      pg.askc='';pg.aske='';
      let nm='';
      if(await editModule(code,m=>{const o=(ex?m.examens:m.cours).find(x=>x.id===id);nm=o?(ex?o.nom:o.num):'';if(ex)m.examens=m.examens.filter(x=>x.id!==id);else m.cours=m.cours.filter(x=>x.id!==id);},ex?'Examen retiré du module':'Cours retiré du module')) logEv('module',ex?`a retiré l’examen « ${nm} » du module M${code}`:`a retiré le cours ${nm} du module M${code}`,'');
      break;}
    case 'md-del-x':{if(S.busy)break;const c0=byId(S.data.cours,b.dataset.c);if(!c0)break;const doc=courseDoc(c0), xid=b.dataset.x;doc.extras=doc.extras.filter(x=>x.id!==xid&&!(x.de&&String(x.de).endsWith('@'+xid)));doc.annulees=doc.annulees.filter(t=>!String(t).endsWith('@'+xid));pg.askx='';const x0=(c0.extras||[]).find(x=>x.id===xid), se0=x0?findSess(x0.date,`${c0.id}_${xid}_${x0.date}`):null;if(await affWrite(()=>putCours(c0.id,doc),'Séance supprimée')&&se0)logEv('horaire','a supprimé la séance',sObj(se0));break;}
    case 'nf-open':{const fresh=nfNew().map(n=>n.id);openDrawer({kind:'notifs',fresh});if(fresh.length){S.nfSeen=[...new Set([...(S.nfSeen||[]),...fresh])].slice(-400);savePrefs();renderHeading();}break;}
    case 'nf-go':{const n=notifs()[+b.dataset.i];if(!n)break;const g=n.go;S.dr=null;
      if(g.k==='aff'){goPage('affectations');S.pg.at=g.tab;render();}
      else if(g.k==='mes'){goPage('mescours');S.pg.mt=g.tab;render();}
      else{const mon=monday(parse(g.date));if(iso(mon)!==iso(S.week)){S.week=mon;S.day=defaultDay();subWeek();}S.page='calendar';S.pg={};render();openSession(g.key,g.date);}
      break;}
    case 'pr-open':openPrint(b.dataset.g?{g:b.dataset.g,t:''}:null);break;
    case 'pr-go':{if(!d||d.kind!=='print')break;const fe=b.dataset.doc==='feuille', html=fe?attSheet(d):weekSheet(d);
      if(!html){toast(fe?'Aucune séance avec des présences à prendre cette semaine-là.':'Rien à imprimer pour cette semaine.','bad');break;}
      await printDoc((fe?'Feuille de présences':'Horaire')+' · semaine du '+d.week,html,true,(fe?'feuille-presences-':'horaire-')+d.week);break;}
    case 'pr-releve':{const el=byId(S.data.eleves,b.dataset.id);if(!el)break;await printDoc('Relevé de résultats · '+el.nom,transcriptHTML(el),false,'releve-'+prSlug(el.nom));break;}
    case 'hr-export':{const r=hoursCSV(b.dataset.m);if(r)await saveFile(r.name,r.text);break;}
    case 'sf-comp-all':document.querySelectorAll('[data-form=sf-comp] input[name=comp]').forEach(i=>{i.checked=!!b.dataset.v;});break;
    case 'stop':break;
    case 'rs-edit':if(d){d.ressEd=!d.ressEd;renderDrawer();}break;
    case 'rs-reset':{const se=findSess(b.dataset.date,b.dataset.key);if(se)await saveSessRess(se,null);break;}
    case 'p-del-res':{if(S.busy)break;const rid=b.dataset.id, c0=configDoc();
      c0.ressources=c0.ressources.filter(r=>r.id!==rid);
      for(const k0 of c0.competences) if(k0.cours) k0.cours=k0.cours.map(x=>(x.ress||[]).includes(rid)?Object.assign({},x,{ress:x.ress.filter(y=>y!==rid)}):x);
      await saveConfig(c0,'Retiré de la liste');break;}
    case 'm-file':{const fi=document.getElementById('m-file-'+b.dataset.g);if(fi)fi.click();break;}
    case 'st-import':{const g0=pg.g||(groups().length===1?groups()[0].id:'');
      if(!g0){toast('Choisissez d’abord la classe, dans la liste « Toutes les classes ».','bad');const s0=$('#s-g');if(s0)s0.focus();break;}
      openFiche('classes',g0);S.pg.tab='eleves';S.pg.enrol=g0;render();{const ta=document.getElementById('m-bulk-'+g0);if(ta)ta.focus();}break;}
    case 'm-adding':pg.adding=!pg.adding;render();if(pg.adding){const x=$('#m-gname');if(x)x.focus();}break;
    case 'm-ask':pg.ask=b.dataset.id;render();break;
    case 'm-ask-no':pg.ask=null;render();break;
    case 'm-del-el':{if(S.busy)break;S.busy=true;render();await write(()=>col('eleves').doc(b.dataset.id).delete(),'Élève retiré');S.busy=false;render();break;}
    case 'm-del-g':{const id=b.dataset.id;pg.justAdded=null;const fns=studentsOf(id).map(e=>()=>col('eleves').doc(e.id).delete());fns.push(()=>col('groupes').doc(id).delete());pg.ask=null;await runAll(fns,'Classe supprimée');break;}
    /* calendrier scolaire */
    case 'p-del-conge':case 'p-del-etape':{if(S.busy)break;const c=configDoc(),k=a==='p-del-conge'?'conges':'etapes';c[k].splice(+b.dataset.i,1);await saveConfig(c,'Retiré du calendrier');break;}
  }
});
document.addEventListener('submit',async e=>{
  const f=e.target;e.preventDefault();
  const k=f.dataset.form;if(S.busy)return;
  const d=S.dr;
  if(k==='course'){if(d&&d.kind==='course')await saveCourse(!!d.warn);return;}
  if(k==='addc'){if(!d||d.kind!=='addc')return;const msg=await addCourseDay(d.draft);if(msg){d.err=msg;if(S.dr===d)renderDrawer();}else if(S.dr===d){S.dr=null;render();}return;}
  if(k==='af-remp'){
    const se=findSess(f.dataset.date,f.dataset.key);if(!se||!S.teacher)return;
    const motif=String(($('#rp-motif')||{}).value||'').trim().slice(0,140), id=candId(se.key,S.teacher);
    S.pg.rp='';
    if(await affWrite(()=>col('remplacements').doc(id).set({seance:se.key,cours:se.c.id,groupe:se.grp||'',date:se.date,enseignant:S.teacher,motif,maj:new Date().toISOString()}),'Demande de remplacement envoyée')) logEv('aff','a demandé un remplacement pour la séance',sObj(se)+(motif?' — '+motif:''),se);
    return;
  }
  if(k==='sf-comp'){
    const list=[...f.querySelectorAll('input[name=comp]:checked')].map(i=>+i.value).filter(n=>!isNaN(n)).sort((x,y)=>x-y);
    await affWrite(()=>col('enseignants').doc(f.dataset.id).update({competences:list}),'Compétences enregistrées');return;
  }
  if(k==='md-add'||k==='md-save'){
    const isNew=k==='md-add', code=isNew?Math.round(+$('#md-code').value):+f.dataset.code, nom=String($('#md-nom').value||'').trim();
    if(!code||code<1){toast('Indiquez le numéro du module.','bad');return;}
    if(!nom){toast('Indiquez le nom du module.','bad');return;}
    const ok=await saveModule(code,{nom,heuresT:numOrNull($('#md-ht').value),heuresP:numOrNull($('#md-hp').value),charge:$('#md-charge').value},isNew);
    if(ok) logEv('module',isNew?`a créé le module M${code}`:`a modifié le module M${code}`,nom+($('#md-charge')&&$('#md-charge').value?' · chargé de cours : '+tName($('#md-charge').value):''));
    if(ok&&isNew){S.pg.adding='';S.pg.justAdded=String(code);openFiche('modules',String(code));}
    return;
  }
  if(k==='md-add-x'){
    const pkey=f.dataset.code+'|'+f.dataset.g, items=S.pg.pick&&S.pg.pick.key===pkey?S.pg.pick.items:[];
    const msg=await addCourseDay({groupe:f.dataset.g,module:f.dataset.code,date:$('#mx-date').value,per:$('#mx-per').value,items});
    if(msg){if(msg!=='L’enregistrement a échoué.')toast(msg,'bad');}else{S.pg.pick=null;render();}
    return;
  }
  if(k==='mc-add'){
    const code=f.dataset.code, num=String($('#mc-num').value||'').trim(), type=$('#mc-type').value, rq=numOrNull($('#mc-req').value);
    if(!num){toast('Indiquez le numéro du cours.','bad');return;}
    const ok=await editModule(code,m=>{
      if(m.cours.some(c=>String(c.num).trim().toLowerCase()===num.toLowerCase())){toast(`Le cours ${num} existe déjà dans le module M${code}.`,'bad');return false;}
      m.cours.push({id:genId('k'),num,type:COURS_TYPES.includes(type)?type:'theorie',requis:rq==null?1:Math.min(9,rq)});},'Cours ajouté au module');
    if(ok){logEv('module',`a ajouté le cours ${num} au module M${code}`,'');const i=$('#mc-num');if(i){i.value='';i.focus();}}
    return;
  }
  if(k==='me-add'){
    const code=f.dataset.code, nom=String($('#me-nom').value||'').trim(), type=$('#me-type').value;
    if(!nom){toast('Indiquez le nom de l’examen.','bad');return;}
    const ok=await editModule(code,m=>{
      if(m.examens.some(x=>String(x.nom).trim().toLowerCase()===nom.toLowerCase())){toast(`L’examen « ${nom} » existe déjà dans le module M${code}.`,'bad');return false;}
      m.examens.push({id:genId('e'),type:EXAM_T[type]?type:'t',nom});},'Examen ajouté au module');
    if(ok){logEv('module',`a ajouté l’examen « ${nom} » au module M${code}`,'');const i=$('#me-nom');if(i){i.value='';i.focus();}}
    return;
  }
  if(k==='exam'){if(d&&d.kind==='exam')await saveExam(!!d.warn);return;}
  if(k==='student'){if(d&&d.kind==='student')await saveStudent();return;}
  if(k==='acct'){if(document.activeElement&&document.activeElement.id==='ac-q')return;if(d&&d.kind==='acct')await saveAccount();return;}
  if(k==='staff'){if(d&&d.kind==='staff')await saveStaff();return;}
  if(k==='m-add-group'){
    const i=$('#m-gname'),nom=i.value.trim();if(!nom){i.focus();return;}
    if(S.data.groupes.some(g=>collator.compare(g.nom,nom)===0)){toast('Cette classe existe déjà.','bad');return;}
    const id=genId('g');i.value='';
    S.busy=true;render();const ok=await write(()=>col('groupes').doc(id).set({nom}),'Classe ajoutée');S.busy=false;
    if(ok){S.pg.adding=false;S.pg.fiche=id;S.pg.justAdded=id;S.pg.tab='eleves';}else i.value=nom;render();return;
  }
  if(k==='m-save-group'){
    const gid=f.dataset.g, nom=($('#m-gnom')||{}).value||'', desc=($('#m-gdesc')||{}).value||'';
    if(!nom.trim()){toast('Indiquez le nom de la classe.','bad');return;}
    if(S.data.groupes.some(g=>g.id!==gid&&collator.compare(g.nom,nom.trim())===0)){toast('Une autre classe porte déjà ce nom.','bad');return;}
    S.busy=true;render();await write(()=>col('groupes').doc(gid).update({nom:nom.trim(),description:desc.trim()}),'Classe enregistrée');S.busy=false;render();return;
  }
  if(k==='m-add-els'){
    const gid=f.dataset.g, t=document.getElementById('m-bulk-'+gid);if(!t)return;
    const raw=t.value, have=new Set(studentsOf(gid).map(e=>String(e.nom||'').trim().toLowerCase())), list=[];let dup=0;
    for(const o of parseStudents(raw)){const key=o.nom.trim().toLowerCase();if(have.has(key)){dup++;continue;}have.add(key);list.push(o);}
    if(!list.length){if(dup)toast(dup>1?`Ces ${dup} élèves sont déjà dans la classe.`:'Cet élève est déjà dans la classe.','bad');t.focus();return;}
    t.value='';
    const mkEl=o=>{const e={nom:o.nom.trim(),groupe:gid};if(o.numero!=null)e.numero=o.numero;if(o.courriel)e.courriel=o.courriel;if(o.telephone)e.telephone=o.telephone;return e;};
    const ok=await runAll(list.slice(0,200).map(o=>()=>col('eleves').doc(genId('el')).set(mkEl(o))),(list.length>1?`${list.length} élèves inscrits`:'Élève inscrit')+(dup?` · ${dup} déjà dans la classe`:''));
    if(!ok){const t2=document.getElementById('m-bulk-'+gid);if(t2)t2.value=raw;}
    else if(S.pg.fiche===gid){S.pg.enrol=null;render();}
    return;
  }
  if(k==='rd-new'){
    const date=$('#rd-date').value, per=$('#rd-per').value, gs=[...f.querySelectorAll('input[name=rdg]:checked')].map(i=>i.value);
    if(!date){toast('Indiquez la date de la journée de reprise.','bad');return;}
    if(!gs.length){toast('Cochez au moins une classe.','bad');return;}
    let n=0, err='';
    for(const gid of gs){const m=await addCourseDay({groupe:gid,module:'__act',titre:'Reprise',date,per,type:'reprise',quiet:true});if(m){if(!err)err=m;}else n++;}
    if(n){S.pg.rnew='';toast(`Journée de reprise créée pour ${pl(n,'classe','classes')}${err?' · '+err:''}`);render();}
    else toast(err||'La journée n’a pas pu être créée.','bad');
    return;
  }
  if(k==='p-add-res'){
    const ni=$('#p-rnom'), nom=String(ni.value||'').replace(/\s+/g,' ').trim(), type=$('#p-rtype').value==='local'?'local':'equip';
    if(!nom){ni.focus();return;}
    const c0=configDoc();
    if(c0.ressources.some(r=>String(r.nom).toLowerCase()===nom.toLowerCase())){toast(`« ${nom} » est déjà dans la liste.`,'bad');return;}
    c0.ressources.push({id:genId('r'),nom,type});
    if(await saveConfig(c0,'Ajouté à la liste')){const n2=$('#p-rnom');if(n2){n2.value='';n2.focus();}}
    return;
  }
  if(k==='cp-go'){
    const src=S.pg.cps||'', start=S.pg.cpd||'';
    if(!src||!start){toast('Choisissez la classe à copier et la première journée.','bad');return;}
    if(await copySchedule(src,f.dataset.g,start)){S.pg.cpo='';S.pg.cps='';S.pg.cpd='';render();}
    return;
  }
  if(k==='p-save'){
    const c=configDoc();c.nom=$('#p-nom').value.trim();c.annee=$('#p-annee').value.trim();c.debut=$('#p-debut').value;c.fin=$('#p-fin').value;{const sv=Math.round(+($('#p-seuil')||{}).value);c.seuil=sv>=1&&sv<=100?sv:60;}
    if(c.debut&&c.fin&&c.fin<c.debut){toast('Le dernier jour précède le premier jour de classe.','bad');return;}
    await saveConfig(c,'Paramètres enregistrés');return;
  }
  if(k==='p-add-conge'||k==='p-add-etape'){
    const pre=k==='p-add-conge'?'c':'e', n=$('#p-'+pre+'nom'),a=$('#p-'+pre+'du'),b=$('#p-'+pre+'au');
    const nom=n.value.trim()||(pre==='c'?'Congé':'Étape'),du=a.value,au=b.value||(pre==='c'?a.value:'');
    if(!du){a.focus();toast('Indiquez la date de début.','bad');return;}
    if(pre==='e'&&!au){b.focus();toast('Indiquez la date de fin de l’étape.','bad');return;}
    if(au<du){toast('La date de fin précède la date de début.','bad');return;}
    const c=configDoc();c[pre==='c'?'conges':'etapes'].push({nom,du,au});
    n.value='';a.value='';b.value='';
    const ok=await saveConfig(c,pre==='c'?'Congé ajouté':'Étape ajoutée');
    if(!ok){const n2=$('#p-'+pre+'nom'),a2=$('#p-'+pre+'du'),b2=$('#p-'+pre+'au');if(n2){n2.value=nom;a2.value=du;b2.value=au;}}
  }
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='ac-q'&&S.dr&&S.dr.kind==='acct'){
    const d=S.dr, q=t.value.trim();d.q=t.value;
    if(!q||!USER){d.hits=[];renderDrawer();return;}
    USER.search(q).then(h=>{if(S.dr===d&&d.q.trim()===q){d.hits=h||[];for(const p of d.hits)PROF[p.id]=p;renderDrawer();}}).catch(()=>{});
    return;
  }
  if(t.id==='s-q'){S.pg.q=t.value;render();return;}
  if(t.id==='jr-q'){S.pg.jq=t.value;S.pg.jl='';render();return;}
  /* note en % d’un élève : elle inscrit le résultat selon le seuil de réussite */
  if(t.dataset&&t.dataset.xn&&S.dr&&S.dr.kind==='exam'){
    const dx=S.dr, el=t.dataset.xn, r=dx.draft.resultats||(dx.draft.resultats={}), p=dx.draft.pct||(dx.draft.pct={}), v=t.value.trim();
    if(v===''){if(t.validity&&t.validity.badInput)return;delete p[el];}
    else if(!isNaN(+v)){const n=Math.max(0,Math.min(100,+v));p[el]=n;r[el]=n>=seuil()?'reussi':'echec';}
    renderDrawer();return;
  }
  const d=S.dr, f=t.dataset&&t.dataset.f;
  if(!d||!f)return;
  if(d.kind==='course'){
    if(t.dataset.i!=null){const s=d.draft.creneaux[+t.dataset.i];if(s)s[f]=t.value;}else d.draft[f]=t.value;
    if(f==='titre'){const k=comps().find(x=>x.nom.toLowerCase()===t.value.trim().toLowerCase());if(k&&!d.draft.code){d.draft.code='M'+k.code;d.draft.couleur=(+k.code)%8;if(k.heures&&!d.draft.heures)d.draft.heures=String(k.heures);renderDrawer();}}
    if(d.err||d.warn){d.err='';d.warn=null;renderDrawer();}
  }else if(d.kind==='addc'){d.draft[f]=t.value;if(f==='module')d.draft.items=[];if(f==='module'||f==='groupe'||f==='date'||d.err){d.err='';renderDrawer();const again=document.getElementById(t.id);if(again&&again!==t&&t.tagName==='INPUT'&&t.type!=='date'){again.focus();}}}
  else if(d.kind==='att'&&f==='note'){d.draft.note=t.value;if(!d.dirty){d.dirty=true;renderDrawer();}}
  else if(d.kind==='exam'){
    d.draft[f]=t.value;
    if(f==='cours'){fillExamFromCourse(d.draft,true);d.err='';d.warn=null;renderDrawer();}
    else if(f==='date'){if(d.draft.cours)fillExamFromCourse(d.draft,false);d.err='';d.warn=null;renderDrawer();}
    else if(d.err||d.warn){d.err='';d.warn=null;renderDrawer();}
  }else if(d.kind==='student'||d.kind==='staff'){d.draft[f]=t.value;if(d.err){d.err='';renderDrawer();}}
});
document.addEventListener('change',async e=>{
  const t=e.target;
  /* reprises : une note en % inscrit l’issue selon le seuil ; ajout d’un module à une journée de reprise */
  if(t.dataset&&t.dataset.rpn){const v=t.value.trim();if(v===''||isNaN(+v))return;const n=Math.max(0,Math.min(100,+v));await setRetake(t.dataset.key,t.dataset.el,n>=seuil(),t.dataset.date||'',n);return;}
  if(t.dataset&&t.dataset.rd==='add'){if(t.value)await repModules(t.dataset.date,t.value,true);return;}
  /* locaux et équipements : d’une séance (pour elle seule), ou d’un cours du module (pour toutes les classes) */
  if(t.dataset&&t.dataset.rs){
    const se=findSess(t.dataset.date,t.dataset.key);if(!se)return;
    const ids=new Set(ressOf(se));if(t.checked)ids.add(t.value);else ids.delete(t.value);
    await saveSessRess(se,[...ids]);return;
  }
  if(t.dataset&&t.dataset.mcr){
    const cid=t.dataset.id, rid=t.value, on=t.checked;
    await editModule(t.dataset.code,m=>{const c=m.cours.find(x=>x.id===cid);if(!c)return false;const set=new Set(c.ress||[]);if(on)set.add(rid);else set.delete(rid);c.ress=[...set];},'Locaux et équipements du cours enregistrés');return;
  }
  /* liste d’élèves lue d’un fichier : elle arrive dans la zone de texte, à vérifier avant d’inscrire */
  if(t.dataset&&t.dataset.imp&&t.files){
    const f0=t.files[0], ta=document.getElementById('m-bulk-'+t.dataset.imp);
    if(!f0||!ta) return;
    if(/\.(xlsx?|xlsm|ods|numbers)$/i.test(f0.name)){t.value='';toast('Un classeur Excel ne se lit pas directement : enregistrez la feuille en CSV, ou copiez ses cellules et collez-les ici.','bad');return;}
    if(f0.size>1e6){t.value='';toast('Ce fichier est trop gros pour une liste d’élèves.','bad');return;}
    let txt='';try{txt=await readTextFile(f0);}catch(e){toast('Ce fichier n’a pas pu être lu.','bad');return;}
    t.value='';
    const n=parseStudents(txt).length;
    if(!n){toast('Aucun élève reconnu dans ce fichier.','bad');return;}
    ta.value=txt.replace(/^\uFEFF/,'').trim();ta.focus();
    toast(`${pl(n,'élève reconnu','élèves reconnus')} dans ${f0.name}. Vérifiez la liste, puis Inscrire.`);return;
  }
  /* copie d’horaire : classe à copier et première journée */
  if(t.dataset&&t.dataset.cp){S.pg[t.dataset.cp==='src'?'cps':'cpd']=t.value;render();return;}
  /* fenêtre « Imprimer » : la semaine (ramenée au lundi) et pour qui */
  if(t.dataset&&t.dataset.pr&&S.dr&&S.dr.kind==='print'){
    const dp=S.dr;
    if(t.dataset.pr==='week'){if(t.value)dp.week=iso(monday(parse(t.value)));}
    else{dp.g=t.value.startsWith('g:')?t.value.slice(2):'';dp.t=t.value.startsWith('e:')?t.value.slice(2):'';}
    renderDrawer();return;
  }
  /* cours et examens cochés pour composer une séance (fenêtre « Ajouter une séance » ou fiche du module) */
  if(t.dataset&&t.dataset.pick){
    const v=t.dataset.pick, tog=a=>{const i=a.indexOf(v);if(t.checked&&i<0)a.push(v);else if(!t.checked&&i>=0)a.splice(i,1);};
    if(S.dr&&S.dr.kind==='addc'){tog(S.dr.draft.items||(S.dr.draft.items=[]));if(S.dr.err){S.dr.err='';renderDrawer();}return;}
    const key=t.dataset.key||'';if(!S.pg.pick||S.pg.pick.key!==key)S.pg.pick={key,items:[]};tog(S.pg.pick.items);return;
  }
  if(t.dataset&&t.dataset.gp){
    const gid=t.dataset.gp, v=t.value;if(S.busy)return;
    S.busy=true;render();
    await write(()=>col('groupes').doc(gid).update({principal:v}),v?`${tName(v)} est enseignant principal de ${gName(gid)}`:`${gName(gid)} n’a plus de enseignant principal`);
    S.busy=false;render();return;
  }
  if(t.id==='ac-ref'&&S.dr&&S.dr.kind==='acct'){S.dr.draft.ref=t.value;S.dr.err='';renderDrawer();return;}
  if(t.id==='pf-who'){if(S.role==='teacher')S.teacher=t.value;else{S.student=t.value;const e=byId(S.data.eleves,t.value);if(e)S.group=e.groupe;}savePrefs();render();return;}
  if(t.id==='f-filtre'){S.filtre=t.value;savePrefs();render();}
  else if(t.id==='sel-teacher'){S.teacher=t.value;savePrefs();render();}
  else if(t.id==='sel-group'){S.group=t.value;savePrefs();render();}
  else if(t.id==='s-g'||t.id==='x-g'){S.pg.g=t.value;render();}
  else if(t.dataset&&t.dataset.assign){const id=t.dataset.assign,v=t.value;S.busy=true;render();await write(()=>col('cours').doc(id).update({enseignant:v}),v?W('Responsable assigné','Enseignant assigné'):W('Activité sans responsable','Cours à assigner'));S.busy=false;render();}
  else if(t.name==='c-color'&&S.dr&&S.dr.kind==='course'){S.dr.draft.couleur=+t.value;}
  else if(t.dataset&&t.dataset.slotp!=null&&S.dr&&S.dr.kind==='course'){
    const sl=S.dr.draft.creneaux[+t.dataset.slotp];if(!sl)return;
    if(t.value==='autre')sl.custom=true;else{const p=PERIODES.find(x=>x.k===t.value);sl.custom=false;sl.debut=p.debut;sl.fin=p.fin;}
    S.dr.err='';S.dr.warn=null;renderDrawer();
  }
  else if(t.dataset&&t.dataset.af==='assign'){
    const se=findSess(t.dataset.date,t.dataset.key);if(!se||!t.value)return;
    const tv=t.value;
    if(await affSetStatus(se,tv,'approuve',`${tName(tv)} est attribué à ${W('cette séance','ce cours')}`,{par:'admin'})) logEv('aff',`a attribué ${tName(tv)} à la séance`,sObj(se),se);
  }
  else if(t.dataset&&t.dataset.mc==='type'){
    /* le type d’un cours du module : les séances de toutes les classes suivent */
    const id=t.dataset.id, code=t.dataset.code, v=t.value;
    if(!await editModule(code,m=>{const c=m.cours.find(x=>x.id===id);if(!c||c.type===v)return false;c.type=v;},'Type du cours modifié'))return;
    await syncSeances(code,x=>{if((x.cours||[])[0]!==id||(x.examens||[]).length)return false;const tg=withAct(x.tags,v);if(JSON.stringify(tg)===JSON.stringify(x.tags||[]))return false;x.tags=tg;return true;});
  }
  else if(t.dataset&&t.dataset.me==='type'){
    const id=t.dataset.id, code=t.dataset.code, v=t.value;if(!EXAM_T[v])return;
    if(!await editModule(code,m=>{const x=m.examens.find(y=>y.id===id);if(!x||x.type===v)return false;x.type=v;},'Type de l’examen modifié'))return;
    await syncSeances(code,x=>{if((x.examens||[])[0]!==id)return false;const tg=withAct(x.tags,v==='t'?'examen-t':'examen-p');if(JSON.stringify(tg)===JSON.stringify(x.tags||[]))return false;x.tags=tg;return true;});
  }
  else if(t.dataset&&t.dataset.mod==='type'){
    const c0=byId(S.data.cours,t.dataset.c);if(!c0||S.busy)return;
    const doc=courseDoc(c0), x=doc.extras.find(e=>e.id===t.dataset.x);if(!x)return;
    x.tags=withAct(x.tags,t.value);
    await affWrite(()=>putCours(c0.id,doc),'Type de la séance modifié');
  }
  else if(t.id==='x-per'&&S.dr&&S.dr.kind==='exam'){const dx=S.dr;if(t.value==='autre')dx.customT=true;else{const p=PERIODES.find(y=>y.k===t.value);dx.customT=false;dx.draft.debut=p.debut;dx.draft.fin=p.fin;}dx.err='';dx.warn=null;renderDrawer();}
  else if(t.id==='af-hz'){S.pg.hz=t.value;S.pg.lim='';render();}
  else if(t.id==='md-g'){S.pg.mg=t.value;S.pg.askx='';S.pg.pick=null;render();}
  else if(t.dataset&&t.dataset.sb&&S.dr&&S.dr.kind==='course'&&S.dr.sess&&!S.busy){
    const d=S.dr, se=findSess(d.sess.date,d.sess.key);if(!se)return;
    if(t.dataset.sb==='menage'){await setChoreDay(se.grp,se.date,t.checked);return;}
    if(!se.extra)return;
    if(t.dataset.sb==='per'&&t.value==='autre'){openMove(se.key,se.date,se.date,null);return;}
    const c=byId(S.data.cours,se.c.id);if(!c)return;
    const doc=courseDoc(c), x=doc.extras.find(e=>e.id===se.extra.id);if(!x)return;
    if(t.dataset.sb==='per'){const p=PERIODES.find(y=>y.k===t.value);x.debut=p.debut;x.fin=p.fin;}
    else x.tags=withAct(x.tags,t.value);
    S.busy=true;renderDrawer();await write(()=>putCours(c.id,doc),acad()?'Séance modifiée':'Cours modifié');S.busy=false;render();
  }
  else if(t.id==='c-nom-sel'&&S.dr&&S.dr.kind==='course'){
    const d=S.dr,f=d.draft;d.err='';d.warn=null;
    if(t.value==='__autre'){d.customName=true;if(comps().some(k=>k.nom===f.titre))f.titre='';renderDrawer();const i=$('#c-titre');if(i)i.focus();}
    else if(t.value===''){d.customName=false;f.titre='';renderDrawer();}
    else{const k=comps().find(x=>String(x.code)===t.value);if(k){d.customName=false;f.titre=k.nom;f.code='M'+k.code;f.couleur=(+k.code)%8;if(k.heures)f.heures=String(k.heures);}renderDrawer();}
  }
  else if(S.dr&&S.dr.kind==='move'&&(t.name==='mv-scope'||t.dataset.mv)){if(t.name==='mv-scope')S.dr.scope=t.value;else S.dr[t.dataset.mv]=t.value;S.dr.err='';renderDrawer();}
});
$('#scrim').addEventListener('click',()=>closeDrawer());
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.classList&&e.target.classList.contains('xm-row')&&e.target.dataset.act){e.preventDefault();e.target.click();return;}
  if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.classList&&e.target.classList.contains('st-row')){e.preventDefault();openFiche('eleves',e.target.dataset.id);return;}
  if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.classList&&e.target.classList.contains('cl-row')){e.preventDefault();openFiche('classes',e.target.dataset.id);return;}
  if(e.key==='Escape'&&DRAG){e.preventDefault();endDrag(false);return;}
  if(e.key==='Escape'&&S.dr){e.preventDefault();closeDrawer();return;}
  if(!S.dr&&S.pg&&S.pg.fiche&&(S.page==='eleves'||S.page==='personnel'||S.page==='classes'||S.page==='modules')&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!/^(INPUT|SELECT|TEXTAREA)$/.test((e.target&&e.target.tagName)||'')){
    if(e.key==='ArrowLeft'){e.preventDefault();ficheStep(-1);return;}
    if(e.key==='ArrowRight'){e.preventDefault();ficheStep(1);return;}
    if(e.key==='Escape'){e.preventDefault();closeFiche();return;}
  }
  if(S.dr||S.page!=='calendar'||e.altKey||e.ctrlKey||e.metaKey) return;
  if(/^(INPUT|SELECT|TEXTAREA)$/.test((e.target&&e.target.tagName)||'')) return;
  if(e.key==='ArrowLeft'&&!e.shiftKey){e.preventDefault();if(dayMode())stepDay(-1);else setWeek(addDays(S.week,-7));}
  else if(e.key==='ArrowRight'&&!e.shiftKey){e.preventDefault();if(dayMode())stepDay(1);else setWeek(addDays(S.week,7));}
  else if((e.key==='+'||e.key==='=')&&S.compact){S.compact=false;savePrefs();render();}
  else if((e.key==='-'||e.key==='_')&&!S.compact){S.compact=true;savePrefs();render();}
});

