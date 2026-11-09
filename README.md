# PompierNote

PompierNote est la version 2 de Caserne-École. Le site de gestion scolaire de l’Académie des pompiers : calendrier des classes, modules et cours, affectation des enseignants, élèves, personnel, présences, examens, calendrier scolaire, stock du matériel, compta, annonces, comptes et profils. Trois rôles : **Administrateur**, **Enseignant**, **Élève**.

## Le site

- **`index.html`** : le site, avec connexion. On se connecte avec son courriel et son mot de passe. Pour avoir un compte, on clique **Demander un compte** ; l’administration approuve la demande dans le menu **Comptes**, en choisissant le rôle et la fiche de la personne.
- **`demo.html`** : la démo, avec le même écran de connexion. Quatre comptes de démo (mot de passe `demo123`) : `admin@demo.ca`, `marie.leduc@demo.ca` (enseignante), `alexandre.beaulieu@demo.ca` (élève) et `vincent.tremblay@demo.ca` (instructeur qui postule aux journées de cours). On peut aussi demander un compte, puis l’approuver avec le compte Administration. Les comptes et les données (classes 119 à 123, horaire 2026–2027) restent dans le navigateur de chaque visiteur ; **Réinitialiser la démo** remet tout à zéro. Quand une nouvelle version change les données d’exemple (`tests/seed-academy.json`), la démo repart de ces données au chargement suivant.

Tant que Firebase n’est pas configuré (`config.js` vide), `index.html` renvoie vers la démo.

## Nouveautés

Le menu **Nouveautés** (administration, sous Paramètres) liste les nouvelles fonctions, les améliorations et les corrections du site, regroupées **par push** (chaque envoi sur GitHub a son bloc : numéro, titre, date, identifiant avec un lien vers GitHub) ou **par date**.

La liste est dans `src/js/20-nouveautes.js` (constante `NOUVEAUTES`). À chaque push, on ajoute un bloc en haut : `{ date, id: '', push: 'titre du push', items: [...] }`, et on remplit l’`id` du bloc précédent avec l’identifiant court de son push (connu seulement après l’envoi).

## Vocabulaire

- **Module** : une unité du programme (M7 Autopompe), avec son numéro, son nom, ses heures de théorie et de pratique et son chargé de cours.
- **Cours** : ce qui compose un module (7.1, 7.2…). Un cours a un numéro, un type (théorie, pratique, simulation, visite, stage) et un nombre d’enseignants requis. Il vaut pour toutes les classes.
- **Examen** : un examen du module, théorique ou pratique, avec son nom. Il vaut aussi pour toutes les classes.
- **Séance** : un cours ou un examen donné à une classe, à une date (avant-midi, après-midi ou toute la journée). Une séance peut couvrir plusieurs cours (8.1 et 8.2).
- **Activité** : une journée qui n’appartient à aucun module (Accueil, Graduation). Aucun enseignant n’est requis par défaut et les présences ne sont pas attendues.
- **Chargé de cours** : l’enseignant d’un module. Il donne ses séances à toutes les classes. **Enseignant principal** : le responsable d’une classe. **Instructeur** : un enseignant à la journée, qui postule aux séances.

On ajoute une séance avec le même formulaire partout (calendrier, classe, module, examens) : on coche les cours ou l’examen du module qu’elle donne.

Règles : le numéro d’un module est unique ; un module qui a des cours ne peut pas être supprimé ; un cours ou un examen déjà à l’horaire d’une classe ne peut pas être retiré du module. Le même module donné à deux classes au même moment n’est pas compté comme un conflit pour son enseignant.

Une école sans modules garde l’ancien fonctionnement (un cours et ses périodes de la semaine) et le mot « cours ».

## Examens et résultats

Les résultats ne sont pas dans les fiches d’examen : `resultats/<examen>` contient ceux de toute la classe (personnel seulement) et `resultats-eleves/<élève__examen>` celui d’un élève (lui-même et le personnel). Un élève ne peut donc lire que ses propres résultats.

