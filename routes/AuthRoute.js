import express from "express";
import { getRefreshtoken, login, logOut, registerSeller, registerUser } from "../controllers/Auth.js";

const router = express.Router();

router.post("/register-user", registerUser);
router.post("/register-seller", registerSeller);
router.post("/login", login);
router.delete("/logout", logOut);
router.get("/get-refreshtoken", getRefreshtoken);

export default router;
