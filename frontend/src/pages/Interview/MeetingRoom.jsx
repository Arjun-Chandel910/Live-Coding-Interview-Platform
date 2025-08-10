import React, { useRef, useEffect } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { FormControl, Select, MenuItem } from "@mui/material";
import DrawIcon from "@mui/icons-material/Draw";
import LinkIcon from "@mui/icons-material/Link";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { io } from "socket.io-client";

import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { useParams } from "react-router-dom";
import InvModal from "../../utils/InvModal.jsx";
import WhiteBoard from "../../Components/WhiteBoard.jsx";

export default function MeetingRoom() {
  const socket = useRef(null);
  const { roomId } = useParams();
  console.log(roomId);
  const [audioOn, setAudioOn] = React.useState(true);
  const [videoOn, setVideoOn] = React.useState(true);
  const [drawingOn, setDrawingOn] = React.useState(false);

  const [lang, setLang] = React.useState("javascript");
  const editorRef = useRef(null);
  console.log(drawingOn);

  // send Invite
  const sendInvite = async (recipientEmail, roomId, senderName) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/interview/send-invite`,
        { recipientEmail, roomId, senderName }
      );
      console.log("Invite sent:", response.data);
    } catch (error) {
      console.error(
        "Failed to send invite:",
        error.response?.data || error.message
      );
    }
  };

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(roomId, ydoc);
    const type = ydoc.getText("monaco");
    const monacoBinding = new MonacoBinding(
      type,
      editorRef.current.getModel(),
      new Set([editor]),
      provider.awareness
    );
  }

  const setup = () => {
    socket.current = io("http://localhost:8000", {
      transports: ["websocket"],
    });

    socket.current.emit("join-room", roomId);

    // Listen for drawing state changes from the server
    socket.current.on("start-drawing", () => {
      console.log("start-drawing event received from server");
      setDrawingOn(true);
    });

    socket.current.on("stop-drawing", () => {
      console.log("stop-drawing event received from server");
      setDrawingOn(false);
    });
  };

  const openDrawingPad = () => {
    // Only emit the event to the server. Let the server broadcast the change
    // back to all clients, including this one, to update the state.
    socket.current.emit("start-drawing", roomId);
  };

  const closeDrawingPad = () => {
    // Only emit the event to the server.
    socket.current.emit("stop-drawing", roomId);
  };

  useEffect(() => {
    setup();
    return () => {
      socket.current.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col">
      <div className="h-screen flex bg-gray-900">
        {/* Left Pane: Vertical Toolbar with Invite at Bottom */}
        <div className="w-20 flex flex-col justify-between items-center bg-gray-800 border-r border-gray-700 py-4">
          {/* Top Icons */}
          <div className="flex flex-col items-center space-y-6 ">
            {audioOn ? (
              <div className="text-center text-sm text-white">
                <MicIcon
                  className="text-green-400 cursor-pointer"
                  onClick={() => setAudioOn(false)}
                />
                <p>Audio</p>
              </div>
            ) : (
              <div className="text-center text-sm text-white">
                <MicOffIcon
                  className="text-red-500 cursor-pointer"
                  onClick={() => setAudioOn(true)}
                />
                <p>Audio</p>
              </div>
            )}
            {videoOn ? (
              <div className="text-center text-sm text-white">
                <VideocamIcon
                  className="text-green-400 cursor-pointer"
                  onClick={() => setVideoOn(false)}
                />
                <p>Video</p>
              </div>
            ) : (
              <div className="text-center text-sm text-white">
                <VideocamOffIcon
                  className="text-red-500 cursor-pointer"
                  onClick={() => setVideoOn(true)}
                />
                <p>Video</p>
              </div>
            )}
            <FormControl
              size="small"
              className="w-14 text-center text-white text-sm "
            >
              <Select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-gray-700 text-white text-xs"
              >
                <MenuItem value="javascript">JS</MenuItem>
                <MenuItem value="python">Py</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="java">Java</MenuItem>
              </Select>
              <p> Language</p>
            </FormControl>
            <div
              className={`text-center ${
                drawingOn ? "text-blue-400" : "text-white"
              } text-sm `}
            >
              <DrawIcon
                className={` cursor-pointer mt-8 ${
                  drawingOn && "shadow-lg shadow-blue-400 rounded"
                }`}
                onClick={drawingOn ? closeDrawingPad : openDrawingPad}
              />
              <p className="text-shadow-xs text-shadow-blue-400"> Drawing</p>
            </div>
          </div>
          {/* Bottom Invite Button */}

          <div className="flex items-center justify-center w-full py-2 bg-blue-600 hover:bg-blue-500 rounded">
            <LinkIcon className="text-white mr-1" />
            <InvModal sendInvite={sendInvite} roomId={roomId} />
          </div>
        </div>

        {/* Center Pane: Code Editor Placeholder */}
        <div className="flex-1 p-4">
          <div className="h-full bg-gray-800 border-2 border-gray-700 rounded-lg overflow-hidden">
            {/* Replace with Monaco Editor */}
            <Editor
              height="90vh"
              defaultLanguage="javascript"
              defaultValue="// some comment"
              onMount={handleEditorDidMount}
              theme="vs-dark"
            />
          </div>
          {drawingOn && <WhiteBoard />}
        </div>

        {/* Right Pane: Output */}
        <div className="w-1/4 p-4 flex flex-col">
          <h2 className="text-white mb-2">Output</h2>
          <div className="flex-1 bg-gray-800 p-2 rounded-lg overflow-auto text-green-300 font-mono">
            <p>// Output will appear here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
