import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

function EmailVerification() {
  const { token } = useParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/email/verify-email", { token });
        setMessage(res.data.message);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Verification failed");
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", textAlign: "center" }}>
      <h2>📧 Email Verification</h2>
      
      {loading && <p>⏳ Verifying your email...</p>}
      {error && <div style={{ color: "red", marginBottom: "10px" }}>⚠️ {error}</div>}
      {message && <div style={{ color: "green", marginBottom: "10px" }}>✅ {message}</div>}

      {!loading && (
        <div>
          <hr />
          <p><Link to="/">Back to Login</Link></p>
        </div>
      )}
    </div>
  );
}

export default EmailVerification;
