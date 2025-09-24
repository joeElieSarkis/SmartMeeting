import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { getUser } from "../auth";

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const user = getUser();

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [edit, setEdit] = useState({
    id: 0, title: "", agenda: "", date: "", start: "", end: "", roomId: "", organizerId: 0
  });
  const [editErr, setEditErr] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  async function load() {
    setErr(""); setLoading(true);
    try {
      const [ms, rs] = await Promise.all([api.meetings.all(), api.rooms.all()]);
      ms.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setMeetings(ms);
      setRooms(rs);
    } catch {
      setErr("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Ignore cancelled meetings in the dashboard views
  const activeMeetings = useMemo(
    () => meetings.filter(m => m.status !== "Cancelled"),
    [meetings]
  );

  // Quick: next meeting that hasn't ended yet
  const nextMeeting = useMemo(() => {
    const now = new Date();
    return activeMeetings.find(m => new Date(m.endTime) > now) || null;
  }, [activeMeetings]);

  // Meetings for today
  const todayMeetings = useMemo(() => {
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    return activeMeetings.filter(m => {
      const s = new Date(m.startTime);
      return s >= start && s <= end;
    });
  }, [activeMeetings]);

  // Notifications
  const notifications = useMemo(() => {
    const notes = [];
    if (todayMeetings.length) {
      notes.push(`You have ${todayMeetings.length} meeting${todayMeetings.length>1?"s":""} today.`);
    } else {
      notes.push("No meetings today.");
    }
    if (nextMeeting) {
      notes.push(`Next: “${nextMeeting.title}” at ${new Date(nextMeeting.startTime).toLocaleTimeString()}`);
    }
    return notes;
  }, [todayMeetings, nextMeeting]);

  // Room availability (today) — exclude cancelled
  const roomBlocks = useMemo(() => {
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    const map = new Map();
    rooms.forEach(r => map.set(r.id, []));
    activeMeetings.forEach(m => {
      const ms = new Date(m.startTime);
      const me = new Date(m.endTime);
      if (ms <= end && me >= start) {
        const list = map.get(m.roomId) || [];
        list.push({ start: ms, end: me, title: m.title, id: m.id });
        map.set(m.roomId, list);
      }
    });
    for (const [, arr] of map) arr.sort((a,b)=>a.start-b.start);
    return map;
  }, [rooms, activeMeetings]);

  function goJoin() {
    if (!nextMeeting) return;
    nav(`/meetings/active?id=${nextMeeting.id}`);
  }

  // ----- Reschedule (open modal) -----
  function openEdit(m) {
    setEditErr("");
    setEdit({
      id: m.id,
      title: m.title || "",
      agenda: m.agenda || "",
      date: toLocalDateValue(m.startTime),
      start: toLocalTimeValue(m.startTime),
      end: toLocalTimeValue(m.endTime),
      roomId: String(m.roomId),
      organizerId: m.organizerId
    });
    setEditOpen(true);
  }

  // ----- Reschedule (save) -----
  async function saveEdit() {
    setEditErr("");
    if (!edit.title.trim()) return setEditErr("Title is required.");
    if (!edit.date || !edit.start || !edit.end) return setEditErr("Date & time are required.");
    if (!edit.roomId) return setEditErr("Room is required.");

    setEditBusy(true);
    try {
      const startTime = `${edit.date}T${edit.start}:00`;
      const endTime   = `${edit.date}T${edit.end}:00`;
      await api.meetings.update(edit.id, {
        id: edit.id,
        title: edit.title.trim(),
        agenda: edit.agenda,
        organizerId: edit.organizerId,
        roomId: Number(edit.roomId),
        startTime,
        endTime
        // status: keep as-is
      });
      setEditOpen(false);
      await load();
    } catch (e) {
      setEditErr(e?.message || "Update failed");
    } finally {
      setEditBusy(false);
    }
  }

  // ----- Cancel meeting (soft cancel: set Status = "Cancelled") -----
  async function cancelMeeting(id) {
    const m = meetings.find(x => x.id === id);
    if (!m) return;
    if (!confirm("Mark this meeting as Cancelled?")) return;
    try {
      await api.meetings.update(id, {
        id: m.id,
        title: m.title,
        agenda: m.agenda,
        organizerId: m.organizerId,
        roomId: m.roomId,
        startTime: m.startTime,
        endTime: m.endTime,
        status: "Cancelled"
      });
      await load();
    } catch (e) {
      alert(e?.message || "Failed to cancel meeting");
    }
  }

  return (
    <div style={page}>
      <h1 style={title}>Dashboard</h1>

      {err && <div style={{color:"crimson", marginBottom:12}}>{err}</div>}
      {loading && <div className="card">Loading…</div>}

      {/* Notifications */}
      <section style={card}>
        <h2 style={h2}>Notifications</h2>
        <ul style={{margin:0, paddingLeft:18}}>
          {notifications.map((n,i)=><li key={i}>{n}</li>)}
        </ul>
      </section>

      {/* Upcoming Meetings (with Reschedule/Cancel) */}
      <section style={card}>
        <h2 style={h2}>Upcoming Meetings</h2>
        <ul style={{margin:0, paddingLeft:0, listStyle:"none"}}>
          {activeMeetings
            .filter(m => new Date(m.endTime) > new Date())
            .slice(0, 6)
            .map(m => (
              <li key={m.id} style={{marginBottom:10, paddingBottom:10, borderBottom:"1px solid #eef2f7"}}>
                <Link to={`/meetings/active?id=${m.id}`} style={rowLink}>
                  <span>{timeRange(m.startTime, m.endTime)}</span>
                  <span>• {m.title}</span>
                  <span>• Room #{m.roomId}</span>
                </Link>
                <div style={{marginTop:6, display:"flex", gap:8, flexWrap:"wrap"}}>
                  <Link className="btn ghost" to={`/meetings/active?id=${m.id}`}>Open</Link>
                  <Link className="btn ghost" to={`/minutes?meetingId=${m.id}`}>Minutes</Link>
                  <button className="btn ghost" onClick={()=>openEdit(m)}>Reschedule</button>
                  <button className="btn ghost" onClick={()=>cancelMeeting(m.id)}>Cancel</button>
                </div>
              </li>
            ))}
          {activeMeetings.filter(m => new Date(m.endTime) > new Date()).length === 0 && (
            <li style={{color:"var(--muted)"}}>No upcoming meetings</li>
          )}
        </ul>
      </section>

      {/* Quick actions */}
      <div style={grid}>
        <button className="btn" onClick={()=>nav("/meetings/book")}>Schedule Meeting</button>
        <button className="btn" onClick={goJoin} disabled={!nextMeeting}>Join Now</button>
        <button className="btn" onClick={()=>nav("/minutes/review")}>View Minutes</button>
        {user?.role === "Admin" && (
          <button className="btn" onClick={()=>nav("/admin/rooms")}>Manage Rooms</button>
        )}
      </div>

      {/* Room availability (today) */}
      <section style={card}>
        <h2 style={h2}>Room Availability — {formatDate(new Date())}</h2>
        {!rooms.length ? (
          <div style={{color:"var(--muted)"}}>No rooms</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{width:180}}>Room</th>
                <th>Booked Blocks</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => {
                const blocks = roomBlocks.get(r.id) || [];
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{fontWeight:600}}>{r.name}</div>
                      <div style={{fontSize:12, color:"#64748b"}}>
                        cap {r.capacity} • {r.location}
                      </div>
                    </td>
                    <td>
                      {!blocks.length ? (
                        <span style={{color:"var(--success)", fontWeight:600}}>Available</span>
                      ) : (
                        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                          {blocks.map(b => (
                            <Link
                              key={b.id}
                              to={`/meetings/active?id=${b.id}`}
                              className="badge"
                              title={b.title}
                            >
                              {pad2(b.start.getHours())}:{pad2(b.start.getMinutes())}
                              –
                              {pad2(b.end.getHours())}:{pad2(b.end.getMinutes())}
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Reschedule Modal */}
      {editOpen && (
        <div style={modalBackdrop}>
          <div style={modalCard}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <h3 style={{margin:0}}>Reschedule</h3>
              <button className="btn ghost" onClick={()=>setEditOpen(false)}>Close</button>
            </div>
            <div className="grid" style={{gap:10}}>
              <input className="input" placeholder="Title" value={edit.title} onChange={e=>setEdit({...edit, title:e.target.value})}/>
              <textarea className="input" rows="3" placeholder="Agenda" value={edit.agenda} onChange={e=>setEdit({...edit, agenda:e.target.value})}/>
              <div className="row">
                <input className="input" type="date" value={edit.date} onChange={e=>setEdit({...edit, date:e.target.value})}/>
                <input className="input" type="time" value={edit.start} onChange={e=>setEdit({...edit, start:e.target.value})}/>
                <input className="input" type="time" value={edit.end} onChange={e=>setEdit({...edit, end:e.target.value})}/>
              </div>
              <select className="input" value={edit.roomId} onChange={e=>setEdit({...edit, roomId:e.target.value})}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity})</option>)}
              </select>

              {editErr && <div style={{color:"var(--danger)"}}>{editErr}</div>}

              <div className="row">
                <button className="btn" onClick={saveEdit} disabled={editBusy}>
                  {editBusy ? "Saving…" : "Save"}
                </button>
                <button className="btn ghost" onClick={()=>setEditOpen(false)}>Cancel</button>
              </div>
              <div style={{color:"#64748b", fontSize:12}}>
                Tip: You’ll see a conflict message if the room is double-booked.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* helpers */
function timeRange(start, end){
  const s = new Date(start), e = new Date(end);
  return `${pad2(s.getHours())}:${pad2(s.getMinutes())}–${pad2(e.getHours())}:${pad2(e.getMinutes())}`;
}
function toLocalDateValue(dt){
  const d = new Date(dt);
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}
function toLocalTimeValue(dt){
  const d = new Date(dt);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x; }
function pad2(n){ return String(n).padStart(2,"0"); }
function formatDate(d){
  return d.toLocaleDateString(undefined, { weekday:"short", year:"numeric", month:"short", day:"numeric" });
}

/* styles */
const page = { minHeight:"100vh", background:"#f8fafc", color:"#0f172a", padding:"20px", fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" };
const title = { fontSize: 24, fontWeight: 700, marginBottom: 16 };
const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginBottom:16, boxShadow:"0 2px 6px rgba(0,0,0,0.05)" };
const h2 = { fontSize:16, fontWeight:700, marginTop:0, marginBottom:12 };
const grid = { display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", marginBottom:16 };
const rowLink = { textDecoration:"none", color:"#0f172a" };

const modalBackdrop = {
  position:"fixed", inset:0, background:"rgba(0,0,0,0.35)",
  display:"flex", alignItems:"center", justifyContent:"center", padding:16, zIndex:1000
};
const modalCard = {
  background:"#fff", border:"1px solid var(--border)", borderRadius:12, boxShadow:"0 10px 30px rgba(0,0,0,.15)",
  width:"min(640px, 100%)", padding:16
};
