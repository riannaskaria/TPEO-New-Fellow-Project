// src/components/Header.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Header.css';

function Header({ user, handleLogout }) {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Toggle the profile dropdown menu when clicking the profile picture.
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen((prev) => !prev);
  };

  // Navigation handlers for dropdown options.
  const handleSettings = () => {
    navigate("/profile");
    setProfileDropdownOpen(false);
  };

  const handleMyPosts = () => {
    navigate("/myposts");
    setProfileDropdownOpen(false);
  };

  const handleCreatePost = () => {
    navigate("/add-event");
    setProfileDropdownOpen(false);
  };

  const handleProfileLogout = () => {
    handleLogout();
    setProfileDropdownOpen(false);
  };

  // Icon mapping for each button.
  const iconMapping = {
    discover: { active: "orange_discover.svg", inactive: "black_discover.svg" },
    friends:  { active: "orange_friends.svg",  inactive: "black_friends.svg" },
    saved:    { active: "orange_save.svg",     inactive: "black_save.svg" }
  };

  // Helper function that returns the proper icon URL.
  const getIconSrc = (buttonName) => {
    const isActive =
      hoveredButton === buttonName ||
      (buttonName === "friends" && window.location.pathname === "/friends") ||
      (buttonName === "saved" && window.location.pathname === "/saved");
    return `/assets/${isActive ? iconMapping[buttonName].active : iconMapping[buttonName].inactive}`;
  };

  // Handle search input key down - navigate on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      navigate("/explore", { state: { searchTerm } });
    }
  };

  return (
    <header className="header">
      {/* Left: Logo and Search Bar */}
      <div className="header-left">
        <img src="/assets/logo.svg" alt="Buzz Logo" className="logo" />
        <div className="search-bar-container">
          <img src="/assets/search.svg" alt="Search Icon" className="search-icon" />
          <input
            type="text"
            className="search-bar"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
      </div>

      {/* Right: Navigation Buttons + Profile Picture with Dropdown */}
      <div className="header-right">
        <nav className="nav-links">
          {/* Discover button: no active class by default */}
          <button
            className="nav-button"
            onClick={() => navigate("/explore")}
            onMouseEnter={() => setHoveredButton("discover")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <img src={getIconSrc("discover")} alt="Discover Icon" className="nav-icon" />
            Discover
          </button>

          <button
            className={`nav-button ${window.location.pathname === "/friends" ? "active" : ""}`}
            onClick={() => navigate("/friends")}
            onMouseEnter={() => setHoveredButton("friends")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <img src={getIconSrc("friends")} alt="Friends Icon" className="nav-icon" />
            Friends
          </button>

          <button
            className={`nav-button ${window.location.pathname === "/saved" ? "active" : ""}`}
            onClick={() => navigate("/saved")}
            onMouseEnter={() => setHoveredButton("saved")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <img src={getIconSrc("saved")} alt="Saved Icon" className="nav-icon" />
            Saved
          </button>
        </nav>
        <div className="profile-section">
          <img
            src={user?.profilePic || "/assets/profile.svg"}
            alt="Profile"
            className="profile-pic"
            onClick={toggleProfileDropdown}
          />
          {profileDropdownOpen && (
            <div className="profile-dropdown">
              <button onClick={handleSettings}>Settings</button>
              <button onClick={handleMyPosts}>My Posts</button>
              <button onClick={handleCreatePost}>Create Post</button>
              <button onClick={handleProfileLogout}>Log Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
