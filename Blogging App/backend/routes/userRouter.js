import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

import {
  getAllAuthors,
  getMyProfile,
  login,
  logout,
  register,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);

router.get("/myprofile", isAuthenticated, getMyProfile);
router.get("/authors", getAllAuthors);

export default router;
