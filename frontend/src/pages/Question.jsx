import React, { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useLocation } from "react-router-dom";
import { useProblem } from "../context/ProblemProvider";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { showError } from "../utils/Toastify";

// Fallback for Buffer in browsers
import { Buffer as NodeBuffer } from "buffer";
const Buffer =
  typeof window !== "undefined" ? window.Buffer || NodeBuffer : NodeBuffer;

export default function Question() {
  const { getParticularProblem } = useProblem();
  const id = useLocation().state?.id;

  const [problem, setProblem] = useState(null);
  const [startCode, setStartCode] = useState({});
  const [hiddenCode, setHiddenCode] = useState({});
  const [language, setLanguage] = useState("javascript");
  const [val, setVal] = useState("");
  const [output, setOutput] = useState([]);
  const [languageId, setLanguageId] = useState(63);
  const [testcases, setTestcases] = useState([]);

  // Fetch problem details
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const question = await getParticularProblem(id);
        setProblem(question);
        setStartCode(question.startCode);
        setHiddenCode(question.hiddenCode);
        if (question.startCode?.[language]) {
          setVal(question.startCode[language]);
        }
      } catch (err) {
        showError("Failed to fetch the question.");
      }
    };
    if (id) fetchQuestion();
  }, [id, getParticularProblem, language]);

  // Combine visible + hidden testcases
  useEffect(() => {
    if (!problem) return;
    const combined = [
      ...(problem.visibleTestCases || []),
      ...(problem.hiddenTestCases || []),
    ];
    setTestcases(combined);
  }, [problem]);

  const handleEditorChange = (value) => {
    setVal(value);
  };

  const handleLanguageSelection = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setVal(startCode[selectedLang] || "");
    const langMap = {
      javascript: 63,
      java: 62,
      cpp: 54,
      python: 71,
    };
    setLanguageId(langMap[selectedLang] || 63);
  };

  const handleBatchSubmission = async () => {
    try {
      const placeholder =
        language === "python" ? "# USER CODE HERE" : "// USER CODE HERE";
      const finalCode = hiddenCode[language]?.replace(placeholder, val);

      const batchPayload = {
        submissions: testcases.map((tc) => ({
          language_id: languageId,
          source_code: Buffer.from(finalCode).toString("base64"),
          stdin: Buffer.from(tc.input).toString("base64"),
          expected_output: Buffer.from(tc.output).toString("base64"),
          base64_encoded: true,
          wait: false,
        })),
      };

      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions/batch",
        batchPayload,
        {
          headers: {
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "content-type": "application/json",
            "x-rapidapi-key":
              "f142d4cf1fmsh14de6dd58e8ab73p1d4c63jsnb7df3fcbb12f",
          },
        }
      );

      const tokens = response.data.map((sub) => sub.token);
      await fetchBatchResult(tokens);
    } catch (error) {
      console.error(error);
      setOutput([{ message: "Error: Submission failed." }]);
    }
  };

  const fetchBatchResult = async (tokens) => {
    try {
      const joinedTokens = tokens.join(",");
      const response = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/batch?tokens=${joinedTokens}&base64_encoded=true`,
        {
          headers: {
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "x-rapidapi-key":
              "f142d4cf1fmsh14de6dd58e8ab73p1d4c63jsnb7df3fcbb12f",
          },
        }
      );

      const decode = (b64) => (b64 ? atob(b64) : "");

      const results = response.data.submissions.map((res, idx) => ({
        testcase: idx + 1,
        status: res.status?.description,
        stdout: decode(res.stdout),
        stderr: decode(res.stderr),
        message: decode(res.message),
        expected: testcases[idx].output || "",
      }));
      console.log(results);
      setOutput(results);
    } catch (e) {
      console.error(e);
      setOutput([{ message: "Error fetching batch results." }]);
    }
  };

  if (!problem) {
    return (
      <div className="h-screen bg-[#0d1117] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <PanelGroup autoSaveId="question-page" direction="horizontal">
      <Panel defaultSize={50}>
        <div className="bg-[#1e1e1e] text-white h-screen p-6 overflow-y-auto">
          <h1 className="text-3xl font-semibold mb-4">Q : {problem.title}</h1>
          <p className="text-sm text-gray-400 mb-6">
            Difficulty:{" "}
            <span
              className={
                problem.difficulty === "Easy"
                  ? "text-green-400"
                  : problem.difficulty === "Medium"
                  ? "text-yellow-400"
                  : "text-red-400"
              }
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
                    <strong>Input:</strong> {tc.input}
                  </p>
                  <p className="text-gray-300">
                    <strong>Output:</strong> {tc.output}
                  </p>
                  <p className="text-gray-300">
                    <strong>Explanation:</strong> {tc.explanation}
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

      <Panel>
        <PanelGroup direction="vertical">
          <Panel defaultSize={70}>
            <div className="bg-[#1e1e1e] h-full p-4">
              <select
                className="bg-gray-700 text-white mb-4"
                onChange={handleLanguageSelection}
                value={language}
              >
                <option value="javascript">Javascript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
              </select>

              <button
                className="text-white bg-blue-400 border rounded px-3 py-1 mb-4 ml-2"
                onClick={handleBatchSubmission}
              >
                Submit
              </button>

              <Editor
                height="80vh"
                theme="vs-dark"
                language={language}
                value={val}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  tabSize: 2,
                }}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="h-4 bg-gray-600 hover:bg-gray-400 transition" />

          <Panel>
            <div className="bg-gray-900 text-white p-4 h-full overflow-y-auto">
              <h1 className="text-2xl mb-4">Output</h1>

              <ul className="list-disc pl-4">
                {output.map((d, idx) => (
                  <li key={idx}>
                    Testcase {d.testcase || idx + 1} -{" "}
                    <span className="text-yellow-300">{d.status}</span>:{" "}
                    <span className="text-green-300">{d.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}
