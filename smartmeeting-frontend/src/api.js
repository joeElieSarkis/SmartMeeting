// src/api.js
const BASE = (import.meta?.env?.VITE_API_BASE ?? "http://localhost:5114").replace(/\/+$/, "");
export const API_BASE = BASE;

// Turn "/uploads/xyz.png" into an absolute URL
export function fileUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE}${path.startsWith("/") ? path : "/" + path}`;
}

async function jfetch(path, options = {}) {
  const url = `${BASE}${path.startsWith("/") ? path : "/" + path}`;

  let res;
  try {
    res = await fetch(url, {
      headers: {
        Accept: "application/json, text/plain; q=0.9, */*; q=0.8",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (e) {
    const msg = e?.message || "Network request failed.";
    throw new Error(`Network error. Is the API running at ${BASE}? ${msg}`);
  }

  const isNoContent = res.status === 204;
  const contentType = res.headers.get("content-type") || "";
  const looksJson = /application\/(json|problem\+json)/i.test(contentType);
  const text = isNoContent ? "" : await res.text();

  let data = null;
  if (looksJson && text) {
    try { data = JSON.parse(text); } catch { data = text; }
  } else {
    data = text || null;
  }

  if (!res.ok) {
    // Prefer structured messages from ProblemDetails/JSON
    let msg =
      (data && (data.message || data.error || data.detail || data.title)) ||
      (typeof data === "string" && data.trim()) ||
      "";

    // Friendly error specifically for invalid login
    const p = path.toLowerCase();
    if (res.status === 401 && /\b\/api\/auth\/login\b/.test(p)) {
      msg = "Invalid email or password.";
    }

    if (!msg) msg = `Request failed (${res.status})`;

    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

export const api = {
  // ===== Auth =====
  login: (email, password) =>
    jfetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // ===== Users =====
  users: {
    all: () => jfetch("/api/users"),
    byId: (id) => jfetch(`/api/users/${id}`),
    update: (id, payload) =>
      jfetch(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  },

  // ===== Rooms =====
  rooms: {
    all: () => jfetch("/api/rooms"),
    create: (payload) => jfetch("/api/rooms", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => jfetch(`/api/rooms/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    delete: (id) => jfetch(`/api/rooms/${id}`, { method: "DELETE" }),
  },

  // ===== Meetings =====
  meetings: {
    all: () => jfetch("/api/meetings"),
    byId: (id) => jfetch(`/api/meetings/${id}`),
    create: (payload) => jfetch("/api/meetings", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => jfetch(`/api/meetings/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    delete: (id) => jfetch(`/api/meetings/${id}`, { method: "DELETE" }),
  },

  // ===== Participants =====
  participants: {
    byMeeting: (meetingId) => jfetch(`/api/participants/byMeeting/${meetingId}`),
    create: (payload) => jfetch("/api/participants", { method: "POST", body: JSON.stringify(payload) }),
  },

  // ===== Meeting Minutes =====
  minutes: {
    byMeeting: (meetingId) => jfetch(`/api/meetingminutes/byMeeting/${meetingId}`),
    create: (payload) => jfetch("/api/meetingminutes", { method: "POST", body: JSON.stringify(payload) }),
    finalize: (id) => jfetch(`/api/meetingminutes/${id}/finalize`, { method: "PUT" }), // 204 → null
  },

  // ===== Attachments =====
  attachments: {
    byMeeting: (meetingId) => jfetch(`/api/attachments/byMeeting/${meetingId}`),
    upload: async (meetingId, file) => {
      const form = new FormData();
      form.append("meetingId", meetingId);
      form.append("file", file);

      let res;
      try {
        res = await fetch(`${BASE}/api/attachments/upload`, { method: "POST", body: form });
      } catch (e) {
        const msg = e?.message || "Network request failed.";
        throw new Error(`Network error. Is the API running at ${BASE}? ${msg}`);
      }

      const isNoContent = res.status === 204;
      const contentType = res.headers.get("content-type") || "";
      const looksJson = /application\/(json|problem\+json)/i.test(contentType);
      const text = isNoContent ? "" : await res.text();

      let data = null;
      if (looksJson && text) {
        try { data = JSON.parse(text); } catch { data = text; }
      } else {
        data = text || null;
      }

      if (!res.ok) {
        const message =
          (data && (data.message || data.error || data.detail || data.title)) ||
          (typeof data === "string" && data.trim()) ||
          `Request failed (${res.status})`;
        const err = new Error(message);
        err.status = res.status;
        err.body = data;
        throw err;
      }
      return data;
    },
    delete: (id) => jfetch(`/api/attachments/${id}`, { method: "DELETE" }),
  },

  // ===== Notifications =====
  notifications: {
    listByUser: (userId, unreadOnly = false, take = 20) =>
      jfetch(`/api/notifications/user/${userId}?unreadOnly=${unreadOnly}&take=${take}`),
    unreadCount: (userId) => jfetch(`/api/notifications/user/${userId}/unreadCount`),
    markRead: (id) => jfetch(`/api/notifications/${id}/read`, { method: "POST" }),
    markAllRead: (userId) => jfetch(`/api/notifications/user/${userId}/readAll`, { method: "POST" }),
    delete: (id) => jfetch(`/api/notifications/${id}`, { method: "DELETE" }),
  },
};
