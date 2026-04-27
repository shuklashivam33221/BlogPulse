import express from "express";
import { body } from "express-validator";
import { registerUser, loginUser, getUserProfile, updateProfile , deleteProfile } from "../controllers/user.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";


const router = express.Router();

// UNPROTECTED — anyone can access (no wristband needed)
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
// POST /api/users/register → calls registerUser controller
router.post('/register',
    [
        body('name').trim().notEmpty().withMessage('Please provide name'),
        body('email').trim().isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be atleast 6 characters'),
    ],
    validate, // Checks if validations passed
    registerUser, // Only runs if ALL validations pass
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user and get token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login Successful
 *       401:
 *         description: Invalid Email or Password
 */
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
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authorized, token failed
 */
router.get('/profile', protectRoute, getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', protectRoute,
    [
        body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
        body('bio').optional().trim().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters'),
    ],
    validate,
    updateProfile);
/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Delete user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.delete("/profile", protectRoute, deleteProfile);
export default router;