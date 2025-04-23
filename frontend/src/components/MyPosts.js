import React, { useState, useEffect } from 'react';
import Header from "./Header.js";
import EventCard from './events/EventCard';
import { authService } from '../services/authService';
import "../styles/Saved.css";

const MyPosts = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [groupedEvents, setGroupedEvents] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("upcoming");

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      fetchMyEvents(currentUser);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    groupEventsByDay(myEvents, viewMode);
  }, [myEvents, viewMode]);

  const fetchMyEvents = async (user) => {
    setIsLoading(true);
    try {
      const res = await authService.fetchWithAuth(`${process.env.REACT_APP_BACKEND}/events`);
      const data = await res.json();
      const createdEvents = data.data.filter(event => event.author === user._id);
      setMyEvents(createdEvents);
    } catch (error) {
      console.error("Error fetching your posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupEventsByDay = (events, mode) => {
    const now = new Date();
    const filteredEvents = events.filter(event =>
      mode === "upcoming"
        ? new Date(event.startTime) >= now
        : new Date(event.startTime) < now
    );

    const sortedEvents = filteredEvents.sort((a, b) =>
      new Date(a.startTime) - new Date(b.startTime)
    );

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const grouped = sortedEvents.reduce((acc, event) => {
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
    const day = date.getDate();
    const ordinal = getOrdinal(day);
    const month = monthNames[date.getMonth()];
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

    return {
      datePart: `${weekday}, ${month} ${day}${ordinal}`,
      timePart: time
    };
  };

  const renderEventGroups = () => {
    return Object.entries(groupedEvents).map(([dateKey, events]) => {
      let displayDate = dateKey;
      let dateString = "";
      let timeString = "";

      if (dateKey === "today") {
        displayDate = "Today";
      } else if (dateKey === "tomorrow") {
        displayDate = "Tomorrow";
      }

      if (events.length > 0) {
        const { datePart, timePart } = formatDateTime(new Date(events[0].startTime));
        dateString = datePart;
        timeString = timePart;
      }

      return (
        <div>
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
                onToggleSave={() => { }}
              />
            ))}
          </div>
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
        <div className="toggle-header">
          <h1 className="page-title">My Posts</h1>
          <div className="toggle-buttons">
            <button
              className={`toggle-btn ${viewMode === 'upcoming' ? 'active-toggle' : ''}`}
              onClick={() => setViewMode('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`toggle-btn ${viewMode === 'past' ? 'active-toggle' : ''}`}
              onClick={() => setViewMode('past')}
            >
              Past
            </button>
          </div>

        </div>

        {isLoading ? (
          <div className="saved-loading">Loading your created events...</div>
        ) : (
          <div className="saved-events-container">
          {Object.keys(groupedEvents).length > 0 ? (
         <>
           {renderEventGroups()}
           <div className="timeline-end-dot">
            <img src="/assets/dot.svg" alt="Timeline dot" />
           </div>
          </>
          ) : (
         <div className="no-events-message">
            {viewMode === "upcoming"
             ? "You haven’t posted any upcoming events yet."
              : "You haven’t posted any past events yet."}
          </div>
        )}
      </div>

        )}
      </div>
    </div>
  );
};

export default MyPosts;
