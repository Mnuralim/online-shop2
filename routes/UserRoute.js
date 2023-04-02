import express from "express";
import { addAddress, addToCart, applyCoupon, deleteUser, emptyCart, forgotPassword, getAllUser, getMyWishlist, getUserById, getUserCart, resetPassword, updatePassword, updateUser, uploadProfilImages } from "../controllers/User.js";
import { adminOnly, authMiddleware } from "../middleware/AuthMiddleware.js";
import { upload } from "../middleware/UploadImages.js";

const router = express.Router();

//users
router.get("/get-all-users", getAllUser);
router.get("/get-single-user/:id", getUserById);
router.put("/update-user", authMiddleware, updateUser);
router.delete("/delete-user/:id", authMiddleware, adminOnly, deleteUser);

router.put("/save-address", authMiddleware, addAddress);

//password
router.put("/update-password", authMiddleware, updatePassword);
router.put("/forgot-password", forgotPassword);
router.put("/reset-password/:passtoken", resetPassword);

router.put("/profil-photo", authMiddleware, upload.single("images"), uploadProfilImages);

//wishlist
router.get("/get-wishlist", authMiddleware, getMyWishlist);

//cart
router.post("/cart/add-to-cart", authMiddleware, addToCart);
router.get("/cart/get-user-cart", authMiddleware, getUserCart);
router.delete("/cart/empty-cart", authMiddleware, emptyCart);
router.put("/cart/apply-coupon", authMiddleware, applyCoupon);

export default router;
