

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND}/users/login`, {
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
    const response = await fetch(`${process.env.REACT_APP_BACKEND}/users`, {
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
};