import React from 'react';

const EventCard = ({ event }) => {
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    if (isNaN(date)) return 'Invalid Date';

    const formattedDate = date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${formattedDate} • ${formattedTime}`;
  };

  return (
    <div className="event-card">
      <div className="event-details">
        <p><strong>{event.title}</strong></p>
        <p>{formatDateTime(event.startTime)}</p>
        <p>{event.friendsSaved} Friends Saved This Event</p>
        <div className="category-box">
          <span className="category-name">{event.category}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
