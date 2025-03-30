// src/components/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";

function Header({ user, handleLogout }) {
  const navigate = useNavigate();

  return (
    <header className="dashboard-header">
      {/* Logo and Search Bar Container */}
      <div className="header-content">
        <img src="/assets/logo.png" alt="Logo" className="logo" />
        {/* Search Bar */}
        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search events, people, or organizations"
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="nav-links">
        <button className="nav-button active">Discover</button>
        <button className="nav-button">Friends</button>
        <button className="nav-button">Saved</button>

        {user && (
          <button className="nav-button" onClick={() => navigate("/profile")}>
            Profile
          </button>
        )}
      </nav>

      {/* User info and logout */}
      {user && (
        <div className="user-section">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;

