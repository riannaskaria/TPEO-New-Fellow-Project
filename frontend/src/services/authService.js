const API_URL = "http://localhost:3001";

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem("authToken");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },

  // Helper function to make authenticated requests
  fetchWithAuth: async (url, options = {}) => {
    const token = localStorage.getItem("authToken");

    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // If unauthorized (token expired or invalid), logout user
    if (response.status === 401) {
      authService.logout();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    return response;
  },

  // Update user profile - CORRECTED TO MATCH BACKEND
  updateProfile: async (userData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser._id) {
        throw new Error("User ID not available");
      }

      const response = await authService.fetchWithAuth(`${API_URL}/users/${currentUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to update profile");
      }

      // Update the stored user data
      const updatedUser = data.data; // Note: API returns { success: true, data: updatedUser }
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Update user preferences (interests) - CORRECTED TO MATCH BACKEND
  updatePreferences: async (interests) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser._id) {
        throw new Error("User ID not available");
      }

      // ✅ SAME route as updateProfile
      const response = await authService.fetchWithAuth(`${API_URL}/users/${currentUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }) // ✅ Just send the interests field
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to update preferences");
      }

      const updatedUser = data.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  }
};