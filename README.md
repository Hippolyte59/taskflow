# TaskFlow

[![Project](https://img.shields.io/badge/Project-TaskFlow-1f6feb.svg)](https://github.com/)
[![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-f28c28.svg)](https://github.com/)
[![Storage](https://img.shields.io/badge/Storage-LocalStorage-5c6bc0.svg)](https://developer.mozilla.org/docs/Web/API/Window/localStorage)
[![Mode](https://img.shields.io/badge/Mode-Dark%20%26%20Light-0ea5e9.svg)](https://github.com/)
[![Status](https://img.shields.io/badge/Status-Active-22c55e.svg)](https://github.com/)
[![UX](https://img.shields.io/badge/UX-Animations%20%26%20Micro--interactions-f97316.svg)](https://github.com/)
[![Focus](https://img.shields.io/badge/Focus-Productivity-7c3aed.svg)](https://github.com/)
[![Offline](https://img.shields.io/badge/Offline-Ready-14b8a6.svg)](https://github.com/)
[![Responsive](https://img.shields.io/badge/Responsive-Yes-ec4899.svg)](https://github.com/)
[![No Back--end](https://img.shields.io/badge/Back--end-None-64748b.svg)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-16a34a.svg)](LICENSE)

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

