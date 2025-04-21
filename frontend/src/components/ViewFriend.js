import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import EventCard from "./events/EventCard";
import { authService } from "../services/authService";
import "../styles/ViewFriend.css";

function ViewFriend() {
  const location = useLocation();
  const navigate = useNavigate();
  const friend = location.state?.user;
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [mutualEvents, setMutualEvents] = useState([]);
  const [friendEvents, setFriendEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!friend) {
      navigate("/friends");
      return;
    }
    const fetchMutualEvents = async () => {
      try {
        // Get full event objects for both users' savedEvents
        const userEvents = currentUser?.savedEvents || [];
        const friendEventsArr = friend?.savedEvents || [];
        const mutualIds = userEvents.filter((id) => friendEventsArr.includes(id));
        const events = [];
        for (const eventId of mutualIds) {
          const res = await authService.fetchWithAuth(`http://localhost:3001/events/${eventId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.data) events.push(data.data);
          }
        }
        setMutualEvents(events);
      } catch (err) {
        setMutualEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMutualEvents();
  }, [friend, currentUser, navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (!friend) return null;

  // Profile picture
  const profilePicUrl = friend.profilePicture
    ? `http://localhost:5000/users/image/${friend.profilePicture}`
    : "/assets/profile.svg";

  // Major/year string
  const major = friend.majors?.length ? friend.majors[0] : "";
  const year = friend.year ? getYearString(friend.year) : "";
  const majorYear = [year, major].filter(Boolean).join(" ");

  function getYearString(yearNum) {
    switch (yearNum) {
      case 1: return "Freshman";
      case 2: return "Sophomore";
      case 3: return "Junior";
      case 4: return "Senior";
      default: return "";
    }
  }

  return (
    <>
      <Header user={currentUser} handleLogout={handleLogout} />
      <div className="view-friend-container">
        <div className="view-friend-profile-row">
          <img className="view-friend-avatar" src={profilePicUrl} alt="Profile" />
          <div className="view-friend-profile-info">
            <div className="view-friend-name-row">
              <span className="view-friend-name">
                {friend.firstName} {friend.lastName}
              </span>
              <span className="view-friend-friends-count">
                • {friend.friends?.length || 0} Friends
              </span>
            </div>
            <div className="view-friend-major">
              {majorYear}
            </div>
          </div>
        </div>
        <div className="view-friend-mutual-title">Mutual Events</div>
        <div className="view-friend-events-grid">
          {loading ? (
            <div className="view-friend-loading">Loading...</div>
          ) : mutualEvents.length === 0 ? (
            <div className="view-friend-no-events">No mutual events yet.</div>
          ) : (
            mutualEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                currentUser={currentUser}
                onToggleSave={() => {}} // No save in this context
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default ViewFriend;
