const STORAGE_KEY = "taskflow.tasks";
const THEME_KEY = "taskflow.theme";
const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 240;
const MAX_TAG_LENGTH = 24;
const MAX_TAGS = 12;
const MAX_CHECKLIST_ITEMS = 50;
const MAX_CHECKLIST_TEXT_LENGTH = 120;
const MAX_IMPORT_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const VALID_PRIORITIES = new Set(["low", "medium", "high"]);

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const countTotal = document.getElementById("countTotal");
const countDone = document.getElementById("countDone");
const progressFill = document.getElementById("progressFill");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const filterButtons = Array.from(document.querySelectorAll(".filter"));
const sortSelect = document.getElementById("sortSelect");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importInput = document.getElementById("importInput");
const statusLive = document.getElementById("statusLive");
const progressBar = document.querySelector(".progress-shell");
const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const calendarToday = document.getElementById("calendarToday");
const calendarViewMonth = document.getElementById("calendarViewMonth");
const calendarViewWeek = document.getElementById("calendarViewWeek");
const kanbanActive = document.getElementById("kanbanActive");
const kanbanDone = document.getElementById("kanbanDone");

const titleInput = document.getElementById("titleInput");
const descInput = document.getElementById("descInput");
const tagsInput = document.getElementById("tagsInput");
const checklistInput = document.getElementById("checklistInput");
const priorityInput = document.getElementById("priorityInput");
const dueInput = document.getElementById("dueInput");

let tasks = [];
let activeFilter = "all";
let searchTerm = "";
let activeSort = "manual";
let editingId = null;
let listUpdateTimer = null;
let selectedDueDate = "";
let calendarCursor = new Date();
let draggedTaskId = null;
let calendarView = "month";
let draggedKanbanTaskId = null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const announce = (message) => {
  if (!statusLive) {
    return;
  }
  statusLive.textContent = "";
  requestAnimationFrame(() => {
    statusLive.textContent = message;
  });
};

const updateFilterA11yState = (activeButton) => {
  filterButtons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.setAttribute("tabindex", isActive ? "0" : "-1");
  });
  const labelledBy = activeButton?.id || "filter-all";
  taskList.setAttribute("aria-labelledby", labelledBy);
};

const clampText = (value, maxLength) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, maxLength);
};

const normalizeDueDate = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return "";
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? "" : trimmed;
};

const normalizeTags = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  const unique = [];
  const seen = new Set();
  value.forEach((tag) => {
    const cleanTag = clampText(String(tag ?? ""), MAX_TAG_LENGTH);
    if (!cleanTag) {
      return;
    }
    const key = cleanTag.toLowerCase();
    if (seen.has(key) || unique.length >= MAX_TAGS) {
      return;
    }
    seen.add(key);
    unique.push(cleanTag);
  });
  return unique;
};

const normalizeChecklist = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .slice(0, MAX_CHECKLIST_ITEMS)
    .map((item) => {
      const text = clampText(String(item?.text ?? ""), MAX_CHECKLIST_TEXT_LENGTH);
      return {
        text,
        done: Boolean(item?.done),
      };
    })
    .filter((item) => item.text.length > 0);
};

const normalizePriority = (value) => {
  return VALID_PRIORITIES.has(value) ? value : "medium";
};

const normalizeTask = (value) => {
  const title = clampText(String(value?.title ?? ""), MAX_TITLE_LENGTH);
  if (!title) {
    return null;
  }
  const createdAtRaw = Number(value?.createdAt);
  const createdAt = Number.isFinite(createdAtRaw) ? createdAtRaw : Date.now();

  return {
    id: typeof value?.id === "string" && value.id.trim() ? value.id.trim() : crypto.randomUUID(),
    title,
    description: clampText(String(value?.description ?? ""), MAX_DESCRIPTION_LENGTH),
    tags: normalizeTags(value?.tags),
    checklist: normalizeChecklist(value?.checklist),
    priority: normalizePriority(value?.priority),
    dueDate: normalizeDueDate(value?.dueDate),
    completed: Boolean(value?.completed),
    createdAt,
  };
};

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
    return parsed
      .slice(0, 5000)
      .map((task) => normalizeTask(task))
      .filter(Boolean);
  } catch (error) {
    return [];
  }
};

const saveTasks = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    alert("Unable to save tasks in local storage.");
  }
};

