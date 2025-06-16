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

#### Version 2.1 ✅

- Mise en place d'un sélecteur d'option pour chaque DrumType
- Option volume reimplantée et fonctionnelle
- Option auto-complete implantée et fonctionnelle, le design reste à revoir
- Les deux volets d'option "Delay" et "Fill" sont préparés

#### Version 2.2 🟨
- Ajout de la documentation 🟩
- Remodelage du Suivi de Projet ✅
- Ajout de commentaires 🟨
- Option 'Delay' par DrumType :
        - Développement de la fonction ✅
⚠️Sous réserve que cela ne nuit pas à la qualité de la lecture : Implantation 🟥

#### Version 2.3 🟥
- Option 'Fill' : Mettre en place une 'probabilité de Lecture' (lire le son qu'1 fois sur 2, ou sur 3 etc...) --> création d'un fillManager

#### Version 2.4 🟥
- Passer la fonction delay du DrumType au SpanDrum --> création d'un delayManager

#### Version 2.5 🟥
- Retravailler le style général des options
----
## Version 3 🟥
- 4 volets d'options différentes : Volumes, Auto-Complete, Fill, Delay
- Affichage toujours sur 16, mais possibilité de switcher entre 4 pages (4 mesures)
- Plus de pistes (clap, conga)


## Version 4 🟥
- Sélection du kit dans une liste ---> Création d'un composent 'Menu'
- Possibilité de triolet

## Version 5 🟥
- Possibilité de mixer les kits via Menu en Glisser/Déposer

### V.X 🟥
Création d'un système de session (migration sous Laravel) :
- Possibilité pour l'utilisateur d'ajouter ses propres kits sous condition
- Sauvegarder et charger depuis une base de donnée
- Soumettre des pattern par style
- Rechercher et charger des pattern d'autres utilisateurs

----
## Bug et problèmes/solutions envisagées 
- Saccade sur portable et interface responsive






