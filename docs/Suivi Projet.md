# Suivi de projet

## Version 1.0 - Terminée
- Mapping des composants au chargement d'un Drumset
- Possibilité de changer de DrumSet
- Ecrire un pattern
- Lecture/Stop
- Changer le tempo
- Afficher 4 ou 8 temps (16 ou 32 quart-temps)
- Sauvegarder et Charger un fichier JSON

## Version 2.0 - Terminée
- Changer le volume par DrumType
- Changer le volume pour chaque SpanDrum
- Générer un tableau de volume aléatoire 
- Solo/Muet pour chaque DrumType 

#### Version 2.1 : Terminée

- mise en place d'un sélecteur d'option pour chaque DrumType
- option volume reimplantée et fonctionnelle
- option auto-complete implantée et fonctionnelle, le design reste à revoir
- les deux volets d'option "Delay" et "Fill" sont préparés

#### Version 2.2 : en Cours
- option 'Fill' : Mettre en place une 'probabilité de Lecture' (lire le son qu'1 fois sur 2, ou sur 3 etc...)
- implentation option 'Delay' par DrumType(fonction prête) 
        Sous réserve que cela ne nuit pas à la qualité

- retravailler le style général des options

----
## Version 3 

- affichage toujours sur 16, mais possibilité de switcher entre 4 pages (4 mesures)
- Possibilité de triolet
- Plus de pistes (clap, conga)


### Version 4 
- sélection du kit dans une liste ---> Création d'un composent 'Menu'

### Version 5
- Possibilité de mixer les kits via Menu en Glisser/Déposer

### V.X
Création d'un système de session (migration sous Laravel) :
- possibilité pour l'utilisateur d'ajouter ses propres kits sous condition
- sauvegarder et charger depuis une base de donnée
- soumettre des pattern par style
- rechercher et charger des pattern d'autres utilisateurs


## Bug et problèmes/solutions envisagées 
- Saccade sur portable et interface responsive





