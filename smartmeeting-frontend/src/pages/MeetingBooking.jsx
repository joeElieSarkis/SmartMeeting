import { useState } from "react";

export default function MeetingBooking(){
  const [form,setForm]=useState({ title:"", date:"", start:"", duration:30, attendees:"", roomId:"", recurring:false, video:false });

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Book a Meeting</h1>

      <div className="grid grid-3">
        <div className="card">
          <h2 className="section-title">Details</h2>
          <div className="grid" style={{gap:10}}>
            <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <div className="row">
              <input className="input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
              <input className="input" type="time" value={form.start} onChange={e=>setForm({...form,start:e.target.value})}/>
              <input className="input" type="number" min="15" step="15" placeholder="Duration (min)" value={form.duration} onChange={e=>setForm({...form,duration:+e.target.value})}/>
            </div>
            <input className="input" placeholder="Attendees (emails, comma-separated)" value={form.attendees} onChange={e=>setForm({...form,attendees:e.target.value})}/>
            <select className="input" value={form.roomId} onChange={e=>setForm({...form,roomId:e.target.value})}>
              <option value="">Select Room</option>
              <option value="1">Room A (8)</option>
              <option value="2">Room B (4)</option>
              <option value="3">Room C (12)</option>
            </select>
            <label style={{display:"flex",gap:8,alignItems:"center"}}>
              <input type="checkbox" checked={form.recurring} onChange={e=>setForm({...form,recurring:e.target.checked})}/>
              Recurring meeting
            </label>
            <label style={{display:"flex",gap:8,alignItems:"center"}}>
              <input type="checkbox" checked={form.video} onChange={e=>setForm({...form,video:e.target.checked})}/>
              Video conferencing
            </label>
            <div className="row">
              <button className="btn">Book Now</button>
              <button className="btn ghost" type="button">Cancel</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Room Availability</h2>
          <div className="badge" style={{marginBottom:8}}>Color-coded preview</div>
          <ul style={{margin:0,paddingLeft:18,color:"var(--muted)"}}>
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
