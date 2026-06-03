import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Unauthorized access. Please log in.");
      setLoading(false);
      return;
    }

    axios.get("http://localhost:5000/api/user/profile", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile data.");
        setLoading(false);
      });

    // Fetch dashboard statistics
    axios.get("http://localhost:5000/api/employees/stats", {
      headers: { Authorization: token }
    })
      .then(res => setStats(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>🔄 Loading your profile...</div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>⚠️ {error}<br/><br/><button onClick={handleLogout}>Back to Login</button></div>;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ border: "1px solid #ccc", padding: "30px", borderRadius: "8px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
        <h2>🔒 Secure User Dashboard</h2>
        <hr />
        
        <div style={{ fontSize: "18px", lineHeight: "1.8" }}>
          <p><strong>👋 Welcome, {user?.name}!</strong></p>
          <p><strong>📧 Email:</strong> {user?.email}</p>
          <p><strong>👤 Role:</strong> {user?.role || "User"}</p>
          <p><strong>✅ Verified:</strong> {user?.verified ? "Yes" : "No"}</p>
          <p><strong>🕐 Last Login:</strong> {user?.last_login ? new Date(user.last_login).toLocaleString() : "First login"}</p>
          <p><strong>📅 Member Since:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Dashboard Statistics */}
      {stats && (
        <div style={{ marginBottom: "30px" }}>
          <h3>📊 System Statistics</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
            <div style={{ padding: "20px", backgroundColor: "#e3f2fd", borderRadius: "8px", textAlign: "center", border: "1px solid #90caf9" }}>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1976d2" }}>{stats.total_employees || 0}</div>
              <div style={{ color: "#666", marginTop: "5px" }}>Total Employees</div>
            </div>
            <div style={{ padding: "20px", backgroundColor: "#f3e5f5", borderRadius: "8px", textAlign: "center", border: "1px solid #ce93d8" }}>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#7b1fa2" }}>{stats.total_departments || 0}</div>
              <div style={{ color: "#666", marginTop: "5px" }}>Departments</div>
            </div>
            <div style={{ padding: "20px", backgroundColor: "#e8f5e9", borderRadius: "8px", textAlign: "center", border: "1px solid #81c784" }}>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#388e3c" }}>{stats.total_skills || 0}</div>
              <div style={{ color: "#666", marginTop: "5px" }}>Skills</div>
            </div>
            <div style={{ padding: "20px", backgroundColor: "#fff3e0", borderRadius: "8px", textAlign: "center", border: "1px solid #ffb74d" }}>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#f57c00" }}>{stats.total_images || 0}</div>
              <div style={{ color: "#666", marginTop: "5px" }}>Uploaded Files</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div style={{ marginBottom: "30px" }}>
        <h3>📋 Menu</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          <a href="/employees" style={{ padding: "15px", backgroundColor: "#007bff", color: "white", borderRadius: "4px", textDecoration: "none", textAlign: "center", fontWeight: "bold" }}>
            👥 Employees
          </a>
          <a href="/create-employee" style={{ padding: "15px", backgroundColor: "#28a745", color: "white", borderRadius: "4px", textDecoration: "none", textAlign: "center", fontWeight: "bold" }}>
            ➕ Create Employee
          </a>
          <a href="/departments" style={{ padding: "15px", backgroundColor: "#6f42c1", color: "white", borderRadius: "4px", textDecoration: "none", textAlign: "center", fontWeight: "bold" }}>
            🏢 Departments
          </a>
          <a href="/skills" style={{ padding: "15px", backgroundColor: "#fd7e14", color: "white", borderRadius: "4px", textDecoration: "none", textAlign: "center", fontWeight: "bold" }}>
            💼 Skills
          </a>
          <a href="/admin" style={{ padding: "15px", backgroundColor: "#dc3545", color: "white", borderRadius: "4px", textDecoration: "none", textAlign: "center", fontWeight: "bold" }}>
            ⚙️ Admin
          </a>
        </div>
      </div>

      <hr style={{ margin: "20px 0" }} />
      <button 
        onClick={handleLogout}
        style={{ width: "100%", padding: "12px", backgroundColor: "#ff4d4d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
      >
        Logout Session
      </button>
    </div>
  );
}

export default Dashboard;