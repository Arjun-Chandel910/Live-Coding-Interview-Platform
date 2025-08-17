// components/MessagePanel.jsx

import React, { useEffect, useState } from "react";
import {
  connectSocket,
  getSocket,
  listenEvent,
  emitEvent,
} from "../services/socketService";
import ChatIcon from "@mui/icons-material/Chat";

const MessagePanel = ({ roomId, sender }) => {
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if a socket is already connected. If not, connect one using the same URL.
    const socket = getSocket() || connectSocket(import.meta.env.VITE_API_URL);

    const handleNewMessage = ({ sender: msgSender, content }) => {
      setMessages((prev) => {
        const roomMessages = prev[roomId] ? [...prev[roomId]] : [];
        roomMessages.push({ sender: msgSender, content });
        return { ...prev, [roomId]: roomMessages };
      });
    };

    // Use the `listenEvent` function from the service
    listenEvent("new-message", handleNewMessage);

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      if (socket) {
        socket.off("new-message", handleNewMessage);
      }
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Use the `emitEvent` function from the service
    emitEvent("message", { roomId, sender, content: input });
    setInput("");
  };

  return (
    <>
      <div
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer z-50"
        onClick={() => setOpen(!open)}
      >
        <ChatIcon />
      </div>

      {open && (
        <div className="fixed bottom-16 right-4 w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col z-50">
          <div className="flex-1 overflow-y-auto p-3 border-b border-gray-200">
            {messages[roomId] &&
              messages[roomId].map((msg, idx) => (
                <div key={idx} className="mb-2">
                  <strong>{msg.sender}:</strong> {msg.content}
                </div>
              ))}
          </div>
          <div className="p-2 border-t border-gray-200 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded px-2 py-1 mr-2"
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MessagePanel;
