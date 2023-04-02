import mongoose from "mongoose"; // Erase if already required

// Declare the Schema of the Mongo model
const CouponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    expire: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
const Coupon = mongoose.model("Coupon", CouponSchema);
export default Coupon;
