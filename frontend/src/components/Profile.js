import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Avatar, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { authService } from '../services/authService';
import Header from './Header'; // Import Header component

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  if (!user) {
    return (
      <Container component="main" maxWidth="sm" className="profile-container">
        <Typography variant="h6">Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm" className="profile-container">
      {/* Header Component */}
      <Header user={user} handleLogout={onLogout} />
      <Box className="profile-box">
      <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onLogout}
            className="profile-logout-button"
          >
            Logout
          </Button>
        <Avatar className="profile-avatar">
          {user.username ? user.username.charAt(0).toUpperCase() : ''}
        </Avatar>
        <Typography variant="h4" className="profile-username">
          {user.username}
        </Typography>
        <Typography variant="body1" className="profile-email">
          Email: {user.email}
        </Typography>
        {user.majors && user.majors.length > 0 && (
          <Typography variant="body1" className="profile-majors">
            Majors: {user.majors.join(', ')}
          </Typography>
        )}
        {user.year && (
          <Typography variant="body1" className="profile-year">
            Year: {user.year}
          </Typography>
        )}
        {user.interests && user.interests.length > 0 && (
          <Box className="profile-interests">
            <Typography variant="h6">Interests:</Typography>
            <Typography variant="body1">{user.interests.join(', ')}</Typography>
          </Box>
        )}

        {/* Buttons for Dashboard and Logout */}
        <Box display="flex" gap={2} mt={2}>

        </Box>
      </Box>
    </Container>
  );
};

export default Profile;
