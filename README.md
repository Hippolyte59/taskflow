# TaskFlow 2026

TaskFlow is a local-first task manager built with plain HTML, CSS and JavaScript.
It runs directly in the browser with no backend and no dependencies.

## What is included in this project

- Create tasks with title, description, tags, checklist, priority and due date
- Edit tasks inline directly in the list
- Mark tasks as complete or reopen them
- Delete tasks
- Filter tasks: All, Active, Done
- Search across title, description, tags and checklist text
- Sort tasks by creation date, due date, or priority
- Live counters (total and done) and completion progress bar
- Export tasks to JSON
- Import tasks from JSON (replace or merge)
- Light/Dark mode toggle with persistence
- Local persistence with LocalStorage
- Responsive UI and motion with reduced-motion support
- Inline SVG logo in the header

No extra features beyond the list above are implemented.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Browser LocalStorage API

## Project structure

- `index.html`: app structure, CSP meta policy, and SVG logo
- `style.css`: full visual system, responsive behavior, animations
- `script.js`: data model, rendering, events, persistence, import/export validation

## Quick start

1. Open `index.html` in a modern browser.
2. Use the form on the left to create your first task.
3. Manage tasks from the list panel.

No installation, build step, or server is required.

## Full tutorial

### 1. Create a task

1. Fill `Title` (required).
2. Optionally fill `Description`.
3. Optionally add `Tags` separated by commas.
4. Optionally add checklist lines (one line = one item).
5. Choose `Priority` and `Due date`.
6. Click `Add task`.

Behavior:

- Empty title is rejected.
- Title/description/tags/checklist are normalized before save.
- New task appears immediately and is persisted to LocalStorage.

### 2. Edit a task

1. Click `Edit` on any task card.
2. Update fields.
3. Click `Save` to persist, or `Cancel` to discard.

Behavior:

- Checklist keeps done states when possible for unchanged item text.
- Invalid/empty title is rejected.

### 3. Complete, reopen, delete

- Click `Complete` to mark done.
- Click `Reopen` to move back to active.
- Click `Delete` to remove the task permanently.

Behavior:

- Counters and progress bar update instantly.
- Changes are persisted to LocalStorage.

### 4. Filter, search, sort

Filters:

- `All`: displays all tasks
- `Active`: displays non-completed tasks
- `Done`: displays completed tasks

Search:

- Search input matches: title, description, tags, checklist text

Sort options:

- Newest / Oldest
- Due soon / Due later
- Priority high / Priority low

### 5. Export and import JSON

Export:

1. Click `Export JSON`.
2. Browser downloads `taskflow-export.json`.

Import:

1. Click `Import JSON`.
2. Select a `.json` file.
3. Confirm `OK` to replace existing tasks, or `Cancel` to merge.

Validation behavior:

- Non-array JSON is rejected.
- Oversized file (> 2 MB) is rejected.
- Invalid entries are filtered out.
- If no valid tasks remain after validation, import is rejected.

### 6. Theme switch

- Click `Dark mode` / `Light mode` button in the header.
- The selected theme is saved and restored on next page load.

## Data model

Each task object uses:

- `id`: string
- `title`: string
- `description`: string
- `tags`: string[]
- `checklist`: `{ text: string, done: boolean }[]`
- `priority`: `low | medium | high`
- `dueDate`: `YYYY-MM-DD` or empty string
- `completed`: boolean
- `createdAt`: number (timestamp)

## Persistence

LocalStorage keys used:

- `taskflow.tasks`
- `taskflow.theme`

## Security and hardening implemented

- Strict Content Security Policy in `index.html`
- No inline script usage
- DOM rendering uses `textContent` instead of raw HTML injection
- Import sanitization and normalization for all task fields
- File size limit for JSON import (2 MB)
- Priority/date validation and type coercion safeguards
- Defensive LocalStorage save/load handling

## Browser compatibility

Designed for modern browsers supporting:

- LocalStorage
- `crypto.randomUUID()`
- `Element.animate()`
- `matchMedia()`

## Limitations (current project scope)

- No account system
- No cloud sync
- No backend API
- No multi-user features

These limitations are intentional and reflect the current codebase only.

## License

MIT. See `LICENSE`.
