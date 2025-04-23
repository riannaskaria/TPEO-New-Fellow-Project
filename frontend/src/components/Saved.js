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
    const refreshUser = async () => {
      const storedUser = authService.getCurrentUser();
      if (storedUser && storedUser._id) {
        try {
          const res = await authService.fetchWithAuth(`${process.env.REACT_APP_BACKEND}/users/${storedUser._id}`);
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

      const eventPromises = user.savedEvents.map(eventId =>
        authService.fetchWithAuth(`${process.env.REACT_APP_BACKEND}/events/${eventId}`)
          .then(res => res.json())
          .then(data => data.data)
          .catch(err => {
            console.error(`Error fetching event ${eventId}:`, err);
            return null;
          })
      );

      const fetchedEvents = await Promise.all(eventPromises);
      const validEvents = fetchedEvents.filter(event => event !== null);
      const now = new Date();
      const upcomingEvents = validEvents.filter(event => new Date(event.startTime) >= now);
      const sortedEvents = upcomingEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setSavedEvents(sortedEvents);
      groupEventsByDay(sortedEvents);
      fetchSimilarEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching saved events:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        const dateKey = formatDateKey(eventDate);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(event);
      }

      return acc;
    }, {});

    setGroupedEvents(grouped);
  };

  const formatDateKey = (date) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const ordinal = getOrdinal(day);

    return `${month} ${day}${ordinal}`;
  };

  const getOrdinal = (n) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

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
    const timePart = time;

    return { datePart, timePart };
  };

  const fetchSimilarEvents = async (events) => {
    try {
      const response = await authService.fetchWithAuth(`${process.env.REACT_APP_BACKEND}/events`);
      const allEvents = await response.json();
      if (!allEvents.data) return;

      const now = new Date();
      const upcomingEvents = allEvents.data.filter(event => new Date(event.startTime) >= now);
      const recommended = getRecommendedEvents(upcomingEvents, currentUser);
      const savedEventIds = new Set(currentUser.savedEvents);
      const notSavedEvents = recommended.filter(event => !savedEventIds.has(event._id));
      setSimilarEvents(notSavedEvents.slice(0, 3));
    } catch (error) {
      console.error("Error fetching similar events:", error);
    }
  };

  const handleToggleSave = (eventId, newSavedState) => {
    const updatedSavedEvents = newSavedState
      ? [...(currentUser.savedEvents || []), eventId]
      : (currentUser.savedEvents || []).filter(id => id !== eventId);

    authService.fetchWithAuth(`${process.env.REACT_APP_BACKEND}/users/${currentUser._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedEvents: updatedSavedEvents })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrentUser(data.data);
          localStorage.setItem("user", JSON.stringify(data.data));

          if (!newSavedState) {
            setSavedEvents(prev => prev.filter(event => event._id !== eventId));
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

  const renderEventGroups = () => {
    return Object.entries(groupedEvents).map(([dateKey, events], index) => {
      let displayDate = dateKey;
      let dateString = "";
      let timeString = "";

      if (dateKey === "today" || dateKey === "tomorrow") {
        displayDate = dateKey === "today" ? "Today" : "Tomorrow";
        if (events.length > 0) {
          const date = new Date(events[0].startTime);
          const { datePart, timePart } = formatDateTime(date);
          dateString = datePart;
          timeString = timePart;
        }
      } else if (events.length > 0) {
        const date = new Date(events[0].startTime);
        const { datePart, timePart } = formatDateTime(date);
        displayDate = datePart;
        dateString = datePart;
        timeString = timePart;
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
    if (onLogout) onLogout();
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
