import React, { useRef } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { FormControl, Select, MenuItem } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import Editor from "@monaco-editor/react";
import axios from "axios";

import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { useParams } from "react-router-dom";
import InvModal from "../../utils/InvModal.jsx";
export default function MeetingRoom() {
  const { roomId } = useParams();
  console.log(roomId);
  const [audioOn, setAudioOn] = React.useState(true);
  const [videoOn, setVideoOn] = React.useState(true);
  const [lang, setLang] = React.useState("javascript");
  const editorRef = useRef(null);

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
    // here is the editor instance
    // you can store it in `useRef` for further usage

    editorRef.current = editor;
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(roomId, ydoc); // here roomId is the name of the room
    const type = ydoc.getText("monaco"); //This is the way to get what our IDE is showing right now.
    const monacoBinding = new MonacoBinding(
      type,

      editorRef.current.getModel(),
      new Set([editor]),
      provider.awareness
    );
  }

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Left Pane: Vertical Toolbar with Invite at Bottom */}
      <div className="w-20 flex flex-col justify-between items-center bg-gray-800 border-r border-gray-700 py-4">
        {/* Top Icons */}
        <div className="flex flex-col items-center space-y-6">
          {audioOn ? (
            <MicIcon
              className="text-green-400 cursor-pointer"
              onClick={() => setAudioOn(false)}
            />
          ) : (
            <MicOffIcon
              className="text-red-500 cursor-pointer"
              onClick={() => setAudioOn(true)}
            />
          )}
          {videoOn ? (
            <VideocamIcon
              className="text-green-400 cursor-pointer"
              onClick={() => setVideoOn(false)}
            />
          ) : (
            <VideocamOffIcon
              className="text-red-500 cursor-pointer"
              onClick={() => setVideoOn(true)}
            />
          )}
          <FormControl size="small" className="w-14">
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
          </FormControl>
        </div>
        {/* Bottom Invite Button */}
        <div className="flex items-center justify-center w-full py-2 bg-blue-600 hover:bg-blue-500 rounded">
          <LinkIcon className="text-white mr-1" />
          <InvModal sendInvite={sendInvite} roomId={roomId} />{" "}
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
      </div>

      {/* Right Pane: Output */}
      <div className="w-1/4 p-4 flex flex-col">
        <h2 className="text-white mb-2">Output</h2>
        <div className="flex-1 bg-gray-800 p-2 rounded-lg overflow-auto text-green-300 font-mono">
          <p>// Output will appear here...</p>
        </div>
      </div>
    </div>
  );
}
