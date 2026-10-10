# Caserne-École

Le site de gestion scolaire de l’Académie des pompiers : calendrier des classes, modules et cours, affectation des enseignants, élèves, personnel, présences, examens, calendrier scolaire, comptes et profils. Trois rôles : **Administrateur**, **Enseignant**, **Élève**.

## Le site

- **`index.html`** : le site, avec connexion. On se connecte avec son courriel et son mot de passe. Pour avoir un compte, on clique **Demander un compte** ; l’administration approuve la demande dans le menu **Comptes**, en choisissant le rôle et la fiche de la personne.
- **`demo.html`** : la démo, avec le même écran de connexion. Quatre comptes de démo (mot de passe `demo123`) : `admin@demo.ca`, `marie.leduc@demo.ca` (enseignante), `alexandre.beaulieu@demo.ca` (élève) et `vincent.tremblay@demo.ca` (instructeur qui postule aux journées de cours). On peut aussi demander un compte, puis l’approuver avec le compte Administration. Les comptes et les données (classes 119 à 123, horaire 2026–2027) restent dans le navigateur de chaque visiteur ; **Réinitialiser la démo** remet tout à zéro.

Tant que Firebase n’est pas configuré (`config.js` vide), `index.html` renvoie vers la démo.

## Vocabulaire

- **Module** : une unité du programme (M7 Autopompe), avec ses heures de théorie et de pratique.
- **Cours** : une journée ou une demi-journée d’un module pour une classe. Un examen ou une reprise est un cours d’un type particulier.
- **Activité** : une journée qui n’appartient à aucun module (Accueil, Graduation). Aucun enseignant n’est requis par défaut et les présences ne sont pas attendues.
- **Titulaire** : l’enseignant d’un module pour une classe. **Enseignant principal** : le responsable d’une classe. **Instructeur** : un enseignant à la journée, qui postule aux cours.

On ajoute un cours avec le même formulaire partout (calendrier, classe, module, examens).

## Examens et résultats

Les résultats ne sont pas dans les fiches d’examen : `resultats/<examen>` contient ceux de toute la classe (personnel seulement) et `resultats-eleves/<élève__examen>` celui d’un élève (lui-même et le personnel). Un élève ne peut donc lire que ses propres résultats.

## Affectation des enseignants

- **Modules** (administration) : le catalogue du programme (nom, heures de théorie et de pratique requises, enseignants requis par cours). Dans la fiche d’un module, on ajoute les cours d’une classe : théorie, pratique, examen théorique ou pratique, date de reprise.
- **Enseignants requis** : chaque cours a son nombre d’enseignants requis (celui du module par défaut, modifiable cours par cours). Le titulaire du module donne tous ses cours ; les autres places sont à combler.
- **Enseignants** : *Disponibilités* (les jours où ils peuvent donner des cours) et *Mes cours* (cours à pourvoir selon leurs disponibilités et leurs compétences, candidatures en attente, cours attribués, cours donnés, demande de remplacement).
- **Affectations** (administration) : cours à combler, candidatures à approuver ou refuser, demandes de remplacement, et pour chaque cours le nombre d’enseignants attribués sur le nombre requis. Les compétences de chaque enseignant se cochent dans son dossier (Personnel).

Données : `candidatures/<séance__enseignant>` (statut `attente`, `approuve`, `refuse` ou `retire`), `remplacements/<séance__enseignant>`, `disponibilites/<enseignant>` (jours `J`, `AM` ou `PM`), `enseignants/<id>.competences` (numéros de modules) et, dans `config/ecole.competences`, `heuresT`, `heuresP` et `requis` par module. Les règles de `firestore.rules` laissent un enseignant écrire seulement ses propres candidatures (en attente), demandes de remplacement et disponibilités.

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
