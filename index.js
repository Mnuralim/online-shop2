import express from "express";
import dotenv from "dotenv";
import { db } from "./config/Database.js";
import morgan from "morgan";
import authRoute from "./routes/AuthRoute.js";
import userRoute from "./routes/UserRoute.js";
import productRoute from "./routes/ProductRoute.js";
import couponRoute from "./routes/CouponRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
db(); //connect to database

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", authRoute);
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/coupon", couponRoute);
app.listen(port, () => console.log(`server is running on port ${port}`));
