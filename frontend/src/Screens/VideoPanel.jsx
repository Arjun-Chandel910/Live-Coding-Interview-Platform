import React, { useRef, useEffect } from "react";

export default function VideoPanel({ localStream, remoteStream }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Set local video stream
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    // CRITICAL FIX: Set remote video stream
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex w-full">
      <div className="w-1/2 p-2">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg shadow-lg w-full"
        />
        <p className="text-white text-center mt-2">You</p>
      </div>

      <div className="w-1/2 p-2">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="rounded-lg shadow-lg w-full"
        />
        <p className="text-white text-center mt-2">Peer</p>
      </div>
    </div>
  );
}
