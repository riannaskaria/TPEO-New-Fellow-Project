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
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // User fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [majors, setMajors] = useState("");
  const [year, setYear] = useState("");
  const [academicInterests, setAcademicInterests] = useState([]);
  const [socialInterests, setSocialInterests] = useState([]);
  const [careerInterests, setCareerInterests] = useState([]);

  const academicCategories = [
    "Business", "Liberal Arts", "Natural Sciences", "Engineering", "Communications",
    "Geosciences", "Informatics", "Education", "Architecture", "Civic Leadership",
    "Fine Arts", "Nursing", "Pharmacy", "Public Affairs", "Social Work"
  ];
  const socialCategories = ["Arts", "Entertainment", "Athletics", "Food"];
  const careerCategories = ["Networking", "Career Fairs", "Info Sessions", "Employer Events", "Career Guidance"];

  const handleInterestToggle = (type, category) => {
    if (type === "academic") {
      setAcademicInterests((prev) =>
        prev.includes(category)
          ? prev.filter((i) => i !== category)
          : [...prev, category]
      );
    } else if (type === "social") {
      setSocialInterests((prev) =>
        prev.includes(category)
          ? prev.filter((i) => i !== category)
          : [...prev, category]
      );
    } else if (type === "career") {
      setCareerInterests((prev) =>
        prev.includes(category)
          ? prev.filter((i) => i !== category)
          : [...prev, category]
      );
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (currentStep === 4) {
        // Final step: Submit registration
        const userData = {
          username,
          email,
          password,
          majors: majors.split(",").map((m) => m.trim()),
          year: parseInt(year),
          interests: [...academicInterests, ...socialInterests, ...careerInterests],
          savedEvents: [],
          orgs: [],
        };

        await authService.register(userData);
        alert("Registration successful! Please log in.");

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 500);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <Container component="main" maxWidth={false} className="login-container">
      <Box className="login-box">
        <Typography component="h1" variant="h4">
          {currentStep === 1
            ? "Personal Information"
            : currentStep === 2
            ? "Select Your Academic Interests"
            : currentStep === 3
            ? "Select Your Social Interests"
            : "Select Your Career Interests"}
        </Typography>

        <Box className="login-form">
          {currentStep === 1 && (
            <>
              {/* Row for Username and Email */}
              <div className="input-row">
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Row for Password and Majors */}
              <div className="input-row">
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Majors (comma-separated)"
                  value={majors}
                  onChange={(e) => setMajors(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Row for Year */}
              <div className="input-row">
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="interests-container">
              {academicCategories.map((category) => (
                <Button
                  key={category}
                  className={`interest-button ${academicInterests.includes(category) ? "selected" : ""}`}
                  onClick={() => handleInterestToggle("academic", category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="interests-container">
              {socialCategories.map((category) => (
                <Button
                  key={category}
                  className={`interest-button ${socialInterests.includes(category) ? "selected" : ""}`}
                  onClick={() => handleInterestToggle("social", category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <div className="interests-container">
              {careerCategories.map((category) => (
                <Button
                  key={category}
                  className={`interest-button ${careerInterests.includes(category) ? "selected" : ""}`}
                  onClick={() => handleInterestToggle("career", category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={
              loading ||
              (currentStep === 1 &&
                (!username || !email || !majors || !year || !password))
            }
          >
            {loading ? "Processing..." : currentStep === 4 ? "Register" : "Next"}
          </Button>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Button
          fullWidth
          className="toggle-mode-button"
          onClick={handleLoginRedirect}
          disabled={loading}
        >
          Already have an account? Login
        </Button>
      </Box>
    </Container>
  );
}

export default Register;
