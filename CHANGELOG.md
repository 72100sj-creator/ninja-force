# Changelog Ninja Force

## [V1.6] - 2026-08-16 - Identité visuelle et personnages

### Nouveautés
- Intégration de 4 personnages illustrés (préparation, en cours, récupération, victoire) qui remplacent les emojis de statut pendant la séance et sur l'écran de fin.
- Affichage du personnage en grand format pendant la récupération (aucune photo d'exercice à cet instant, donc pas de superposition).
- Ajout du temps estimé sur chaque carte de routine enregistrée (calcul basé sur le déroulement réel : préparation, exercices, transitions, récupérations).
- Affichage discret du numéro de version sur l'écran d'accueil.

### Identité visuelle
- Bascule complète vers un thème clair (fond gris avec une touche de bleu primaire, cartes "verre" blanches, texte foncé) — remplace le thème sombre de la V1.5.
- Bouton "Démarrer" d'une routine passé en bleu (accent), à la place du vert.
- Retrait du bandeau de logo permanent en haut de l'écran, pour plus d'espace utile.
- Repositionnement des badges "Tour" et "Exercice" de chaque côté du minuteur (au lieu du personnage), pour ne jamais se chevaucher.

### Corrections
- Correction du texte des boutons bleus, illisible depuis le changement de thème (contraste insuffisant).
- Correction du champ de saisie du nom de routine, dont le texte devenait invisible sur fond clair.
- Ajout d'une sécurité empêchant l'écran de s'élargir horizontalement sur les petits iPhones.

## [V1.5] - 2026-08-16 - Mise en conformité avec le cahier des charges

### Corrections
- Uniformisation de la durée des 16 exercices à 30 secondes (5 exercices étaient désynchronisés : Fentes, Bird Dog, YTW, Planche, Dead Bug).
- Décompte de mise en place porté à 10 secondes avant **chaque** exercice (il n'était que de 5 secondes entre les exercices d'un même tour).
- Activation réelle du mode hors-ligne : le Service Worker n'était jusqu'ici jamais enregistré (l'appli avait besoin du réseau à chaque ouverture malgré ce qu'annonçait la doc). Sa liste de fichiers a aussi été corrigée (référence à un fichier inexistant supprimée, fichiers réellement utilisés ajoutés, y compris les 16 photos d'exercices).
- Ajout des balises iOS nécessaires pour un vrai rendu "application" une fois ajoutée à l'écran d'accueil (icône correcte, ouverture en plein écran sans barre Safari).
- Restauration de l'historique des séances : sauvegarde automatique à la fin de chaque séance (date, routine, durée, tours, exercices) et nouvel écran pour le consulter (20 dernières séances conservées).
- Bips de décompte (3-2-1) renforcés : volume x3 et timbre plus net pour une meilleure audibilité sur le haut-parleur de l'iPhone.

### Nettoyage
- Suppression des fichiers obsolètes non utilisés par l'application (`script.js`, `js/exercises.js`, `js/storage.js`).
- Suppression d'un résidu de code sans effet dans la fonction de sauvegarde de routine.
- Protection de l'affichage du nom de routine contre les caractères spéciaux.

### Identité visuelle
- Nouvelle palette bleu nuit avec effet "verre liquide" sobre, inspirée des couleurs de l'icône Ninja Force (remplace le thème or/sombre précédent).

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
