# Historique des modifications (Changelog) - NINJA FORCE

## [1.3.2] - 2026-08-13

### Corrections (HOTFIX)
- Résolution du bug bloquant la navigation sur l'écran d'accueil (régression 1.3.1). 
- Refonte de l'initialisation JavaScript : le code est désormais totalement protégé contre les erreurs liées au décalage du cache PWA (évènements rattachés de manière asynchrone et sécurisée).
- Confirmation de la restauration des miniatures (`.ordered-thumb`) dans le créateur de séance.

## [1.3.1] - 2026-08-13

### Corrections
- Restauration de l'affichage des miniatures d'exercices dans le constructeur de séance (Mise à jour annulée suite à une régression sur la navigation).

## [1.3.0] - 2026-08-13

### Nouveautés & Corrections
- Ajout de la gestion de l'ordre personnalisé des exercices dans le créateur de séance (`↑` / `↓`).
- Création d'un écran de bilan de fin de séance complet avec bouton `[ TERMINER ]` (fin de l'enchaînement automatique non désiré).
- Correction de l'audio sur iPhone via un contexte audio global déverrouillé au lancement.
- Intégration de la Wake Lock API pour empêcher l'écran de se mettre en veille pendant la séance.

## [1.2.0] - 2026-08-13

### Nouveautés
- Intégration du calcul et de l'affichage en direct de la durée estimée des séances.
- Remplacement des temps de repos par des phases de "Mise en place" (15s entre les exercices + 10s de préparation au lancement).
- Enrichissement des fiches de la bibliothèque avec des conseils professionnels ("Conseil Ninja").

## [1.1.0] - 2026-08-13

### Nouveautés
- Gestion de plusieurs séances personnalisées sauvegardées dans le navigateur (`localStorage`).
- Créateur de séance interactif avec choix des tours et de la liste des exercices.

## [1.0.0] - 2026-06-30
- Version initiale de NINJA FORCE (routine fixe, chronomètre, mode hors-ligne PWA).