**Journées de reprise** (Examens → Reprises à faire) : on crée d’abord la journée (une séance « Reprise » à l’horaire des classes choisies), puis on y ajoute des modules (`modules` sur cette séance). Chaque élève qui a échoué ou manqué un examen d’un de ces modules le reprend ce jour-là, une reprise par examen échoué ; la liste se déduit des résultats. Une reprise réussie donne le résultat `reprise` (réussi en reprise), une reprise ratée `echecf` (échec du module). `resultats/<examen>.reprises` garde, par élève, la date, l’issue, le premier résultat et la note de la reprise.

Une note en % est facultative (`pct` dans les deux documents). Elle inscrit le résultat : réussi à partir du seuil réglé dans Paramètres (`config/ecole.seuil`, 60 au départ).

## Affectation des enseignants

- **Modules** (administration) : le catalogue du programme. La fiche d’un module a quatre onglets : *Cours* (numéro, type, enseignants requis), *Examens* (type, nom), *Séances* (les dates, classe par classe) et *Réglages* (nom, heures, chargé de cours).
- **Enseignants requis** : le nombre se règle sur chaque cours du module et vaut pour toutes les classes. Une séance qui couvre plusieurs cours prend le plus grand. Le chargé de cours du module compte parmi eux ; les autres places sont à combler. Pour un examen, une reprise ou une activité, le nombre se règle dans la fenêtre de la séance.
- **Enseignants** : *Disponibilités* (les jours où ils peuvent donner des cours) et *Mes séances* (séances à pourvoir selon leurs disponibilités et leurs compétences, candidatures en attente, séances attribuées, séances données, demande de remplacement).
- **Affectations** (administration) : séances à combler, candidatures à approuver ou refuser, demandes de remplacement, et pour chaque séance le nombre d’enseignants attribués sur le nombre requis. Les compétences de chaque enseignant se cochent dans son dossier (Personnel).

Données : `candidatures/<séance__enseignant>` (statut `attente`, `approuve`, `refuse` ou `retire`), `remplacements/<séance__enseignant>`, `disponibilites/<enseignant>` (jours `J`, `AM` ou `PM`), `enseignants/<id>.competences` (numéros de modules) et, dans `config/ecole.competences`, pour chaque module : `heuresT`, `heuresP`, `charge` (le chargé de cours), `cours` (`{ id, num, type, requis }`) et `examens` (`{ id, type, nom }`, type `t` ou `p`).

Chaque classe a un document `cours/<id>` par module (sigle `M7`). Ses séances sont dans `seances`, une entrée par séance : `{ date, debut, fin, minutes, tags, label, cours: [ids], examens: [ids] }`. Chaque séance s’écrit à part (`update` qui fusionne), pour que deux personnes ne s’écrasent pas. L’ancien tableau `extras` est encore lu. L’identifiant d’une séance ne change jamais : les présences, les résultats et les candidatures s’y rattachent. Les règles de `firestore.rules` laissent un enseignant écrire seulement ses propres candidatures (en attente), demandes de remplacement et disponibilités.

## Heures, impression, notifications, historique

- **Heures enseignées** (Personnel → Heures) : les heures données par chaque enseignant, mois par mois, et un export CSV pour la paie (sommaire par enseignant, puis détail séance par séance). Une séance annulée ou un enseignant marqué absent ne compte pas.
- **Impression** : le bouton d’impression du calendrier (ou « Imprimer » dans la fiche d’une classe) prépare l’horaire de la semaine ou la feuille de présences ; l’onglet Examens d’un élève imprime son relevé de résultats. La fenêtre d’impression du navigateur enregistre aussi en PDF. Si elle ne peut pas s’ouvrir (page intégrée dans une autre), la feuille est remise en fichier.
- **Notifications** (la cloche) : rien de plus n’est enregistré, la liste se déduit des données que la personne lit déjà (candidatures, remplacements, séances annulées). Ce qui a été vu est noté dans le navigateur. Le courriel demandera un serveur (Firebase).
- **Historique** (administration) : chaque séance annulée, rétablie, déplacée, ajoutée ou supprimée, chaque candidature, approbation, attribution ou retrait, et chaque changement de module y est inscrit avec le nom de la personne et l’heure.

