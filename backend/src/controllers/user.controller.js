import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import axios from "axios";

//gmail login
export const googleOAuthHandler = async (req, res) => {
  const { token } = req.body;

  try {
    const response = await axios.get(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    console.log(data);

    const { name, email } = data;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        isGoogleUser: true,
      });
      await user.save();
    } else {
      console.log("user already exists.");
    }

    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res
      .status(200)
      .json({ token: jwtToken, message: "Login successful." });
  } catch (e) {
    console.error("Google OAuth Error:", e.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// REGISTER CONTROLLER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." }); // 409 = Conflict
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res
      .status(201)
      .json({ token, message: "User created successfully." });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

// LOGIN CONTROLLER
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: existingUser._id, email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ token, message: "Login successful." });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
