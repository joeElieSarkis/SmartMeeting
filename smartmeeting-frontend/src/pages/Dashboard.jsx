// src/pages/Dashboard.jsx
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

  // reports state
  const [range, setRange] = useState("week"); // "week" | "month"

  async function load() {
    setErr(""); setLoading(true);
    try {
      const [ms, rs] = await Promise.all([api.meetings.all(), api.rooms.all()]);
      ms.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      rs.sort((a, b) => a.name.localeCompare(b.name));
      setMeetings(ms);
      setRooms(rs);
    } catch {
      setErr("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const nextMeeting = useMemo(() => {
    const now = new Date();
    return meetings.find(m => new Date(m.endTime) > now) || null;
  }, [meetings]);

  const todayMeetings = useMemo(() => {
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    return meetings.filter(m => {
      const s = new Date(m.startTime);
      return s >= start && s <= end;
    });
  }, [meetings]);

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

  const roomBlocks = useMemo(() => {
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    const map = new Map();
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
    for (const [, arr] of map) arr.sort((a,b)=>a.start-b.start);
    return map;
  }, [rooms, meetings]);

  function goJoin() {
    if (!nextMeeting) return;
    nav(`/meetings/active?id=${nextMeeting.id}`);
  }

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
      });
      setEditOpen(false);
      await load();
    } catch (e) {
      setEditErr(e?.message || "Update failed");
    } finally {
      setEditBusy(false);
    }
  }

  async function cancelMeeting(id) {
    if (!confirm("Cancel (delete) this meeting?")) return;
    try {
      await api.meetings.delete(id);
      await load();
    } catch (e) {
      alert(e?.message || "Failed to cancel meeting");
    }
  }

  // ---------------- Reports (client-side) ----------------
  const isCanceled = (status) => {
    const s = (status || "").toLowerCase();
    return s === "canceled" || s === "cancelled";
  };
  const now = new Date();
  const [wkStart, wkEnd] = useMemo(() => weekBounds(now), [now]);
  const monthWeeks = useMemo(() => monthGridBounds(now), [now]);

  const weekSummary = useMemo(() => {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = Array(7).fill(0);
    const items = meetings.filter(
      (m) => !isCanceled(m.status) && isInRange(new Date(m.startTime), wkStart, wkEnd)
    );
    items.forEach((m) => {
      const d = new Date(m.startTime);
      counts[d.getDay()] += 1;
    });
    return {
      title: `${wkStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${wkEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
      points: labels.map((label, i) => ({ label, count: counts[i] })),
      total: counts.reduce((a, b) => a + b, 0),
    };
  }, [meetings, wkStart, wkEnd]);

  const monthSummary = useMemo(() => {
    const s = monthStart(now), e = monthEnd(now);
    const items = meetings.filter((m) => !isCanceled(m.status) && isInRange(new Date(m.startTime), s, e));
    const buckets = monthWeeks.map((w, idx) => ({
      label: `W${idx + 1}`,
      count: items.filter((m) => {
        const d = new Date(m.startTime);
        return d >= w.start && d <= w.end;
      }).length,
      range: `${w.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}–${w.end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
    }));
    return {
      title: now.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      points: buckets,
      total: buckets.reduce((a, b) => a + b.count, 0),
    };
  }, [meetings, monthWeeks, now]);

  const summary = range === "week" ? weekSummary : monthSummary;
  const maxCount = Math.max(1, ...summary.points.map((p) => p.count));

  // Most used rooms (last 30 days)
  const topRooms = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);

    const filtered = meetings.filter((m) => {
      if (isCanceled(m.status)) return false;
      const s = new Date(m.startTime);
      const e = new Date(m.endTime);
      return e >= from && s <= to;
    });

    const minsDiff = (a, b) => Math.max(0, (b - a) / 60000);
    const map = new Map(); // roomId -> { roomId, roomName, meetings, minutes }
    filtered.forEach((m) => {
      const r = rooms.find((x) => x.id === m.roomId);
      const key = m.roomId;
      const cur = map.get(key) || { roomId: key, roomName: r?.name || `#${key}`, meetings: 0, minutes: 0 };
      cur.meetings += 1;
      cur.minutes += minsDiff(new Date(m.startTime), new Date(m.endTime));
      map.set(key, cur);
    });

    const list = Array.from(map.values())
      .sort((a, b) => (b.meetings - a.meetings) || (b.minutes - a.minutes))
      .slice(0, 5)
      .map((x) => ({ ...x, hours: Math.round(x.minutes / 60) }));
    return { from, to, rows: list };
  }, [meetings, rooms]);

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Dashboard</h1>

      {err && <div className="card" style={{color:"var(--danger)"}}>{err}</div>}
      {loading && <div className="card">Loading…</div>}

      {/* Quick actions */}
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))"}}>
        <button className="btn" onClick={()=>nav("/meetings/book")}>Schedule Meeting</button>
        <button className="btn" onClick={goJoin} disabled={!nextMeeting}>Join Now</button>
        <button className="btn" onClick={()=>nav("/minutes/review")}>View Minutes</button>
        {user?.role === "Admin" && (
          <button className="btn" onClick={()=>nav("/admin/rooms")}>Manage Rooms</button>
        )}
      </div>

      {/* Reports: Summary + Most Used Rooms */}
      <div className="stats-grid">
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Summary ({range === "week" ? "This Week" : "This Month"})
            </h2>
            <div className="row">
              <select className="input" value={range} onChange={(e) => setRange(e.target.value)}>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>{summary.title}</div>

          {summary.points.length === 0 ? (
            <div className="muted" style={{ marginTop: 12 }}>No data yet.</div>
          ) : (
            <div className="mini-bars" style={{ marginTop: 12 }}>
              {summary.points.map((p, i) => (
                <div className="mini-row" key={i}>
                  <div style={{ fontWeight: 700, textAlign: "right" }}>{p.label}</div>
                  <div className="mini-track">
                    <div className="mini-fill" style={{ width: `${(p.count / maxCount) * 100}%` }} />
                  </div>
                  <div style={{ textAlign: "right" }}>{p.count}</div>
                </div>
              ))}
            </div>
          )}

          <div className="row" style={{ marginTop: 12, color: "var(--muted)" }}>
            <span className="badge">Total: {summary.total}</span>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 0 }}>Most Used Rooms</h2>
          <div className="muted" style={{ marginTop: 4 }}>
            Last 30 days ({topRooms.from.toLocaleDateString()} – {topRooms.to.toLocaleDateString()})
          </div>

          {topRooms.rows.length === 0 ? (
            <div className="muted" style={{ marginTop: 12 }}>No room usage yet.</div>
          ) : (
            <table className="table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Meetings</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {topRooms.rows.map((r) => (
                  <tr key={r.roomId}>
                    <td>{r.roomName}</td>
                    <td>{r.meetings}</td>
                    <td>{r.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Notifications */}
      <section className="card">
        <h2 className="section-title">Notifications</h2>
        <ul style={{margin:0, paddingLeft:18}}>
          {notifications.map((n,i)=><li key={i}>{n}</li>)}
        </ul>
      </section>

      {/* Upcoming Meetings */}
      <section className="card">
        <h2 className="section-title">Upcoming Meetings</h2>
        <ul style={{margin:0, paddingLeft:0, listStyle:"none"}}>
          {meetings
            .filter(m => new Date(m.endTime) > new Date())
            .slice(0, 6)
            .map(m => (
              <li key={m.id} style={{marginBottom:10, paddingBottom:10, borderBottom:"1px solid var(--border)"}}>
                <Link to={`/meetings/active?id=${m.id}`} style={{textDecoration:"none", color:"var(--text)"}}>
                  <span>{timeRange(m.startTime, m.endTime)}</span>
                  <span> • {m.title}</span>
                  <span> • Room #{m.roomId}</span>
                </Link>
                <div style={{marginTop:6, display:"flex", gap:8, flexWrap:"wrap"}}>
                  <Link className="btn ghost" to={`/meetings/active?id=${m.id}`}>Open</Link>
                  <Link className="btn ghost" to={`/minutes?meetingId=${m.id}`}>Minutes</Link>
                  <button className="btn ghost" onClick={()=>openEdit(m)}>Reschedule</button>
                  <button className="btn ghost" onClick={()=>cancelMeeting(m.id)}>Cancel</button>
                </div>
              </li>
            ))}
          {meetings.filter(m => new Date(m.endTime) > new Date()).length === 0 && (
            <li style={{color:"var(--muted)"}}>No upcoming meetings</li>
          )}
        </ul>
      </section>

      {/* Room availability (today) */}
      <section className="card">
        <h2 className="section-title">Room Availability — {formatDate(new Date())}</h2>
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
                      <div style={{fontSize:12, color:"var(--muted)"}}>
                        cap {r.capacity} • {r.location}
                      </div>
                    </td>
                    <td>
                      {!blocks.length ? (
                        <span className="badge" style={{background:"#0b3", color:"#eafff0"}}>Available</span>
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
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <h3 style={{margin:0}}>Reschedule</h3>
              <button className="btn ghost" onClick={()=>setEditOpen(false)}>Close</button>
            </div>
            <div className="grid">
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
              <div style={{color:"var(--muted)", fontSize:12}}>
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
function isInRange(dt, start, end){ return dt >= start && dt <= end; }
function weekBounds(d){
  const x = new Date(d);
  const dow = x.getDay();
  const start = new Date(x);
  start.setDate(x.getDate() - dow);
  start.setHours(0,0,0,0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23,59,59,999);
  return [start, end];
}
function monthStart(d){ return new Date(d.getFullYear(), d.getMonth(), 1, 0,0,0,0); }
function monthEnd(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0, 23,59,59,999); }
function monthGridBounds(d){
  const start = monthStart(d);
  const end = monthEnd(d);
  const [w0] = weekBounds(start);
  const weeks = [];
  for (let cursor = new Date(w0); cursor <= end; cursor.setDate(cursor.getDate() + 7)) {
    const [ws, we] = weekBounds(cursor);
    weeks.push({ start: new Date(ws), end: new Date(we) });
  }
  for (const w of weeks) {
    if (w.start < start) w.start = new Date(start);
    if (w.end > end) w.end = new Date(end);
  }
  return weeks;
}