- **Locaux et équipements** : la liste (salles, camions, tour, bassin) se tient dans Paramètres. Dans l’onglet Cours d’un module, on choisit ce que chaque cours demande, pour toutes les classes ; la fenêtre d’une séance permet de le changer pour elle seule. Deux séances au même moment qui veulent le même local ou équipement sont en conflit, sauf si c’est le même module.
- **Import** : la fiche d’une classe inscrit des élèves depuis un fichier CSV ou une liste collée d’Excel (numéro, nom, courriel, téléphone), et son onglet Modules copie l’horaire d’une autre classe à partir d’une date, en sautant les fins de semaine et les congés.

Données : `config/ecole.ressources` (`{ id, nom, type }`, type `local` ou `equip`), `cours[].ress` dans un module et `ress` sur une séance (listes d’identifiants), `journal/<AAAA-MM>` (un document par mois, une entrée par action dans `ev` : `{ le, par, role, cat, txt, obj, seance, date, groupe }`) et `cours/<id>.annule` (`{ "date@séance": { le, par } }` pour chaque séance annulée).

## Options : Stock et Compta

Le Stock et la Compta sont des **options** : chacune est un fichier à part (`options/stock.js`, `options/compta.js`). **Le fichier est là, l’option s’affiche ; pas de fichier, le site fonctionne sans elle** : pas d’entrée dans le menu, pas d’intercalaire « Équipement » dans le dossier d’un élève, pas de « Mon compte » ni de « Ma paie » dans le profil, pas de frais dans le dossier ENPQ ni de factures dans le rapport d’un service. Le Stock sans la Compta n’inscrit simplement pas de dépenses. Enlever un fichier ne supprime aucune donnée.

```
node outils/options.js               l’état de chaque option
node outils/options.js stock on      met le fichier
node outils/options.js stock off     l’enlève
```

Le hub fait la même chose (Projet › PompierNote). `node outils/construire.js` ne reconstruit que les fichiers présents ; le changement part sur GitHub avec le prochain envoi.

Le code est dans `src/options/<nom>/` et son branchement sur le site dans le dernier fichier de ce dossier (`addOption`). `src/js/02-options.js` décrit ce qu’une option peut fournir.

## Stock, compta, annonces, clôture de l’année

Paramètres, Stock et Compta ont un **menu à sections** : en les ouvrant, le menu de gauche montre leurs sections ; l’entrée en tête ramène au menu, sur la page d’avant.

- **Stock** (administration ; « Matériel » pour les enseignants) : inventaire par catégorie (EPI, ARI et air comprimé, matériel, consommables), articles suivis à l’unité (numéro de série, état, inspections, épreuve hydraulique des bouteilles, fin de vie) ou en quantité (seuil d’alerte). Sorties pour une manœuvre et retours avec contrôle, bris, maintenance, dotations aux élèves ou à la classe (feuille à signer, reprise en fin de cohorte), journal des mouvements, échéances d’inspection. Le matériel « réservable » s’ajoute aux locaux et équipements des séances. **Fiches d’objets** : une fiche par objet (préfixe des codes, tailles, inspection, prix) ; « Ajouter » crée les exemplaires numérotés. Aussi : étiquettes QR (l’adresse du site suivie de `#stk=<id>` ouvre l’article), scanner et sorties groupées, arbre des emplacements, import CSV, actions en lot, listes de contrôle d’inspection, kit d’aspirant aux tailles des élèves, préparation des séances, bons de commande et fournisseurs, réparations, comptage d’inventaire et rapports.
- **Compta** (administration) : frais des élèves (tarifs par classe, échéances, paiements, réductions, reçus), factures (numérotées, taxes au besoin), paiements reçus, paie des instructeurs (heures réellement données × taux, relevés approuvés puis payés), achats et dépenses, budget par poste, rapports (par mois, coût par élève, coût par module) et exports CSV. Montants en cents dans la base.
- **Annonces** (Paramètres → Annonces) : un bandeau en haut des pages, pour tout le monde, un rôle ou des classes ; importance, dates, épinglage, bouton avec lien ; aussi dans la cloche.
- **Clôture de l’année** (Paramètres → Année scolaire) : l’année est copiée dans `archives` (le résumé) et `archives-parts` (le contenu en morceaux), puis l’horaire, les présences, les examens, la compta et les mouvements du stock de l’année sont retirés. Une archive se consulte avec tout le site, en lecture seule.
- **Profil** : l’élève voit son équipement et son compte, l’enseignant ses relevés de paie (réglable dans Droits et accès). Ils ne lisent que leurs propres documents.

