// InterviewRoom.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

//
export const InterviewRoom = () => {
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState("");
  const [isChatVisible, setIsChatVisible] = useState(false);
  const { state } = useLocation();
  const roomId = state.roomId;
  const role = state.role;
  const name = state.name;

  const socket = useRef(null);

  const joinCall = () => {
    socket.current = io("http://localhost:8000", {
      transports: ["websocket"],
    });
    socket.current.emit("join-room", roomId);

    socket.current.on("new-message", ({ sender, content }) => {
      setMessages((prev) => ({
        ...prev,
        [roomId]: prev[roomId]
          ? [...prev[roomId], { sender, content }]
          : [{ sender, content }],
      }));
    });
  };

  useEffect(() => {
    joinCall();
    return () => {
      socket.current.disconnect();
    };
  }, [roomId]);

  const handleSendMsg = () => {
    if (!inputMessage.trim()) return;
    socket.current.emit("message", roomId, name, inputMessage);
    setInputMessage("");
  };

  return (
    <div className="w-full h-screen flex">
      {/* Main area */}
      <div className="flex-1 p-4">
        <h1 className="text-xl mb-4">Interview Room</h1>
        <button
          onClick={() => setIsChatVisible(!isChatVisible)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isChatVisible ? "Close Chat" : "Open Chat"}
        </button>
      </div>

      {/* Chat panel */}
      {isChatVisible && (
        <div className="w-1/2 h-full bg-gray-800 p-4 text-white flex flex-col">
          <div className="flex-1 overflow-auto mb-4">
            {messages[roomId]?.map((msg, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <span className="font-bold">{msg.sender}:</span>
                <span>{msg.content}</span>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 p-2 rounded-l bg-white text-black"
            />
            <button
              onClick={handleSendMsg}
              className="px-4 bg-green-500 rounded-r text-white"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
