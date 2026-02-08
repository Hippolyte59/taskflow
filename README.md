# TaskFlow

[![License](https://img.shields.io/github/license/user/taskflow)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/user/taskflow)](https://github.com/user/taskflow/commits)
[![Stars](https://img.shields.io/github/stars/user/taskflow?style=social)](https://github.com/user/taskflow/stargazers)
[![Issues](https://img.shields.io/github/issues/user/taskflow)](https://github.com/user/taskflow/issues)
[![PRs](https://img.shields.io/github/issues-pr/user/taskflow)](https://github.com/user/taskflow/pulls)

Gestionnaire de taches intelligent en HTML, CSS et JavaScript.
TaskFlow met l'accent sur la rapidite, la clarte visuelle, et la sauvegarde locale.
Pensé pour un usage quotidien, sans back-end, sans compte, et sans friction.

## Table des matieres

- Vision du produit
- Fonctionnalites
- Apercu rapide
- Lancer le projet
- Structure du projet
- Architecture
- Modele de donnees
- Stockage et persistance
- Recherche et filtres
- Tri des taches
- Etiquettes
- Checklist
- Edition inline
- Mode sombre
- Animations et micro-interactions
- Accessibilite
- Performance
- Securite et confidentialite
- Compatibilite navigateurs
- Design system
- Tokens UI
- API interne
- Etats de l'interface
- Scenarios d'usage
- Plan de tests
- Checklist qualite
- Roadmap
- Contribution
- Conventions de code
- Changelog
- FAQ
- Licence

## Vision du produit

- Une app legere, stable, et fiable.
- Une interface lisible sur mobile et desktop.
- Une experience rapide meme avec beaucoup de taches.
- Une sauvegarde locale par defaut.
- Un design clair et chaleureux.
- Une logique simple et explicite.
- Un socle ideal pour evoluer vers un back-end.

## Fonctionnalites

- Ajouter une tache avec titre, description, priorite et echeance.
- Marquer une tache comme terminee.
- Supprimer une tache.
- Filtrer les taches (toutes, en cours, terminees).
- Recherche instantanee.
- Mode sombre.
- Sauvegarde locale via LocalStorage.
- Tri (creation, priorite, echeance).
- Etiquettes et checklist.
- Edition inline.
- Export / import JSON.

## Apercu rapide

- Experience 100% navigateur, aucune dependance.
- Interface fluide avec animations et micro-interactions.
- Donnees conservees en local (sans compte).
- Mode sombre coherent et lisible.
- Export JSON pour sauvegarde manuelle.

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

## Tokens UI

- `--paper`: fond principal.
- `--ink`: texte principal.
- `--accent`: couleur principale.
- `--accent-strong`: accent fort.
- `--muted`: texte secondaire.
- `--card`: surface cartes.
- `--border`: bordures.
- `--shadow`: ombre.
- `--gradient`: fond ambiance.
- `--surface`: surface carte en theme.
- `--tag`: fond tags.
- `--ripple`: couleur ripple.

## API interne

- `loadTasks()` charge le stockage.
- `saveTasks()` persiste l'etat.
- `renderTasks()` construit l'UI.
- `addTask(task)` ajoute une tache.
- `toggleTask(id)` bascule termine.
- `deleteTask(id)` supprime une tache.
- `updateChecklistItem(id, index, done)` met a jour un item.
- `setTheme(theme)` applique le theme.

## Etats de l'interface

- Etat vide sans tache.
- Etat filtre vide.
- Etat edition.
- Etat recherche active.
- Etat tri applique.
- Etat import en cours.

## Scenarios d'usage

- Creer une tache perso simple.
- Creer une tache projet avec checklist.
- Filtrer pour voir uniquement les en cours.
- Chercher par tag.
- Trier par echeance.
- Exporter pour backup.
- Importer pour restaurer.

## Plan de tests

- Ajouter une tache minimaliste.
- Ajouter une tache avec description longue.
- Ajouter une tache avec tags multiples.
- Ajouter une tache avec checklist.
- Marquer terminee.
- Reouvrir une tache.
- Supprimer une tache.
- Filtrer en cours.
- Filtrer terminees.
- Recherche sur titre.
- Recherche sur description.
- Recherche sur tag.
- Recherche sur checklist.
- Tri creation recent.
- Tri creation ancien.
- Tri echeance proche.
- Tri echeance lointaine.
- Tri priorite haute.
- Tri priorite basse.
- Edition inline du titre.
- Edition inline de la description.
- Edition inline des tags.
- Edition inline de checklist.
- Edition inline de la priorite.
- Edition inline de l'echeance.
- Annuler l'edition.
- Enregistrer l'edition.
- Toggle d'un item checklist.
- Export JSON.
- Import JSON valide.
- Import JSON invalide.
- Import JSON merge.
- Import JSON replace.
- Bascule mode sombre.
- Rafraichir page et garder theme.
- Rafraichir page et garder taches.
- Tester sur mobile.
- Tester sur desktop.

## Checklist qualite

- Le titre est requis.
- Le bouton Ajouter est actif.
- Les champs se reinitialisent apres ajout.
- La liste se met a jour immediatement.
- Le compteur de taches est correct.
- L'etat vide est visible si aucun resultat.
- Les boutons sont cliquables sur mobile.
- La navigation reste fluide.
- L'UI reste lisible en dark.
- Le focus est visible sur inputs.
- Les animations restent legeres.
- Le ripple ne deborde pas.
- Les tags sont lisibles.
- Les badges sont lisibles.
- Les checkboxes restent visibles.
- Le texte line-through est lisible.
- Le tri ne casse pas les filtres.
- La recherche respecte le filtre.
- L'import ne casse pas l'app.
- L'export cree un fichier JSON.
- L'app survit a un refresh.
- Aucun appel reseau inutile.
- Pas de console errors.
- Aucune duplication de tags.
- Liste stable quand on edite.
- Edition conserve l'etat checklist.
- La date invalide est geree.
- Le titre vide est refuse.
- Les placeholders sont clairs.
- Le theme sombre est persiste.
- Le theme clair est persiste.
- La police se charge correctement.
- La page reste responsive.
- La toolbar se replie.
- Le footer ne masque rien.

## Roadmap

- Reordonner via drag and drop.
- Tri par statut.
- Rappels locaux.
- Mode focus.
- Archivage des taches.
- Export CSV.
- Synchronisation cloud.
- Auth optionnelle.
- Multi-projets.
- Templates de taches.

## Contribution

- Forker le repo.
- Creer une branche feature.
- Decrire clairement le besoin.
- Garder un scope limite.
- Tester avant PR.
- Respecter le style existant.
- Eviter les dependances lourdes.
- Mettre a jour le README si utile.
- Proposer des captures si UI.
- Etre courtois et precis.

## Conventions de code

- JavaScript clair et lisible.
- Fonctions courtes et explicites.
- Noms de variables explicites.
- Pas de logique cachee.
- Pas de magic numbers.
- Commentaires rares et utiles.
- CSS organise par sections.
- Variables CSS au top du fichier.
- Utiliser des classes explicites.

## Changelog

- 1.0.0: MVP + options avancees.
- 1.0.1: Corrections mineures.
- 1.0.2: Ameliorations UI.

## FAQ

- Q: Faut-il installer Node.js ?
- R: Non, ouvrez simplement le HTML.
- Q: Ou sont stockees les taches ?
- R: Dans le LocalStorage du navigateur.
- Q: Puis-je synchroniser ?
- R: Pas encore, voir roadmap.
- Q: Puis-je changer le theme ?
- R: Oui, bouton Mode sombre.

## Licence

Distribue sous licence MIT. Voir [LICENSE](LICENSE).

## Annexes pro

### Glossaire

- App shell: structure de base chargee au demarrage.
- Badge: indicateur visuel compact.
- Backdrop: fond ambiance.
- Build: etape de compilation.
- Checklist: sous-taches.
- Chip: petit tag arrondi.
- DOM: representation HTML.
- Etat global: source de verite en memoire.
- Filtre: condition d'affichage.
- Focus: element actif.
- Gradient: melange de couleurs.
- Hover: survol souris.
- Inline edit: edition dans la carte.
- LocalStorage: stockage navigateur.
- Mutation: modification d'etat.
- Priorite: importance d'une tache.
- Render: generation HTML.
- Ripple: effet d'onde.
- Router: navigation multi-pages.
- Schema: structure de donnees.
- Sorting: tri des elements.
- State: etat.
- Theme: palette de couleurs.
- Token: variable de design.
- UX: experience utilisateur.
- UI: interface utilisateur.

### Checklist release

- Verifier que la page charge sans erreur.
- Verifier que le mode sombre fonctionne.
- Verifier que le mode clair fonctionne.
- Verifier que les polices se chargent.
- Verifier que les badges s'affichent.
- Verifier que la recherche fonctionne.
- Verifier que le filtre fonctionne.
- Verifier que le tri fonctionne.
- Verifier que les tags s'affichent.
- Verifier que la checklist fonctionne.
- Verifier que l'edition inline fonctionne.
- Verifier que l'export JSON fonctionne.
- Verifier que l'import JSON fonctionne.
- Verifier que l'import invalide est gere.
- Verifier que le merge est correct.
- Verifier que le replace est correct.
- Verifier que le compteur est correct.
- Verifier que l'etat vide est correct.
- Verifier que le ripple est visible.
- Verifier que les animations sont fluides.
- Verifier que le responsive est correct.
- Verifier que les labels sont lisibles.
- Verifier que le contraste est suffisant.
- Verifier que les boutons ont un focus visible.
- Verifier que le clavier peut naviguer.
- Verifier que les inputs sont accessibles.
- Verifier que les dates invalides sont gerees.
- Verifier que les champs se reinitialisent.
- Verifier que les taches persistantes reviennent.
- Verifier que le theme persiste.
- Verifier que le tri persiste apres ajout.
- Verifier que la recherche persiste apres ajout.
- Verifier que les filtres persistent apres ajout.
- Verifier que le scroll reste stable.
- Verifier que les cartes restent lisibles.
- Verifier que les tags vides n'apparaissent pas.
- Verifier que les tags dupliques sont evites.
- Verifier que les accents ne cassent pas.
- Verifier que l'app fonctionne hors ligne.
- Verifier que le texte long ne casse pas.
- Verifier que les listes longues restent fluides.
- Verifier que l'UI ne saute pas.
- Verifier que le footer ne masque rien.
- Verifier que les ombres sont subtiles.
- Verifier que les badges en dark sont lisibles.
- Verifier que le gradient ne gene pas.
- Verifier que les inputs en dark sont lisibles.
- Verifier que les placeholders sont visibles.
- Verifier que le JSON exporte est valide.
- Verifier que le JSON importable est compatible.
- Verifier que l'id est unique.
- Verifier que la suppression est irreversible.
- Verifier que la reouverture fonctionne.
- Verifier que la checklist cochee est visible.
- Verifier que la checklist conserve l'etat.
- Verifier que les tags modifiables restent coherents.
- Verifier que la date vide ne crash pas.
- Verifier que le tri par priorite est correct.
- Verifier que le tri par date est correct.
- Verifier que le tri par creation est correct.
- Verifier que l'app supporte 200+ taches.
- Verifier que le rafraichissement est stable.
- Verifier que la navigation tactile est correcte.
- Verifier que l'app s'ouvre en 1s.
- Verifier que le bundling n'est pas requis.
- Verifier que le code reste simple.

### Scenarios avancés

- Scenario: l'utilisateur ajoute 50 taches.
- Scenario: l'utilisateur filtre en cours.
- Scenario: l'utilisateur cherche un tag.
- Scenario: l'utilisateur edite une tache.
- Scenario: l'utilisateur exporte puis supprime.
- Scenario: l'utilisateur importe pour restaurer.
- Scenario: l'utilisateur bascule theme.
- Scenario: l'utilisateur trie par echeance.
- Scenario: l'utilisateur supprime une tache terminee.
- Scenario: l'utilisateur edite checklist et tags.
- Scenario: l'utilisateur tape vite en recherche.
- Scenario: l'utilisateur change le tri plusieurs fois.
- Scenario: l'utilisateur annule une edition.
- Scenario: l'utilisateur reouvre une tache.
- Scenario: l'utilisateur ouvre en mobile.
- Scenario: l'utilisateur ouvre en desktop.

### Notes produit

- L'app doit rester simple.
- L'app doit rester sans back-end.
- L'app doit rester rapide.
- L'app doit rester lisible.
- L'app doit rester accessible.
- L'app doit rester stable.
- L'app doit rester elegante.
- L'app doit rester maintenable.

### Notes techniques

- Eviter les classes dynamiques complexes.
- Eviter les frameworks lourds.
- Preferer les API natives.
- Garder un code lisible.
- Garder une separation claire.
- Garder des fonctions courtes.
- Garder les transitions simples.

### Notes design

- Palette chaude et douce.
- Fond texturé par gradient.
- Cartes avec ombre moderee.
- Typo serif pour le titre.
- Typo sans serif pour le corps.
- Boutons ronds.
- Badges compacts.
- Tags lisibles.

### Usage pro

- Ideal pour demo de front-end.
- Ideal pour portfolio.
- Ideal pour montrer la logique.
- Ideal pour talk technique.

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

