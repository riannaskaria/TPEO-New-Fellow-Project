import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  // Example categories and events
  const [categories, setCategories] = useState([
    'Business', 'Liberal Arts', 'Natural Sciences', 'Engineering', 'Communications', 'Fine Arts', 'Geosciences', 'Informatics', 'Education'
  ]);

  const [trendingEvents, setTrendingEvents] = useState([
    { name: 'Apple Core OS: Private Cloud Compute Tech Talk', date: 'March 4, 2025', location: 'EER' },
    { name: 'Rise & Dine with Lockheed Martin', date: 'March 11, 2025', location: 'GDC Atrium' },

  ]);

  const [recommendedEvents, setRecommendedEvents] = useState([
    { name: 'Apple Core OS: Private Cloud Compute Tech Talk', date: 'March 4, 2025', location: 'EER' },
    // Additional events can be added here
  ]);

  useEffect(() => {
    // Fetch data from API or database as needed
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <nav className="nav-links">
          <button className="nav-button">Explore</button>
          <button className="nav-button">Friends</button>
          <button className="nav-button">Saved</button>
        </nav>
        <div className="profile-section">
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="profile-pic"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Trending Events Section */}
        <section className="trending-events">
          <h2>Trending Events</h2>
          <div className="events-list">
            {trendingEvents.map((event, index) => (
              <div key={index} className="event-card">
                <p><strong>{index + 1}. {event.name}</strong></p>
                <p>{event.date}</p>
                <p>{event.location}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Browse by Category Section */}
        <section className="browse-categories">
          <h2>Browse by Category</h2>
          <div className="categories-list">
            {categories.map((category, index) => (
              <button key={index} className="category-button">
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Recommended Events Section */}
        <section className="recommended-events">
          <h2>Recommended Events</h2>
          <div className="events-list">
            {recommendedEvents.map((event, index) => (
              <div key={index} className="event-card">
                <p><strong>{event.name}</strong></p>
                <p>{event.date}</p>
                <p>{event.location}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;