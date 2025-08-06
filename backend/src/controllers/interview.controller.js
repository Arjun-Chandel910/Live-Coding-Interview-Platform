import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

export const createRoom = async (req, res) => {
  const { roomId } = req.body;
  try {
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        name: roomId, // app's room ID
        properties: {
          enable_screenshare: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json({ roomUrl: response.data.url });
  } catch (e) {
    console.error("Daily room creation error:", e.response?.data || e.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getMeetingHistory = async (req, res) => {
  // complete this later
};
