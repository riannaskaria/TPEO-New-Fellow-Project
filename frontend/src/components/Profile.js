import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import Header from "./Header";
import "../styles/global.css";
import "../styles/Profile.css";

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("account");
  const [formData, setFormData] = useState({});
  const [isEditable, setIsEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

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

  const [academicInterests, setAcademicInterests] = useState([]);
  const [socialInterests, setSocialInterests] = useState([]);
  const [careerInterests, setCareerInterests] = useState([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({ ...currentUser });
      if (currentUser.interests) {
        const { academic = [], social = [], career = [] } = currentUser.interests;
        setAcademicInterests(academic);
        setSocialInterests(social);
        setCareerInterests(career);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = () => {
    const updatedUser = {
      ...formData,
      interests: {
        academic: academicInterests,
        social: socialInterests,
        career: careerInterests,
      },
    };
    console.log("Updated data:", updatedUser);
    // Update logic here (e.g., API call)
  };

  const handleEdit = () => setIsEditable(true);
  const handleSave = () => {
    setIsEditable(false);
    handleUpdate();
  };

  const handleInterestToggle = (type, interest) => {
    const toggle = (current, setFunc) => {
      if (current.includes(interest)) {
        setFunc(current.filter((i) => i !== interest));
      } else {
        setFunc([...current, interest]);
      }
    };

    if (type === "academic") toggle(academicInterests, setAcademicInterests);
    else if (type === "social") toggle(socialInterests, setSocialInterests);
    else if (type === "career") toggle(careerInterests, setCareerInterests);
  };

  if (!user) {
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header user={user} handleLogout={onLogout} />
      <div className="profile-content">
        <h2>Settings</h2>
        <div className="profile-tabs">
          <button
            className={activeTab === "account" ? "active" : ""}
            onClick={() => setActiveTab("account")}
          >
            Account
          </button>
          <button
            className={activeTab === "preferences" ? "active" : ""}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </button>
        </div>

        {activeTab === "account" ? (
          <div className="account-tab">
            <div className="row">
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                  style={{
                    backgroundColor: isEditable ? "var(--light-orange)" : "white",
                  }}
                />
              </div>
              <div className="field">
                <label>Major</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                  style={{
                    backgroundColor: isEditable ? "var(--light-orange)" : "white",
                  }}
                />
              </div>
              <div className="field">
                <label>Year</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                  style={{
                    backgroundColor: isEditable ? "var(--light-orange)" : "white",
                  }}
                />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                  style={{
                    backgroundColor: isEditable ? "var(--light-orange)" : "white",
                  }}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                  style={{
                    backgroundColor: isEditable ? "var(--light-orange)" : "white",
                  }}
                />
              </div>
            </div>

            {!isEditable ? (
              <button onClick={handleEdit}>Edit</button>
            ) : (
              <button onClick={handleSave}>Save</button>
            )}
          </div>
        ) : (
          <div className="preferences-container">
            <div className="preferences-box">
              <h2 className="preferences-title">Update Your Preferences</h2>

              <h3 className="preferences-subtitle">Academic Interests</h3>
              <div className="preferences-interests-container">
                {academicCategories.map((interest) => (
                  <button
                    key={interest}
                    className={`preferences-interest-button academic ${
                      academicInterests.includes(interest) ? "selected" : ""
                    }`}
                    onClick={() => handleInterestToggle("academic", interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <h3 className="preferences-subtitle">Social Interests</h3>
              <div className="preferences-interests-container">
                {socialCategories.map((interest) => (
                  <button
                    key={interest}
                    className={`preferences-interest-button social ${
                      socialInterests.includes(interest) ? "selected" : ""
                    }`}
                    onClick={() => handleInterestToggle("social", interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <h3 className="preferences-subtitle">Career Interests</h3>
              <div className="preferences-interests-container">
                {careerCategories.map((interest) => (
                  <button
                    key={interest}
                    className={`preferences-interest-button career ${
                      careerInterests.includes(interest) ? "selected" : ""
                    }`}
                    onClick={() => handleInterestToggle("career", interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <button
                className="preferences-save-button"
                onClick={handleUpdate}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
