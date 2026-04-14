import express from "express";
import { body } from "express-validator";
import { registerUser, loginUser, getUserProfile, updateProfile } from "../controllers/user.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";


const router = express.Router();

// UNPROTECTED — anyone can access (no wristband needed)
// POST /api/users/register → calls registerUser controller
router.post('/register',
    [
        body('name').trim().notEmpty().withMessage('Please provide a valid email'),
        body('email').trim().isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({min:6}).withMessage('Password must be atleast 6 characters'),
    ],
    validate, // Checks if validations passed
    registerUser, // Only runs if ALL validations pass
);

// POST /api/users/login → calls loginUser controller
router.post('/login',
    [
        body('email').trim().isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    loginUser
);

// PROTECTED — must have valid token (guard checks wristband first!)
// The protectRoute middleware sits between the route and the controller
// If the token is invalid, the controller NEVER runs
router.get('/profile', protectRoute, getUserProfile);
router.put('/profile', protectRoute, updateProfile);

export default router;