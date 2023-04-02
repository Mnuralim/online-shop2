import mongoose from "mongoose";

export const db = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected...");
  } catch (error) {
    console.log(error);
  }
};
