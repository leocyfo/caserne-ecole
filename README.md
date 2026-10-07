# Calendrier des cours

Gabarit de gestion scolaire pour l’Académie des pompiers : calendrier des classes, cours, élèves, personnel, présences, examens, calendrier scolaire, comptes et profils. Trois rôles : **Administrateur**, **Enseignant**, **Élève**.

## Deux versions

| | Version claude.ai | Démo GitHub (`index.html`) |
|---|---|---|
| Où | Artefact claude.ai | Ce dépôt, publié avec GitHub Pages |
| Données | Partagées en temps réel entre toutes les personnes | Gardées dans le navigateur de chaque visiteur |
| Comptes | Reliés au compte claude.ai de chaque personne | Un seul utilisateur : « Vous (démo) » |
| Usage | L’horaire réel de l’école | Montrer et essayer le gabarit |

La démo part des données d’exemple (classes 119 à 123, 3 enseignants, 12 élèves, horaire 2026–2027). Le bouton **Réinitialiser la démo** dans le bandeau remet les données de départ.

## Contenu du dépôt

```
index.html                  démo prête à publier (générée)
demo/runtime.js             base de données et identité simulées (localStorage)
demo/donnees.js             données d’exemple (générées)
src/calendrier-cours.html   la page, telle que publiée sur claude.ai
tests/                      tests automatiques (Chrome sans fenêtre)
outils/construire-demo.js   régénère index.html et demo/donnees.js
```

## Modifier la page

1. Modifiez `src/calendrier-cours.html`.
2. Régénérez la démo : `node outils/construire-demo.js`
3. Lancez les tests : `powershell -File tests/lancer-tests.ps1`
4. Publiez la page sur claude.ai et poussez le dépôt.

## Tests

`tests/lancer-tests.ps1` ouvre quatre pages de test dans Chrome sans fenêtre, avec une base de données simulée :

- `test.html` : un collège fictif, parcours complet (74 vérifications) ;
- `test-ac.html` : les données de l’Académie, parcours complet (90 vérifications) ;
- `test-lock-s.html` et `test-lock-t.html` : un élève et un enseignant qui ouvrent la page avec leur propre compte.

Il faut Node.js et Google Chrome. Les vérifications suivent l’horaire d’exemple d’octobre 2026 : en dehors de cette période, certaines peuvent échouer sans que la page soit en cause.
