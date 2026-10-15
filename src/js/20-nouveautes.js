/* ---------- Nouveautés : ce qui a changé sur le site (administration) ----------
   Une entrée par PUSH (un envoi du site sur GitHub), le plus récent en premier :
   { date, id, push, items } — push : le titre du push ; id : son identifiant court sur GitHub. L’identifiant n’est connu
   qu’après l’envoi : on laisse '' pour le push en cours et on le remplit au push suivant.
   items : [type, titre, explication, page à ouvrir]. Types : new (nouvelle fonction), up (amélioration), fix (correction). */
const NV_REPO='https://github.com/leocyfo/caserne-ecole';
const NOUVEAUTES=[
  {date:'2026-10-14',id:'',push:'Téléphone : Élèves, Personnel et Comptes en liste',items:[
    ['up','Élèves','Sur téléphone, une ligne par élève : le nom et le taux de présence en haut, la classe, les absences, les retards et le téléphone dessous. Plus besoin de faire défiler le tableau de côté.','eleves'],
    ['up','Personnel','Le nom et le statut en haut, le courriel dessous, puis les séances de la semaine et les absences du mois.','personnel'],
    ['up','Comptes','La personne et son rôle en haut, sa fiche et le bouton Modifier dessous.','comptes']
  ]},
  {date:'2026-10-14',id:'8e2088a',push:'Téléphone : l’horaire arrive plus vite à l’écran',items:[
    ['up','Barre de l’horaire','Sur téléphone, la barre de l’administration tient en trois rangées au lieu de cinq : la semaine ; Semaine/Jour et Classes/Enseignants côte à côte ; « 12 en retard » et « Ajouter » côte à côte. La première séance monte d’environ 90 px.','calendar']
  ]},
  {date:'2026-10-14',id:'0c1a88f',push:'Téléphone : corrections, et un test à la taille d’un téléphone',items:[
    ['fix','Page Comptes','Sur téléphone, elle ne dépasse plus de l’écran (un texte caché élargissait la page).','comptes'],
    ['fix','Champs','Sur téléphone, les champs et les listes sont en 16 px : l’iPhone ne zoome plus chaque fois qu’on touche un champ.',''],
    ['up','Présences au doigt','Les boutons P, A, R, M, « Marquer les autres présents », Enregistrer et la croix de fermeture font 44 px, la taille conseillée pour le doigt.',''],
    ['fix','Aujourd’hui et À rattraper','Pour l’enseignant, le titre de la séance prend toute la largeur ; le bouton « Prendre les présences » passe dessous.',''],
    ['fix','Prochains examens','Le titre s’affiche en entier et l’étiquette « Dans 5 semaines » passe dessous.',''],
    ['up','Petits textes','Sur téléphone, aucun texte sous 12 px.',''],
    ['up','Test à la taille d’un téléphone','Une page de test ouvre les 22 écrans des trois rôles à 390 px de large et vérifie tout cela à chaque envoi.','']
  ]},
  {date:'2026-10-13',id:'871b499',push:'Le code en plusieurs fichiers, et les tests lancés à chaque envoi sur GitHub',items:[
    ['up','Code en plusieurs fichiers','La page n’est plus un seul gros fichier : 28 fichiers de code et 14 de styles, un par sujet (horaire, classes, examens, reprises…), assemblés automatiquement. Rien ne change à l’écran.',''],
    ['up','Tests à chaque envoi','À chaque envoi sur GitHub, toute la suite de tests se lance toute seule. Le résultat est dans l’onglet Actions du dépôt : coche verte ou croix rouge.','']
  ]},
  {date:'2026-10-13',id:'0d5d387',push:'Nettoyage du code : fonctions et styles inutilisés retirés',items:[
    ['up','Code allégé','Six fonctions qui ne servaient plus, les restes de l’ancienne liste « Noms des cours » des Paramètres et 22 styles sans usage sont retirés. Rien ne change à l’écran.','']
  ]},
  {date:'2026-10-13',id:'7bc2f25',push:'Plus rapide et moins de lectures : horaire en mémoire, présences par période',items:[
    ['up','Présences par période','Les pages Classes et Élèves ne chargent plus toutes les présences de l’année : seulement la période affichée, le mois en cours par défaut. « Depuis la rentrée » et la fiche d’un élève chargent l’année.','classes'],
    ['up','Page Élèves','Elle a les mêmes périodes que la page Classes : cette semaine, ce mois, depuis la rentrée.','eleves'],
    ['up','Horaire en mémoire','L’horaire de chaque journée se calcule une seule fois, puis sert à toutes les pages jusqu’au prochain changement.',''],
    ['fix','Séance ancienne','Ouvrir une séance passée depuis l’historique ou les examens va chercher ses présences, au lieu de la montrer « à prendre ».','']
  ]},
  {date:'2026-10-13',id:'82e5d07',push:'Journées de reprise : modules à reprendre, une reprise par examen échoué, échec du module',items:[
    ['new','Journées de reprise','Dans Examens, l’onglet des reprises : on crée d’abord la journée (date, moment, classes), puis on y ajoute les modules à reprendre.','examens'],
    ['new','Une reprise par examen échoué','Chaque élève qui a échoué ou manqué un examen d’un module ajouté le reprend ce jour-là. La liste se fait toute seule.','examens'],
    ['new','Échec du module','Une reprise réussie devient « réussi en reprise ». Une reprise ratée devient « échec du module », visible dans la grille, la fiche de l’élève et le relevé.','examens'],
    ['up','Pour l’élève','« Mes examens » donne, pour chaque examen à reprendre, la date de sa reprise.',''],
    ['up','Note de reprise','Une note en % inscrit l’issue de la reprise selon le seuil de réussite. Une reprise inscrite par erreur s’annule.','examens']
  ]},
  {date:'2026-10-13',id:'184d131',push:'Examens : notes en % et seuil de réussite',items:[
    ['new','Notes en %','Dans les résultats d’un examen, une case « % » par élève. La note est facultative et inscrit le résultat toute seule : réussi à partir du seuil.','examens'],
    ['new','Seuil de réussite','Il se règle dans Paramètres (60 % au départ).','params'],
    ['up','Notes affichées partout','Dans la grille des résultats, la fiche de l’élève, « Mes examens » et le relevé imprimé. La liste des examens corrigés donne la moyenne.','examens']
  ]},
  {date:'2026-10-13',id:'dc458c1',push:'Locaux et équipements, avec détection des conflits',items:[
    ['new','Locaux et équipements','La liste des salles, camions, tours ou bassins de l’école se tient dans Paramètres.','params'],
    ['new','Par cours de module','Dans l’onglet Cours d’un module, on choisit ce que chaque cours demande. Cela vaut pour toutes les classes.','modules'],
    ['new','Conflits','Deux séances qui veulent le même local ou le même équipement au même moment sont signalées dans le calendrier, dans Affectations et dans la fenêtre de la séance.','affectations'],
    ['up','Pour une séance seulement','La fenêtre d’une séance permet de changer ses locaux et équipements sans toucher au module.','calendar'],
    ['fix','Fichiers exportés','Un caractère invisible traînait dans le code des exports ; il est maintenant écrit proprement.','']
  ]},
  {date:'2026-10-13',id:'37dc969',push:'Import d’une liste d’élèves et copie de l’horaire d’une classe',items:[
    ['new','Liste d’élèves depuis un fichier','Dans la fiche d’une classe, « Inscrire des élèves » accepte un fichier CSV ou une liste collée d’Excel : numéro, nom, courriel, téléphone. Les élèves déjà dans la classe sont ignorés.','classes'],
    ['new','Copier l’horaire d’une classe','Dans l’onglet Modules d’une classe : on choisit la classe à copier et la première journée. Les séances suivent dans le même ordre, en sautant les fins de semaine et les congés.','classes'],
    ['up','Importer depuis la page Élèves','Le bouton « Importer une liste » mène à l’inscription de la classe choisie.','eleves']
  ]},
  {date:'2026-10-13',id:'6c30175',push:'Historique : qui a fait quoi, et quand',items:[
    ['new','Historique','Un nouveau menu pour l’administration. Chaque séance annulée, rétablie, déplacée, ajoutée ou supprimée y est inscrite, avec le nom de la personne et l’heure.','historique'],
    ['new','Affectations dans l’historique','Les candidatures, les approbations, les refus, les attributions, les retraits et les demandes de remplacement.','historique'],
    ['new','Modules dans l’historique','Les modules créés, modifiés ou supprimés, et les cours ou examens ajoutés ou retirés.','historique'],
    ['up','Recherche et filtres','L’historique se filtre par sujet et se cherche par nom de personne ou de module. Une ligne ouvre la séance concernée.','historique']
  ]},
  {date:'2026-10-13',id:'78b39d2',push:'Notifications : une cloche dans le site',items:[
    ['new','Cloche de notifications','En haut de chaque page. L’enseignant y voit ses candidatures approuvées ou refusées, les séances qu’on lui attribue ou retire, et ses séances annulées.',''],
    ['new','Pour l’administration','Les demandes de remplacement et les nouvelles candidatures.','affectations'],
    ['new','Pour les élèves','Les séances annulées de leur classe.',''],
    ['up','Séance annulée','Le site note quand et par qui une séance a été annulée.','calendar']
  ]},
  {date:'2026-10-13',id:'33d9ffb',push:'Impression : horaire de la semaine, feuille de présences, relevé de résultats',items:[
    ['new','Imprimer l’horaire de la semaine','Le bouton d’impression du calendrier (ou « Imprimer » dans la fiche d’une classe) prépare une page par classe, ou l’horaire d’un enseignant.','calendar'],
    ['new','Feuille de présences','Au même endroit : les élèves en lignes, les séances de la semaine en colonnes, à cocher à la main. Les présences déjà prises y sont inscrites.','classes'],
    ['new','Relevé de résultats','Dans l’onglet Examens de la fiche d’un élève, « Imprimer le relevé ». L’élève peut imprimer le sien depuis « Mes examens ».','eleves'],
    ['up','PDF','La fenêtre d’impression du navigateur permet d’enregistrer chaque feuille en PDF.','']
  ]},
  {date:'2026-10-13',id:'71e0fc1',push:'Heures enseignées par enseignant et par mois, avec export',items:[
    ['new','Heures enseignées','Dans Personnel, l’affichage « Heures » donne les heures données par chaque enseignant, mois par mois, depuis la rentrée.','personnel'],
    ['new','Export pour la paie','Le bouton Exporter remet un fichier (CSV, lisible dans Excel) pour le mois choisi ou pour l’année : un sommaire par enseignant, puis le détail séance par séance.','personnel']
  ]},
  {date:'2026-10-13',id:'0a1cdbb',push:'Nouveautés : les changements regroupés par push',items:[
    ['new','Nouveautés par push','Chaque envoi du site (push) a son bloc : son numéro, son titre, sa date, son identifiant sur GitHub et ce qu’il a changé. Le regroupement par date reste disponible.','nouveautes']
  ]},
  {date:'2026-10-13',id:'12976b2',push:'Modules : cours, examens et chargé de cours ; séances par classe',items:[
    ['new','Cours d’un module','Chaque module a maintenant ses cours : numéro, type et enseignants requis. Ils valent pour toutes les classes et ont été repris de l’horaire.','modules'],
    ['new','Examens d’un module','Chaque module a sa liste d’examens, théoriques ou pratiques.','modules'],
    ['new','Chargé de cours','Chaque module a son chargé de cours, qui donne ses séances à toutes les classes. Il remplace le titulaire par classe.','modules'],
    ['up','Séances','Un cours donné à une classe, à une date, s’appelle maintenant une séance. Une séance peut couvrir plusieurs cours.','calendar'],
    ['up','Enseignants requis','Le nombre se règle sur chaque cours du module, et plus dans les réglages du module.','modules'],
    ['up','Supprimer un module','Un module qui a des cours ne peut plus être supprimé.','modules'],
    ['fix','Deux personnes en même temps','Chaque séance s’enregistre à part : deux administrateurs ne s’écrasent plus en modifiant le même module.',''],
    ['fix','Numéros avec un trait d’union','« 16-6 » s’affiche comme un seul cours, et non plus « 16 et 6 ».','calendar']
  ]},
  {date:'2026-10-10',id:'37ca51b',push:'Page Nouveautés pour l’administration, sous Paramètres',items:[
    ['new','Page Nouveautés','La liste des nouvelles fonctions, des améliorations et des corrections du site, ici même.','nouveautes']
  ]},
  {date:'2026-10-10',id:'ff60bf6',push:'Corrections après l’inspection complète du site (23 points)',items:[
    ['new','Conflits d’horaire','Un enseignant placé dans deux cours en même temps est signalé dans le calendrier et dans Affectations.','affectations'],
    ['up','Un seul formulaire « Ajouter un cours »','Le même depuis le calendrier, une classe, un module ou les examens. Un examen ou une reprise est un cours d’un type particulier.','calendar'],
    ['up','Vocabulaire','Un module a des cours ; ce qui n’appartient à aucun module est une activité. « Séance » a disparu et « Enseignant principal » remplace « Prof principal ».',''],
    ['up','Listes au même style','Élèves, personnel et calendrier scolaire ont la même présentation que les classes. Les élèves sont rangés par numéro.','eleves'],
    ['up','Fin de semaine et téléphone','Le samedi et le dimanche, le calendrier ouvre sur la semaine qui vient. Sur téléphone, le menu commence replié.','calendar'],
    ['up','Personnel','Statut « Suppléant », fonction « Instructeur ». Un enseignant en congé ne reçoit plus de nouveaux cours.','personnel'],
    ['fix','Résultats de l’élève','Chaque élève voit ses résultats d’examens, et seulement les siens.',''],
    ['fix','Fenêtre d’un cours','Elle ne montre que ce jour-là. On ne peut plus supprimer tout un module par erreur.','calendar'],
    ['fix','« Prochain examen »','Il n’affiche plus la journée de reprise à la place d’un examen.','classes'],
    ['fix','Présences à rattraper de l’enseignant','Chaque ligne affiche la date du cours.',''],
    ['fix','Compteurs d’enseignants','Ils comptent les cours de la semaine, instructeurs approuvés compris.','personnel'],
    ['fix','Fiche d’élève','« Contact d’urgence » et « Courriel » remplacent les champs pensés pour des parents.','eleves'],
    ['fix','Calendrier scolaire','La liste de tous les examens est remplacée par un résumé.','annee'],
    ['fix','Affichage sur téléphone','Le bouton du menu ne passe plus par-dessus le nom, et l’en-tête de la semaine est réparé.',''],
    ['fix','Connexion','Un administrateur qui se connecte après un enseignant arrive bien dans l’espace administrateur.','']
  ]},
  {date:'2026-10-10',id:'51263f0',push:'Gestion des cours : modules, enseignants requis, candidatures et disponibilités',items:[
    ['new','Modules','Le catalogue du programme : heures de théorie et de pratique, enseignants requis, cours de chaque classe, examens et dates de reprise.','modules'],
    ['new','Affectations','Les cours à régler, les candidatures à approuver ou refuser, les demandes de remplacement, et les enseignants attribués sur le nombre requis.','affectations'],
    ['new','Disponibilités et « Mes cours » des enseignants','Chaque enseignant indique ses jours disponibles, postule aux cours à pourvoir, suit ses candidatures et peut demander un remplacement.',''],
    ['new','Compétences des enseignants','Les modules que chacun peut donner se cochent dans son dossier. Les cours à pourvoir lui sont proposés selon cette liste.','personnel']
  ]},
  {date:'2026-10-09',id:'9c96822',push:'Examens : grille des résultats et onglets Examens dans les fiches',items:[
    ['new','Grille des résultats','Les élèves en lignes, les examens en colonnes, une case colorée par résultat.','examens'],
    ['new','Examens dans les fiches','Un onglet Examens dans la fiche de chaque classe et de chaque élève.','classes']
  ]},
  {date:'2026-10-09',id:'c40025a',push:'Examens refaits : tableau de bord, résultats et reprises',items:[
    ['new','Examens : résultats et reprises','Un tableau de bord (à venir, résultats à entrer, reprises à faire, taux de réussite). Chaque élève reçoit Réussi, Échec ou Absent ; un échec devient une reprise.','examens']
  ]},
  {date:'2026-10-09',id:'677ab77',push:'Fiche de classe : une ligne par élève, plus lisible',items:[
    ['up','Fiche de classe','Une ligne par élève, avec sa présence, ses absences et ses retards en gros.','classes']
  ]},
  {date:'2026-10-09',id:'127a9dd',push:'Classes : une ligne par classe, plus lisible',items:[
    ['up','Liste des classes','Une ligne par classe, avec les chiffres importants en gros.','classes']
  ]},
  {date:'2026-10-09',id:'6e4e148',push:'Classes et présences réunies sur une seule page',items:[
    ['up','Classes et présences réunies','Le menu Présences a disparu : le taux de présence et les cours à rattraper sont dans chaque classe, les présences du personnel dans Personnel.','classes'],
    ['fix','Classes sans élèves','Elles ne comptent plus de présences en retard.','classes']
  ]},
  {date:'2026-10-09',id:'48db4a1',push:'Présences : moins d’information à l’écran',items:[
    ['up','Présences : l’essentiel','La page garde seulement le taux de présence de chaque classe et ce qui reste à rattraper.','classes']
  ]},
  {date:'2026-10-09',id:'ba6cfd5',push:'Page Présences refaite : cartes par classe et fiche de présences',items:[
    ['up','Page Présences refaite','Une carte par classe, et une fiche de présences pour chacune.','classes']
  ]},
  {date:'2026-10-09',id:'8cd2275',push:'Page Classes refaite : cartes et fiche de classe',items:[
    ['up','Page Classes refaite','Une carte par classe, et une fiche de classe avec ses élèves, ses cours et ses réglages.','classes']
  ]},
  {date:'2026-10-09',id:'3163116',push:'Démo : un même cours avant-midi et après-midi devient « Toute la journée »',items:[
    ['up','Journées complètes','Un même cours donné l’avant-midi et l’après-midi devient une seule journée dans l’horaire.','calendar']
  ]},
  {date:'2026-10-09',id:'b6e14fc',push:'Examens en couleur foncée',items:[
    ['up','Examens en couleur foncée','Ils se distinguent des cours au premier coup d’œil.','calendar']
  ]},
  {date:'2026-10-09',id:'5542221',push:'Prof principal de chaque classe',items:[
    ['new','Enseignant principal','Chaque classe a son enseignant principal.','classes']
  ]},
  {date:'2026-10-09',id:'a30a465',push:'Vue Jour : une journée, les classes en colonnes',items:[
    ['new','Vue « Jour »','Une journée avec les classes en colonnes.','calendar']
  ]},
  {date:'2026-10-09',id:'d1ace07',push:'Journée de corvée de ménage colorée en entier',items:[
    ['up','Corvée de ménage en couleur','La journée de corvée est colorée en entier dans l’horaire.','calendar']
  ]},
  {date:'2026-10-08',id:'606328e',push:'Corvée de ménage : pour toute la classe, toute la journée',items:[
    ['up','Corvée de ménage','Elle vaut pour toute la classe, toute la journée.','calendar']
  ]},
  {date:'2026-10-08',id:'b1ec9cb',push:'Avant-midi / après-midi au lieu des heures, sigle devant le nom du cours',items:[
    ['up','Demi-journées','Avant-midi, après-midi ou toute la journée à la place des heures, et le code du module devant son nom.','calendar']
  ]},
  {date:'2026-10-08',id:'c9a9793',push:'Affichages des cours plus complets',items:[
    ['up','Cartes et fenêtre d’un cours','Elles montrent le numéro du cours, le local et l’état des présences.','calendar']
  ]},
  {date:'2026-10-08',id:'69aeed5',push:'Listes : toute la ligne ouvre la fiche',items:[
    ['up','Lignes cliquables','Dans les listes des élèves et du personnel, toute la ligne ouvre la fiche.','eleves']
  ]},
  {date:'2026-10-08',id:'626f432',push:'Fiches plus claires : chiffres clés et onglets',items:[
    ['up','Fiches plus claires','Les chiffres clés en haut, puis des onglets : un sujet à la fois.','eleves']
  ]},
  {date:'2026-10-08',id:'d2fb7d2',push:'Fiches : le compte passe dans l’en-tête',items:[
    ['up','Compte dans l’en-tête de la fiche','Le compte de la personne se voit et se modifie en haut de sa fiche.','eleves']
  ]},
  {date:'2026-10-08',id:'395018a',push:'Fiches en pleine page pour les élèves et le personnel',items:[
    ['new','Fiches en pleine page','Le dossier d’un élève ou d’un membre du personnel, avec Précédent et Suivant pour passer de l’un à l’autre.','eleves']
  ]},
  {date:'2026-10-08',id:'f112874',push:'Le rôle et la classe sont choisis par l’administration',items:[
    ['up','Rôle et classe choisis par l’administration','La demande de compte ne demande plus le rôle ni la classe : l’administration les choisit en l’approuvant.','comptes']
  ]},
  {date:'2026-10-08',id:'9518d74',push:'Ajoute un serveur local pour essayer le site sur son ordinateur',items:[
    ['new','Site local','Un fichier à double-cliquer ouvre le site sur son ordinateur, pour l’essayer sans le mettre en ligne.','']
  ]},
  {date:'2026-10-08',id:'107269e',push:'Démo avec connexion : comptes de démo, déconnexion et demandes de compte',items:[
    ['new','Démo avec connexion','Des comptes de démonstration, la déconnexion et les demandes de compte, pour essayer tout le parcours.','']
  ]},
  {date:'2026-10-08',id:'0c4388a',push:'Connexion par courriel et demandes de compte (Firebase)',items:[
    ['new','Comptes et connexion','Un écran de connexion, des demandes de compte approuvées par l’administration, et la déconnexion.','comptes']
  ]},
  {date:'2026-10-08',id:'94669b1',push:'Renomme le projet en Caserne-École',items:[
    ['up','Nom du site','Le site s’appelle maintenant Caserne-École.','']
  ]},
  {date:'2026-10-08',id:'aa1e47d',push:'Renomme le projet en Site Pompier School',items:[
    ['up','Nom provisoire','Le projet s’est appelé « Site Pompier School » pendant quelques heures.','']
  ]},
  {date:'2026-10-07',id:'02b918a',push:'Calendrier des cours : page claude.ai, démo GitHub Pages et tests',items:[
    ['new','Mise en service','L’horaire annuel des classes, les présences, les examens, le calendrier scolaire et les dossiers des élèves et du personnel.','calendar'],
    ['up','Cartes de l’horaire plus lisibles','Une ligne pour le moment et le type, puis le module.','calendar'],
    ['up','Barre d’outils sur une seule ligne','Moins d’informations, les mêmes commandes.','calendar'],
    ['up','Bandeau de démonstration masquable','Un bouton le cache pour voir le site comme en service.',''],
    ['up','Retour à la classe cliquée','En revenant au calendrier de toutes les classes, on retrouve la ligne de la classe qu’on regardait.','calendar']
  ]}
];
const NV_TYPES={new:['ok','Nouveau'],up:['info','Amélioration'],fix:['warn','Correction']};
/* Ce qui a été vu : la clé du dernier push ouvert (date + numéro du push, car il y a souvent plusieurs pushes le même jour).
   Une ancienne valeur enregistrée est une date seule : tout ce jour-là compte comme vu. */
