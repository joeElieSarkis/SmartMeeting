export default function Dashboard(){
  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Dashboard</h1>

      <section className="card">
        <h2 className="section-title">Upcoming Meetings</h2>
        <ul style={{margin:0,paddingLeft:18}}>
          <li>09:00–10:00 • Weekly Team Sync • Room A</li>
          <li>11:30–12:00 • Standup • Room B</li>
        </ul>
      </section>

      <div className="grid grid-3">
        <div className="card">Quick Action: <strong>Schedule Meeting</strong></div>
        <div className="card">Quick Action: <strong>Join Now</strong></div>
        <div className="card">Quick Action: <strong>View Minutes</strong></div>
      </div>

      <section className="card">
        <h2 className="section-title">Room Availability</h2>
        <div className="badge">Calendar placeholder</div>
      </section>

      <section className="card">
        <h2 className="section-title">Notifications</h2>
        <ul style={{margin:0,paddingLeft:18,color:"var(--muted)"}}>
          <li>Reminder: Minutes pending for “Client Kickoff”</li>
          <li>Room C maintenance today 15:00–18:00</li>
        </ul>
      </section>
    </div>
  );
}
