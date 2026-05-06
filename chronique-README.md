# Chronique des Empires — Phase 1

Jeu de stratégie type "Civ light" sur carte hexagonale, hors-ligne, format PWA.

## Contenu (Phase 1)

- 4 civilisations jouables (Japon, Rome, Égypte, Vikings)
- Carte hex 12×16 procédurale
- 9 unités à travers 4 ères (Antiquité → Industriel)
- 9 bâtiments + 6 merveilles (dont la Grande Bibliothèque finale)
- 17 technologies
- 2 civilisations IA adverses
- 3 conditions de victoire : domination, science, économie
- Sauvegarde automatique
- Hors-ligne (PWA)

Graphismes : SVG vectoriels uniformes — la Phase 2 ajoutera des fonds de terrain en aquarelle (générés par IA).

## Déploiement sur GitHub Pages

Mêmes étapes que pour Ma Cité :

1. Créer un nouveau repo public (ex: `chronique`)
2. Uploader les 6 fichiers : `index.html`, `game.js`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`
3. Settings → Pages → Source: `main` branch, root → Save
4. Attendre 1-2 minutes, ouvrir l'URL `https://<ton-user>.github.io/chronique/`
5. Sur mobile : Safari/Chrome → Partager → "Sur l'écran d'accueil"

## Comment jouer (résumé)

- **Tap unité** : la sélectionne, montre cases vertes (mouvement) et rouges (attaque)
- **Tap case verte** : déplace l'unité
- **Tap case rouge / unité ennemie** : attaque
- **Tap colon → Fonder** : crée une ville (3 cases d'écart minimum entre villes)
- **Tap ville** : ouvre le panneau de production
- **Recherche** : choisir une techno dans le menu Recherche
- **Fin de tour** : termine ton tour, l'IA joue, ressources s'accumulent

## Conditions de victoire

- **Domination** : éliminer les 2 autres civilisations
- **Science** : construire la Grande Bibliothèque finale (techno: Informatique)
- **Économie** : 5000 or + 3 merveilles

## Fichiers

- `index.html` — UI, styles
- `game.js` — toute la logique (~2200 lignes)
- `manifest.json` + `sw.js` — PWA
- `icon-192.png` + `icon-512.png` — icônes
