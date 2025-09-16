import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.meetings.all().then(setMeetings).catch(() => setErr("Failed to load meetings"));
  }, []);

  return (
    <div style={page}>
      <h1 style={title}>Dashboard</h1>

      <section style={card}>
        <h2 style={h2}>Upcoming Meetings</h2>
        {err && <div style={{color:"crimson"}}>{err}</div>}
        <ul style={{margin:0, paddingLeft:18}}>
          {meetings.map(m => (
            <li key={m.id}>
              {timeRange(m.startTime, m.endTime)} • {m.title} • Room #{m.roomId}
            </li>
          ))}
          {meetings.length===0 && !err && <li>No meetings yet</li>}
        </ul>
      </section>

      <div style={grid}>
        <div style={card}>Schedule Meeting</div>
        <div style={card}>Join Now</div>
        <div style={card}>View Minutes</div>
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
