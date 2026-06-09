import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StatCard, Card, Button } from "../components/ui";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [leaveStats, setLeaveStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Unauthorized access. Please log in.");
      setLoading(false);
      return;
    }

    const headers = { Authorization: token };

    // Fetch user profile
    axios.get("http://localhost:5000/api/user/profile", { headers })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile data.");
        setLoading(false);
      });

    // Fetch employee stats
    axios.get("http://localhost:5000/api/employees/stats", { headers })
      .then(res => setStats(res.data))
      .catch(err => console.log(err));

    // Fetch leave dashboard stats
    axios.get("http://localhost:5000/api/leave/dashboard-stats", { headers })
      .then(res => setLeaveStats(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader-fullpage">
          <div className="loader loader-lg"></div>
          <p className="loader-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ textAlign: "center", paddingTop: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <p style={{ color: "var(--color-danger)", marginBottom: "1.5rem" }}>{error}</p>
        <Button variant="primary" onClick={handleLogout}>Back to Login</Button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome Section */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title">Welcome back, {user?.name}! 👋</h1>
            <p className="page-subtitle">
              <span className="status-badge badge-manager-approved" style={{ marginRight: "0.5rem" }}>
                {(user?.role || "user").toUpperCase()}
              </span>
              {user?.verified ? "✅ Verified" : "⏳ Unverified"} • Member since {new Date(user?.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="profile-card" style={{ marginBottom: "2rem" }}>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            <div>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>📧 Email</span>
              <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0.25rem 0" }}>{user?.email}</p>
            </div>
            <div>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>👤 Role</span>
              <p style={{ fontWeight: 600, color: "var(--color-primary-light)", margin: "0.25rem 0", textTransform: "capitalize" }}>{user?.role || "User"}</p>
            </div>
            <div>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>🕐 Last Login</span>
              <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "0.25rem 0" }}>
                {user?.last_login ? new Date(user.last_login).toLocaleString() : "First login"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* System Statistics */}
      <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem", fontSize: "1.25rem" }}>📊 System Overview</h2>
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <StatCard icon="👥" title="Total Employees" value={stats?.total_employees || 0} color="var(--color-primary)" />
        <StatCard icon="🏢" title="Departments" value={stats?.total_departments || 0} color="var(--color-accent)" />
        {leaveStats && (
          <>
            <StatCard icon="📝" title="Leave Requests" value={leaveStats.total || 0} color="var(--color-info)" />
            <StatCard icon="⏳" title="Pending Approvals" value={leaveStats.pending || 0} color="var(--color-warning)" />
            <StatCard icon="✅" title="Approved Leaves" value={leaveStats.approved || 0} color="var(--color-success)" />
            <StatCard icon="❌" title="Rejected Leaves" value={leaveStats.rejected || 0} color="var(--color-danger)" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem", fontSize: "1.25rem" }}>⚡ Quick Actions</h2>
      <div className="quick-actions" style={{ marginBottom: "2rem" }}>
        {(currentUser.role === "user" || currentUser.role === "manager") && (
          <Button variant="primary" onClick={() => navigate("/leave/apply")}>📝 Apply Leave</Button>
        )}
        <Button variant="secondary" onClick={() => navigate("/leave/my-leaves")}>📋 My Leaves</Button>
        <Button variant="secondary" onClick={() => navigate("/leave/balance")}>💰 My Balance</Button>
        <Button variant="secondary" onClick={() => navigate("/employees")}>👥 Employees</Button>
        
        {(currentUser.role === "manager" || currentUser.role === "hr") && (
          <Button variant="success" onClick={() => navigate("/leave/pending")}>
            ✓ Pending Approvals {leaveStats?.pending > 0 && `(${leaveStats.pending})`}
          </Button>
        )}
        {(currentUser.role === "hr" || currentUser.role === "admin") && (
          <Button variant="primary" onClick={() => navigate("/leave/reports")}>📊 Leave Reports</Button>
        )}
        {currentUser.role === "admin" && (
          <Button variant="danger" onClick={() => navigate("/admin")}>⚙️ Admin Dashboard</Button>
        )}
      </div>

      {/* Role-specific Cards */}
      {currentUser.role === "manager" && leaveStats?.pending > 0 && (
        <Card accentColor="var(--color-warning)" style={{ marginBottom: "1.5rem" }}>
          <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ color: "var(--color-warning)", margin: 0 }}>⚠️ Pending for Your Approval</h3>
              <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                You have {leaveStats.pending} leave request(s) waiting for your review
              </p>
            </div>
            <Button variant="primary" onClick={() => navigate("/leave/pending")}>Review Now</Button>
          </div>
        </Card>
      )}

      {currentUser.role === "hr" && (
        <Card accentColor="var(--color-info)" style={{ marginBottom: "1.5rem" }}>
          <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ color: "var(--color-info)", margin: 0 }}>📊 HR Dashboard</h3>
              <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                Review pending approvals and generate leave reports
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button variant="success" onClick={() => navigate("/leave/pending")}>Approvals</Button>
              <Button variant="primary" onClick={() => navigate("/leave/reports")}>Reports</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;