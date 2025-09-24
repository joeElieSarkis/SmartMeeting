// src/pages/MeetingBooking.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { getUser } from "../auth";

export default function MeetingBooking(){
  const me = getUser();
  const isGuest = me?.role === "Guest";

  const [rooms,setRooms] = useState([]);
  const [users,setUsers] = useState([]);
  const [meetings,setMeetings] = useState([]); // for availability
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [err,setErr] = useState("");
  const [ok,setOk] = useState("");
  const [busy,setBusy] = useState(false);
  const [form,setForm] = useState({
    title:"", agenda:"", date:"", start:"", end:"", roomId:""
  });

  useEffect(()=>{
    api.rooms.all().then(setRooms).catch(()=>setErr("Failed to load rooms"));
    api.users.all().then(setUsers).catch(()=>setErr("Failed to load users"));
    api.meetings.all()
      .then(ms => {
        ms.sort((a,b)=> new Date(a.startTime) - new Date(b.startTime));
        setMeetings(ms);
      })
      .catch(()=>{});
  },[]);

  function toggleUser(id){
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]
    );
  }

  const submit = async () => {
    try {
      setErr(""); setOk(""); setBusy(true);
      const meNow = getUser();
      if(!meNow) { setErr("Not logged in"); return; }
      if(isGuest){ setErr("Guests cannot book meetings."); return; }
      if(!form.roomId) { setErr("Please select a room"); return; }
      if(!form.date || !form.start || !form.end) { setErr("Please select date & time"); return; }

      const startTime = `${form.date}T${form.start}:00`;
      const endTime   = `${form.date}T${form.end}:00`;

      const created = await api.meetings.create({
        title: form.title,
        agenda: form.agenda,
        organizerId: meNow.id,
        roomId: Number(form.roomId),
        startTime,
        endTime,
        status: "Scheduled"
      });

      const uniqueIds = Array.from(new Set(selectedUserIds));
      if (uniqueIds.length) {
        await Promise.all(uniqueIds.map(uid =>
          api.participants.create({ meetingId: created.id, userId: uid })
        ));
      }

      setOk("Meeting booked!");
      setForm({ title:"", agenda:"", date:"", start:"", end:"", roomId:"" });
      setSelectedUserIds([]);
    } catch (e) {
      if (e?.status === 409 || e?.status === 400) setErr(e.message);
      else setErr("Failed to create meeting");
    } finally {
      setBusy(false);
    }
  };

  // Guests: hard-block
  if (isGuest) {
    return (
      <div className="grid" style={{ gap: 16 }}>
        <h1 className="page-title">Book a Meeting</h1>
        <div className="card" style={{ color:"#334155" }}>
          You are signed in as <strong>Guest</strong>. Booking is disabled for your role.
          <div className="row" style={{ marginTop: 8 }}>
            <Link className="btn ghost" to="/calendar">View Calendar</Link>
            <Link className="btn ghost" to="/minutes/review">View Minutes</Link>
          </div>
        </div>
      </div>
    );
  }

  // Availability for selected date
  const dayKey = form.date || "";
  const byRoomToday = useMemo(() => {
    if (!dayKey) return new Map();
    const startOf = new Date(dayKey + "T00:00:00");
    const endOf   = new Date(dayKey + "T23:59:59");
    const map = new Map();
    rooms.forEach(r => map.set(r.id, []));
    meetings.forEach(m => {
      const s = new Date(m.startTime), e = new Date(m.endTime);
      if (s <= endOf && e >= startOf) {
        const list = map.get(m.roomId) || [];
        list.push(m);
        map.set(m.roomId, list);
      }
    });
    for (const [id,list] of map) list.sort((a,b)=> new Date(a.startTime) - new Date(b.startTime));
    return map;
  }, [meetings, rooms, dayKey]);

  function timeRange(start, end){
    const s = new Date(start), e = new Date(end);
    const pad = n=>String(n).padStart(2,"0");
    return `${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`;
  }

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Book a Meeting</h1>

      {/* Vertical stack, like Minutes page */}
      <div className="booking-vertical">

        {/* Details */}
        <div className="card">
          <h2 className="section-title">Details</h2>
          <div className="grid" style={{gap:10}}>
            <input
              className="input"
              placeholder="Title"
              value={form.title}
              onChange={e=>setForm({...form,title:e.target.value})}
            />
            <textarea
              className="input"
              rows="5"
              placeholder="Agenda"
              value={form.agenda}
              onChange={e=>setForm({...form,agenda:e.target.value})}
            />

            <div className="row time-row">
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={e=>setForm({...form,date:e.target.value})}
              />
              <input
                className="input time-input"
                type="time"
                value={form.start}
                onChange={e=>setForm({...form,start:e.target.value})}
              />
              <input
                className="input time-input"
                type="time"
                value={form.end}
                onChange={e=>setForm({...form,end:e.target.value})}
              />
            </div>

            <select
              className="input"
              value={form.roomId}
              onChange={e=>setForm({...form,roomId:e.target.value})}
            >
              <option value="">Select Room</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.capacity})
                </option>
              ))}
            </select>

            <div className="row">
              <button className="btn" type="button" onClick={submit} disabled={busy}>
                {busy ? "Booking…" : "Book Now"}
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={()=>{
                  setForm({ title:"", agenda:"", date:"", start:"", end:"", roomId:"" });
                  setSelectedUserIds([]);
                }}
              >
                Cancel
              </button>
            </div>

            {ok && <div style={{color:"var(--success)"}}>{ok}</div>}
            {err && <div style={{color:"var(--danger)"}}>{err}</div>}
          </div>
        </div>

        {/* Attendees */}
        <div className="card">
          <h2 className="section-title">Attendees</h2>
          <div style={{maxHeight:260, overflow:"auto", border:"1px solid var(--border)", borderRadius:10, padding:8}}>
            {users.length === 0 && (
              <div style={{color:"var(--muted)"}}>No users yet.</div>
            )}
            <ul style={{listStyle:"none", margin:0, padding:0}}>
              {users.map(u => (
                <li key={u.id} style={{display:"flex", alignItems:"center", gap:8, padding:"6px 4px"}}>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u.id)}
                    onChange={()=>toggleUser(u.id)}
                  />
                  <span>{u.name}</span>
                  <span style={{color:"var(--muted)"}}>&lt;{u.email}&gt;</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Room Availability */}
        <div className="card">
          <h2 className="section-title">Room Availability</h2>
          {!form.date ? (
            <div className="muted">Pick a date to see availability.</div>
          ) : (
            <ul style={{margin:0, paddingLeft:18}}>
              {rooms.map(r => {
                const blocks = byRoomToday.get(r.id) || [];
                return (
                  <li key={r.id} style={{marginBottom:6}}>
                    <strong>{r.name}</strong>{": "}
                    {blocks.length === 0 ? (
                      <span className="badge badge--inprogress" style={{marginLeft:6}}>Available</span>
                    ) : (
                      <span style={{color:"var(--muted)"}}>
                        {blocks.map(b => timeRange(b.startTime, b.endTime)).join(", ")} busy
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
