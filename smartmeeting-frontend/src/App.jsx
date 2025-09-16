import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:5114"; // your backend

export default function Login(){
  const nav = useNavigate();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const onSubmit = async (e)=>{
    e.preventDefault();
    setError(""); setLoading(true);
    try{
      const res = await fetch(`${API}/api/auth/login`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email, password })
      });
      if(!res.ok){
        setError("Invalid email or password");
        return;
      }
      const user = await res.json();
      localStorage.setItem("sm_user", JSON.stringify(user)); // keep simple for now
      nav("/dashboard");
    }catch(err){
      setError("Cannot reach server");
    }finally{
      setLoading(false);
    }
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
          <button className="btn" type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
          {error && <div style={{color:"crimson",fontSize:14}}>{error}</div>}
        </form>
        <div style={{marginTop:10}}>
          <Link to="#" style={{color:"var(--primary)"}}>Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
}

