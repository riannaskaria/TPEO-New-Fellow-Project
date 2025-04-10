import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import EventCard from "./EventCard";
import "../../styles/events/Explore.css";
import Header from "../Header.js";

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

  // Categories for dropdowns
  const academicTags = [
    "Business", "Liberal Arts", "Natural Sciences", "Engineering", "Communications",
    "Geosciences", "Informatics", "Education", "Architecture", "Civic Leadership",
    "Fine Arts", "Nursing", "Pharmacy", "Public Affairs", "Social Work"
  ];
  const socialTags = ["Arts", "Entertainment", "Athletics", "Food"];
  const careerTags = ["Networking", "Career Fairs", "Info Sessions", "Employer Events", "Career Guidance"];

  useEffect(() => {
    // Get the selected category from localStorage
    const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory'));
    if (selectedCategory) {
      const { name, type } = selectedCategory;
      // Update state to filter events by the selected category
      if (type === 'academic') {
        setSelectedAcademic([name]);
      } else if (type === 'social') {
        setSelectedSocial([name]);
      } else if (type === 'career') {
        setSelectedCareer([name]);
      }
    }
    authService.fetchWithAuth("http://localhost:3001/events")
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

  // Toggle saved state on event card and update the user state
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

  // Handlers for dropdown filters (simple multi-select checkboxes)
  const handleAcademicChange = (tag) => {
    setSelectedAcademic(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  const handleSocialChange = (tag) => {
    setSelectedSocial(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  const handleCareerChange = (tag) => {
    setSelectedCareer(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Collapse all dropdowns when clicking outside any dropdown element
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown')) {
        setAcademicOpen(false);
        setSocialOpen(false);
        setCareerOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="events-page">
      <Header/>
      <h1>Events</h1>
      <div className="filters">
				<div className={`dropdown ${academicOpen ? 'expanded' : ''}`}>
					<h4 onClick={(e) => { e.stopPropagation(); setAcademicOpen(!academicOpen); }}>
						Academic {academicOpen ? "▲" : "▼"}
					</h4>
					{academicOpen && (
						<div className="dropdown-content">
							{academicTags.map((tag) => (
								<label key={tag}>
									<input
										type="checkbox"
										checked={selectedAcademic.includes(tag)}
										onChange={() => handleAcademicChange(tag)}
									/>
									{tag}
								</label>
							))}
						</div>
					)}
				</div>
				<div className={`dropdown ${socialOpen ? 'expanded' : ''}`}>
					<h4 onClick={(e) => { e.stopPropagation(); setSocialOpen(!socialOpen); }}>
						Social {socialOpen ? "▲" : "▼"}
					</h4>
					{socialOpen && (
						<div className="dropdown-content">
							{socialTags.map((tag) => (
								<label key={tag}>
									<input
										type="checkbox"
										checked={selectedSocial.includes(tag)}
										onChange={() => handleSocialChange(tag)}
									/>
									{tag}
								</label>
							))}
						</div>
					)}
				</div>
				<div className={`dropdown ${careerOpen ? 'expanded' : ''}`}>
					<h4 onClick={(e) => { e.stopPropagation(); setCareerOpen(!careerOpen); }}>
						Career {careerOpen ? "▲" : "▼"}
					</h4>
					{careerOpen && (
						<div className="dropdown-content">
							{careerTags.map((tag) => (
								<label key={tag}>
									<input
										type="checkbox"
										checked={selectedCareer.includes(tag)}
										onChange={() => handleCareerChange(tag)}
									/>
									{tag}
								</label>
							))}
						</div>
					)}
				</div>
			</div>
      <div className="events-grid">
        {filteredEvents.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            currentUser={currentUser}
            onToggleSave={handleToggleSave}
          />
        ))}
      </div>
    </div>
  );
}

export default Explore;
