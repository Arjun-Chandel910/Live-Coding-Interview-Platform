import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { showSuccess } from "../utils/Toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // ✅ initialize from localStorage
  const [authtoken, setAuthToken] = useState(() => {
    return localStorage.getItem("auth-token") || null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    // ✅ keep localStorage in sync with state
    if (authtoken) {
      localStorage.setItem("auth-token", authtoken);
    } else {
      localStorage.removeItem("auth-token");
    }
  }, [authtoken]);

  const loginJwt = async (email, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/users/login`,
        { email, password }
      );
      const token = response.data.token;
      setAuthToken(token);
      showSuccess("Login successful.");
      navigate("/");
    } catch (e) {
      showError(e.response?.data?.message || "Login failed.");
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/users/register`,
        { name, email, password }
      );
      const token = response.data.token;
      setAuthToken(token);
      showSuccess("User Registered.");
      navigate("/");
    } catch (e) {
      showError(e.response?.data?.message || "Signup failed.");
    }
  };

  const logout = () => {
    setAuthToken(null);
    showSuccess("Logged out successfully.");
    navigate("/");
  };

  const value = { loginJwt, register, logout, authtoken, setAuthToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
