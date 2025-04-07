// src/components/Header.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles.css/Header.css';

function Header({ user, handleLogout }) {
  const navigate = useNavigate();

  const [hoveredButton, setHoveredButton] = useState(null); // Track hover state

  const getIconSrc = (buttonName) => {
    const isActive = hoveredButton === buttonName || (buttonName === "discover" && window.location.pathname === "/dashboard");
    return isActive ? `/assets/orange-${buttonName}.svg` : `/assets/black-${buttonName}.svg`;
  };

  return (
    <header className="header">
      {/* Logo and Search Bar Container */}
      <div className="header-content">
        <img src="/assets/logo.svg" alt="Logo" className="logo" />
        {/* Search Bar */}
        <div className="search-bar-container">
          <img src="/assets/search.svg" alt="Search Icon" className="search-icon" />
          <input
            type="text"
            className="search-bar"
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="nav-links">
        <button
          className={`nav-button ${window.location.pathname === "/dashboard" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
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

          <button
          className={`nav-button ${window.location.pathname === "/profile" ? "active" : ""}`}
          onClick={() => navigate("/profile")}
           >
          <img src="/assets/profile.svg" alt="Profile Icon" className="nav-icon" />
        </button>
      </nav>

      {/* User info and logout */}

        <div className="user-section">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

    </header>
  );
}

export default Header;
