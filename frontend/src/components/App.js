import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Login";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import '../styles.css/App.css';

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

          {/* Login Route */}
          <Route path="/login" element={
            isAuthenticated ?
              <Navigate to="/dashboard" /> :
              <Login setIsAuthenticated={setIsAuthenticated} />
          } />

          {/* Dashboard Route (only accessible when authenticated) */}
          <Route path="/dashboard" element={
            isAuthenticated ?
              <Dashboard onLogout={handleLogout} /> :
              <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;