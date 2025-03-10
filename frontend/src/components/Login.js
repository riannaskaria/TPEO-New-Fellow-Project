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
import "../styles.css/Login.css";
function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        await authService.register(username, password);
        alert("Registration successful! Please log in.");
        setIsRegisterMode(false);
      } else {
        await authService.login(username, password);
        setIsAuthenticated(true); // This ensures the authentication state is updated
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container component="main" maxWidth="xs" className="login-container">
      <Box className="login-box">
        <Typography component="h1" variant="h4" className="login-title">
          {isRegisterMode ? "Register" : "Log in"}
        </Typography>
        <Box className="login-form">
          <TextField
            className="login-input"
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
            className="login-input"
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
            className="login-button"
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !username || !password}
          >
            {loading ? "Processing..." : isRegisterMode ? "Register" : "Log in"}
          </Button>
          <Button
            className="toggle-mode-button"
            fullWidth
            onClick={() => {
              setIsRegisterMode((prev) => !prev);
              setError(null);
            }}
            disabled={loading}
          >
            {isRegisterMode
              ? "Already have an account? Log in"
              : "Don't have an account? Register"}
          </Button>
        </Box>
        {error && <Alert severity="error" className="login-error">{error}</Alert>}
      </Box>
    </Container>
  );
}

export default Login;

