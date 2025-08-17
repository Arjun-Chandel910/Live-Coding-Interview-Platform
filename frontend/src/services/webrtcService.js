import { emitEvent } from "./socketService";

let peerConnection;
let remoteStream = new MediaStream(); // Initialize remoteStream
let onRemoteStreamAvailableCallback = null;
let currentRoomId;

const servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const createPeerConnection = (roomId, localStream) => {
  if (peerConnection) {
    console.log("Peer connection already exists, reusing it.");
    return;
  }

  peerConnection = new RTCPeerConnection(servers);
  currentRoomId = roomId;

  // Add local tracks to the peer connection immediately
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
      console.log(`Added local track: ${track.kind}`);
    });
  }

  // Event listener for when the remote peer adds a track
  peerConnection.ontrack = (event) => {
    console.log("Remote track received:", event.streams);
    // Add the remote tracks to our remoteStream
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
    // Call the callback to update the React state
    if (onRemoteStreamAvailableCallback) {
      onRemoteStreamAvailableCallback(remoteStream);
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("Sending ICE candidate:", event.candidate);
      emitEvent("ice-candidate", {
        candidate: event.candidate,
        roomId: currentRoomId,
      });
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log("Connection state:", peerConnection.connectionState);
  };
};

export const createOffer = async () => {
  if (!peerConnection) throw new Error("Peer connection not initialized.");
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  return offer;
};

export const createAnswer = async (offer) => {
  if (!peerConnection) throw new Error("Peer connection not initialized.");
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  return answer;
};

export const setRemoteDescription = async (desc) => {
  if (!peerConnection) throw new Error("Peer connection not initialized.");
  await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
};

export const addIceCandidate = async (candidate) => {
  if (!peerConnection) {
    console.log("Peer connection not yet initialized. Skipping ICE candidate.");
    return;
  }
  try {
    // Attempt to add the candidate directly
    await peerConnection.addIceCandidate(candidate);
  } catch (err) {
    // If that fails, try creating a new RTCIceCandidate instance
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (innerErr) {
      console.error("Error adding received ICE candidate", innerErr);
    }
  }
};

export const registerOnRemoteStreamAvailable = (callback) => {
  onRemoteStreamAvailableCallback = callback;
};

export const getRemoteStream = () => remoteStream;
