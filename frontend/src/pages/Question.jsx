import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

function Question() {
  const q1 = {
    title: "Sum of Two Numbers",
    description:
      "Write a function that takes two integers and returns their sum.",
    difficulty: "Easy",
    constraints: "1 <= a, b <= 10^9",
  };

  const t1 = [
    {
      input: "2 3",
      output: "5",
      explanation: "2 + 3 = 5",
      isHidden: false,
    },
    {
      input: "10 20",
      output: "30",
      explanation: "10 + 20 = 30",
      isHidden: false,
    },
    {
      input: "999999999 1",
      output: "1000000000",
      explanation: "Edge case with large integers",
      isHidden: true,
    },
  ];

  return (
    <PanelGroup autoSaveId="example" direction="horizontal">
      <Panel defaultSize={50}>
        <div className="bg-[#1e1e1e] text-white h-screen p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-100">
              1234: {q1.title}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Difficulty:{" "}
              <span
                className={`${
                  q1.difficulty === "Easy"
                    ? "text-green-400"
                    : q1.difficulty === "Medium"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {q1.difficulty}
              </span>
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-white mb-2">Description</h2>
            <p className="text-gray-300">{q1.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-white mb-2">Test Cases</h2>
            <div className="space-y-4">
              {t1
                .filter((tc) => !tc.isHidden)
                .map((tc, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 border border-gray-600 rounded-lg p-4"
                  >
                    <h3 className="text-white font-semibold mb-2">
                      Test Case {index + 1}
                    </h3>
                    <p className="text-gray-300">
                      <span className="font-medium">Input:</span> {tc.input}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Output:</span> {tc.output}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Explanation:</span>{" "}
                      {tc.explanation}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white mb-2">Constraints</h2>
            <p className="text-gray-300">{q1.constraints}</p>
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="w-2 bg-gray-600 hover:bg-gray-400 transition" />

      <Panel>
        <div className="bg-[#111827] h-screen text-white p-6">
          <h1 className="text-2xl font-bold">Code Editor Placeholder</h1>
          {/* Replace with actual Monaco Editor later */}
        </div>
      </Panel>
    </PanelGroup>
  );
}

export default Question;
