import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useProblem } from "../context/ProblemProvider";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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

export default function Question() {
  const { getParticularProblem } = useProblem();
  const id = useLocation().state?.id;

  const [problem, setProblem] = useState(null);
  const [startCode, setStartCode] = useState({});
  const [hiddenCode, setHiddenCode] = useState({});
  const [language, setLanguage] = useState("javascript");
  const [languageId, setLanguageId] = useState(63);
  const [code, setCode] = useState("");
  const [testcases, setTestcases] = useState([]);
  const [output, setOutput] = useState([]);

  const langMap = {
    javascript: 63,
    java: 62,
    cpp: 54,
    python: 71,
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      const question = await getParticularProblem(id);
      setProblem(question);
      setStartCode(question.startCode || {});
      setHiddenCode(question.hiddenCode || {});
    })();
  }, [id]);

  useEffect(() => {
    setCode(startCode[language] || "");
    setLanguageId(langMap[language] || 63);
  }, [language, startCode]);

  useEffect(() => {
    if (!problem) return;
    setTestcases([
      ...(problem.visibleTestCases || []),
      ...(problem.hiddenTestCases || []),
    ]);
  }, [problem]);

  const handleLanguageChange = (e) => setLanguage(e.target.value);

  const handleEditorChange = (value) => setCode(value);

  const handleSubmission = async () => {
    const hiddenTemplate = hiddenCode[language] || "";
    const placeholder =
      language === "python" ? "# USER CODE HERE" : "// USER CODE HERE";
    const finalCode = hiddenTemplate.replace(placeholder, code);

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
            "x-rapidapi-key":
              "f142d4cf1fmsh14de6dd58e8ab73p1d4c63jsnb7df3fcbb12f",
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

  if (!problem) {
    return (
      <div className="h-screen flex justify-center items-center text-white bg-[#0d1117]">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0d1117] text-white">
      <PanelGroup direction="horizontal">
        {/* LEFT: Problem description */}
        <Panel defaultSize={35} minSize={20}>
          <div className="h-full p-6 overflow-y-auto bg-[#1e1e1e]">
            <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
            <p className="mb-4 text-gray-400">{problem.description}</p>

            <h2 className="text-lg font-semibold">Visible Test Cases</h2>
            {problem.visibleTestCases?.map((tc, idx) => (
              <div key={idx} className="bg-gray-800 rounded p-2 mb-2">
                <p>
                  <strong>Input:</strong> {tc.input}
                </p>
                <p>
                  <strong>Output:</strong> {tc.output}
                </p>
                <p>
                  <strong>Explanation:</strong> {tc.explanation}
                </p>
              </div>
            ))}

            <h2 className="text-lg font-semibold mt-4">Constraints</h2>
            <p>{problem.constraints}</p>
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-gray-700 hover:bg-gray-500 cursor-col-resize" />

        {/* RIGHT: Code editor + Output vertically stacked */}
        <Panel defaultSize={65} minSize={30}>
          <PanelGroup direction="vertical">
            {/* Code Editor */}
            <Panel defaultSize={70} minSize={30}>
              <div className="h-full flex flex-col p-4">
                <div className="flex items-center gap-4 mb-4">
                  <select
                    className="bg-gray-700 px-2 py-1 rounded"
                    value={language}
                    onChange={handleLanguageChange}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                  </select>

                  <button
                    className="bg-green-600 px-4 py-1 rounded hover:bg-green-700"
                    onClick={handleSubmission}
                  >
                    Submit
                  </button>
                </div>

                <div className="flex-1">
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language={language}
                    value={code}
                    onChange={handleEditorChange}
                    options={{ minimap: { enabled: false } }}
                  />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="h-2 bg-gray-700 hover:bg-gray-500 cursor-row-resize" />

            {/* Output */}
            <Panel defaultSize={30} minSize={20}>
              <div className="h-full p-4 overflow-y-auto bg-[#111827]">
                <h2 className="text-xl mb-2">Output</h2>
                {output.map((res, idx) => (
                  <div
                    key={idx}
                    className="border-b border-gray-600 pb-2 mb-2 text-sm"
                  >
                    <p>
                      <strong>Testcase {res.testcase}</strong> —{" "}
                      <span className="text-yellow-400">{res.status}</span>
                    </p>
                    <p className="text-green-400 whitespace-pre-wrap">
                      {res.stdout || res.stderr || res.message || "No output"}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
