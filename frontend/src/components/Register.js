import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "../styles/global.css";
import "../styles/Register.css"; // Ensure the correct path

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
  const socialCategories = [
    "Cultural",
    "Religious",
    "Athletics",
    "Visual Arts",
    "Film and Media",
    "Music",
    "Volunteering",
    "Comedy",
    "Food",
    "Politics",
    "Wellness",
    "Entertainment"
  ];
  const careerCategories = [
    "Networking",
    "Career Fairs",
    "Company Info Sessions",
    "Employer Events",
    "Guidance",
    "Alumni Events",
    "Workshops",
    "Mock Interviews"
  ];

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

  const steps = ["Personal Information", "Academic Interests", "Social Interests", "Career Interests"];

  return (
    <div className="register-container">
      <div className="register-box">

        {/* Progress Bar */}
        <div className="register-progress-steps">
          {steps.map((step, index) => (
            <div key={step} className="progress-step">
              <img
                src={
                  currentStep > index + 1
                    ? "/assets/circle.svg"  // Completed
                    : currentStep === index + 1
                    ? "/assets/bee.svg"  // Current step
                    : "/assets/ellipse.svg"  // Uncompleted step
                }
                alt={`Step ${index + 1}`}
                className="step-dot"
              />
              {index < steps.length - 1 && (
                <img
                  src={
                    currentStep > index + 1
                      ? "/assets/line.svg"  // Completed connection
                      : "/assets/line.svg"  // Inactive connection
                  }
                  alt="Line"
                  className="step-line"
                />
              )}
            </div>
          ))}
        </div>

        {/* Registration Form */}
        <div className="register-form">
          {currentStep === 1 && (
            <>
              <h2 className="register-title">Personal Information</h2>
              <div className="register-input-row">
                <div className="input-field-group">
                  <input
                    type="text"
                    placeholder="Username"
                    className="register-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="input-field-group">
                  <input
                    type="email"
                    placeholder="Email"
                    className="register-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="register-input-row">
                <div className="input-field-group">
                  <input
                    type="password"
                    placeholder="Password"
                    className="register-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="input-field-group">
                  <input
                    type="text"
                    placeholder="Majors (comma separated)"
                    className="register-input"
                    value={majors}
                    onChange={(e) => setMajors(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="register-input-row">
                <div className="input-field-group" style={{ width: '100%' }}>
                  <input
                    type="number"
                    placeholder="Year"
                    className="register-input"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="register-nav-buttons">
                <button  className="register-toggle-login-button left-align" onClick={handleLoginRedirect} disabled={loading}>
                  Already have an account?
                </button>
                <div className="next-button-container">
                  <button
                    className="next-button"
                    onClick={handleSubmit}
                    disabled={loading || !username || !email || !majors || !year || !password}
                  >
                    {loading ? "Processing..." : "Next"}
                  </button>
                </div>
              </div>
            </>
          )}

          {(currentStep === 2 || currentStep === 3 || currentStep === 4) && (
            <>
              <h2 className="register-title">
                {currentStep === 2
                  ? "Select all types of academic events you're interested in:"
                  : currentStep === 3
                  ? "Select social activities you enjoy:"
                  : "Select career services you're interested in:"}
              </h2>
              <div className="register-interests-container">
                {(currentStep === 2 ? academicCategories :
                  currentStep === 3 ? socialCategories : careerCategories).map((category) => {
                  const type = currentStep === 2 ? "academic" : currentStep === 3 ? "social" : "career";
                  const isSelected =
                    (type === "academic" && academicInterests.includes(category)) ||
                    (type === "social" && socialInterests.includes(category)) ||
                    (type === "career" && careerInterests.includes(category));

                  return (
                    <button
                      key={category}
                      className={`register-interest-button ${type} ${isSelected ? "selected" : ""}`}
                      onClick={() => handleInterestToggle(type, category)}
                    >
                      {isSelected && <img src="/assets/cancel.svg" alt="Remove" className="cancel-icon" />}
                      {category}
                    </button>
                  );
                })}
              </div>
              <div className="register-nav-buttons">
                <button className="back-button" onClick={() => setCurrentStep(currentStep - 1)} disabled={loading}>
                  Back
                </button>
                <div className="next-button-container">
                  <button className="skip-button" onClick={() => setCurrentStep(currentStep + 1)}>
                    Skip
                  </button>
                  <button
                    className="next-button"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {currentStep === 4 ? "Register" : "Next"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="register-error">{error}</div>}
      </div>
    </div>
  );
}

export default Register;
