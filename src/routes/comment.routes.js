import express from 'express';
import { addComment, getCommentsByPost, deleteComment } from '../controllers/comment.controller.js';
import { body, param } from 'express-validator';
import protectRoute from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

const router = express.Router();

// PUBLIC — anyone can read comments on a post
/**
 * @swagger
 * /api/comments/{postId}:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/:postId',
    [param('postId').isMongoId().withMessage('Invalid post ID format')],
    validate,
    getCommentsByPost
);


// PROTECTED — must be logged in to add a comment
/**
 * @swagger
 * /api/comments/{postId}:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
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
/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.delete('/:commentId',
    protectRoute,
    [param('commentId').isMongoId().withMessage('Invalid comment ID format')],
    validate,
    deleteComment
);


export default router;
