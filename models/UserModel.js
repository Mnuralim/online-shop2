import mongoose from "mongoose";

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please provide your name"],
    },
    lastname: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: [true, "Email already exists!Please use other one"],
    },
    mobile: {
      type: String,
      required: true,
      unique: [true, "Phone number already in use! please try again with other phone"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: [8, "password will be 8 characters"],
    },
    address: String,
    role: {
      type: String,
      default: "user",
    },
    refreshtoken: {
      type: String,
    },
    images: {
      type: String,
      default: "https://res.cloudinary.com/dcwaptlnd/image/upload/v1679473398/toko4/150-1503945_transparent-user-png-default-user-image-png-png_art2cy.png",
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: {
      type: Array,
      default: [],
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

//Export the model
const User = mongoose.model("User", userSchema);
export default User;
