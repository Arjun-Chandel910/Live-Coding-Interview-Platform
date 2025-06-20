import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers["auth-token"];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access Denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

export default authMiddleware;
