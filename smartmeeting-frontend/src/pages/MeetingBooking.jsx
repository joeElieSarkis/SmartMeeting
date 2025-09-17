import { useEffect, useState } from "react";
import { api } from "../api";
import { getUser } from "../auth";

export default function MeetingBooking() {
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({
    title: "", agenda: "", date: "", start: "", end: "", roomId: ""
  });

  useEffect(() => {
    // CHANGED: api.rooms() → api.rooms.all()
    api.rooms.all()
      .then(setRooms)
      .catch(() => setErr("Failed to load rooms"));
  }, []);

  const submit = async () => {
    try {
      setErr(""); setOk("");
      const user = getUser();
      if (!user) { setErr("Not logged in"); return; }

      // Send ISO (UTC) to be consistent with minutes
      const startTimeISO = new Date(`${form.date}T${form.start}:00`).toISOString();
      const endTimeISO   = new Date(`${form.date}T${form.end}:00`).toISOString();

      await api.meetings.create({
        title: form.title,
        agenda: form.agenda,
        organizerId: user.id,
        roomId: Number(form.roomId),
        startTime: startTimeISO,
        endTime: endTimeISO,
        status: "Scheduled"
      });

      setOk("Meeting booked!");
      setForm({ title:"", agenda:"", date:"", start:"", end:"", roomId:"" });
    } catch {
      setErr("Failed to create meeting");
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <h1 className="page-title">Book a Meeting</h1>

      <div className="grid grid-3">
        <div className="card">
          <h2 className="section-title">Details</h2>
          <div className="grid" style={{ gap: 10 }}>
            <input className="input" placeholder="Title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} />
            <textarea className="input" rows="3" placeholder="Agenda" value={form.agenda}
              onChange={e => setForm({ ...form, agenda: e.target.value })} />
            <div className="row">
              <input className="input" type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
              <input className="input" type="time" value={form.start}
                onChange={e => setForm({ ...form, start: e.target.value })} />
              <input className="input" type="time" value={form.end}
                onChange={e => setForm({ ...form, end: e.target.value })} />
            </div>
            <select className="input" value={form.roomId}
              onChange={e => setForm({ ...form, roomId: e.target.value })}>
              <option value="">Select Room</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity})</option>)}
            </select>
            <div className="row">
              <button className="btn" type="button" onClick={submit}>Book Now</button>
              <button className="btn ghost" type="button"
                onClick={() => setForm({ title:"", agenda:"", date:"", start:"", end:"", roomId:"" })}>
                Cancel
              </button>
            </div>
            {ok && <div style={{ color: "var(--success)" }}>{ok}</div>}
            {err && <div style={{ color: "var(--danger)" }}>{err}</div>}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Room Availability</h2>
          <div className="badge" style={{ marginBottom: 8 }}>Color-coded preview</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)" }}>
            <li><strong>Room A</strong>: 10:00–12:00 busy</li>
            <li><strong>Room B</strong>: Available</li>
            <li><strong>Room C</strong>: 15:00–18:00 maintenance</li>
          </ul>
        </div>

        <div className="card">
          <h2 className="section-title">Notes</h2>
          <textarea className="input" rows="8" placeholder="Agenda notes..."></textarea>
        </div>
      </div>
    </div>
  );
}