Données : `stock` (`aId` : l’élève ou la classe à qui l’article est attribué ; `modele` : sa fiche), `stock-mvt`, `stock-modeles` (fiches d’objets), `stock-fourn`, `stock-cmd`, `stock-rep`, `stock-cpt`, `compta` (écritures `rev`, `dep`, `red`), `compta-factures`, `compta-paie` (`<mois>_<enseignant>`), `compta-reglages/ecole` (taxes, taux, budget ; administration seulement), `config/ecole.tarifs`, `config/ecole.stock`, `config/ecole.annonces`, `archives`, `archives-parts`.

## Formation, services incendie, confort

**Formation** (menu à sections ; « Évaluations » pour les enseignants, « Ma formation » pour les élèves) :

- **Grilles pratiques** : une grille par manœuvre (étapes, points critiques, seuil, temps limite, essais, autre évaluateur au deuxième essai, exigée ou non pour l’ENPQ). L’instructeur la remplit sur la tablette avec un chronomètre ; un point critique manqué fait échouer l’essai. L’évaluateur signe ; l’élève signe sur place ou plus tard dans son carnet. **Réussite en groupe** pour plusieurs élèves d’un coup.
- **Carnets** : élèves × grilles pour chaque classe ; l’élève voit le sien. Option : niveau de maîtrise de 1 à 4.
- **Préalables** par module (grilles, modules, certificats valides) : avertissement dans la feuille de présences et dans la cloche. **Certificats** avec date d’expiration et alerte.
- **Dossier ENPQ** : conditions d’admission, ce qui manque, export des candidats prêts, frais d’examen ajoutés au compte (Compta), date d’inscription. **Relevé de formation** à imprimer.
- **Banque de questions** (ajout, import d’une liste collée) et **examens blancs** en ligne, chronométrés, corrigés tout de suite ; questions les plus ratées ; « S’entraîner ».

**Services incendie** : rôle de compte « Service incendie » ; le service ne lit que son rapport (`rapports-service/<id>`, écrit par l’administration) : présence, résultats, carnet et dossier de ses recrues, ses factures.

**Hors ligne** : `sw.js` garde le site sur l’appareil (installé par `site/connexion.js`, pas dans claude.ai) ; la base Firestore garde ses données sur l’appareil (`site/firebase.js`) ; sans réseau, un avis s’affiche et les écritures n’attendent pas le serveur : elles partent au retour du réseau.

**Confort** : présence par **code QR** (feuille de présences ; l’élève scanne ou tape le code), **proposer des enseignants** (Affectations), recherche **Ctrl+K** (bouton sous le logo), **vues enregistrées** (épingle à côté de la cloche), **modification sur place** (crayon dans les listes d’élèves et du personnel).

Données : `grilles`, `evaluations`, `certificats/<élève>`, `dossiers-enpq/<élève>`, `questions`, `ex-blancs`, `ex-tentatives`, `presences-qr`, `rapports-service` ; réglages dans `config/ecole.formation` (certificats, préalables, pièces, frais, niveaux, services) ; `eleves.service`. Les règles de `firestore.rules` sont à jour.

**Accueil et photos** : on arrive sur l’**Accueil** en se connectant, et on y revient en cliquant sur le logo (`src/js/06-accueil.js`, `src/styles/07-accueil.css`) : la journée en ligne du temps, l’année scolaire, ce qui est à faire, les prochains examens. **Photo de profil** des élèves et du personnel : champ `photo` de `eleves/<id>` et `enseignants/<id>` (image JPEG carrée de 240 px, recadrée et allégée dans le navigateur, une quinzaine de Ko) ; seule l’administration la change. **Dossier de l’élève** : la fiche est une chemise à intercalaires ; les pièces d’admission reçues sont dans `eleves/<id>.docs` ({ clé : date de réception, vide si décochée }).

