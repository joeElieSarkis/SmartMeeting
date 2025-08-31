import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login(){
  const nav = useNavigate();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const onSubmit = async (e)=>{
    e.preventDefault();
    // TODO: connect to /api/auth/login later
    nav("/dashboard");
  };
  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center"}}>
      <div className="card" style={{width:380}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <img src="/logo.svg" width="24" height="24" alt=""/>
          <strong>SmartMeeting</strong>
        </div>
        <h1 className="page-title">Sign in</h1>
        <form onSubmit={onSubmit} className="grid" style={{gap:10}}>
          <input className="input" type="email" placeholder="Email / Username" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
          <button className="btn" type="submit">Login</button>
        </form>
        <div style={{marginTop:10}}>
          <Link to="#" style={{color:"var(--primary)"}}>Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
}
