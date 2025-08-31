export default function AdminRooms(){
  return (
    <div className="grid" style={{gap:16}}>
      <h1 className="page-title">Room Management</h1>

      <div className="card">
        <h2 className="section-title">Rooms</h2>
        <table className="table">
          <thead><tr><th>Name</th><th>Capacity</th><th>Equipment</th><th>Status</th><th></th></tr></thead>
          <tbody>
            <tr><td>Room A</td><td>8</td><td>Projector, Mic</td><td><span className="badge">Available</span></td><td><button className="btn ghost">Edit</button></td></tr>
            <tr><td>Room B</td><td>4</td><td>TV</td><td><span className="badge" style={{background:"#fee2e2",color:"#991b1b"}}>Maintenance</span></td><td><button className="btn ghost">Edit</button></td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="section-title">Add / Edit Room</h2>
        <div className="grid" style={{gap:10}}>
          <input className="input" placeholder="Name"/>
          <input className="input" type="number" placeholder="Capacity"/>
          <input className="input" placeholder="Equipment (comma-separated)"/>
          <div className="row">
            <button className="btn">Save</button>
            <button className="btn ghost" type="button">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