## Normes du Web et accessibilité

Le site suit les règles du cours IFT1005 (Design et développement Web) et les principes WCAG (perceptible, utilisable, compréhensible, robuste) :

- **HTML** : `<nav>` pour le menu, `<header>` pour la barre du titre, `<main>` pour le contenu, `<footer>` pour le pied de page (coordonnées de l’école, liens `tel:` et `mailto:`) ; les styles et les polices sont dans le `<head>` ; le titre de l’onglet nomme la page ouverte ; les sigles du métier passent par `abbr()` (`<abbr title>`).
- **Clavier** : le lien « Aller au contenu » paraît au premier Tab ; une rangée qu’on clique est un bouton (`xRow`, `rowOpen`) : si elle contient déjà des boutons, un bouton invisible à part l’ouvre, pour ne jamais mettre un contrôle dans un autre ; un tableau large qui défile prend le focus (`scrollKeys`).
- **CSS** : tailles de texte en `rem` (elles suivent la taille choisie dans le navigateur) ; pas de `style="…"` fixe dans le code (classes de `20-utilitaires.css`) ; `!important` seulement pour `[hidden]`, « moins d’animations », le glisser-déposer, l’impression et la coquille du téléphone.
- **Couleurs** : tout le texte atteint le contraste AA (4,5 pour 1) ; une information n’est jamais donnée par la couleur seule (texte caché pour les lecteurs d’écran) ; avec « moins d’animations » dans le système, aucune animation.
- **Lecture** : 75 caractères au plus par ligne dans les paragraphes ; pas de défilement horizontal sur téléphone.

`tests/steps.js` vérifie une partie de ces règles (vérifications « ift1005 »).

## Essayer le site sur cet ordinateur

Double-cliquez **`Lancer le site local.cmd`** (il faut Node.js) : le site s’ouvre à http://localhost:8080/demo.html. Fermez la fenêtre noire pour l’arrêter.

## Mettre la connexion en service (Firebase, gratuit)

