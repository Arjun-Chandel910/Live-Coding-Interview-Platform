// RoleAction.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleAction() {
  const [role, setRole] = useState(null);
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleRole = (r) => {
    setRole(r);
    if (r === "interviewer") {
      const id = crypto.randomUUID();
      setRoomId(id);
    }
  };

  const handleJoin = () => {
    if (!roomId) return alert("Please enter or generate a Room ID");
    navigate(`/interview/${roomId}`, {
      state: { roomId },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">
        {!role ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Select Your Role
            </h2>
            <div className="flex justify-around">
              <button
                onClick={() => handleRole("interviewer")}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
              >
                Interviewer
              </button>
              <button
                onClick={() => handleRole("candidate")}
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
              >
                Candidate
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center capitalize">
              {role} Setup
            </h2>
            {role === "candidate" && (
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            )}
            {role === "interviewer" && (
              <p className="text-center mb-6">
                Your Room ID:{" "}
                <strong className="text-blue-600">{roomId}</strong>
              </p>
            )}
            <button
              onClick={handleJoin}
              className="w-full px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition"
            >
              {role === "interviewer" ? "Start Interview" : "Join Interview"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
