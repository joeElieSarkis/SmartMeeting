import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "./api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("charlie.j@example.com"); // demo defaults
  const [password, setPassword] = useState("joe222");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e){
    e.preventDefault();
    setErr(""); setBusy(true);
    try{
      const user = await api.login(email.trim(), password);
      localStorage.setItem("sm_user", JSON.stringify(user));
      nav("/dashboard", { replace: true });
    }catch(ex){
      setErr(ex?.message || "Login failed");
    }finally{
      setBusy(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={panel} className="card">
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
          <img src="/logo.svg" width="28" height="28" alt="" />
          <h1 style={{margin:0, fontSize:20}}>SmartMeeting</h1>
        </div>
        <p style={{marginTop:0, color:"var(--muted)"}}>Welcome back. Please sign in.</p>

        <form onSubmit={submit} className="grid" style={{gap:10}}>
          <input className="input" placeholder="Email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <div style={{color:"var(--danger)"}}>{err}</div>}
          <button className="btn" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>

        <div style={{display:"flex", justifyContent:"flex-end", marginTop:10}}>
          <Link className="navlink" to="/forgot" style={{fontWeight:700}}>Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}

const wrap = { minHeight:"100vh", display:"grid", placeItems:"center", padding:20 };
const panel = { width:"min(420px, 92vw)" };
