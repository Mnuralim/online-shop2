import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";

export const registerUser = async (req, res) => {
  const { firstname, lastname, email, mobile, password, confPassword } = req.body;

  //validation password & confpass
  if (password !== confPassword) return res.status(400).json({ message: "Password and Confirm Password don't match" });

  //hash password
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    const data = await User.create({
      firstname: firstname,
      lastname: lastname,
      email: email,
      mobile: mobile,
      password: hashPassword,
    });
    const dataEmail = {
      to: email,
      subject: "Success register",
      text: `hello ${firstname}, thanks for register.`,
      html: `hello ${firstname}, thanks for register, you can buy all product now!!!.`,
    };
    sendEmail(dataEmail);
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const registerSeller = async (req, res) => {
  const { firstname, lastname, email, mobile, password, confPassword } = req.body;

  //validation password & confpass
  if (password !== confPassword) return res.status(400).json({ message: "Password and Confirm Password don't match" });

  //hash password
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    const data = await User.create({
      firstname: firstname,
      lastname: lastname,
      email: email,
      mobile: mobile,
      password: hashPassword,
      role: "seller",
    });
    const dataEmail = {
      to: email,
      subject: "Success register",
      text: `hello ${firstname}, thanks for register.`,
      html: `hello ${firstname}, thanks for register, you can sell your product now!!!.`,
    };
    sendEmail(dataEmail);
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  //validation user
  if (!user) return res.status(404).json({ message: "user not found" });

  //validation password
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "wrong password" });

  try {
    //jwt token
    const id = user.id;
    const token = jwt.sign({ id }, process.env.JWT, {
      expiresIn: "1d",
    });

    //refresh token
    const refreshtoken = jwt.sign({ id }, process.env.REFRESH, {
      expiresIn: "1d",
    });

    const data = await User.findByIdAndUpdate(
      user.id,
      {
        refreshtoken: refreshtoken,
      },
      {
        new: true,
      }
    );

    //set cookie
    res.cookie("refreshtoken", refreshtoken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "success",
      token: token,
      data: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        mobile: user.mobile,
        id: user.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const logOut = async (req, res) => {
  const { refreshtoken } = req.cookies;

  //validation refresh token from cookies
  if (!refreshtoken) return res.sendStatus(204);

  const user = await User.findOne({ refreshtoken });
  //validation user
  if (!user) return res.sendStatus(204);

  const data = await User.findByIdAndUpdate(
    user.id,
    {
      refreshtoken: "",
    },
    {
      new: true,
    }
  );
  res.clearCookie("refreshtoken");
  res.json({
    message: "success",
    data: data,
  });
};

export const getRefreshtoken = async (req, res) => {
  try {
    const { refreshtoken } = req.cookies;
    if (!refreshtoken) return res.sendStatus(401);

    const user = await User.findOne({ refreshtoken });
    //validation user
    if (!user) return res.sendStatus(403);

    jwt.verify(refreshtoken, process.env.REFRESH, (err, decode) => {
      if (err || user.id !== decode.id) return res.sendStatus(204);

      //token
      const id = user.id;
      const token = jwt.sign({ id }, process.env.JWT, {
        expiresIn: "1d",
      });
      res.json({ token });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
