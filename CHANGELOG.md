# Changelog Ninja Force

## [V1.4] - Stabilisation Tests IRL
- Restructuration totale du déroulement des séances (State Machine).
- Correction de l'exercice sauté en début de séance.
- Correction stricte du comptage des tours (empêche les tours "4/3").
- Arrêt et transition fiables vers l'écran de fin après le dernier exercice.
- Ajout d'une récupération stricte de 60 secondes entre les tours.
- Ajout d'un décompte de préparation (10s) avant le premier exercice.
- Affichage permanent de la progression (Tour X/Y, Exercice X/Y).
- Correction du statut "Mise en place" bloqué (synchronisé avec l'état réel).
- Suppression du bouton "Suivant" manuel inutile.
- Affichage de la liste des exercices directement sur les fiches routines.
- Ajout de la modification complète des routines existantes (sans suppression).
- Ajout de l'ordre personnalisable des exercices (boutons ↑/↓) dans le constructeur.
- Mise à jour de la description de l'exercice YTW.
- Remplacement des MP3 par Web Audio API pour garantir les sons sur iPhone/iOS.
- Ajout du Wake Lock pour empêcher la mise en veille de l'écran pendant l'effort.
- Mise à jour de la charte graphique : tons sombres / or Ninja (plus premium).

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
