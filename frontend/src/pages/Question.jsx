import React, { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useLocation } from "react-router-dom";
import { useProblem } from "../context/ProblemProvider";
import Editor from "@monaco-editor/react";

export default function Question() {
  const { getParticularProblem } = useProblem();
  const id = useLocation().state.id;

  const [language, setLanguage] = useState("javascript");

  //monaco value
  function handleEditorChange(value, event) {
    console.log(event);
    console.log(value);
  }

  const [problem, setProblem] = useState();

  useEffect(() => {
    const fetchQuestion = async () => {
      const question = await getParticularProblem(id);
      setProblem(question);
    };
    fetchQuestion();
  }, [id]);

  if (!problem) {
    return (
      <div className="h-screen bg-[#0d1117] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }
  return (
    <PanelGroup autoSaveId="example" direction="horizontal">
      <Panel defaultSize={50}>
        <div className="bg-[#1e1e1e] text-white h-screen p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-100">
              Q : {problem.title}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Difficulty:{" "}
              <span
                className={`${
                  problem.difficulty === "Easy"
                    ? "text-green-400"
                    : problem.difficulty === "Medium"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {problem.difficulty}
              </span>
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-white mb-2">Description</h2>
            <p className="text-gray-300">{problem.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-white mb-2">Test Cases</h2>
            <div className="space-y-4">
              {problem.visibleTestCases &&
                problem.visibleTestCases.map((tc, index) => (
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
            <p className="text-gray-300">{problem.constraints}</p>
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="w-2 bg-gray-600 hover:bg-gray-400 transition" />

      <Panel>
        <div className="bg-[#1e1e1e]">
          <select
            name="languages"
            id="languages"
            className="bg-gray-700 text-white mb-4"
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="java">Java</option>
            <option value="javascript">Javascript</option>
            <option value="c++">C++</option>
            <option value="python">Python</option>
          </select>
          <Editor
            height="90vh"
            theme="vs-dark"
            language={language}
            defaultValue="// Start coding here"
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              quickSuggestions: false,
              suggestOnTriggerCharacters: false,
              tabSize: 2,
              readOnly: false,
            }}
            onMount={(editor, monaco) => {
              monaco.editor.setModelMarkers = () => {};
            }}
          />
        </div>
      </Panel>
    </PanelGroup>
  );
}
