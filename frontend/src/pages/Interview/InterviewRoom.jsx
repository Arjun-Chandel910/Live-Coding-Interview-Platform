import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
export const InterviewRoom = () => {
  const { state } = useLocation();
  const roomId = state.roomId;
  const socket = useRef(null);

  const joinCall = () => {
    socket.current = io("http://localhost:8000");
    socket.current.emit("join-room", roomId);
  };
  useEffect(() => {
    joinCall();
  }, []);

  return <div>InterviewRoom</div>;
};
