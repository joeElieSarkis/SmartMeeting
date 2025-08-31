export default function ActiveMeeting(){
  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Active Meeting</h1>

      <div className="grid grid-3">
        <div className="card">
          <h2 className="section-title">Info</h2>
          <div>Title: Client Kickoff</div>
          <div>Time: 10:00–11:00</div>
          <div>Room: A</div>
          <div>Attendees: Alice, Bob, Charlie</div>
        </div>

        <div className="card">
          <h2 className="section-title">Controls</h2>
          <div className="row">
            <button className="btn">Start</button>
            <button className="btn ghost">End</button>
          </div>
          <div style={{marginTop:10}}><span className="badge">Timer 00:00</span></div>
          <label style={{display:"flex",gap:8,alignItems:"center",marginTop:10}}>
            <input type="checkbox"/> Live Transcription
          </label>
        </div>

        <div className="card">
          <h2 className="section-title">Actions</h2>
          <div className="grid">
            <button className="btn">Take Notes</button>
            <button className="btn ghost">Share Screen</button>
            <button className="btn ghost">Invite Participant</button>
            <a className="btn" href="#" role="button">Join via Teams</a>
          </div>
        </div>
      </div>
    </div>
  );
}
