export default function Dashboard() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Dashboard (Protected)</h1>
      <p>Choose a section:</p>
      <ul>
        <li><a href="/admin">Admin Panel</a></li>
        <li><a href="/employee">Employee Dashboard</a></li>
        <li><a href="/owner">Owner Dashboard</a></li>
      </ul>
    </div>
  );
}
