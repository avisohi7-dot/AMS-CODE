const STORAGE_KEY = "focusFlow.state.v1";

const defaultState = {
  tasks: [],          // {id, name, done, pomos}
  selectedTaskId: null,
  sessions: [],        // {id, taskName, mode, date, timeLabel}
  streak: { count: 0, lastActiveDate: null },
  durations: { focus: 25, short: 5, long: 15 },
};

let state = loadState();
let mode = "focus";
let remainingSeconds = state.durations.focus * 60;
let timerId = null;
let isRunning = false;

const el = {
  timerDisplay: document.getElementById("timerDisplay"),
  activeTaskLabel: document.getElementById("activeTaskLabel"),
  startBtn: document.getElementById("startBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  modeBtns: document.querySelectorAll(".mode-btn"),
  focusLen: document.getElementById("focusLen"),
  shortLen: document.getElementById("shortLen"),
  longLen: document.getElementById("longLen"),
  taskForm: document.getElementById("taskForm"),
  taskInput: document.getElementById("taskInput"),
  taskList: document.getElementById("taskList"),
  sessionLog: document.getElementById("sessionLog"),
  sessionCount: document.getElementById("sessionCount"),
  streak: document.getElementById("streak"),
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function durationForMode(m) {
  return state.durations[m] * 60;
}

function renderTimer() {
  el.timerDisplay.textContent = formatTime(remainingSeconds);
  document.title = `${formatTime(remainingSeconds)} - Focus Flow`;
  const task = state.tasks.find((t) => t.id === state.selectedTaskId);
  el.activeTaskLabel.textContent = task ? `Working on: ${task.name}` : "No task selected";
}

function setMode(newMode, resetTimer = true) {
  mode = newMode;
  el.modeBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === newMode));
  if (resetTimer) {
    stopTimer();
    remainingSeconds = durationForMode(mode);
    renderTimer();
  }
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  el.startBtn.disabled = true;
  el.pauseBtn.disabled = false;
  timerId = setInterval(tick, 1000);
}

function pauseTimer() {
  isRunning = false;
  el.startBtn.disabled = false;
  el.pauseBtn.disabled = true;
  clearInterval(timerId);
}

function stopTimer() {
  pauseTimer();
}

function resetTimer() {
  stopTimer();
  remainingSeconds = durationForMode(mode);
  renderTimer();
}

function tick() {
  remainingSeconds -= 1;
  if (remainingSeconds <= 0) {
    completeSession();
    return;
  }
  renderTimer();
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // audio not available, ignore
  }
}

function completeSession() {
  pauseTimer();
  playChime();

  const task = state.tasks.find((t) => t.id === state.selectedTaskId);

  if (mode === "focus") {
    if (task) {
      task.pomos = (task.pomos || 0) + 1;
    }
    updateStreak();
  }

  state.sessions.unshift({
    id: crypto.randomUUID(),
    taskName: task ? task.name : null,
    mode,
    timeLabel: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: todayKey(),
  });

  saveState();
  renderTasks();
  renderSessions();
  renderStreak();

  remainingSeconds = durationForMode(mode);
  renderTimer();
}

function updateStreak() {
  const today = todayKey();
  const last = state.streak.lastActiveDate;
  if (last === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);

  if (last === yKey) {
    state.streak.count += 1;
  } else {
    state.streak.count = 1;
  }
  state.streak.lastActiveDate = today;
}

function renderStreak() {
  el.streak.textContent = `🔥 ${state.streak.count} day streak`;
}

function renderTasks() {
  el.taskList.innerHTML = "";
  if (state.tasks.length === 0) {
    const hint = document.createElement("li");
    hint.className = "empty-hint";
    hint.textContent = "Add a task to get started.";
    el.taskList.appendChild(hint);
    return;
  }

  state.tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.id === state.selectedTaskId ? " selected" : "") + (task.done ? " done" : "");

    const name = document.createElement("span");
    name.className = "task-name";
    name.textContent = task.name;

    const pomos = document.createElement("span");
    pomos.className = "task-pomos";
    pomos.textContent = task.pomos ? `🍅 ${task.pomos}` : "";

    const remove = document.createElement("button");
    remove.className = "task-remove";
    remove.textContent = "✕";
    remove.title = "Remove task";
    remove.addEventListener("click", (e) => {
      e.stopPropagation();
      removeTask(task.id);
    });

    li.addEventListener("click", () => selectTask(task.id));
    li.addEventListener("dblclick", () => toggleDone(task.id));

    li.append(name, pomos, remove);
    el.taskList.appendChild(li);
  });
}

function renderSessions() {
  const todaySessions = state.sessions.filter((s) => s.date === todayKey());
  el.sessionCount.textContent = `(${todaySessions.length})`;
  el.sessionLog.innerHTML = "";

  if (todaySessions.length === 0) {
    const hint = document.createElement("li");
    hint.className = "empty-hint";
    hint.textContent = "No sessions yet today.";
    el.sessionLog.appendChild(hint);
    return;
  }

  todaySessions.forEach((s) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = s.taskName ? `${s.taskName} — ${s.timeLabel}` : `${s.timeLabel}`;
    const tag = document.createElement("span");
    tag.className = `tag ${s.mode}`;
    tag.textContent = s.mode === "focus" ? "Focus" : s.mode === "short" ? "Short" : "Long";
    li.append(label, tag);
    el.sessionLog.appendChild(li);
  });
}

function addTask(name) {
  const task = { id: crypto.randomUUID(), name, done: false, pomos: 0 };
  state.tasks.push(task);
  if (!state.selectedTaskId) state.selectedTaskId = task.id;
  saveState();
  renderTasks();
  renderTimer();
}

function removeTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  if (state.selectedTaskId === id) state.selectedTaskId = null;
  saveState();
  renderTasks();
  renderTimer();
}

function selectTask(id) {
  state.selectedTaskId = id;
  saveState();
  renderTasks();
  renderTimer();
}

function toggleDone(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
  saveState();
  renderTasks();
}

el.modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

el.startBtn.addEventListener("click", startTimer);
el.pauseBtn.addEventListener("click", pauseTimer);
el.resetBtn.addEventListener("click", resetTimer);

el.taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = el.taskInput.value.trim();
  if (!name) return;
  addTask(name);
  el.taskInput.value = "";
});

[
  [el.focusLen, "focus"],
  [el.shortLen, "short"],
  [el.longLen, "long"],
].forEach(([input, key]) => {
  input.value = state.durations[key];
  input.addEventListener("change", () => {
    const val = Math.max(1, Math.min(180, Number(input.value) || defaultState.durations[key]));
    state.durations[key] = val;
    input.value = val;
    saveState();
    if (mode === key && !isRunning) {
      remainingSeconds = durationForMode(mode);
      renderTimer();
    }
  });
});

setMode("focus", true);
renderTasks();
renderSessions();
renderStreak();
