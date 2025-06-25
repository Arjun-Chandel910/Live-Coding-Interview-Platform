import React, { createContext, useContext } from "react";
import axios from "axios";
import { showError } from "../utils/Toastify";

const ProblemContext = createContext();

export function ProblemProvider({ children }) {
  const getProblems = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/questions/problemset`
      );
      const questions = response.data.questions;

      return questions;
    } catch (e) {
      showError(e.response?.data?.message || "Something went wrong!");
    }
  };

  const getParticularProblem = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/questions/problemset/${id}`
      );
      return response.data;
    } catch (e) {
      showError(e.response?.data?.message || "Something went wrong!");
    }
  };
  const value = {
    getProblems,
    getParticularProblem,
  };
  return (
    <ProblemContext.Provider value={value}>{children}</ProblemContext.Provider>
  );
}
export const useProblem = () => {
  return useContext(ProblemContext);
};
