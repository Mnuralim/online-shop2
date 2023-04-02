import Coupon from "../models/CouponModel.js";

export const createCoupon = async (req, res) => {
  const { name, expire, discount } = req.body;
  try {
    const data = await Coupon.create({ name, expire, discount });
    res.status(200).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updateCoupon = async (req, res) => {
  const { id } = req.params;
  const { name, expire, discount } = req?.body;
  try {
    const data = await Coupon.findByIdAndUpdate(
      id,
      {
        name,
        expire,
        discount,
      },
      {
        new: true,
      }
    );
    res.status(201).json({
      message: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getAllCoupon = async (req, res) => {
  try {
    const data = await Coupon.find();
    res.status(200).json({
      message: "success",
      data,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Coupon.findByIdAndDelete(id);
    res.status(200).json({
      message: "success",
      data,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
