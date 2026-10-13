# Caserne-École

Le site de gestion scolaire de l’Académie des pompiers : calendrier des classes, modules et cours, affectation des enseignants, élèves, personnel, présences, examens, calendrier scolaire, comptes et profils. Trois rôles : **Administrateur**, **Enseignant**, **Élève**.

## Le site

- **`index.html`** : le site, avec connexion. On se connecte avec son courriel et son mot de passe. Pour avoir un compte, on clique **Demander un compte** ; l’administration approuve la demande dans le menu **Comptes**, en choisissant le rôle et la fiche de la personne.
- **`demo.html`** : la démo, avec le même écran de connexion. Quatre comptes de démo (mot de passe `demo123`) : `admin@demo.ca`, `marie.leduc@demo.ca` (enseignante), `alexandre.beaulieu@demo.ca` (élève) et `vincent.tremblay@demo.ca` (instructeur qui postule aux journées de cours). On peut aussi demander un compte, puis l’approuver avec le compte Administration. Les comptes et les données (classes 119 à 123, horaire 2026–2027) restent dans le navigateur de chaque visiteur ; **Réinitialiser la démo** remet tout à zéro.

Tant que Firebase n’est pas configuré (`config.js` vide), `index.html` renvoie vers la démo.

## Nouveautés

Le menu **Nouveautés** (administration, sous Paramètres) liste les nouvelles fonctions, les améliorations et les corrections du site. La liste est dans `src/calendrier-cours.html` (constante `NOUVEAUTES`) : on y ajoute une ligne à chaque mise à jour.

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

## Affectation des enseignants

- **Modules** (administration) : le catalogue du programme. La fiche d’un module a quatre onglets : *Cours* (numéro, type, enseignants requis), *Examens* (type, nom), *Séances* (les dates, classe par classe) et *Réglages* (nom, heures, chargé de cours).
- **Enseignants requis** : le nombre se règle sur chaque cours du module et vaut pour toutes les classes. Une séance qui couvre plusieurs cours prend le plus grand. Le chargé de cours du module compte parmi eux ; les autres places sont à combler. Pour un examen, une reprise ou une activité, le nombre se règle dans la fenêtre de la séance.
- **Enseignants** : *Disponibilités* (les jours où ils peuvent donner des cours) et *Mes séances* (séances à pourvoir selon leurs disponibilités et leurs compétences, candidatures en attente, séances attribuées, séances données, demande de remplacement).
- **Affectations** (administration) : séances à combler, candidatures à approuver ou refuser, demandes de remplacement, et pour chaque séance le nombre d’enseignants attribués sur le nombre requis. Les compétences de chaque enseignant se cochent dans son dossier (Personnel).

Données : `candidatures/<séance__enseignant>` (statut `attente`, `approuve`, `refuse` ou `retire`), `remplacements/<séance__enseignant>`, `disponibilites/<enseignant>` (jours `J`, `AM` ou `PM`), `enseignants/<id>.competences` (numéros de modules) et, dans `config/ecole.competences`, pour chaque module : `heuresT`, `heuresP`, `charge` (le chargé de cours), `cours` (`{ id, num, type, requis }`) et `examens` (`{ id, type, nom }`, type `t` ou `p`).

Chaque classe a un document `cours/<id>` par module (sigle `M7`). Ses séances sont dans `seances`, une entrée par séance : `{ date, debut, fin, minutes, tags, label, cours: [ids], examens: [ids] }`. Chaque séance s’écrit à part (`update` qui fusionne), pour que deux personnes ne s’écrasent pas. L’ancien tableau `extras` est encore lu. L’identifiant d’une séance ne change jamais : les présences, les résultats et les candidatures s’y rattachent. Les règles de `firestore.rules` laissent un enseignant écrire seulement ses propres candidatures (en attente), demandes de remplacement et disponibilités.

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

`src/calendrier-cours.html` est aussi publié comme artefact claude.ai. Là-bas, les comptes sont reliés à l’accès claude.ai de chaque personne (menu Partager) et il n’y a pas d’écran de connexion.

## Contenu du dépôt

```
index.html                  le site avec connexion (généré)
demo.html                   la démo, avec connexion simulée (générée)
config.js                   réglages Firebase du site
firestore.rules             qui peut lire et modifier quoi (à publier dans Firebase)
site/connexion.js           écran de connexion et demandes de compte
site/firebase.js            branchement sur Firebase (connexion + base de données)
demo/connexion-demo.js      connexion et base de données simulées de la démo (localStorage)
demo/donnees.js             données d’exemple (générées)
src/calendrier-cours.html   la page de l’horaire
tests/                      tests automatiques (Chrome sans fenêtre)
outils/construire.js        régénère index.html, demo.html et demo/donnees.js
```

## Modifier la page

1. Modifiez `src/calendrier-cours.html` (ou `site/connexion.js`).
2. Régénérez : `node outils/construire.js`
3. Lancez les tests : `powershell -File tests/lancer-tests.ps1`
4. Poussez le dépôt : GitHub Pages met le site à jour en une ou deux minutes.

## Tests

Les tests tournent avec une date figée (vendredi 9 octobre 2026) : leurs dates restent valables. La base simulée peut refuser des lectures comme les vraies règles d’accès.

`tests/lancer-tests.ps1` ouvre les pages de test dans Chrome sans fenêtre :

- `test.html` et `test-ac.html` : un collège fictif et les données de l’Académie, parcours complet ;
- `test-lock-s.html` et `test-lock-t.html` : un élève et un enseignant qui ouvrent la page avec leur propre compte ;
- `test-auth-*.html` : la connexion avec un Firebase simulé (première installation, demande de compte, approbation, refus, connexion) et la démo (compte de démo, demande de compte).

Il faut Node.js et Google Chrome. Les vérifications suivent l’horaire d’exemple d’octobre 2026 : en dehors de cette période, certaines peuvent échouer sans que la page soit en cause.
