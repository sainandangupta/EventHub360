import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FormInput from "../components/ui/FormInput";
import FormSelect from "../components/ui/FormSelect";

export default function CreateEmployee() {
  const navigate = useNavigate();
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
    axios.get("http://localhost:5000/api/departments", { headers: { Authorization: token } })
      .then(res => setDepartments(res.data))
      .catch(err => console.error(err));

    // Fetch skills
    axios.get("http://localhost:5000/api/skills", { headers: { Authorization: token } })
      .then(res => setAllSkills(res.data))
      .catch(err => console.error(err));
  }, [token]);

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
      navigate("/employees");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating employee");
      setLoading(false);
    }
  };

  const departmentOptions = departments.map(dept => ({
    value: dept.id,
    label: dept.department_name
  }));

  return (
    <div className="card-container" style={{ maxWidth: "650px", margin: "2rem auto", padding: "2.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-secondary)", boxShadow: "var(--shadow-lg)" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>👥</span>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>Create Employee Profile</h2>
      </div>

      {error && (
        <div style={{ padding: "1rem", backgroundColor: "rgba(220, 53, 69, 0.1)", border: "1px solid var(--color-danger-light)", borderRadius: "var(--radius-md)", color: "var(--color-danger-light)", marginBottom: "1.5rem", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormInput
            label="Phone Number"
            name="phone"
            type="text"
            placeholder="e.g. +1234567890"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Salary"
            name="salary"
            type="number"
            placeholder="e.g. 65000"
            value={form.salary}
            onChange={handleChange}
            required
          />
        </div>

        <FormInput
          label="Address"
          name="address"
          type="text"
          placeholder="e.g. 123 Main St, New York, NY"
          value={form.address}
          onChange={handleChange}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormInput
            label="Designation"
            name="designation"
            type="text"
            placeholder="e.g. Software Engineer"
            value={form.designation}
            onChange={handleChange}
            required
          />

          <FormSelect
            label="Department"
            name="department_id"
            placeholder="-- Select Department --"
            options={departmentOptions}
            value={form.department_id}
            onChange={handleChange}
            required
          />
        </div>

        {/* Skills checklist */}
        <div style={{ marginBottom: "1.5rem", padding: "1.25rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", backgroundColor: 'var(--bg-primary)' }}>
          <label style={{ fontWeight: "700", display: "block", marginBottom: "0.75rem", color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Skills</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {allSkills.map(skill => (
              <label key={skill.id} style={{ display: "flex", alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  checked={skills.includes(skill.id)}
                  onChange={() => handleSkillChange(skill.id)}
                  style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }}
                />
                {skill.skill_name}
              </label>
            ))}
          </div>
        </div>

        {/* Image upload */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ fontWeight: "600", display: "block", marginBottom: "0.5rem", color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upload Images / Document Proofs</label>
          <input
            type="file"
            multiple
            onChange={handleImageChange}
            accept="image/*,.pdf"
            style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
          <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>Allowed formats: JPG, PNG, PDF (Max 5 files, 5MB each)</small>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: 1, padding: "0.75rem", backgroundColor: "var(--color-primary-light)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "700", fontSize: '1rem', transition: 'background-color 0.2s' }}
          >
            {loading ? "Creating..." : "Create Employee"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="btn btn-secondary"
            style={{ padding: "0.75rem 1.5rem", backgroundColor: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "600", transition: 'background-color 0.2s, color 0.2s' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
