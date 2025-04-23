import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import EventCard from "./EventCard";
import Header from "../Header";
import "../../styles/events/Explore.css";
import { academicTags, socialTags, careerTags } from '../../constants/categories';

function Explore({ onLogout }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Dropdown filters: each is an array of selected tags
  const [selectedAcademic, setSelectedAcademic] = useState([]);
  const [selectedSocial, setSelectedSocial] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState([]);

  // Dropdown open states
  const [academicOpen, setAcademicOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [careerOpen, setCareerOpen] = useState(false);

  const [categoryHeading, setCategoryHeading] = useState(null);

  const location = useLocation();
  const searchTerm = location.state?.searchTerm || "";

  // On mount: check for selectedCategories in location.state
  useEffect(() => {
    const selectedCategories = location.state?.selectedCategories;
    if (selectedCategories && Array.isArray(selectedCategories) && selectedCategories.length > 0) {
      // Set filters and heading based on incoming categories
      let academic = [];
      let social = [];
      let career = [];
      selectedCategories.forEach(cat => {
        if (cat.type === 'academic') academic.push(cat.name);
        if (cat.type === 'social') social.push(cat.name);
        if (cat.type === 'career') career.push(cat.name);
      });
      setSelectedAcademic(academic);
      setSelectedSocial(social);
      setSelectedCareer(career);
      setCategoryHeading(
        selectedCategories.length === 1
          ? `${selectedCategories[0].name} Events`
          : "Events"
      );
    } else {
      setCategoryHeading(null);
    }
    // eslint-disable-next-line
  }, [location.state]);

  // Global click handler to collapse any open dropdown when clicking outside
  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!event.target.closest('.dropdown')) {
        setAcademicOpen(false);
        setSocialOpen(false);
        setCareerOpen(false);
      }
    };
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  useEffect(() => {
    authService.fetchWithAuth(`${process.env.REACT_APP_BACKEND}/events`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Sort events by startTime (most recent first)
          const sortedEvents = data.data.sort(
            (a, b) => new Date(b.startTime) - new Date(a.startTime)
          );
          setEvents(sortedEvents);
          setFilteredEvents(sortedEvents);
        }
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  // Filter events based on selected categories (AND logic)
  useEffect(() => {
    const filterByCategories = (event) => {
      const eventCats = event.categories || [];
      const academicMatch = selectedAcademic.every(tag => eventCats.includes(tag));
      const socialMatch = selectedSocial.every(tag => eventCats.includes(tag));
      const careerMatch = selectedCareer.every(tag => eventCats.includes(tag));
      return academicMatch && socialMatch && careerMatch;
    };
    setFilteredEvents(events.filter(filterByCategories));
  }, [events, selectedAcademic, selectedSocial, selectedCareer]);

  // Search filtering logic
  const matchesSearch = (event, query) => {
    if (!query.trim()) return true;
    const queryWords = query.toLowerCase().split(/\s+/);
    const titleWords = (event.title || "").toLowerCase().split(/\s+/);
    const descriptionWords = (event.description || "").toLowerCase().split(/\s+/);
    const tagWords = event.categories ? event.categories.map(tag => tag.toLowerCase()) : [];
    return queryWords.some(qw =>
      titleWords.includes(qw) ||
      descriptionWords.includes(qw) ||
      tagWords.includes(qw)
    );
  };

  const searchFilteredEvents = searchTerm
    ? filteredEvents.filter(event => matchesSearch(event, searchTerm))
    : filteredEvents;

  // Split events into upcoming and past
  const now = new Date();
  const upcomingEvents = searchFilteredEvents
    .filter(event => new Date(event.startTime) > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const pastEvents = searchFilteredEvents
    .filter(event => new Date(event.startTime) <= now)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  // Toggle save handler for events
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
          console.log("Saved events updated");
        }
      })
      .catch((err) => console.error("Error updating saved events:", err));
  };

  return (
    <>
      <Header user={currentUser} handleLogout={handleLogout} />
      <div className="events-page">
        <h1>
          {categoryHeading
            ? categoryHeading
            : searchTerm
              ? `${searchFilteredEvents.length} results found with "${searchTerm}"`
              : "Events"}
        </h1>
        <div className="filters">
          <div className={`dropdown ${academicOpen ? 'expanded' : ''}`}>
            <h4
              onClick={(e) => {
                e.stopPropagation();
                setAcademicOpen(!academicOpen);
              }}
            >
              Academic {academicOpen ? "▲" : "▼"}
            </h4>
            {academicOpen && (
              <div className="dropdown-content">
                {academicTags.map((tag) => (
                  <label key={tag}>
                    <input
                      type="checkbox"
                      checked={selectedAcademic.includes(tag)}
                      onChange={() => setSelectedAcademic(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )}
                    />
                    {tag}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className={`dropdown ${socialOpen ? 'expanded' : ''}`}>
            <h4
              onClick={(e) => {
                e.stopPropagation();
                setSocialOpen(!socialOpen);
              }}
            >
              Social {socialOpen ? "▲" : "▼"}
            </h4>
            {socialOpen && (
              <div className="dropdown-content">
                {socialTags.map((tag) => (
                  <label key={tag}>
                    <input
                      type="checkbox"
                      checked={selectedSocial.includes(tag)}
                      onChange={() => setSelectedSocial(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )}
                    />
                    {tag}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className={`dropdown ${careerOpen ? 'expanded' : ''}`}>
            <h4
              onClick={(e) => {
                e.stopPropagation();
                setCareerOpen(!careerOpen);
              }}
            >
              Career {careerOpen ? "▲" : "▼"}
            </h4>
            {careerOpen && (
              <div className="dropdown-content">
                {careerTags.map((tag) => (
                  <label key={tag}>
                    <input
                      type="checkbox"
                      checked={selectedCareer.includes(tag)}
                      onChange={() => setSelectedCareer(prev =>
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )}
                    />
                    {tag}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        {upcomingEvents.length > 0 && (
          <div className="events-section">
            <h2>Upcoming Events</h2>
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  currentUser={currentUser}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </div>
        )}
        {pastEvents.length > 0 && (
          <div className="events-section">
            <h2>Past Events</h2>
            <div className="events-grid">
              {pastEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  currentUser={currentUser}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Explore;
