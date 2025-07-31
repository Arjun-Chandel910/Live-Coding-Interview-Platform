import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
export const InterviewRoom = () => {
  //
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState("");

  const [isChatVisible, setIschatVisible] = useState(false);

  //
  const { state } = useLocation();
  const roomId = state.roomId;
  const socket = useRef(null);

  //
  const joinCall = () => {
    socket.current = io("http://localhost:8000");
    socket.current.emit("join-room", roomId);

    //listen for messages
    socket.current.on("new-message", ({ sender, content }) => {
      setMessages((prev) => ({
        ...prev,
        [roomId]: prev[roomId]
          ? [...prev[roomId], { sender, content }]
          : [{ sender, content }],
      }));
    });
  };

  //
  useEffect(() => {
    joinCall();
  }, [roomId]);
  console.log(roomId);

  return (
    <div className="w-full h-screen flex">
      {/* Main area (takes remaining space) */}
      <div className="flex-1 p-4">
        InterviewRoom
        <h1 onClick={() => setIschatVisible(!isChatVisible)}>open chat</h1>
      </div>

      {/* Right-side panel (fixed half width) */}
      {isChatVisible && (
        <div className="w-1/2 h-full bg-gray-700 p-4 text-white flex flex-col justify-between">
          <div>messages</div>
          <div className="w-full">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="write a message"
              className="border border-white bg-white text-gray-600"
            />
            <button
              onClick={() => console.log(inputMessage)}
              className="bg-black text-white p-2 rounded ml-2"
            >
              send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
