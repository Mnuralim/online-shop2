import cloudinary from "../utils/Cloudinary.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "toko4",
    allowed_formats: ["jpg", "png"],
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50000000,
  },
});
