import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login Success");
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>🔑 Login</h2>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>⚠️ {error}</div>}
      <form onSubmit={handleSubmit}>
        <input 
          name="email" 
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
          style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <hr />
      <p>Don't have an account? <Link to="/signup">Signup here</Link></p>
      <p><Link to="/forgot-password">Forgot Password?</Link></p>
    </div>
  );
}
export default Login;