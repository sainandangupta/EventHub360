import { useEffect, useState } from "react";
import api from "../api";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    api.get("/api/employees", {
      headers: { Authorization: token }
    })
      .then(res => {
        setEmployees(res.data.data || res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Failed to load employees");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    const token = localStorage.getItem("token");
    try {
      await api.delete(`/api/employees/${id}`, {
        headers: { Authorization: token }
      });
      setEmployees(employees.filter(e => e.id !== id));
      alert("Employee deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete employee");
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>🔄 Loading employees...</div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>⚠️ {error}</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>👥 Employee List</h2>
      <a href="/create-employee" style={{ marginBottom: "20px", display: "inline-block", padding: "10px 15px", backgroundColor: "#007bff", color: "white", borderRadius: "4px", textDecoration: "none" }}>
        ➕ Create New Employee
      </a>

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Name</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Department</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Designation</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Salary</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Phone</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{emp.id}</td>
                <td style={{ padding: "10px" }}>{emp.name}</td>
                <td style={{ padding: "10px" }}>{emp.department_name}</td>
                <td style={{ padding: "10px" }}>{emp.designation}</td>
                <td style={{ padding: "10px" }}>${parseFloat(emp.salary).toLocaleString()}</td>
                <td style={{ padding: "10px" }}>{emp.phone}</td>
                <td style={{ padding: "10px" }}>
                  <a href={`/employee/${emp.id}`} style={{ marginRight: "10px", color: "#007bff", textDecoration: "none", cursor: "pointer" }}>View</a>
                  <a href={`/edit-employee/${emp.id}`} style={{ marginRight: "10px", color: "#28a745", textDecoration: "none", cursor: "pointer" }}>Edit</a>
                  <button 
                    onClick={() => handleDelete(emp.id)}
                    style={{ padding: "5px 10px", backgroundColor: "#ff4d4d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmployeeList;
