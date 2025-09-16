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
  login: (email, password) => jfetch("/api/auth/login", { method:"POST", body: JSON.stringify({ email, password }) }),
  rooms:  () => jfetch("/api/rooms"),
  meetings: {
    create: (payload) => jfetch("/api/meetings", { method:"POST", body: JSON.stringify(payload) }),
    all:    () => jfetch("/api/meetings"),
  }
};


