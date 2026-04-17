import express from 'express';
import { addComment, getCommentByPost, deleteComment} from '../controllers/comment.controller.js';
import { body } from 'express-validator';
import protectRoute from '../middleware/auth.middleware.js';
import {validate} from '../middleware/validate.middleware.js';
import {protectRoute} from '../middleware/auth.middleware.js';

const router = express.Router();

// validation required for adding comment and if the user is logged in then he can comment so we put protectRoute first 
router.get('/:postId',
    protectRoute,
    [
        body('content').trim().notEmpty().withMessage('Comments can not be empty')
    ],
    validate,
    addComment
 );

