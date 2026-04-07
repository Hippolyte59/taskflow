# TaskFlow

[![Project](https://img.shields.io/badge/Project-TaskFlow-1f6feb.svg)](https://github.com/)
[![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JS-f28c28.svg)](https://github.com/)
[![Storage](https://img.shields.io/badge/Storage-LocalStorage-5c6bc0.svg)](https://developer.mozilla.org/docs/Web/API/Window/localStorage)
[![Theme](https://img.shields.io/badge/Theme-Light%20%26%20Dark-0ea5e9.svg)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-16a34a.svg)](LICENSE)

Local-first task manager built with HTML, CSS, and vanilla JavaScript.
No backend and no build step. Data is persisted in browser `localStorage`.

## Table of contents

- [Project summary](#project-summary)
- [Features implemented](#features-implemented)
- [Quick tutorial](#quick-tutorial)
- [Data model](#data-model)
- [Storage keys](#storage-keys)
- [Project files](#project-files)
- [Run](#run)
- [License](#license)

## Project summary

This project includes:

- A full task workflow (create, edit, complete/reopen, delete)
- Organization tools (filters, search, sorting, drag-and-drop)
- Planning views (calendar month/week + mini-kanban)
- Local backup/restore (JSON export/import)
- Theme persistence and accessibility basics

## Features implemented

- Task fields: title, description, tags, checklist, priority, due date
- Status filters: All / Active / Done
- Search on title, description, tags, checklist text
- Sorting: manual, created (asc/desc), due (asc/desc), priority (asc/desc)
- Drag-and-drop list reorder (manual mode only)
- Mini-kanban drag-and-drop between Active and Done
- Calendar month/week + previous/next/today navigation
- Click date to filter tasks by due date
- JSON export and import (replace or merge)
- Import size validation (2 MB max)
- Light/dark mode saved in storage
- Accessibility: skip link, focus styles, live status announcements, ARIA labels

## Quick tutorial

### 1) Start

1. Open [index.html](index.html) in your browser.
2. Existing tasks and theme are loaded automatically from local storage.

### 2) Create a task

1. Fill `Title` (required).
2. Optionally fill description, tags, checklist, priority, and due date.
3. Click **Add task**.

### 3) Manage tasks

1. Use **Complete/Reopen** to change status.
2. Use **Edit** to update task fields inline, then **Save** or **Cancel**.
3. Use **Delete** to remove a task.

### 4) Organize work

1. Apply filters: **All**, **Active**, **Done**.
2. Use search to find tasks quickly.
3. Choose sort mode from the selector.

### 5) Drag and drop

1. Set sorting to **Manual order** for list reordering.
2. Drag cards between **Active** and **Done** columns in mini-kanban.

### 6) Calendar filter

1. Switch between **Month** and **Week**.
2. Navigate with **Prev / Today / Next**.
3. Click a day to filter by due date; click again to clear.

### 7) Backup and restore

1. Click **Export JSON** to save tasks.
2. Click **Import JSON** to load tasks.
3. Choose **replace** or **merge** when prompted.

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

Open [index.html](index.html) in any modern browser.

## License

MIT. See [LICENSE](LICENSE).
