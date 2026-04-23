import Comment from "../models/comment.model.js";

// ==================== ADD A COMMENT ====================
// PROTECTED — must be logged in to comment
// The postId comes from the URL: /api/comments/:postId
// The author comes from req.user (set by auth middleware)
export const addComment = async (req, res) => {
    try {
        const { content } = req.body || {};
        const postId = req.params.postId; // grabbed from the URL /:postId

        const newComment = await Comment.create({
            content,
            author: req.user._id,  // whoever is logged in becomes the commenter
            post: postId,          // which post this comment belongs to
        });

        res.status(201).json({
            message: "Comment added successfully",
            comment: newComment,
        });
    } catch (error) {
        console.error("Error in addComment:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ==================== GET COMMENTS BY POST ====================
// PUBLIC — anyone can read comments on a post
// Finds all comments where the "post" field matches the postId from the URL
export const getCommentsByPost = async (req, res) => {
    try {
        // Comment.find({ post: req.params.postId }) means:
        // "Find all comments where the post field equals this postId"
        const comments = await Comment.find({ post: req.params.postId })
            .populate("author", "name email")  // replace author ID with actual name & email
            .sort({ createdAt: -1 });          // newest comments first

        res.status(200).json({
            count: comments.length,
            comments,
        });
    } catch (error) {
        console.error("Error in getCommentsByPost:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ==================== DELETE A COMMENT ====================
// PROTECTED — only the person who wrote the comment can delete it
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Authorization check: is the logged-in user the one who wrote this comment?
        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        await Comment.findByIdAndDelete(req.params.commentId);
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error in deleteComment:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};