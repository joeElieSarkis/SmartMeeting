import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useSearchParams } from "react-router-dom";

export default function ActiveMeeting(){
  const [params] = useSearchParams();
  const meetingId = Number(params.get("id") || 0);
  const [m,setM] = useState(null);
  const [err,setErr] = useState("");
  const [seconds,setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(()=>{
    if(!meetingId){ setErr("Missing meeting id"); return; }
    api.meetings.byId(meetingId).then(setM).catch(()=>setErr("Failed to load meeting"));
  },[meetingId]);

  useEffect(()=>{
    if(m?.status === "InProgress" && !timerRef.current){
      timerRef.current = setInterval(()=>setSeconds(s=>s+1), 1000);
    }
    return ()=>{ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null; } }
  },[m?.status]);

  function fmt(secs){ const h=Math.floor(secs/3600), m=Math.floor((secs%3600)/60), s=secs%60; const pad=n=>String(n).padStart(2,"0"); return `${pad(h)}:${pad(m)}:${pad(s)}`; }

  async function start(){
    if(!m) return;
    await api.meetings.update(m.id, { id:m.id, title:m.title, agenda:m.agenda, organizerId:m.organizerId, roomId:m.roomId, startTime:m.startTime, endTime:m.endTime, status:"InProgress" });
    setM({...m, status:"InProgress"}); setSeconds(0);
  }
  async function end(){
    if(!m) return;
    await api.meetings.update(m.id, { id:m.id, title:m.title, agenda:m.agenda, organizerId:m.organizerId, roomId:m.roomId, startTime:m.startTime, endTime:m.endTime, status:"Completed" });
    setM({...m, status:"Completed"});
  }

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Active Meeting</h1>
      {err && <div style={{color:"crimson"}}>{err}</div>}
      {!m ? <div className="card">Loading…</div> : (
        <div className="card">
          <div><strong>{m.title}</strong></div>
          <div style={{color:"#64748b"}}>Room #{m.roomId} • {new Date(m.startTime).toLocaleTimeString()} – {new Date(m.endTime).toLocaleTimeString()}</div>
          <div style={{marginTop:12}}>Status: <span className="badge">{m.status}</span></div>
          <div style={{marginTop:12}}>Timer: <code>{fmt(seconds)}</code></div>
          <div className="row" style={{marginTop:12}}>
            <button className="btn" onClick={start} disabled={m.status==="InProgress"}>Start</button>
            <button className="btn ghost" onClick={end} disabled={m.status==="Completed"}>End</button>
          </div>
        </div>
      )}
    </div>
  );
}

