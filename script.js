const STORAGE_KEY = "taskflow.tasks";
const THEME_KEY = "taskflow.theme";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const countTotal = document.getElementById("countTotal");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const filterButtons = Array.from(document.querySelectorAll(".filter"));
const sortSelect = document.getElementById("sortSelect");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importInput = document.getElementById("importInput");

const titleInput = document.getElementById("titleInput");
const descInput = document.getElementById("descInput");
const tagsInput = document.getElementById("tagsInput");
const checklistInput = document.getElementById("checklistInput");
const priorityInput = document.getElementById("priorityInput");
const dueInput = document.getElementById("dueInput");

let tasks = [];
let activeFilter = "all";
let searchTerm = "";
let activeSort = "createdDesc";
let editingId = null;
let listUpdateTimer = null;

const loadTasks = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((task) => ({
      ...task,
      tags: Array.isArray(task.tags) ? task.tags : [],
      checklist: Array.isArray(task.checklist) ? task.checklist : [],
    }));
  } catch (error) {
    return [];
  }
};

const saveTasks = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const formatDate = (value) => {
  if (!value) {
    return "Aucune date";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date invalide";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const priorityLabel = (value) => {
  if (value === "high") return "Haute";
  if (value === "low") return "Basse";
  return "Moyenne";
};

const parseTags = (value) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, self) => self.indexOf(tag) === index);

const parseChecklist = (value) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text) => ({ text, done: false }));

const escapeHtml = (value) => {
  const str = String(value ?? "");
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
    "`": "&#096;",
  };
  return str.replace(/[&<>"'`]/g, (char) => map[char]);
};

const mergeChecklist = (existing, nextLines) => {
  const lookup = new Map(existing.map((item) => [item.text, item.done]));
  return nextLines.map((text) => ({
    text,
    done: lookup.get(text) ?? false,
  }));
};

const priorityScore = (value) => {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
};

const sortTasks = (list) => {
  const sorted = [...list];
  sorted.sort((a, b) => {
    if (activeSort === "createdAsc") return a.createdAt - b.createdAt;
    if (activeSort === "createdDesc") return b.createdAt - a.createdAt;
    if (activeSort === "dueAsc") {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    }
    if (activeSort === "dueDesc") {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return bTime - aTime;
    }
    if (activeSort === "priorityAsc") return priorityScore(a.priority) - priorityScore(b.priority);
    if (activeSort === "priorityDesc") return priorityScore(b.priority) - priorityScore(a.priority);
    return 0;
  });
  return sorted;
};

const animateListUpdate = () => {
  taskList.classList.add("is-updating");
  if (listUpdateTimer) {
    clearTimeout(listUpdateTimer);
  }
  listUpdateTimer = setTimeout(() => {
    taskList.classList.remove("is-updating");
  }, 220);
};

const renderTasks = () => {
  animateListUpdate();

  const filtered = tasks.filter((task) => {
    if (activeFilter === "active" && task.completed) return false;
    if (activeFilter === "done" && !task.completed) return false;
    if (searchTerm) {
      const tags = Array.isArray(task.tags) ? task.tags.join(" ") : "";
      const checklist = Array.isArray(task.checklist)
        ? task.checklist.map((item) => item.text).join(" ")
        : "";
      const haystack = `${task.title} ${task.description} ${tags} ${checklist}`.toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }
    return true;
  });

  taskList.innerHTML = "";

  const sorted = sortTasks(filtered);

  sorted.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = `task ${task.completed ? "completed" : ""}`.trim();
    item.style.animationDelay = `${index * 40}ms`;
    item.dataset.id = task.id;

    if (editingId === task.id) {
      const checklistLines = task.checklist.map((item) => item.text).join("\n");
      const safeTitle = escapeHtml(task.title);
      const safeDescription = escapeHtml(task.description || "");
      const safeTags = escapeHtml(task.tags.join(", "));
      const safeChecklist = escapeHtml(checklistLines);
      const safeDueDate = escapeHtml(task.dueDate || "");
      item.innerHTML = `
        <div class="task-edit">
          <label>
            Titre
            <input data-edit="title" type="text" value="${safeTitle}" />
          </label>
          <label>
            Description
            <textarea data-edit="description" rows="3">${safeDescription}</textarea>
          </label>
          <label>
            Etiquettes
            <input data-edit="tags" type="text" value="${safeTags}" />
          </label>
          <label>
            Checklist
            <textarea data-edit="checklist" rows="4">${safeChecklist}</textarea>
          </label>
          <div class="row">
            <label>
              Priorite
              <select data-edit="priority">
                <option value="low" ${task.priority === "low" ? "selected" : ""}>Basse</option>
                <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Moyenne</option>
                <option value="high" ${task.priority === "high" ? "selected" : ""}>Haute</option>
              </select>
            </label>
            <label>
              Echeance
              <input data-edit="dueDate" type="date" value="${safeDueDate}" />
            </label>
          </div>
          <div class="edit-actions">
            <button class="primary ripple" data-action="save" type="button">Enregistrer</button>
            <button class="ghost ripple" data-action="cancel" type="button">Annuler</button>
          </div>
        </div>
      `;
    } else {
      const safeTitle = escapeHtml(task.title);
      const safeDescription = escapeHtml(task.description || "Aucune description");
      const tags = task.tags.length
        ? task.tags
            .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
            .join("")
        : "<span class=\"tag\">Sans etiquette</span>";
      const checklist = task.checklist.length
        ? `
          <ul class="checklist">
            ${task.checklist
              .map(
                (item, itemIndex) => `
                <li>
                  <label>
                    <input data-action="check-item" data-index="${itemIndex}" type="checkbox" ${
                      item.done ? "checked" : ""
                    } />
                    <span>${escapeHtml(item.text)}</span>
                  </label>
                </li>
              `
              )
              .join("")}
          </ul>
        `
        : "";

      item.innerHTML = `
        <div class="task-header">
          <div>
            <div class="task-title">${safeTitle}</div>
            <div class="task-meta">
              <span class="badge ${task.priority}">Priorite ${priorityLabel(
                task.priority
              )}</span>
              <span class="badge">Echeance ${formatDate(task.dueDate)}</span>
            </div>
          </div>
          <div class="task-actions">
            <button class="ripple" data-action="toggle" aria-label="Basculer terminee">
              ${task.completed ? "Reouvrir" : "Terminer"}
            </button>
            <button class="ripple" data-action="edit" aria-label="Editer">
              Editer
            </button>
            <button class="ripple" data-action="delete" aria-label="Supprimer">
              Supprimer
            </button>
          </div>
        </div>
        <p class="task-description">${safeDescription}</p>
        <div class="tag-list">${tags}</div>
        ${checklist}
      `;
    }

    taskList.appendChild(item);
  });

  countTotal.textContent = tasks.length.toString();
  emptyState.style.display = filtered.length === 0 ? "block" : "none";
};

