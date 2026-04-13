import express from "express";

import { createPost,  getAllPosts, getPostById, updatePost, deletePost} from "../controllers/post.controller.js";

import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// public routes , no token needed
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// PROTECTED routes only authorised 
router.post("/", protectRoute, createPost);
router.put("/:id", protectRoute, updatePost);
router.delete("/:id", protectRoute, deletePost);

export default router;
