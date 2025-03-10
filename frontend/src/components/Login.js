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

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    const url = isRegisterMode
      ? "http://localhost:3001/users"
      : "http://localhost:3001/login";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error processing request");
      }

      if (isRegisterMode) {
        alert("Signup successful! Please log in.");
        setIsRegisterMode(false); // Switch to login mode
      } else {
        alert("Login successful!");

        // Store the authentication token in localStorage
        localStorage.setItem('authToken', 'your-auth-token'); // Replace with actual token from API response

        // Update authentication state and redirect
        setIsAuthenticated(true);
        navigate("/dashboard"); // Redirect to dashboard after login
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h4" fontWeight="bold">
          {isRegisterMode ? "Register" : "Login"}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSubmit}
          >
            {isRegisterMode ? "Register" : "Login"}
          </Button>
          <Button
            fullWidth
            color="secondary"
            sx={{ mt: 1 }}
            onClick={() => setIsRegisterMode((prev) => !prev)}
          >
            {isRegisterMode ? "Already have an account? Login" : "Don't have an account? Register"}
          </Button>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    </Container>
  );
}

export default Login;