const formatDate = (value) => {
  if (!value) {
    return "No date";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const priorityLabel = (value) => {
  if (value === "high") return "High";
  if (value === "low") return "Low";
  return "Medium";
};

const parseTags = (value) =>
  normalizeTags(value.split(","));

const parseChecklist = (value) =>
  normalizeChecklist(
    value
      .split("\n")
      .map((line) => ({ text: line, done: false }))
  );

const mergeChecklist = (existing, nextLines) => {
  const lookup = new Map(existing.map((item) => [item.text, item.done]));
  return normalizeChecklist(
    nextLines.map((text) => ({
      text,
      done: lookup.get(text) ?? false,
    }))
  );
};

const priorityScore = (value) => {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
};

const sortTasks = (list) => {
  if (activeSort === "manual") {
    return [...list];
  }
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
  taskList.setAttribute("aria-busy", "true");

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
    if (selectedDueDate && task.dueDate !== selectedDueDate) return false;
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
    item.dataset.priority = task.priority;
    item.draggable = activeSort === "manual";

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
      titleLabel.append("Title");
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
      tagsLabel.append("Tags");
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
      priorityLabelEl.append("Priority");
      const prioritySelect = document.createElement("select");
      prioritySelect.dataset.edit = "priority";
      [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
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
      dueLabel.append("Due date");
      const dueInputEl = document.createElement("input");
      dueInputEl.type = "date";
      dueInputEl.dataset.edit = "dueDate";
      dueInputEl.value = task.dueDate || "";
      dueLabel.append(dueInputEl);

      row.append(priorityLabelEl, dueLabel);

      const actions = createEl("div", "edit-actions");
      const saveButton = createEl("button", "primary ripple", "Save");
      saveButton.dataset.action = "save";
      saveButton.type = "button";
      const cancelButton = createEl("button", "ghost ripple", "Cancel");
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
        `Priority ${priorityLabel(task.priority)}`
      );
      const dueBadge = createEl("span", "badge", `Due ${formatDate(task.dueDate)}`);
      meta.append(priorityBadge, dueBadge);
      left.append(title, meta);

      const actions = createEl("div", "task-actions");
      const grip = createEl("span", "task-grip", "Move");
      grip.setAttribute("aria-hidden", "true");
      const toggleButton = createEl(
        "button",
        "ripple",
        task.completed ? "Reopen" : "Complete"
      );
      toggleButton.dataset.action = "toggle";
      toggleButton.setAttribute("aria-label", `Toggle completed status for ${task.title}`);

      const editButton = createEl("button", "ripple", "Edit");
      editButton.dataset.action = "edit";
      editButton.setAttribute("aria-label", `Edit task ${task.title}`);

      const deleteButton = createEl("button", "ripple", "Delete");
      deleteButton.dataset.action = "delete";
      deleteButton.setAttribute("aria-label", `Delete task ${task.title}`);

      actions.append(grip, toggleButton, editButton, deleteButton);
      header.append(left, actions);

      const description = createEl(
        "p",
        "task-description",
        task.description || "No description"
      );

      const tagList = createEl("div", "tag-list");
      if (task.tags.length) {
        task.tags.forEach((tag) => {
          tagList.appendChild(createEl("span", "tag", tag));
        });
      } else {
        tagList.appendChild(createEl("span", "tag", "No tags"));
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
  const completedCount = tasks.filter((task) => task.completed).length;
  countDone.textContent = completedCount.toString();
  const completionRatio = tasks.length ? (completedCount / tasks.length) * 100 : 0;
  progressFill.style.width = `${completionRatio}%`;
  if (progressBar) {
    progressBar.setAttribute("aria-valuenow", `${Math.round(completionRatio)}`);
  }
  emptyState.style.display = filtered.length === 0 ? "block" : "none";
  taskList.setAttribute("aria-busy", "false");
  renderKanban();
  renderCalendar();
};

const reorderTasks = (sourceId, targetId) => {
  if (!sourceId || !targetId || sourceId === targetId) {
    return;
  }
  const sourceIndex = tasks.findIndex((task) => task.id === sourceId);
  const targetIndex = tasks.findIndex((task) => task.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) {
    return;
  }
  const [moved] = tasks.splice(sourceIndex, 1);
  tasks.splice(targetIndex, 0, moved);
  saveTasks();
  renderTasks();
  announce(`Task moved: ${moved.title}`);
};

const toIsoDate = (dateValue) => {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfWeek = (dateValue) => {
  const next = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  next.setHours(0, 0, 0, 0);
  return next;
};

const renderKanban = () => {
  if (!kanbanActive || !kanbanDone) {
    return;
  }

  kanbanActive.innerHTML = "";
  kanbanDone.innerHTML = "";

  tasks.forEach((task) => {
    const card = document.createElement("li");
    card.className = "kanban-card";
    card.draggable = true;
    card.dataset.id = task.id;

    const title = createEl("p", "kanban-card-title", task.title);
    const metaText = `${priorityLabel(task.priority)}${task.dueDate ? ` • ${formatDate(task.dueDate)}` : ""}`;
    const meta = createEl("p", "kanban-card-meta", metaText);
    card.append(title, meta);

    if (task.completed) {
      kanbanDone.appendChild(card);
    } else {
      kanbanActive.appendChild(card);
    }
  });
};

const moveTaskToColumn = (taskId, toCompleted) => {
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index < 0) {
    return;
  }
  const [moved] = tasks.splice(index, 1);
  moved.completed = toCompleted;

  const insertAt = tasks.findIndex((task) => task.completed === toCompleted);
  if (insertAt === -1) {
    tasks.push(moved);
  } else {
    tasks.splice(insertAt, 0, moved);
  }

  saveTasks();
  renderTasks();
  announce(`Task moved to ${toCompleted ? "Done" : "Active"}: ${moved.title}`);
};

const renderCalendar = () => {
  if (!calendarGrid || !calendarMonthLabel) {
    return;
  }

  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const dayIndex = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dueCountByDate = new Map();
  tasks.forEach((task) => {
    if (!task.dueDate) {
      return;
    }
    dueCountByDate.set(task.dueDate, (dueCountByDate.get(task.dueDate) || 0) + 1);
  });

  if (calendarView === "month") {
    calendarMonthLabel.textContent = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(firstDay);
  }

  calendarGrid.innerHTML = "";
  calendarGrid.classList.toggle("week-mode", calendarView === "week");

  const today = toIsoDate(new Date());

  const appendDayButton = (dateValue, isMuted = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    const isoDate = toIsoDate(dateValue);
    button.textContent = String(dateValue.getDate());
    button.dataset.date = isoDate;
    if (isMuted) {
      button.classList.add("muted");
    }
    if (isoDate === today) {
      button.classList.add("today");
    }
    if (dueCountByDate.has(isoDate)) {
      button.classList.add("has-due");
      button.setAttribute("aria-label", `${isoDate}, ${dueCountByDate.get(isoDate)} task due`);
    } else {
      button.setAttribute("aria-label", `${isoDate}, no task due`);
    }
    if (selectedDueDate && selectedDueDate === isoDate) {
      button.classList.add("selected");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }
    calendarGrid.appendChild(button);
  };

  if (calendarView === "week") {
    const weekStart = startOfWeek(calendarCursor);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    calendarMonthLabel.textContent = `${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(weekStart)} - ${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(weekEnd)}`;

    for (let i = 0; i < 7; i += 1) {
      const current = new Date(weekStart);
      current.setDate(weekStart.getDate() + i);
      const isMuted = current.getMonth() !== calendarCursor.getMonth();
      appendDayButton(current, isMuted);
    }
    return;
  }

  for (let i = 0; i < dayIndex; i += 1) {
    const blank = document.createElement("div");
    blank.className = "calendar-day muted";
    blank.setAttribute("aria-hidden", "true");
    calendarGrid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateValue = new Date(year, month, day);
    appendDayButton(dateValue);
  }
};

const addTask = (task) => {
  tasks.unshift(task);
  saveTasks();
  renderTasks();
  announce(`Task added: ${task.title}`);
};

const toggleTask = (id) => {
  let toggledTaskTitle = "";
  let completed = false;
  tasks = tasks.map((task) =>
    task.id === id
      ? (() => {
          toggledTaskTitle = task.title;
          completed = !task.completed;
          return { ...task, completed };
        })()
      : task
  );
  saveTasks();
  renderTasks();
  if (toggledTaskTitle) {
    announce(`Task ${completed ? "completed" : "reopened"}: ${toggledTaskTitle}`);
  }
};

const deleteTask = (id) => {
  const removed = tasks.find((task) => task.id === id);
  tasks = tasks.filter((task) => task.id !== id);
  if (editingId === id) {
    editingId = null;
  }
  saveTasks();
  renderTasks();
  if (removed) {
    announce(`Task deleted: ${removed.title}`);
  }
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
  announce("Checklist updated.");
};

const setTheme = (theme) => {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "Light mode";
    themeToggle.setAttribute("aria-pressed", "true");
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeToggle.textContent = "Dark mode";
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
  updateFilterA11yState(filterButtons.find((button) => button.classList.contains("active")));
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

  const newTask = normalizeTask({
    id: crypto.randomUUID(),
    title: clampText(title, MAX_TITLE_LENGTH),
    description: clampText(descInput.value, MAX_DESCRIPTION_LENGTH),
    tags: parseTags(tagsInput.value),
    checklist: parseChecklist(checklistInput.value),
    priority: normalizePriority(priorityInput.value),
    dueDate: normalizeDueDate(dueInput.value),
    completed: false,
    createdAt: Date.now(),
  });

  if (!newTask) {
    titleInput.focus();
    return;
  }

  addTask(newTask);
  taskForm.reset();
  priorityInput.value = "medium";
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateFilterA11yState(button);
    activeFilter = button.dataset.filter;
    renderTasks();
    announce(`Filter applied: ${button.textContent.trim()}`);
  });

  button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    const currentIndex = filterButtons.indexOf(button);
    const nextIndex =
      event.key === "ArrowRight"
        ? (currentIndex + 1) % filterButtons.length
        : (currentIndex - 1 + filterButtons.length) % filterButtons.length;
    const nextButton = filterButtons[nextIndex];
    nextButton.focus();
    nextButton.click();
  });
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderTasks();
});

