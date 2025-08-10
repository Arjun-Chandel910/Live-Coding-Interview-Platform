import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import nodemailer from "nodemailer";

export const createRoom = async (req, res) => {};
export const getMeetingHistory = async (req, res) => {
  // complete this later
};

export const sendInvite = async (req, res) => {
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
