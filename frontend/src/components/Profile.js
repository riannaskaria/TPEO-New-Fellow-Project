// Profile.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import Header from "./Header";
import "../styles/global.css";
import "../styles/Profile.css";
import { academicTags, socialTags, careerTags } from "../constants/categories";

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("account");
  const [formData, setFormData] = useState({});
  const [isEditable, setIsEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [academicInterests, setAcademicInterests] = useState([]);
  const [socialInterests, setSocialInterests] = useState([]);
  const [careerInterests, setCareerInterests] = useState([]);

  // Organizations state
  const [orgOptions, setOrgOptions] = useState([]);
  const [orgSearch, setOrgSearch] = useState("");
  const [selectedOrgs, setSelectedOrgs] = useState([]); // array of org IDs
  const [selectedOrgObjs, setSelectedOrgObjs] = useState([]); // array of org objects { _id, name }
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fileInputRef = useRef(null);
  const orgDropdownRef = useRef(null);
  const orgInputRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = "http://localhost:3001";

  // Fetch latest user data from backend on mount and when preferences are saved
  const fetchUser = async (userId) => {
    try {
      const res = await authService.fetchWithAuth(`${API_URL}/users/${userId}`);
      const json = await res.json();
      if (json.success) {
        setUser(json.data);

        // Set formData
        let majorsValue = "";
        if (json.data.majors) {
          if (Array.isArray(json.data.majors)) majorsValue = json.data.majors.join(", ");
          else {
            try {
              const parsed = JSON.parse(json.data.majors);
              majorsValue = Array.isArray(parsed) ? parsed.join(", ") : json.data.majors;
            } catch {
              majorsValue = json.data.majors;
            }
          }
        }
        setFormData({
          firstName: json.data.firstName || "",
          lastName: json.data.lastName || "",
          username: json.data.username || "",
          email: json.data.email || "",
          password: "",
          confirmPassword: "",
          majors: majorsValue,
          year: json.data.year || ""
        });

        // Set interests
        if (Array.isArray(json.data.interests)) {
          const a = [], s = [], c = [];
          json.data.interests.forEach(i => {
            if (academicTags.includes(i)) a.push(i);
            else if (socialTags.includes(i)) s.push(i);
            else if (careerTags.includes(i)) c.push(i);
          });
          setAcademicInterests(a);
          setSocialInterests(s);
          setCareerInterests(c);
        } else {
          setAcademicInterests([]);
          setSocialInterests([]);
          setCareerInterests([]);
        }

        // Set orgs (IDs)
        if (Array.isArray(json.data.orgs)) {
          setSelectedOrgs([...json.data.orgs]);
        } else {
          setSelectedOrgs([]);
        }
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      navigate("/login");
    }
  };

  // Fetch all org options (for dropdown)
  const fetchOrgOptions = async () => {
    try {
      const res = await authService.fetchWithAuth(`${API_URL}/orgs`);
      const json = await res.json();
      if (json.success) setOrgOptions(json.data);
    } catch (e) {
      console.error("Error loading orgs:", e);
    }
  };

  // Fetch org objects for selected org IDs
  const fetchSelectedOrgObjs = async (orgIds) => {
    if (!orgIds || orgIds.length === 0) {
      setSelectedOrgObjs([]);
      return;
    }
    try {
      // Fetch all orgs in parallel
      const orgFetches = orgIds.map(id =>
        authService.fetchWithAuth(`${API_URL}/orgs/${id}`)
          .then(res => res.json())
          .then(json => (json.success ? json.data : null))
          .catch(() => null)
      );
      const orgs = await Promise.all(orgFetches);
      setSelectedOrgObjs(orgs.filter(Boolean));
    } catch (err) {
      setSelectedOrgObjs([]);
    }
  };

  // Fetch user and orgs on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchUser(currentUser._id);
    // eslint-disable-next-line
  }, [navigate]);

  // Fetch org options when preferences tab is active
  useEffect(() => {
    if (activeTab === "preferences") {
      fetchOrgOptions();
    }
  }, [activeTab]);

  // Fetch org objects for tags whenever selectedOrgs changes
  useEffect(() => {
    if (selectedOrgs && selectedOrgs.length > 0) {
      fetchSelectedOrgObjs(selectedOrgs);
    } else {
      setSelectedOrgObjs([]);
    }
  }, [selectedOrgs]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event) => {
      if (
        orgDropdownRef.current &&
        !orgDropdownRef.current.contains(event.target) &&
        orgInputRef.current &&
        !orgInputRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditable(true);
    setIsEditingPreferences(true);
  };

  const handleProfilePicChange = e => {
    if (e.target.files?.[0]) {
      setNewProfilePic(e.target.files[0]);
      setProfilePicPreview(URL.createObjectURL(e.target.files[0]));
      setIsEditable(true);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleSaveAccount = async () => {
    setIsSaving(true);
    try {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        setIsSaving(false);
        return;
      }
      const majorsParsed = formData.majors
        .split(",")
        .map(m => m.trim())
        .filter(Boolean);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        majors: majorsParsed,
        year: parseInt(formData.year, 10)
      };
      if (formData.password) payload.password = formData.password;

      let response;
      if (newProfilePic) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (k === "majors") v.forEach(m => fd.append("majors", m));
          else fd.append(k, v);
        });
        fd.append("profilePicture", newProfilePic);
        response = await authService.fetchWithAuth(
          `${API_URL}/users/${user._id}`,
          { method: "PUT", body: fd }
        );
      } else {
        response = await authService.fetchWithAuth(
          `${API_URL}/users/${user._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );
      }

      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Update failed");
      setUser(json.data);
      setIsEditable(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInterestToggle = (type, interest) => {
    if (!isEditingPreferences) return;
    const toggle = (arr, setFn) =>
      arr.includes(interest) ? setFn(arr.filter(i => i !== interest)) : setFn([...arr, interest]);
    if (type === "academic") toggle(academicInterests, setAcademicInterests);
    if (type === "social") toggle(socialInterests, setSocialInterests);
    if (type === "career") toggle(careerInterests, setCareerInterests);
  };

  const handleOrgSearchChange = e => {
    setOrgSearch(e.target.value);
    setDropdownOpen(true);
  };

  const handleOrgSelect = org => {
    if (!isEditingPreferences) return;
    if (!selectedOrgs.includes(org._id)) {
      setSelectedOrgs(s => [...s, org._id]);
    }
    setOrgSearch("");
    setDropdownOpen(false);
  };

  const handleOrgRemove = id => {
    if (!isEditingPreferences) return;
    setSelectedOrgs(s => s.filter(o => o !== id));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const interests = [...academicInterests, ...socialInterests, ...careerInterests];
      const payload = { interests, orgs: selectedOrgs };
      const res = await authService.fetchWithAuth(
        `${API_URL}/users/${user._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Save failed");
      // Fetch latest user data from backend to update interests/orgs
      await fetchUser(user._id);
      setIsEditingPreferences(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <div className="profile-container"><p>Loading profile...</p></div>;

  return (
    <div className="profile-page">
      <Header user={user} handleLogout={onLogout} />
      <div className="profile-content">

        {/* Settings Header + Tabs */}
        <div className="settings-header">
          <h2>Settings</h2>
          <div className="tabs-wrapper">
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
        </div>

        {/* ACCOUNT TAB */}
        {activeTab === "account" ? (
          <div className="account-tab">
            <div className="profile-header">
              <div className="profile-picture-container">
                <div className="profile-picture-wrapper">
                  {newProfilePic || profilePicPreview ? (
                    <img src={profilePicPreview} alt="Preview" className="profile-picture" />
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
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditable}
                  />
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditable}
                  />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
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
                    value={formData.majors}
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
                    value={formData.year}
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
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditable}
                  />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
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
                    value={formData.confirmPassword}
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
                  onClick={handleSaveAccount}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
        ) : (

        /* PREFERENCES TAB */
        <div className="preferences-tab">
          <div className="preferences-container">

            <h3 className="preferences-subtitle">Academic Interests</h3>
            <div className="preferences-interests-container">
              {academicTags.map(tag => (
                <button
                  key={tag}
                  className={`preferences-interest-button academic ${academicInterests.includes(tag) ? "selected" : ""}`}
                  onClick={() => handleInterestToggle("academic", tag)}
                  type="button"
                >
                  {tag}
                  {academicInterests.includes(tag) && isEditingPreferences && (
                    <img
                      src="assets/cancel.svg"
                      alt="Remove"
                      className="tag-remove-icon"
                      onClick={e => {
                        e.stopPropagation();
                        handleInterestToggle("academic", tag);
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            <h3 className="preferences-subtitle">Social Interests</h3>
            <div className="preferences-interests-container">
              {socialTags.map(tag => (
                <button
                  key={tag}
                  className={`preferences-interest-button social ${socialInterests.includes(tag) ? "selected" : ""}`}
                  onClick={() => handleInterestToggle("social", tag)}
                  type="button"
                >
                  {tag}
                  {socialInterests.includes(tag) && isEditingPreferences && (
                    <img
                      src="assets/cancel.svg"
                      alt="Remove"
                      className="tag-remove-icon"
                      onClick={e => {
                        e.stopPropagation();
                        handleInterestToggle("social", tag);
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            <h3 className="preferences-subtitle">Career Interests</h3>
            <div className="preferences-interests-container">
              {careerTags.map(tag => (
                <button
                  key={tag}
                  className={`preferences-interest-button career ${careerInterests.includes(tag) ? "selected" : ""}`}
                  onClick={() => handleInterestToggle("career", tag)}
                  type="button"
                >
                  {tag}
                  {careerInterests.includes(tag) && isEditingPreferences && (
                    <img
                      src="assets/cancel.svg"
                      alt="Remove"
                      className="tag-remove-icon"
                      onClick={e => {
                        e.stopPropagation();
                        handleInterestToggle("career", tag);
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            <h3 className="preferences-subtitle">Organizations</h3>
            <div className="organizations-section" style={{ position: "relative" }}>
              <label className="org-label">Add Organization</label>
              <div className="org-search-bar-container">
                <img src="/assets/search.svg" alt="Search Icon" className="org-search-icon" />
                <input
                  type="text"
                  className="org-search-bar"
                  placeholder="Search organizations..."
                  value={orgSearch}
                  onChange={handleOrgSearchChange}
                  onFocus={() => setDropdownOpen(true)}
                  disabled={!isEditingPreferences}
                  ref={orgInputRef}
                  autoComplete="off"
                  style={{ marginBottom: 0 }}
                />
                {dropdownOpen && (
                  <div
                    className="org-dropdown"
                    ref={orgDropdownRef}
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      zIndex: 1000,
                      marginTop: 0 // Ensures dropdown is flush with the input
                    }}
                  >
                    {orgOptions
                      .filter(o =>
                        (!orgSearch || o.name.toLowerCase().includes(orgSearch.toLowerCase())) &&
                        !selectedOrgs.includes(o._id)
                      )
                      .map(o => (
                        <div
                          key={o._id}
                          className="org-option"
                          onClick={() => handleOrgSelect(o)}
                        >
                          {o.name}
                        </div>
                      ))}
                    {orgOptions.filter(o =>
                      (!orgSearch || o.name.toLowerCase().includes(orgSearch.toLowerCase())) &&
                      !selectedOrgs.includes(o._id)
                    ).length === 0 && (
                      <div className="org-option org-option-disabled">
                        No organizations found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="selected-orgs">
                {selectedOrgObjs.map(o => (
                  <button
                    key={o._id}
                    className="preferences-interest-button org selected"
                    onClick={() => isEditingPreferences && handleOrgRemove(o._id)}
                    disabled={!isEditingPreferences}
                    type="button"
                  >
                    {o.name}
                    {isEditingPreferences && (
                      <img src="assets/cancel.svg" alt="Remove" className="tag-remove-icon" />
                    )}
                  </button>
                ))}
              </div>
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
                  onClick={handleSavePreferences}
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