sortSelect.addEventListener("change", (event) => {
  activeSort = event.target.value;
  renderTasks();
  announce(`Sort changed: ${sortSelect.options[sortSelect.selectedIndex].text}`);
  if (activeSort !== "manual") {
    announce("Drag and drop is available in Manual order only.");
  }
});

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  setTheme(isDark ? "light" : "dark");
  announce(`Theme switched to ${isDark ? "light" : "dark"} mode.`);
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
  announce("Tasks exported to JSON.");
});

importBtn.addEventListener("click", () => {
  importInput.value = "";
  importInput.click();
});

importInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    alert("Import file too large. Max size is 2 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onerror = () => {
    alert("Unable to read the selected file.");
  };
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed)) {
        alert("Invalid JSON import.");
        return;
      }
      const nextTasks = parsed
        .map((task) => normalizeTask(task))
        .filter(Boolean);

      if (!nextTasks.length) {
        alert("No valid tasks found in the imported file.");
        return;
      }

      const replace = window.confirm(
        "Replace existing tasks?\nOK = replace, Cancel = merge."
      );
      tasks = replace ? nextTasks : [...nextTasks, ...tasks];
      saveTasks();
      renderTasks();
      announce(`Imported ${nextTasks.length} task${nextTasks.length > 1 ? "s" : ""}.`);
    } catch (error) {
      alert("Invalid JSON import.");
      return;
    }
  };
  reader.readAsText(file);
});

