import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function App() {
  const nav = useNavigate();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: call your backend /api/auth later; for now just navigate
    nav("/dashboard");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>SmartMeeting</div>
        <h1 style={styles.title}>Sign in</h1>
        <form onSubmit={handleLogin} style={styles.form}>
          <input type="email" placeholder="Email / Username" value={email}
                 onChange={(e)=>setEmail(e.target.value)} style={styles.input} required />
          <input type="password" placeholder="Password" value={password}
                 onChange={(e)=>setPassword(e.target.value)} style={styles.input} required />
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <a href="#" style={styles.link}>Forgot Password?</a>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:"100vh", display:"grid", placeItems:"center", background:"#f8fafc" },
  card: { width:360, background:"#fff", border:"1px solid #e5e7eb", borderRadius:16, padding:24,
          boxShadow:"0 10px 30px rgba(0,0,0,0.06)", fontFamily:"system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" },
  logo: { fontWeight:700, color:"#0f172a", marginBottom:8 },
  title: { fontSize:20, margin:"8px 0 16px", color:"#0f172a" },
  form: { display:"grid", gap:10 },
  input: { height:40, padding:"0 12px", borderRadius:8, border:"1px solid #cbd5e1", outline:"none" },
  button: { height:42, borderRadius:8, background:"#2563eb", color:"#fff", border:"none", fontWeight:600, cursor:"pointer" },
  link: { display:"inline-block", marginTop:10, color:"#2563eb", fontSize:14, textDecoration:"none" }
};
