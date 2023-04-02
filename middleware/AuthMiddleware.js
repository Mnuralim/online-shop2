import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  //validation token from headers(authorization)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ message: "there is no token,please login!" });

  jwt.verify(token, process.env.JWT, async (err, decode) => {
    if (err) return res.status(403).json({ message: "access forbidden" });

    const user = await User.findById(decode.id);
    req.user = user;
    next();
  });
};

export const isSeller = async (req, res, next) => {
  const { email } = req.user;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "user not found" });

  if (user.role === "user") return res.status(403).json({ message: "access forbidden" });
  next();
};

export const adminOnly = async (req, res, next) => {
  const { email } = req.user;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "user not found" });

  if (user.role !== "admin") return res.status(403).json({ message: "access forbidden" });
  next();
};
