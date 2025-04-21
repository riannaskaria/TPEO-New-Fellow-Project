import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../Header";
import { authService } from "../../services/authService";
import "../../styles/events/ViewEvent.css";
import { academicTags, socialTags, careerTags } from "../../constants/categories";

function ViewEvent({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.savedEvents && event) {
      setIsSaved(currentUser.savedEvents.includes(event._id));
    }
  }, [currentUser, event]);

  if (!event) {
    // If no event is passed, redirect back to explore
    navigate("/explore");
    return null;
  }

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const handleSaveClick = async () => {
    if (!currentUser) return;
    const updatedSavedEvents = isSaved
      ? currentUser.savedEvents.filter((id) => id !== event._id)
      : [...(currentUser.savedEvents || []), event._id];

    try {
      const res = await authService.fetchWithAuth(
        `http://localhost:5000/users/${currentUser._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ savedEvents: updatedSavedEvents }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setIsSaved(!isSaved);
        setCurrentUser(data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
      }
    } catch (err) {
      console.error("Error updating saved events:", err);
    }
  };

  // NEW: Delete event handler
  const handleDeleteClick = async () => {
    if (!event || !event._id) return;
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    try {
      const res = await authService.fetchWithAuth(
        `http://localhost:5000/events/${event._id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        // Navigate back to previous page
        navigate(-1);
      } else {
        alert("Failed to delete event: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to delete event: " + err.message);
    }
  };

  // Helpers
  function formatDateTime(dateObj) {
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const monthName = dateObj.toLocaleDateString("en-US", { month: "long" });
    const day = dateObj.getDate();
    const ordinal = getOrdinal(day);
    const timeString = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${dayName}, ${monthName} ${day}${ordinal}, ${timeString}`;
  }
  function getOrdinal(n) {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }
  function getTagColorClass(tag) {
    if (academicTags.includes(tag)) return "academic";
    if (socialTags.includes(tag)) return "social";
    if (careerTags.includes(tag)) return "career";
    return "";
  }

  // Image URL
  const imageUrl = event.imageId
    ? `http://localhost:5000/events/image/${event.imageId}`
    : null;

  return (
    <>
      <Header user={currentUser} handleLogout={handleLogout} />
      <div className="view-event-container">
        <div className="view-event-content">
          {/* Top: Title & Save & Delete */}
          <div className="view-event-title-row">
            <h1 className="view-event-title">{event.title}</h1>
            <div className="view-event-action-buttons">
              <button className="view-save-btn" onClick={handleSaveClick}>
                {isSaved ? (
                  <img src="/assets/explore/save_solid.svg" alt="Saved" />
                ) : (
                  <img src="/assets/explore/save_outlined.svg" alt="Save" />
                )}
                <span className="save-btn-label">
                  {isSaved ? "Saved" : "Save Event"}
                </span>
              </button>
              <button className="view-delete-btn" onClick={handleDeleteClick}>
                <span className="delete-btn-label">Delete</span>
              </button>
            </div>
          </div>

          {/* Main Content: Left (Image) & Right (Details) */}
          <div className="view-event-main">
            <div className="view-event-left">
              <div className="view-event-image-section">
                {imageUrl ? (
                  <img
                    className="view-event-image"
                    src={imageUrl}
                    alt={event.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/placeholder-grey.png";
                    }}
                  />
                ) : (
                  <div className="view-image-placeholder" />
                )}
              </div>
            </div>
            <div className="view-event-right">
              <div className="view-event-detail-row">
                <img
                  src="/assets/add-event/calendar_icon.svg"
                  alt="Calendar Icon"
                  className="view-event-icon"
                />
                <span className="view-event-detail-text">
                  {formatDateTime(new Date(event.startTime))}
                </span>
              </div>
              <div className="view-event-detail-row">
                <img
                  src="/assets/add-event/location.svg"
                  alt="Location Icon"
                  className="view-event-icon"
                />
                <span className="view-event-detail-text">{event.location}</span>
              </div>
              <div className="view-event-section">
                <h3 className="view-event-subheading">Description</h3>
                <div className="view-event-description">{event.description}</div>
              </div>
              {event.ticketInfo && event.ticketInfo.trim() !== "" && (
                <div className="view-event-section">
                  <h3 className="view-event-subheading">Ticket Info</h3>
                  <div className="view-event-ticket">{event.ticketInfo}</div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="view-event-tags-section">
            {event.categories.map((tag, idx) => (
              <span
                key={idx}
                className={`view-event-tag-badge ${getTagColorClass(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewEvent;
