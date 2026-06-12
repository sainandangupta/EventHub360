import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { showToast } from "../components/ui";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/password/forgot-password", { email });
      setMessage(res.data.message || "Password reset link has been sent to your email.");
      setSent(true);
      showToast({ message: "Reset link sent! Check your email.", type: "success" });
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send reset email. Please try again.";
      setError(msg);
      showToast({ message: msg, type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">🔐</span>
          </div>
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">
            {sent
              ? "Check your email for a reset link"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error">
            <span className="auth-alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="auth-alert auth-alert-success">
            <span className="auth-alert-icon">✅</span>
            <span>{message}</span>
          </div>
        )}

        {!sent ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="forgot-email">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                autoComplete="email"
                className="auth-input"
              />
            </div>

            <button type="submit" disabled={loading} className="auth-btn auth-btn-primary">
              {loading ? (
                <><span className="auth-spinner" /> Sending...</>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "var(--space-lg) 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>📧</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)", lineHeight: 1.6 }}>
              We've sent a password reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
              <br />Please check your inbox and click the link to reset your password.
              <br /><br />
              <span style={{ color: "var(--text-tertiary)" }}>The link will expire in 15 minutes.</span>
            </p>
            <button
              onClick={() => { setSent(false); setMessage(""); setEmail(""); }}
              className="auth-btn auth-btn-primary"
              style={{ marginTop: "var(--space-md)" }}
            >
              Try another email
            </button>
          </div>
        )}

        <div className="auth-footer">
          <span>Remember your password?</span>
          <Link to="/" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
