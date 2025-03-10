import React, { useState, useEffect } from 'react';
import '../styles.css/Dashboard.css';

const Dashboard = () => {
  // Example categories and events
  const [categories, setCategories] = useState([
    { name: 'Athletics', eventsCount: 22 },
    { name: 'Career Fairs', eventsCount: 8 },
    { name: 'Arts', eventsCount: 10 },
    { name: 'Wellness', eventsCount: 12 },
    { name: 'Food', eventsCount: 16 },
    { name: 'Guidance', eventsCount: 14 },
    { name: 'Business', eventsCount: 8 },
    { name: 'Music', eventsCount: 22 }
  ]);


  const [trendingEvents, setTrendingEvents] = useState([
    { name: 'Women\'s Basketball', date: 'March 12, 2025', location: 'Sports Arena' },
    { name: 'COLA Research Fair', date: 'March 13, 2025', location: 'Main Hall' },
    { name: 'TPEO JavaScript Course', date: 'March 14, 2025', location: 'Room 101' },
    { name: 'Kupid Dating Show', date: 'March 15, 2025', location: 'Event Center' },
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
        <h2 className="trending-title">Trending Events</h2>
        <div className="events-list">
          {trendingEvents.slice(0, 4).map((event, index) => (
            <div key={index} className="event-card">
              <div className="event-number">{index + 1}</div>
              <div className="event-details">
                <p><strong>{event.name}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Category Section */}
      <section className="browse-categories">
      <h2 className="trending-title">Browse by Category</h2>
        <div className="categories-list">
          {categories.map((category, index) => (
             <button key={index} className="category-button">
             <span className="category-name">{category.name}</span>
             <span className="event-count">{category.eventsCount} Events</span>
           </button>
          ))}
        </div>
      </section>

      {/* Recommended Events Section */}
      <section className="recommended-events">
        <h2 className="trending-title">Recommended Events</h2>
        <div className="events-list">
          {recommendedEvents.map((event, index) => (
            <div key={index} className="event-card">
              <div className="event-details">
                <p><strong>{event.name}</strong></p>
                <p>{event.date}</p>
                <p>{event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
  );
};

export default Dashboard;
