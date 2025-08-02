import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Setup = () => {
  const navigate = useNavigate();
  const myVideo = useRef(null);
  const [input, setInput] = useState("");
  const { state } = useLocation();
  const roomId = state.roomId;
  const role = state.role;
  useEffect(() => {
    const getPermission = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    };

    getPermission();
    console.log("hi");
  }, [roomId]);

  const handleEnterRoom = () => {
    navigate(`/interview/${roomId}`, {
      state: { roomId, role, name: input },
    });
  };
  return (
    <div className="h-screen">
      Setup
      <div className="flex flex-col justify-between w-1/2 h-3/4  m-auto border  bg-gray-800">
        <div className="m-auto rounded h-3/4 overflow-hidden">
          <video ref={myVideo} muted autoPlay />
        </div>
        <div className="flex  flex-row justify-between p-10 bg-zinc-500 rounded">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Enter your name"
          />
          <button onClick={handleEnterRoom}>enter</button>
        </div>
      </div>
    </div>
  );
};

export default Setup;
