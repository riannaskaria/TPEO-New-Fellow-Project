import React, { useState, useEffect } from 'react';
import '../styles.css/Dashboard.css';
import { authService } from '../services/authService'; // Import auth service

const Dashboard = ({ onLogout }) => {
  // State for user info
  const [user, setUser] = useState(null);

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
    { name: 'Demystifying Taxes Workshop', date: 'March 7, 2025', location: 'Event Center' },
  ]);

  const [recommendedEvents, setRecommendedEvents] = useState([
    {
      name: 'Women’s Basketball Game',
      date: 'Sunday, March 2nd',
      startTime: '3:00 PM',
      friendsSaved: 12,
      category: 'Athletics',
    },
    {
      name: 'Demystifying Taxes Workshop',
      date: 'Friday, March 7th',
      startTime: '12:00 PM',
      friendsSaved: 4,
      category: 'Guidance',
    },
    {
      name: 'COLA Research Fair',
      date: 'Wednesday, March 2nd',
      startTime: '3:00 PM',
      friendsSaved: 22,
      category: 'Career Fair',
    },
    {
      name: 'Demystifying Taxes Workshop',
      date: 'Friday, March 7th',
      startTime: '12:00 PM',
      friendsSaved: 4,
      category: 'Guidance',
    },
    {
      name: 'COLA Career Fair',
      date: 'Wednesday, March 2nd',
      startTime: '3:00 PM',
      friendsSaved: 22,
      category: 'Career Fair',
    },
  ]);


  useEffect(() => {
    // Get current user from localStorage (set during login)
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    const fetchData = async () => {
      try {

        const response = await authService.fetchWithAuth('http://localhost:3001/api/events');
        if (response.ok) {
          const data = await response.json();
          // can update state with the fetched data here
          // setTrendingEvents(data.trending);
          // setRecommendedEvents(data.recommended);
          // setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    // fetchData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout(); // Call the logout function from App.js
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        {/* Search Bar */}
        <div className="search-bar-container">

          <input
            type="text"
            className="search-bar"
            placeholder="Search events, people, or organizations"
          />
        </div>
        <nav className="nav-links">
          <button className="nav-button active">Discover</button>
          <button className="nav-button">Friends</button>
          <button className="nav-button">Saved</button>

          {/* User info and logout */}
          <div className="user-section">
            {user && (
              <>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Trending Events Section */}
        <section className="trending-events">
          <h2 className="trending-title">Trending Events</h2>
          <div className="events-list">
            {trendingEvents.map((event, index) => (
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
          <h2 className="recommended-title">For You</h2>
          <div className="events-list">
            {recommendedEvents.map((event, index) => (
              <div key={index} className="event-card">
                <div className="event-details">
                  {/* Event Name */}
                  <p><strong>{event.name}</strong></p>
                  {/* Date and Start Time */}
                  <p>{event.date} • {event.startTime}</p>
                  {/* Number of Friends Saved */}
                  <p>{event.friendsSaved} Friends Saved This Event</p>
                  {/* Category Box */}
                  <div className="category-box">
                    <span className="category-name">{event.category}</span>
                  </div>
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