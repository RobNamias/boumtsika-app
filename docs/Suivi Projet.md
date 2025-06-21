# Suivi de projet

## Version 1.0 ✅

- Mapping des composants au chargement d'un Drumset
- Possibilité de changer de DrumSet
- Ecrire un pattern
- Lecture/Stop
- Changer le tempo
- Afficher 4 ou 8 temps (16 ou 32 quart-temps)
- Sauvegarder et Charger un fichier JSON

## Version 2.0 ✅

- Changer le volume par DrumType
- Changer le volume pour chaque SpanDrum
- Générer un tableau de volume aléatoire
- Solo/Muet pour chaque DrumType

### Version 2.1 ✅

- Mise en place d'un sélecteur d'option pour chaque DrumType
- Option volume reimplantée et fonctionnelle
- Option auto-complete implantée et fonctionnelle, le design reste à revoir
- Les deux volets d'option "Delay" et "Fill" sont préparés

### Version 2.2 ✅

- Ajout de la documentation ✅
- Remodelage du Suivi de Projet ✅
- Ajout de commentaires ✅
- Option 'Delay' par DrumType :
        - Développement de la fonction ✅
        - Intégration : ajout d'un DelayManager, d'un modèle 'Delay'et mise en place prise en charge lors de la lecture ✅
        - Interface ✅
        - prise en charge Sauvegarde/Chargement ✅

### Version 2.3 🟥

- Finalisation documentation/commentaire 🟩
- Option 'Fill' : Mettre en place une 'probabilité de Lecture' (lire le son qu'1 fois sur 2, ou sur 3 etc...) --> création d'un fillManager
- Style
- prise en charge Sauvegarde/Chargement 'Fill'

### Version 2.4 🟥❓

A repenser... Selon la solution employée pour l'option 'Fill'

- Passer la fonction delay du DrumType au SpanDrum --> création d'un delayManager

### Version 2.5 🟥

- Retravailler le style général des options
- Responsive ❗❗❗

----

#### Version 2.5 ---> Version 3

- Gestion de l'affichage : Faire 4 pages différentes pour avoir 16 temps au total, mais toujours afficher qu'une mesure
- Possibilité de choisir la longueur de la boucle (1, 2, 3 ou 4 page(s))
- Création des boutons de sélection et d'activation de pages, ainsi qu'une classe CSS supplémentaire pour le survol à la lecture

----

## Version 3 🟥

- 4 volets d'options différentes : Volumes, Auto-Complete, Fill, Delay
- Affichage toujours sur 16, mais possibilité de switcher entre 4 pages (4 mesures)
- Plus de pistes (clap, conga)

## Version 4 🟥

- Sélection du kit dans une liste ---> Création d'un composent 'Menu'
- Possibilité de triolet
- ...

## Version 5 🟥

- Possibilité de mixer les kits via Menu en Glisser/Déposer
- ...

### V.X 🟥

Création d'un système de session (migration sous Laravel) :

- Possibilité pour l'utilisateur d'ajouter ses propres kits sous condition
- Sauvegarder et charger depuis une base de donnée
- Soumettre des pattern par style
- Rechercher et charger des pattern d'autres utilisateurs
- ...

----

## Bug et problèmes/solutions envisagées

- Saccade sur portable et interface responsive
