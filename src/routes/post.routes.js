import express from "express";
import { body, param } from "express-validator";
import { createPost, getAllPosts, getPostById, updatePost, deletePost, toggleLike, getPostAnalytics } from "../controllers/post.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// PUBLIC routes (no token needed)
/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get("/", getAllPosts);
// MUST be before /:id so Express doesn't confuse "analytics" for an ID!
// Because Express reads routes from top to bottom, if a user goes to /api/posts/analytics, Express will hit line 11 first, think "analytics" is an :id, and your isMongoId() validation will throw an "Invalid post ID format" error!

/**
 * @swagger
 * /api/posts/analytics:
 *   get:
 *     summary: Get blog analytics
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get("/analytics", getPostAnalytics);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post data
 *       404:
 *         description: Post not found
 */
router.get("/:id",
    [param('id').isMongoId().withMessage('Invalid post ID format')],
    validate,
    getPostById
);


// PROTECTED routes (token required)
// We must put upload.single('coverImage') before the body validation, because standard body validation can't read multipart/form-data properly without Multer processing it first:

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post("/",
    protectRoute,
    upload.single("coverImage"), // "coverImage" is the field name the frontend must use
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('content').trim().notEmpty().withMessage('Content is required'),
    ],
    validate,
    createPost
);


/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.put("/:id",
    protectRoute,
    [
        param('id').isMongoId().withMessage('Invalid post ID format'),
        body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
        body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    ],
    validate,
    updatePost
);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
router.delete("/:id",
    protectRoute,
    [param('id').isMongoId().withMessage('Invalid post ID format')],
    validate,
    deletePost
);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   put:
 *     summary: Toggle like on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 */
router.put("/:id/like", 
    protectRoute,
    [param('id').isMongoId().withMessage('Invalid post Id format')],
    validate,
    toggleLike
)
export default router;
