const API_BASE = window.location.origin;

const authPage = document.getElementById("authPage");
const notesPage = document.getElementById("notesPage");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
const notesForm = document.getElementById("notesForm");
const notesMessage = document.getElementById("notesMessage");
const notePreview = document.getElementById("notePreview");
const selectedMeta = document.getElementById("selectedMeta");
const downloadBtn = document.getElementById("downloadBtn");
const processBtn = document.getElementById("processBtn");
const historyList = document.getElementById("historyList");
const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");
const logoutBtn = document.getElementById("logoutBtn");

let token = localStorage.getItem("ai_notes_token") || "";
let notesHistory = [];
let currentNote = "";
let currentFilename = "ai-notes.txt";

function setMessage(element, text, type = "") {
    element.textContent = text;
    element.className = `message ${type}`.trim();
}

function switchAuthMode(mode) {
    const isLogin = mode === "login";

    loginTab.classList.toggle("active", isLogin);
    registerTab.classList.toggle("active", !isLogin);
    loginForm.classList.toggle("hidden", !isLogin);
    registerForm.classList.toggle("hidden", isLogin);
    setMessage(authMessage, "");
}

function showNotesPage() {
    authPage.classList.add("hidden");
    notesPage.classList.remove("hidden");
    loadHistory();
}

function showAuthPage() {
    notesPage.classList.add("hidden");
    authPage.classList.remove("hidden");
}

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}

function setCurrentNote(note) {
    currentNote = note?.notes || "";
    currentFilename = `${note?.video_id || "ai-notes"}-${note?.mode || "notes"}.txt`;
    notePreview.textContent = currentNote || "No notes text found for this history item.";
    selectedMeta.textContent = note ? `${note.mode || "notes"} | ${note.video_id || "video"}` : "No note selected";
    downloadBtn.disabled = !currentNote;
}

function renderHistory() {
    historyList.innerHTML = "";

    if (!notesHistory.length) {
        historyList.innerHTML = `<p class="empty-history">No notes yet. Process a video URL to create your first text file.</p>`;
        return;
    }

    notesHistory.forEach((note, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "history-item";
        item.innerHTML = `
            <span class="history-title">${note.video_id || "Generated note"}</span>
            <span class="history-meta">${note.mode || "notes"} | Option ${modeToOption(note.mode)}</span>
        `;

        item.addEventListener("click", () => {
            document.querySelectorAll(".history-item").forEach((button) => button.classList.remove("active"));
            item.classList.add("active");
            setCurrentNote(note);
        });

        if (index === 0 && !currentNote) {
            item.classList.add("active");
            setCurrentNote(note);
        }

        historyList.appendChild(item);
    });
}

function modeToOption(mode) {
    const map = {
        interview: "1",
        short: "2",
        exam: "3"
    };

    return map[mode] || "-";
}

async function loadHistory(selectLatest = false) {
    if (!token) {
        return;
    }

    try {
        const data = await apiRequest(`/my-notes?token=${encodeURIComponent(token)}`);

        if (data.message) {
            setMessage(notesMessage, data.message, "error");
            return;
        }

        notesHistory = Array.isArray(data) ? data.reverse() : [];

        if (selectLatest && notesHistory.length) {
            setCurrentNote(notesHistory[0]);
            currentNote = notesHistory[0].notes || "";
        }

        renderHistory();
    } catch (error) {
        setMessage(notesMessage, "Could not load history. Check that backend and MongoDB are running.", "error");
    }
}

loginTab.addEventListener("click", () => switchAuthMode("login"));
registerTab.addEventListener("click", () => switchAuthMode("register"));

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(authMessage, "Logging in...");

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const data = await apiRequest("/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        if (!data.token) {
            setMessage(authMessage, data.message || "Login failed.", "error");
            return;
        }

        token = data.token;
        localStorage.setItem("ai_notes_token", token);
        setMessage(authMessage, data.message || "Login successful.", "success");
        showNotesPage();
    } catch (error) {
        setMessage(authMessage, "Login failed. Please try again.", "error");
    }
});

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(authMessage, "Creating account...");

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    try {
        const data = await apiRequest("/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password })
        });

        const isSuccess = data.message === "User registered successfully";
        setMessage(authMessage, data.message || "Account created.", isSuccess ? "success" : "error");

        if (isSuccess) {
            registerForm.reset();
            switchAuthMode("login");
            setMessage(authMessage, "Account created. Please login.", "success");
        }
    } catch (error) {
        setMessage(authMessage, "Registration failed. Please try again.", "error");
    }
});

notesForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const url = document.getElementById("videoUrl").value.trim();
    const mode = document.querySelector("input[name='mode']:checked").value;

    processBtn.disabled = true;
    setMessage(notesMessage, "Processing video. This can take a little time...");

    try {
        const data = await apiRequest("/generate-notes", {
            method: "POST",
            body: JSON.stringify({ url, mode, token })
        });

        if (data.error || data.message === "Invalid Token") {
            setMessage(notesMessage, data.error || data.message, "error");
            return;
        }

        setMessage(notesMessage, data.message || "Notes generated.", "success");
        await loadHistory(true);
    } catch (error) {
        setMessage(notesMessage, "Could not generate notes. Check the URL and backend logs.", "error");
    } finally {
        processBtn.disabled = false;
    }
});

downloadBtn.addEventListener("click", () => {
    if (!currentNote) {
        return;
    }

    const blob = new Blob([currentNote], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = currentFilename;
    link.click();
    URL.revokeObjectURL(url);
});

refreshHistoryBtn.addEventListener("click", async () => {
    setMessage(notesMessage, "Refreshing history...");
    await loadHistory();
    setMessage(notesMessage, "History refreshed.", "success");
});

logoutBtn.addEventListener("click", () => {
    token = "";
    notesHistory = [];
    currentNote = "";
    localStorage.removeItem("ai_notes_token");
    notesForm.reset();
    setCurrentNote(null);
    setMessage(notesMessage, "");
    showAuthPage();
});

if (token) {
    showNotesPage();
}
