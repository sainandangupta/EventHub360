import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import FormInput from "../components/ui/FormInput";
import FormSelect from "../components/ui/FormSelect";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: "",
    address: "",
    designation: "",
    salary: "",
    department_id: "",
    city: "",
    work_mode: "offline",
    status: "active",
    joining_date: ""
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
    api.get(`/api/employees/${id}`, {
      headers: { Authorization: token }
    })
      .then(res => {
        setEmployee(res.data);
        setForm({
          phone: res.data.phone,
          address: res.data.address,
          designation: res.data.designation,
          salary: res.data.salary,
          department_id: res.data.department_id,
          city: res.data.city || "",
          work_mode: res.data.work_mode || "offline",
          status: res.data.status || "active",
          joining_date: res.data.joining_date ? res.data.joining_date.split('T')[0] : ""
        });
        setSkills(res.data.skills.map(s => s.id));
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Failed to load employee");
        setLoading(false);
      });

    // Fetch departments
    api.get("/api/departments", { headers: { Authorization: token } })
      .then(res => setDepartments(res.data))
      .catch(err => console.error(err));

    // Fetch skills
    api.get("/api/skills", { headers: { Authorization: token } })
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
      await api.put(
        `/api/employees/${id}`,
        {
          ...form,
          skills: skills
        },
        { headers: { Authorization: token } }
      );

      alert("Employee updated successfully!");
      navigate("/employees");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating employee");
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "80px", textAlign: "center", color: 'var(--text-secondary)' }}>
    <div className="loading-spinner" style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid var(--border-color)', borderTop: '3px solid var(--color-primary-light)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <div style={{ marginTop: '0.5rem' }}>Loading employee data...</div>
  </div>;

  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-danger-light)" }}>⚠️ {error}</div>;

  const departmentOptions = departments.map(dept => ({
    value: dept.id,
    label: dept.department_name
  }));

  return (
    <div className="card-container" style={{ maxWidth: "650px", margin: "2rem auto", padding: "2.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-secondary)", boxShadow: "var(--shadow-lg)" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>✏️</span>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>Edit Employee: {employee?.name}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormInput
            label="Phone Number"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Salary"
            name="salary"
            type="number"
            value={form.salary}
            onChange={handleChange}
            required
          />
        </div>

        <FormInput
          label="Address"
          name="address"
          type="text"
          value={form.address}
          onChange={handleChange}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormInput
            label="Designation"
            name="designation"
            type="text"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <FormInput
            label="City"
            name="city"
            type="text"
            placeholder="e.g. New York"
            value={form.city}
            onChange={handleChange}
          />

          <FormInput
            label="Joining Date"
            name="joining_date"
            type="date"
            value={form.joining_date}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
          <FormSelect
            label="Work Mode"
            name="work_mode"
            options={[
              { value: 'online', label: 'Online' },
              { value: 'offline', label: 'Offline' },
              { value: 'hybrid', label: 'Hybrid' }
            ]}
            value={form.work_mode}
            onChange={handleChange}
          />

          <FormSelect
            label="Status"
            name="status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            value={form.status}
            onChange={handleChange}
          />
        </div>

        {/* Skills list */}
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

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1, padding: "0.75rem", backgroundColor: "var(--color-primary-light)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "700", fontSize: '1rem' }}
          >
            Update Profile
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="btn btn-secondary"
            style={{ padding: "0.75rem 1.5rem", backgroundColor: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "600" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
