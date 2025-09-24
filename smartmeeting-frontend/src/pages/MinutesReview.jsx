// src/pages/MinutesReview.jsx
import { useEffect, useMemo, useState } from "react";
import { api, fileUrl } from "../api";
import { getUser } from "../auth";

export default function MinutesReview(){
  const [meetings, setMeetings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [minutes, setMinutes] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [users, setUsers] = useState([]);

  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const me = getUser();
  const isGuest = me?.role === "Guest";

  // --- data loads ---
  useEffect(() => {
    api.users.all().then(setUsers).catch(()=>{});
  }, []);

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

  async function reloadAttachments(meetingId){
    try{
      const list = await api.attachments.byMeeting(meetingId);
      setAttachments(list);
    }catch{
      setAttachments([]);
    }
  }

  useEffect(()=>{
    if(!selectedId) return;
    reloadMinutes(selectedId);
    reloadAttachments(selectedId);
  },[selectedId]);

  // --- filtering meetings list ---
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

  // --- helpers: users, attachments, export, share ---
  const nameOf = (id) => users.find(u => u.id === id)?.name || `#${id}`;

  function attachmentHref(a){
    return fileUrl(a.filePath || a.url || a.path || a.location || "");
  }
  function attachmentName(a){
    return a.fileName || a.name || (a.path || a.filePath || a.url || "").split("/").pop() || `file-${a.id}`;
  }

  function buildShareText(ms){
    return ms.map(m =>
      `• ${new Date(m.createdAt).toLocaleString()} — ${m.summary}` +
      (m.taskDescription
        ? ` [Task: ${m.taskDescription} • ${m.taskStatus}${m.taskDueDate ? " • due " + new Date(m.taskDueDate).toLocaleDateString() : ""}${m.assignedTo ? " • assigned to " + nameOf(m.assignedTo) : ""}]`
        : ""
      ) +
      (m.isFinal ? " (FINAL)" : "")
    ).join("\n");
  }

  function showToast(msg){
    setToast(msg);
    setTimeout(()=>setToast(""), 1800);
  }

  async function shareMinutes(){
    if (!minutes.length) return;
    const title = "Meeting Minutes";
    const text = buildShareText(minutes);
    const url = window.location.href;

    try{
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(text + "\n\n" + url);
        showToast("Copied minutes to clipboard");
      }
    }catch{
      /* user cancelled, ignore */
    }
  }

  function exportJSON(){
    const data = JSON.stringify(minutes, null, 2);
    downloadBlob(new Blob([data], {type:"application/json"}), `minutes-m${selectedId}.json`);
  }

  function exportCSV(){
    const rows = [
      ["Id","MeetingId","CreatedAt","Summary","TaskDescription","TaskStatus","TaskDueDate","AssignedTo"],
      ...minutes.map(m => [
        safe(m.id),
        safe(m.meetingId),
        safe(m.createdAt),
        safe(m.summary),
        safe(m.taskDescription),
        safe(m.taskStatus),
        safe(m.taskDueDate),
        nameOf(m.assignedTo) // export readable name
      ])
    ];
    const csv = rows.map(r => r.map(csvCell).join(",")).join("\n");
    downloadBlob(new Blob([csv], {type:"text/csv"}), `minutes-m${selectedId}.csv`);
  }

  async function finalize(id){
    if (isGuest) { setErr("Guests cannot finalize minutes."); return; }
    try{
      await api.minutes.finalize(id);
      await reloadMinutes(selectedId);
      // attachments are by-meeting, so nothing extra to do
    }catch{
      setErr("Finalize failed");
    }
  }

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Minutes Review</h1>
      {err && <div style={{color:"crimson"}}>{err}</div>}
      {isGuest && (
        <div className="card" style={{background:"var(--surface)", borderColor:"var(--border)"}}>
          Guests can view minutes but cannot finalize them.
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <h2 className="section-title">Filters</h2>
        <div className="row" style={{gap:8, flexWrap:"wrap"}}>
          <input className="input" placeholder="Search by title/agenda" value={q} onChange={e=>setQ(e.target.value)} />
          <input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          <input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
      </div>

      <div className="grid" style={{gap:16, gridTemplateColumns:"300px 1fr"}}>
        {/* Left: past meetings */}
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
                    background: m.id===selectedId ? "color-mix(in oklab, var(--primary) 12%, transparent)" : "transparent"
                  }}>
                <div style={{fontWeight:600}}>{m.title}</div>
                <div style={{fontSize:12, color:"var(--muted)"}}>
                  {new Date(m.startTime).toLocaleString()} • Room #{m.roomId}
                </div>
              </li>
            ))}
            {filtered.length===0 && <li>No results</li>}
          </ul>
        </div>

        {/* Right: minutes + actions */}
        <div className="grid" style={{gap:16}}>
          <div className="card">
            <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
              <h2 className="section-title" style={{marginBottom:0}}>Minutes</h2>
              <div className="row" style={{gap:8}}>
                <button className="btn ghost" type="button" onClick={exportCSV} disabled={!minutes.length}>Export CSV</button>
                <button className="btn ghost" type="button" onClick={exportJSON} disabled={!minutes.length}>Export JSON</button>
                <button className="btn" type="button" onClick={shareMinutes} disabled={!minutes.length}>Share</button>
              </div>
            </div>

            {!minutes.length ? (
              <div className="muted">No minutes for this meeting.</div>
            ) : (
              <ul style={{marginTop:12, paddingLeft:18}}>
                {minutes.map(mm => (
                  <li key={mm.id} style={{marginBottom:8}}>
                    <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
                      <div>
                        <strong>{new Date(mm.createdAt).toLocaleString()}</strong>{" "}
                        {mm.isFinal ? (
                          <span className="badge badge--inprogress">FINAL</span>
                        ) : (
                          <span className="badge">Draft</span>
                        )}
                      </div>
                      {!mm.isFinal && !isGuest && (
                        <button className="btn ghost" onClick={()=>finalize(mm.id)}>Finalize</button>
                      )}
                    </div>

                    {mm.summary && <div style={{marginTop:4}}>{mm.summary}</div>}

                    {mm.taskDescription && (
                      <div style={{fontSize:14, color:"var(--muted)", marginTop:4}}>
                        Task: <strong style={{color:"var(--text)"}}>{mm.taskDescription}</strong>
                        {" • "}
                        <strong>{mm.taskStatus}</strong>
                        {mm.taskDueDate && <> • due {new Date(mm.taskDueDate).toLocaleDateString()}</>}
                        {mm.assignedTo && <> • assigned to <strong>{nameOf(mm.assignedTo)}</strong></>}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Attachments (by meeting) */}
          <div className="card">
            <h3 className="section-title" style={{marginTop:0}}>Attachments</h3>
            {attachments.length === 0 ? (
              <div className="muted">No attachments.</div>
            ) : (
              <ul style={{margin:0, paddingLeft:18}}>
                {attachments.map(a => (
                  <li key={a.id}>
                    <a href={attachmentHref(a)} target="_blank" rel="noreferrer">
                      {attachmentName(a)}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Tiny toast */}
      {toast && (
        <div className="card" style={{position:"fixed", bottom:16, right:16}}>
          {toast}
        </div>
      )}
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

