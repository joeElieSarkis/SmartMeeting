import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({ name: "", capacity: "", location: "", features: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr("");
    try {
      const data = await api.rooms.all();           // ← use .all()
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      setErr("Failed to load rooms");
    }
  }

  useEffect(() => { load(); }, []);

  async function addRoom() {
    setErr(""); setOk(""); setBusy(true);
    try {
      await api.rooms.create({                      // ← use .create()
        name: form.name.trim(),
        capacity: Number(form.capacity || 0),
        location: form.location.trim(),
        features: form.features.trim(),
      });
      setOk("Room added");
      setForm({ name: "", capacity: "", location: "", features: "" });
      await load();
    } catch {
      setErr("Failed to add room");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <h1 className="page-title">Rooms</h1>

      <div className="card">
        <h2 className="section-title">Add Room</h2>
        <div className="grid" style={{ gap: 10 }}>
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            min="0"
          />
          <input
            className="input"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            className="input"
            placeholder="Features (comma separated)"
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
          />
          <div className="row">
            <button className="btn" type="button" onClick={addRoom} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
          {ok && <div style={{ color: "var(--success)" }}>{ok}</div>}
          {err && <div style={{ color: "var(--danger)" }}>{err}</div>}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Room List</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {rooms.map((r) => (
            <li key={r.id}>
              <strong>{r.name}</strong> — cap {r.capacity} — {r.location}
              {r.features ? <> — <span style={{ color: "var(--muted)" }}>{r.features}</span></> : null}
            </li>
          ))}
          {rooms.length === 0 && <li>No rooms yet</li>}
        </ul>
      </div>
    </div>
  );
}
