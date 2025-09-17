const API = "http://localhost:5114"; // you set CORS already

async function jfetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers||{}) },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

export const api = {
  login: (email, password) =>
    jfetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  rooms: () => jfetch("/api/rooms"),

  meetings: {
    create: (payload) =>
      jfetch("/api/meetings", { method: "POST", body: JSON.stringify(payload) }),
    all: () => jfetch("/api/meetings"),
    byId: (id) => jfetch(`/api/meetings/${id}`),
    update: (id, payload) =>
      jfetch(`/api/meetings/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  },

  minutes: {
    create: (payload) =>
      jfetch("/api/meetingminutes", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    byMeeting: (meetingId) =>
      jfetch(`/api/meetingminutes?meetingId=${meetingId}`),
  },
};



