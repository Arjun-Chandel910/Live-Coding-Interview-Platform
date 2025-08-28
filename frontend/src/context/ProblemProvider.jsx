import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { showError } from "../utils/Toastify";

// Setup Buffer
import { Buffer as NodeBuffer } from "buffer";
const Buffer =
  typeof window !== "undefined" ? window.Buffer || NodeBuffer : NodeBuffer;

const decode = (b64) => {
  if (!b64) return "";
  try {
    return typeof atob === "function"
      ? atob(b64)
      : Buffer.from(b64, "base64").toString("utf-8");
  } catch {
    return "Invalid base64";
  }
};
const ProblemContext = createContext();

// -----------------------------------------------------------------------------------------------------------
export function ProblemProvider({ children }) {
  const [output, setOutput] = useState([]);
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

  const handleSubmission = async (
    hiddenCode,
    code,
    language,
    testcases,
    languageId
  ) => {
    const hiddenTemplate = hiddenCode[language] || "";
    const placeholder =
      language === "python" ? "# USER CODE HERE" : "// USER CODE HERE";
    const finalCode = hiddenTemplate.replace(placeholder, code);
    console.log(import.meta.env.VITE_RAPID_API_KEY);
    const requests = testcases.map((tc) =>
      axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
        {
          language_id: languageId,
          source_code: Buffer.from(finalCode).toString("base64"),
          stdin: Buffer.from(tc.input).toString("base64"),
          expected_output: Buffer.from(tc.output).toString("base64"),
        },
        {
          headers: {
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "x-rapidapi-key": `${import.meta.env.VITE_RAPID_API_KEY}`,
            "content-type": "application/json",
          },
        }
      )
    );

    try {
      const responses = await Promise.all(requests);
      const results = responses.map((res, idx) => ({
        testcase: idx + 1,
        status: res.data.status.description,
        stdout: decode(res.data.stdout),
        stderr: decode(res.data.stderr),
        message: decode(res.data.message),
        expected: testcases[idx]?.output,
      }));
      setOutput(results);
    } catch (err) {
      console.error("Error during individual test submissions", err);
      setOutput([{ status: "Error", message: "Submission failed" }]);
    }
  };

  const submitOne = async (languageId, code) => {
    const optionsAll = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: {
        base64_encoded: "true",
        wait: "false",
        fields: "*",
      },
      headers: {
        "x-rapidapi-key": `${import.meta.env.VITE_RAPID_API_KEY}`,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        language_id: languageId,
        source_code: Buffer.from(code).toString("base64"),
        stdin: "SnVkZ2Uw",
      },
    };

    try {
      const responseAll = await axios.request(optionsAll);
      const token = responseAll.data.token;
      const optionsOne = {
        method: "GET",
        url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        params: {
          base64_encoded: "true",
          fields: "*",
        },
        headers: {
          "x-rapidapi-key": `${import.meta.env.VITE_RAPID_API_KEY}`,
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        },
      };
      const responseOne = await axios.request(optionsOne);
      console.log(responseOne);
    } catch (error) {
      console.error(error);
    }
  };

  const values = {
    getProblems,
    getParticularProblem,
    handleSubmission,
    output,
    submitOne,
  };
  return (
    <ProblemContext.Provider value={values}>{children}</ProblemContext.Provider>
  );
}
export const useProblem = () => {
  return useContext(ProblemContext);
};
