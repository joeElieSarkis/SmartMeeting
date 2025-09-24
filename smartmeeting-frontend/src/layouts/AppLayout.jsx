import { NavLink, Outlet, Link } from "react-router-dom";
import { getUser, logout } from "../auth";
import { useEffect, useState } from "react";

export default function AppLayout() {
  const user = getUser();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sm_sidebar") === "collapsed"
  );
  const [theme, setTheme] = useState(
    localStorage.getItem("sm_theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sm_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("sm_sidebar", collapsed ? "collapsed" : "open");
  }, [collapsed]);

  const isAdmin = user?.role === "Admin";
  const isGuest = user?.role === "Guest";

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      {/* === Sidebar === */}
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo.svg" alt="" />
          {!collapsed && <span>SmartMeeting</span>}
        </div>

        {!collapsed && <div className="section-label">Main</div>}
        <nav className="nav">
          <NavItem to="/dashboard" label="Dashboard" icon={IconHome} collapsed={collapsed} />
          <NavItem to="/calendar" label="Calendar" icon={IconCalendar} collapsed={collapsed} />
          {!isGuest && (
            <NavItem to="/meetings/book" label="Book a Room" icon={IconPlus} collapsed={collapsed} />
          )}
          <NavItem to="/minutes" label="Minutes" icon={IconNote} collapsed={collapsed} />
          {isAdmin && (
            <NavItem to="/admin/rooms" label="Rooms" icon={IconBuilding} collapsed={collapsed} />
          )}
          <NavItem to="/profile" label="Profile" icon={IconUser} collapsed={collapsed} />
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div style={{ display: "grid", gap: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>{user?.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{user?.email}</div>
              <div className="badge">
                Role: <strong>{user?.role}</strong>
              </div>
            </div>
          )}

          <div className="row" style={{ justifyContent: "space-between" }}>
            <button className="btn ghost sidebar-toggle" onClick={() => setCollapsed(c => !c)}>
              {collapsed ? "Expand" : "Collapse"}
            </button>
          </div>
        </div>
      </aside>

      {/* === Content === */}
      <section className="content">
        <header className="topbar">
          <div className="row">
            <span className="muted" style={{ fontWeight: 700 }}>Welcome</span>
            <span className="badge" style={{ marginLeft: 8 }}>{user?.role}</span>
          </div>

          <div className="row">
            {/* Theme toggle */}
            <button
              className="icon-btn"
              title="Toggle theme"
              onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
            </button>
            <Link className="btn ghost" to="/profile">Profile</Link>
            <button className="btn" onClick={logout}>Logout</button>
          </div>
        </header>

        <main className="container">
          <Outlet />
        </main>
      </section>
    </div>
  );
}

/* ===== Nav item ===== */
function NavItem({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
    >
      <Icon />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

/* ===== Inline Icons (Lucide-like, no deps) ===== */
function IconHome(props){ return (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);}
function IconCalendar(props){ return (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);}
function IconPlus(props){ return (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);}
function IconNote(props){ return (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 4h10l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M14 4v6h6" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);}
function IconBuilding(props){ return (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2M3 19h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);}
function IconUser(props){ return (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);}
function IconSun(props){ return (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l-1.4-1.4M20.4 20.4 19 19M19 5l1.4-1.4M5 19l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);}
function IconMoon(props){ return (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M20 12.5A7.5 7.5 0 1 1 11.5 4 6 6 0 1 0 20 12.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);}
