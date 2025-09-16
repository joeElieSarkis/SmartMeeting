import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminRooms(){
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({ name:"", capacity:"", location:"", features:"" });

  async function load(){ try { setRooms(await api.rooms()); } catch { setErr("Failed to load rooms"); } }
  useEffect(() => { load(); }, []);

  async function addRoom(){
    setErr(""); setOk("");
    try{
      await fetch("http://localhost:5114/api/rooms", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          name: form.name,
          capacity: Number(form.capacity||0),
          location: form.location,
          features: form.features
        })
      }).then(r => { if(!r.ok) throw new Error(); });
      setOk("Room added");
      setForm({ name:"", capacity:"", location:"", features:"" });
      await load();
    }catch{ setErr("Failed to add room"); }
  }

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Rooms</h1>

      <div className="card">
        <h2 className="section-title">Add Room</h2>
        <div className="grid" style={{gap:10}}>
          <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input className="input" type="number" placeholder="Capacity" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})}/>
          <input className="input" placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
          <input className="input" placeholder="Features (comma separated)" value={form.features} onChange={e=>setForm({...form,features:e.target.value})}/>
          <div className="row">
            <button className="btn" type="button" onClick={addRoom}>Save</button>
          </div>
          {ok && <div style={{color:"var(--success)"}}>{ok}</div>}
          {err && <div style={{color:"var(--danger)"}}>{err}</div>}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Room List</h2>
        <ul style={{margin:0,paddingLeft:18}}>
          {rooms.map(r => <li key={r.id}><strong>{r.name}</strong> — cap {r.capacity} — {r.location}</li>)}
          {rooms.length===0 && <li>No rooms yet</li>}
        </ul>
      </div>
    </div>
  );
}

