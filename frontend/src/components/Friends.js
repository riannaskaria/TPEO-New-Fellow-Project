import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "./Header.js";
import { authService } from '../services/authService';
import EventCard from './events/EventCard';
import '../styles/Friends.css';

const Friends = ({onLogout}) => {
  const [friends, setFriends] = useState([]);
  const [friendRequestsData, setFriendRequestsData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');
  const [friendEvents, setFriendEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = authService.getCurrentUser();
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    setCurrentUser(loggedInUser);

    const fetchFriends = async () => {
      try {
        const response = await authService.fetchWithAuth('http://localhost:5000/users');
        if (response.ok) {
          const data = await response.json();
          const allUsers = data.data;

          const friendsList = allUsers.filter(user =>
            loggedInUser.friends && loggedInUser.friends.includes(user._id)
          );

          const requestList = allUsers.filter(user =>
            loggedInUser.friendRequests && loggedInUser.friendRequests.includes(user._id)
          );

          setFriends(friendsList);
          setFriendRequestsData(requestList);
        } else {
          setError('Failed to load friends. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching friends:', err);
        setError('Failed to load friends. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [navigate]);

  const handleToggleSave = (eventId, newSavedState) => {
    const updatedSavedEvents = newSavedState
      ? [...(currentUser.savedEvents || []), eventId]
      : (currentUser.savedEvents || []).filter(id => id !== eventId);

    authService.fetchWithAuth(`http://localhost:5000/users/${currentUser._id}`, {
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

  const fetchFriendEvents = async () => {
    if (!currentUser || !currentUser.friends?.length) {
      setFriendEvents([]);
      return;
    }

    setEventsLoading(true);
    try {
      let allFriendEvents = [];

      for (const friendId of currentUser.friends) {
        const friendResponse = await authService.fetchWithAuth(`http://localhost:5000/users/${friendId}`);
        if (!friendResponse.ok) continue;

        const friendData = await friendResponse.json();
        const friend = friendData.data;

        if (friend.savedEvents?.length > 0) {
          for (const eventId of friend.savedEvents) {
            const eventResponse = await authService.fetchWithAuth(`http://localhost:5000/events/${eventId}`);
            if (!eventResponse.ok) continue;

            const eventData = await eventResponse.json();
            const event = eventData.data;

            allFriendEvents.push(event);
          }
        }
      }

      allFriendEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setFriendEvents(allFriendEvents);
    } catch (err) {
      console.error('Error fetching friend events:', err);
      setError('Failed to load friend events. Please try again later.');
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'events') {
      fetchFriendEvents();
    }
  }, [activeTab, currentUser?.friends]);

  const acceptFriendRequest = async (userId) => {
    try {
      const updatedFriends = [...(currentUser.friends || [])];
      if (!updatedFriends.includes(userId)) {
        updatedFriends.push(userId);
      }

      const updatedRequests = (currentUser.friendRequests || []).filter(id => id !== userId);

      const updateResponse = await authService.fetchWithAuth(`http://localhost:5000/users/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friends: updatedFriends,
          friendRequests: updatedRequests
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to accept friend request');
      }

      const updatedUserData = await updateResponse.json();
      setCurrentUser(updatedUserData.data);
      localStorage.setItem('user', JSON.stringify(updatedUserData.data));

      const otherUserResponse = await authService.fetchWithAuth(`http://localhost:5000/users/${userId}`);
      if (!otherUserResponse.ok) {
        throw new Error('Failed to fetch other user data');
      }

      const otherUserData = await otherUserResponse.json();
      const otherUser = otherUserData.data;

      const otherUserFriends = [...(otherUser.friends || [])];
      if (!otherUserFriends.includes(currentUser._id)) {
        otherUserFriends.push(currentUser._id);
      }

      await authService.fetchWithAuth(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friends: otherUserFriends })
      });

      const response = await authService.fetchWithAuth('http://localhost:5000/users');
      if (response.ok) {
        const data = await response.json();
        const updatedFriendsList = data.data.filter(user =>
          updatedFriends.includes(user._id)
        );
        setFriends(updatedFriendsList);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request. Please try again.');
    }
  };

  const declineFriendRequest = async (userId) => {
    try {
      const updatedRequests = (currentUser.friendRequests || []).filter(id => id !== userId);

      const updateResponse = await authService.fetchWithAuth(`http://localhost:5000/users/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendRequests: updatedRequests })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to decline friend request');
      }

      const updatedUserData = await updateResponse.json();
      setCurrentUser(updatedUserData.data);
      localStorage.setItem('user', JSON.stringify(updatedUserData.data));
    } catch (error) {
      console.error('Error declining friend request:', error);
      setError('Failed to decline friend request. Please try again.');
    }
  };

  // Remove friend handler
  const handleRemoveFriend = async (friendId) => {
    try {
      // Remove friendId from currentUser's friends
      const updatedCurrentUserFriends = (currentUser.friends || []).filter(id => id !== friendId);

      // Update current user in DB
      const updateCurrentUserRes = await authService.fetchWithAuth(
        `http://localhost:5000/users/${currentUser._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ friends: updatedCurrentUserFriends })
        }
      );
      if (!updateCurrentUserRes.ok) throw new Error('Failed to update current user');

      // Remove currentUser from friend's friends
      const friendRes = await authService.fetchWithAuth(`http://localhost:5000/users/${friendId}`);
      if (!friendRes.ok) throw new Error('Failed to fetch friend user');
      const friendData = await friendRes.json();
      const friendUser = friendData.data;
      const updatedFriendFriends = (friendUser.friends || []).filter(id => id !== currentUser._id);

      // Update friend user in DB
      const updateFriendRes = await authService.fetchWithAuth(
        `http://localhost:5000/users/${friendId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ friends: updatedFriendFriends })
        }
      );
      if (!updateFriendRes.ok) throw new Error('Failed to update friend user');

      // Update local state and localStorage
      const updatedCurrentUserData = await updateCurrentUserRes.json();
      setCurrentUser(updatedCurrentUserData.data);
      localStorage.setItem('user', JSON.stringify(updatedCurrentUserData.data));
      setFriends(prev => prev.filter(f => f._id !== friendId));
    } catch (error) {
      console.error('Error removing friend:', error);
      setError('Failed to remove friend. Please try again.');
    }
  };

  const handleTabChange = (tab) => setActiveTab(tab);
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };
  const handleAddNewFriends = () => navigate('/add-friends');

  return (
    <div className="friends-page">
      <Header user={currentUser} handleLogout={handleLogout} />
      <div className="friends-main-container">
        {/* Header section: Friends + count left, toggle buttons right */}
        <div className="friends-header-row">
          <div className="friends-header-left">
            <h1 className="friends-login-title">Friends</h1>
            <p className="friends-count">
              {activeTab === 'friends' ? `${friends.length} Friends` : 'Friend Events'}
            </p>
          </div>
          <div className="friends-header-right">
            <div className="friends-toggle-buttons">
              <button
                className={`friends-toggle-btn ${activeTab === 'friends' ? 'active-toggle' : ''}`}
                onClick={() => handleTabChange('friends')}
              >
                View Friends
              </button>
              <button
                className={`friends-toggle-btn ${activeTab === 'events' ? 'active-toggle' : ''}`}
                onClick={() => handleTabChange('events')}
              >
                Friend Events
              </button>
            </div>
          </div>
        </div>

        {/* Add Friend Button Row */}
        {activeTab === 'friends' && (
          <div className="add-friend-row">
            <button className="add-friends-button" onClick={handleAddNewFriends}>
              <span>+</span> Add New Friends
            </button>
          </div>
        )}

        {error && (
          <div className="error">{error}</div>
        )}

        {/* Friend Requests Section */}
        {activeTab === 'friends' && (
          <div className="friend-requests-section">
            <h2>Invitations ({friendRequestsData.length})</h2>
            <div className="friend-requests-list">
              {friendRequestsData.map(user => (
                <div key={user._id} className="request-card">
                  <div className="user-info">
                    <img
                      src={user.profilePicture ? `http://localhost:5000/users/image/${user.profilePicture}` : "/assets/profile.svg"}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <div className="friend-cards">{user.firstName} {user.lastName}</div>
                      <div className="friends-count">• {user.friends?.length || 0} Friends</div>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button
                      className="ignore-button"
                      onClick={() => declineFriendRequest(user._id)}
                    >
                      Ignore
                    </button>
                    <button
                      className="accept-button"
                      onClick={() => acceptFriendRequest(user._id)}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friend Cards Grid */}
        {activeTab === 'friends' && (
          <div className="friends-list">
            {friends.length > 0 ? (
              <div className="friend-grid">
                {friends.map(friend => (
                  <div
                    key={friend._id}
                    className="friend-card"
                  >
                    <div
                      className="friend-info"
                      onClick={() => navigate("/view-friend", { state: { user: friend } })}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={friend.profilePicture ? `http://localhost:5000/users/image/${friend.profilePicture}` : "/assets/profile.svg"}
                        alt={`${friend.firstName} ${friend.lastName}`}
                        className="friend-avatar"
                      />
                      <div className="friend-details">
                        <h3>{friend.firstName} {friend.lastName}</h3>
                      </div>
                    </div>
                    <button
                      className="remove-friend-btn"
                      onClick={() => handleRemoveFriend(friend._id)}
                      title="Remove Friend"
                    >
                      <img src="/assets/remove-friend.svg" alt="Remove Friend" className="remove-friend-icon" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-friends">You don't have any friends yet. Add some new friends!</p>
            )}
          </div>
        )}

        {/* Friend Events Grid */}
        {activeTab === 'events' && (
					<div className="friend-events-section">
						<div className="friend-events-grid">
							{friendEvents.map((event, index) => (
								<EventCard
									key={`${event._id}-${index}`}
									event={event}
									currentUser={currentUser}
									onToggleSave={handleToggleSave}
								/>
							))}
						</div>
					</div>
				)}
      </div>
    </div>
  );
};

export default Friends;
