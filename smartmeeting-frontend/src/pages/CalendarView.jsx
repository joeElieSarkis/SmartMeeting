import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { getUser } from "../auth";

export default function CalendarView() {
  const [view, setView] = useState("month"); // "month" | "week"
  const [current, setCurrent] = useState(new Date());
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [roomId, setRoomId] = useState("");       // filter
  const [organizerId, setOrganizerId] = useState(""); // filter
  const [err, setErr] = useState("");

  const me = getUser();

  useEffect(() => {
    async function load() {
      setErr("");
      try {
        const [rs, us, ms] = await Promise.all([
          api.rooms.all(),
          api.users.all(),
          api.meetings.all(),
        ]);
        rs.sort((a,b)=>a.name.localeCompare(b.name));
        us.sort((a,b)=>a.name.localeCompare(b.name));
        ms.sort((a,b)=> new Date(a.startTime) - new Date(b.startTime));
        setRooms(rs);
        setUsers(us);
        setMeetings(ms);
      } catch {
        setErr("Failed to load calendar data");
      }
    }
    load();
  }, []);

  // filtered meetings
  const filtered = useMemo(() => {
    let xs = [...meetings];
    if (roomId) xs = xs.filter(m => m.roomId === Number(roomId));
    if (organizerId) xs = xs.filter(m => m.organizerId === Number(organizerId));
    return xs;
  }, [meetings, roomId, organizerId]);

  // calendar ranges
  const weekDates = useMemo(() => weekMatrix(current), [current]);
  const monthDates = useMemo(() => monthMatrix(current), [current]);

  // meeting bins per day
  const mapByDay = useMemo(() => {
    const map = new Map(); // key = yyyy-mm-dd → list
    const start = view === "week" ? weekStart(current) : monthStartGrid(current);
    const end = view === "week" ? weekEnd(current) : monthEndGrid(current);
    filtered.forEach(m => {
      const s = new Date(m.startTime);
      if (s >= start && s <= end) {
        const key = ymd(s);
        const list = map.get(key) || [];
        list.push(m);
        map.set(key, list);
      }
    });
    for (const [k, list] of map) list.sort((a,b)=> new Date(a.startTime) - new Date(b.startTime));
    return map;
  }, [filtered, current, view]);

  function next() {
    if (view === "week") setCurrent(addDays(current, 7));
    else setCurrent(addMonths(current, 1));
  }
  function prev() {
    if (view === "week") setCurrent(addDays(current, -7));
    else setCurrent(addMonths(current, -1));
  }
  function today() { setCurrent(new Date()); }

  const title = view === "week"
    ? `${fmtDate(weekStart(current))} – ${fmtDate(weekEnd(current))}`
    : current.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="grid" style={{ gap: 16 }}>
      <h1 className="page-title">Calendar</h1>
      {err && <div style={{color:"crimson"}}>{err}</div>}

      {/* Controls */}
      <div className="card">
        <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
          <div className="row" style={{gap:8}}>
            <button className="btn ghost" onClick={prev}>← Prev</button>
            <button className="btn ghost" onClick={today}>Today</button>
            <button className="btn ghost" onClick={next}>Next →</button>
          </div>
          <div style={{fontWeight:800, fontSize:18}}>{title}</div>
          <div className="row" style={{gap:8}}>
            <select className="input" value={view} onChange={e=>setView(e.target.value)}>
              <option value="month">Month</option>
              <option value="week">Week</option>
            </select>
            <select className="input" value={roomId} onChange={e=>setRoomId(e.target.value)}>
              <option value="">All Rooms</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select className="input" value={organizerId} onChange={e=>setOrganizerId(e.target.value)}>
              <option value="">All Organizers</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="row" style={{gap:10, flexWrap:"wrap"}}>
        <span className="badge">Scheduled</span>
        <span className="badge" style={{background:"#dcfce7", color:"#166534"}}>InProgress</span>
        <span className="badge" style={{background:"#fee2e2", color:"#991b1b"}}>Completed</span>
      </div>

      {/* Calendar grids */}
      {view === "week" ? (
        <div className="card">
          <CalendarGrid days={weekDates[0]} mapByDay={mapByDay} />
        </div>
      ) : (
        <div className="card">
          {monthDates.map((row, i) => (
            <CalendarGrid key={i} days={row} mapByDay={mapByDay} dimOtherMonth={true} month={current.getMonth()} />
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="row" style={{gap:8}}>
        <Link className="btn" to="/meetings/book">Book a Room</Link>
        {me?.role === "Admin" && <Link className="btn ghost" to="/admin/rooms">Manage Rooms</Link>}
      </div>
    </div>
  );
}

/* --- Components --- */
function CalendarGrid({ days, mapByDay, dimOtherMonth = false, month }) {
  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(7, 1fr)",
      gap:8
    }}>
      {/* Header row when rendering the first week of a block */}
      <DayHeader />
      {/* Days */}
      {days.map((d, idx) => {
        const key = ymd(d);
        const items = mapByDay.get(key) || [];
        const muted = dimOtherMonth && d.getMonth() !== month;
        return (
          <div key={idx} style={{
            border:"1px solid var(--border)",
            borderRadius:10,
            padding:8,
            minHeight:110,
            background:"#fff",
            opacity: muted ? 0.6 : 1
          }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
              <strong style={{fontSize:14}}>{d.getDate()}</strong>
              <span style={{fontSize:12, color:"#64748b"}}>{items.length} item{items.length!==1?"s":""}</span>
            </div>
            <div style={{display:"grid", gap:6}}>
              {items.map(m => (
                <Link
                  key={m.id}
                  to={`/meetings/active?id=${m.id}`}
                  className="badge"
                  title={m.title}
                  style={badgeForStatus(m.status)}
                >
                  {hhmm(m.startTime)}–{hhmm(m.endTime)} • {m.title}
                </Link>
              ))}
              {!items.length && <div style={{color:"var(--muted)", fontSize:12}}>Free</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayHeader() {
  const labels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return (
    <>
      {labels.map((x,i)=>(
        <div key={i} style={{fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase"}}>
          {x}
        </div>
      ))}
    </>
  );
}

/* --- Helpers --- */
function ymd(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function addDays(d, n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function addMonths(d, n){ const x=new Date(d); x.setMonth(x.getMonth()+n); return x; }
function startOfMonth(d){ const x=new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; }
function endOfMonth(d){ const x=new Date(d); x.setMonth(x.getMonth()+1); x.setDate(0); x.setHours(23,59,59,999); return x; }
function weekStart(d){ const x=new Date(d); const dow=x.getDay(); x.setDate(x.getDate()-dow); x.setHours(0,0,0,0); return x; }
function weekEnd(d){ const x=weekStart(d); x.setDate(x.getDate()+6); x.setHours(23,59,59,999); return x; }
function monthStartGrid(d){ const s=startOfMonth(d); return weekStart(s); }
function monthEndGrid(d){ const e=endOfMonth(d); return weekEnd(e); }
function weekMatrix(d){
  const start = weekStart(d);
  return [Array.from({length:7}, (_,i)=> addDays(start, i))];
}
function monthMatrix(d){
  const start = monthStartGrid(d);
  const end = monthEndGrid(d);
  const days = [];
  for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1)) days.push(new Date(cur));
  return [0,1,2,3,4,5].map(r => days.slice(r*7, r*7+7));
}
function fmtDate(d){ return d.toLocaleDateString(undefined, { month:"short", day:"numeric" }); }
function hhmm(dt){ const t=new Date(dt); return `${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`; }
function badgeForStatus(status){
  if (status === "InProgress") return { background:"#dcfce7", color:"#166534" };
  if (status === "Completed")  return { background:"#fee2e2", color:"#991b1b" };
  return {}; // default .badge styles
}
