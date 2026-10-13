/* ---------- Import : liste d’élèves, copie de l’horaire d’une classe ----------
   Liste d’élèves collée ou lue d’un fichier, une ligne par élève. Colonnes séparées par une tabulation (cellules copiées
   d’Excel), un point-virgule ou une virgule : numéro, nom (ou prénom et nom), courriel, téléphone.
   Une première ligne de titres est reconnue ; sans titres, on devine chaque case. */
function csvCells(line,sep){
  const out=[];let cur='', q=false;
  for(let i=0;i<line.length;i++){const ch=line[i];
    if(q){if(ch==='"'){if(line[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}
    else if(ch==='"'&&!cur) q=true;
    else if(ch===sep){out.push(cur);cur='';}
    else cur+=ch;}
  out.push(cur);
  return out.map(c=>c.replace(/\s+/g,' ').trim());
}
function parseStudents(text){
  const lines=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean).slice(0,400);
  if(!lines.length) return [];
  const count=ch=>lines.slice(0,10).reduce((n,l)=>n+l.split(ch).length-1,0), sep=count('\t')?'\t':count(';')?';':count(',')?',':null;
  let rows=lines.map(l=>sep?csvCells(l,sep):[l.replace(/\s+/g,' ').trim()]), map=null;
  const H={numero:/^(n[°ºo]\.?|no\.?|num[ée]ro|#|matricule)$/i,prenom:/^pr[ée]nom$/i,nom:/^(nom|nom de famille|[ée]l[èe]ve|nom complet)$/i,courriel:/^(courriel|e-?mail|adresse courriel)$/i,telephone:/^(t[ée]l[ée]phone|t[ée]l\.?|cellulaire)$/i};
  const head=rows[0].map(c=>Object.keys(H).find(k=>H[k].test(c))||'');
  if(head.includes('nom')||head.includes('prenom')){map=head;rows=rows.slice(1);}
  return rows.map(r=>{
    const o={nom:'',numero:null,courriel:'',telephone:''}, names=[];let pre='';
    r.forEach((c,i)=>{
      if(!c) return;
      const k=map?map[i]:/^\d{1,3}$/.test(c)&&o.numero==null?'numero':/@/.test(c)?'courriel':/^[\d\s().+-]{7,}$/.test(c)?'telephone':'nom';
      if(k==='numero'){const n=parseInt(c,10);if(n>0)o.numero=n;}
      else if(k==='prenom') pre=c;
      else if(k==='nom') names.push(c);
      else if(k==='courriel') o.courriel=c;
      else if(k==='telephone') o.telephone=c;
    });
    o.nom=(pre?pre+' ':'')+names.join(' ');
    return o;
  }).filter(o=>o.nom.trim());
}
/* Lit un fichier texte ; un CSV enregistré par Excel sous Windows n’est pas en UTF-8 : on le relit alors en Windows-1252 */
function readTextFile(file){
  return new Promise((res,rej)=>{
    const r=new FileReader();r.onerror=()=>rej(r.error);
    r.onload=()=>{const t=String(r.result||'');if(!t.includes(String.fromCharCode(0xFFFD))){res(t);return;}const r2=new FileReader();r2.onerror=()=>res(t);r2.onload=()=>res(String(r2.result||''));r2.readAsText(file,'windows-1252');};
    r.readAsText(file);
  });
}
/* Copie de l’horaire d’une classe vers une autre : la première journée de classe de la source tombe à la date choisie,
   et les journées suivantes se suivent dans le même ordre, en sautant les fins de semaine et les congés.
   Les séances annulées, les présences et les résultats ne sont pas copiés. */
function copyPlan(src,dst,start){
  const items=[], schoolDay=ds=>{const j=parse(ds).getDay();return j!==0&&j!==6&&!offDay(ds);};
  for(const c of S.data.cours.filter(c=>c.groupe===src)) for(const x of datedOf(c)) if(!(c.annulees||[]).includes(`${x.date}@${x.id}`)&&schoolDay(x.date)) items.push({c,x});
  if(!items.length||!start) return {n:0,items:[]};
  items.sort((a,b)=>a.x.date.localeCompare(b.x.date)||String(a.x.debut).localeCompare(String(b.x.debut)));
  const first=items[0].x.date, last=items[items.length-1].x.date, from=[], to=[];
  for(let d=parse(first),n=0;iso(d)<=last&&n<800;d=addDays(d,1),n++) if(schoolDay(iso(d))) from.push(iso(d));
  for(let d=parse(start),n=0;to.length<from.length&&n<800;d=addDays(d,1),n++) if(schoolDay(iso(d))) to.push(iso(d));
  const map=new Map(from.map((ds,i)=>[ds,to[i]||'']));
  let out=0, clash=0;const keep=[];
  for(const it of items){
    const nd=map.get(it.x.date);
    if(!nd){out++;continue;}
    const a=toMin(it.x.debut), b=toMin(it.x.fin);
    if(sessionsOn(nd).some(s=>s.grp===dst&&!s.cancelled&&s.start<b&&a<s.end)){clash++;continue;}
    keep.push(Object.assign({nd},it));
  }
  return {n:keep.length,items:keep,out,clash,first,last,from:keep.length?keep[0].nd:'',to:keep.length?keep[keep.length-1].nd:''};
}
async function copySchedule(src,dst,start){
  const P=copyPlan(src,dst,start);if(!P.n) return false;
  const bySrc=new Map();for(const it of P.items){if(!bySrc.has(it.c.id))bySrc.set(it.c.id,{c:it.c,xs:[]});bySrc.get(it.c.id).xs.push(it);}
  const jobs=[];
  for(const {c,xs} of bySrc.values()){
    const mk=modKey(c), t0=mk!=null?S.data.cours.find(o=>o.groupe===dst&&modKey(o)===mk):S.data.cours.find(o=>o.groupe===dst&&modKey(o)==null&&String(o.titre||'').trim().toLowerCase()===String(c.titre||'').trim().toLowerCase());
    const doc=t0?courseDoc(t0):{titre:c.titre,code:c.code||'',couleur:+c.couleur||0,groupe:dst,enseignant:mk!=null?'':principalOf(dst),salle:c.salle||'',du:'',au:'',heures:c.heures||null,creneaux:[],annulees:[],extras:[]};
    const used=new Set(doc.extras.map(x=>x.id));
    for(const {x,nd} of xs){
      let id='a'+nd.replace(/-/g,'')+(toMin(x.debut)<720?'am':'pm');while(used.has(id)) id+=Math.random().toString(36).slice(2,4);
      used.add(id);
      const o={id,date:nd,debut:x.debut,fin:x.fin,tags:(x.tags||[]).filter(t=>!CHORE_TAGS.has(t)),label:x.label||''};
      for(const k of ['minutes','cours','examens','requis','salle']) if(x[k]!=null&&x[k]!=='') o[k]=JSON.parse(JSON.stringify(x[k]));
      doc.extras.push(o);
    }
    const id=t0?t0.id:genId('c');
    jobs.push(()=>putCours(id,doc));
  }
  const ok=await runAll(jobs,`${pl(P.n,'séance copiée','séances copiées')} vers ${gName(dst)}`);
  if(ok) logEv('horaire',`a copié l’horaire de ${gName(src)} vers ${gName(dst)}`,`${pl(P.n,'séance','séances')}, à partir du ${longDate(parse(P.from))}`);
  return ok;
}

function copyPanel(g){
  const st=S.pg, others=groups().filter(x=>x.id!==g.id&&S.data.cours.some(c=>c.groupe===x.id&&datedOf(c).length)), src=others.some(x=>x.id===st.cps)?st.cps:'', P=src&&st.cpd?copyPlan(src,g.id,st.cpd):null;
  const d=ds=>longDate(parse(ds));
  const info=!others.length?'Aucune autre classe n’a d’horaire à copier.':!P?'Choisissez la classe à copier et la première journée de classe.'
    :!P.n?'Aucune séance ne peut être copiée à partir de cette date.'
    :`${pl(P.n,'séance','séances')} de ${esc(gName(src))} (du ${esc(d(P.first))} au ${esc(d(P.last))}) ${P.n>1?'seront copiées':'sera copiée'} du ${esc(d(P.from))} au ${esc(d(P.to))}, dans le même ordre, en sautant les fins de semaine et les congés.${P.out?` ${pl(P.out,'séance tombe','séances tombent')} après la fin de l’année scolaire et ne ${P.out>1?'seront pas copiées':'sera pas copiée'}.`:''}${P.clash?` ${pl(P.clash,'séance est ignorée','séances sont ignorées')} : ${esc(g.nom)} a déjà quelque chose à ce moment-là.`:''} Les présences et les résultats ne sont pas copiés.`;
  return `<div class="cp-box" id="cp-box"><h3 class="fiche-h3">Copier l’horaire d’une autre classe</h3><form class="inline-add" data-form="cp-go" data-g="${esc(g.id)}">
      <label class="field" style="flex:0 1 220px"><span>Classe à copier</span><select id="cp-src" data-cp="src"${others.length?'':' disabled'}><option value="">Choisir…</option>${others.map(x=>`<option value="${esc(x.id)}"${x.id===src?' selected':''}>${esc(x.nom)}</option>`).join('')}</select></label>
      <label class="field" style="flex:0 1 220px"><span>Première journée de ${esc(g.nom)}</span><input type="date" id="cp-date" data-cp="date" data-f="cpd" value="${esc(st.cpd||'')}"></label>
      <button class="btn primary" type="submit" id="cp-go"${P&&P.n?dis():' disabled'}>${P&&P.n?'Copier '+pl(P.n,'séance','séances'):'Copier'}</button></form>
    <p class="help" id="cp-info" style="margin-top:8px">${info}</p></div>`;
}

