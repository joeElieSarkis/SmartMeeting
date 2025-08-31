export default function Dashboard() {
  return (
    <div style={page}>
      <h1 style={title}>Dashboard</h1>

      <section style={card}>
        <h2 style={h2}>Upcoming Meetings</h2>
        <ul style={{margin:0, paddingLeft:18}}>
          <li>09:00–10:00 • Weekly Team Sync • Room A</li>
          <li>11:30–12:00 • Standup • Room B</li>
        </ul>
      </section>

      <div style={grid}>
        <div style={card}>Schedule Meeting</div>
        <div style={card}>Join Now</div>
        <div style={card}>View Minutes</div>
      </div>

      <section style={card}>
        <h2 style={h2}>Room Availability</h2>
        <div>Calendar placeholder</div>
      </section>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background: "#f8fafc",   // light gray background
  color: "#0f172a",        // dark text color
  padding: "20px",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
};

const title = { fontSize: 24, fontWeight: 700, marginBottom: 20 };
const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginBottom:20, boxShadow:"0 2px 6px rgba(0,0,0,0.05)" };
const h2 = { fontSize:16, fontWeight:600, marginTop:0, marginBottom:12 };
const grid = { display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", marginBottom:20 };
