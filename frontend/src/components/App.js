import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import Saved from "./Saved";
import Dashboard from "./Dashboard";
import AddFriends from "./AddFriends";
import Friends from "./Friends";
import MyPosts from "./MyPosts";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import '../styles/global.css';
import AddEvent from "./events/AddEvent";
import Explore from "./events/Explore";
import ViewEvent from "./events/ViewEvent";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on page load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);
	
  // Create a logout function to be passed to Dashboard
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect to login if user is not authenticated */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

          <Route path="/register" element={<Register />} />

          <Route path="/login" element={
            isAuthenticated ?
              <Navigate to="/dashboard" /> :
              <Login setIsAuthenticated={setIsAuthenticated} />
          } />

					<Route path="/dashboard" element={
            isAuthenticated ?
              <Dashboard onLogout={handleLogout} /> :
              <Navigate to="/login" />
          } />

          <Route path="/add-event" element={
            isAuthenticated ?
              <AddEvent onLogout={handleLogout} /> :
              <Navigate to="/login" />
          } />

					<Route path="/explore" element={
            isAuthenticated ?
              <Explore onLogout={handleLogout} /> :
              <Navigate to="/login" />
          } />

					<Route path="/profile" element={
            isAuthenticated ?
              <Profile onLogout={handleLogout} /> :
              <Navigate to="/login" />
          } />

          <Route path="/saved" element={
            isAuthenticated ?
              <Saved onLogout={handleLogout} /> :
              <Navigate to="/login" />
          } />

          <Route path="/friends" element={
            isAuthenticated ?
              <Friends onLogout={handleLogout} /> :
              <Navigate to="/login" />
          } />

          <Route path="/add-friends" element={
            isAuthenticated ?
              <AddFriends onLogout={handleLogout} /> :
              <Navigate to="/login" />
          } />

          <Route path="/myposts" element={
            isAuthenticated ?
              <MyPosts onLogout={handleLogout} /> :
              <Navigate to="/login" />
          } />

					<Route path="/view-event" element={
            isAuthenticated ?
              <ViewEvent onLogout={handleLogout} /> :
              <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;