calendarPrev?.addEventListener("click", () => {
  if (calendarView === "week") {
    const next = new Date(calendarCursor);
    next.setDate(next.getDate() - 7);
    calendarCursor = next;
  } else {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
  }
  renderCalendar();
});

calendarNext?.addEventListener("click", () => {
  if (calendarView === "week") {
    const next = new Date(calendarCursor);
    next.setDate(next.getDate() + 7);
    calendarCursor = next;
  } else {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
  }
  renderCalendar();
});

calendarToday?.addEventListener("click", () => {
  const now = new Date();
  calendarCursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  renderCalendar();
});

calendarViewMonth?.addEventListener("click", () => {
  calendarView = "month";
  calendarViewMonth.classList.add("active");
  calendarViewMonth.setAttribute("aria-selected", "true");
  calendarViewWeek?.classList.remove("active");
  calendarViewWeek?.setAttribute("aria-selected", "false");
  renderCalendar();
  announce("Calendar month view enabled.");
});

calendarViewWeek?.addEventListener("click", () => {
  calendarView = "week";
  calendarViewWeek.classList.add("active");
  calendarViewWeek.setAttribute("aria-selected", "true");
  calendarViewMonth?.classList.remove("active");
  calendarViewMonth?.setAttribute("aria-selected", "false");
  renderCalendar();
  announce("Calendar week view enabled.");
});

calendarGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("button.calendar-day");
  if (!button?.dataset.date) {
    return;
  }
  const nextDate = button.dataset.date;
  selectedDueDate = selectedDueDate === nextDate ? "" : nextDate;
  renderTasks();
  if (selectedDueDate) {
    announce(`Calendar filter: ${selectedDueDate}`);
  } else {
    announce("Calendar filter cleared.");
  }
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
    announce("Editing mode enabled.");
  }
  if (action === "cancel") {
    editingId = null;
    renderTasks();
    announce("Editing cancelled.");
  }
  if (action === "save") {
    const title = clampText(item.querySelector("[data-edit='title']").value, MAX_TITLE_LENGTH);
    if (!title) return;
    const description = clampText(
      item.querySelector("[data-edit='description']").value,
      MAX_DESCRIPTION_LENGTH
    );
    const tags = parseTags(item.querySelector("[data-edit='tags']").value);
    const checklistLines = item
      .querySelector("[data-edit='checklist']")
      .value.split("\n")
      .map((line) => clampText(line, MAX_CHECKLIST_TEXT_LENGTH))
      .filter(Boolean)
      .slice(0, MAX_CHECKLIST_ITEMS);
    const priority = normalizePriority(item.querySelector("[data-edit='priority']").value);
    const dueDate = normalizeDueDate(item.querySelector("[data-edit='dueDate']").value);

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
    announce(`Task updated: ${title}`);
  }
});

taskList.addEventListener("dragstart", (event) => {
  const item = event.target.closest("li.task");
  if (!item?.dataset.id) {
    return;
  }
  if (activeSort !== "manual") {
    event.preventDefault();
    announce("Set sort to Manual order to move tasks.");
    return;
  }
  draggedTaskId = item.dataset.id;
  item.classList.add("is-dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
  }
});

taskList.addEventListener("dragover", (event) => {
  if (!draggedTaskId || activeSort !== "manual") {
    return;
  }
  event.preventDefault();
  const target = event.target.closest("li.task");
  Array.from(taskList.querySelectorAll(".drop-target")).forEach((node) => {
    node.classList.remove("drop-target");
  });
  if (target && target.dataset.id !== draggedTaskId) {
    target.classList.add("drop-target");
  }
});

taskList.addEventListener("drop", (event) => {
  if (!draggedTaskId || activeSort !== "manual") {
    return;
  }
  event.preventDefault();
  const target = event.target.closest("li.task");
  const targetId = target?.dataset.id;
  Array.from(taskList.querySelectorAll(".drop-target")).forEach((node) => {
    node.classList.remove("drop-target");
  });
  reorderTasks(draggedTaskId, targetId);
  draggedTaskId = null;
});

taskList.addEventListener("dragend", () => {
  Array.from(taskList.querySelectorAll(".drop-target")).forEach((node) => {
    node.classList.remove("drop-target");
  });
  Array.from(taskList.querySelectorAll(".is-dragging")).forEach((node) => {
    node.classList.remove("is-dragging");
  });
  draggedTaskId = null;
});

const handleKanbanDragOver = (event, list) => {
  event.preventDefault();
  if (!draggedKanbanTaskId) {
    return;
  }
  list.classList.add("drop-zone");
};

const handleKanbanDrop = (event, list, toCompleted) => {
  event.preventDefault();
  list.classList.remove("drop-zone");
  if (!draggedKanbanTaskId) {
    return;
  }
  moveTaskToColumn(draggedKanbanTaskId, toCompleted);
  draggedKanbanTaskId = null;
};

[kanbanActive, kanbanDone].forEach((list) => {
  list?.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".kanban-card");
    if (!card?.dataset.id) {
      return;
    }
    draggedKanbanTaskId = card.dataset.id;
    card.classList.add("is-dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  });

  list?.addEventListener("dragend", () => {
    draggedKanbanTaskId = null;
    [kanbanActive, kanbanDone].forEach((node) => {
      node?.classList.remove("drop-zone");
    });
    document.querySelectorAll(".kanban-card.is-dragging").forEach((node) => {
      node.classList.remove("is-dragging");
    });
  });
});

kanbanActive?.addEventListener("dragover", (event) => handleKanbanDragOver(event, kanbanActive));
kanbanDone?.addEventListener("dragover", (event) => handleKanbanDragOver(event, kanbanDone));

kanbanActive?.addEventListener("dragleave", () => {
  kanbanActive.classList.remove("drop-zone");
});
kanbanDone?.addEventListener("dragleave", () => {
  kanbanDone.classList.remove("drop-zone");
});

kanbanActive?.addEventListener("drop", (event) => handleKanbanDrop(event, kanbanActive, false));
kanbanDone?.addEventListener("drop", (event) => handleKanbanDrop(event, kanbanDone, true));

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
 