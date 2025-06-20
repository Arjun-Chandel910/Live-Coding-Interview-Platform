import React from "react";
import { useContext } from "react";
import { createContext } from "react";

const AuthContext = createContext();
export function AuthProvider({ children }) {
  const login = async () => {};
  const register = async () => {};

  const value = { login, register };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => {
  return useContext(AuthContext);
};
