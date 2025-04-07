import React, { useState, useEffect } from 'react';
import '../styles.css/Dashboard.css';
import Header from "./Header.js";
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService'; // Import auth service

const Dashboard = ({ onLogout }) => {
  // State for user info
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([
    { name: 'Athletics', eventsCount: 22, icon: 'athletics.svg' },
    { name: 'Career Fairs', eventsCount: 8, icon: 'career-fairs.svg' },
    { name: 'Arts', eventsCount: 10, icon: 'arts.svg' },
    { name: 'Wellness', eventsCount: 12, icon: 'wellness.svg' },
    { name: 'Food', eventsCount: 16, icon: 'food.svg' },
    { name: 'Guidance', eventsCount: 14, icon: 'guidance.svg' },
    { name: 'Business', eventsCount: 8, icon: 'business.svg' },
    { name: 'Music', eventsCount: 22, icon: 'music.svg' }
  ]);
  const [trendingEvents, setTrendingEvents] = useState([
    { name: 'Women\'s Basketball', date: 'March 12, 2025', location: 'Sports Arena' },
    { name: 'COLA Research Fair', date: 'March 13, 2025', location: 'Main Hall' },
    { name: 'TPEO JavaScript Course', date: 'March 14, 2025', location: 'Room 101' },
    { name: 'Kupid Dating Show', date: 'March 15, 2025', location: 'Event Center' },
    { name: 'Demystifying Taxes Workshop', date: 'March 7, 2025', location: 'Event Center' },
  ]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage (set during login)
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);

      // Fetch all events without filtering
      const fetchAllEvents = async () => {
        try {
          const response = await authService.fetchWithAuth('http://localhost:3001/events'); // Fixed the URL
          if (response.ok) {
            const data = await response.json();
            setEvents(data.data); 
            setRecommendedEvents(data.data);
          }
        } catch (error) {
          console.error('Failed to fetch events:', error);
        }
      };

      fetchAllEvents();
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout(); // Call the logout function from App.js
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header Section */}
      <Header user={user} handleLogout={handleLogout} />
      <h1 className="login-title">WHAT’S THE BUZZ?</h1>
      <div className="trending-container">
      {/* Main Content */}
      <div className="main-content">
        {/* Trending Events Section */}
        <div className="trending-events-wrapper">
        <section className="trending-events">
          <h2 className="page-heading">Trending Events</h2>
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
        </div>
      </div>
      </div>
      <div className="dashboard-container">
        <div className="main-content">
        {/* Browse by Category Section */}

          <h2 className="page-heading">Browse by Category</h2>
          <div className="categories-list">
            {categories.map((category, index) => (
              <button key={index} className="category-button">
                <div className="category-header">
                  <img
                    src={`/assets/${category.icon}`}
                    alt={category.name}
                    className="category-icon"
                  />
                  <span className="category-name">{category.name}</span>
                </div>
                <span className="event-count">{category.eventsCount} Events</span>
              </button>
            ))}
          </div>

        {/* Recommended Events Section */}
          <h2 className="page-heading">For You</h2>
          <div className="events-list">
            {recommendedEvents.length === 0 ? (
              <p>No recommended events available at the moment.</p>
            ) : (
              recommendedEvents.map((event, index) => (
                <div key={index} className="event-card">
                  <div className="event-details">
                    <p><strong>{event.name}</strong></p>
                    <p>{event.date} • {event.startTime}</p>
                    <p>{event.friendsSaved} Friends Saved This Event</p>
                    <div className="category-box">
                      <span className="category-name">{event.category}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
      </div>
      </div>
      </div>
  );
};

export default Dashboard;
