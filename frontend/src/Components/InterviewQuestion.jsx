import React, { useState, useEffect } from "react";
import { useProblem } from "../context/ProblemProvider";
import Divider from "@mui/material/Divider";

const InterviewQuestion = ({ selectedProblem, setSelectedProblem }) => {
  const { getProblems, getParticularProblem } = useProblem();
  const [problems, setProblems] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [customText, setCustomText] = useState("");

  // Fetch all problems once

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const questions = await getProblems();
        setProblems(questions || []);
      } catch (err) {
        console.error("Failed to fetch problems:", err);
      }
    };
    fetchProblems();
  }, [getProblems]);

  // Fetch details of selected problem
  useEffect(() => {
    const fetchProblem = async () => {
      if (selectedId && selectedId !== "custom") {
        try {
          const prob = await getParticularProblem(selectedId);
          setSelectedProblem(prob || null);
        } catch (err) {
          console.error("Failed to fetch problem details:", err);
          setSelectedProblem(null);
        }
      } else {
        setSelectedProblem(null);
      }
    };
    fetchProblem();
  }, [selectedId, getParticularProblem]);

  const isCustom = selectedId === "custom";

  return (
    <div className="h-screen flex flex-col bg-gray-900 rounded-lg shadow-xl p-4 overflow-y-auto ">
      {/* Dropdown */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Question</h2>
        <select
          className="bg-gray-700 text-white rounded-md px-3 py-1 text-sm focus:outline-none"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select a Problem</option>
          <option value="custom">Type a Custom Question</option>
          {problems.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-800 rounded-md p-4 overflow-y-auto text-gray-300">
        <div className="flex items-center space-x-2 cursor-pointer">
          <span className="inline-block transform transition-transform duration-300 hover:scale-110 origin-center select-none">
            ✨♊️✨
          </span>
          <input
            type="text"
            placeholder="Generate question from AI."
            className="flex-1 p-2 rounded-md bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-2">
          <Divider sx={{ borderColor: "gray" }} />
        </div>

        {isCustom ? (
          <textarea
            className="w-full h-full bg-gray-700 text-gray-200 p-2 rounded-md focus:outline-none resize-none"
            placeholder="Type your question here..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
        ) : selectedProblem ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              {selectedProblem.title}
            </h2>
            <p>{selectedProblem.description}</p>

            {selectedProblem.constraints && (
              <div>
                <h3 className="text-lg font-bold text-white">Constraints</h3>
                <p>{selectedProblem.constraints}</p>
              </div>
            )}

            {selectedProblem.visibleTestCases?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white">
                  Visible Test Cases
                </h3>
                {selectedProblem.visibleTestCases.map((tc, idx) => (
                  <div key={idx} className="bg-gray-700 p-3 rounded-md mb-2">
                    <strong className="text-white">Input:</strong>{" "}
                    <span>{JSON.stringify(tc.input)}</span>
                    <br />
                    <strong className="text-white">Output:</strong>{" "}
                    <span>{JSON.stringify(tc.output)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-4">
            Select a problem or choose "Type a Custom Question".
          </p>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestion;
