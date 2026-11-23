const STORAGE_KEYS = {
  users: "cuaderno_users",
  session: "cuaderno_session",
  tasks: "cuaderno_tasks"
};

const elements = {
  authShell: document.getElementById("authShell"),
  workspace: document.getElementById("workspace"),
  loginTab: document.getElementById("loginTab"),
  registerTab: document.getElementById("registerTab"),
  authTitle: document.getElementById("authTitle"),
  authSubtitle: document.getElementById("authSubtitle"),
  authForm: document.getElementById("authForm"),
  nameField: document.getElementById("nameField"),
  name: document.getElementById("name"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  authError: document.getElementById("authError"),
  authSubmit: document.getElementById("authSubmit"),
  profileName: document.getElementById("profileName"),
  avatar: document.getElementById("avatar"),
  logoutButton: document.getElementById("logoutButton"),
  dateLabel: document.getElementById("dateLabel"),
  viewTitle: document.getElementById("viewTitle"),
  allCount: document.getElementById("allCount"),
  pendingCount: document.getElementById("pendingCount"),
  completedCount: document.getElementById("completedCount"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
  taskList: document.getElementById("taskList"),
  addTaskButton: document.getElementById("addTaskButton"),
  taskDialog: document.getElementById("taskDialog"),
  taskForm: document.getElementById("taskForm"),
  dialogTitle: document.getElementById("dialogTitle"),
  closeDialogButton: document.getElementById("closeDialogButton"),
  cancelTaskButton: document.getElementById("cancelTaskButton"),
  taskTitle: document.getElementById("taskTitle"),
  taskNotes: document.getElementById("taskNotes"),
  taskError: document.getElementById("taskError"),
  toast: document.getElementById("toast")
};

let authMode = "login";
let activeFilter = "all";
let editingTaskId = null;

class StorageError extends Error {}

function read(key) {
  const stored = localStorage.getItem(key);
  if (stored === null) return [];
  try {
    const value = JSON.parse(stored);
    if (Array.isArray(value)) return value;
  } catch {
    // Un JSON inválido está tan dañado como un valor que no es una lista.
  }
  throw new StorageError("Los datos guardados están dañados. No se guardó nada para no perderlos.");
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new StorageError("No se pudo guardar: el almacenamiento del navegador está lleno o bloqueado.");
  }
}

function withStorage(action, showError) {
  try {
    return action();
  } catch (error) {
    if (!(error instanceof StorageError)) throw error;
    showError(error.message);
    return undefined;
  }
}

function getSession() {
  const id = localStorage.getItem(STORAGE_KEYS.session);
  if (!id) return null;
  return read(STORAGE_KEYS.users).find(user => user.id === id) || null;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function setAuthMode(mode) {
  authMode = mode;
  const registering = mode === "register";
  elements.loginTab.classList.toggle("active", !registering);
  elements.registerTab.classList.toggle("active", registering);
  elements.loginTab.setAttribute("aria-selected", String(!registering));
  elements.registerTab.setAttribute("aria-selected", String(registering));
  elements.nameField.hidden = !registering;
  elements.name.required = registering;
  elements.password.autocomplete = registering ? "new-password" : "current-password";
  elements.authTitle.textContent = registering ? "Crea tu cuenta" : "Bienvenido de nuevo";
  elements.authSubtitle.textContent = registering ? "Empieza a organizar tus tareas hoy." : "Introduce tus datos para continuar.";
  elements.authSubmit.querySelector("span").textContent = registering ? "Crear cuenta" : "Entrar";
  elements.authError.textContent = "";
}

elements.loginTab.addEventListener("click", () => setAuthMode("login"));
elements.registerTab.addEventListener("click", () => setAuthMode("register"));

elements.authForm.addEventListener("submit", event => {
  event.preventDefault();
  elements.authError.textContent = "";

  const email = elements.email.value.trim().toLowerCase();
  const password = elements.password.value;
  const name = elements.name.value.trim();

  if (!email || !password) {
    elements.authError.textContent = "Completa el correo y la contraseña.";
    return;
  }
  if (password.length < 6) {
    elements.authError.textContent = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  withStorage(() => {
    const users = read(STORAGE_KEYS.users);

    if (authMode === "register") {
      if (!name) {
        elements.authError.textContent = "Escribe tu nombre.";
        return;
      }
      if (users.some(user => user.email === email)) {
        elements.authError.textContent = "Ya existe una cuenta con este correo.";
        return;
      }

      const user = {
        id: crypto.randomUUID(),
        name,
        email,
        password
      };
      users.push(user);
      write(STORAGE_KEYS.users, users);
      localStorage.setItem(STORAGE_KEYS.session, user.id);
      startSession(user);
      showToast("Cuenta creada correctamente");
    } else {
      const user = users.find(candidate => candidate.email === email && candidate.password === password);
      if (!user) {
        elements.authError.textContent = "Correo o contraseña incorrectos.";
        return;
      }
      localStorage.setItem(STORAGE_KEYS.session, user.id);
      startSession(user);
    }
  }, message => {
    elements.authError.textContent = message;
  });
});

elements.logoutButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.session);
  elements.workspace.hidden = true;
  elements.authShell.hidden = false;
  elements.authForm.reset();
  setAuthMode("login");
});

