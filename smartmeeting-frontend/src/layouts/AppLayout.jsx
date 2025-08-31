import { Link, Outlet } from "react-router-dom";

export default function AppLayout(){
  return (
    <div>
      <header style={header}>
        <div style={brand}>
          <img src="/logo.svg" alt="" width="24" height="24" />
          <span>SmartMeeting</span>
        </div>
        <nav style={nav}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/meetings/book">Book</Link>
          <Link to="/minutes">Minutes</Link>
          <Link to="/admin/rooms">Rooms</Link>
        </nav>
      </header>
      <main className="container">
        <Outlet/>
      </main>
    </div>
  );
}
const header={position:"sticky",top:0,zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:"1px solid #e5e7eb",background:"#fff"};
const brand={display:"flex",gap:8,alignItems:"center",fontWeight:800};
const nav={display:"flex",gap:12};
