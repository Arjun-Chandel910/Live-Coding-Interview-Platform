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
      <div className="flex flex-col justify-between w-1/2 h-1/2  m-auto border ">
        <div className="m-auto rounded">
          <video ref={myVideo} muted className="" autoPlay />
        </div>
        <div>
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
