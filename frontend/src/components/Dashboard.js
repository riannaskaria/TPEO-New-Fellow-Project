import React, { useState, useEffect, useRef } from 'react';
import '../styles/Dashboard.css';
import Header from "./Header.js";
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import EventCard from './events/EventCard';
import { getRecommendedEvents } from '../utils/getRecommendedEvents';
import { academicTags, socialTags, careerTags } from '../constants/categories';

const SCROLL_AMOUNT = 900; // px per click, adjust as needed

const Dashboard = ({ onLogout }) => {
  // State for user info
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([
    { name: 'Athletics', icon: 'athletics.svg' },
    { name: 'Career Fairs', icon: 'career-fairs.svg' },
    { name: 'Visual Arts', icon: 'arts.svg' },
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

  // Trending events scroll refs and state
  const trendingListRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Category scroll refs and state
  const categoryListRef = useRef(null);
  const [canCatScrollLeft, setCanCatScrollLeft] = useState(false);
  const [canCatScrollRight, setCanCatScrollRight] = useState(false);

  // Fetch and refresh user data by ID on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedUser = authService.getCurrentUser();
      if (!storedUser || !storedUser._id) return;
      try {
        const response = await authService.fetchWithAuth(`tpeo-new-fellow-project.vercel.app/users/${storedUser._id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCurrentUser(data.data);
            setUser(data.data);
            localStorage.setItem('user', JSON.stringify(data.data));
          }
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch events after currentUser is up-to-date
  useEffect(() => {
    if (!currentUser) return;
    const fetchEvents = async () => {
      try {
        const response = await authService.fetchWithAuth('tpeo-new-fellow-project.vercel.app/events');
        if (response.ok) {
          const data = await response.json();
          const allEvents = data.data;

          // Sort all events by start date (closest first)
          const sortedEvents = [...allEvents].sort((a, b) =>
            new Date(a.startTime) - new Date(b.startTime)
          );

          // Filter only upcoming events for trending
          const upcomingEvents = sortedEvents.filter(event =>
            new Date(event.startTime) > new Date()
          );
          setTrendingEvents(upcomingEvents);

          // Filter recommended events based on user preferences
          setRecommendedEvents(getRecommendedEvents(upcomingEvents, currentUser));

          // Update categories with event counts
          updateCategoryCounts(sortedEvents);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    fetchEvents();
  }, [currentUser]);

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

    authService.fetchWithAuth(`tpeo-new-fellow-project.vercel.app/users/${currentUser._id}`, {
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
    let type = null;
    if (academicTags.includes(categoryName)) type = 'academic';
    else if (socialTags.includes(categoryName)) type = 'social';
    else if (careerTags.includes(categoryName)) type = 'career';

    navigate('/explore', {
      state: {
        selectedCategories: [{ name: categoryName, type }]
      }
    });
  };

  // Monitor scroll position for trending events arrows
  useEffect(() => {
    const checkScroll = () => {
      const el = trendingListRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    checkScroll();
    if (trendingListRef.current) {
      trendingListRef.current.addEventListener('scroll', checkScroll);
    }
    return () => {
      if (trendingListRef.current) {
        trendingListRef.current.removeEventListener('scroll', checkScroll);
      }
    };
  }, [trendingEvents]);

  const scrollTrending = (direction) => {
    const el = trendingListRef.current;
    if (!el) return;
    const scrollBy = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    el.scrollBy({ left: scrollBy, behavior: 'smooth' });
  };

  // Monitor scroll position for category arrows
  useEffect(() => {
    const checkCatScroll = () => {
      const el = categoryListRef.current;
      if (!el) return;
      setCanCatScrollLeft(el.scrollLeft > 0);
      setCanCatScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    checkCatScroll();
    if (categoryListRef.current) {
      categoryListRef.current.addEventListener('scroll', checkCatScroll);
    }
    return () => {
      if (categoryListRef.current) {
        categoryListRef.current.removeEventListener('scroll', checkCatScroll);
      }
    };
  }, [categories]);

  const scrollCategories = (direction) => {
    const el = categoryListRef.current;
    if (!el) return;
    const scrollBy = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    el.scrollBy({ left: scrollBy, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-page">
      <div className="orange-container">
        {/* Header Section */}
        <Header user={user} handleLogout={handleLogout} />
        <h1 className="dashboard-login-title">WHAT'S THE BUZZ?</h1>
        {/* Main Content */}
        <div className="main-content">
          {/* Trending Events Section */}
          <div className="trending-events-wrapper">
            <section className="trending-events">
              <div className="trending-events-header">
                <h2 className="page-heading">Trending Events</h2>
                <div className="trending-arrows">
                  <button
                    className="trending-arrow"
                    onClick={() => scrollTrending('left')}
                    disabled={!canScrollLeft}
                    aria-label="Scroll left"
                  >
                    &lt;
                  </button>
                  <button
                    className="trending-arrow"
                    onClick={() => scrollTrending('right')}
                    disabled={!canScrollRight}
                    aria-label="Scroll right"
                  >
                    &gt;
                  </button>
                </div>
              </div>
              <div className="events-list" ref={trendingListRef}>
                {trendingEvents.length === 0 ? (
                  <p>No trending events available at the moment.</p>
                ) : (
                  trendingEvents.map((event, index) => (
                    <EventCard
                      key={index}
                      event={event}
                      currentUser={user}
                      onToggleSave={handleToggleSave}
                    />
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
          <div className="trending-events-header" style={{ marginBottom: 0 }}>
            <h2 className="page-heading">Browse by Category</h2>
            <div className="trending-arrows">
              <button
                className="trending-arrow"
                onClick={() => scrollCategories('left')}
                disabled={!canCatScrollLeft}
                aria-label="Scroll categories left"
              >
                &lt;
              </button>
              <button
                className="trending-arrow"
                onClick={() => scrollCategories('right')}
                disabled={!canCatScrollRight}
                aria-label="Scroll categories right"
              >
                &gt;
              </button>
            </div>
          </div>
          <div className="categories-list" ref={categoryListRef}>
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
          <div className="events-list for-you-list">
            {recommendedEvents.length === 0 ? (
              <p>No recommended events available at the moment.</p>
            ) : (
              recommendedEvents.map((event, index) => (
                <EventCard
                  key={index}
                  event={event}
                  currentUser={user}
                  onToggleSave={handleToggleSave}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
