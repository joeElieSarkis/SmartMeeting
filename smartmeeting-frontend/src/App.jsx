import { useState } from "react";
import { api } from "./api";

export default function Login(){
  const [email,setEmail] = useState("admin@smartmeeting.local");
  const [password,setPassword] = useState("admin123");
  const [err,setErr] = useState("");

  async function submit(e){
    e.preventDefault();
    setErr("");
    try{
      const user = await api.login(email, password);
      localStorage.setItem("sm_user", JSON.stringify(user));
      window.location.href = "/dashboard";
    }catch{
      setErr("Invalid credentials");
    }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:420, margin:"60px auto"}}>
        <h1 className="page-title">SmartMeeting Login</h1>
        <form className="grid" style={{gap:12}} onSubmit={submit}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn" type="submit">Sign In</button>
          {err && <div style={{color:"var(--danger)"}}>{err}</div>}
        </form>
      </div>
    </div>
  );
}


