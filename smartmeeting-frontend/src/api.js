const API = "http://localhost:5114"; // backend base URL
export const API_BASE = API;

// Helper to turn "/uploads/xyz.png" into "http://localhost:5114/uploads/xyz.png"
function fileUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API}${path.startsWith("/") ? path : "/" + path}`;
}
export { fileUrl };

async function jfetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let data = null;
  try {
    if (res.status !== 204) data = await res.json();
  } catch {
    data = await res.text();
  }

  if (!res.ok) {
    const message =
      (data && data.message) ||
      (typeof data === "string" ? data : "Request failed");
    const err = new Error(message);
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
  },

  // ===== Rooms =====
  rooms: {
    all: () => jfetch("/api/rooms"),
    create: (payload) =>
      jfetch("/api/rooms", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      jfetch(`/api/rooms/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    delete: (id) =>
      jfetch(`/api/rooms/${id}`, {
        method: "DELETE",
      }),
  },

  // ===== Meetings =====
  meetings: {
    all: () => jfetch("/api/meetings"),
    byId: (id) => jfetch(`/api/meetings/${id}`),
    create: (payload) =>
      jfetch("/api/meetings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id, payload) =>
      jfetch(`/api/meetings/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
  },

  // ===== Participants =====
  participants: {
    byMeeting: (meetingId) => jfetch(`/api/participants/byMeeting/${meetingId}`),
    create: (payload) =>
      jfetch("/api/participants", {
        method: "POST",
        body: JSON.stringify(payload), // { meetingId, userId }
      }),
  },

  // ===== Meeting Minutes =====
  minutes: {
    byMeeting: (meetingId) =>
      jfetch(`/api/meetingminutes/byMeeting/${meetingId}`),
    create: (payload) =>
      jfetch("/api/meetingminutes", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // ===== Attachments =====
  attachments: {
    byMeeting: (meetingId) => jfetch(`/api/attachments/byMeeting/${meetingId}`),
    upload: async (meetingId, file) => {
      const form = new FormData();
      form.append("meetingId", meetingId);
      form.append("file", file);
      const res = await fetch(`${API}/api/attachments/upload`, {
        method: "POST",
        body: form, // don't set Content-Type manually
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    delete: (id) => jfetch(`/api/attachments/${id}`, { method: "DELETE" }),
  },
};
