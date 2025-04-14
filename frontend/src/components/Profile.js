import React, { useState, useEffect, useRef } from "react";
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
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000";

  // Interest categories
  const academicCategories = [
    "Business",
    "Liberal Arts",
    "Natural Sciences",
    "Engineering",
    "Communications",
    "Geosciences",
    "Informatics",
    "Education",
    "Architecture",
    "Civic Leadership",
    "Fine Arts",
    "Nursing",
    "Pharmacy",
    "Public Affairs",
    "Social Work"
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

      // Convert the user's "majors" field to a comma-separated string for the input.
      let majorsValue = "";
      if (currentUser.majors) {
        if (Array.isArray(currentUser.majors)) {
          majorsValue = currentUser.majors.join(", ");
        } else if (typeof currentUser.majors === "string") {
          try {
            const parsed = JSON.parse(currentUser.majors);
            majorsValue = Array.isArray(parsed) ? parsed.join(", ") : currentUser.majors;
          } catch (error) {
            majorsValue = currentUser.majors;
          }
        }
      }

      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        password: "",
        confirmPassword: "",
        majors: majorsValue,
        year: currentUser.year || ""
      });

      // Split interests by category
      if (Array.isArray(currentUser.interests) && currentUser.interests.length > 0) {
        const academic = [];
        const social = [];
        const career = [];
        currentUser.interests.forEach((interest) => {
          if (academicCategories.includes(interest)) academic.push(interest);
          else if (socialCategories.includes(interest)) social.push(interest);
          else if (careerCategories.includes(interest)) career.push(interest);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setIsEditable(true);

  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
      setIsEditable(true);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Convert comma-delimited majors to an array, then update the profile
  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        setIsSaving(false);
        return;
      }
      const parsedMajors = formData.majors
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        majors: parsedMajors,
        year: parseInt(formData.year)
      };
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      const updatedUser = await updateProfile(updateData);

      setUser(updatedUser);

      // Convert updatedUser.majors back to a comma-separated string for display
      let majorsValue = "";
      if (updatedUser.majors) {
        if (Array.isArray(updatedUser.majors)) {
          majorsValue = updatedUser.majors.join(", ");
        } else if (typeof updatedUser.majors === "string") {
          try {
            const parsed = JSON.parse(updatedUser.majors);
            majorsValue = Array.isArray(parsed) ? parsed.join(", ") : updatedUser.majors;
          } catch (error) {
            // If it looks like a bracketed JSON array, parse it manually
            const trimmed = updatedUser.majors.trim();
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
              const withoutBrackets = trimmed.substring(1, trimmed.length - 1);
              const parts = withoutBrackets.split(",").map((s) =>
                s.replace(/(^")|("$)/g, "").trim()
              ).filter(Boolean);
              majorsValue = parts.join(", ");
            } else {
              majorsValue = updatedUser.majors;
            }
          }
        }
      }

      // Update local state after saving
      setFormData({
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        username: updatedUser.username || "",
        email: updatedUser.email || "",
        password: "",
        confirmPassword: "",
        majors: majorsValue,
        year: updatedUser.year || ""
      });

      // Reset image state
      setNewProfilePic(null);
      setProfilePicPreview(null);
      setIsEditable(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // If uploading a file, pass each major individually (instead of JSON-stringifying them all)
  // so that the backend sees multiple form fields named "majors".
  // This ensures you get an array of strings instead of a single string element.
  const updateProfile = async (updateData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser._id) {
        throw new Error("User ID not available");
      }

      let response;
      if (newProfilePic) {
        const formDataPayload = new FormData();
        formDataPayload.append("firstName", updateData.firstName);
        formDataPayload.append("lastName", updateData.lastName);
        formDataPayload.append("username", updateData.username);
        formDataPayload.append("email", updateData.email);

        // Instead of a single 'majors' field,
        // append each major in the array under the same field name "majors"
        // so the backend sees multiple fields => an array of strings
        updateData.majors.forEach((major) => {
          formDataPayload.append("majors", major);
        });

        formDataPayload.append("year", updateData.year);
        if (updateData.password && updateData.password.trim() !== "") {
          formDataPayload.append("password", updateData.password);
        }
        formDataPayload.append("profilePicture", newProfilePic);

        response = await authService.fetchWithAuth(
          `${API_URL}/users/${currentUser._id}`,
          {
            method: "PUT",
            body: formDataPayload
          }
        );
      } else {
        // No file upload => JSON approach
        response = await authService.fetchWithAuth(
          `${API_URL}/users/${currentUser._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
          }
        );
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to update profile");
      }
      const updatedUser = data.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const updatePreferences = async (interests) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser._id) {
        throw new Error("User ID not available");
      }
      const response = await authService.fetchWithAuth(
        `${API_URL}/users/${currentUser._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interests })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to update preferences");
      }
      const updatedUser = data.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
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
      const updatedUser = await updatePreferences(allInterests);
      setUser(updatedUser);
      setIsEditingPreferences(false);

      // Re-extract categories
      const academic = [];
      const social = [];
      const career = [];
      updatedUser.interests.forEach((interest) => {
        if (academicCategories.includes(interest)) academic.push(interest);
        else if (socialCategories.includes(interest)) social.push(interest);
        else if (careerCategories.includes(interest)) career.push(interest);
      });
      setAcademicInterests(academic);
      setSocialInterests(social);
      setCareerInterests(career);
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
        <div className="settings-header">
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
        </div>

        {activeTab === "account" ? (
          <div className="account-tab">
            <div className="profile-header">
              <div className="profile-picture-container">
                <div className="profile-picture-wrapper">
                  {newProfilePic || profilePicPreview ? (
                    <img
                      src={profilePicPreview}
                      alt="New Profile Preview"
                      className="profile-picture"
                    />
                  ) : user.profilePicture ? (
                    <img
                      src={`${API_URL}/users/image/${user.profilePicture}`}
                      alt="Profile"
                      className="profile-picture"
                    />
                  ) : (
                    <div className="empty-profile-picture">
                      <span className="placeholder-text">profile picture</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleProfilePicChange}
                />
                <button className="upload-photo-btn" onClick={handleUploadClick}>
                  +
                </button>
              </div>
              <div className="profile-info">
                <h3 className="profile-name">
                  {user.firstName} {user.lastName}
                </h3>
                <span className="profile-bullet">•</span>
                <p className="profile-friends">
                  {user.friends ? user.friends.length : 0} Friends
                </p>
              </div>
            </div>
            <h3 className="account-preferences-heading">Account Preferences</h3>
            <div className="account-preferences">
              <div className="row">
                <div className="field">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                  />
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                  />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                  />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label>Majors</label>
                  <input
                    type="text"
                    name="majors"
                    value={formData.majors || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    placeholder="Enter majors separated by commas"
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
                  />
                </div>
                <div className="field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    placeholder={isEditable ? "Confirm new password" : "••••••••"}
                  />
                </div>
              </div>

              {!isEditable ? (
                <button className="account-edit-button" onClick={handleEdit}>
                  Edit
                </button>
              ) : (
                <button
                  className="account-save-button"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="preferences-tab">
            <div className="preferences-container">
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

              <div className="preferences-header">
                {!isEditingPreferences ? (
                  <button
                    className="preferences-save-button"
                    onClick={() => setIsEditingPreferences(true)}
                  >
                    Edit Preferences
                  </button>
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
