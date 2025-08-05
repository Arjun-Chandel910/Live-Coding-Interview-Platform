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
import { useProblem } from "../../context/ProblemProvider";

const RTCconfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 15,
};

export const InterviewRoom = () => {
  const { getProblems } = useProblem();

  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState("");
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      const questions = await getProblems();

      setProblems(questions);
    };
    fetchProblems();
  }, []);

  const { state } = useLocation();
  const roomId = state.roomId;
  const role = state.role;
  const name = state.name;

  const socket = useRef(null);
  const peerConnection = useRef(null);
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const localStream = useRef(null);
  const hasJoinedCall = useRef(false);

  const [peerJoined, setPeerJoined] = useState(false);
  const [roomStateReady, setRoomStateReady] = useState(false);
  const candidateQueue = [];
  let remoteDescriptionSet = false;

  const setup = () => {
    socket.current = io("http://localhost:8000", {
      transports: ["websocket"],
    });

    socket.current.emit("join-room", roomId, name);

    socket.current.on("already-in-room", () => {
      if (role === "candidate") {
        setPeerJoined(true);
        setRoomStateReady(true);
        showInfo(`Interviewer is already in the room.`);
      }
    });

    socket.current.on("remote-user-joined", ({ name }) => {
      if (role === "interviewer") {
        setPeerJoined(true);
        setRoomStateReady(true);
        showInfo(`${name} has joined the meeting.`);
        hasJoinedCall.current = false;
        if (peerConnection.current) {
          peerConnection.current.close();
          peerConnection.current = null;
        }
      }
    });

    socket.current.on("user-left", ({ name }) => {
      setPeerJoined(false);
      setRoomStateReady(false);
      showInfo(`${name} left the room.`);
      if (remoteVideo.current) remoteVideo.current.srcObject = null;
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
        hasJoinedCall.current = false;
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

    socket.current.on("toggle-audio", ({ enabled }) => {
      if (remoteVideo.current?.srcObject) {
        remoteVideo.current.srcObject.getAudioTracks().forEach((track) => {
          track.enabled = enabled;
        });
      }
    });

    socket.current.on("toggle-video", ({ enabled }) => {
      if (remoteVideo.current?.srcObject) {
        remoteVideo.current.srcObject.getVideoTracks().forEach((track) => {
          track.enabled = enabled;
        });
      }
    });

    const getMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (myVideo.current) myVideo.current.srcObject = stream;
      localStream.current = stream;
      setRoomStateReady(true);
    };

    getMedia();
  };

  useEffect(() => {
    setup();
    return () => {
      socket.current.disconnect();
    };
  }, []);

  const joinCall = async () => {
    if (hasJoinedCall.current || !localStream.current) return;
    hasJoinedCall.current = true;

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
          console.error("ICE error:", e);
        }
      }
    });

    if (role === "interviewer") {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.current.emit("offer", { offer, senderId: name, roomId });

      socket.current.on("receive-answer", async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescriptionSet = true;
        for (const cand of candidateQueue) {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
        candidateQueue.length = 0;
      });
    }

    if (role === "candidate") {
      socket.current.on("receive-offer", async ({ offer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        remoteDescriptionSet = true;

        for (const cand of candidateQueue) {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
        candidateQueue.length = 0;

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.current.emit("answer", { answer, senderId: name, roomId });
      });
    }
  };

  useEffect(() => {
    if (roomStateReady && (role === "candidate" || peerJoined)) {
      joinCall();
    }
  }, [roomStateReady, peerJoined, role]);

  const handleSendMsg = () => {
    if (!inputMessage.trim()) return;
    socket.current.emit("message", roomId, name, inputMessage);
    setInputMessage("");
  };

  const micOpen = () => {
    const audioTracks = localStream.current?.getAudioTracks();
    if (audioTracks && audioTracks.length > 0) {
      const newState = !isAudioOn;
      audioTracks[0].enabled = newState;
      setIsAudioOn(newState);
      socket.current.emit("toggle-audio", { enabled: newState, roomId });
    }
  };

  const camOpen = () => {
    const videoTracks = localStream.current?.getVideoTracks();
    if (videoTracks && videoTracks.length > 0) {
      const newState = !isVideoOn;
      videoTracks[0].enabled = newState;
      setIsVideoOn(newState);
      socket.current.emit("toggle-video", { enabled: newState, roomId });
    }
  };

  const chatOpen = () => setIsChatVisible(!isChatVisible);

  return (
    <div className="w-full h-screen flex justify-between overflow-x-hidden">
      <div className="flex flex-col">
        <h1 className="text-xl p-4">Interview Room</h1>
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
      {role === "interviewer" && (
        <div>
          <select name="cars" id="cars">
            {problems.map((p) => (
              <option key={p.title} value={p.title}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      )}

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
