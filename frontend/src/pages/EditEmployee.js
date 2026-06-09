import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function EditEmployee() {
  const { id } = useParams();
  const [form, setForm] = useState({
    phone: "",
    address: "",
    designation: "",
    salary: "",
    department_id: ""
  });

  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch employee data
    axios.get(`http://localhost:5000/api/employees/${id}`, {
      headers: { Authorization: token }
    })
      .then(res => {
        setEmployee(res.data);
        setForm({
          phone: res.data.phone,
          address: res.data.address,
          designation: res.data.designation,
          salary: res.data.salary,
          department_id: res.data.department_id
        });
        setSkills(res.data.skills.map(s => s.id));
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Failed to load employee");
        setLoading(false);
      });

    // Fetch departments
    axios.get("http://localhost:5000/api/departments")
      .then(res => setDepartments(res.data))
      .catch(err => console.error(err));

    // Fetch skills
    axios.get("http://localhost:5000/api/skills")
      .then(res => setAllSkills(res.data))
      .catch(err => console.error(err));
  }, [id, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (skillId) => {
    if (skills.includes(skillId)) {
      setSkills(skills.filter(s => s !== skillId));
    } else {
      setSkills([...skills, skillId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `http://localhost:5000/api/employees/${id}`,
        {
          ...form,
          skills: skills
        },
        { headers: { Authorization: token } }
      );

      alert("Employee updated successfully!");
      window.location.href = "/employees";
    } catch (err) {
      setError(err.response?.data?.message || "Error updating employee");
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>🔄 Loading...</div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>⚠️ {error}</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>✏️ Edit Employee: {employee?.name}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" }}
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" }}
        />

        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={form.designation}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" }}
        />

        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={form.salary}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" }}
        />

        <select
          name="department_id"
          value={form.department_id}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" }}
        >
          <option value="">-- Select Department --</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.department_name}</option>
          ))}
        </select>

        <div style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>Select Skills:</label>
          {allSkills.map(skill => (
            <label key={skill.id} style={{ display: "block", marginBottom: "5px" }}>
              <input
                type="checkbox"
                checked={skills.includes(skill.id)}
                onChange={() => handleSkillChange(skill.id)}
                style={{ marginRight: "5px" }}
              />
              {skill.skill_name}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          {loading ? "Updating..." : "Update Employee"}
        </button>
      </form>

      <button
        onClick={() => window.location.href = "/employees"}
        style={{ width: "100%", padding: "10px", marginTop: "10px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        Cancel
      </button>
    </div>
  );
}

export default EditEmployee;