const addTask = (task) => {
  tasks.unshift(task);
  saveTasks();
  renderTasks();
};

const toggleTask = (id) => {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
};

const deleteTask = (id) => {
  tasks = tasks.filter((task) => task.id !== id);
  if (editingId === id) {
    editingId = null;
  }
  saveTasks();
  renderTasks();
};

const updateChecklistItem = (id, index, done) => {
  tasks = tasks.map((task) => {
    if (task.id !== id) return task;
    const nextChecklist = task.checklist.map((item, itemIndex) =>
      itemIndex === index ? { ...item, done } : item
    );
    return { ...task, checklist: nextChecklist };
  });
  saveTasks();
  renderTasks();
};

const setTheme = (theme) => {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "Mode clair";
    themeToggle.setAttribute("aria-pressed", "true");
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeToggle.textContent = "Mode sombre";
    themeToggle.setAttribute("aria-pressed", "false");
  }
  localStorage.setItem(THEME_KEY, theme);
};

const initTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark") {
    setTheme("dark");
    return;
  }
  setTheme("light");
};

const init = () => {
  tasks = loadTasks();
  renderTasks();
  initTheme();
  requestAnimationFrame(() => {
    document.body.classList.add("page-loaded");
  });
};

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    return;
  }

  const newTask = {
    id: crypto.randomUUID(),
    title,
    description: descInput.value.trim(),
    tags: parseTags(tagsInput.value),
    checklist: parseChecklist(checklistInput.value),
    priority: priorityInput.value,
    dueDate: dueInput.value,
    completed: false,
    createdAt: Date.now(),
  };

  addTask(newTask);
  taskForm.reset();
  priorityInput.value = "medium";
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderTasks();
  });
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderTasks();
});

sortSelect.addEventListener("change", (event) => {
  activeSort = event.target.value;
  renderTasks();
});

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  setTheme(isDark ? "light" : "dark");
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "taskflow-export.json";
  link.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener("click", () => {
  importInput.value = "";
  importInput.click();
});

importInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed)) {
        return;
      }
      const nextTasks = parsed.map((task) => ({
        id: task.id || crypto.randomUUID(),
        title: task.title || "Sans titre",
        description: task.description || "",
        tags: Array.isArray(task.tags) ? task.tags : [],
        checklist: Array.isArray(task.checklist) ? task.checklist : [],
        priority: task.priority || "medium",
        dueDate: task.dueDate || "",
        completed: Boolean(task.completed),
        createdAt: Number(task.createdAt) || Date.now(),
      }));

      const replace = window.confirm(
        "Remplacer les taches existantes ?\nOK = remplacer, Annuler = fusionner."
      );
      tasks = replace ? nextTasks : [...nextTasks, ...tasks];
      saveTasks();
      renderTasks();
    } catch (error) {
      alert("Import JSON invalide.");
      return;
    }
  };
  reader.readAsText(file);
});

taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  if (!action) return;
  const item = button.closest("li");
  if (!item) return;
  const id = item.dataset.id;

  if (action === "toggle") {
    toggleTask(id);
  }
  if (action === "delete") {
    deleteTask(id);
  }
  if (action === "edit") {
    editingId = id;
    renderTasks();
  }
  if (action === "cancel") {
    editingId = null;
    renderTasks();
  }
  if (action === "save") {
    const title = item.querySelector("[data-edit='title']").value.trim();
    if (!title) return;
    const description = item
      .querySelector("[data-edit='description']")
      .value.trim();
    const tags = parseTags(item.querySelector("[data-edit='tags']").value);
    const checklistLines = item
      .querySelector("[data-edit='checklist']")
      .value.split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const priority = item.querySelector("[data-edit='priority']").value;
    const dueDate = item.querySelector("[data-edit='dueDate']").value;

    tasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return {
        ...task,
        title,
        description,
        tags,
        checklist: mergeChecklist(task.checklist, checklistLines),
        priority,
        dueDate,
      };
    });
    editingId = null;
    saveTasks();
    renderTasks();
  }
});

taskList.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.dataset.action !== "check-item") return;
  const item = input.closest("li");
  if (!item) return;
  const id = item.dataset.id;
  const index = Number(input.dataset.index);
  updateChecklistItem(id, index, input.checked);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".ripple");
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const circle = document.createElement("span");
  const size = Math.max(rect.width, rect.height);
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;
  circle.style.left = `${event.clientX - rect.left - size / 2}px`;
  circle.style.top = `${event.clientY - rect.top - size / 2}px`;
  button.appendChild(circle);
  circle.addEventListener("animationend", () => {
    circle.remove();
  });
});

init();
 