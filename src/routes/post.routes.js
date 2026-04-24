import express from "express";
import { body, param } from "express-validator";
import { createPost, getAllPosts, getPostById, updatePost, deletePost } from "../controllers/post.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = express.Router();

// PUBLIC routes (no token needed)
router.get("/", getAllPosts);
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


export default router;
