/* ============================================================
   data.js — API Client
   All data is saved to MySQL via the Express backend.
   QuizMaster Pro
   ============================================================ */

const API = {
  BASE: "/api",

  getToken()  { return localStorage.getItem("qm_token"); },
  setToken(t) { localStorage.setItem("qm_token", t); },
  clearToken(){ localStorage.removeItem("qm_token"); },

  headers() {
    const h = { "Content-Type": "application/json" };
    const token = this.getToken();
    if (token) h["Authorization"] = "Bearer " + token;
    return h;
  },

  async request(method, path, body) {
    const res  = await fetch(this.BASE + path, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },

  get(path)         { return this.request("GET",    path); },
  post(path, body)  { return this.request("POST",   path, body); },
  put(path, body)   { return this.request("PUT",    path, body); },
  patch(path, body) { return this.request("PATCH",  path, body); },
  del(path)         { return this.request("DELETE", path); },
};

/* ── AUTH ──────────────────────────────────────────────────── */
const Auth = {
  async login(email, password) {
    const res = await API.post("/auth/login", { email, password });
    API.setToken(res.data.token);
    localStorage.setItem("qm_user", JSON.stringify(res.data.user));
    return res.data;
  },

  async register(name, email, password) {
    const res = await API.post("/auth/register", { name, email, password });
    API.setToken(res.data.token);
    localStorage.setItem("qm_user", JSON.stringify(res.data.user));
    return res.data;
  },

  logout() {
    API.clearToken();
    localStorage.removeItem("qm_user");
    window.location.href = "/pages/login.html";
  },

  getUser()    { const r = localStorage.getItem("qm_user"); return r ? JSON.parse(r) : null; },
  isLoggedIn() { return !!API.getToken(); },
  isAdmin()    { return this.getUser()?.role === "admin"; },
};

/* ── STORE ─────────────────────────────────────────────────── */
const Store = {
  /* QUIZZES */
  async getQuizzes()       { return (await API.get("/quizzes")).data; },
  async getQuizById(id)    { return (await API.get("/quizzes/" + id)).data; },
  async createQuiz(q)      { return (await API.post("/quizzes", q)).data; },
  async updateQuiz(id, q)  { return (await API.put("/quizzes/" + id, q)).data; },
  async deleteQuiz(id)     { return API.del("/quizzes/" + id); },
  async togglePublish(id)  { return (await API.patch("/quizzes/" + id + "/publish")).data; },

  /* RESULTS */
  async getResults(filters) {
    const qs = filters ? "?" + new URLSearchParams(filters).toString() : "";
    return (await API.get("/results" + qs)).data;
  },
  async submitQuiz(payload) { return (await API.post("/results/submit", payload)).data; },
  async getAnalytics()      { return (await API.get("/results/analytics")).data; },

  /* CERTIFICATES */
  async getCertificates()   { return (await API.get("/certificates")).data; },
  async verifyCert(uid)     { return (await API.get("/certificates/verify/" + uid)).data; },

  /* USERS */
  async getUsers()          { return (await API.get("/users")).data; },
  async deleteUser(id)      { return API.del("/users/" + id); },

  /* SETTINGS */
  async getSettings()       { return (await API.get("/settings")).data; },
  async saveSettings(data)  { return API.put("/settings", data); },

  /* SESSION — quiz flow temp state */
  setActiveQuiz(q) { sessionStorage.setItem("qm_active_quiz", JSON.stringify(q)); },
  getActiveQuiz()  { const r = sessionStorage.getItem("qm_active_quiz"); return r ? JSON.parse(r) : null; },
  clearActiveQuiz(){ sessionStorage.removeItem("qm_active_quiz"); },
  setStudentName(n){ sessionStorage.setItem("qm_student_name", n); },
  getStudentName() { return sessionStorage.getItem("qm_student_name") || Auth.getUser()?.name || ""; },
  setLastResult(r) { sessionStorage.setItem("qm_last_result", JSON.stringify(r)); },
  getLastResult()  { const r = sessionStorage.getItem("qm_last_result"); return r ? JSON.parse(r) : null; },
};

/* ── HELPERS ───────────────────────────────────────────────── */
function getGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "F";
}
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" });
}
function requireAuth() {
  if (!Auth.isLoggedIn()) { window.location.href = "/pages/login.html"; return false; }
  return true;
}
function requireAdminAccess() {
  if (!Auth.isLoggedIn() || !Auth.isAdmin()) { window.location.href = "/pages/login.html"; return false; }
  return true;
}
