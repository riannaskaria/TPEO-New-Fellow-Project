// src/components/Header.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Header.css';

function Header({ user, handleLogout }) {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const getIconSrc = (buttonName) => {
    const isHovered = hoveredButton === buttonName;

    if (buttonName === "discover") {
      const isActive = window.location.pathname === "/explore";
      return isHovered || isActive
        ? `/assets/orange discover.svg`
        : `/assets/black-discover.svg`;
    }

    if (buttonName === "saved") {
      const isActive = window.location.pathname === "/saved";
      return isActive || isHovered
        ? `/assets/orange saved.svg`
        : `/assets/black save.svg`;
    }

    return `/assets/black-${buttonName}.svg`;
  };

  // Close the profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <img
          src="/assets/logo.svg"
          alt="Logo"
          className="logo"
          onClick={() => navigate("/dashboard")}
        />

        <div className="search-bar-container">
          <img src="/assets/search.svg" alt="Search Icon" className="search-icon" />
          <input type="text" className="search-bar" />
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-button ${window.location.pathname === "/explore" ? "active" : ""}`}
          onClick={() => navigate("/explore")}
          onMouseEnter={() => setHoveredButton("discover")}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <img src={getIconSrc("discover")} alt="Discover Icon" className="nav-icon" />
          Discover
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

        <div className="profile-menu-wrapper" ref={profileMenuRef}>
          <button
            className="nav-button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          >
            <img src="/assets/profile.svg" alt="Profile Icon" className="profile-icon" />
          </button>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <button onClick={() => navigate("/profile")}>Settings</button>
              <button onClick={() => alert("My Posts not yet implemented")}>My Posts</button>
              <button onClick={() => navigate("/add-event")}>Create Post</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