function getUserTasks() {
  const user = getSession();
  if (!user) return [];
  return read(STORAGE_KEYS.tasks).filter(task => task.userId === user.id);
}

function saveUserTask(task) {
  const tasks = read(STORAGE_KEYS.tasks);
  const existingIndex = tasks.findIndex(item => item.id === task.id);
  if (existingIndex >= 0) tasks[existingIndex] = task;
  else tasks.push(task);
  write(STORAGE_KEYS.tasks, tasks);
}

function deleteUserTask(taskId) {
  const tasks = read(STORAGE_KEYS.tasks).filter(task => task.id !== taskId);
  write(STORAGE_KEYS.tasks, tasks);
}

function formatDate() {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
}

function startSession(user) {
  elements.authShell.hidden = true;
  elements.workspace.hidden = false;
  elements.profileName.textContent = user.name;
  elements.avatar.textContent = user.name.charAt(0).toUpperCase();
  elements.dateLabel.textContent = formatDate();
  activeFilter = "all";
  document.querySelectorAll(".filter-button").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });
  renderTasks();
}

function renderTasks() {
  const tasks = withStorage(getUserTasks, showToast);
  if (!tasks) return;
  const pending = tasks.filter(task => !task.completed).length;
  const completed = tasks.length - pending;

  elements.allCount.textContent = tasks.length;
  elements.pendingCount.textContent = pending;
  elements.completedCount.textContent = completed;
  elements.progressBar.style.width = tasks.length ? `${Math.round(completed / tasks.length * 100)}%` : "0%";
  elements.progressText.textContent = `${completed} de ${tasks.length} completadas`;

  const titles = { all: "Mis tareas", pending: "Pendientes", completed: "Completadas" };
  elements.viewTitle.textContent = titles[activeFilter];

  const visibleTasks = tasks.filter(task => {
    if (activeFilter === "pending") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  if (!visibleTasks.length) {
    const emptyCopy = activeFilter === "completed"
      ? ["Nada completado todavía", "Cuando termines una tarea aparecerá aquí."]
      : activeFilter === "pending"
        ? ["Todo está al día", "No tienes tareas pendientes."]
        : ["Tu lista está vacía", "Añade una tarea y empieza a organizar tu día."];

    elements.taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-mark" aria-hidden="true">✓</div>
        <h2>${emptyCopy[0]}</h2>
        <p>${emptyCopy[1]}</p>
        ${activeFilter === "all" ? '<button class="secondary-button" type="button" id="emptyAddButton">Crear primera tarea</button>' : ""}
      </div>`;
    const emptyAddButton = document.getElementById("emptyAddButton");
    if (emptyAddButton) emptyAddButton.addEventListener("click", openCreateDialog);
    return;
  }

  elements.taskList.innerHTML = visibleTasks.map(task => `
    <article class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
      <button class="task-check" type="button" data-action="toggle" aria-label="${task.completed ? "Marcar como pendiente" : "Marcar como completada"}" title="${task.completed ? "Marcar como pendiente" : "Marcar como completada"}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 7"/></svg>
      </button>
      <div class="task-content">
        <span class="task-title">${escapeHtml(task.title)}</span>
        ${task.notes ? `<span class="task-notes">${escapeHtml(task.notes)}</span>` : ""}
      </div>
      <div class="task-actions">
        <button class="task-action edit" type="button" data-action="edit" aria-label="Editar ${escapeHtml(task.title)}" title="Editar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L8 18l-4 1 1-4z"/></svg>
        </button>
        <button class="task-action delete" type="button" data-action="delete" aria-label="Eliminar ${escapeHtml(task.title)}" title="Eliminar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V3h8v3M19 6l-1 15H6L5 6M10 10v7M14 10v7"/></svg>
        </button>
      </div>
    </article>
  `).join("");
}

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach(item => item.classList.toggle("active", item === button));
    renderTasks();
  });
});

elements.taskList.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const item = actionButton.closest(".task-item");
  const taskId = item.dataset.taskId;
  withStorage(() => {
    const task = getUserTasks().find(candidate => candidate.id === taskId);
    if (!task) return;

    if (actionButton.dataset.action === "toggle") {
      task.completed = !task.completed;
      saveUserTask(task);
      renderTasks();
      showToast(task.completed ? "Tarea completada" : "Tarea marcada como pendiente");
    }

    if (actionButton.dataset.action === "edit") openEditDialog(task);
    if (actionButton.dataset.action === "delete") {
      deleteUserTask(taskId);
      renderTasks();
      showToast("Tarea eliminada");
    }
  }, showToast);
});

function openCreateDialog() {
  editingTaskId = null;
  elements.dialogTitle.textContent = "Crear tarea";
  elements.taskForm.reset();
  elements.taskError.textContent = "";
  elements.taskDialog.showModal();
  requestAnimationFrame(() => elements.taskTitle.focus());
}

function openEditDialog(task) {
  editingTaskId = task.id;
  elements.dialogTitle.textContent = "Editar tarea";
  elements.taskTitle.value = task.title;
  elements.taskNotes.value = task.notes || "";
  elements.taskError.textContent = "";
  elements.taskDialog.showModal();
  requestAnimationFrame(() => elements.taskTitle.focus());
}

elements.addTaskButton.addEventListener("click", openCreateDialog);
elements.closeDialogButton.addEventListener("click", () => elements.taskDialog.close());
elements.cancelTaskButton.addEventListener("click", () => elements.taskDialog.close());

elements.taskDialog.addEventListener("click", event => {
  if (event.target === elements.taskDialog) elements.taskDialog.close();
});

const TASK_LIMITS = { title: 100, notes: 300 };

function validateTask(title, notes) {
  if (!title) return "Escribe un título para la tarea.";
  if (title.length > TASK_LIMITS.title) return `El título admite máximo ${TASK_LIMITS.title} caracteres.`;
  if (notes.length > TASK_LIMITS.notes) return `La nota admite máximo ${TASK_LIMITS.notes} caracteres.`;
  return "";
}

elements.taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = elements.taskTitle.value.trim();
  const notes = elements.taskNotes.value.trim();

  const validationError = validateTask(title, notes);
  if (validationError) {
    elements.taskError.textContent = validationError;
    elements.taskTitle.focus();
    return;
  }

  const saved = withStorage(() => {
    const user = getSession();
    if (!user) return false;

    if (editingTaskId) {
      const task = getUserTasks().find(candidate => candidate.id === editingTaskId);
      if (task) {
        task.title = title;
        task.notes = notes;
        task.updatedAt = Date.now();
        saveUserTask(task);
      }
    } else {
      saveUserTask({
        id: crypto.randomUUID(),
        userId: user.id,
        title,
        notes,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    return true;
  }, message => {
    elements.taskError.textContent = message;
  });
  if (!saved) return;

  elements.taskDialog.close();
  renderTasks();
  showToast(editingTaskId ? "Tarea actualizada" : "Tarea creada");
});

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

withStorage(() => {
  const existingUser = getSession();
  if (existingUser) startSession(existingUser);
  else setAuthMode("login");
}, message => {
  setAuthMode("login");
  elements.authError.textContent = message;
});
