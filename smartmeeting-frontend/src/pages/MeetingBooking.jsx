import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { getUser } from "../auth";

export default function MeetingBooking(){
  const me = getUser();
  const isGuest = me?.role === "Guest";

  const [rooms,setRooms] = useState([]);
  const [users,setUsers] = useState([]);
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
  },[]);

  function toggleUser(id){
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]
    );
  }

  const submit = async () => {
    try {
      setErr(""); setOk(""); setBusy(true);
      const me = getUser();
      if(!me) { setErr("Not logged in"); return; }
      if(isGuest){ setErr("Guests cannot book meetings."); return; }
      if(!form.roomId) { setErr("Please select a room"); return; }
      if(!form.date || !form.start || !form.end) { setErr("Please select date & time"); return; }

      const startTime = `${form.date}T${form.start}:00`;
      const endTime   = `${form.date}T${form.end}:00`;

      const created = await api.meetings.create({
        title: form.title,
        agenda: form.agenda,
        organizerId: me.id,
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

  // Hard block page for guests (message + links)
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

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Book a Meeting</h1>

      <div className="grid grid-3">
        {/* Details */}
        <div className="card">
          <h2 className="section-title">Details</h2>
          <div className="grid" style={{gap:10}}>
            <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <textarea className="input" rows="3" placeholder="Agenda" value={form.agenda} onChange={e=>setForm({...form,agenda:e.target.value})}/>
            <div className="row">
              <input className="input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
              <input className="input" type="time" value={form.start} onChange={e=>setForm({...form,start:e.target.value})}/>
              <input className="input" type="time" value={form.end} onChange={e=>setForm({...form,end:e.target.value})}/>
            </div>
            <select className="input" value={form.roomId} onChange={e=>setForm({...form,roomId:e.target.value})}>
              <option value="">Select Room</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity})</option>)}
            </select>

            <div className="row">
              <button className="btn" type="button" onClick={submit} disabled={busy}>{busy ? "Booking…" : "Book Now"}</button>
              <button className="btn ghost" type="button" onClick={()=>{ setForm({ title:"", agenda:"", date:"", start:"", end:"", roomId:"" }); setSelectedUserIds([]); }}>Cancel</button>
            </div>
            {ok && <div style={{color:"var(--success)"}}>{ok}</div>}
            {err && <div style={{color:"var(--danger)"}}>{err}</div>}
          </div>
        </div>

        {/* Attendees */}
        <div className="card">
          <h2 className="section-title">Attendees</h2>
          <div style={{maxHeight:260, overflow:"auto", border:"1px solid var(--border)", borderRadius:10, padding:8}}>
            {users.length === 0 && <div style={{color:"var(--muted)"}}>No users yet.</div>}
            <ul style={{listStyle:"none", margin:0, padding:0}}>
              {users.map(u => (
                <li key={u.id} style={{display:"flex", alignItems:"center", gap:8, padding:"6px 4px"}}>
                  <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={()=>toggleUser(u.id)} />
                  <span>{u.name}</span>
                  <span style={{color:"var(--muted)"}}>&lt;{u.email}&gt;</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Availability placeholder */}
        <div className="card">
          <h2 className="section-title">Room Availability</h2>
          <div className="badge" style={{marginBottom:8}}>Color-coded preview</div>
          <ul style={{margin:0,paddingLeft:18,color:"var(--muted)"}}>
            <li><strong>Room A</strong>: 10:00–12:00 busy</li>
            <li><strong>Room B</strong>: Available</li>
            <li><strong>Room C</strong>: 15:00–18:00 maintenance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
