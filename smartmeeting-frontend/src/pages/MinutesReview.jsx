import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { getUser } from "../auth";

export default function MinutesReview(){
  const [meetings, setMeetings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [minutes, setMinutes] = useState([]);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [err, setErr] = useState("");

  const me = getUser();
  const isGuest = me?.role === "Guest";

  useEffect(()=>{
    api.meetings.all()
      .then(ms => {
        ms.sort((a,b)=> new Date(b.startTime) - new Date(a.startTime));
        setMeetings(ms);
        if(ms.length) setSelectedId(ms[0].id);
      })
      .catch(()=>setErr("Failed to load meetings"));
  },[]);

  async function reloadMinutes(meetingId){
    try {
      const m = await api.minutes.byMeeting(meetingId);
      setMinutes(m);
    } catch {
      setErr("Failed to load minutes");
    }
  }

  useEffect(()=>{
    if(!selectedId) return;
    reloadMinutes(selectedId);
  },[selectedId]);

  const filtered = useMemo(()=>{
    let list = [...meetings];
    if (from) {
      const f = new Date(from + "T00:00:00");
      list = list.filter(m => new Date(m.startTime) >= f);
    }
    if (to) {
      const t = new Date(to + "T23:59:59");
      list = list.filter(m => new Date(m.startTime) <= t);
    }
    if (q.trim()) {
      const k = q.toLowerCase();
      list = list.filter(m =>
        (m.title || "").toLowerCase().includes(k) ||
        (m.agenda || "").toLowerCase().includes(k)
      );
    }
    return list;
  }, [meetings, q, from, to]);

  function exportJSON(){
    const data = JSON.stringify(minutes, null, 2);
    downloadBlob(new Blob([data], {type:"application/json"}), `minutes-m${selectedId}.json`);
  }

  function exportCSV(){
    const rows = [
      ["Id","MeetingId","CreatedAt","Summary","TaskDescription","TaskStatus","TaskDueDate","AssignedTo","IsFinal"],
      ...minutes.map(m => [
        safe(m.id),
        safe(m.meetingId),
        safe(m.createdAt),
        safe(m.summary),
        safe(m.taskDescription),
        safe(m.taskStatus),
        safe(m.taskDueDate),
        safe(m.assignedTo),
        m.isFinal ? "Yes" : "No"
      ])
    ];
    const csv = rows.map(r => r.map(csvCell).join(",")).join("\n");
    downloadBlob(new Blob([csv], {type:"text/csv"}), `minutes-m${selectedId}.csv`);
  }

  function shareToClipboard(){
    const text = minutes.map(m =>
      `• ${new Date(m.createdAt).toLocaleString()} — ${m.summary}` +
      (m.taskDescription ? ` [Task: ${m.taskDescription} • ${m.taskStatus}${m.taskDueDate ? " • due " + new Date(m.taskDueDate).toLocaleDateString() : ""}]` : "") +
      (m.isFinal ? " (FINAL)" : "")
    ).join("\n");
    navigator.clipboard.writeText(text).catch(()=>{});
  }

  async function finalize(id){
    if (isGuest) { setErr("Guests cannot finalize minutes."); return; }
    try{
      await api.minutes.finalize(id);
      await reloadMinutes(selectedId);
    }catch{
      setErr("Finalize failed");
    }
  }

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Minutes Review</h1>
      {err && <div style={{color:"crimson"}}>{err}</div>}
      {isGuest && (
        <div className="card" style={{background:"#fff8e1", borderColor:"#facc15"}}>
          Guests can view minutes but cannot finalize them.
        </div>
      )}

      <div className="card">
        <h2 className="section-title">Filters</h2>
        <div className="row" style={{gap:8, flexWrap:"wrap"}}>
          <input className="input" placeholder="Search by title/agenda" value={q} onChange={e=>setQ(e.target.value)} />
          <input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          <input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
      </div>

      <div className="grid" style={{gap:16, gridTemplateColumns:"300px 1fr"}}>
        <div className="card" style={{maxHeight:500, overflow:"auto"}}>
          <h2 className="section-title">Past Meetings</h2>
          <ul style={{margin:0, paddingLeft:0, listStyle:"none"}}>
            {filtered.map(m => (
              <li key={m.id}
                  onClick={()=>setSelectedId(m.id)}
                  style={{
                    padding:"8px 10px",
                    borderRadius:8,
                    cursor:"pointer",
                    marginBottom:6,
                    background: m.id===selectedId ? "#eff6ff" : "transparent"
                  }}>
                <div style={{fontWeight:600}}>{m.title}</div>
                <div style={{fontSize:12, color:"#64748b"}}>
                  {new Date(m.startTime).toLocaleString()} • Room #{m.roomId}
                </div>
              </li>
            ))}
            {filtered.length===0 && <li>No results</li>}
          </ul>
        </div>

        <div className="card">
          <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
            <h2 className="section-title" style={{marginBottom:0}}>Minutes</h2>
            <div className="row" style={{gap:8}}>
              <button className="btn ghost" type="button" onClick={exportCSV} disabled={!minutes.length}>Export CSV</button>
              <button className="btn ghost" type="button" onClick={exportJSON} disabled={!minutes.length}>Export JSON</button>
              <button className="btn" type="button" onClick={shareToClipboard} disabled={!minutes.length}>Share</button>
            </div>
          </div>

          {!minutes.length ? (
            <div style={{color:"#64748b"}}>No minutes for this meeting.</div>
          ) : (
            <ul style={{marginTop:12, paddingLeft:18}}>
              {minutes.map(mm => (
                <li key={mm.id} style={{marginBottom:8}}>
                  <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
                    <div>
                      <strong>{new Date(mm.createdAt).toLocaleString()}</strong>{" "}
                      {mm.isFinal ? (
                        <span className="badge" style={{background:"#dcfce7", color:"#166534"}}>FINAL</span>
                      ) : (
                        <span className="badge">Draft</span>
                      )}
                    </div>
                    {!mm.isFinal && !isGuest && (
                      <button className="btn ghost" onClick={()=>finalize(mm.id)}>Finalize</button>
                    )}
                  </div>
                  <div>{mm.summary}</div>
                  {mm.taskDescription && (
                    <div style={{fontSize:14, color:"#334155"}}>
                      Task: {mm.taskDescription} • <strong>{mm.taskStatus}</strong>
                      {mm.taskDueDate && <> • due {new Date(mm.taskDueDate).toLocaleDateString()}</>}
                      {mm.assignedTo && <> • assigned to #{mm.assignedTo}</>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* helpers */
function safe(v){ return v ?? ""; }
function csvCell(x){
  const s = String(x ?? "");
  return `"${s.replace(/"/g,'""')}"`;
}
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 500);
}
