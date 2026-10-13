/* ---------- Statistiques de présence ---------- */
function sessionsBetween(from,to){
  const out=[];let d=parse(from);const end=parse(to);let n=0;
  while(d<=end&&n<400){out.push(...sessionsOn(iso(d)));d=addDays(d,1);n++;}
  return out;
}
function studentStats(from,to){
  const m={};
  for(const [k,p] of Object.entries(S.data.presTerm)){
    if(!p||p.date<from||p.date>to) continue;
    for(const [id,v] of Object.entries(p.statuts||{})){
      const s=m[id]||(m[id]={P:0,A:0,R:0,M:0,n:0,log:[]});
      if(s[v]==null) continue;
      s[v]++;s.n++;
      if(v!=='P') s.log.push({date:p.date,cours:p.cours,v,key:k});
    }
  }
  return m;
}
const rateOf=s=>s&&s.n?Math.round((s.P+s.R)/s.n*100):null;
function periodRange(p){
  const t=todayISO(), d=new Date();
  if(p==='semaine') return [iso(monday(d)),t];
  if(p==='mois') return [iso(new Date(d.getFullYear(),d.getMonth(),1)),t];
  return [yearStart(),t];
}

