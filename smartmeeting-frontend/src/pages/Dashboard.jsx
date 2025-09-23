import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { getUser } from "../auth";

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit / Cancel state
  const [editing, setEditing] = useState(null); // the meeting being edited
  const [editForm, setEditForm] = useState({ id: 0, title: "", agenda: "", date: "", start: "", end: "", roomId: "" });
  const [busyEdit, setBusyEdit] = useState(false);

  const nav = useNavigate();
  const user = getUser();

  async function load() {
    setErr(""); setOk(""); setLoading(true);
    try {
      const [ms, rs] = await Promise.all([ api.meetings.all(), api.rooms.all() ]);
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

  // Quick: next meeting that hasn't ended yet
  const nextMeeting = useMemo(() => {
    const now = new Date();
    return meetings.find(m => new Date(m.endTime) > now) || null;
  }, [meetings]);

  // Meetings for today
  const todayMeetings = useMemo(() => {
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    return meetings.filter(m => {
      const s = new Date(m.startTime);
      return s >= start && s <= end;
    });
  }, [meetings]);

  // Notifications
  const notifications = useMemo(() => {
    const notes = [];
    if (todayMeetings.length) notes.push(`You have ${todayMeetings.length} meeting${todayMeetings.length>1?"s":""} today.`);
    else notes.push("No meetings today.");
    if (nextMeeting) notes.push(`Next: “${nextMeeting.title}” at ${new Date(nextMeeting.startTime).toLocaleTimeString()}`);
    return notes;
  }, [todayMeetings, nextMeeting]);

  // Build room availability map for today
  const roomBlocks = useMemo(() => {
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    const map = new Map(); // roomId -> [{start,end,title}]
    rooms.forEach(r => map.set(r.id, []));
    meetings.forEach(m => {
      const ms = new Date(m.startTime);
      const me = new Date(m.endTime);
      if (ms <= end && me >= start) {
        const list = map.get(m.roomId) || [];
        list.push({ start: ms, end: me, title: m.title, id: m.id });
        map.set(m.roomId, list);
      }
    });
    for (const [k, arr] of map) arr.sort((a,b)=>a.start-b.start);
    return map;
  }, [rooms, meetings]);

  function goJoin() {
    if (!nextMeeting) return;
    nav(`/meetings/active?id=${nextMeeting.id}`);
  }

  // ----- Reschedule / Cancel helpers -----
  function openEdit(m) {
    const s = new Date(m.startTime);
    const e = new Date(m.endTime);
    setEditing(m);
    setEditForm({
      id: m.id,
      title: m.title || "",
      agenda: m.agenda || "",
      date: toYMD(s),
      start: toHM(s),
      end: toHM(e),
      roomId: String(m.roomId || "")
    });
    setErr(""); setOk("");
  }
  function closeEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    if (!editing) return;
    setBusyEdit(true); setErr(""); setOk("");
    try {
      const payload = {
        id: editForm.id,
        title: editForm.title.trim(),
        agenda: editForm.agenda.trim(),
        organizerId: editing.organizerId,
        roomId: Number(editForm.roomId || 0),
        startTime: `${editForm.date}T${editForm.start}:00`, // local time strings like booking page
        endTime: `${editForm.date}T${editForm.end}:00`,
        status: editing.status || "Scheduled"
      };
      await api.meetings.update(editForm.id, payload);
      setOk("Meeting updated");
      closeEdit();
      await load();
    } catch (e) {
      // surface server messages (409 overlap, 400 invalid range)
      setErr(e?.message || "Failed to update meeting");
    } finally {
      setBusyEdit(false);
    }
  }

  async function cancelMeeting(id) {
    if (!confirm("Cancel this meeting?")) return;
    setErr(""); setOk("");
    try {
      await api.meetings.delete(id);
      setOk("Meeting canceled");
      await load();
    } catch (e) {
      setErr(e?.message || "Failed to cancel meeting");
    }
  }

  return (
    <div style={page}>
      <h1 style={title}>Dashboard</h1>

      {(ok || err) && (
        <div className="card" style={{ marginBottom: 12, color: ok ? "var(--success)" : "crimson" }}>
          {ok || err}
        </div>
      )}
      {loading && <div className="card">Loading…</div>}

      {/* Notifications */}
      <section style={card}>
        <h2 style={h2}>Notifications</h2>
        <ul style={{margin:0, paddingLeft:18}}>
          {notifications.map((n,i)=><li key={i}>{n}</li>)}
        </ul>
      </section>

      {/* Upcoming Meetings */}
      <section style={card}>
        <h2 style={h2}>Upcoming Meetings</h2>
        <ul style={{margin:0, paddingLeft:0, listStyle:"none"}}>
          {meetings
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
                  <button className="btn ghost" onClick={()=>openEdit(m)}>Edit</button>
                  <button className="btn ghost" onClick={()=>cancelMeeting(m.id)}>Cancel</button>
                </div>
              </li>
            ))}
          {meetings.filter(m => new Date(m.endTime) > new Date()).length === 0 && (
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

      {/* Edit Modal */}
      {editing && (
        <div style={overlay}>
          <div className="card" style={modal}>
            <h2 style={h2}>Reschedule / Edit</h2>
            <div className="grid" style={{ gap: 10 }}>
              <input className="input" placeholder="Title" value={editForm.title} onChange={e=>setEditForm({...editForm, title:e.target.value})} />
              <textarea className="input" rows="3" placeholder="Agenda" value={editForm.agenda} onChange={e=>setEditForm({...editForm, agenda:e.target.value})} />
              <div className="row">
                <input className="input" type="date" value={editForm.date} onChange={e=>setEditForm({...editForm, date:e.target.value})} />
                <input className="input" type="time" value={editForm.start} onChange={e=>setEditForm({...editForm, start:e.target.value})} />
                <input className="input" type="time" value={editForm.end} onChange={e=>setEditForm({...editForm, end:e.target.value})} />
              </div>
              <select className="input" value={editForm.roomId} onChange={e=>setEditForm({...editForm, roomId:e.target.value})}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity})</option>)}
              </select>

              <div className="row">
                <button className="btn" onClick={saveEdit} disabled={busyEdit}>{busyEdit ? "Updating…" : "Save Changes"}</button>
                <button className="btn ghost" onClick={closeEdit}>Close</button>
              </div>
              <div style={{ color: "var(--muted)" }}>
                Conflicts are prevented by the server. If the time overlaps, you’ll see an error.
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
function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x; }
function pad2(n){ return String(n).padStart(2,"0"); }
function formatDate(d){
  return d.toLocaleDateString(undefined, { weekday:"short", year:"numeric", month:"short", day:"numeric" });
}
function toYMD(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function toHM(d){ return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }

/* styles */
const page = { minHeight:"100vh", background:"#f8fafc", color:"#0f172a", padding:"20px", fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" };
const title = { fontSize: 24, fontWeight: 700, marginBottom: 16 };
const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginBottom:16, boxShadow:"0 2px 6px rgba(0,0,0,0.05)" };
const h2 = { fontSize:16, fontWeight:700, marginTop:0, marginBottom:12 };
const grid = { display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", marginBottom:16 };
const rowLink = { textDecoration:"none", color:"#0f172a" };

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 12, zIndex: 50
};
const modal = { width: "100%", maxWidth: 560 };
