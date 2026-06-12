import { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { showToast } from "../components/ui";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!form.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const signupRes = await api.post("/api/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // Send verification email
      if (signupRes.data.user?.id) {
        await api.post("/api/email/send-verification", {
          userId: signupRes.data.user.id,
        }).catch(() => {}); // Don't block on email failure
      }

      setSuccess("Account created successfully! Check your email to verify your account.");
      showToast({ message: "Account created successfully!", type: "success" });
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setLoading(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
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
            <span className="auth-logo-icon">📝</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the employee management portal</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error">
            <span className="auth-alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="auth-alert auth-alert-success">
            <span className="auth-alert-icon">✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="signup-password"
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
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-confirm-password">Confirm Password</label>
            <div className="auth-input-wrapper">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="auth-input"
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
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
              <><span className="auth-spinner" /> Creating Account...</>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;