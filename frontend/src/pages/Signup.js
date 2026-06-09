import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Signup
      const signupRes = await axios.post("http://localhost:5000/api/auth/signup", form);
      
      // Send verification email
      if (signupRes.data.user.id) {
        await axios.post("http://localhost:5000/api/email/send-verification", {
          userId: signupRes.data.user.id
        });
      }

      setSuccess("Signup successful! Check your email to verify your account.");
      setForm({ name: "", email: "", password: "" });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>📝 Signup</h2>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>⚠️ {error}</div>}
      {success && <div style={{ color: "green", marginBottom: "10px" }}>✅ {success}</div>}
      <form onSubmit={handleSubmit}>
        <input 
          name="name" 
          placeholder="Full Name" 
          onChange={handleChange} 
          required 
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
        /><br/>
        <input 
          name="email" 
          type="email"
          placeholder="Email" 
          onChange={handleChange} 
          required 
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
        /><br/>
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
        /><br/>
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <hr />
      <p>Already have an account? <Link to="/">Login here</Link></p>
    </div>
  );
}
export default Signup;