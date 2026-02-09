# TaskFlow

[![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg?style=for-the-badge)](package.json)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg?style=for-the-badge)](README.md)
[![Author](https://img.shields.io/badge/Author-Hippolyte-purple.svg?style=for-the-badge)](https://github.com/hippolyte)

Gestionnaire de taches intelligent en HTML, CSS et JavaScript.
TaskFlow met l'accent sur la rapidite, la clarte visuelle, et la sauvegarde locale.
Pensé pour un usage quotidien, sans back-end, sans compte, et sans friction.

## Lancer le projet

- Ouvrez [index.html](index.html) dans votre navigateur.
- Aucune installation necessaire.
- Les donnees sont stockees dans votre navigateur.

## Structure du projet

- [index.html](index.html)
- [style.css](style.css)
- [script.js](script.js)
- [LICENSE](LICENSE)

## Architecture

- App front-end sans framework.
- DOM minimal, logique en JS vanilla.
- Separation simple UI / etat / stockage.
- Etat global en memoire via un tableau de taches.
- Persistant par LocalStorage.
- Rendu complet a chaque update.
- Animations controlees par classes CSS.

## Modele de donnees

- `id`: identifiant unique (UUID).
- `title`: titre court.
- `description`: details de la tache.
- `priority`: low | medium | high.
- `dueDate`: date ISO (YYYY-MM-DD).
- `completed`: booleen.
- `createdAt`: timestamp numeric.
- `tags`: tableau de strings.
- `checklist`: tableau d'objets { text, done }.

## Stockage et persistance

- Cle principale: `taskflow.tasks`.
- Cle de theme: `taskflow.theme`.
- Sauvegarde apres chaque modification.
- Import JSON avec fusion ou remplacement.
- Export JSON compatible avec le schema interne.
- Aucune transmission reseau par defaut.

## Recherche et filtres

- Recherche plein texte (titre, description, tags, checklist).
- Filtre: toutes, en cours, terminees.
- Etat vide pour resultat nul.
- Mise a jour instantanee.

## Tri des taches

- Creation recent.
- Creation ancien.
- Echeance proche.
- Echeance lointaine.
- Priorite haute.
- Priorite basse.

## Etiquettes

- Saisie separee par virgules.
- Deduplication automatique.
- Affichage en chips.
- Tag par defaut si vide.

## Checklist

- Une ligne par item.
- Checkboxes dans la carte.
- Etat conserve par item.
- Edition inline possible.

## Edition inline

- Activation via bouton Editer.
- Edition du titre, description, tags, checklist.
- Edition de priorite et date.
- Enregistrer ou Annuler.

## Mode sombre

- Theme base sur variables CSS.
- Respect du `color-scheme`.
- Surfaces adaptees en dark.
- Tags et ripple ajustees.

## Animations et micro-interactions

- Chargement de page en fade/slide.
- Stagger des cartes.
- Ripple sur boutons.
- Press state au clic.
- Transition douce lors des updates.

## Accessibilite

- Contrastes corrects en light et dark.
- Boutons avec labels explicites.
- Etats visuels clairs.
- Focus visible sur champs et boutons.
- Etats vides informatifs.

## Performance

- Pas de dependances externes JS.
- Rendu DOM simple.
- Filtre et tri en memoire.
- JSON compact pour stockage.

## Securite et confidentialite

- Aucune donnee envoyee au reseau.
- LocalStorage uniquement.
- Export/Import manuel.

## Compatibilite navigateurs

- Chrome recent.
- Edge recent.
- Firefox recent.
- Safari recent.

## Design system

- Typo principale: Space Grotesk.
- Typo titres: Fraunces.
- Style editorial et chaleureux.
- Surfaces souples avec gradients.
- Boutons ronds et accessibles.

## Licence

Distribue sous licence MIT. Voir [LICENSE](LICENSE).

### Exemple JSON

```json
[
	{
		"id": "uuid-1",
		"title": "Preparer la presentation",
		"description": "Structurer les idees et les slides",
		"priority": "high",
		"dueDate": "2026-02-08",
		"completed": false,
		"createdAt": 1707350400000,
		"tags": ["work", "urgent"],
		"checklist": [
			{ "text": "Plan", "done": true },
			{ "text": "Slides", "done": false }
		]
	}
]
```

