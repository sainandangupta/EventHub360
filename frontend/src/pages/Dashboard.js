import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StatCard, Button } from "../components/ui";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function Dashboard() {
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
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile data.");
      });

    // Fetch employee dashboard stats (which now includes assets and chart distributions)
    axios.get("http://localhost:5000/api/employees/stats/dashboard", { headers })
      .then(res => setStats(res.data))
      .catch(err => console.log("Stats Fetch Error:", err));

    // Fetch leave dashboard stats
    axios.get("http://localhost:5000/api/leave/dashboard-stats", { headers })
      .then(res => {
        setLeaveStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log("Leave Stats Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{ padding: "80px", textAlign: "center", color: 'var(--text-secondary)' }}>
        <div className="loading-spinner" style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid var(--border-color)', borderTop: '3px solid var(--color-primary-light)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: '0.5rem' }}>Loading your dashboard...</div>
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

  // Formatting chart data
  const deptData = stats?.department_distribution || [];
  const hiringTrendData = stats?.hiring_trend || [];
  
  const leaveDistributionData = leaveStats ? [
    { name: "Pending", count: leaveStats.pending || 0, fill: "#FFBB28" },
    { name: "Approved", count: leaveStats.approved || 0, fill: "#28a745" },
    { name: "Rejected", count: leaveStats.rejected || 0, fill: "#dc3545" },
    { name: "Cancelled", count: leaveStats.cancelled || 0, fill: "#6c757d" }
  ] : [];

  const assetDistributionData = stats ? [
    { name: "Allocated", count: stats.allocated_assets || 0, fill: "#FF8042" },
    { name: "Available", count: (stats.total_assets || 0) - (stats.allocated_assets || 0), fill: "#00C49F" }
  ] : [];

  return (
    <div className="page-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: '800' }}>Welcome back, {user?.name}! 👋</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-secondary)' }}>
            <span className="status-badge badge-manager-approved" style={{ marginRight: "0.5rem", padding: '0.2rem 0.5rem', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {(user?.role || "user").toUpperCase()}
            </span>
            {user?.verified ? "✅ Verified Employee" : "⏳ Unverified"} • Last login: {user?.last_login ? new Date(user.last_login).toLocaleString() : "First Session"}
          </p>
        </div>
      </div>

      {/* Main KPI Stats Row */}
      <div>
        <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem", fontSize: "1.25rem", fontWeight: '700' }}>📊 Enterprise Statistics</h2>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <StatCard icon="👥" title="Total Employees" value={stats?.total_employees || 0} color="#0088FE" />
          <StatCard icon="🏢" title="Departments" value={stats?.total_departments || 0} color="#00C49F" />
          <StatCard icon="📦" title="Total Assets" value={stats?.total_assets || 0} color="#FFBB28" />
          <StatCard icon="🤝" title="Allocated Assets" value={stats?.allocated_assets || 0} color="#FF8042" />
          <StatCard icon="⏳" title="Pending Leaves" value={leaveStats?.pending || 0} color="#dc3545" />
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Hiring Trend Line/Area Chart */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', minHeight: '350px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>📈 Monthly Hiring Trend</h3>
          <div style={{ width: '100%', height: '280px' }}>
            {hiringTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hiringTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHiring" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Area type="monotone" dataKey="count" name="Employees Hired" stroke="#8884d8" fillOpacity={1} fill="url(#colorHiring)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No hiring data recorded yet.</div>
            )}
          </div>
        </div>

        {/* Department Distribution Pie Chart */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', minHeight: '350px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>🏢 Department Distribution</h3>
          <div style={{ width: '100%', height: '280px' }}>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value, entry) => <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{value} ({entry.payload.count})</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No department metrics.</div>
            )}
          </div>
        </div>

        {/* Leave Distribution Bar Chart */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', minHeight: '350px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>📝 Leave Requests Overview</h3>
          <div style={{ width: '100%', height: '280px' }}>
            {leaveStats && leaveStats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" name="Applications" radius={[4, 4, 0, 0]}>
                    {leaveDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No leave records.</div>
            )}
          </div>
        </div>

        {/* Asset Distribution Bar Chart */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', minHeight: '350px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>📦 Asset Allocation Overview</h3>
          <div style={{ width: '100%', height: '280px' }}>
            {stats && stats.total_assets > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" name="Assets" radius={[4, 4, 0, 0]}>
                    {assetDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No assets registered.</div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Action Hub */}
      <div>
        <h2 style={{ color: "var(--text-primary)", marginBottom: "1rem", fontSize: "1.25rem", fontWeight: '700' }}>⚡ Core Workspace Actions</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(currentUser.role === "user" || currentUser.role === "manager") && (
            <Button variant="primary" onClick={() => navigate("/leave/apply")}>✏️ Apply for Leave</Button>
          )}
          <Button variant="secondary" onClick={() => navigate("/leave/my-leaves")}>📋 My Leaves</Button>
          <Button variant="secondary" onClick={() => navigate("/leave/balance")}>💰 Leave Balance</Button>
          <Button variant="secondary" onClick={() => navigate("/employees")}>👥 Employee Profiles</Button>
          <Button variant="secondary" onClick={() => navigate("/assets")}>📦 Asset Master</Button>
          <Button variant="secondary" onClick={() => navigate("/reports")}>📑 Reporting & Search</Button>
          
          {(currentUser.role === "manager" || currentUser.role === "hr") && (
            <Button variant="success" onClick={() => navigate("/leave/pending")}>
              ✓ Pending Approvals {leaveStats?.pending > 0 && `(${leaveStats.pending})`}
            </Button>
          )}
          {currentUser.role === "admin" && (
            <>
              <Button variant="danger" onClick={() => navigate("/admin")}>⚙️ User Accounts</Button>
              <Button variant="secondary" style={{ backgroundColor: 'var(--color-primary-dark)', color: 'white', border: 'none' }} onClick={() => navigate("/audit-logs")}>🔑 Audit Trail</Button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}