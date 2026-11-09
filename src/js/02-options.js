/* ---------- Options : les parties du site qu’on ajoute ou non ----------
   Une option est un fichier à part, options/<nom>.js, construit par outils/construire.js à partir de src/options/<nom>/.
   Le fichier est là : l’option s’affiche. Pas de fichier : le site fonctionne sans elle, et ses données restent dans la base.
   On le met ou on l’enlève avec node outils/options.js <nom> on|off, ou depuis le hub (Projet › PompierNote).
   Le fichier voit tout le code du site et s’inscrit avec addOption(nom, { ... }). Le site, lui, ne passe que par opt(nom)
   et optAll() : rien ne manque quand le fichier n’est pas là.
   Ce qu’une option peut fournir (tout est facultatif, sauf page) :
     page(), sub                       sa page, qui porte son nom, et son menu à sections (voir SUBNAV)
     listen()                          ses données, une seule fois, quand la base est là
     mine()                            ce que l’enseignant ou l’élève lit de lui-même
     hidden(rôle)                      true : son entrée du menu est masquée pour ce rôle
     drawers, shapes, closeDrawer()    ses fenêtres { kind: fonction } et leurs formes (voir DR_SHAPES)
     click(act,b,e), submit(form,f), input(t), change(t)     ses événements ; rendent true s’ils les ont traités
     notifs(D,jour,qui), search(add,rôle,admin), actions(A), render()
     profileStudent(e), profileTeacher(id)     ses panneaux dans « Mon profil »
   et ce que les autres parties du site lui demandent : studentTab, resources (stock) ; entries, fee, addEntry… (compta). */
const OPTIONS=['stock','compta'];
const OPT_VER='@@OPT_VER@@';
const OPT={};
const opt=k=>OPT[k]||null;
const optAll=()=>OPTIONS.map(opt).filter(Boolean);
/* Les réglages qui n’ont de sens qu’avec une option */
const OPT_ROWS={stock:'stock',equipEl:'stock',compta:'compta',compteEl:'compta',paieEns:'compta'};
const optRow=k=>!OPT_ROWS[k]||!!OPT[OPT_ROWS[k]];
/* Les fichiers présents s’inscrivent ; un fichier absent ne change rien */
function optLoad(){return Promise.all(OPTIONS.filter(k=>!OPT[k]).map(k=>loadScript(`options/${k}.js?v=${OPT_VER}`).catch(()=>{})));}
function addOption(k,def){
  OPT[k]=def;
  if(def.sub) SUBNAV[k]=def.sub;
  if(def.shapes) Object.assign(DR_SHAPES,def.shapes);
}
/* Les styles d’une option arrivent avec son fichier, après ceux du site */
function optStyles(css){const x=document.createElement('style');x.textContent=css;document.head.appendChild(x);}
