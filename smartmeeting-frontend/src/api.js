const API = "http://localhost:5114"; // backend base URL

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
      jfetch(`/api/meetingminutes/byMeeting/${meetingId}`), // matches your controller
    create: (payload) =>
      jfetch("/api/meetingminutes", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
};

