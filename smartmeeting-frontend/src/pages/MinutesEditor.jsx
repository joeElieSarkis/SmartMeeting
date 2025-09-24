import { useEffect, useMemo, useState } from "react";
import { api, fileUrl } from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUser } from "../auth";

export default function MinutesEditor(){
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const meetingId = Number(params.get("meetingId") || 0);

  const me = getUser();
  const isGuest = me?.role === "Guest";

  const [meetings, setMeetings] = useState([]);
  const [meetingsErr, setMeetingsErr] = useState("");

  const [list, setList] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // NEW: attendees + users (for name lookup) + selected assignee
  const [attendees, setAttendees] = useState([]);
  const [users, setUsers] = useState([]); // cached for name lookup in list
  const [assigneeId, setAssigneeId] = useState("");

  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    summary:"", taskDescription:"", taskStatus:"Pending", taskDueDate:""
  });

  useEffect(()=>{
    api.meetings.all()
      .then(ms => {
        ms.sort((a,b)=> new Date(b.startTime) - new Date(a.startTime));
        setMeetings(ms);
      })
      .catch(()=>setMeetingsErr("Failed to load meetings"));
  },[]);

  async function loadMinutes(mid){
    try { setList(await api.minutes.byMeeting(mid)); }
    catch { setErr("Failed to load minutes"); }
  }
  async function loadAttachments(mid){
    try { setAttachments(await api.attachments.byMeeting(mid)); }
    catch {}
  }
  async function loadAttendees(mid){
    try {
      const [parts, us] = await Promise.all([
        api.participants.byMeeting(mid),
        api.users.all()
      ]);
      setUsers(us);
      const ids = new Set(parts.map(p => p.userId));
      const mapped = us.filter(u => ids.has(u.id));
      setAttendees(mapped);

      // Default assignee: yourself if you're in the attendees; otherwise none
      if (me && mapped.some(u => u.id === me.id)) {
        setAssigneeId(String(me.id));
      } else {
        setAssigneeId("");
      }
    } catch {
      // ignore silently; UI still works
    }
  }

  useEffect(()=>{
    if(meetingId){
      loadMinutes(meetingId);
      loadAttachments(meetingId);
      loadAttendees(meetingId); // NEW
    } else {
      setList([]); setAttachments([]); setAttendees([]); setAssigneeId("");
    }
  },[meetingId]);

  function onSelectMeeting(e){
    const mid = Number(e.target.value || 0);
    if(!mid) return;
    navigate(`/minutes?meetingId=${mid}`, { replace: true });
  }

  async function save(){
    setOk(""); setErr(""); setBusy(true);
    if (isGuest) { setErr("Guests can view minutes but cannot create or edit."); setBusy(false); return; }
    const user = getUser();
    if(!meetingId){ setErr("Please select a meeting first."); setBusy(false); return; }
    try{
      await api.minutes.create({
        meetingId,
        summary: form.summary,
        // NEW: assign to the chosen attendee (or null if Unassigned)
        assignedTo: assigneeId ? Number(assigneeId) : null,
        taskDescription: form.taskDescription,
        taskStatus: form.taskStatus,
        taskDueDate: form.taskDueDate ? new Date(form.taskDueDate).toISOString() : null
      });
      setOk("Minutes saved");
      setForm({ summary:"", taskDescription:"", taskStatus:"Pending", taskDueDate:"" });
      // keep the selected assignee
      await loadMinutes(meetingId);
    }catch(e){
      setErr(e?.message || "Failed to save minutes");
    } finally {
      setBusy(false);
    }
  }

  async function finalizeItem(id){
    setOk(""); setErr("");
    if (isGuest) { setErr("Guests cannot finalize minutes."); return; }
    try{
      await api.minutes.finalize(id);
      setOk("Minutes finalized");
      await loadMinutes(meetingId);
    }catch(e){
      setErr(e?.message || "Failed to finalize");
    }
  }

  function shareToClipboard(){
    const nameOf = (uid) => {
      const u = users.find(x => x.id === uid) || attendees.find(x => x.id === uid);
      return u ? u.name : (uid ? `#${uid}` : "Unassigned");
    };
    const text = list.map(m =>
      `• ${new Date(m.createdAt).toLocaleString()} — ${m.summary}` +
      (m.taskDescription
        ? ` [Task: ${m.taskDescription} • ${m.taskStatus}${m.taskDueDate ? " • due " + new Date(m.taskDueDate).toLocaleDateString() : ""} • assigned to ${nameOf(m.assignedTo)}]`
        : ""
      ) +
      (m.isFinal ? " (FINAL)" : "")
    ).join("\n");
    navigator.clipboard.writeText(text).then(()=>setOk("Copied to clipboard")).catch(()=>setErr("Copy failed"));
  }

  function printMinutes(){
    const nameOf = (uid) => {
      const u = users.find(x => x.id === uid) || attendees.find(x => x.id === uid);
      return u ? u.name : (uid ? `#${uid}` : "Unassigned");
    };
    const html = `
      <html>
      <head>
        <title>Minutes - Meeting ${meetingId}</title>
        <style>
          body{font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding:24px;}
          h1{margin:0 0 12px;}
          ul{padding-left:18px;}
          li{margin-bottom:8px;}
          .final{font-weight:bold; color:#166534;}
        </style>
      </head>
      <body>
        <h1>Minutes (Meeting #${meetingId})</h1>
        <ul>
          ${list.map(m => `
            <li>
              <div><strong>${new Date(m.createdAt).toLocaleString()}</strong> — ${escapeHtml(m.summary)} ${m.isFinal ? '<span class="final">[FINAL]</span>' : ''}</div>
              ${m.taskDescription ? `<div>Task: ${escapeHtml(m.taskDescription)} • <strong>${m.taskStatus||""}</strong> ${m.taskDueDate ? `• due ${new Date(m.taskDueDate).toLocaleDateString()}` : ""} • assigned to ${escapeHtml(nameOf(m.assignedTo))}</div>` : ""}
            </li>
          `).join("")}
        </ul>
      </body>
      </html>
    `;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  async function onUploadChange(e){
    setErr(""); setOk("");
    if (isGuest) { setErr("Guests cannot upload attachments."); e.target.value=""; return; }
    const file = e.target.files?.[0];
    if(!file){ return; }
    if(!meetingId){ setErr("Please select a meeting first."); e.target.value=""; return; }
    try{
      await api.attachments.upload(meetingId, file);
      setOk("Attachment uploaded");
      await loadAttachments(meetingId);
    }catch(e){
      setErr("Upload failed");
    } finally {
      e.target.value = "";
    }
  }

  async function removeAttachment(id){
    if (isGuest) { setErr("Guests cannot delete attachments."); return; }
    if(!confirm("Delete this file?")) return;
    try{
      await api.attachments.delete(id);
      setOk("Attachment deleted");
      await loadAttachments(meetingId);
    }catch{
      setErr("Failed to delete attachment");
    }
  }

  const selectedMeeting = useMemo(
    () => meetings.find(m => m.id === meetingId),
    [meetings, meetingId]
  );

  // Disable “Save Draft” if latest minutes is final OR guest
  const latestIsFinal = list.length > 0 && !!list[list.length - 1].isFinal;
  const disableSave = latestIsFinal || isGuest;

  // for rendering assignee name in list
  const nameOf = (uid) => {
    const u = users.find(x => x.id === uid) || attendees.find(x => x.id === uid);
    return u ? u.name : (uid ? `#${uid}` : "Unassigned");
  };

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Minutes</h1>

      {isGuest && (
        <div className="card" style={{background:"#fff8e1", borderColor:"#facc15"}}>
          Guests can view minutes and attachments, but cannot add, finalize, upload, or delete.
        </div>
      )}

      <div className="card">
        <h2 className="section-title">Select Meeting</h2>
        <div className="row" style={{gap:8, alignItems:"center"}}>
          <select className="input" value={meetingId || ""} onChange={onSelectMeeting}>
            <option value="">Choose a meeting…</option>
            {meetings.map(m => (
              <option key={m.id} value={m.id}>
                {new Date(m.startTime).toLocaleString()} — {m.title} (Room #{m.roomId})
              </option>
            ))}
          </select>
          {meetingsErr && <span style={{color:"var(--danger)"}}>{meetingsErr}</span>}
        </div>
        {selectedMeeting && (
          <div style={{marginTop:8, color:"var(--muted)"}}>
            Selected: <strong>{selectedMeeting.title}</strong> — {new Date(selectedMeeting.startTime).toLocaleString()}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">New Entry</h2>
        <div className="grid" style={{gap:10}}>
          <textarea className="input" rows="3" placeholder="Summary" value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})} disabled={isGuest}/>
          <textarea className="input" rows="3" placeholder="Action / Task" value={form.taskDescription} onChange={e=>setForm({...form,taskDescription:e.target.value})} disabled={isGuest}/>

          <div className="row">
            <select className="input" value={form.taskStatus} onChange={e=>setForm({...form,taskStatus:e.target.value})} disabled={isGuest}>
              <option>Pending</option><option>InProgress</option><option>Completed</option>
            </select>
            <input className="input" type="date" value={form.taskDueDate} onChange={e=>setForm({...form,taskDueDate:e.target.value})} disabled={isGuest}/>
          </div>

          {/* NEW: Assignee selector (meeting attendees) */}
          <div className="row">
            <select
              className="input"
              value={assigneeId}
              onChange={e=>setAssigneeId(e.target.value)}
              disabled={isGuest}
            >
              <option value="">Unassigned</option>
              {attendees.map(u => (
                <option key={u.id} value={u.id}>{u.name} &lt;{u.email}&gt;</option>
              ))}
            </select>
          </div>

          <div className="row">
            <button className="btn" type="button" onClick={save} disabled={busy || !meetingId || disableSave}>
              {busy ? "Saving…" : "Save Draft"}
            </button>
            <button className="btn ghost" type="button" onClick={shareToClipboard} disabled={!list.length}>Share (Copy)</button>
            <button className="btn ghost" type="button" onClick={printMinutes} disabled={!list.length}>Print / PDF</button>
          </div>
          {latestIsFinal && <div style={{color:"var(--muted)"}}>This meeting has finalized minutes.</div>}
          {(ok || err) && <div style={{color: ok ? "var(--success)" : "var(--danger)"}}>{ok || err}</div>}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Attachments</h2>
        <div className="row" style={{gap:8, alignItems:"center"}}>
          <input type="file" onChange={onUploadChange} disabled={!meetingId || isGuest} />
        </div>
        <ul style={{marginTop:12, paddingLeft:18}}>
          {attachments.map(a => (
            <li key={a.id} style={{marginBottom:6}}>
              <a href={fileUrl(a.filePath)} target="_blank" rel="noreferrer">{a.fileName}</a>
              <button className="btn ghost" style={{marginLeft:8}} onClick={()=>removeAttachment(a.id)} disabled={isGuest}>Delete</button>
            </li>
          ))}
          {!attachments.length && <li style={{color:"var(--muted)"}}>No attachments yet</li>}
        </ul>
      </div>

      <div className="card">
        <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
          <h2 className="section-title" style={{marginBottom:0}}>Entries</h2>
        </div>
        <ul style={{marginTop:12, paddingLeft:18}}>
          {list.map(mm => (
            <li key={mm.id} style={{marginBottom:8}}>
              <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
                <strong>{new Date(mm.createdAt).toLocaleString()}</strong>
                {mm.isFinal ? <span className="badge" style={{background:"#dcfce7", color:"#166534"}}>FINAL</span> : <span className="badge">Draft</span>}
              </div>
              <div>{mm.summary}</div>
              {mm.taskDescription && (
                <div style={{fontSize:14, color:"#334155"}}>
                  Task: {mm.taskDescription} • <strong>{mm.taskStatus}</strong>
                  {mm.taskDueDate && <> • due {new Date(mm.taskDueDate).toLocaleDateString()}</>}
                  <> • assigned to {nameOf(mm.assignedTo)}</>
                </div>
              )}
              {!mm.isFinal && !isGuest && (
                <div className="row" style={{marginTop:6}}>
                  <button className="btn ghost" type="button" onClick={()=>finalizeItem(mm.id)}>Finalize & Share</button>
                </div>
              )}
            </li>
          ))}
          {list.length===0 && <li>No minutes yet</li>}
        </ul>
      </div>
    </div>
  );
}

/* helpers */
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
