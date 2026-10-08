# Caserne-École

Le site de gestion scolaire de l’Académie des pompiers : calendrier des classes, cours, élèves, personnel, présences, examens, calendrier scolaire, comptes et profils. Trois rôles : **Administrateur**, **Enseignant**, **Élève**.

## Le site

- **`index.html`** : le site, avec connexion. On se connecte avec son courriel et son mot de passe. Pour avoir un compte, on clique **Demander un compte** ; l’administration approuve la demande dans le menu **Comptes**, en choisissant le rôle et la fiche de la personne.
- **`demo.html`** : une démo sans connexion. Les données d’exemple (classes 119 à 123, horaire 2026–2027) restent dans le navigateur de chaque visiteur ; **Réinitialiser la démo** remet les données de départ.

Tant que Firebase n’est pas configuré (`config.js` vide), `index.html` renvoie vers la démo.

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
demo.html                   la démo sans connexion (générée)
config.js                   réglages Firebase du site
firestore.rules             qui peut lire et modifier quoi (à publier dans Firebase)
site/connexion.js           écran de connexion et demandes de compte
site/firebase.js            branchement sur Firebase (connexion + base de données)
demo/runtime.js             base de données simulée de la démo (localStorage)
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

`tests/lancer-tests.ps1` ouvre les pages de test dans Chrome sans fenêtre :

- `test.html` et `test-ac.html` : un collège fictif et les données de l’Académie, parcours complet ;
- `test-lock-s.html` et `test-lock-t.html` : un élève et un enseignant qui ouvrent la page avec leur propre compte ;
- `test-auth-*.html` : la connexion avec un Firebase simulé (première installation, demande de compte, approbation, refus, connexion).

Il faut Node.js et Google Chrome. Les vérifications suivent l’horaire d’exemple d’octobre 2026 : en dehors de cette période, certaines peuvent échouer sans que la page soit en cause.
