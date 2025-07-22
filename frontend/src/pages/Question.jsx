import React, { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useLocation } from "react-router-dom";
import { useProblem } from "../context/ProblemProvider";
import Editor from "@monaco-editor/react";
import { Buffer } from "buffer";
import axios from "axios";

export default function Question() {
  const { getParticularProblem } = useProblem();
  const id = useLocation().state.id;
  const [problem, setProblem] = useState();

  const [val, setVal] = useState(`// start coding here

function main() {
  console.log("Hello, World!");
}

main();
`);
  const [output, setOutput] = useState("Out put appears here ! ");
  const [language, setLanguage] = useState("javascript");
  const [languageId, setLanguageId] = useState(63);

  const ex = {
    input: "2 3",
    output: "5",
  };

  // java code
  const javaCode = `
  import java.util.*;

public class Main {
    public static void main(String[] args) {
      Scanner sc = new Scanner(System.in);
      int a = sc.nextInt();
      int b = sc.nextInt();

      System.out.println(new Solution().sum(a,b));
      }
      ${val}

}
  `;

  // answer submittion
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
    headers: {
      "content-type": "application/json",
      "x-rapidapi-key": "f142d4cf1fmsh14de6dd58e8ab73p1d4c63jsnb7df3fcbb12f",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
    data: {
      source_code: Buffer.from(javaCode).toString("base64"),
      language_id: languageId,
      base64_encoded: true,
      stdin: Buffer.from("4 5").toString("base64"),
    },
  };

  const getOutput = async () => {
    try {
      const response = await axios.request(options);
      const { stdout, stderr, compile_output, message, status } = response.data;

      const decode = (str) =>
        str ? Buffer.from(str, "base64").toString("utf-8") : "";

      const finalOutput =
        decode(stdout) ||
        decode(compile_output) ||
        decode(stderr) ||
        decode(message) ||
        `Status: ${status?.description}`;

      setOutput(finalOutput);
    } catch (error) {
      console.error(error);
      setOutput("Error: Submission failed. Check network or code format.");
    }
  };

  // handle editor change
  function handleEditorChange(value, event) {
    setVal(value);
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
  const handleSubmition = () => {
    getOutput();
  };

  // default coding templates
  const defaultCodeTemplates = {
    java: `static class Solution {
    public int sum(int a, int b) {
        // user writes logic here
        return 0;
    }
}
`,

    python: `# start coding here

def main():
pass

if __name__ == "__main__":
    main()
`,

    cpp: `#include <iostream>
using namespace std;

int main() {
    // start coding here

    return 0;
}
`,

    javascript: `// start coding here

function main() {
  console.log("Hello, World!");
}

main();
`,
  };
  const handleLanguageSelection = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setVal(defaultCodeTemplates[selectedLang]);
    setLanguageId(() => {
      if (selectedLang == "javascript") {
        return 63;
      } else if (selectedLang == "java") {
        return 62;
      } else if (selectedLang == "cpp") {
        return 54;
      } else if (selectedLang == "python") {
        return 71;
      }
    });
  };

  return (
    <PanelGroup autoSaveId="question-page" direction="horizontal">
      {/* Left Panel: Question Info */}
      <Panel defaultSize={50}>
        <div className="bg-[#1e1e1e] text-white h-screen p-6 overflow-y-auto scroll-smooth ">
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
                onChange={handleLanguageSelection}
              >
                <option value="javascript">Javascript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
              </select>

              <button
                className="text-white  bg-blue-400 border rounded"
                onClick={handleSubmition}
              >
                submit
              </button>
              <Editor
                height="80vh"
                theme="vs-dark"
                language={language}
                value={val}
                // value=
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
              <h1 className="text-2xl mb-4"> Output</h1>

              <p className="text-sm">{output}</p>
            </div>
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}
