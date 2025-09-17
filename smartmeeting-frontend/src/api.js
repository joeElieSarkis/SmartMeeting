const API = "http://localhost:5114"; // backend base URL

async function jfetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let data = null;
  try {
    if (res.status !== 204) {
      data = await res.json();
    }
  } catch {
    // fallback if response is not JSON
    data = await res.text();
  }

  if (!res.ok) {
    // throw structured error with status + message
    const message =
      (data && data.message) ||
      (typeof data === "string" ? data : "Request failed");
    throw { status: res.status, message };
  }

  return data;
}

export const api = {
  // Authentication
  login: (email, password) =>
    jfetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Rooms
  rooms: {
    all: () => jfetch("/api/rooms"),
    create: (payload) =>
      jfetch("/api/rooms", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // Meetings
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

  // Meeting Minutes
  minutes: {
    byMeeting: (meetingId) =>
      jfetch(`/api/meetingminutes/byMeeting/${meetingId}`),
    create: (payload) =>
      jfetch("/api/meetingminutes", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
};
