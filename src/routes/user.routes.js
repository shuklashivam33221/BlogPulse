import express from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";

const router = express.Router();

// POST /api/users/register → calls registerUser controller
router.post('/register', registerUser);

// POST /api/users/login → calls loginUser controller
router.post('/login', loginUser);

export default router;