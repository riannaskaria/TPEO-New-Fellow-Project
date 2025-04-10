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
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Interest categories
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

      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        password: "",
        major: currentUser.majors && currentUser.majors.length > 0 ? currentUser.majors[0] : "",
        year: currentUser.year || ""
      });

      if (currentUser.interests && currentUser.interests.length > 0) {
        const academic = [];
        const social = [];
        const career = [];

        currentUser.interests.forEach(interest => {
          if (academicCategories.includes(interest)) {
            academic.push(interest);
          } else if (socialCategories.includes(interest)) {
            social.push(interest);
          } else if (careerCategories.includes(interest)) {
            career.push(interest);
          }
        });

        setAcademicInterests(academic);
        setSocialInterests(social);
        setCareerInterests(career);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = () => setIsEditable(true);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updateData = {
        username: formData.username,
        email: formData.email,
        majors: [formData.major],
        year: parseInt(formData.year)
      };

      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      try {
        const updatedUser = await authService.updateProfile(updateData);
        setUser(updatedUser);
      } catch (apiError) {
        console.error("API update failed, falling back to local update:", apiError);
        const updatedUser = { ...user, ...updateData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      setIsEditable(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInterestToggle = (type, interest) => {
    if (!isEditingPreferences) return;
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

  const handleUpdatePreferences = async () => {
    try {
      setIsSaving(true);

      const allInterests = [
        ...academicInterests,
        ...socialInterests,
        ...careerInterests
      ];

      try {
        const updatedUser = await authService.updatePreferences(allInterests);
        setUser(updatedUser);
        setIsEditingPreferences(false);

        const academic = [];
        const social = [];
        const career = [];

        updatedUser.interests.forEach(interest => {
          if (academicCategories.includes(interest)) academic.push(interest);
          else if (socialCategories.includes(interest)) social.push(interest);
          else if (careerCategories.includes(interest)) career.push(interest);
        });

        setAcademicInterests(academic);
        setSocialInterests(social);
        setCareerInterests(career);
      } catch (apiError) {
        console.error("API update failed, falling back to local update:", apiError);

        const updatedUser = { ...user, interests: allInterests };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditingPreferences(false);
        const academic = [];
        const social = [];
        const career = [];

        allInterests.forEach(interest => {
          if (academicCategories.includes(interest)) academic.push(interest);
          else if (socialCategories.includes(interest)) social.push(interest);
          else if (careerCategories.includes(interest)) career.push(interest);
        });

        setAcademicInterests(academic);
        setSocialInterests(social);
        setCareerInterests(career);
      }
    } catch (err) {
      console.error("Error updating preferences:", err);
    } finally {
      setIsSaving(false);
    }
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
                  placeholder={isEditable ? "Enter new password" : "••••••••"}
                  style={{
                    backgroundColor: isEditable ? "var(--light-orange)" : "white",
                  }}
                />
              </div>
            </div>

            {!isEditable ? (
              <button onClick={handleEdit}>Edit</button>
            ) : (
              <button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
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

              <h3 className="preferences-subtitle">Organizations</h3>
              <div className="organization-search">
                <input
                  type="text"
                  placeholder="Search for organizations..."
                  className="org-search-input"
                />
              </div>

              <div className="user-organizations">
                {user.orgs && user.orgs.length > 0 ? (
                  user.orgs.map((org, index) => (
                    <div key={index} className="organization-item">
                      <span>{typeof org === 'object' ? org.name : org}</span>
                    </div>
                  ))
                ) : (
                  <p>No organizations joined yet</p>
                )}
              </div>

              <div className="preferences-header">
                    {!isEditingPreferences ? (
                    <button
                    className="preferences-save-button"
                    onClick={() => setIsEditingPreferences(true)}>Edit Preferences</button>
                    ) : (
                   <button
                      className="preferences-save-button"
                       onClick={handleUpdatePreferences}
                       disabled={isSaving}
                  >
                  {isSaving ? "Saving..." : "Save Preferences"}
                  </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
