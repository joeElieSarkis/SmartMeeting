export default function MinutesReview(){
  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Past Meetings / Minutes</h1>

      <div className="row">
        <input className="input" placeholder="Search by keyword or attendee"/>
      </div>

      <div className="card">
        <table className="table">
          <thead><tr><th>Date</th><th>Title</th><th>Action Items</th><th>Status</th><th></th></tr></thead>
          <tbody>
            <tr><td>2025-08-19</td><td>Weekly Sync</td><td>2</td><td><span className="badge">Pending</span></td><td><button className="btn ghost">Edit</button></td></tr>
            <tr><td>2025-08-18</td><td>Client Kickoff</td><td>5</td><td><span className="badge">Completed</span></td><td><div className="row"><button className="btn ghost">Export</button><button className="btn">Share</button></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
