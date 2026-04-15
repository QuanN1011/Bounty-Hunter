const BASE_URL = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getUser() {
  const res = await fetch(`${BASE_URL}/user/me`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function getTasks() {
  const res = await fetch(`${BASE_URL}/tasks`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function createTask(task) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to create task");
}

export async function completeTask(taskId) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}/complete`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to complete task");
}

export async function deleteTask(taskId) {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete task");
}

export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ...data, access_token: undefined };
  return data;
}

export async function registerUser(username, password) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, data };
  return { ok: true, data };
}