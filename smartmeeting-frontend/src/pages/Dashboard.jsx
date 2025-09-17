import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    api.meetings.all().then(setMeetings).catch(() => setErr("Failed to load meetings"));
  }, []);

  // pick the next upcoming meeting (for the "Join Now" quick action)
  const nextMeeting = useMemo(() => {
    const now = new Date();
    return [...meetings]
      .filter(m => new Date(m.endTime) > now)
      .sort((a,b) => new Date(a.startTime) - new Date(b.startTime))[0];
  }, [meetings]);

  function goJoin() {
    if (!nextMeeting) return;
    nav(`/meetings/active?id=${nextMeeting.id}`);
  }

  return (
    <div style={page}>
      <h1 style={title}>Dashboard</h1>

      <section style={card}>
        <h2 style={h2}>Upcoming Meetings</h2>
        {err && <div style={{color:"crimson"}}>{err}</div>}
        <ul style={{margin:0, paddingLeft:18, listStyle:"none"}}>
          {meetings.map(m => (
            <li key={m.id} style={{marginBottom:8}}>
              <Link to={`/meetings/active?id=${m.id}`} style={rowLink}>
                <span>{timeRange(m.startTime, m.endTime)}</span>
                <span>• {m.title}</span>
                <span>• Room #{m.roomId}</span>
              </Link>
              <div style={{marginTop:4, display:"flex", gap:8}}>
                <Link className="btn ghost" to={`/meetings/active?id=${m.id}`}>Open</Link>
                <Link className="btn ghost" to={`/minutes?meetingId=${m.id}`}>Minutes</Link>
              </div>
            </li>
          ))}
          {meetings.length===0 && !err && <li>No meetings yet</li>}
        </ul>
      </section>

      <div style={grid}>
        <button className="btn" onClick={()=>nav("/meetings/book")}>Schedule Meeting</button>
        <button className="btn" onClick={goJoin} disabled={!nextMeeting}>Join Now</button>
        <button className="btn" onClick={()=>nav("/minutes")}>View Minutes</button>
      </div>

      <section style={card}>
        <h2 style={h2}>Room Availability</h2>
        <div>Calendar placeholder</div>
      </section>
    </div>
  );
}

function timeRange(start, end){
  const s = new Date(start), e = new Date(end);
  const pad = n => String(n).padStart(2,"0");
  return `${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`;
}

const page = { minHeight:"100vh", background:"#f8fafc", color:"#0f172a", padding:"20px", fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" };
const title = { fontSize: 24, fontWeight: 700, marginBottom: 20 };
const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginBottom:20, boxShadow:"0 2px 6px rgba(0,0,0,0.05)" };
const h2 = { fontSize:16, fontWeight:600, marginTop:0, marginBottom:12 };
const grid = { display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", marginBottom:20 };
const rowLink = { textDecoration:"none", color:"#0f172a" };
