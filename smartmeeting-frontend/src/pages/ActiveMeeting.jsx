import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useSearchParams } from "react-router-dom";

export default function ActiveMeeting(){
  const [params] = useSearchParams();
  const meetingId = Number(params.get("id") || 0);

  const [m,setM] = useState(null);
  const [err,setErr] = useState("");
  const [seconds,setSeconds] = useState(0);
  const [attendees, setAttendees] = useState([]);
  const timerRef = useRef(null);

  // Load meeting + attendees
  useEffect(()=>{
    if(!meetingId){ setErr("Missing meeting id"); return; }

    async function load(){
      try{
        const meeting = await api.meetings.byId(meetingId);
        const [parts, users] = await Promise.all([
          api.participants.byMeeting(meetingId),
          api.users.all()
        ]);
        const ids = new Set(parts.map(p => p.userId));
        const mapped = users.filter(u => ids.has(u.id));
        setM(meeting);
        setAttendees(mapped);
      }catch{
        setErr("Failed to load meeting or attendees");
      }
    }

    load();
  },[meetingId]);

  // Timer based on status
  useEffect(()=>{
    if(m?.status === "InProgress" && !timerRef.current){
      timerRef.current = setInterval(()=>setSeconds(s=>s+1), 1000);
    }
    return ()=>{ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null; } }
  },[m?.status]);

  function fmt(secs){
    const h=Math.floor(secs/3600), m=Math.floor((secs%3600)/60), s=secs%60;
    const pad=n=>String(n).padStart(2,"0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  const isCancelled = m?.status === "Cancelled";
  const isInProgress = m?.status === "InProgress";
  const isCompleted = m?.status === "Completed";

  async function start(){
    if (!m) return;
    if (isCancelled || isCompleted) { setErr("Cancelled or completed meetings can’t be started."); return; }
    try {
      await api.meetings.update(m.id, {
        id:m.id, title:m.title, agenda:m.agenda,
        organizerId:m.organizerId, roomId:m.roomId,
        startTime:m.startTime, endTime:m.endTime, status:"InProgress"
      });
      setM({...m, status:"InProgress"}); setSeconds(0); setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to start meeting");
    }
  }

  async function end(){
    if (!m) return;
    if (isCancelled) { setErr("Cancelled meetings can’t be ended."); return; }
    if (!isInProgress) { setErr("Only in-progress meetings can be ended."); return; }
    try {
      await api.meetings.update(m.id, {
        id:m.id, title:m.title, agenda:m.agenda,
        organizerId:m.organizerId, roomId:m.roomId,
        startTime:m.startTime, endTime:m.endTime, status:"Completed"
      });
      setM({...m, status:"Completed"}); setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to end meeting");
    }
  }

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Active Meeting</h1>
      {err && <div style={{color:"crimson"}}>{err}</div>}

      {!m ? <div className="card">Loading…</div> : (
        <div className="card">
          <div><strong>{m.title}</strong></div>
          <div style={{color:"#64748b"}}>
            Room #{m.roomId} • {new Date(m.startTime).toLocaleTimeString()} – {new Date(m.endTime).toLocaleTimeString()}
          </div>

          {isCancelled && (
            <div className="card" style={{background:"#fff8e1", borderColor:"#facc15", marginTop:12}}>
              This meeting is <strong>Cancelled</strong>. Actions are disabled.
            </div>
          )}

          <div style={{marginTop:12}}>Status: <span className="badge">{m.status}</span></div>
          <div style={{marginTop:12}}>Timer: <code>{fmt(seconds)}</code></div>

          <div style={{marginTop:16}}>
            <h3 className="section-title">Attendees</h3>
            <ul style={{margin:0,paddingLeft:18}}>
              {attendees.map(u => (
                <li key={u.id}>
                  {u.name} <span style={{color:"#64748b"}}>({u.email})</span>
                </li>
              ))}
              {attendees.length===0 && <li>No attendees listed</li>}
            </ul>
          </div>

          <div className="row" style={{marginTop:12}}>
            <button
              className="btn"
              onClick={start}
              disabled={isInProgress || isCompleted || isCancelled}
            >
              Start
            </button>
            <button
              className="btn ghost"
              onClick={end}
              disabled={!isInProgress || isCancelled}
            >
              End
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

