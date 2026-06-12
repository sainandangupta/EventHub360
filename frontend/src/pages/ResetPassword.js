import { useState, useEffect } from "react";
import api from "../api";
import { Link, useParams } from "react-router-dom";
import { showToast } from "../components/ui";

function ResetPassword() {
  const { token } = useParams();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Verify token on mount
    api.post("/api/password/verify-reset-token", { token })
      .then(() => {
        setTokenValid(true);
        setValidating(false);
      })
      .catch(() => {
        setTokenValid(false);
        setValidating(false);
        setError("This reset link is invalid or has expired. Please request a new one.");
      });
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/password/reset-password", {
        token,
        password: form.password,
      });
      setSuccess(true);
      showToast({ message: "Password reset successfully!", type: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password. Please try again.";
      setError(msg);
      showToast({ message: msg, type: "error" });
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-spinner" style={{ width: 32, height: 32, margin: "0 auto var(--space-md)", borderWidth: 3, borderColor: "var(--border-color)", borderTopColor: "var(--color-primary)" }} />
          <p style={{ color: "var(--text-secondary)" }}>Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>⚠️</div>
            <h1 className="auth-title">Link Expired</h1>
            <p className="auth-subtitle">This password reset link is no longer valid</p>
          </div>
          <div className="auth-alert auth-alert-error">
            <span className="auth-alert-icon">❌</span>
            <span>{error}</span>
          </div>
          <Link to="/forgot-password" className="auth-btn auth-btn-primary" style={{ textDecoration: "none", textAlign: "center" }}>
            Request New Reset Link
          </Link>
          <div className="auth-footer">
            <span>Remember your password?</span>
            <Link to="/" className="auth-link">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>✅</div>
          <h1 className="auth-title">Password Reset!</h1>
          <p className="auth-subtitle">Your password has been changed successfully</p>
          <Link to="/" className="auth-btn auth-btn-primary" style={{ textDecoration: "none", marginTop: "var(--space-lg)" }}>
            Sign In with New Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">🔑</span>
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your new password below</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error">
            <span className="auth-alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="reset-password">New Password</label>
            <div className="auth-input-wrapper">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
                className="auth-input"
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reset-confirm">Confirm New Password</label>
            <div className="auth-input-wrapper">
              <input
                id="reset-confirm"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="auth-input"
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <span className="auth-field-error">Passwords do not match</span>
            )}
            {form.confirmPassword && form.password === form.confirmPassword && form.confirmPassword.length > 0 && (
              <span className="auth-field-success">Passwords match ✓</span>
            )}
          </div>

          <button type="submit" disabled={loading} className="auth-btn auth-btn-success">
            {loading ? (
              <><span className="auth-spinner" /> Resetting...</>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Remember your password?</span>
          <Link to="/" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
