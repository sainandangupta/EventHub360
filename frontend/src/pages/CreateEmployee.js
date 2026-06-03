import { useState, useEffect } from "react";
import axios from "axios";

function CreateEmployee() {
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
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch departments
    axios.get("http://localhost:5000/api/departments")
      .then(res => setDepartments(res.data))
      .catch(err => console.error(err));

    // Fetch skills
    axios.get("http://localhost:5000/api/skills")
      .then(res => setAllSkills(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSkillChange = (skillId) => {
    if (skills.includes(skillId)) {
      setSkills(skills.filter(id => id !== skillId));
    } else {
      setSkills([...skills, skillId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create employee profile
      const res = await axios.post(
        "http://localhost:5000/api/employees",
        {
          ...form,
          skills: skills
        },
        { headers: { Authorization: token } }
      );

      const employeeId = res.data.employee_id;

      // Upload images if provided
      if (images && images.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < images.length; i++) {
          formData.append("images", images[i]);
        }

        await axios.post(
          `http://localhost:5000/api/employees/upload/${employeeId}`,
          formData,
          {
            headers: {
              Authorization: token,
              "Content-Type": "multipart/form-data"
            }
          }
        );
      }

      alert("Employee created successfully!");
      window.location.href = "/employees";
    } catch (err) {
      setError(err.response?.data?.message || "Error creating employee");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>➕ Create Employee Profile</h2>
      
      {error && <div style={{ color: "red", marginBottom: "10px" }}>⚠️ {error}</div>}

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
          placeholder="Designation (e.g., Developer, Manager)"
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

        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Upload Images (Max 5):</label>
          <input
            type="file"
            multiple
            onChange={handleImageChange}
            accept="image/*,.pdf"
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
          <small>Allowed: JPG, PNG, PDF (Max 5 files, 5MB each)</small>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          {loading ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
}

export default CreateEmployee;
