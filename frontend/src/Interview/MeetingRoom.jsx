import React, { useRef, useEffect, useState } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { FormControl, Select, MenuItem } from "@mui/material";
import DrawIcon from "@mui/icons-material/Draw";
import LinkIcon from "@mui/icons-material/Link";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useParams } from "react-router-dom";

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

const { VITE_API_URL } = import.meta.env;

export default function MeetingRoom() {
  const { roomId } = useParams();

  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [drawingOn, setDrawingOn] = useState(false);
  const [lang, setLang] = useState("javascript");

  const editorRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

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

        // Register the callback before any signaling
        registerOnRemoteStreamAvailable(setRemoteStream);

        // Media is ready, now join the room and handle signaling
        emitEvent("join-room", roomId);

        // Define socket event listeners
        const onAlreadyInRoom = async () => {
          console.log(
            "[Signalling] already-in-room -> awaiting offer to create answer"
          );
          createPeerConnection(roomId, stream);
        };

        const onRemoteUserJoined = async () => {
          console.log(
            "[Signalling] remote-user-joined -> creating and sending offer"
          );
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

        // Listen for all signaling events
        listenEvent("already-in-room", onAlreadyInRoom);
        listenEvent("remote-user-joined", onRemoteUserJoined);
        listenEvent("receive-offer", onReceiveOffer);
        listenEvent("receive-answer", onReceiveAnswer);
        listenEvent("ice-candidate", onIceCandidate);

        // Cleanup function for listeners
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

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  const openDrawingPad = () => emitEvent("start-drawing", roomId);
  const closeDrawingPad = () => emitEvent("stop-drawing", roomId);

  const handleMicToggle = () => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setAudioOn(track.enabled);
  };

  const handleCamToggle = () => {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setVideoOn(track.enabled);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 bg-gray-900">
        <div className="w-20 flex flex-col justify-between items-center bg-gray-800 border-r border-gray-700 py-4">
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center text-sm text-white">
              {audioOn ? (
                <MicIcon
                  className="text-green-400 cursor-pointer"
                  onClick={handleMicToggle}
                  titleAccess="Mute"
                />
              ) : (
                <MicOffIcon
                  className="text-red-500 cursor-pointer"
                  onClick={handleMicToggle}
                  titleAccess="Unmute"
                />
              )}
              <p>Audio</p>
            </div>

            <div className="text-center text-sm text-white">
              {videoOn ? (
                <VideocamIcon
                  className="text-green-400 cursor-pointer"
                  onClick={handleCamToggle}
                  titleAccess="Turn video off"
                />
              ) : (
                <VideocamOffIcon
                  className="text-red-500 cursor-pointer"
                  onClick={handleCamToggle}
                  titleAccess="Turn video on"
                />
              )}
              <p>Video</p>
            </div>

            <FormControl
              size="small"
              className="w-14 text-center text-white text-sm"
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
              <p>Language</p>
            </FormControl>

            <div
              className={`text-center text-sm ${
                drawingOn ? "text-blue-400" : "text-white"
              }`}
            >
              <DrawIcon
                className={`cursor-pointer mt-8 ${
                  drawingOn ? "shadow-lg shadow-blue-400 rounded" : ""
                }`}
                onClick={drawingOn ? closeDrawingPad : openDrawingPad}
              />
              <p className="text-shadow-xs text-shadow-blue-400">Drawing</p>
            </div>
          </div>

          <div className="flex items-center justify-center w-full py-2 bg-blue-600 hover:bg-blue-500 rounded">
            <LinkIcon className="text-white mr-1" />
            <InvModal sendInvite={sendInvite} roomId={roomId} />
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-lg overflow-hidden">
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

        <div className="w-1/4 p-4 flex flex-col">
          <h2 className="text-white mb-2">Output</h2>
          <div className="flex-1 bg-gray-800 p-2 rounded-lg overflow-auto text-green-300 font-mono">
            <p>// Output will appear here...</p>
          </div>
          <div className="mt-2">
            <VideoPanel localStream={localStream} remoteStream={remoteStream} />
          </div>
          <MessagePanel roomId={roomId} sender={"Arjun"} />
        </div>
      </div>
    </div>
  );
}
