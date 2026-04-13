import express from "express";
import { registerUser, loginUser, getUserProfile, updateProfile } from "../controllers/user.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// UNPROTECTED — anyone can access (no wristband needed)
// POST /api/users/register → calls registerUser controller
router.post('/register', registerUser);

// POST /api/users/login → calls loginUser controller
router.post('/login', loginUser);

// PROTECTED — must have valid token (guard checks wristband first!)
// The protectRoute middleware sits between the route and the controller
// If the token is invalid, the controller NEVER runs
router.get('/profile', protectRoute, getUserProfile);
router.put('/profile', protectRoute, updateProfile);

export default router;