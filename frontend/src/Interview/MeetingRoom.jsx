import React, { useRef, useEffect, useState } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { FormControl } from "@mui/material";
import DrawIcon from "@mui/icons-material/Draw";

import Editor from "@monaco-editor/react";
import axios from "axios";
import { Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import InterviewQuestion from "../Components/InterviewQuestion.jsx";
import { useParams } from "react-router-dom";
import { HocuspocusProvider } from "@hocuspocus/provider";
import InvModal from "../utils/InvModal.jsx";
import WhiteBoard from "../Components/WhiteBoard.jsx";
import VideoPanel from "../Screens/VideoPanel.jsx";
import MessagePanel from "../Screens/MessagePanel.jsx";
import { showInfo } from "../utils/Toastify.jsx";
import {
  emitEvent,
  listenEvent,
  removeListener,
  disconnectSocket,
} from "../services/socketService.js";
import {
  createPeerConnection,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate,
  registerOnRemoteStreamAvailable,
  getRemoteStream,
} from "../services/webrtcService.js";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
// --- react-resizable-panels ---
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useProblem } from "../context/ProblemProvider.jsx";
// -----------------------------------------------------------------------------------------------------------------------------------
const { VITE_API_URL } = import.meta.env;
export default function MeetingRoom() {
  const { handleSubmission, output, submitOne } = useProblem();
  const { roomId } = useParams();
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [drawingOn, setDrawingOn] = useState(false);
  const editorRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [startCode, setStartCode] = useState({});
  const [hiddenCode, setHiddenCode] = useState({});
  const [code, setCode] = useState("");
  const [testcases, setTestcases] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [languageId, setLanguageId] = useState(63);
  // problem setup
  useEffect(() => {
    if (selectedProblem) {
      setHiddenCode(selectedProblem.hiddenCode);
      setStartCode(selectedProblem.hiddenCode);
      setTestcases([
        ...(selectedProblem.visibleTestCases || []),
        ...(selectedProblem.hiddenTestCases || []),
      ]);
      const problemCode = selectedProblem?.startCode;
      setStartCode(problemCode);
    }
  }, [selectedProblem]);
  const handleEditorChange = (value) => {
    setCode(value);
  };
  useEffect(() => {
    if (selectedProblem == null) {
      setCode("");
    } else {
      setCode(startCode[language] || "");
    }
    setLanguageId(langMap[language] || 63);
  }, [language, startCode]);
  const langMap = {
    javascript: 63,
    java: 62,
    cpp: 54,
    python: 71,
  };
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setLanguageId(langMap[lang]);
  };
  // email
  const sendInvite = async (recipientEmail, roomIdParam, senderName) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/api/v1/interview/send-invite`,
        { recipientEmail, roomId: roomIdParam, senderName }
      );
      console.log("Invite sent:", response.data);
    } catch (error) {
      console.error(
        "Failed to send invite:",
        error.response?.data || error.message
      );
    }
  };
  useEffect(() => {
    let mounted = true;
    const initMediaAndSignaling = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!mounted) return;
        setLocalStream(stream);
        stream.getAudioTracks().forEach((t) => (t.enabled = audioOn));
        stream.getVideoTracks().forEach((t) => (t.enabled = videoOn));
        registerOnRemoteStreamAvailable(setRemoteStream);
        emitEvent("join-room", roomId);
        const onAlreadyInRoom = async () => {
          createPeerConnection(roomId, stream);
        };
        const onRemoteUserJoined = async () => {
          createPeerConnection(roomId, stream);
          const offer = await createOffer();
          emitEvent("offer", { offer, roomId });
        };
        const onReceiveOffer = async ({ offer }) => {
          showInfo("Received offer, sending answer...");
          createPeerConnection(roomId, stream);
          const answer = await createAnswer(offer);
          emitEvent("answer", { answer, roomId });
        };
        const onReceiveAnswer = async ({ answer }) => {
          showInfo("Received answer, WebRTC connection established.");
          await setRemoteDescription(answer);
        };
        const onIceCandidate = async ({ candidate }) => {
          try {
            await addIceCandidate(candidate);
          } catch (e) {
            console.error("Failed to add ICE candidate", e);
          }
        };
        listenEvent("already-in-room", onAlreadyInRoom);
        listenEvent("remote-user-joined", onRemoteUserJoined);
        listenEvent("receive-offer", onReceiveOffer);
        listenEvent("receive-answer", onReceiveAnswer);
        listenEvent("ice-candidate", onIceCandidate);
        return () => {
          removeListener("already-in-room", onAlreadyInRoom);
          removeListener("remote-user-joined", onRemoteUserJoined);
          removeListener("receive-offer", onReceiveOffer);
          removeListener("receive-answer", onReceiveAnswer);
          removeListener("ice-candidate", onIceCandidate);
        };
      } catch (err) {
        console.error("Error capturing media:", err);
      }
    };
    initMediaAndSignaling();
    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, [roomId]);
  // drawing
  useEffect(() => {
    const onStartDrawing = () => setDrawingOn(true);
    const onStopDrawing = () => setDrawingOn(false);
    listenEvent("start-drawing", onStartDrawing);
    listenEvent("stop-drawing", onStopDrawing);
    return () => {
      removeListener("start-drawing", onStartDrawing);
      removeListener("stop-drawing", onStopDrawing);
    };
  }, [roomId]);
  // monaco
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    const doc = new Y.Doc();
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    const provider = new HocuspocusProvider({
      url: "wss://live-coding-interview-platform.onrender.com",
      name: roomId,
      document: doc,
    });
    const type = doc.getText("monaco");
    new MonacoBinding(
      type,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );
  }
  const openDrawingPad = () => emitEvent("start-drawing", roomId);
  const closeDrawingPad = () => emitEvent("stop-drawing", roomId);
  // mic toggle
  const handleMicToggle = () => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setAudioOn(track.enabled);
  };
  // cam toggle
  const handleCamToggle = () => {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setVideoOn(track.enabled);
  };
  // run code
  const handleRun = () => {
    // question selected
    if (selectedProblem) {
      handleSubmission(hiddenCode, code, language, testcases, languageId);
    } else {
      submitOne(languageId, code);
    }
  };
  return (
    <div className="relative h-screen w-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-16 flex flex-col justify-between items-center bg-gray-900 border-r border-gray-800 py-4 z-30">
        <div className="flex flex-col items-center gap-10 mt-2">
          {/* mic */}
          <div className="flex flex-col items-center">
            {audioOn ? (
              <MicIcon
                className="text-green-400 mb-1 cursor-pointer"
                onClick={handleMicToggle}
              />
            ) : (
              <MicOffIcon
                className="text-red-500 mb-1 cursor-pointer"
                onClick={handleMicToggle}
              />
            )}
            <span className="text-xs text-gray-300">Audio</span>
          </div>
          {/* cam */}
          <div className="flex flex-col items-center">
            {videoOn ? (
              <VideocamIcon
                className="text-green-400 mb-1 cursor-pointer"
                onClick={handleCamToggle}
              />
            ) : (
              <VideocamOffIcon
                className="text-red-500 mb-1 cursor-pointer"
                onClick={handleCamToggle}
              />
            )}
            <span className="text-xs text-gray-300">Video</span>
          </div>
          {/* drawing pad */}
          <div className="flex flex-col items-center">
            <DrawIcon
              className={`mt-2 cursor-pointer ${
                drawingOn ? "text-blue-400" : "text-gray-300"
              }`}
              onClick={drawingOn ? closeDrawingPad : openDrawingPad}
            />
            <span className="text-xs text-gray-300">Draw</span>
          </div>
        </div>
        {/* invModal */}
        <div className="mt-auto mb-2 flex items-center">
          <InvModal sendInvite={sendInvite} roomId={roomId} />
        </div>
      </div>
      {/* main workspace */}
      <div className="pl-16 h-screen flex flex-col">
        <PanelGroup direction="vertical">
          {/*panels: question | editor */}
          <Panel minSize={15} defaultSize={65}>
            <PanelGroup direction="horizontal" className="h-full">
              {/* Question Panel */}
              <Panel minSize={20} defaultSize={35} className="h-full">
                <div className="h-full bg-gray-800 border-r border-gray-700 p-3 flex flex-col overflow-y-auto rounded-l-lg">
                  <InterviewQuestion
                    selectedProblem={selectedProblem}
                    setSelectedProblem={setSelectedProblem}
                    setCode={setCode}
                  />
                </div>
              </Panel>
              <PanelResizeHandle className="bg-gray-700 w-2 cursor-col-resize" />
              {/* Code Editor Panel */}
              <Panel minSize={30} defaultSize={65} className="h-full">
                <div className="h-full bg-gray-800 p-0 flex flex-col rounded-r-lg overflow-hidden">
                  {/* top bar above editor: language selector and run button */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700">
                    <FormControl size="small">
                      <select value={language} onChange={handleLanguageChange}>
                        <option className="bg-green-400" value="javascript">
                          JavaScript
                        </option>
                        <option className="bg-green-400" value="python">
                          Python
                        </option>
                        <option className="bg-green-400" value="cpp">
                          C++
                        </option>
                        <option className="bg-green-400" value="java">
                          Java
                        </option>
                      </select>
                    </FormControl>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<PlayArrowIcon />}
                      onClick={handleRun}
                      size="medium"
                      sx={{
                        borderRadius: "6px",
                        px: 2.5,
                        py: 0.8,
                        textTransform: "none",
                        fontWeight: "bold",
                        boxShadow: "0 0 8px #22c55eaa",
                        "&:hover": {
                          boxShadow: "0 0 12px #22c55eff",
                          backgroundColor: "#16a34a",
                        },
                      }}
                    >
                      Run
                    </Button>
                  </div>
                  <Editor
                    height="100%"
                    defaultLanguage={language}
                    defaultValue="// some comment"
                    value={code}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    onChange={handleEditorChange}
                    options={{ minimap: { enabled: false } }}
                  />
                  {drawingOn && <WhiteBoard />}
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="bg-gray-700 h-2 w-full cursor-row-resize" />
          {/* Output panel */}
          <Panel minSize={10} defaultSize={20}>
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
        {/* Message Panel */}
        <div className="flex w-full justify-end pr-3 pt-2 gap-3">
          <div className="w-56">
            <MessagePanel roomId={roomId} sender={"Arjun"} />
          </div>
        </div>
      </div>
      {/* Video Panel */}
      <div className="fixed bottom-6 right-6 z-50 w-56 h-32">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow flex items-center justify-center h-full">
          <VideoPanel localStream={localStream} remoteStream={remoteStream} />
        </div>
      </div>
    </div>
  );
}
