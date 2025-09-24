import { Link, Outlet, useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth";
import { useEffect, useRef, useState } from "react";
import { api } from "../api";

export default function AppLayout(){
  const nav = useNavigate();
  const user = getUser();
  const isAdmin = user?.role === "Admin";
  const isGuest = user?.role === "Guest";

  // Keep a default theme if not set
  useEffect(() => {
    if (!document.documentElement.dataset.theme) {
      document.documentElement.dataset.theme = "dark";
    }
  }, []);
  useEffect(() => {
    const saved = localStorage.getItem("sm_theme");
    if (saved) document.documentElement.dataset.theme = saved;
  }, []);
  function toggleTheme(){
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("sm_theme", root.dataset.theme);
  }

  return (
    <div>
      <header style={header} className="topbar">
        <div style={brand} className="brand">
          <img src="/logo.svg" alt="" width="24" height="24" />
          <span>SmartMeeting</span>
        </div>
        <nav style={navStyle} className="nav">
          <Link className="navlink" to="/dashboard">Dashboard</Link>
          <Link className="navlink" to="/calendar">Calendar</Link>
          {!isGuest && <Link className="navlink" to="/meetings/book">Book</Link>}
          <Link className="navlink" to="/minutes">Minutes</Link>
          {isAdmin && <Link className="navlink" to="/admin/rooms">Rooms</Link>}
          <Link className="navlink" to="/profile">Profile</Link>

          <NotificationsBell />

          <span style={{marginLeft:8, color:"var(--muted)"}}>
            {user?.name} <RoleBadge role={user?.role} />
          </span>

          <button className="btn ghost theme-toggle" onClick={toggleTheme}>Dark Mode</button>
          <button className="btn ghost" onClick={logout}>Logout</button>
        </nav>
      </header>
      <main className="container">
        <Outlet/>
      </main>
    </div>
  );
}

function RoleBadge({ role }) {
  if (!role) return null;
  const color = role === "Admin" ? "#16a34a" : role === "Employee" ? "#22c55e" : "#64748b";
  return (
    <span style={{
      marginLeft: 8,
      fontSize: 12,
      padding: "2px 8px",
      borderRadius: 999,
      background: "var(--chip)",
      color
    }}>
      {role}
    </span>
  );
}

function NotificationsBell(){
  const me = getUser();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  async function refreshCount(){
    if (!me) return;
    try { setCount(await api.notifications.unreadCount(me.id)); } catch {}
  }
  async function loadList(){
    if (!me) return;
    try { setItems(await api.notifications.listByUser(me.id, false, 20)); } catch {}
  }

  useEffect(() => {
    refreshCount();
    const id = setInterval(refreshCount, 30000); // poll every 30s
    return ()=>clearInterval(id);
  }, [me?.id]);

  useEffect(() => {
    function onDoc(e){
      if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return ()=>document.removeEventListener("click", onDoc);
  }, [open]);

  async function toggle(){
    const next = !open;
    setOpen(next);
    if (next) await loadList();
  }

  async function markAll(){
    if (!me) return;
    await api.notifications.markAllRead(me.id);
    await loadList();
    await refreshCount();
  }

  async function markOne(id){
    await api.notifications.markRead(id);
    await loadList();
    await refreshCount();
  }

  function goto(n){
    if (n.meetingId) nav(`/meetings/active?id=${n.meetingId}`);
    else nav("/dashboard");
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button className="icon-btn" onClick={toggle} aria-label="Notifications"
        style={{ position: "relative" }}>
        {/* simple bell glyph */}
        <span aria-hidden="true" style={{fontSize:16}}>🔔</span>
        {count > 0 && (
          <span style={{
            position:"absolute", top:-4, right:-4,
            background:"crimson", color:"#fff", fontSize:10, fontWeight:800,
            borderRadius:999, minWidth:16, height:16, display:"grid", placeItems:"center", padding:"0 4px"
          }}>
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="card" style={{
          position:"absolute", right:0, top:"calc(100% + 8px)",
          width: 340, zIndex: 50, padding: 0, overflow: "hidden"
        }}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", borderBottom:"1px solid var(--border)"}}>
            <strong>Notifications</strong>
            <button className="btn ghost" onClick={markAll}>Mark all read</button>
          </div>
          <div style={{maxHeight: 360, overflow:"auto"}}>
            {items.length === 0 ? (
              <div style={{padding:12, color:"var(--muted)"}}>No notifications</div>
            ) : items.map(n => (
              <div key={n.id} style={{padding:"10px 12px", borderBottom:"1px solid var(--border)", background: n.isRead ? "transparent" : "color-mix(in oklab, var(--primary) 8%, var(--surface))"}}>
                <div style={{display:"flex", justifyContent:"space-between", gap:8}}>
                  <div style={{fontSize:12, color:"var(--muted)"}}>{new Date(n.createdAt).toLocaleString()}</div>
                  {!n.isRead && <button className="btn ghost" onClick={()=>markOne(n.id)}>Mark read</button>}
                </div>
                <div style={{marginTop:6, cursor:"pointer"}} onClick={()=>goto(n)}>
                  {n.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const header={position:"sticky",top:0,zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:"1px solid var(--border)",background:"var(--surface)"};
const brand={display:"flex",gap:8,alignItems:"center",fontWeight:800};
const navStyle={display:"flex",gap:12,alignItems:"center"};
