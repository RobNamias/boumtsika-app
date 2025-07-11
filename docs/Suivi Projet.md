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

### Version 2.5 : Intégration de l'outil Intelligence Artificielle dans la programmation 🟥

Généré par IA :
"Actions menées :

- refonte poussée du système de fonctionnement et de la structure de l'application  
        - Réorganisation complète des hooks et utilitaires (ex : centralisation des caches audio, refonte du patternManager)
        - Simplification de la logique de lecture et de gestion des états React
        - Nettoyage du code et suppression des redondances

- unification des thèmes  
        - Harmonisation des couleurs et des boutons sur tous les écrans
        - Uniformisation des styles CSS pour les flipcards et les options
        - Mise en place d’une palette de debug CSS pour faciliter le développement

- ajout de fonctions : enregistrement, Visualizator  
        - Ajout d’un bouton d’enregistrement et gestion du flux audio
        - Création du composant Visualizator pour afficher la forme d’onde ou le niveau sonore
        - Intégration de la gestion du volume et du mute pendant l’enregistrement

- reprise un à un 'à la main' des composants et du CSS afin de palier aux défaillances  
         - Correction des transitions et animations sur les flipcards
        - Refonte du composant DrumBoxLine pour une meilleure gestion des layers/options
        - Correction des conflits de display et des bugs d’affichage sur grand écran

- ajout d'une doc Rapport IA pour suivre les modifications apportés via IA, rédigé par l'IA  
         - Création d’un fichier de suivi détaillant chaque optimisation ou correction IA
        - Ajout de résumés de session et de rapports de fin de session automatisés
        - Documentation des choix techniques et des solutions apportées

- Optimisation des ressources et de la mémoire  
        - Mise en place d’un cache global pour les AudioBuffer et les HTMLAudioElement
        - Réduction drastique du nombre de requêtes réseau (ex : 13 000 → quelques dizaines)
        - Surveillance et profilage mémoire sous Chrome et Firefox pour éviter les fuites et ralentissements

- Responsive et compatibilité multi-navigateur :  
        - Mobile  
            - Détection et suivi des problèmes d’affichage sur petits écrans
            - Premiers tests d’adaptation des layouts en flex/grid
            - Préparation de la refonte responsive pour la prochaine version
        - Chrome
            - Optimisation des performances et compatibilité totale sur Chrome
            - Tests de lecture audio et de transitions CSS
            - Correction des bugs spécifiques à Chrome (ex : gestion du focus)
        - Opéra
            - Premiers tests de compatibilité
            - Vérification du rendu des composants principaux
            - Suivi des éventuels bugs spécifiques à ce navigateur :
                Pas de problème particulier
        - Firefox
            - Optimisation réussi grâve à l'utilisation de cache pour les audios

**Résumé :**  
La version 2.5 marque une étape majeure avec l’intégration de l’outil d’Intelligence Artificielle dans la programmation. Cette version a permis une refonte profonde de la structure de l’application, l’unification des thèmes graphiques, et l’ajout de nouvelles fonctionnalités telles que l’enregistrement et le Visualizator.  
Un travail minutieux a été mené sur chaque composant et sur le CSS pour corriger les défaillances et améliorer la robustesse de l’interface.  
La documentation a été enrichie par la création d’un rapport IA retraçant toutes les modifications apportées par l’IA.  
Un effort particulier a également été porté sur l’optimisation de l’utilisation des ressources et de la mémoire, afin d’assurer des performances fluides et une expérience utilisateur optimale, notamment sur Firefox et lors de l’utilisation intensive de l’application.  
Enfin, cette version pose les bases d’une application plus maintenable, plus moderne et mieux adaptée à l’évolution future, tout en préparant l’optimisation du responsive et la compatibilité multi-navigateurs."

----

#### Version 2.6 🟨

- Correction de bugs suite à la refonte et implémentation de nouvelles fonctions :
  - debug du delay ✅
  - sauvegarde fichier et import fichier json ✅
- Finition des imports ✅
- remodelage Visualizator ✅
- Style : autocomplete 🟥, bouton Rec 🟥

#### Version 2.7 🟥

- Style : Fill, Delay 🟥
- Corrections de bugs :
  - enregistrement audio (prévoir un delay après la fin du pattern pour ne pas couper trop sec l'enregistrement) 🟥

#### Version 2.8 🟥

- Style : Responsive 🟧

----

#### Version 2.5 ➡️ Version 3

Faire la sauvegarde dans un composant différent et permettre de personnalisé le nom du fichier et son emplacement de sauvegarde sur le pc du l'utilisateur.

Bugs à régler suite au à la refonte de l'application :

- ajout d'un bouton pause (stocker la valeur de current. current, ajout d'un statut Started Paused Stop)
- delay : vérifier qu'on joue soit le sample sans delay, soit le sample avec le delay, mais pas les deux. ✅
- enregistrement
- sauvegarde/import
- style :
        - options
        - enregistrement
        - selecteur LoopPatternOnly
        - mute/solo

- Finir la visualizator ✅

- version portable

----

## Version 3 🟥

- 4 volets d'options différentes : Volumes, Auto-Complete, Fill, Delay ✅
- Affichage toujours sur 16, mais possibilité de switcher entre 4 pages (4 mesures) ✅
- Compatibilité navigateurs ✅

- Faire une vraie fenetre de sauvegarde pour choisir l'emplacement et le nom du fichier de sauvegarde
- Plus de pistes (clap, conga)
- Dupliquer entièrement la première page sur les 3 autres pages sur demande :
        - fill, Volume, pattern

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
