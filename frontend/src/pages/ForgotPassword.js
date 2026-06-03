import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetData, setResetData] = useState({ token: "", password: "", confirmPassword: "" });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post("http://localhost:5000/api/password/forgot-password", { email });
      setMessage(res.data.message);
      setResetData({ ...resetData, token: res.data.resetToken });
      setShowReset(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (resetData.password !== resetData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post("http://localhost:5000/api/password/reset-password", {
        token: resetData.token,
        password: resetData.password
      });
      setMessage(res.data.message);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>🔐 Forgot Password</h2>
      
      {error && <div style={{ color: "red", marginBottom: "10px" }}>⚠️ {error}</div>}
      {message && <div style={{ color: "green", marginBottom: "10px" }}>✅ {message}</div>}

      {!showReset ? (
        <form onSubmit={handleEmailSubmit}>
          <p>Enter your email to receive a password reset link</p>
          <input 
            type="email"
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
          /><br/>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit}>
          <p>Enter your new password</p>
          <input 
            type="password"
            placeholder="New Password" 
            value={resetData.password}
            onChange={(e) => setResetData({ ...resetData, password: e.target.value })}
            required 
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
          /><br/>
          <input 
            type="password"
            placeholder="Confirm Password" 
            value={resetData.confirmPassword}
            onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
            required 
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
          /><br/>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <hr />
      <p><Link to="/">Back to Login</Link></p>
    </div>
  );
}

export default ForgotPassword;
