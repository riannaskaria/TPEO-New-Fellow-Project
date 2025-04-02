import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "../styles.css/Register.css"; // Ensure the correct path

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
        prev.includes(category) ? prev.filter((i) => i !== category) : [...prev, category]
      );
    } else if (type === "social") {
      setSocialInterests((prev) =>
        prev.includes(category) ? prev.filter((i) => i !== category) : [...prev, category]
      );
    } else if (type === "career") {
      setCareerInterests((prev) =>
        prev.includes(category) ? prev.filter((i) => i !== category) : [...prev, category]
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

        // Redirect to login
        setTimeout(() => navigate("/login"), 500);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => navigate("/login");

  return (
    <div className="register-container">
      <div className="register-box">
        <h1 className="register-title">
          {currentStep === 1
            ? "Personal Information"
            : currentStep === 2
            ? "Select Your Academic Interests"
            : currentStep === 3
            ? "Select Your Social Interests"
            : "Select Your Career Interests"}
        </h1>

        <div className="register-form">
          {currentStep === 1 && (
            <>
              {/* Row for Username and Email */}
              <div className="register-input-row">
                <input
                  type="text"
                  className="register-input"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
                <input
                  type="email"
                  className="register-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Row for Password and Majors */}
              <div className="register-input-row">
                <input
                  type="password"
                  className="register-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <input
                  type="text"
                  className="register-input"
                  placeholder="Majors (comma-separated)"
                  value={majors}
                  onChange={(e) => setMajors(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Year Input */}
              <div className="register-input-row">
                <input
                  type="number"
                  className="register-input"
                  placeholder="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Interest Selection */}
          {(currentStep === 2 || currentStep === 3 || currentStep === 4) && (
            <div className="register-interests-container">
              {(currentStep === 2 ? academicCategories :
                currentStep === 3 ? socialCategories : careerCategories).map((category) => (
                <button
                  key={category}
                  className={`register-interest-button ${
                    (currentStep === 2 && academicInterests.includes(category)) ||
                    (currentStep === 3 && socialInterests.includes(category)) ||
                    (currentStep === 4 && careerInterests.includes(category))
                      ? `selected ${currentStep === 2 ? "academic" : currentStep === 3 ? "social" : "career"}`
                      : ""
                  }`}
                  onClick={() => handleInterestToggle(
                    currentStep === 2 ? "academic" : currentStep === 3 ? "social" : "career",
                    category
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Next / Register Button */}
          <button
            className="register-submit-button"
            onClick={handleSubmit}
            disabled={
              loading ||
              (currentStep === 1 && (!username || !email || !majors || !year || !password))
            }
          >
            {loading ? "Processing..." : currentStep === 4 ? "Register" : "Next"}
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="register-error">{error}</div>}

        {/* Login Redirect */}
        <button className="register-toggle-login-button" onClick={handleLoginRedirect} disabled={loading}>
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}

export default Register;
