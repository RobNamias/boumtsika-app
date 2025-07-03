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

- Ajout de la documentation
- Remodelage du Suivi de Projet
- Ajout de commentaires
- Option 'Delay' par DrumType :
        - Développement de la fonction
        - Intégration : ajout d'un DelayManager, d'un modèle 'Delay'et mise en place prise en charge lors de la lecture
        - Interface
        - prise en charge Sauvegarde/Chargement

### Version 2.3 ✅

- Finalisation documentation/commentaire ✅
- Mise en place d'une variable patternLength (et la fonction setLength() ) dans le patternManager afin de centraliser la longueur du pattern et générer les tableaux en fonction de cette longueur ✅
- Option 'Fill' : Mettre en place une 'probabilité de Lecture' (lire le son qu'1 fois sur 2, ou sur 3 etc...) :
        - développement et intégration ✅
        - interface ✅
        - prise en charge Sauvegarde/Chargement 'Fill'✅

### Version 2.4 ✅

- Préparation de la transition vers l'affichage prévue de la version 3 ✅
        - Mise en place d'une variable patternLength (v2.3) ✅
        - Modification de la fonction de lecture pour utiliser le PatternArray plutôt que la classe span_active ✅
        - Création des boutons de changements de pages (non-fonctionnelles)
        - Activation des spanDrum en fonction de Pattern.getCurrentPatternArray(numero_page) en changeant de page

- Revoir la fonction de fichier de sauvegarde pour récupérer les data via les Manager et non par la drumBox ✅
- Travail CSS grand écran ✅

### Version 2.5 🟥

- Responsive ❗❗❗ (version mobile ET Chrome)

----

#### Version 2.6

- Ajout d'une fonction de lecture pageunique

#### Version 2.5 ---> Version 3

----

## Version 3 🟥

- 4 volets d'options différentes : Volumes, Auto-Complete, Fill, Delay ✅
- Affichage toujours sur 16, mais possibilité de switcher entre 4 pages (4 mesures) ✅
- Possibilité de choisir la longueur de la boucle (1, 2, 3 ou 4 page(s))
- Faire une vraie fenetre de sauvegarde pour choisir l'emplacement et le nom du fichier de sauvegarde
- Exporter la partie "création de data" dans l'importation de fichier de sauvegarde et ne garder que le mapping dans la Drumbox
- Plus de pistes (clap, conga)
- Compatibilité navigateurs

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
