import { useEffect, useMemo, useState } from "react";
import { api, fileUrl } from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUser } from "../auth";

export default function MinutesEditor(){
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const meetingId = Number(params.get("meetingId") || 0);

  // meetings list for selector
  const [meetings, setMeetings] = useState([]);
  const [meetingsErr, setMeetingsErr] = useState("");

  const [list,setList] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [ok,setOk] = useState("");
  const [err,setErr] = useState("");
  const [busy,setBusy] = useState(false);

  const [form,setForm] = useState({
    summary:"", taskDescription:"", taskStatus:"Pending", taskDueDate:""
  });

  useEffect(()=>{
    // load meetings for dropdown when no meetingId in URL
    api.meetings.all()
      .then(ms => {
        // sort newest → oldest
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
    catch { /* ignore */ }
  }

  useEffect(()=>{
    if(meetingId){
      loadMinutes(meetingId);
      loadAttachments(meetingId);
    } else {
      setList([]); setAttachments([]);
    }
  },[meetingId]);

  function onSelectMeeting(e){
    const mid = Number(e.target.value || 0);
    if(!mid) return;
    // push /minutes?meetingId=mid so refresh/bookmarks work
    navigate(`/minutes?meetingId=${mid}`, { replace: true });
  }

  async function save(){
    setOk(""); setErr(""); setBusy(true);
    const user = getUser();
    if(!meetingId){ setErr("Please select a meeting first."); setBusy(false); return; }
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
      await loadMinutes(meetingId);
    }catch(e){
      setErr(e?.message || "Failed to save minutes");
    } finally {
      setBusy(false);
    }
  }

  async function onUploadChange(e){
    setErr(""); setOk("");
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
      e.target.value = ""; // reset file input
    }
  }

  async function removeAttachment(id){
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

  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Minutes</h1>

      {/* Meeting selector if no meetingId */}
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
          <textarea className="input" rows="3" placeholder="Summary" value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})}/>
          <textarea className="input" rows="3" placeholder="Action / Task" value={form.taskDescription} onChange={e=>setForm({...form,taskDescription:e.target.value})}/>
          <div className="row">
            <select className="input" value={form.taskStatus} onChange={e=>setForm({...form,taskStatus:e.target.value})}>
              <option>Pending</option><option>InProgress</option><option>Completed</option>
            </select>
            <input className="input" type="date" value={form.taskDueDate} onChange={e=>setForm({...form,taskDueDate:e.target.value})}/>
          </div>
          <div className="row">
            <button className="btn" type="button" onClick={save} disabled={busy || !meetingId}>
              {busy ? "Saving…" : "Save Draft"}
            </button>
          </div>
          {(ok || err) && <div style={{color: ok ? "var(--success)" : "var(--danger)"}}>{ok || err}</div>}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Attachments</h2>
        <div className="row" style={{gap:8, alignItems:"center"}}>
          <input type="file" onChange={onUploadChange} disabled={!meetingId} />
        </div>
        <ul style={{marginTop:12, paddingLeft:18}}>
          {attachments.map(a => (
            <li key={a.id} style={{marginBottom:6}}>
              <a href={fileUrl(a.filePath)} target="_blank" rel="noreferrer">{a.fileName}</a>
              <button className="btn ghost" style={{marginLeft:8}} onClick={()=>removeAttachment(a.id)}>Delete</button>
            </li>
          ))}
          {!attachments.length && <li style={{color:"var(--muted)"}}>No attachments yet</li>}
        </ul>
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
