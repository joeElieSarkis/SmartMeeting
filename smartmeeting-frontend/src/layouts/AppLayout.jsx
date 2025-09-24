// src/layouts/AppLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
import { getUser, logout } from "../auth";
import { useEffect } from "react";

export default function AppLayout(){
  const user = getUser();
  const isAdmin = user?.role === "Admin";
  const isGuest = user?.role === "Guest";

  // default theme
  useEffect(() => {
    const saved = localStorage.getItem("sm_theme");
    document.documentElement.dataset.theme = saved || "dark";
  }, []);

  function toggleTheme(){
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("sm_theme", root.dataset.theme);
  }

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <img src="/logo.svg" alt="" width="24" height="24" />
          <span>SmartMeeting</span>
        </div>

        <nav className="nav">
          <NavLink to="/dashboard" className={({isActive})=>`navlink${isActive?' active':''}`}>Dashboard</NavLink>
          <NavLink to="/calendar"  className={({isActive})=>`navlink${isActive?' active':''}`}>Calendar</NavLink>
          {!isGuest && (
            <NavLink to="/meetings/book" className={({isActive})=>`navlink${isActive?' active':''}`}>Book</NavLink>
          )}
          <NavLink to="/minutes" className={({isActive})=>`navlink${isActive?' active':''}`}>Minutes</NavLink>
          {isAdmin && (
            <NavLink to="/admin/rooms" className={({isActive})=>`navlink${isActive?' active':''}`}>Rooms</NavLink>
          )}
          <NavLink to="/profile" className={({isActive})=>`navlink${isActive?' active':''}`}>Profile</NavLink>

          <span style={{marginLeft:12, color:"var(--muted)"}}>
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
  const color =
    role === "Admin" ? "#16a34a" :
    role === "Employee" ? "#22c55e" : "#64748b";
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