1. Sur [console.firebase.google.com](https://console.firebase.google.com), **Ajouter un projet** (par exemple `caserne-ecole`). Google Analytics n’est pas nécessaire.
2. **Authentication** → **Commencer** → **Adresse e-mail/Mot de passe** → activer → **Enregistrer**.
3. **Authentication** → **Paramètres** → **Domaines autorisés** → **Ajouter un domaine** : `leocyfo.github.io`.
4. **Firestore Database** → **Créer une base de données** → mode **production** → région `northamerica-northeast1 (Montréal)`.
5. **Firestore Database** → **Règles** : remplacer le contenu par celui de [`firestore.rules`](firestore.rules) → **Publier**.
6. **Paramètres du projet** (roue dentée) → **Vos applications** → icône **</>** (Web) → donner un nom → copier le bloc `firebaseConfig` dans [`config.js`](config.js).
7. Ouvrir le site : l’écran **Première installation** crée le compte de l’administration. Ensuite, **Charger l’exemple de l’Académie** remplit l’horaire 2026–2027, ou partez de zéro.

Le premier compte créé devient l’administrateur ; l’écran de première installation disparaît ensuite.

## Version claude.ai

La page assemblée (`node outils/assembler.js page.html`) est aussi publiée comme artefact claude.ai. Là-bas, les comptes sont reliés à l’accès claude.ai de chaque personne (menu Partager) et il n’y a pas d’écran de connexion.

## Contenu du dépôt

```
index.html                  le site avec connexion (généré)
demo.html                   la démo, avec connexion simulée (générée)
config.js                   réglages Firebase du site
firestore.rules             qui peut lire et modifier quoi (à publier dans Firebase)
site/connexion.js           écran de connexion et demandes de compte
site/firebase.js            branchement sur Firebase (connexion + base de données)
site/logo.svg, embleme.svg  logo de l’Académie des pompiers (en couleur, en blanc -blanc.svg, emblème seul) : menu, connexion, onglet, feuilles imprimées
demo/connexion-demo.js      connexion et base de données simulées de la démo (localStorage)
demo/donnees.js             données d’exemple (générées)
src/page.html               la coquille de la page (titre, structure, emplacement des styles et du code)
src/styles/NN-nom.css       les styles, un fichier par sujet (20 fichiers ; voir le tableau plus bas)
src/options/<nom>/          le code et les styles d’une option (stock, compta)
options/<nom>.js            le fichier d’une option, généré à partir de src/options/<nom>/
src/js/NN-nom.js            le code, un fichier par sujet (35 fichiers)
tests/                      tests automatiques (Chrome sans fenêtre)
outils/assembler.js         réunit les fichiers de src/ en une seule page
outils/construire.js        régénère index.html, demo.html et demo/donnees.js
.github/workflows/tests.yml lance les tests à chaque envoi sur GitHub
```

## Les fichiers source

La page est découpée par sujet. Les fichiers sont réunis dans l’ordre de leur numéro ; ceux du code partagent la même portée, comme s’ils étaient écrits à la suite.

| Fichier de `src/js/` | Contenu |
| --- | --- |
| `01-outils`, `02-etat`, `02-options` | petites fonctions communes, état de la page, chargement des options |
| `03-seances`, `04-stats-presence` | calcul des séances d’une journée, taux de présence |
| `05-horaire-rendu`, `06-horaire-pages` | le tableau de la semaine et les pages de l’horaire |
| `07-classes`, `08-eleves-fiches`, `09-personnel-heures` | pages Classes, Élèves (et fiches), Personnel et heures enseignées |
| `10-presences`, `11-examens`, `12-affectations` | présences, examens et résultats, affectation des enseignants |
| `12-affectations-auto` | proposer des enseignants pour les places à combler |
| `13-modules`, `14-reprises`, `15-locaux-equipements` | modules du programme, journées de reprise, locaux et équipements |
| `14-formation`, `14-questions`, `14-services`, `14-presence-qr` | formation (grilles, évaluations, carnets, préalables, certificats, dossier ENPQ, relevés), banque de questions et examens blancs, services incendie, présence par code QR |
| `16-import`, `17-historique`, `18-notifications`, `19-impression` | import d’élèves et copie d’horaire, historique, cloche, impression |
| `22-confort` | recherche Ctrl+K, vues enregistrées, modification sur place |
| `29-mobile` | sur téléphone (jusqu’à 760 px) : onglets en bas selon le rôle, menu « Plus » en tuiles, sections en pastilles |
| `20-nouveautes`, `21-annee-parametres`, `21-annonces`, `21-archives`, `22-comptes` | Nouveautés, calendrier scolaire et paramètres, annonces, clôture de l’année et archives, comptes et profils |
| `23-cadre`, `24-tiroir` | menu, en-tête et rendu général ; panneau latéral |
| `25-enregistrement`, `26-evenements`, `27-glisser` | écritures dans la base ; clics et formulaires ; glisser-déposer |
| `28-donnees` | lecture de la base et démarrage |

| Fichier de `src/options/` | Contenu |
| --- | --- |
| `stock/01-outils`, `02-suivi`, `03-stock` | fiches d’objets, import, QR et scanner, emplacements, kits ; préparation, achats, réparations, comptage, rapports ; inventaire, dotations, inspections |
| `compta/01-compta` | frais des élèves, factures, paie, dépenses, budget, rapports |
| `stock/04-branchement`, `compta/02-branchement` | ce que l’option fournit au site : `addOption(…)` |
| `stock/01-stock.css`, `compta/01-compta.css` | les styles de l’option, dans son fichier |

| Fichier de `src/styles/` | Contenu |
| --- | --- |
| `01-base` | couleurs (bloc `:root` : rouge, menu, vert, orange, arrondis, ombres), police, couleurs des cours, petites classes utiles |
| `02-coquille` | menu de gauche, barre du titre, bandeau de démonstration, cloche et notifications |
| `03-controles` | boutons, champs, barre d’outils, étiquettes, puces de filtre, messages en bas (toasts) |
| `04-horaire` | tout le calendrier : semaine, cartes des cours, examens, corvées, barre de l’horaire, glisser-déposer |
| `05-panneaux` | panneaux, indicateurs, tableaux, listes, messages vides, impression |
| `06-fenetres-formulaires` | les fenêtres (5 formes), les formulaires, la prise des présences, les cases à cocher |
| `07-accueil` | la page d’accueil : la journée en ligne du temps, l’année scolaire, ce qui est à faire, les prochains examens |
| `07-comptes` à `12-fiches` | une page chacun : comptes, classes, examens et nouveautés, affectations et modules, élèves et résultats, fiches |
| `15-affichages` | affichages Liste, Cartes et Compact des listes |
| `16-parametres-annonces`, `17-formation`, `18-confort` | paramètres et annonces ; formation ; recherche Ctrl+K, vues enregistrées, modification sur place |
| `19-telephone` | ce qui change partout sur téléphone (chaque fichier finit aussi par ses propres règles de téléphone, jusqu’à 760 px) |
| `20-mobile` | l’apparence du téléphone (Barlow, charbon et jaune, fenêtres qui montent du bas) et la coquille de `29-mobile` |
| `20-utilitaires` | petites classes `u-…` (marges, largeurs de champ) qui remplacent les `style="…"` dans le code ; lu en dernier |

Pour ajouter un fichier, donnez-lui un numéro : `outils/assembler.js` prend tous les fichiers `NN-nom.js` et `NN-nom.css` dans l’ordre.

## Modifier la page

1. Modifiez le fichier concerné dans `src/js/`, `src/styles/` ou `src/options/` (ou `site/connexion.js`).
2. Régénérez : `node outils/construire.js`
3. Lancez les tests : `node tests/lancer.js`
4. Poussez le dépôt : GitHub Pages met le site à jour en une ou deux minutes, et GitHub relance les tests de son côté.

## Tests

Les tests tournent avec une date figée (vendredi 9 octobre 2026) : leurs dates restent valables. La base simulée peut refuser des lectures comme les vraies règles d’accès.

`node tests/lancer.js` construit les pages de test à partir de `src/` et les ouvre dans Chrome sans fenêtre (`node tests/lancer.js ac` ne lance que les pages dont le nom contient « ac ») :

- `test.html` et `test-ac.html` : un collège fictif et les données de l’Académie, parcours complet ;
- `test-lock-s.html` et `test-lock-t.html` : un élève et un enseignant qui ouvrent la page avec leur propre compte ;
- `test-opt.html`, `test-opt-s.html`, `test-opt-c.html`, `test-opt-2.html` : le site sans ses options, avec le Stock seul, avec la Compta seule, et avec les deux (les vrais fichiers, chargés de `tests/options/`) ;
- `test-phone.html` : la page dans un cadre de 390 × 844 px (un téléphone) : les 22 écrans des trois rôles ne dépassent pas de l’écran, les champs sont en 16 px, les textes en 12 px au moins, les boutons des présences font 44 px ;
- `test-auth-*.html` : la connexion avec un Firebase simulé (première installation, demande de compte, approbation, refus, connexion) et la démo (compte de démo, demande de compte).

La commande se termine en erreur s’il y a un échec, une erreur de la page ou une page qui ne termine pas. Sous Windows, `tests/lancer-tests.ps1` lance la même chose.

**À chaque envoi sur GitHub**, `.github/workflows/tests.yml` refait la même chose sur les serveurs de GitHub : il régénère le site, vérifie que `index.html`, `demo.html` et `options/` envoyés correspondent bien aux sources, puis lance toute la suite. Le résultat est dans l’onglet **Actions** du dépôt (coche verte ou croix rouge à côté de chaque envoi) ; en cas d’échec, les pages de résultats y sont jointes pendant sept jours.

Il faut Node.js et Google Chrome. Les vérifications suivent l’horaire d’exemple d’octobre 2026 : en dehors de cette période, certaines peuvent échouer sans que la page soit en cause.
