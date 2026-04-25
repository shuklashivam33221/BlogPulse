import express from "express";
import { body, param } from "express-validator";
import { createPost, getAllPosts, getPostById, updatePost, deletePost, toggleLike, getPostAnalytics } from "../controllers/post.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = express.Router();

// PUBLIC routes (no token needed)
router.get("/", getAllPosts);
// MUST be before /:id so Express doesn't confuse "analytics" for an ID!
// Because Express reads routes from top to bottom, if a user goes to /api/posts/analytics, Express will hit line 11 first, think "analytics" is an :id, and your isMongoId() validation will throw an "Invalid post ID format" error!

router.get("/analytics", getPostAnalytics);

router.get("/:id",
    [param('id').isMongoId().withMessage('Invalid post ID format')],
    validate,
    getPostById
);


// PROTECTED routes (token required)
router.post("/",
    protectRoute,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('content').trim().notEmpty().withMessage('Content is required'),
    ],
    validate,
    createPost
);


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

router.delete("/:id",
    protectRoute,
    [param('id').isMongoId().withMessage('Invalid post ID format')],
    validate,
    deletePost
);

router.put("/:id/like", 
    protectRoute,
    [param('id').isMongoId().withMessage('Invalid post Id format')],
    validate,
    toggleLike
)
export default router;
