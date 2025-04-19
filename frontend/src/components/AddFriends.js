import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "./Header.js";
import { authService } from '../services/authService';
import '../styles/Friends.css';

const AddFriends = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = authService.getCurrentUser();
    if (!loggedInUser) {
      navigate('/login');
      return;
    }
    setCurrentUser(loggedInUser);

    // Fetch all users
    const fetchUsers = async () => {
      try {
        const response = await authService.fetchWithAuth('http://localhost:5000/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.data);
        } else {
          setError('Failed to load users. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // Filter users based on search term and exclude current user and already friends
  const filteredUsers = users.filter(user => {
    // Exclude current user
    if (user._id === currentUser?._id) return false;

    // Exclude already friends
    if (currentUser.friends && currentUser.friends.includes(user._id)) return false;

    // Check if user matches search term
    const matchesSearch =
      searchTerm === '' ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Check different friend statuses
  const checkFriendStatus = (user) => {
    if (!currentUser) return 'unknown';

    // Check if already friends
    if (currentUser.friends && currentUser.friends.includes(user._id)) {
      return 'friends';
    }

    // Check if user has sent a request to current user
    if (currentUser.friendRequests && currentUser.friendRequests.includes(user._id)) {
      return 'pending-approval';
    }

    // Check if current user has sent a request to this user
    if (user.friendRequests && user.friendRequests.includes(currentUser._id)) {
      return 'request-sent';
    }

    return 'not-friends';
  };

  // Send friend request
  const sendFriendRequest = async (userId) => {
    try {
      // Get the target user
      const userResponse = await authService.fetchWithAuth(`http://localhost:5000/users/${userId}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await userResponse.json();
      const user = userData.data;

      // Add current user's ID to the user's friendRequests array
      const updatedFriendRequests = [...(user.friendRequests || [])];
      if (!updatedFriendRequests.includes(currentUser._id)) {
        updatedFriendRequests.push(currentUser._id);
      }

      // Update the user object using the existing PUT route
      const updateResponse = await authService.fetchWithAuth(`http://localhost:5000/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendRequests: updatedFriendRequests })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to send friend request');
      }

      // Update the local state to reflect the change
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u._id === userId
            ? { ...u, friendRequests: updatedFriendRequests }
            : u
        )
      );
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError('Failed to send friend request. Please try again.');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleBackToFriends = () => {
    navigate('/friends');
  };

  return (
    <div className="add-friends-page">
      <Header user={currentUser} handleLogout={handleLogout} />
      <h1 className="friends-login-title">Add Friends</h1>

      <div className="friends-container">

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="users-layout-box">
            {/* Left panel: Add Friends */}
            <div className="left-panel">
              <h2 className="section-title">Add Friends</h2>
              <div className="friends-search-bar-container">
            <img src="/assets/search.svg" alt="Search Icon" className="friends-search-icon" />
            <input
                 type="text"
                className="friends-search-bar"
                 value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
              <div className="users-grid">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => {
                    const status = checkFriendStatus(user);
                    return (
                      <div key={user._id} className="user-card">
                        <div className="user-info">
                          <img
                            src={user.profilePicture ? `http://localhost:5000/users/image/${user.profilePicture}` : "/assets/default-profile.png"}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="user-avatar"
                          />
                          <div className="user-details">
                            <h3>{user.firstName} {user.lastName}</h3>
                          </div>
                        </div>
                        <div className="friend-status">
                          {status === 'friends' && (
                            <span className="badge friends">Friends</span>
                          )}
                          {(status === 'pending-approval' || status === 'request-sent') && (
                            <span className="badge pending">Pending</span>
                          )}
                          {status === 'not-friends' && (
                            <button
                              className="send-request-button"
                              onClick={() => sendFriendRequest(user._id)}
                            >
                              Send Request
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No users found</p>
                )}
              </div>
            </div>

            {/* Right panel: Suggested */}
            <div className="add-right-panel">
              <h3 className="section-title">Suggested</h3>
              <div className="suggested-list">
                {filteredUsers.slice(0, 6).map(user => {
                  const status = checkFriendStatus(user);
                  return (
                    <div key={user._id} className="suggested-user">
                      <div className="user-info">
                        <img
                          src={user.profilePicture ? `http://localhost:5000/users/image/${user.profilePicture}` : "/assets/default-profile.png"}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="user-avatar"
                        />
                        <span>{user.firstName} {user.lastName}</span>
                      </div>
                      {status === 'not-friends' && (
                        <button
                          className="send-request-button small"
                          onClick={() => sendFriendRequest(user._id)}
                        >
                          Send Request
                        </button>
                      )}
                      {status === 'request-sent' && (
                        <span className="badge pending small">Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

};

export default AddFriends;