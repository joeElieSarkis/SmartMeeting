import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  // create form
  const [form, setForm] = useState({ name: "", capacity: "", location: "", features: "" });

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ id: 0, name: "", capacity: "", location: "", features: "" });

  async function load() {
    setErr("");
    try {
      const list = await api.rooms.all();
      setRooms(Array.isArray(list) ? list : []);
    } catch {
      setErr("Failed to load rooms");
    }
  }

  useEffect(() => { load(); }, []);

  async function addRoom() {
    setErr(""); setOk(""); setBusy(true);
    try {
      await api.rooms.create({
        name: form.name.trim(),
        capacity: Number(form.capacity || 0),
        location: form.location.trim(),
        features: (form.features || "").trim(),
      });
      setOk("Room added");
      setForm({ name: "", capacity: "", location: "", features: "" });
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to add room");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(r) {
    setEditingId(r.id);
    setEditForm({
      id: r.id,
      name: r.name,
      capacity: String(r.capacity ?? ""),
      location: r.location,
      features: r.features ?? "",
    });
    setOk(""); setErr("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ id: 0, name: "", capacity: "", location: "", features: "" });
  }

  async function saveEdit() {
    setErr(""); setOk(""); setBusy(true);
    try {
      await api.rooms.update(editForm.id, {
        id: editForm.id,
        name: editForm.name.trim(),
        capacity: Number(editForm.capacity || 0),
        location: editForm.location.trim(),
        features: (editForm.features || "").trim(),
      });
      setOk("Room updated");
      cancelEdit();
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to update room");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this room?")) return;
    setErr(""); setOk(""); setBusy(true);
    try {
      await api.rooms.delete(id);
      setOk("Room deleted");
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to delete room");
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
          <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input className="input" type="number" min="0" placeholder="Capacity" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/>
          <input className="input" placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
          <input className="input" placeholder="Features (comma separated)" value={form.features} onChange={e=>setForm({...form,features:e.target.value})}/>
          <div className="row">
            <button className="btn" type="button" onClick={addRoom} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          </div>
          {ok && <div style={{ color: "var(--success)" }}>{ok}</div>}
          {err && <div style={{ color: "var(--danger)" }}>{err}</div>}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Room List</h2>
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
          {rooms.map((r) => (
            <li key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              {editingId === r.id ? (
                <div className="grid" style={{ gap: 8 }}>
                  <div className="row">
                    <input className="input" placeholder="Name" value={editForm.name} onChange={e=>setEditForm({...editForm, name:e.target.value})}/>
                    <input className="input" type="number" min="0" placeholder="Capacity" value={editForm.capacity} onChange={e=>setEditForm({...editForm, capacity:e.target.value})}/>
                  </div>
                  <div className="row">
                    <input className="input" placeholder="Location" value={editForm.location} onChange={e=>setEditForm({...editForm, location:e.target.value})}/>
                    <input className="input" placeholder="Features" value={editForm.features} onChange={e=>setEditForm({...editForm, features:e.target.value})}/>
                  </div>
                  <div className="row">
                    <button className="btn" onClick={saveEdit} disabled={busy}>{busy ? "Updating…" : "Update"}</button>
                    <button className="btn ghost" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{r.name}</strong> — cap {r.capacity} — {r.location}
                    {r.features ? <> — <span style={{ color: "var(--muted)" }}>{r.features}</span></> : null}
                  </div>
                  <div className="row">
                    <button className="btn ghost" onClick={() => startEdit(r)}>Edit</button>
                    <button className="btn ghost" onClick={() => remove(r.id)} disabled={busy}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {rooms.length === 0 && <li>No rooms yet</li>}
        </ul>
      </div>
    </div>
  );
}
