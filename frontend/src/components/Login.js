import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "../styles/global.css";
import "../styles/Login.css";

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      await authService.login(username, password);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="auth-container">
      <img src="/assets/logo.svg" alt="Logo" className="logo-login" />
      <div className="box">
        <h1 className="login-title">LOG IN</h1>
        <form className="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="input-group">
            <input
              id="username"
              className="input-field"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="input-group">
            <input
              id="password"
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button
            className="submit-button"
            type="submit"
            disabled={loading || !username || !password}
          >
            {loading ? "Processing..." : "Sign In"}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
        <button
          className="register-link"
          onClick={handleRegisterRedirect}
          disabled={loading}
        >
          don't have an account? sign up
        </button>
        <img src="/assets/bee-line.svg" alt="bee line" className="bee-line-graphic" />
        <img src="/assets/bee.svg" alt="bee line" className="bee-graphic" />
      </div>
    </div>
  );
}

export default Login;
