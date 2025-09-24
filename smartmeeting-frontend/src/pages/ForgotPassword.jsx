import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  function submit(e){
    e.preventDefault();
    setOk(""); setErr("");
    if (!email.trim()) { setErr("Enter your email"); return; }
    setOk("If this email belongs to an existing user, your administrator will contact you to reset your password.");
  }

  return (
    <div className="grid" style={{gap:16, placeItems:"center", minHeight:"100vh", padding:20}}>
      <div className="card" style={{width:"min(420px, 92vw)"}}>
        <h1 className="page-title" style={{marginTop:0}}>Forgot password</h1>
        <p style={{marginTop:-8, color:"var(--muted)"}}>
          Enter your account email. This demo shows a placeholder flow; real reset requires admin action.
        </p>
        <form onSubmit={submit} className="grid" style={{gap:10}}>
          <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn" type="submit">Request reset</button>
        </form>
        {(ok || err) && (
          <div style={{marginTop:10, color: ok ? "var(--accent)" : "var(--danger)"}}>
            {ok || err}
          </div>
        )}
        <div style={{marginTop:12}}>
          <Link className="navlink btn ghost" to="/">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
