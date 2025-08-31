export default function MinutesEditor(){
  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Minutes / Notes</h1>
      <div className="grid grid-3">
        <div className="card">
          <h2 className="section-title">Attendees</h2>
          <textarea className="input" rows="6" defaultValue={"Alice\nBob\nCharlie"} />
        </div>
        <div className="card">
          <h2 className="section-title">Agenda Items</h2>
          <textarea className="input" rows="6" defaultValue={"1) Introductions\n2) Scope\n3) Timeline"} />
        </div>
        <div className="card">
          <h2 className="section-title">Decisions / Action Items</h2>
          <textarea className="input" rows="6" placeholder="E.g., Alice -> Draft proposal by Friday" />
          <div className="row" style={{marginTop:10}}>
            <button className="btn">Save Draft</button>
            <button className="btn ghost">Finalize &amp; Share</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Attachments</h2>
        <input type="file" className="input" />
      </div>
    </div>
  );
}
