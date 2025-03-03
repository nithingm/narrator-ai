// utils/auth.js
import axios from "axios";

// ✅ Handle user login
export const handleLogin = async (username, password) => {
  try {
    // Uncomment this block when connecting to a real backend auth system
    /*
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      username,
      password,
    });

    localStorage.setItem("token", response.data.token); // Store token
    return response.data.user; // Return user object from backend
    */

    // Mock login for development/testing
    console.log("Mock login for", username);
    return { username }; // Return mock user object
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
};

// ✅ Handle user logout
export const handleLogout = () => {
  console.log("Mock logout");
  // localStorage.removeItem("token"); // Uncomment for real authentication
};

// ✅ Check if user is already logged in
export const checkAuthStatus = () => {
  const token = localStorage.getItem("token");
  
  if (token) {
    // In a real app, verify token validity with the backend
    console.log("User is authenticated");
    return { username: "User" }; // Return a mock user object
  }
  
  return null; // User is not authenticated
};
