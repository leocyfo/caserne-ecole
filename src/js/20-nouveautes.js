/* ---------- Nouveautés : ce qui a changé sur le site (administration) ----------
   Une entrée par PUSH (un envoi du site sur GitHub), le plus récent en premier :
   { date, id, push, items } — push : le titre du push ; id : son identifiant court sur GitHub. L’identifiant n’est connu
   qu’après l’envoi : on laisse '' pour le push en cours et on le remplit au push suivant.
   items : [type, titre, explication, page à ouvrir]. Types : new (nouvelle fonction), up (amélioration), fix (correction). */
const NV_REPO='https://github.com/leocyfo/caserne-ecole';
const NOUVEAUTES=[
  {date:'2026-11-08',id:'',push:'Version mobile ; le Stock et la Compta deviennent des options ; un site plus accessible et conforme aux normes du Web',items:[
    ['new','Onglets en bas sur téléphone','Sur un téléphone, le menu de gauche laisse la place à quatre onglets en bas de l’écran, choisis selon le rôle (administration : Accueil, Horaire, Classes, Élèves ; enseignant : Accueil, Horaire, Séances, Examens ; élève : Accueil, Horaire, Examens, Formation), et à « Plus ». Sur un ordinateur, rien ne change.','accueil'],
    ['new','Menu « Plus »','Le bouton « Plus » ouvre une feuille qui monte du bas : tout le menu en tuiles, regroupé par section, le profil, la recherche et la déconnexion. Un choix (ou un toucher à côté) la referme.',''],
    ['up','Sections en pastilles sur téléphone','Paramètres, Stock, Compta et Formation montrent leurs sections en pastilles qui défilent sous le titre ; la barre « Enregistrer » des paramètres reste au-dessus des onglets.','params'],
    ['up','Nouveau style sur téléphone','Police Barlow, gris charbon et jaune, fenêtres arrondies qui montent du bas avec une poignée, écran de connexion assorti.',''],
    ['up','Aperçu de l’espace élève sur téléphone','En aperçu (bouton « Élève » du bandeau), on choisit l’élève affiché, et sa classe suit ; un vrai compte élève n’a rien à choisir.',''],
    ['up','Horaire de l’élève sur téléphone','Le bloc « Prochains examens » est retiré de l’horaire : les examens sont dans l’onglet Examens.','calendar'],
    ['new','Options','Le Stock et la Compta sont maintenant des fichiers à part. Sans leur fichier, le site fonctionne sans eux : pas d’entrée dans le menu, pas d’intercalaire « Équipement », pas de « Mon compte ». Leurs données restent.',''],
    ['up','Tout au clavier','Un lien « Aller au contenu » paraît à la première pression de Tab et saute le menu. Chaque rangée qu’on clique est un vrai bouton, encadré quand on y arrive au clavier ; un tableau plus large que l’écran défile aux flèches.',''],
    ['up','Lecteurs d’écran','Le menu, l’en-tête, le contenu et le pied de page sont nommés comme tels ; les sigles ENPQ, EPI et ARI donnent leur sens au survol ; un point de couleur dit aussi « Urgent » ou « À surveiller » en toutes lettres.',''],
    ['up','Contraste et lisibilité','Les gris des petits textes sont un peu plus foncés : tout le texte atteint le contraste minimal recommandé (4,5 pour 1). Les longs paragraphes s’arrêtent à 75 caractères par ligne, plus faciles à lire.',''],
    ['up','Texte agrandi','Les tailles du texte suivent la taille de police choisie dans le navigateur.',''],
    ['up','Moins d’animations','Si l’appareil demande moins d’animations (réglage d’accessibilité du système), le site n’en fait plus aucune.',''],
    ['up','Titre de l’onglet','L’onglet du navigateur nomme la page ouverte (« Classes · PompierNote »), et la section dans Paramètres, Formation, Stock et Compta : plus clair dans les favoris et l’historique.',''],
    ['up','Menu des enseignants en groupes','Comme celui de l’administration, en trois groupes : Horaire, École, Compte.',''],
    ['new','Pied de page','En bas de chaque page : le nom de l’école, son téléphone, son courriel et son site, qu’on peut cliquer (Paramètres › École).','params'],
    ['fix','Messages en bas de l’écran','Un message reste affiché tant que la souris ou le clavier est dessus.',''],
    ['fix','HTML et CSS','Les styles sont dans l’en-tête de la page, comme le veut la norme HTML ; les marges écrites dans le code sont passées dans les feuilles de style ; les téléphones des fournisseurs s’appellent d’un clic.','']
  ]},
  {date:'2026-11-01',id:'21b6a63',push:'Page d’accueil ; fiche d’un élève en dossier et photo de profil ; logo et informations de l’Académie des pompiers ; styles triés',items:[
    ['new','Photo de profil','Les élèves et le personnel peuvent avoir une photo : l’administration clique sur la photo (ou sur les initiales) de la fiche, ou dans « Modifier », et choisit une image (sur un téléphone, l’appareil photo). L’image est recadrée en carré et allégée avant d’être gardée ; « Retirer la photo » remet les initiales. La photo paraît sur la fiche, dans la liste du personnel, les affectations et le menu (Mon profil).','eleves'],
    ['up','Fiche d’un élève en dossier','La fiche d’un élève ressemble à une chemise de dossier : des intercalaires en haut (Identité, Présences, Examens, Équipement, Documents, Suivi) et, dedans, une feuille. Sur « Identité » : la photo d’identité et les renseignements en formulaire (classe, grade, naissance, téléphone, courriel, contact d’urgence), puis la présence et le prochain examen. Nouvel intercalaire « Documents » : les pièces du dossier d’admission de l’Académie (certificat de naissance, diplôme, CV, permis, déclaration de santé, optométriste, carte d’embarcation), cochées quand elles sont reçues, avec la date. La fiche prend toute la largeur ; « Retour », « 3 sur 52 » et « Précédent / Suivant » sont dans l’en-tête de la page.','eleves'],
    ['fix','Menu du téléphone','Sur une page courte, la bande du menu en haut de l’écran ne s’étire plus : elle garde sa hauteur et le contenu prend le reste.',''],
    ['new','Page d’accueil','On y arrive en se connectant, et on y revient en cliquant sur le logo ou le nom du site (ou sur « Accueil », en tête du menu). À gauche, la journée en ligne du temps : l’heure, un point de la couleur du module, la carte de chaque séance avec l’état des présences, et un repère « Maintenant » (le prochain jour de classe s’il n’y a rien aujourd’hui) ; dessous, les chiffres du jour (séances, présences en retard, choses à faire). À droite, l’avancement de l’année scolaire (anneau, semaine en cours, programme), ce qui est à faire et les prochains examens. La page d’ouverture de l’administration se choisit dans Paramètres › Menu.','accueil'],
    ['new','Logo de l’Académie des pompiers','L’emblème de l’Académie paraît dans le menu, sur l’écran de connexion et dans l’onglet du navigateur ; le logo complet est en tête des feuilles imprimées (horaire, présences, relevés, factures). Il se retire dans Paramètres › Impression.','params'],
    ['new','Le programme sur les feuilles imprimées','Paramètres › École : le programme (ex. DEP 5322 – Intervention en sécurité incendie) paraît sous l’année scolaire, en tête des feuilles imprimées.','params'],
    ['up','Unités des compétences','Chaque module peut avoir ses unités : la page Modules en fait le total (79 unités pour les 25 compétences du DEP) et la fiche d’un module les affiche à côté des heures.','modules'],
    ['up','Carte d’embarcation de plaisance','Nouveau certificat suivi dans Formation › Certificats : la carte de conducteur d’embarcation de plaisance, à avoir en main à la rentrée.','formation'],
    ['up','Démo aux couleurs de l’Académie','Les données d’exemple reprennent le site et la brochure de l’Académie : coordonnées (9401, Côte des Saints, Mirabel ; 450 258-4460 ; info@academiedespompiers.ca), noms officiels des 25 compétences, frais d’admission (50 $), de sélection (200 $) et de scolarité (23 250 $ en deux versements), classes de théorie, plateaux pratiques et camions de la caserne-école.',''],
    ['up','Styles triés','Les fichiers de styles sont regroupés par sujet, chacun avec ses règles pour téléphone ; les règles mortes ou en double sont retirées. L’affichage ne change pas, sauf la recherche du menu, masquée maintenant sous 760 px comme le reste de l’affichage téléphone.','']
  ]},
  {date:'2026-11-01',id:'4b69dc5',push:'Formation : grilles pratiques, carnets, examens blancs, dossier ENPQ et accès des services incendie ; cartes plus légères et fenêtres taillées pour chaque liste',items:[
    ['new','Formation : grilles d’évaluation pratique','Une grille par manœuvre : ses étapes, ses points critiques, le seuil de réussite, le temps limite et le nombre d’essais. L’instructeur la remplit sur la tablette pendant l’exercice, avec un chronomètre. Un point critique manqué fait échouer l’essai ; l’évaluateur signe, l’élève aussi (sur place ou plus tard dans son carnet). Une grille peut exiger un autre évaluateur au deuxième essai.','formation'],
    ['new','Réussite en groupe','Cochez des élèves dans « Évaluations » pour leur inscrire une réussite d’un coup, toutes les étapes cochées, avec la signature de l’évaluateur.','formation'],
    ['new','Carnets de compétences','Pour chaque classe, un tableau élèves × grilles : réussie, à reprendre, essais épuisés ou pas évaluée. L’élève voit son propre carnet, signe ses évaluations et sait s’il est prêt pour l’examen de l’ENPQ. Option dans Réglages : un niveau de maîtrise de 1 à 4.','formation'],
    ['new','Préalables et certificats','Un module peut exiger des grilles réussies, d’autres modules et un certificat valide (premiers soins, essai d’ajustement du masque…). Les élèves à qui il manque quelque chose sont signalés avant leurs séances, dans la feuille de présences et dans la cloche. Les certificats ont leur date d’expiration et une alerte avant.','formation'],
    ['new','Dossier ENPQ','Les conditions d’admission à l’examen de qualification de l’ENPQ pour chaque élève, la liste de ce qui manque, l’export des candidats prêts, l’ajout des frais d’examen au compte des élèves (grille tarifaire 2026, réglable) et la date d’inscription.','formation'],
    ['new','Banque de questions et examens blancs','Des questions à choix multiples par module (ajout, import d’une liste collée d’Excel). Un examen blanc tire au hasard des questions des modules choisis ; l’élève le fait en ligne, chronométré, et voit la correction avec les explications. Les questions les plus ratées sont mises en avant. « S’entraîner » propose dix questions avec la réponse tout de suite.','formation'],
    ['new','Relevé de formation','Pour chaque élève : les heures suivies par module, les évaluations pratiques et leurs signatures, les examens, les certificats et le dossier ENPQ, à imprimer.','formation'],
    ['new','Accès des services incendie','Un nouveau rôle de compte, « Service incendie » : la ville ou le service qui envoie des recrues voit seulement leur présence, leurs résultats, leur carnet, leur dossier ENPQ et ses propres factures. Les services se gèrent dans Formation › Services incendie.','formation'],
    ['new','Présence par code QR','Dans la feuille de présences, « Présence par code QR » affiche un code pour la séance. L’élève le scanne avec son téléphone, ou le tape dans « Présence » (à côté de la cloche) ; l’enseignant voit qui a scanné et les marque présents d’un clic.','classes'],
    ['new','Hors ligne sur le terrain','Le site se garde sur l’appareil : sans réseau, il s’ouvre quand même, un avis « Hors ligne » paraît en haut, et les présences, évaluations et autres modifications sont gardées puis envoyées au retour du réseau (avec la vraie base Firebase).',''],
    ['new','Proposer des enseignants','Dans Affectations, « Proposer des enseignants » trouve un enseignant pour chaque place à combler : compétences, congés et autres séances respectés, disponibilités d’abord, heures équilibrées. On décoche ce qu’on ne veut pas, puis on attribue tout d’un coup. La fenêtre d’une séance propose aussi les trois meilleurs.','affectations'],
    ['new','Recherche Ctrl+K','Le bouton « Rechercher » sous le logo (ou Ctrl+K) : une seule boîte pour aller à une page, trouver un élève, un membre du personnel, une classe, un module, un article du stock, et lancer une action (nouvelle séance, nouvelle grille, proposer des enseignants…).',''],
    ['new','Vues enregistrées','Sur les pages de listes, l’épingle à côté de la cloche garde les filtres, le tri et l’affichage sous un nom ; la vue revient d’un clic, en onglet au-dessus de la liste.','eleves'],
    ['new','Modification sur place','Le crayon dans les listes d’élèves et du personnel change le téléphone ou le statut sans ouvrir la fiche : Entrée enregistre, Échap annule.','eleves'],
    ['up','Démo du stock refaite à partir des fiches','Chaque article de la démo reprend sa fiche d’objet (nom, catégorie, fournisseur, prix, durée de vie) et un code numéroté comme « Ajouter » le ferait. Quand les données d’exemple changent, la démo repart de ces nouvelles données au prochain chargement, sans déconnecter.','stock'],
    ['up','Fenêtres taillées pour chaque liste','Chaque liste ouvre toujours la même fenêtre, avec la forme, la taille et la place qui conviennent à ce qu’elle montre : une bulle collée au cours cliqué (élève) ou sous la cloche ; un panneau à droite quand la liste doit rester visible (présences, cours, personnel, article du stock, compte d’un élève) ; une fenêtre au centre pour un formulaire (élève, examen, question, examen blanc, facture) ; une grande feuille pour les tableaux et les longues listes à cocher (évaluation pratique, services incendie, commandes, propositions d’enseignants) ; une bande en bas pour déplacer une séance, la semaine restant visible. Les cases à cocher se placent sur plusieurs colonnes quand la place le permet. Sur téléphone, les fenêtres montent du bas.',''],
    ['up','Fenêtre d’une question plus claire','Chaque choix de réponse est une carte avec sa lettre ; la bonne réponse ressort en vert pâle avec l’étiquette « Bonne réponse », l’explication est sur un fond bleu pâle, et le taux de bonnes réponses des examens blancs paraît en haut.','formation'],
    ['up','Cartes plus légères partout','En affichage Cartes (Affectations, Classes, Modules, Examens, Stock), plus de titres en majuscules au-dessus de chaque valeur : un petit libellé devant la valeur (« Enseignants 1 / 2 », « Théorie 27 h »), les valeurs à la suite, les grands chiffres en taille de texte. Le moment (« Toute la journée ») se lit sans libellé. Même chose pour les cartes des classes sur petit écran.','affectations'],
    ['up','Cartes du Stock','L’inventaire, les mouvements, les échéances d’inspection et les achats n’ont aucun libellé : l’état, le type de mouvement et l’auteur tiennent sur une ligne sous l’article, et le code (CAS-001) ne se coupe plus. Le bouton « Ajouter » des fiches d’objets est plus discret.','stock'],
    ['up','Menu du Stock plus court','13 entrées au lieu de 19, sans libellé sur deux lignes. Les catégories (EPI, ARI, Matériel, Consommables) deviennent des onglets en haut de l’Inventaire ; À commander, Commandes et Fournisseurs, des onglets d’Achats. Le Comptage passe dans la section Inventaire.','stock']
  ]},
  {date:'2026-10-31',id:'c7103b7',push:'Stock : fiches d’objets, codes QR, emplacements, inspections, kits, achats, réparations et comptage',items:[
    ['new','Fiches d’objets','Une fiche par objet (Casque, Habit de combat, Émulseur…) : catégorie, préfixe des codes, tailles, inspection, prix, fournisseur. « Ajouter » ne demande que le nombre, la taille et l’emplacement : les codes se numérotent tout seuls. « Créer les fiches » regroupe les articles qui n’en ont pas.','stock'],
    ['new','Codes QR','Des étiquettes à imprimer ; scannée avec l’appareil photo du téléphone, une étiquette ouvre l’article. Le scanner du site (caméra ou code tapé) fait les sorties et les retours groupés.','stock'],
    ['new','Emplacements','Un arbre (bâtiment, local, étagère, camion), la vue « Par emplacement » avec tout ce qu’il contient, et les transferts.','stock'],
    ['new','Import et actions en lot','Une liste d’Excel s’importe ; des cases à cocher pour déplacer, changer l’état, inspecter ou étiqueter plusieurs articles d’un coup.','stock'],
    ['new','Inspections avec listes de contrôle','Chaque point se coche ; un point non conforme envoie l’article à réparer. Tournée d’inspection par emplacement et rapport imprimable ; remplissages des bouteilles, nettoyages et expositions au feu des EPI.','stock'],
    ['new','Kit d’aspirant et tailles','Les tailles de chaque élève, puis « Équiper la classe » : une pièce de chaque, à la bonne taille, et ce qui manque. Feuille signée ; une pièce perdue ou brisée peut être facturée à l’élève.','stock'],
    ['new','Préparation des séances','Les consommables prévus par module, la liste de préparation d’une journée, « Tout sortir », et les retours en retard (dans la cloche de l’instructeur responsable).','stock'],
    ['new','Achats','« À commander » selon le seuil, les séances à venir et les péremptions ; bons de commande par fournisseur, réception partielle (stock et dépense dans la Compta) ; carnet des fournisseurs.','stock'],
    ['new','Réparations et comptage','Bons de travail (réparateur, retour prévu, coût vers la Compta) ; comptage d’inventaire par emplacement, avec les écarts ajustés à la fin.','stock'],
    ['new','Rapports du stock','Valeur à neuf et après usure, articles les plus sortis, bris, coûts de réparation, exports et inventaire imprimable par emplacement.','stock'],
    ['fix','Tests sur GitHub','La grande page de tests a plus de temps pour finir sur les machines de GitHub.','']
  ]},
  {date:'2026-10-31',id:'40868df',push:'PompierNote v2 : stock, compta, annonces, paramètres et clôture de l’année',items:[
    ['new','Stock','Un menu à sections remplace le menu de gauche : tableau de bord, inventaire par catégorie (EPI, ARI et air comprimé, matériel, consommables), dotations, mouvements, inspections et réglages. Chaque article a son état (pastille verte, orange ou rouge), son emplacement et son historique.','stock'],
    ['new','Sorties, retours et bris','On sort du matériel pour une manœuvre (séance, instructeur), on le rentre avec un contrôle (nettoyé, intact) ; endommagé, il part en maintenance. On déclare un bris, on remet en service, on retire du service.','stock'],
    ['new','Inspections et épreuves','Les inspections, l’épreuve hydraulique des bouteilles d’ARI et la fin de vie se calculent selon la catégorie (réglable). Ce qui est en retard ou proche est signalé, dans le menu et dans la cloche.','stock'],
    ['new','Dotations','L’équipement remis à chaque élève (ou à la classe), la feuille de dotation à signer, et « Tout reprendre » en fin de cohorte. La fiche de l’élève a un onglet Équipement.','stock'],
    ['new','Consommables','Consommer (jamais plus que le stock), réapprovisionner, ajuster. Sous le seuil, l’alerte paraît ; un réapprovisionnement avec un coût devient une dépense dans la Compta.','stock'],
    ['new','Matériel réservable','Un camion ou un lot d’ARI marqué « réservable » s’ajoute aux locaux et équipements des séances : deux séances qui le veulent au même moment sont en conflit.','stock'],
    ['new','Compta','Un menu à sections : tableau de bord, frais des élèves, factures, paiements reçus, paie des instructeurs, achats et dépenses, budget, rapports et réglages. Montants en dollars, exports CSV pour le comptable.','compta'],
    ['new','Frais des élèves','Des tarifs par classe, payables par échéances. Pour chaque élève : dû, payé, réductions, solde et retard ; paiement, reçu et relevé de compte à imprimer.','compta'],
    ['new','Factures','Numérotées, avec TPS et TVQ au besoin ; brouillon, envoyée, en retard, payée ou annulée ; paiements et impression.','compta'],
    ['new','Paie des instructeurs','Calculée avec les heures réellement données dans le mois, au taux de chaque instructeur (ou selon la théorie ou la pratique). On approuve chaque relevé, puis on le marque payé.','compta'],
    ['new','Budget et rapports','Le prévu par poste comparé au réel, avec une alerte de dépassement ; revenus et dépenses par mois, coût par élève, coût d’une heure d’instruction et coût par module.','compta'],
    ['new','Annonces','Un bandeau en haut des pages : plusieurs annonces, pour tout le monde, les enseignants, les élèves ou des classes précises ; information, importante ou urgente ; programmée, épinglée, avec un bouton et un lien ; modèles et aperçu. Elles paraissent aussi dans la cloche.','params'],
    ['new','Clôturer l’année','Paramètres → Année scolaire : l’année est copiée dans une archive, puis on commence la suivante. Une année archivée se consulte en lecture seule avec tout le site, s’exporte ou se supprime.','params'],
    ['new','Paramètres refaits','Douze sections dans le menu de gauche, sur toute la largeur : école, annonces, année, horaire (heures des moments), résultats et présences, grades des élèves, fonctions du personnel, droits, menu et affichage (couleur, noms des entrées), notifications, impression et données.','params'],
    ['new','Droits et accès','Ce que les enseignants peuvent faire eux-mêmes (postuler, remplacement, présences, résultats, approbation automatique) et ce que chacun voit de lui-même.','params'],
    ['new','Mon profil','L’élève y voit son équipement et son compte ; l’enseignant, ses relevés de paie. Chacun ne lit que ses propres données.',''],
    ['up','Menu regroupé','Calendrier et calendrier scolaire, élèves et personnel, modules et examens sont réunis ; une bulle rouge glisse jusqu’à la page ouverte.','calendar'],
    ['up','En-têtes et affichages','Chaque page a son titre et ses outils sur une ligne (deux au plus) ; les listes s’affichent en Liste, Cartes ou Compact.','eleves'],
    ['up','Élèves','Cartes colorées selon le grade, filtres (grade, notes) et tris (nom de famille, classe, grade, note, présence).','eleves']
  ]},
  {date:'2026-10-30',id:'a0d7946',push:'Calendrier : le titre et la barre de l’horaire sur une seule ligne',items:[
    ['up','Une seule ligne','Le titre, la semaine, Semaine/Jour, Classes/Enseignants, les présences en retard, « Ajouter », l’impression et la cloche tiennent sur une seule ligne en haut du calendrier. L’horaire commence une bande plus haut.','calendar'],
    ['up','Libellés courts','Sur un écran de moins de 1 680 px de large : « 15 en retard » et « Ajouter ». Le texte complet reste dans l’info-bulle. Sous 1 180 px, la barre passe sous le titre.','calendar'],
    ['fix','Cloche','Ouvrir la cloche ne fait plus disparaître la barre de l’horaire.','']
  ]},
  {date:'2026-10-30',id:'19f19d2',push:'Style compact : plus d’information à l’écran',items:[
    ['up','Style compact','Tout est resserré : menu plus étroit, barre de titre plus basse, marges, boutons, champs, tableaux et cartes plus petits. On voit plus de séances, de lignes et de chiffres sans faire défiler.',''],
    ['up','Horaire','La barre de l’horaire tient sur une seule ligne sur un écran d’ordinateur, et les cartes des séances prennent moins de place.','calendar'],
    ['up','Téléphone','Les boutons des présences gardent leur taille pour le doigt, les champs leurs 16 px, et aucun texte ne descend sous 12 px.','']
  ]},
  {date:'2026-10-30',id:'ebeb412',push:'Stock : équipement prêté, matériel et inspections, consommables, ventes',items:[
    ['new','Stock','Un nouveau menu pour l’administration, dans la section Ressources. Quatre tuiles : l’équipement prêté, le matériel, les consommables, les uniformes et ventes.','stock'],
    ['new','Équipement prêté aux élèves','Chaque pièce (habit de combat, casque, gants…) a son numéro, sa taille et son état. On la prête à un élève, puis on note son état au retour.','stock'],
    ['new','Matériel et inspections','Pour chaque APRIA, boyau, lance ou échelle : tous les combien de jours l’inspecter. Les inspections à faire et en retard sont signalées ; une inspection non conforme met le matériel hors service.','stock'],
    ['new','Consommables','Entrées et sorties, et un seuil : sous le seuil, l’article passe « À commander ». On ne peut pas sortir plus que ce qui reste.','stock'],
    ['new','Uniformes et ventes','Le prix et la quantité de chaque taille. « Vendre » enregistre l’élève, la taille et le montant ; l’onglet Ventes donne le total du mois.','stock'],
    ['new','Historique de chaque article','La fenêtre d’un article montre tous ses mouvements : prêts, retours, inspections, entrées, sorties, ventes. Ils s’inscrivent aussi dans l’Historique, sous « Stock ».','historique'],
    ['up','Cloche','L’administration y voit les consommables à commander, les inspections en retard et l’équipement à réparer ou hors service.',''],
    ['up','Fiche de l’élève','L’équipement qui lui est prêté et ses achats. L’élève voit son équipement dans « Mon profil ».','eleves']
  ]},
  {date:'2026-10-30',id:'0b1d168',push:'PompierNote v2 : nouveau nom et nouveau style',items:[
    ['new','PompierNote','Le site s’appelle maintenant PompierNote : c’est la version 2 de Caserne-École. Les données et les pages restent les mêmes.',''],
    ['up','Nouveau style','Menu marine plus net, barre de titre blanche en haut de chaque page, cartes blanches à coins arrondis avec une ombre légère, un seul rouge pour les actions et une police plus lisible (Inter).',''],
    ['up','Menu en sections','Le menu de l’administration est regroupé en trois sections : Horaire, École et Administration.',''],
    ['up','Écran de connexion','Aux couleurs et au nom de PompierNote.','']
  ]},
  {date:'2026-10-14',id:'dd2e054',push:'Téléphone : Élèves, Personnel et Comptes en liste',items:[
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
  const more=!all&&vis.length>lim?`<div class="row u-mt4"><button class="btn" type="button" id="nv-more" data-act="pg-set" data-k="nall" data-v="1">${byDate?'Voir les jours précédents':`Voir les ${vis.length-lim} pushes précédents`}</button></div>`:'';
  return `<div class="toolbar">${view}${seg}</div>`+(blocks||'<section class="panel"><p class="help">Rien de ce type dans les dernières mises à jour.</p></section>')+more;
}

