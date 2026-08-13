🥷 Ninja Force

Ninja Force est une application web mobile (PWA) de fitness au poids du corps. Conçue pour être légère, rapide et utilisable 100% hors ligne, elle permet de créer, personnaliser et suivre ses séances d'entraînement sous forme de circuits HIIT (High Intensity Interval Training).

✨ Fonctionnalités Principales

Entraînement sur mesure : Créez votre propre circuit en sélectionnant jusqu'à 8 exercices parmi une bibliothèque variée.

Réorganisation dynamique : Modifiez l'ordre de vos exercices facilement pour adapter l'enchaînement de votre séance.

Minuteur intelligent : Gère automatiquement les phases de préparation, d'effort (au temps ou aux répétitions) et de repos.

Signaux sonores natifs : Utilisation de l'API Web Audio pour générer des bips (départ, fin, compte à rebours 3-2-1) sans aucun fichier audio externe.

Suivi des performances : Historique automatique de vos séances (date, durée, nombre d'exercices validés) stocké localement.

Fiches détaillées : Instructions, zones ciblées, techniques de respiration et astuces "Ninja" pour chaque exercice.

100% Hors Ligne (PWA) : Installable directement sur l'écran d'accueil (iOS/Android) et fonctionne sans connexion internet.

🚀 Installation & Utilisation

L'application ne nécessite aucune installation complexe ni base de données.

Hébergez le code sur un serveur web ou via GitHub Pages.

Ouvrez l'URL depuis Safari (iOS) ou Chrome (Android).

Appuyez sur le bouton de partage, puis choisissez "Sur l'écran d'accueil".

L'application s'ouvre désormais en plein écran comme une application native !

🛠 Technologies Utilisées

HTML5 / CSS3 : Interface utilisateur moderne, variables CSS, mode sombre intégré.

Vanilla JavaScript (ES6) : Logique de l'application sans aucun framework pour des performances optimales.

Web Audio API : Synthétiseur audio natif pour les notifications sonores.

LocalStorage : Sauvegarde des préférences et de l'historique sur l'appareil.

📜 Changelog (Journal des modifications)

[v1.1.0] - Version Actuelle

Améliorations majeures de l'expérience utilisateur et corrections de bugs.

Ajout : Interface de réorganisation dynamique. Il est désormais possible de modifier l'ordre des exercices sélectionnés à l'aide de flèches (▲/▼).

Ajout : Moteur audio natif (AudioEngine). L'application émet un signal aigu pour le départ, un signal grave pour le repos, et un compte à rebours "3-2-1" avant la reprise. Ne nécessite aucun fichier .mp3.

Ajout : Intégration des icônes d'application haute qualité (format 192x192 et 512x512) avec le nouveau design "Ninja Force".

Correction : Le programme personnalisé ne se mettait pas à jour au lancement de la séance. L'application charge désormais correctement la dernière sélection validée au clic sur "Commencer".

Amélioration : Séparation visuelle claire entre "Mon programme" et la "Bibliothèque" dans l'onglet Exercices.

[v1.0.0] - Version Initiale

Création de l'interface de base et de la navigation (Accueil, Exercices, Historique).

Mise en place du chronomètre de séance (WorkoutEngine).

Intégration d'une bibliothèque initiale d'exercices au poids du corps.

Sauvegarde de l'historique et du programme via le stockage local (LocalStorage).

Configuration du Manifeste Web (PWA) pour l'installation sur smartphone.
