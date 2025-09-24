import { useEffect, useState } from "react";
import { api } from "../api";
import { getUser } from "../auth";

export default function Profile() {
  const me = getUser();
  const [form, setForm] = useState({ id: 0, name: "", email: "" });
  const [role, setRole] = useState("");
  const [pw, setPw] = useState({ password: "", confirm: "" });

  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      if (!me) return;
      try {
        const fresh = await api.users.byId(me.id);
        setForm({ id: fresh.id, name: fresh.name || "", email: fresh.email || "" });
        setRole(fresh.role || "");
      } catch {
        setErr("Failed to load profile");
      }
    }
    load();
  }, [me?.id]);

  async function save() {
    setOk(""); setErr("");
    if (!pw.password) { setErr("Enter a new password to save."); return; }
    if (pw.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (pw.password !== pw.confirm) { setErr("Passwords do not match."); return; }

    setBusy(true);
    try {
      await api.users.update(form.id, {
        id: form.id,
        email: form.email.trim(),
        password: pw.password,
        name: form.name.trim(),
        role, // keep existing role
      });
      // Refresh cached user for header display
      const updated = await api.users.byId(form.id);
      const cached = getUser();
      if (cached) {
        localStorage.setItem("sm_user", JSON.stringify({
          ...cached,
          name: updated.name,
          email: updated.email,
          role: updated.role
        }));
      }
      setPw({ password: "", confirm: "" });
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

      {/* Account */}
      <div className="card">
        <h2 className="section-title">Account</h2>
        <div className="grid" style={{ gap: 10, maxWidth: 520 }}>
          <label>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Full name</div>
            <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          </label>

          <label>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Email</div>
            <input className="input" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
          </label>

          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Role</div>
            <div className="badge">{role || "—"}</div>
          </div>
        </div>
      </div>

      {/* Security (accordion style you liked) */}
      <details className="accordion">
        <summary>Security</summary>
        <div className="accordion-body">
          <div className="grid" style={{ gap: 10, maxWidth: 520 }}>
            <label>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>New password</div>
              <input className="input" type="password" value={pw.password} onChange={e=>setPw({...pw, password:e.target.value})}/>
            </label>
            <label>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Confirm new password</div>
              <input className="input" type="password" value={pw.confirm} onChange={e=>setPw({...pw, confirm:e.target.value})}/>
            </label>

            <div className="row">
              <button className="btn" onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save Changes"}
              </button>
            </div>

            {ok && <div style={{ color: "var(--accent)" }}>{ok}</div>}
            {err && <div style={{ color: "var(--danger)" }}>{err}</div>}
          </div>
        </div>
      </details>
    </div>
  );
}
