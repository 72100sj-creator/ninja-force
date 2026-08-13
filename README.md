# 🥷 NINJA FORCE

Une Progressive Web App (PWA) de fitness conçue spécifiquement pour une utilisation sur iPhone, pensée pour être rapide, stable et utilisable totalement hors-ligne.

## Concept
L'objectif n'est pas de créer une usine à gaz, mais une application simple, robuste, que l'on a plaisir à utiliser au quotidien pour maintenir sa forme avec des exercices au poids du corps. 

## Fonctionnalités
- **Bibliothèque intégrée :** 16 fiches d'exercices avec illustrations et astuces (Squat, Fentes, Pont, Pompes, etc.).
- **Personnalisation :** Constructeur de séance permettant de choisir et d'ordonner ses propres exercices (glisser-déposer / flèches).
- **Chronomètre autonome :** Déroulement fluide des séances (30s effort / 15s repos / 10s préparation initiale).
- **Mode PWA iOS :** Installable sur l'écran d'accueil de l'iPhone, utilisation hors-ligne, suppression des barres de navigation du navigateur.
- **Wake Lock API :** Empêche l'écran de l'iPhone de s'éteindre pendant que le timer tourne.
- **Sauvegarde locale :** Les séances personnalisées sont stockées directement dans le navigateur (pas de base de données complexe).

## Installation (Utilisateur final)
1. Ouvrir l'URL de l'application sur **Safari** depuis l'iPhone.
2. Toucher l'icône de partage (le carré avec la flèche).
3. Sélectionner **"Sur l'écran d'accueil"**.
4. Lancer l'application depuis l'icône ajoutée sur l'écran de l'iPhone.

## Architecture
- `index.html` : Structure de l'application (écrans masqués/affichés dynamiquement).
- `style.css` : Design et interface utilisateur.
- `script.js` : Logique de chronomètre, gestion du DOM et stockage local.
- `manifest.json` : Fichier requis pour la PWA.
## ✨ Nouveautés de la version 1.3
- **Ordre personnalisable :** Réorganise facilement tes exercices dans le créateur de séance grâce aux boutons tactiles haut/bas (`↑` / `↓`).
- **Écran de fin de séance dédié :** Bilan complet à la fin de l'entraînement (durée, exercices, tours, blocs réalisés) sans redémarrage automatique d'exercice.
- **Audio iPhone fiabilisé :** Initialisation et reprise automatique du contexte audio lors du lancement de la séance pour garantir les bips sonores sur iOS.
- **Maintien de l'écran éveillé (Wake Lock) :** Empêche la mise en veille automatique de l'iPhone pendant toute la durée de la séance.
- **Version discrète :** Numéro de version (v1.3) affiché proprement sur l'écran d'accueil.

## 🚀 Utilisation
L'application fonctionne directement dans ton navigateur, s'installe sur mobile et est hébergée via **GitHub Pages**.# 🥷 NINJA FORCE (v1.2)

**NINJA FORCE** est une application web progressive (PWA) d'entraînement au poids du corps, conçue pour être simple, rapide, stable et utilisable hors-ligne.

## ✨ Nouveautés de la version 1.2
- **Version affichée :** Numéro de version (v1.2) visible directement sur l'écran d'accueil.
- **Séances sur mesure & Durée estimée :** Crée et sauvegarde plusieurs compositions de séances avec calcul automatique du temps total (incluant la mise en place).
- **Phases de mise en place :** 10 secondes de préparation au démarrage de la séance et 15 secondes de transition entre chaque exercice.
- **Fiches complètes & Bips sonores :** 16 fiches d'exercices enrichies de conseils pro et alertes sonores automatiques en fin de chronomètre.

## 🚀 Utilisation
L'application fonctionne directement dans ton navigateur, s'installe sur mobile et est hébergée via **GitHub Pages**.
