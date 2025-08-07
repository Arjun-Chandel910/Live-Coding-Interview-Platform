import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import nodemailer from "nodemailer";

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

export const sendInvite = async (req, res) => {
  console.log("invoked sendInvite");
  const { recipientEmail, roomId, senderName } = req.body;

  if (!recipientEmail || !roomId) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: recipientEmail,
      subject: `${senderName || "Someone"} invited you to a coding interview`,
      html: `<p><a href="http://localhost:5173/room/${roomId}">Join Interview</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Invite sent successfully!" });
  } catch (err) {
    console.error("Email sending failed:", err);
    res.status(500).json({ message: "Failed to send invite." });
  }
};
