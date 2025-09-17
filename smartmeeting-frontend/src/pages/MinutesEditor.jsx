import { useEffect, useState } from "react";
import { api } from "../api";
import { useSearchParams } from "react-router-dom";
import { getUser } from "../auth";

export default function MinutesEditor(){
  const [params] = useSearchParams();
  const meetingId = Number(params.get("meetingId") || 0);
  const [list,setList] = useState([]);
  const [ok,setOk] = useState("");
  const [err,setErr] = useState("");
  const [form,setForm] = useState({
    summary:"", taskDescription:"", taskStatus:"Pending", taskDueDate:""
  });

  async function load(){ 
    try { setList(await api.minutes.byMeeting(meetingId)); }
    catch { setErr("Failed to load minutes"); }
  }

  useEffect(()=>{ if(meetingId) load(); },[meetingId]);

  async function save(){
    setOk(""); setErr("");
    const user = getUser();
    if(!meetingId){ setErr("Missing meetingId"); return; }
    try{
      await api.minutes.create({
        meetingId,
        summary: form.summary,
        assignedTo: user?.id ?? null,
        taskDescription: form.taskDescription,
        taskStatus: form.taskStatus,
        taskDueDate: form.taskDueDate ? new Date(form.taskDueDate).toISOString() : null
      });
      setOk("Minutes saved");
      setForm({ summary:"", taskDescription:"", taskStatus:"Pending", taskDueDate:"" });
      await load();
    }catch{ setErr("Failed to save minutes"); }
  }

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Minutes</h1>

      <div className="card">
        <h2 className="section-title">New Entry</h2>
        <div className="grid" style={{gap:10}}>
          <textarea className="input" rows="3" placeholder="Summary" value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})}/>
          <textarea className="input" rows="3" placeholder="Action / Task" value={form.taskDescription} onChange={e=>setForm({...form,taskDescription:e.target.value})}/>
          <div className="row">
            <select className="input" value={form.taskStatus} onChange={e=>setForm({...form,taskStatus:e.target.value})}>
              <option>Pending</option><option>InProgress</option><option>Completed</option>
            </select>
            <input className="input" type="date" value={form.taskDueDate} onChange={e=>setForm({...form,taskDueDate:e.target.value})}/>
          </div>
          <button className="btn" type="button" onClick={save}>Save Draft</button>
          {ok && <div style={{color:"var(--success)"}}>{ok}</div>}
          {err && <div style={{color:"var(--danger)"}}>{err}</div>}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Entries</h2>
        <ul style={{margin:0,paddingLeft:18}}>
          {list.map(mm => (
            <li key={mm.id}>
              <strong>{new Date(mm.createdAt).toLocaleString()}</strong> — {mm.summary}
              {mm.taskDescription && <> • Task: {mm.taskDescription} ({mm.taskStatus})</>}
            </li>
          ))}
          {list.length===0 && <li>No minutes yet</li>}
        </ul>
      </div>
    </div>
  );
}
