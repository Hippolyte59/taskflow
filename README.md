# TaskFlow

[![Project](https://img.shields.io/badge/Project-TaskFlow-1f6feb.svg)](https://github.com/)
[![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-f28c28.svg)](https://github.com/)
[![Storage](https://img.shields.io/badge/Storage-LocalStorage-5c6bc0.svg)](https://developer.mozilla.org/docs/Web/API/Window/localStorage)
[![Theme](https://img.shields.io/badge/Theme-Light%20%26%20Dark-0ea5e9.svg)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-16a34a.svg)](LICENSE)

Local-first task manager built with HTML, CSS, and vanilla JavaScript.
No backend. No build step. Data is stored in browser `localStorage`.

## Summary of what is done

- Built a complete task manager in vanilla HTML/CSS/JS
- Added task creation with title, description, tags, checklist, priority, and due date
- Added full task actions: edit, complete/reopen, delete
- Added search, status filters, and multiple sort modes
- Added drag-and-drop in list mode (manual order)
- Added mini-kanban drag-and-drop between Active and Done
- Added calendar (month/week), navigation, and date-based filtering
- Added JSON export/import with merge or replace flow
- Added light/dark theme toggle with persistence
- Added accessibility basics (skip link, ARIA labels, live status)
- Added browser persistence using `taskflow.tasks` and `taskflow.theme`

## Quick tutorial

### 1) Start the app

1. Open [index.html](index.html) in your browser.
2. The app loads tasks from local storage automatically.

### 2) Create a task

1. Fill `Title` (required).
2. Optionally fill description, tags (comma-separated), checklist (one line per item), priority, due date.
3. Click **Add task**.

### 3) Manage tasks

1. Click **Complete** to mark done, **Reopen** to revert.
2. Click **Edit** to update fields inline, then **Save** or **Cancel**.
3. Click **Delete** to remove a task.

### 4) Organize your view

1. Use filters: **All**, **Active**, **Done**.
2. Use search to match title/description/tags/checklist text.
3. Use sort selector for created date, due date, priority, or manual order.

### 5) Drag and drop

1. Set sort to **Manual order** for list drag-and-drop.
2. Drag task cards between **Active** and **Done** in mini-kanban.

### 6) Use the calendar

1. Switch between **Month** and **Week**.
2. Use **Prev / Today / Next** navigation.
3. Click a date to filter tasks by due date.
4. Click the same date again to clear the date filter.

### 7) Backup and restore

1. Click **Export JSON** to save your tasks.
2. Click **Import JSON** to restore tasks.
3. Choose **replace** or **merge** when prompted.

## What is implemented (from code)

- Task CRUD: add, edit inline, complete/reopen, delete
- Fields: title, description, tags, checklist, priority, due date
- Filters: All / Active / Done
- Search: title, description, tags, checklist text
- Sorting: manual, created (asc/desc), due (asc/desc), priority (asc/desc)
- Drag and drop:
	- manual reordering in list view
	- move cards between Active/Done in mini-kanban
- Calendar:
	- month and week views
	- previous/next/today navigation
	- click a date to filter tasks by due date
- JSON export/import:
	- export current tasks
	- import with replace or merge
	- import max size: 2 MB
- Theme toggle: light/dark persisted in storage
- Accessibility: skip link, live region updates, focus styles, ARIA labels

## Data model

Each task contains:

- `id` (UUID string)
- `title` (required)
- `description`
- `tags` (array)
- `checklist` (array of `{ text, done }`)
- `priority` (`low | medium | high`)
- `dueDate` (`YYYY-MM-DD` or empty)
- `completed` (boolean)
- `createdAt` (timestamp)

## Storage keys

- `taskflow.tasks`
- `taskflow.theme`

## Project files

- [index.html](index.html)
- [style.css](style.css)
- [script.js](script.js)
- [LICENSE](LICENSE)

## Run

Open [index.html](index.html) in a modern browser.

## License

MIT. See [LICENSE](LICENSE).
