import express from "express";
import { createCoupon, deleteCoupon, getAllCoupon, updateCoupon } from "../controllers/Coupon.js";
import { adminOnly, authMiddleware } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/create-coupon", authMiddleware, adminOnly, createCoupon);
router.put("/update-coupon/:id", authMiddleware, adminOnly, updateCoupon);

router.get("/get-all-coupons", authMiddleware, getAllCoupon);
router.delete("/delete-coupon/:id", authMiddleware, adminOnly, deleteCoupon);

export default router;
