import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService"; // Import your authService
import "../../styles/events/PopUp.css";

function PopUp({ modalType, initialValue, onClose, onSave }) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [selectedTags, setSelectedTags] = useState([]);
  const [orgs, setOrgs] = useState([]);

  // For non-tags fields, use inputValue; for tags, use selectedTags
  useEffect(() => {
    if (modalType === "tags") {
      setSelectedTags(Array.isArray(initialValue) ? initialValue : []);
    } else {
      setInputValue(initialValue);
    }
  }, [initialValue, modalType]);

  // For organization modal, fetch organizations using authService.fetchWithAuth
  useEffect(() => {
    if (modalType === "organization") {
      authService.fetchWithAuth("http://localhost:5000/orgs")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrgs(data.data);
          } else {
            console.error("Error fetching organizations:", data.message);
          }
        })
        .catch((err) =>
          console.error("Error fetching organizations:", err)
        );
    }
  }, [modalType]);

  // For tags modal, define categories and toggle logic
  const academicCategories = [
    "Business", "Liberal Arts", "Natural Sciences", "Engineering", "Communications",
    "Geosciences", "Informatics", "Education", "Architecture", "Civic Leadership",
    "Fine Arts", "Nursing", "Pharmacy", "Public Affairs", "Social Work"
  ];
  const socialCategories = ["Arts", "Entertainment", "Athletics", "Food"];
  const careerCategories = ["Networking", "Career Fairs", "Info Sessions", "Employer Events", "Career Guidance"];

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  let inputField;
  switch (modalType) {
    case "date":
      inputField = (
        <input
          type="date"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      );
      break;
    case "startTime":
    case "endTime":
      inputField = (
        <input
          type="time"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      );
      break;
    case "description":
      inputField = (
        <textarea
          rows="4"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      );
      break;
    case "organization":
      inputField = (
        <select
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        >
          <option value="">Select Organization</option>
          {orgs.map((org) => (
            <option key={org._id} value={org._id}>
              {org.name}
            </option>
          ))}
        </select>
      );
      break;
    case "tags":
      inputField = (
        <div className="tags-modal-container">
          <h4>Academic</h4>
          <div className="tags-row">
            {academicCategories.map((cat) => (
              <button
                key={cat}
                className={`tag-button ${selectedTags.includes(cat) ? "selected academic" : ""}`}
                onClick={() => handleTagToggle(cat)}
              >
                <span>{cat}</span>
                <img 
                  src="/assets/add-event/plus-circle.svg" 
                  alt="Plus Icon" 
                  className="tag-plus-icon" 
                />
              </button>
            ))}
          </div>
          <h4>Social</h4>
          <div className="tags-row">
            {socialCategories.map((cat) => (
              <button
                key={cat}
                className={`tag-button ${selectedTags.includes(cat) ? "selected social" : ""}`}
                onClick={() => handleTagToggle(cat)}
              >
                <span>{cat}</span>
                <img 
                  src="/assets/add-event/plus-circle.svg" 
                  alt="Plus Icon" 
                  className="tag-plus-icon" 
                />
              </button>
            ))}
          </div>
          <h4>Career</h4>
          <div className="tags-row">
            {careerCategories.map((cat) => (
              <button
                key={cat}
                className={`tag-button ${selectedTags.includes(cat) ? "selected career" : ""}`}
                onClick={() => handleTagToggle(cat)}
              >
                <span>{cat}</span>
                <img 
                  src="/assets/add-event/plus-circle.svg" 
                  alt="Plus Icon" 
                  className="tag-plus-icon" 
                />
              </button>
            ))}
          </div>
        </div>
      );
      break;
    case "ticketInfo":
      inputField = (
        <textarea
          rows="4"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      );
      break;
    default:
      inputField = (
        <input
          type="text"
          placeholder={`Enter ${modalType}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      );
      break;
  }

  let title;
  switch (modalType) {
    case "date":
      title = "Add Date";
      break;
    case "startTime":
      title = "Add Start Time";
      break;
    case "endTime":
      title = "Add End Time";
      break;
    case "location":
      title = "Add Location";
      break;
    case "description":
      title = "Add Description";
      break;
    case "organization":
      title = "Add Organization or Club Affiliation";
      break;
    case "ticketInfo":
      title = "Add Ticket Information";
      break;
    case "tags":
      title = "Add Tags";
      break;
    default:
      title = "Add";
      break;
  }

  const handleSave = () => {
    if (modalType === "tags") {
      onSave("tags", selectedTags);
    } else {
      onSave(modalType, inputValue);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${modalType === "tags" ? "modal-content-tags" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        {inputField}
        <div className="modal-buttons">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopUp;
