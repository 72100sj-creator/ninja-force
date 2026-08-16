# 🥷 Ninja Force

**Version actuelle : V1.6**

Application Web (PWA) de renforcement musculaire, complémentaire à Papa Ninja pour les jours sans course. Pensée pour rester simple, rapide, zen, et utilisable même sans réseau.

## Fonctionnalités
- 16 exercices de base, chacun avec nom, fiche, illustration et indications.
- Création et modification de routines personnalisées (choix des exercices, ordre via boutons ↑/↓, nombre de tours), avec temps estimé affiché sur chaque routine enregistrée.
- Moteur d'entraînement déterministe basé sur une Machine d'État : chaque exercice s'exécute exactement une fois par tour, sans saut ni répétition, sans tour supplémentaire.
- Décompte de 10 secondes avant chaque exercice, durée fixe de 30 secondes par exercice, récupération stricte de 60 secondes entre les tours.
- Personnages illustrés (préparation, en cours, récupération, victoire) qui accompagnent chaque étape de la séance.
- Écran de fin de séance (durée réelle, nombre de tours, nombre d'exercices).
- Historique des 20 dernières séances (date, routine, durée, tours).
- Sons fiables sur iPhone via l'API Web Audio (bips de décompte renforcés pour le haut-parleur).
- Wake Lock API : l'écran reste allumé pendant l'effort, avec tentative de réactivation au retour depuis l'arrière-plan.
- Mode hors-ligne réel : une fois chargée une première fois (Wi-Fi ou 4G), l'appli — y compris les photos des 16 exercices et les personnages — fonctionne sans réseau.
- Ajout à l'écran d'accueil iOS avec icône correcte et ouverture en plein écran (sans barre Safari).
- Identité visuelle claire et sobre (fond gris avec une touche de bleu primaire, cartes "verre" blanches), avec les personnages illustrés du monde Ninja Force.

## Déploiement
Compatible avec GitHub Pages. Le projet est entièrement front-end (HTML, CSS, JS Vanilla).
Aucune compilation n'est requise.

## Structure du projet
```
index.html            Page principale
manifest.json          Configuration PWA
service-worker.js      Mise en cache pour le mode hors-ligne
css/style.css           Styles et thème visuel
js/data.js              Bibliothèque des 16 exercices
js/app.js               Logique de l'application et moteur de séance
assets/icons/           Icônes de l'application
assets/exercises/       Photos des exercices
assets/mascot/          Personnages illustrés (préparation, en cours, récupération, victoire)
```

## Données
Tout est stocké localement dans le navigateur (`localStorage`) : routines personnalisées et historique des séances. Rien n'est envoyé à un serveur.
