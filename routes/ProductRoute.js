import express from "express";
import { addImagesProduct, addWishlist, createProduct, deleteProduct, getAllProducts, getMyProducts, getProductById, ratings, updateProduct } from "../controllers/Product.js";
import { authMiddleware, isSeller } from "../middleware/AuthMiddleware.js";
import { upload } from "../middleware/UploadImages.js";

const router = express.Router();

router.get("/get-all-products", getAllProducts);
router.get("/get-single-product/:id", getProductById);

//seller only
router.post("/create-product", authMiddleware, isSeller, upload.single("images"), createProduct);
router.get("/get-my-products", authMiddleware, isSeller, getMyProducts);
router.put("/update-product/:prodId", authMiddleware, isSeller, upload.single("images"), updateProduct);
router.delete("/delete-product/:prodId", authMiddleware, isSeller, deleteProduct);

router.put("/add-wishlist", authMiddleware, addWishlist);

router.put("/ratings", authMiddleware, ratings);

router.put("/add-images-product/:prodId", authMiddleware, isSeller, upload.array("images", 10), addImagesProduct);

export default router;
