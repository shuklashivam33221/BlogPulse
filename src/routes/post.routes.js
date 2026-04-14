import express from "express";
import { body } from "express-validator";
import { createPost, getAllPosts, getPostById, updatePost, deletePost } from "../controllers/post.controller.js";
import protectRoute from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

const router = express.Router();

// PUBLIC routes (no token needed)
router.get("/", getAllPosts);
router.get("/:id", getPostById);

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

router.put("/:id", protectRoute, updatePost);
router.delete("/:id", protectRoute, deletePost);

export default router;
