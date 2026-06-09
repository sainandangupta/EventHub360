import { useEffect, useState } from "react";
import axios from "axios";

function SkillsMaster() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ skill_name: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/skills");
      setSkills(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load skills");
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
        "http://localhost:5000/api/skills",
        form,
        { headers: { Authorization: token } }
      );
      alert("Skill created successfully!");
      setForm({ skill_name: "" });
      fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating skill");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/skills/${id}`, {
        headers: { Authorization: token }
      });
      alert("Skill deleted!");
      fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting skill");
    }
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "600px" }}>
      <h2>💼 Skills Management</h2>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <input
          type="text"
          name="skill_name"
          placeholder="Skill Name (e.g., React, Python, AWS)"
          value={form.skill_name}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" }}
        />
        <button
          type="submit"
          style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Add Skill
        </button>
      </form>

      <h3>All Skills</h3>
      {skills.length === 0 ? (
        <p>No skills found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {skills.map(skill => (
            <li key={skill.id} style={{ padding: "10px", border: "1px solid #ddd", marginBottom: "5px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🏷️ {skill.skill_name}</span>
              <button
                onClick={() => handleDelete(skill.id)}
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

export default SkillsMaster;
