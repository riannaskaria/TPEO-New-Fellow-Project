import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "../styles/global.css"; // Import global styles

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
    <Container component="main" maxWidth="xs" className="auth-container">
      <Box className="box">
        <Typography component="h1" variant="h4">
          Log in
        </Typography>
        <Box className="form">
          <TextField
            className="input login-input"
            variant="outlined"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <TextField
            className="input login-input"
            variant="outlined"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            className="button"
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !username || !password}
          >
            {loading ? "Processing..." : "Log in"}
          </Button>
        </Box>
        {error && <Alert severity="error" className="error-message">{error}</Alert>}
        <Box>
          <Button fullWidth className="link" onClick={handleRegisterRedirect} disabled={loading}>
            Don't have an account? Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
