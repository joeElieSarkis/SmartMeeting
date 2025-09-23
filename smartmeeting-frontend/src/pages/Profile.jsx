import { useEffect, useState } from "react";
import { api } from "../api";
import { getUser } from "../auth";

export default function Profile() {
  const me = getUser();
  const [form, setForm] = useState({ id: 0, name: "", email: "", password: "", confirm: "" });
  const [role, setRole] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      if (!me) return;
      try {
        const fresh = await api.users.byId(me.id);
        setForm(f => ({ ...f, id: fresh.id, name: fresh.name || "", email: fresh.email || "" }));
        setRole(fresh.role || "");
      } catch {
        setErr("Failed to load profile");
      }
    }
    load();
  }, [me?.id]);

  async function save() {
    setOk(""); setErr("");

    // basic validation (added)
    if (!form.name.trim()) { setErr("Name is required."); return; }
    if (!form.email.trim()) { setErr("Email is required."); return; }

    // your original password checks
    if (!form.password) { setErr("Please enter a new password to save changes."); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setErr("Passwords do not match."); return; }

    setBusy(true);
    try {
      await api.users.update(form.id, {
        id: form.id,
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        role, // keep existing role
      });

      // refresh localStorage with the full fresh server copy (improved)
      const updated = await api.users.byId(form.id);
      const cached = getUser();
      if (cached) {
        localStorage.setItem("sm_user", JSON.stringify({ ...cached, ...updated }));
      }

      setForm({ ...form, password: "", confirm: "" });
      setOk("Profile updated.");
    } catch (e) {
      setErr(e?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <h1 className="page-title">My Profile</h1>

      <div className="card">
        <div className="grid" style={{ gap: 10, maxWidth: 520 }}>
          <label>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Name</div>
            <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          </label>

          <label>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Email</div>
            <input className="input" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
          </label>

          <div style={{ fontSize: 12, color: "var(--muted)" }}>Role</div>
          <div className="badge">{role || "—"}</div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />

          <label>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>New Password</div>
            <input className="input" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
          </label>
          <label>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Confirm Password</div>
            <input className="input" type="password" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})}/>
          </label>

          <div className="row">
            <button className="btn" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save Changes"}</button>
          </div>

          {ok && <div style={{ color: "var(--success)" }}>{ok}</div>}
          {err && <div style={{ color: "var(--danger)" }}>{err}</div>}
        </div>
      </div>
    </div>
  );
}
