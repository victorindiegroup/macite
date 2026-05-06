# Ma Cité — version PWA

Mini-jeu de gestion de cité pensé pour des sessions courtes deux fois par jour. Cette version est prête à être hébergée sur GitHub Pages et installée sur ton écran d'accueil comme une vraie app.

## Contenu

- `index.html` — le jeu (HTML/CSS/JS dans un seul fichier)
- `manifest.json` — métadonnées PWA (nom, icônes, couleurs)
- `sw.js` — service worker, met l'app en cache pour fonctionner hors-ligne
- `icon-192.png`, `icon-512.png` — icônes pour l'écran d'accueil

## Déploiement sur GitHub Pages

1. **Créer un repo GitHub**
   - Va sur [github.com/new](https://github.com/new)
   - Nomme-le par exemple `macite` (ou autre)
   - Coche **Public** (GitHub Pages gratuit nécessite Public, sauf compte Pro)
   - Pas besoin de README, on a déjà tout

2. **Uploader les fichiers**
   - Sur la page du repo vide, clique **uploading an existing file**
   - Glisse les 5 fichiers (`index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`) — pas le README, sauf si tu veux
   - Clique **Commit changes**

3. **Activer GitHub Pages**
   - Onglet **Settings** du repo → menu de gauche **Pages**
   - Sous **Build and deployment**, source = **Deploy from a branch**
   - Branch = `main`, dossier = `/ (root)` → **Save**
   - Attends 1-2 minutes. L'URL apparaît en haut de la même page :
     `https://TONPSEUDO.github.io/macite/`

4. **Tester sur ton téléphone**
   - Ouvre l'URL dans **Chrome (Android)** ou **Safari (iOS)**

5. **Ajouter à l'écran d'accueil**
   - **iPhone** : bouton Partager (carré avec flèche) → *Sur l'écran d'accueil*
   - **Android Chrome** : menu trois points → *Installer l'application* (ou *Ajouter à l'écran d'accueil*)

L'icône apparaît sur ton écran d'accueil. Tap = lance le jeu en plein écran, sans barre de navigateur.

## Notes

- **Sauvegarde** : la progression est stockée dans `localStorage` du navigateur. Si tu vides les données du site ou désinstalles l'app, tu perds ta cité.
- **Hors-ligne** : grâce au service worker, le jeu fonctionne même sans connexion une fois chargé une première fois.
- **Mises à jour** : si tu modifies le code et le repush sur GitHub, change `CACHE = 'macite-v1'` en `'macite-v2'` dans `sw.js` pour forcer la mise à jour côté téléphone.

## Limites connues

- **iOS** est plus restrictif qu'Android pour les PWA : le mode hors-ligne marche, mais certaines APIs avancées (notifications push par exemple) sont bridées. Pour ce jeu c'est sans impact.
- L'icône PNG actuelle est simple ("M" sur fond terracotta). Tu peux la remplacer en gardant les mêmes noms de fichier.
- Pas de synchro entre appareils. Si tu veux jouer sur tel + ordi avec la même save, il faudrait ajouter un backend (autre chantier).
