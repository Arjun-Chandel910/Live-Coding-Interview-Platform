import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useHistory } from "react-router-dom";
// import axios from "axios";

export default function CreateMeeting() {
  const navigate = useNavigate();
  //   const [name, setName] = useState("");
  //   const history = useHistory();

  //   const handleCreate = async () => {
  //     // 1. POST to your backend to create a meeting record
  //     const { data } = await axios.post("/api/meetings", {
  //       meetingName: name,
  //     });
  //     // data should include the generated meetingUrl or roomId
  //     history.push(`/room/${data.meetingUrl}`);
  //   };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Create New Interview</h1>
      <input
        type="text"
        placeholder="Enter meeting name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button
        // disabled={!name.trim()}
        onClick={() => navigate("/room")}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Create Meeting
      </button>
    </div>
  );
}
