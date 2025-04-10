// src/components/Explore.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import EventCard from "./EventCard";
import Header from "../Header";
import "../../styles/events/Explore.css";
import { academicTags, socialTags, careerTags } from '../../constants/categories';

function Explore() {
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

  const navigate = useNavigate();
  const location = useLocation();
  // Obtain the search term passed from Header (if any)
  const searchTerm = location.state?.searchTerm || "";

  // Simple logout handler (adjust if needed)
  const handleLogout = () => {
    if (authService.logout) {
      authService.logout();
    }
    setCurrentUser(null);
    navigate("/login");
  };

  useEffect(() => {
    authService.fetchWithAuth("http://localhost:5000/events")
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

  // Additional filtering based on search query.
  // Matching logic: for each event, split its title and description by whitespace, and compare with each word in the query;
  // also check if any query word exactly matches any tag.
  const matchesSearch = (event, query) => {
    if (!query.trim()) return true;
    const queryWords = query.toLowerCase().split(/\s+/);
    const titleWords = (event.title || "").toLowerCase().split(/\s+/);
    const descriptionWords = (event.description || "").toLowerCase().split(/\s+/);
    const tagWords = event.categories ? event.categories.map(tag => tag.toLowerCase()) : [];
    // Return true if any query word is found in title, description, or tags.
    return queryWords.some(qw =>
      titleWords.includes(qw) ||
      descriptionWords.includes(qw) ||
      tagWords.includes(qw)
    );
  };

  // Filter events further based on search term (if any).
  const searchFilteredEvents = searchTerm
    ? filteredEvents.filter(event => matchesSearch(event, searchTerm))
    : filteredEvents;

  // Split the events into upcoming and past based on current time.
  const now = new Date();
  const upcomingEvents = searchFilteredEvents
    .filter(event => new Date(event.startTime) > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const pastEvents = searchFilteredEvents
    .filter(event => new Date(event.startTime) <= now)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  return (
    <>
      <Header user={currentUser} handleLogout={handleLogout} />
      <div className="events-page">
        <h1>
          {searchTerm
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
                  onToggleSave={(id, state) => {}}
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
                  onToggleSave={(id, state) => {}}
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