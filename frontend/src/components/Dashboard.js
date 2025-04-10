import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import Header from "./Header.js";
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService'; // Import auth service
import EventCard from './events/EventCard';
import { getRecommendedEvents } from '../utils/getRecommendedEvents';


const Dashboard = ({ onLogout }) => {
  // State for user info
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([
    { name: 'Athletics', icon: 'athletics.svg' },
    { name: 'Career Fairs', icon: 'career-fairs.svg' },
    { name: 'Arts', icon: 'arts.svg' },
    { name: 'Wellness', icon: 'wellness.svg' },
    { name: 'Food', icon: 'food.svg' },
    { name: 'Guidance', icon: 'guidance.svg' },
    { name: 'Business', icon: 'business.svg' },
    { name: 'Music', icon: 'music.svg' }
  ]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);

      // Fetch all events
      const fetchEvents = async () => {
        try {
          const response = await authService.fetchWithAuth('http://localhost:3001/events');
          if (response.ok) {
            const data = await response.json();
            const allEvents = data.data;

            // Sort all events by start date (closest first)
            const sortedEvents = [...allEvents].sort((a, b) =>
              new Date(a.startTime) - new Date(b.startTime)
            );

            setEvents(sortedEvents);

            // Set trending events (if needed to be filtered can add later)
            setTrendingEvents(sortedEvents);

            // Filter recommended events based on user preferences
            setRecommendedEvents(getRecommendedEvents(sortedEvents, currentUser));

            // Update categories with event counts
            updateCategoryCounts(sortedEvents);
          }
        } catch (error) {
          console.error('Failed to fetch events:', error);
        }
      };

      fetchEvents();
    }
  }, []);

  // Calculate event counts for each category
  const updateCategoryCounts = (allEvents) => {
    if (!allEvents || allEvents.length === 0) return;

    const updatedCategories = categories.map(category => {
      // Count events that belong to this category
      const eventsCount = allEvents.filter(event =>
        event.categories && event.categories.includes(category.name)
      ).length;

      return { ...category, eventsCount };
    });

    setCategories(updatedCategories);
  };

  const handleToggleSave = (eventId, newSavedState) => {
    const updatedSavedEvents = newSavedState
      ? [...(currentUser.savedEvents || []), eventId]
      : (currentUser.savedEvents || []).filter(id => id !== eventId);

    authService.fetchWithAuth(`http://localhost:3001/users/${currentUser._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedEvents: updatedSavedEvents })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrentUser(data.data);
          localStorage.setItem("user", JSON.stringify(data.data));
          console.log("Saved events updated");
        }
      })
      .catch((err) => console.error("Error updating saved events:", err));
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Handle category selection - redirect to Explore page with category filter
  const handleCategorySelect = (categoryName) => {
    // Determine category type (academic, social, or career)
    const academicTags = [
      "Business", "Liberal Arts", "Natural Sciences", "Engineering", "Communications",
      "Geosciences", "Informatics", "Education", "Architecture", "Civic Leadership",
      "Fine Arts", "Nursing", "Pharmacy", "Public Affairs", "Social Work"
    ];

    const socialTags = ["Arts", "Entertainment", "Athletics", "Food"];

    const careerTags = ["Career Fairs", "Networking", "Info Sessions", "Employer Events", "Career Guidance"];

    // Save selected category and its type in localStorage
    localStorage.setItem('selectedCategory', JSON.stringify({
      name: categoryName,
      type: academicTags.includes(categoryName) ? 'academic' :
            socialTags.includes(categoryName) ? 'social' :
            careerTags.includes(categoryName) ? 'career' : null
    }));

    // Navigate to the Explore page
    navigate('/explore');
  };

  return (
    <div className="dashboard-page">
      <div className="orange-container">
        {/* Header Section */}
        <Header user={user} handleLogout={handleLogout} />
        <h1 className="login-title">WHAT'S THE BUZZ?</h1>
        {/* Main Content */}
        <div className="main-content">
          {/* Trending Events Section */}
          <div className="trending-events-wrapper">
            <section className="trending-events">
              <h2 className="page-heading">Trending Events</h2>
              <div className="events-list">
                {trendingEvents.length === 0 ? (
                  <p>No trending events available at the moment.</p>
                ) : (
                  trendingEvents.map((event, index) => (
                    <EventCard key={index} event={event} currentUser={user} onToggleSave={handleToggleSave}/>
                  ))
                )}
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
              <button
                key={index}
                className="category-button"
                onClick={() => handleCategorySelect(category.name)}
              >
                <div className="category-header">
                  <img
                    src={`/assets/${category.icon}`}
                    alt={category.name}
                    className="category-icon"
                  />
                  <span className="category-name">{category.name}</span>
                </div>
                <span className="event-count">{category.eventsCount || 0} Events</span>
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
                <EventCard key={index} event={event} currentUser={user} onToggleSave={handleToggleSave}/>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;