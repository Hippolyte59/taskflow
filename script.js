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
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

const createEl = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
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

  while (taskList.firstChild) {
    taskList.removeChild(taskList.firstChild);
  }

  const sorted = sortTasks(filtered);

  sorted.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = `task ${task.completed ? "completed" : ""}`.trim();
    item.dataset.id = task.id;

    if (!prefersReducedMotion) {
      item.animate(
        [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 350,
          easing: "ease",
          fill: "both",
          delay: index * 40,
        }
      );
    }

    if (editingId === task.id) {
      const checklistLines = task.checklist.map((item) => item.text).join("\n");
      const editWrap = createEl("div", "task-edit");

      const titleLabel = document.createElement("label");
      titleLabel.append("Titre");
      const titleInputEl = document.createElement("input");
      titleInputEl.type = "text";
      titleInputEl.dataset.edit = "title";
      titleInputEl.value = task.title;
      titleLabel.append(titleInputEl);

      const descLabel = document.createElement("label");
      descLabel.append("Description");
      const descTextarea = document.createElement("textarea");
      descTextarea.rows = 3;
      descTextarea.dataset.edit = "description";
      descTextarea.value = task.description || "";
      descLabel.append(descTextarea);

      const tagsLabel = document.createElement("label");
      tagsLabel.append("Etiquettes");
      const tagsInputEl = document.createElement("input");
      tagsInputEl.type = "text";
      tagsInputEl.dataset.edit = "tags";
      tagsInputEl.value = task.tags.join(", ");
      tagsLabel.append(tagsInputEl);

      const checklistLabel = document.createElement("label");
      checklistLabel.append("Checklist");
      const checklistTextarea = document.createElement("textarea");
      checklistTextarea.rows = 4;
      checklistTextarea.dataset.edit = "checklist";
      checklistTextarea.value = checklistLines;
      checklistLabel.append(checklistTextarea);

      const row = createEl("div", "row");

      const priorityLabelEl = document.createElement("label");
      priorityLabelEl.append("Priorite");
      const prioritySelect = document.createElement("select");
      prioritySelect.dataset.edit = "priority";
      [
        { value: "low", label: "Basse" },
        { value: "medium", label: "Moyenne" },
        { value: "high", label: "Haute" },
      ].forEach((optionData) => {
        const option = document.createElement("option");
        option.value = optionData.value;
        option.textContent = optionData.label;
        if (task.priority === optionData.value) {
          option.selected = true;
        }
        prioritySelect.appendChild(option);
      });
      priorityLabelEl.append(prioritySelect);

      const dueLabel = document.createElement("label");
      dueLabel.append("Echeance");
      const dueInputEl = document.createElement("input");
      dueInputEl.type = "date";
      dueInputEl.dataset.edit = "dueDate";
      dueInputEl.value = task.dueDate || "";
      dueLabel.append(dueInputEl);

      row.append(priorityLabelEl, dueLabel);

      const actions = createEl("div", "edit-actions");
      const saveButton = createEl("button", "primary ripple", "Enregistrer");
      saveButton.dataset.action = "save";
      saveButton.type = "button";
      const cancelButton = createEl("button", "ghost ripple", "Annuler");
      cancelButton.dataset.action = "cancel";
      cancelButton.type = "button";
      actions.append(saveButton, cancelButton);

      editWrap.append(titleLabel, descLabel, tagsLabel, checklistLabel, row, actions);
      item.appendChild(editWrap);
    } else {
      const header = createEl("div", "task-header");
      const left = document.createElement("div");
      const title = createEl("div", "task-title", task.title);

      const meta = createEl("div", "task-meta");
      const priorityBadge = createEl(
        "span",
        `badge ${task.priority}`,
        `Priorite ${priorityLabel(task.priority)}`
      );
      const dueBadge = createEl("span", "badge", `Echeance ${formatDate(task.dueDate)}`);
      meta.append(priorityBadge, dueBadge);
      left.append(title, meta);

      const actions = createEl("div", "task-actions");
      const toggleButton = createEl(
        "button",
        "ripple",
        task.completed ? "Reouvrir" : "Terminer"
      );
      toggleButton.dataset.action = "toggle";
      toggleButton.setAttribute("aria-label", "Basculer terminee");

      const editButton = createEl("button", "ripple", "Editer");
      editButton.dataset.action = "edit";
      editButton.setAttribute("aria-label", "Editer");

      const deleteButton = createEl("button", "ripple", "Supprimer");
      deleteButton.dataset.action = "delete";
      deleteButton.setAttribute("aria-label", "Supprimer");

      actions.append(toggleButton, editButton, deleteButton);
      header.append(left, actions);

      const description = createEl(
        "p",
        "task-description",
        task.description || "Aucune description"
      );

      const tagList = createEl("div", "tag-list");
      if (task.tags.length) {
        task.tags.forEach((tag) => {
          tagList.appendChild(createEl("span", "tag", tag));
        });
      } else {
        tagList.appendChild(createEl("span", "tag", "Sans etiquette"));
      }

      item.append(header, description, tagList);

      if (task.checklist.length) {
        const checklist = createEl("ul", "checklist");
        task.checklist.forEach((checkItem, itemIndex) => {
          const listItem = document.createElement("li");
          const label = document.createElement("label");
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.dataset.action = "check-item";
          checkbox.dataset.index = String(itemIndex);
          checkbox.checked = Boolean(checkItem.done);
          const text = createEl("span", "", checkItem.text);
          label.append(checkbox, text);
          listItem.appendChild(label);
          checklist.appendChild(listItem);
        });
        item.appendChild(checklist);
      }
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
  circle.className = "ripple-circle";
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  button.appendChild(circle);
  if (prefersReducedMotion) {
    circle.remove();
    return;
  }
  const animation = circle.animate(
    [
      { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 1 },
      { transform: `translate(${x}px, ${y}px) scale(${size})`, opacity: 0 },
    ],
    {
      duration: 600,
      easing: "linear",
    }
  );
  animation.finished
    .then(() => {
      circle.remove();
    })
    .catch(() => {
      circle.remove();
    });
});

init();
 