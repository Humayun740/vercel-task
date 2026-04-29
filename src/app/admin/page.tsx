export default function Admin() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Admin Panel</h1>
      <p>Welcome, admin. This page is protected by the proxy.</p>
      <p>
        You can extend this page to fetch protected API data from <code>/api/protected</code>.
      </p>
    </div>
  );
}