const nvKey=i=>NOUVEAUTES[i].date+'#'+String(NOUVEAUTES.length-i).padStart(3,'0');
const nvSeenKey=()=>{const s=S.nvSeen||'';return s&&!s.includes('#')?s+'#999':s;};
const nvLatest=()=>nvKey(0);
const nvUnseen=()=>NOUVEAUTES.reduce((n,v,i)=>n+(nvKey(i)>nvSeenKey()?v.items.length:0),0);
function newsPage(){
  const st=S.pg, f=NV_TYPES[st.nf]?st.nf:'', all=!!st.nall, byDate=st.nv==='date', N=NOUVEAUTES.length;
  if(st.since==null) st.since=nvSeenKey();
  // la pastille du menu disparaît dès qu’on a ouvert la page
  if(S.nvSeen!==nvLatest()){S.nvSeen=nvLatest();savePrefs();schedule();}
  const cnt={new:0,up:0,fix:0};let tot=0;for(const v of NOUVEAUTES)for(const it of v.items){cnt[it[0]]++;tot++;}
  const view=`<div class="seg" role="group" aria-label="Regrouper les changements">${[['','push','Par push'],['date','date','Par date']].map(([k,id,l])=>`<button type="button" id="nv-v-${id}" data-act="pg-set" data-k="nv" data-v="${k}" aria-pressed="${byDate===(k==='date')}">${l}</button>`).join('')}</div>`;
  const seg=`<div class="seg" role="group" aria-label="Filtrer">${[['','Tout',tot],['new','Nouvelles fonctions',cnt.new],['up','Améliorations',cnt.up],['fix','Corrections',cnt.fix]].map(([k,l,n])=>`<button type="button" id="nv-f-${k||'all'}" data-act="pg-set" data-k="nf" data-v="${k}" aria-pressed="${f===k}">${l} · ${n}</button>`).join('')}</div>`;
  const pages=new Set(NAV.admin.map(n=>n[0]));
  const row=([t,titre,texte,page])=>`<article class="nv-row"><span class="chip ${NV_TYPES[t][0]}">${NV_TYPES[t][1]}</span><div class="xm-t"><b>${esc(titre)}</b><small>${esc(texte)}</small></div><div class="xm-end">${page&&pages.has(page)&&page!=='nouveautes'?`<button class="btn sm" type="button" data-act="nav" data-page="${page}">Ouvrir</button>`:''}</div></article>`;
  /* Un bloc par push, ou un bloc par jour (les pushes du même jour réunis) */
  let groups;
  if(byDate){
    const m=new Map();
    NOUVEAUTES.forEach((v,i)=>{const g=m.get(v.date)||{date:v.date,items:[],n:0,fresh:false};g.items=g.items.concat(v.items);g.n++;if(nvKey(i)>st.since)g.fresh=true;m.set(v.date,g);});
    groups=[...m.values()];
  }else groups=NOUVEAUTES.map((v,i)=>({p:v,num:N-i,date:v.date,items:v.items,fresh:nvKey(i)>st.since}));
  /* avec un filtre, on garde seulement les blocs qui ont ce type de changement, puis on en montre les premiers */
  const vis=groups.map(g=>Object.assign({},g,{its:g.items.filter(it=>!f||it[0]===f)})).filter(g=>g.its.length);
  const lim=byDate?2:5, shown=all?vis:vis.slice(0,lim);
  const blocks=shown.map(g=>{
    const items=g.its;
    const d=parse(g.date), day=`${dayLabel(d)} ${d.getFullYear()}`, fresh=g.fresh?'<span class="chip exam">Depuis votre dernière visite</span>':'', n=`<span class="nv-n">${pl(items.length,'changement','changements')}</span>`;
    const link=g.p?(g.p.id?`<a href="${NV_REPO}/commit/${esc(g.p.id)}" target="_blank" rel="noopener" title="Voir ce push sur GitHub">${esc(g.p.id)}</a>`:`<a href="${NV_REPO}/commits/main" target="_blank" rel="noopener" title="Voir les pushes sur GitHub">le plus récent</a>`):'';
    const head=g.p?`<div class="xm-hd nv-hd nv-push"><span class="cl-num sm nv-num" title="Push n° ${g.num}">${g.num}</span><div class="nv-pt"><b>${esc(g.p.push)}</b><small>${esc(day)} · push ${link}</small></div>${fresh}${n}</div>`
      :`<div class="xm-hd nv-hd"><span>${esc(day)}</span>${g.n>1?`<span class="nv-k">${g.n} pushes</span>`:''}${fresh}${n}</div>`;
    return `<section class="cl-list nv-list" id="nv-${g.p?'p'+g.num:g.date}">${head}${items.map(row).join('')}</section>`;
  }).join('');
  const more=!all&&vis.length>lim?`<div class="row" style="margin-top:4px"><button class="btn" type="button" id="nv-more" data-act="pg-set" data-k="nall" data-v="1">${byDate?'Voir les jours précédents':`Voir les ${vis.length-lim} pushes précédents`}</button></div>`:'';
  return `<div class="toolbar">${view}${seg}</div>`+(blocks||'<section class="panel"><p class="help">Rien de ce type dans les dernières mises à jour.</p></section>')+more;
}

