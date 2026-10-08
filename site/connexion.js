/* Caserne-École : écran de connexion et demandes de compte du site.
   La page de l’horaire a été écrite pour claude.ai : elle demande sa base de données et
   l’identité de la personne avec window.claude.use("db" | "user"). Ici, ces deux réponses
   arrivent seulement quand la personne est connectée ET que son compte est approuvé.
   Le service de connexion (Firebase, ou une simulation dans les tests) s’annonce avec
   window.__setBackend(service). */
(function(){
  let resolveReady;
  const ready=new Promise(r=>{resolveReady=r;});
  window.claude={use:async n=>{const c=await ready;return n==='db'?c.db:n==='user'?c.user:null;}};

  let B=null, unwatch=null;
  const st={view:'loading',err:'',info:'',busy:false,user:null,demande:null,vals:{}};
  window.__AUTH={
    signOut:async()=>{try{if(B)await B.signOut();}catch(e){}if(!window.__NO_RELOAD)location.reload();},
    email:()=>st.user?st.user.email:''
  };

  /* ---------- Apparence (mêmes couleurs que l’horaire) ---------- */
  const css=`
#gate{position:fixed;inset:0;z-index:200;overflow-y:auto;background:#F4F6F9;font-family:Arial,Helvetica,sans-serif;color:#142132;display:flex;align-items:center;justify-content:center;padding:24px 16px}
#gate[hidden]{display:none!important}
#gate *{box-sizing:border-box}
.g-card{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);width:min(100%,920px);background:#FFFFFF;border:1px solid #DCE3EC;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(20,33,50,.08)}
.g-side{background:#142132;color:#E6EAF0;padding:34px 30px;display:flex;flex-direction:column;gap:22px}
.g-brand{display:flex;align-items:center;gap:12px;font-weight:800;font-size:18px;letter-spacing:.035em;text-transform:uppercase;line-height:1.25}
.g-brand small{display:block;font-size:11.5px;letter-spacing:.14em;color:#AEB8C6;font-weight:700}
.g-logo{width:44px;height:44px;border-radius:11px;background:#BC322D;display:grid;place-items:center;flex:none}
.g-logo svg{width:24px;height:24px}
.g-side p{margin:0;color:#C7CED8;font-size:14.5px;line-height:1.55}
.g-side ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;font-size:14px;color:#C7CED8}
.g-side li{display:flex;gap:10px;align-items:flex-start}
.g-side li::before{content:"";width:7px;height:7px;border-radius:50%;background:#E5484D;margin-top:6px;flex:none}
.g-main{padding:32px 34px;display:flex;flex-direction:column;gap:16px;min-width:0}
.g-main h1{margin:0;font-size:24px;line-height:1.2}
.g-main .g-sub{margin:-8px 0 0;color:#5B6878;font-size:14.5px;line-height:1.5}
.g-tabs{display:flex;gap:3px;padding:3px;background:#E9EEF4;border-radius:9px}
.g-tabs button{flex:1;border:0;background:none;padding:9px 10px;border-radius:7px;font:700 13.5px Arial,Helvetica,sans-serif;color:#5B6878;cursor:pointer}
.g-tabs button[aria-pressed="true"]{background:#FFFFFF;color:#142132;box-shadow:0 1px 3px rgba(20,33,50,.14)}
.g-form{display:flex;flex-direction:column;gap:12px}
.g-field{display:flex;flex-direction:column;gap:5px;font-size:13px;font-weight:700;color:#2C3B4F}
.g-field input,.g-field select,.g-field textarea{width:100%;min-height:42px;border:1px solid #CBD5E1;border-radius:8px;background:#FFFFFF;padding:9px 11px;font:15px Arial,Helvetica,sans-serif;color:#142132}
.g-field textarea{min-height:64px;resize:vertical}
.g-field input:focus,.g-field select:focus,.g-field textarea:focus{outline:2px solid #2C6BC9;outline-offset:1px;border-color:#2C6BC9}
.g-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.g-btn{min-height:44px;border:1px solid #BC322D;border-radius:8px;background:#BC322D;color:#FFFFFF;font:700 15px Arial,Helvetica,sans-serif;cursor:pointer;padding:0 16px}
.g-btn:hover{background:#A42A26}
.g-btn:disabled{opacity:.55;cursor:wait}
.g-btn.alt{background:#FFFFFF;color:#142132;border-color:#CBD5E1}
.g-btn.alt:hover{background:#F4F6F9}
.g-link{border:0;background:none;padding:0;color:#2C4F78;font:700 13.5px Arial,Helvetica,sans-serif;cursor:pointer;text-align:left}
.g-link:hover{text-decoration:underline}
.g-err{margin:0;padding:10px 12px;border-radius:8px;background:#FDECEE;color:#B42318;font-size:14px;font-weight:700}
.g-info{margin:0;padding:10px 12px;border-radius:8px;background:#EAF3FF;color:#1F4E8C;font-size:14px}
.g-note{margin:0;color:#5B6878;font-size:13px;line-height:1.5}
.g-state{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.g-badge{display:inline-flex;align-items:center;gap:8px;padding:5px 11px;border-radius:999px;background:#FFF4DE;color:#8A5300;font-size:13px;font-weight:700}
.g-badge.bad{background:#FDECEE;color:#B42318}
.g-badge::before{content:"";width:8px;height:8px;border-radius:50%;background:currentColor}
.g-actions{display:flex;flex-wrap:wrap;gap:10px}
.g-spin{color:#5B6878;font-size:15px}
.g-demo{display:flex;flex-direction:column;gap:9px;padding:12px 14px;border:1px dashed #B9C6D6;border-radius:10px;background:#F8FAFC;font-size:13.5px;color:#2C3B4F}
.g-demo p{margin:0;color:#5B6878;font-size:12.5px;line-height:1.5}
.g-demo-btns{display:flex;flex-wrap:wrap;gap:6px}
.g-demo-btns button{border:1px solid #CBD5E1;background:#FFFFFF;border-radius:999px;padding:7px 12px;font:700 13px Arial,Helvetica,sans-serif;color:#142132;cursor:pointer}
.g-demo-btns button:hover{border-color:#2C4F78;background:#EEF4FB}
.g-demo code{font:700 12.5px Consolas,monospace;background:#E9EEF4;padding:1px 5px;border-radius:4px}
.vh-g{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:760px){.g-card{grid-template-columns:1fr}.g-side{padding:24px 22px;gap:14px}.g-side ul{display:none}.g-main{padding:24px 22px}.g-row{grid-template-columns:1fr}}`;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  const root=document.createElement('div');root.id='gate';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','g-title');
  document.body.appendChild(root);

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const logo='<span class="g-logo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg></span>';
  const side=`<aside class="g-side"><div class="g-brand">${logo}<span>Caserne-École<small>Académie des pompiers</small></span></div>
    <p>L’horaire des classes, les présences, les examens et les corvées, au même endroit.</p>
    <ul><li>Chaque élève voit son horaire et ses examens.</li><li>Chaque enseignant prend les présences de ses cours.</li><li>L’administration gère les classes, le personnel et les comptes.</li></ul></aside>`;
  const v=k=>esc(st.vals[k]||'');
  const field=(id,label,type,extra)=>`<label class="g-field" for="g-${id}"><span>${label}</span><input id="g-${id}" name="${id}" type="${type}" value="${type==='password'?'':v(id)}" ${extra||''}></label>`;
  const msg=()=>(st.err?`<p class="g-err" role="alert">${esc(st.err)}</p>`:'')+(st.info?`<p class="g-info" role="status">${esc(st.info)}</p>`:'');
  const dis=()=>st.busy?' disabled':'';
  const requestFields=withLogin=>`
    ${field('nom','Nom complet','text','autocomplete="name" maxlength="80" required')}
    ${withLogin?field('courriel','Courriel','email','autocomplete="email" maxlength="120" required')+field('mdp','Mot de passe (6 caractères ou plus)','password','autocomplete="new-password" minlength="6" required'):''}
    <label class="g-field" for="g-message"><span>Message à l’administration (facultatif)</span><textarea id="g-message" name="message" maxlength="400" placeholder="Ex. : je commence à l’Académie cette semaine.">${v('message')}</textarea></label>
    <p class="g-note">L’administration choisit votre rôle et votre classe en approuvant la demande.</p>`;

  const demo=()=>!!(B&&B.demo);
  const demoBox=()=>demo()?`<div class="g-demo" id="g-demo"><div><b>Démo</b> : connectez-vous en un clic avec un de ces comptes (mot de passe <code>demo123</code>).</div>
    <div class="g-demo-btns">${B.demo.accounts.map((a,i)=>`<button type="button" id="g-demo-${i}" data-g="demo" data-i="${i}">${esc(a.label)}</button>`).join('')}</div>
    <p>Les comptes et les données de la démo restent dans ce navigateur. N’entrez pas un vrai mot de passe. <button class="g-link" type="button" data-g="reset" style="font-size:12.5px">Réinitialiser la démo</button></p></div>`:'';
  function view(){
    const s=st.view;
    if(s==='loading') return `<div class="g-main"><p class="g-spin" role="status">Chargement…</p></div>`;
    if(s==='offline') return `<div class="g-main g-state"><span class="g-badge bad">Service injoignable</span><h1 id="g-title">Connexion impossible pour le moment</h1><p class="g-sub" style="margin:0">Le service de connexion ne répond pas. Vérifiez votre connexion internet, puis rechargez la page.</p><div class="g-actions"><button class="g-btn" type="button" id="g-reload" data-g="reload">Recharger la page</button></div></div>`;
    if(s==='noconfig') return `<div class="g-main"><h1 id="g-title">Site en préparation</h1><p class="g-sub">Le site n’est pas encore relié à sa base de données. La connexion sera disponible très bientôt.</p><p class="g-note"><a href="demo.html">Essayer la démo</a> en attendant.</p></div>`;
    if(s==='login'||s==='request'){
      const tabs=`<div class="g-tabs" role="group" aria-label="Choix"><button type="button" id="g-tab-login" data-g="tab" data-v="login" aria-pressed="${s==='login'}">Se connecter</button><button type="button" id="g-tab-request" data-g="tab" data-v="request" aria-pressed="${s==='request'}">Demander un compte</button></div>`;
      if(s==='login') return `<div class="g-main"><h1 id="g-title">Connexion</h1><p class="g-sub">Entrez le courriel et le mot de passe de votre compte.</p>${tabs}${msg()}
        <form class="g-form" id="g-form-login" novalidate>${field('courriel','Courriel','email','autocomplete="email" required')}${field('mdp','Mot de passe','password','autocomplete="current-password" required')}
        <button class="g-btn" type="submit" id="g-login"${dis()}>Se connecter</button></form>
        <button class="g-link" type="button" id="g-forgot" data-g="forgot">Mot de passe oublié ?</button>${demoBox()}</div>`;
      return `<div class="g-main"><h1 id="g-title">Demander un compte</h1><p class="g-sub">L’administration de l’Académie approuve chaque demande. Vous pourrez ensuite vous connecter.</p>${tabs}${msg()}
        ${demo()?'<p class="g-info">Démo : la demande reste dans ce navigateur. N’entrez pas un vrai mot de passe.</p>':''}<form class="g-form" id="g-form-request" novalidate>${requestFields(true)}<button class="g-btn" type="submit" id="g-send"${dis()}>Envoyer la demande</button></form></div>`;
    }
    if(s==='setup') return `<div class="g-main"><h1 id="g-title">Première installation</h1><p class="g-sub">Aucun administrateur n’est encore inscrit. Créez le compte de l’administration : vous pourrez ensuite approuver les demandes de compte.</p>${msg()}
      <form class="g-form" id="g-form-setup" novalidate>${field('nom','Nom complet','text','autocomplete="name" maxlength="80" required')}${field('courriel','Courriel','email','autocomplete="email" required')}${field('mdp','Mot de passe (6 caractères ou plus)','password','autocomplete="new-password" minlength="6" required')}
      <button class="g-btn" type="submit" id="g-setup"${dis()}>Créer le compte administrateur</button></form></div>`;
    if(s==='pending') return `<div class="g-main g-state"><span class="g-badge">En attente d’approbation</span><h1 id="g-title">Votre demande est envoyée</h1>
      <p class="g-sub" style="margin:0">L’administration doit approuver votre compte. Vous arriverez directement sur votre horaire dès qu’elle l’aura fait${st.user?`, en vous connectant avec ${esc(st.user.email)}`:''}.</p>
      ${demo()?'<p class="g-info">Démo : pour approuver la demande, déconnectez-vous, connectez-vous avec le compte <b>Administration</b>, puis ouvrez le menu <b>Comptes</b>. Revenez ensuite avec votre nouveau compte.</p>':''}
      <div class="g-actions"><button class="g-btn alt" type="button" id="g-out" data-g="out">Se déconnecter</button></div></div>`;
    if(s==='refused') return `<div class="g-main g-state"><span class="g-badge bad">Demande refusée</span><h1 id="g-title">Votre demande n’a pas été acceptée</h1>
      <p class="g-sub" style="margin:0">Communiquez avec l’administration de l’Académie, ou envoyez une nouvelle demande avec un message qui précise qui vous êtes.</p>
      <div class="g-actions"><button class="g-btn" type="button" id="g-again" data-g="again">Envoyer une nouvelle demande</button><button class="g-btn alt" type="button" data-g="out">Se déconnecter</button></div></div>`;
    if(s==='request-signed') return `<div class="g-main"><h1 id="g-title">Demander un compte</h1><p class="g-sub">Vous êtes connecté avec ${esc(st.user?st.user.email:'')}, mais aucun compte ne vous est encore attribué.</p>${msg()}
      <form class="g-form" id="g-form-request2" novalidate>${requestFields(false)}<button class="g-btn" type="submit" id="g-send2"${dis()}>Envoyer la demande</button></form>
      <button class="g-link" type="button" data-g="out">Se déconnecter</button></div>`;
    return '';
  }
  function render(){
    // garde ce qui est tapé (sauf les mots de passe) quand l’écran se redessine
    root.querySelectorAll('input[name],select[name],textarea[name]').forEach(i=>{if(i.type!=='password')st.vals[i.name]=i.value;});
    const focus=document.activeElement&&root.contains(document.activeElement)?document.activeElement.id:'';
    // les mots de passe restent dans les champs (jamais écrits dans la page) quand l’écran se redessine
    const pw={};root.querySelectorAll('input[type=password]').forEach(i=>{pw[i.id]=i.value;});
    root.innerHTML=`<div class="g-card">${side}${view()}</div>`;
    for(const [id,val] of Object.entries(pw)){const i=document.getElementById(id);if(i&&root.contains(i))i.value=val;}
    const f=focus&&document.getElementById(focus);
    if(f&&f.tagName!=='BUTTON') f.focus();
  }
  function go(view,keepMsg){if(view!==st.view)root.querySelectorAll('input[type=password]').forEach(i=>{i.value='';});st.view=view;if(!keepMsg){st.err='';st.info='';}render();const first=root.querySelector('input,select');if(first&&view!=='loading')first.focus();}

  /* ---------- Messages d’erreur du service de connexion ---------- */
  function authErr(e){
    const c=String(e&&e.code||'');
    if(/invalid-credential|wrong-password|user-not-found|invalid-login/.test(c)) return 'Courriel ou mot de passe incorrect.';
    if(/email-already-in-use/.test(c)) return 'Un compte existe déjà avec ce courriel. Connectez-vous, ou utilisez « Mot de passe oublié ».';
    if(/weak-password/.test(c)) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if(/invalid-email|missing-email/.test(c)) return 'Ce courriel n’est pas valide.';
    if(/too-many-requests/.test(c)) return 'Trop d’essais. Réessayez dans quelques minutes.';
    if(/network/.test(c)) return 'Pas de connexion internet. Vérifiez votre réseau et réessayez.';
    if(c.includes('demo/no-email')) return 'Dans la démo, aucun courriel n’est envoyé : utilisez un des comptes de démo.';
    if(/permission|invalid_argument/.test(c)) return 'Action refusée par le site. Réessayez ou communiquez avec l’administration.';
    return 'Une erreur est survenue. Réessayez.';
  }
  const vals=()=>{const o={};root.querySelectorAll('input[name],select[name],textarea[name]').forEach(i=>{o[i.name]=i.value.trim();});return o;};
  async function busy(fn){if(st.busy)return;st.busy=true;st.err='';st.info='';render();try{await fn();}catch(e){st.err=authErr(e);}st.busy=false;if(st.view!=='app')render();}

  /* ---------- Actions ---------- */
  root.addEventListener('click',async e=>{
    const b=e.target.closest('[data-g]');if(!b)return;
    const a=b.dataset.g;
    if(a==='tab') go(b.dataset.v);
    else if(a==='out') window.__AUTH.signOut();
    else if(a==='reload') location.reload();
    else if(a==='reset'){if(window.__DEMO_RESET)window.__DEMO_RESET();}
    else if(a==='demo'){
      const acc=B&&B.demo&&B.demo.accounts[+b.dataset.i];if(!acc)return;
      await busy(()=>B.signIn(acc.email,acc.pw));
    }
    else if(a==='again'){const dm=st.demande||{};st.vals.nom=st.vals.nom||dm.nom||'';st.vals.message=st.vals.message||dm.message||'';go('request-signed');}
    else if(a==='forgot'){
      const em=(root.querySelector('#g-courriel')||{}).value||'';
      if(!em.trim()){st.err='Entrez d’abord votre courriel, puis cliquez sur « Mot de passe oublié ».';st.info='';render();return;}
      await busy(async()=>{await B.reset(em.trim());st.info=`Un courriel pour choisir un nouveau mot de passe a été envoyé à ${em.trim()}.`;});
    }
  });
  root.addEventListener('submit',async e=>{
    e.preventDefault();const id=e.target.id, o=vals();
    if(id==='g-form-login'){
      if(!o.courriel||!o.mdp){st.err='Entrez votre courriel et votre mot de passe.';render();return;}
      await busy(()=>B.signIn(o.courriel,o.mdp));
    }else if(id==='g-form-request'||id==='g-form-request2'||id==='g-form-setup'){
      const setup=id==='g-form-setup', signed=id==='g-form-request2';
      if(!o.nom){st.err='Indiquez votre nom complet.';render();return;}
      if(!signed&&(!o.courriel||!o.mdp)){st.err='Indiquez votre courriel et un mot de passe.';render();return;}
      if(!signed&&o.mdp.length<6){st.err='Le mot de passe doit contenir au moins 6 caractères.';render();return;}
      await busy(async()=>{
        let u=st.user;
        suppress=true; // la nouvelle connexion est traitée ici, une fois la demande écrite
        try{
        if(!signed){u=await B.signUp(o.courriel,o.mdp,o.nom);st.user=u;}
        const now=new Date().toISOString();
        await B.set('profils/'+u.uid,{nom:o.nom,courriel:u.email||o.courriel||'',maj:now});
        if(setup){
          await B.set('config/proprietaire',{uid:u.uid,cree:now});
          await B.set('comptes/'+u.uid,{role:'admin',ref:'',fiche:{nom:o.nom},maj:now});
        }else{
          const d={nom:o.nom,courriel:u.email||o.courriel||'',message:o.message||'',statut:'en attente',cree:now};
          await B.set('demandes/'+u.uid,d);
        }
        }finally{suppress=false;}
        await check(u);
      });
    }
  });

  /* ---------- Qui est connecté, et a-t-il accès ? ---------- */
  let suppress=false;
  // une lecture qui ne répond pas (réseau coupé) ne doit pas bloquer l’écran
  const tget=(p,ms=9000)=>Promise.race([B.get(p),new Promise((_,rej)=>setTimeout(()=>rej({code:'timeout'}),ms))]);
  const isNet=e=>{const c=String(e&&e.code||'');return c==='timeout'||c==='unavailable'||/offline|network/i.test(String(e&&e.message||''));};
  async function check(u){
    st.user=u;
    if(!u){
      let owner=true;
      try{owner=(await tget('config/proprietaire')).exists;}catch(e){owner=true;}
      go(owner?'login':'setup',true);return;
    }
    let ownerUid='', acct=null, prof=null;
    try{const p=await tget('config/proprietaire');ownerUid=p.exists?p.data.uid:'';}catch(e){if(isNet(e)){go('offline');return;}}
    try{const a=await tget('comptes/'+u.uid);acct=a.exists?a.data:null;}catch(e){if(isNet(e)){go('offline');return;}}
    try{const p=await tget('profils/'+u.uid);prof=p.exists?p.data:null;}catch(e){}
    const isOwner=!!ownerUid&&ownerUid===u.uid;
    if(acct||isOwner){enter(u,acct,isOwner,prof);return;}
    let dem=null;
    try{const d=await tget('demandes/'+u.uid);dem=d.exists?d.data:null;}catch(e){if(isNet(e)){go('offline');return;}}
    st.demande=dem;
    if(dem&&dem.statut==='refusée'){go('refused');return;}
    if(!dem){st.vals.nom=st.vals.nom||(prof&&prof.nom)||u.displayName||'';go('request-signed');return;}
    go('pending');
    // dès que l’administration approuve, la personne entre sans recharger
    if(unwatch)unwatch();
    unwatch=B.watch('comptes/'+u.uid,s=>{if(s.exists&&st.view!=='app'){if(unwatch){unwatch();unwatch=null;}check(u);}});
  }
  function enter(u,acct,isOwner,prof){
    const role=acct?acct.role:'admin', admin=isOwner||role==='admin', staffish=admin||role==='teacher';
    const P=(id,nom)=>({id,name:nom||'',avatarUrl:'',color:'#5B7BA6',email:null,isMe:id===u.uid,guest:false});
    const user={
      isOwner:async()=>isOwner, canEdit:async()=>admin,
      can:async n=>n==='data.write'?staffish:false,
      id:async()=>u.uid,
      me:async()=>({id:u.uid,name:(prof&&prof.nom)||u.displayName||'',avatarUrl:'',color:'#2C4F78',email:u.email||null,isOwner,canEdit:admin}),
      profiles:async ids=>{const r={};await Promise.all([...new Set([].concat(ids))].map(async id=>{let nom='';try{const d=await B.get('profils/'+id);if(d.exists)nom=d.data.nom||'';}catch(e){}r[id]=P(id,nom);}));return r;},
      search:async q=>{if(!admin)return [];let all=[];try{all=await B.list('profils');}catch(e){return [];}const t=String(q||'').toLowerCase();
        return all.filter(p=>`${p.data.nom||''} ${p.data.courriel||''}`.toLowerCase().includes(t)).slice(0,8).map(p=>P(p.id,p.data.nom||p.data.courriel||''));}
    };
    st.view='app';root.hidden=true;root.innerHTML='';document.body.classList.remove('gate-open');
    resolveReady({db:B.db,user});
  }

  // si le service de connexion ne se charge pas (réseau coupé, script bloqué), on le dit au lieu de rester sur « Chargement »
  const giveUp=setTimeout(()=>{if(!B&&st.view==='loading')go('offline');},15000);
  window.__backendFailed=()=>{clearTimeout(giveUp);if(st.view==='loading')go('offline');};
  window.__setBackend=b=>{
    clearTimeout(giveUp);
    B=b;
    // tant que Firebase n’est pas configuré, le site montre la démo
    if(!b){if(!window.__NO_RELOAD){location.replace('demo.html');return;}go('noconfig');return;}
    b.onAuth(u=>{if(suppress||st.view==='app')return;check(u);});
  };
  document.body.classList.add('gate-open');
  render();
})();
