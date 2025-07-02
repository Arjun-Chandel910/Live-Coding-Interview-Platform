import React, { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useLocation } from "react-router-dom";
import { useProblem } from "../context/ProblemProvider";
import Editor from "@monaco-editor/react";

export default function Question() {
  const { getParticularProblem } = useProblem();
  const id = useLocation().state.id;

  const [language, setLanguage] = useState("javascript");
  const [problem, setProblem] = useState();

  function handleEditorChange(value, event) {
    console.log(event);
    console.log(value);
  }

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
    <PanelGroup autoSaveId="question-page" direction="horizontal">
      {/* Left Panel: Question Info */}
      <Panel defaultSize={50}>
        <div className="bg-[#1e1e1e] text-white h-screen p-6 overflow-y-auto scroll-smooth">
          <h1 className="text-3xl font-semibold mb-4">Q : {problem.title}</h1>
          <p className="text-sm text-gray-400 mb-6">
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

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-300">{problem.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Test Cases</h2>
            <div className="space-y-4">
              {problem.visibleTestCases?.map((tc, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-4"
                >
                  <h3 className="font-semibold mb-2">Test Case {index + 1}</h3>
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
            <h2 className="text-lg font-medium mb-2">Constraints</h2>
            <p className="text-gray-300">{problem.constraints}</p>
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="w-2 bg-gray-600 hover:bg-gray-400 transition" />

      {/* Right Panel: Editor + Output vertically */}
      <Panel>
        <PanelGroup direction="vertical">
          {/* Editor Panel */}
          <Panel defaultSize={70}>
            <div className="bg-[#1e1e1e] h-full p-4">
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
                height="80vh"
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

          <PanelResizeHandle className="h-4 bg-gray-600 hover:bg-gray-400 transition  border-1 hover:border-gray-800 " />

          {/* Output Panel */}
          <Panel>
            <div className="bg-gray-900 text-white p-4 h-full overflow-y-auto">
              <p className="text-sm">Output will be shown here...</p>
              {/* You can replace this with actual output once code execution is integrated */}
            </div>
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}
