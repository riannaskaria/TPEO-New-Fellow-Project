import React, { useState, useEffect } from 'react';
import Header from "./Header.js";
import EventCard from './events/EventCard';
import { authService } from '../services/authService';
import "../styles/Saved.css";
import { getRecommendedEvents } from '../utils/getRecommendedEvents';

const Saved = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [savedEvents, setSavedEvents] = useState([]);
  const [groupedEvents, setGroupedEvents] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    // Fetch latest user by ID and update localStorage
    const refreshUser = async () => {
      const storedUser = authService.getCurrentUser();
      if (storedUser && storedUser._id) {
        try {
          const res = await authService.fetchWithAuth(`tpeo-new-fellow-project.vercel.app/users/${storedUser._id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              setUser(data.data);
              setCurrentUser(data.data);
              localStorage.setItem("user", JSON.stringify(data.data));
              fetchSavedEvents(data.data);
              return;
            }
          }
        } catch (err) {
          console.error("Error refreshing user:", err);
        }
      }
      setIsLoading(false);
    };
    refreshUser();
  }, []);

  const fetchSavedEvents = async (user) => {
    setIsLoading(true);
    try {
      if (!user.savedEvents || user.savedEvents.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch all the saved events
      const eventPromises = user.savedEvents.map(eventId =>
        authService.fetchWithAuth(`tpeo-new-fellow-project.vercel.app/events/${eventId}`)
          .then(res => res.json())
          .then(data => data.data)
          .catch(err => {
            console.error(`Error fetching event ${eventId}:`, err);
            return null;
          })
      );

      const fetchedEvents = await Promise.all(eventPromises);
      // Filter out any null events (failed fetches)
      const validEvents = fetchedEvents.filter(event => event !== null);

      // Filter out past events
      const now = new Date();
      const upcomingEvents = validEvents.filter(event => new Date(event.startTime) >= now);

      // Sort events by date
      const sortedEvents = upcomingEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setSavedEvents(sortedEvents);

      // Group events by day
      groupEventsByDay(sortedEvents);

      // Fetch similar events
      fetchSimilarEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching saved events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group events by today, tomorrow, and future dates
  const groupEventsByDay = (events) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const grouped = events.reduce((acc, event) => {
      const eventDate = new Date(event.startTime);
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

      if (eventDay.getTime() === today.getTime()) {
        if (!acc.today) acc.today = [];
        acc.today.push(event);
      } else if (eventDay.getTime() === tomorrow.getTime()) {
        if (!acc.tomorrow) acc.tomorrow = [];
        acc.tomorrow.push(event);
      } else {
        // Format date like "March 12th"
        const dateKey = formatDateKey(eventDate);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(event);
      }

      return acc;
    }, {});

    setGroupedEvents(grouped);
  };

  // Format date for keys (e.g., "March 12th")
  const formatDateKey = (date) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const ordinal = getOrdinal(day);

    return `${month} ${day}${ordinal}`;
  };

  // Get ordinal suffix (st, nd, rd, th)
  const getOrdinal = (n) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  // Format weekday and time (e.g., "Monday, March 3rd • 3:00 PM")
  const formatDateTime = (dateObj) => {
    const day = dateObj.getDate();
    const ordinal = getOrdinal(day);
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const month = dateObj.toLocaleDateString("en-US", { month: "long" });
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const datePart = `${weekday}, ${month} ${day}${ordinal}`;
    const timePart = time; // e.g., 3:00 PM

    return { datePart, timePart };
  };

  // Fetch similar events based on user's interests
  const fetchSimilarEvents = async (events) => {
    try {
      // Fetch all events to get potential similar ones
      const response = await authService.fetchWithAuth('tpeo-new-fellow-project.vercel.app/events');
      const allEvents = await response.json();
      if (!allEvents.data) return;

      // Filter out past events
      const now = new Date();
      const upcomingEvents = allEvents.data.filter(event => new Date(event.startTime) >= now);

      // Use getRecommendedEvents to get recommended events based on the user's interests
      const recommended = getRecommendedEvents(upcomingEvents, currentUser);

      // Filter out events that are already saved by the current user
      const savedEventIds = new Set(currentUser.savedEvents);
      const notSavedEvents = recommended.filter(event => !savedEventIds.has(event._id));

      // Get top 3 recommended events that are not saved
      setSimilarEvents(notSavedEvents.slice(0, 3));
    } catch (error) {
      console.error("Error fetching similar events:", error);
    }
  };

  // Handle toggling saved state of an event
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
          // Update current user
          setCurrentUser(data.data);
          localStorage.setItem("user", JSON.stringify(data.data));

          // If removing from saved, update the UI
          if (!newSavedState) {
            setSavedEvents(prev => prev.filter(event => event._id !== eventId));

            // Update grouped events
            setGroupedEvents(prev => {
              const updated = { ...prev };
              for (const key in updated) {
                updated[key] = updated[key].filter(event => event._id !== eventId);
                if (updated[key].length === 0) {
                  delete updated[key];
                }
              }
              return updated;
            });
          }
        }
      })
      .catch((err) => console.error("Error updating saved events:", err));
  };

  // Render timeline and events
  const renderEventGroups = () => {
    return Object.entries(groupedEvents).map(([dateKey, events], index) => {
      // Handle special cases for "today" and "tomorrow"
      let displayDate = dateKey;
      let dateString = "";
      let timeString = "";

      if (dateKey === "today") {
        displayDate = "Today";
        if (events.length > 0) {
          const date = new Date(events[0].startTime);
          const { datePart, timePart } = formatDateTime(date);
          dateString = datePart;
          timeString = timePart;
        }
      } else if (dateKey === "tomorrow") {
        displayDate = "Tomorrow";
        if (events.length > 0) {
          const date = new Date(events[0].startTime);
          const { datePart, timePart } = formatDateTime(date);
          dateString = datePart;
          timeString = timePart;
        }
      } else {
        // For future dates, show full date and time
        if (events.length > 0) {
          const date = new Date(events[0].startTime);
          const { datePart, timePart } = formatDateTime(date);
          displayDate = datePart; // Full date (e.g., March 12th)
          dateString = displayDate;
          timeString = timePart; // Time (e.g., 3:00 PM)
        }
      }

      return (
        <div key={dateKey} className="timeline-section">
          <div className="timeline-header">
            <div className="timeline-dot">
              <img src="/assets/dot.svg" alt="Timeline dot" />
            </div>
            <div className="timeline-date">
              <h3>{displayDate}</h3>
              <p>{dateString} {timeString && `• ${timeString}`}</p>
            </div>
          </div>
          <div className="timeline-line">
            <img src="/assets/vertical.svg" alt="Timeline line" />
          </div>
          <div className="timeline-events">
            {events.map(event => (
              <EventCard
                key={event._id}
                event={event}
                currentUser={user}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        </div>
      );
    });
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="saved-page">
      <Header user={user} handleLogout={handleLogout} />
      <div className="saved-content">
        <h1 className="page-title">Saved</h1>

        {isLoading ? (
          <div className="saved-loading">Loading your saved events...</div>
        ) : (
          <div className="saved-events-container">
            {Object.keys(groupedEvents).length > 0 ? (
              <div className="saved-events-wrapper">
                <div className="timeline-container">
                  {renderEventGroups()}
                  <img src="/assets/dot.svg" alt="Timeline dot" />
                </div>

                {/* Similar Events Box */}
                <div className="similar-events-box">
                  <h2>Similar Events</h2>
                  <div className="similar-events-grid">
                    {similarEvents.map(event => (
                      <div key={event._id} className="similar-event-card">
                        <EventCard
                          event={event}
                          currentUser={currentUser}
                          onToggleSave={handleToggleSave}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-saved-events">
                <p>You haven't saved any events yet.</p>
                <a href="/explore" className="discover-link">Discover events</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
