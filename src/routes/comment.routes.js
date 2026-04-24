import express from 'express';
import { addComment, getCommentsByPost, deleteComment } from '../controllers/comment.controller.js';
import { body, param } from 'express-validator';
import protectRoute from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

const router = express.Router();

// PUBLIC — anyone can read comments on a post
router.get('/:postId',
    [param('postId').isMongoId().withMessage('Invalid post ID format')],
    validate,
    getCommentsByPost
);


// PROTECTED — must be logged in to add a comment
router.post('/:postId',
    protectRoute,
    [
        param('postId').isMongoId().withMessage('Invalid post ID format'),
        body('content').trim().notEmpty().withMessage('Comment cannot be empty')
    ],
    validate,
    addComment
);


// PROTECTED — only the comment author can delete it
router.delete('/:commentId',
    protectRoute,
    [param('commentId').isMongoId().withMessage('Invalid comment ID format')],
    validate,
    deleteComment
);


export default router;
