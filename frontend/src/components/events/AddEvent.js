import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import PopUp from "./PopUp";
import { authService } from "../../services/authService";
import "../../styles/events/AddEvent.css";

function AddEvent() {
  // Initialize eventData with a categories array
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    organization: "",
    ticketInfo: "",
    image: null,
    categories: []
  });

  const [showModal, setShowModal] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  // Handle changes to the event title
  const handleTitleChange = (e) => {
    setEventData({ ...eventData, title: e.target.value });
  };

  // Handle image upload (storing the file in state)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventData({ ...eventData, image: file });
    }
  };

  const handleOpenModal = (modalType) => {
    setShowModal(modalType);
  };

  const handleCloseModal = () => {
    setShowModal(null);
  };

  // Modified to accept both field and value
  const handleSaveField = (field, value) => {
    if (field === "tags") {
      // Save the tags array into categories
      setEventData({ ...eventData, categories: value });
    } else {
      setEventData({ ...eventData, [field]: value });
    }
    handleCloseModal();
  };

  // Updated handleCreatePost: navigates to "/explore" when successful, no alert
  const handleCreatePost = async () => {
    try {
      const formData = new FormData();

      if (eventData.image) {
        formData.append("image", eventData.image);
      }
      
      formData.append("userId", authService.getCurrentUser()._id || "");
      formData.append("orgId", eventData.organization);
      formData.append("title", eventData.title);
      formData.append("date", eventData.date);
      formData.append("startTime", eventData.startTime);
      formData.append("endTime", eventData.endTime);
      formData.append("location", eventData.location);
      formData.append("description", eventData.description);
      formData.append("categories", JSON.stringify(eventData.categories));
      formData.append("ticketInfo", eventData.ticketInfo);

      const response = await authService.fetchWithAuth("http://localhost:5000/events", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      // Navigate to /explore on successful post creation
      navigate("/explore");
    } catch (error) {
      console.error(error);
      alert("Error creating event");
    }
  };

  return (
    <div className="add-event-container">
      <div className="form-container">
        {/* Title Section */}
        <div className="title-section">
          <input
            id="event-title"
            type="text"
            placeholder="Event Title"
            value={eventData.title}
            onChange={handleTitleChange}
            className="event-title-input"
          />
        </div>

        {/* Content Section: Left side (Image) & Right side (Buttons) */}
        <div className="content-section">
          <div className="left-section">
            <div className="image-section">
              <div className="image-placeholder">
                {eventData.image ? (
                  <img
                    src={URL.createObjectURL(eventData.image)}
                    alt="Preview"
                    className="image-preview"
                  />
                ) : (
                  <span className="no-image-text">Add Image</span>
                )}
              </div>
              <label className="image-upload-button">
                <img
                  src="/assets/add-event/image_icon.svg"
                  alt="Upload"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          <div className="right-section">
            <div className="top-buttons">
              <button
                onClick={() => handleOpenModal("date")}
                className="modal-button"
              >
                <img
                  src="/assets/add-event/calendar_icon.svg"
                  alt="Calendar Icon"
                  className="button-icon"
                />
                Add Date
              </button>
              <button
                onClick={() => handleOpenModal("startTime")}
                className="modal-button"
              >
                <img
                  src="/assets/add-event/clock_icon.svg"
                  alt="Clock Icon"
                  className="button-icon"
                />
                Start Time
              </button>
              <button
                onClick={() => handleOpenModal("endTime")}
                className="modal-button"
              >
                <img
                  src="/assets/add-event/clock_icon.svg"
                  alt="Clock Icon"
                  className="button-icon"
                />
                End Time
              </button>
            </div>

            <div className="bottom-buttons">
              <button
                onClick={() => handleOpenModal("location")}
                className="modal-button"
              >
                <img
                  src="/assets/add-event/location.svg"
                  alt="Location Icon"
                  className="button-icon"
                />
                Add Location
              </button>
              <button
                onClick={() => handleOpenModal("description")}
                className="modal-button"
              >
                <img
                  src="/assets/add-event/description.svg"
                  alt="Description Icon"
                  className="button-icon"
                />
                Add Description
              </button>
              <div className="optional-section">
                <p className="optional-text">Optional</p>
                <button
                  onClick={() => handleOpenModal("organization")}
                  className="modal-button"
                >
                  <img
                    src="/assets/add-event/organization.svg"
                    alt="Org Icon"
                    className="button-icon"
                  />
                  Add Organization or Club Affiliation
                </button>
                <button
                  onClick={() => handleOpenModal("ticketInfo")}
                  className="modal-button"
                >
                  <img
                    src="/assets/add-event/ticket.svg"
                    alt="Ticket Icon"
                    className="button-icon"
                  />
                  Add Ticket Information
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TAGS SECTION */}
        <div className="tags-section">
          <button className="tags-button" onClick={() => handleOpenModal("tags")}>
            Add Tags
            <img src="/assets/add-event/plus-circle.svg" alt="Tag Icon" className="button-icon" />
          </button>
          {eventData.categories.map((tag, index) => (
            <span key={index} className={`tag-badge ${getTagColorClass(tag)}`}>
              {tag}
            </span>
          ))}
        </div>

        {/* Create Post Button */}
        <div className="create-post-container">
          <button className="create-post-button" onClick={handleCreatePost}>
            Create Post
          </button>
        </div>
      </div>

      {/* Render modal */}
      {showModal && (
        <PopUp
          modalType={showModal}
          initialValue={eventData[showModal] || (showModal === "tags" ? eventData.categories : "")}
          onClose={handleCloseModal}
          onSave={(field, value) => handleSaveField(field, value)}
        />
      )}
    </div>
  );
}

// Helper function to assign tag color classes (use your own logic)
function getTagColorClass(tag) {
  const academicTags = [
    "Business", "Liberal Arts", "Natural Sciences", "Engineering", "Communications",
    "Geosciences", "Informatics", "Education", "Architecture", "Civic Leadership",
    "Fine Arts", "Nursing", "Pharmacy", "Public Affairs", "Social Work"
  ];
  const socialTags = ["Arts", "Entertainment", "Athletics", "Food"];
  const careerTags = ["Networking", "Career Fairs", "Info Sessions", "Employer Events", "Career Guidance"];

  if (academicTags.includes(tag)) return "academic";
  if (socialTags.includes(tag)) return "social";
  if (careerTags.includes(tag)) return "career";
  return "";
}

export default AddEvent;
