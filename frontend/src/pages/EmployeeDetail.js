import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/employees/${id}`, {
      headers: { Authorization: token }
    })
      .then(res => {
        setEmployee(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Failed to load employee");
        setLoading(false);
      });
  }, [id, token]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>🔄 Loading...</div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>⚠️ {error}</div>;
  if (!employee) return <div style={{ padding: "40px", textAlign: "center" }}>Employee not found</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>👤 Employee Details: {employee.name}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Phone:</strong> {employee.phone}</p>
          <p><strong>Address:</strong> {employee.address}</p>
          <p><strong>Designation:</strong> {employee.designation}</p>
        </div>
        <div>
          <p><strong>Department:</strong> {employee.department_name}</p>
          <p><strong>Salary:</strong> ${parseFloat(employee.salary).toLocaleString()}</p>
          <p><strong>Joined:</strong> {new Date(employee.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {employee.skills && employee.skills.length > 0 && (
        <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
          <strong>Skills:</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
            {employee.skills.map(skill => (
              <span key={skill.id} style={{ padding: "5px 10px", backgroundColor: "#007bff", color: "white", borderRadius: "4px" }}>
                {skill.skill_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {employee.images && employee.images.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <strong>Uploaded Files:</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px", marginTop: "10px" }}>
            {employee.images.map(img => (
              <a key={img.id} href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${img.image_url}`} target="_blank" rel="noreferrer" style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", textAlign: "center", textDecoration: "none", color: "#007bff" }}>
                📄 View
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <a href={`/edit-employee/${employee.id}`} style={{ padding: "10px 15px", backgroundColor: "#28a745", color: "white", borderRadius: "4px", textDecoration: "none" }}>
          ✏️ Edit
        </a>
        <a href="/employees" style={{ padding: "10px 15px", backgroundColor: "#6c757d", color: "white", borderRadius: "4px", textDecoration: "none" }}>
          ← Back
        </a>
      </div>
    </div>
  );
}

export default EmployeeDetail;
