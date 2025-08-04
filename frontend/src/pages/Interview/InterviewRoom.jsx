// InterviewRoom.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { showInfo } from "../../utils/Toastify";

// icons
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import ChatIcon from "@mui/icons-material/Chat";
import SpeakerNotesOffIcon from "@mui/icons-material/SpeakerNotesOff";

const RTCconfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export const InterviewRoom = () => {
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState("");

  //
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  //

  const { state } = useLocation();
  const roomId = state.roomId;
  const role = state.role;
  const name = state.name;

  const socket = useRef(null);
  const peerConnection = useRef(null);
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const localStream = useRef(null);

  //
  const candidateQueue = [];
  let remoteDescriptionSet = false;
  //

  useEffect(() => {
    socket.current = io("http://localhost:8000", {
      transports: ["websocket"],
    });

    socket.current.emit("join-room", roomId, name);
    socket.current.on("newUserJoined", ({ name }) => {
      showInfo(`${name} has joined the meeting.`);
    });
    const getMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
      localStream.current = stream;
      joinCall();
    };

    getMedia();

    socket.current.on("user-left", ({ socketId, name }) => {
      showInfo(`${name} left the room .`);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = null;
      }
    });
    return () => {
      socket.current.disconnect();
    };
  }, [name, roomId, role]);

  // -----------------------------joincall-------------------------------------------
  const joinCall = async () => {
    peerConnection.current = new RTCPeerConnection(RTCconfiguration);
    const pc = peerConnection.current;

    pc.ontrack = (e) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = e.streams[0];
      }
    };
    localStream.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.current);
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.current.emit("ice-candidate", {
          candidate: e.candidate,
          senderId: name,
          roomId,
        });
      }
    };

    socket.current.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          if (remoteDescriptionSet) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            candidateQueue.push(candidate);
          }
        } catch (e) {
          console.error("Failed to add ICE candidate:", e);
        }
      }
    });

    socket.current.on("new-message", ({ sender, content }) => {
      setMessages((prev) => ({
        ...prev,
        [roomId]: prev[roomId]
          ? [...prev[roomId], { sender, content }]
          : [{ sender, content }],
      }));
    });

    if (role === "interviewer") {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.current.emit("offer", {
        offer,
        senderId: name,
        roomId,
      });

      socket.current.on("receive-answer", async ({ answer }) => {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          remoteDescriptionSet = true;
          //
          for (const candidate of candidateQueue) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error("Error adding buffered ICE candidate:", e);
            }
          }
          candidateQueue.length = 0; // Clear the queue of candidates
        } catch (e) {
          console.error("Error handling answer:", e);
        }
      });
    }

    if (role === "candidate") {
      socket.current.on("receive-offer", async ({ offer }) => {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));

          remoteDescriptionSet = true;
          //
          for (const candidate of candidateQueue) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error("Error adding buffered ICE candidate:", e);
            }
          }
          candidateQueue.length = 0;
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.current.emit("answer", {
            answer,
            senderId: name,
            roomId,
          });
        } catch (e) {
          console.error("Error handling offer:", e);
        }
      });
    }
  };
  // ----------------------------------------------------------------------------

  const handleSendMsg = () => {
    if (!inputMessage.trim()) return;
    socket.current.emit("message", roomId, name, inputMessage);
    setInputMessage("");
  };

  //control toggling functions
  const micOpen = () => {
    setIsAudioOn(!isAudioOn);
  };
  const camOpen = () => {
    setIsVideoOn(!isVideoOn);
  };
  const chatOpen = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <div className="w-full h-screen flex justify-between overflow-x-hidden">
      <div className="flex flex-col ">
        <div className="flex p-4 ">
          <h1 className="text-xl mb-4">Interview Room</h1>
        </div>
        <div className="flex gap-4 justify-center items-center">
          <div>
            <h2>You ({name})</h2>
            <video
              ref={myVideo}
              autoPlay
              muted
              playsInline
              className="w-[200px] rounded-4xl"
            />
          </div>

          <div>
            <h2>Other User</h2>
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              className="w-[200px] rounded-4xl"
            />
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="bg-gray-700 flex flex-col h-[200px] justify-evenly text-green-600">
        {isAudioOn ? (
          <MicIcon onClick={micOpen} />
        ) : (
          <MicOffIcon onClick={micOpen} />
        )}
        {isVideoOn ? (
          <VideocamIcon onClick={camOpen} />
        ) : (
          <VideocamOffIcon onClick={camOpen} />
        )}
        {isChatVisible ? (
          <ChatIcon onClick={chatOpen} />
        ) : (
          <SpeakerNotesOffIcon onClick={chatOpen} />
        )}
      </div>

      {/* Chat Panel */}
      <div
        className={`w-1/2 h-full bg-gray-800 p-4 text-white flex flex-col transition-transform duration-1000 ${
          isChatVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
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
    </div>
  );
};
