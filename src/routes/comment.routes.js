import express from 'express';
import { addComment, getCommentsByPost, deleteComment } from '../controllers/comment.controller.js';
import { body } from 'express-validator';
import protectRoute from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

const router = express.Router();

// PUBLIC — anyone can read comments on a post
router.get('/:postId', getCommentsByPost);

// PROTECTED — must be logged in to add a comment
router.post('/:postId',
    protectRoute,
    [
        body('content').trim().notEmpty().withMessage('Comment cannot be empty')
    ],
    validate,
    addComment
);

// PROTECTED — only the comment author can delete it
router.delete('/:commentId', protectRoute, deleteComment);

export default router;
