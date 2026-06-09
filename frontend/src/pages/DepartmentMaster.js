import { useEffect, useState } from "react";
import axios from "axios";

function DepartmentMaster() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ department_name: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/departments");
      setDepartments(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load departments");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(
        "http://localhost:5000/api/departments",
        form,
        { headers: { Authorization: token } }
      );
      alert("Department created successfully!");
      setForm({ department_name: "" });
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating department");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/departments/${id}`, {
        headers: { Authorization: token }
      });
      alert("Department deleted!");
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting department");
    }
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "600px" }}>
      <h2>🏢 Department Management</h2>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <input
          type="text"
          name="department_name"
          placeholder="Department Name"
          value={form.department_name}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" }}
        />
        <button
          type="submit"
          style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Add Department
        </button>
      </form>

      <h3>All Departments</h3>
      {departments.length === 0 ? (
        <p>No departments found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {departments.map(dept => (
            <li key={dept.id} style={{ padding: "10px", border: "1px solid #ddd", marginBottom: "5px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{dept.department_name}</span>
              <button
                onClick={() => handleDelete(dept.id)}
                style={{ padding: "5px 10px", backgroundColor: "#ff4d4d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DepartmentMaster;
