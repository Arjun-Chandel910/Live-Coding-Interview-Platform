import React, { createContext, useContext } from "react";
import axios from "axios";
import { showError, showSuccess } from "../utils/Toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const loginJwt = async (email, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/users/login`,
        {
          email,
          password,
        }
      );
      const token = response.data.token;
      localStorage.setItem("auth-token", token);
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
        {
          name,
          email,
          password,
        }
      );
      const token = response.data.token;
      localStorage.setItem("auth-token", token);
      showSuccess("User Registered.");
      navigate("/");
    } catch (e) {
      showError(e.response?.data?.message || "Signup failed.");
    }
  };

  const value = { loginJwt, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
