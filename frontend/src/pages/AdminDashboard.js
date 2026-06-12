import { useEffect, useState } from "react";
import api from "../api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Unauthorized access");
      setLoading(false);
      return;
    }

    // Fetch stats
    api.get("/api/admin/stats", {
      headers: { Authorization: token },
    })
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load stats"));

    // Fetch users
    api.get("/api/admin/users", {
      headers: { Authorization: token },
    })
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load users");
        setLoading(false);
      });
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem("token");
    try {
      await api.put(`/api/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: token } }
      );
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert("Role updated");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await api.delete(`/api/admin/users/${userId}`,
        { headers: { Authorization: token } }
      );
      setUsers(users.filter(u => u.id !== userId));
      alert("User deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>🔄 Loading admin dashboard...</div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>⚠️ {error}</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>👨‍💼 Admin Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
        <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
          <h3>{stats?.total_users || 0}</h3>
          <p>Total Users</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
          <h3>{stats?.verified_users || 0}</h3>
          <p>Verified Users</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
          <h3>{stats?.admin_count || 0}</h3>
          <p>Admins</p>
        </div>
      </div>

      <h3>👥 User Management</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Name</th>
            <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Email</th>
            <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Role</th>
            <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Verified</th>
            <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "10px" }}>{user.name}</td>
              <td style={{ padding: "10px" }}>{user.email}</td>
              <td style={{ padding: "10px" }}>
                <select 
                  value={user.role} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </td>
              <td style={{ padding: "10px" }}>{user.verified ? "✅ Yes" : "❌ No"}</td>
              <td style={{ padding: "10px" }}>
                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  style={{ padding: "5px 10px", backgroundColor: "#ff4d4d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button 
        onClick={() => window.location.href = "/dashboard"}
        style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default AdminDashboard;
