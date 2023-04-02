import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import Cart from "../models/CartModel.js";
import Product from "../models/ProductModel.js";
import Coupon from "../models/CouponModel.js";

export const getAllUser = async (req, res) => {
  try {
    const data = await User.find().select(["-password", "-__v"]);
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findById(id).select(["-password", "-__v"]);
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.user;
  const { firstname, lastname, email, mobile } = req.body;

  try {
    const data = await User.findByIdAndUpdate(
      id,
      {
        firstname: firstname,
        lastname: lastname,
        email: email,
        mobile: mobile,
      },
      {
        new: true,
      }
    ).select(["-password", "-__v"]);
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await User.findByIdAndDelete(id);
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addAddress = async (req, res) => {
  const { id } = req.user;
  const { address } = req.body;
  try {
    const data = await User.findByIdAndUpdate(
      id,
      {
        address: address,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  const { id } = req.user;
  const { password, confPassword } = req.body;

  //validation password & confpass
  if (password !== confPassword) return res.status(400).json({ message: "Password and Confirm Password don't match" });

  //hash password
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  //generate password reset token,passwordChangedAt,passwordResetExpires
  const token = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  const passwordChangedAt = Date.now();
  const passwordResetExpires = Date.now() + 30 * 60 * 1000;

  try {
    const data = await User.findByIdAndUpdate(
      id,
      {
        password: hashPassword,
        passwordResetToken,
        passwordChangedAt,
        passwordResetExpires,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  //validation user
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  //generate passwordResetToken & passwordResetExpires
  const token = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  const passwordResetExpires = Date.now() + 15 * 60 * 1000;

  try {
    await User.findByIdAndUpdate(
      user.id,
      {
        passwordResetToken,
        passwordResetExpires,
      },
      {
        new: true,
      }
    );

    const resetUrl = `Follow this link to reset your password, link will expires in 10 minutes. <a href="http://localhost:5000/api/user/reset-password/${passwordResetToken}">Click Me </a>`;

    const data = {
      to: email,
      subject: "Fotgot Password Link",
      text: "Hey User!!",
      html: resetUrl,
    };
    sendEmail(data);
    res.status(200).json({
      message: "success, email sent",
      token: passwordResetToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { passtoken } = req.params;
  const { password, confPassword } = req.body;

  const user = await User.findOne({
    passwordResetToken: passtoken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ message: "invalid link" });

  //validation password & confpass
  if (password !== confPassword) return res.status(400).json({ message: "Password and Confirm Password don't match" });

  //hash password
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  //generate passwordChangedAt
  const passwordChangedAt = Date.now();
  try {
    const data = await User.findByIdAndUpdate(
      user.id,
      {
        password: hashPassword,
        passwordChangedAt: passwordChangedAt,
        passwordResetExpires: "",
        passwordResetToken: "",
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "success, password updated",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfilImages = async (req, res) => {
  const { id } = req.user;
  const file = req.file;
  try {
    const data = await User.findByIdAndUpdate(
      id,
      {
        images: file.path,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyWishlist = async (req, res) => {
  const { id } = req.user;
  try {
    const data = await User.findById(id).populate("wishlist");
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//cart

export const addToCart = async (req, res) => {
  const { carts } = req.body;
  const { id } = req.user;
  const user = await User.findById(id);

  const alreadyAdd = await Cart.findOne({ orderby: id });

  if (alreadyAdd) {
    alreadyAdd.deleteOne({ orderby: user.id });
  }
  try {
    const products = [];

    for (const cart of carts) {
      let object = {};
      object.product = cart.id;
      object.count = cart.count;
      object.color = cart.color;

      const getPrice = await Product.findById(cart.id).select("price").exec();
      object.price = getPrice.price;

      products.push(object);
    }

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal += products[i].count * products[i].price;
    }

    const newCart = await new Cart({
      products: products,
      cartTotal: cartTotal,
      orderby: user.id,
    }).save();
    res.status(200).json({
      message: "success",
      data: newCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserCart = async (req, res) => {
  const { id } = req.user;

  try {
    const data = await Cart.findOne({ orderby: id });
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const emptyCart = async (req, res) => {
  const { id } = req.user;
  try {
    const data = await Cart.findOneAndDelete({ orderby: id });
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyCoupon = async (req, res) => {
  const { coupon } = req.body;
  const { id } = req.user;
  try {
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (!validCoupon) return res.status(404).json({ message: "Invalid coupon" });

    const myCart = await Cart.findOne({ orderby: id });
    const totalAfterDiscount = myCart.cartTotal - (myCart.cartTotal * validCoupon.discount) / 100;

    const data = await Cart.findOneAndUpdate(
      { orderby: id },
      {
        totalAfterDiscount: totalAfterDiscount,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      message: "success",
      totalAfterDiscount: data.totalAfterDiscount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
