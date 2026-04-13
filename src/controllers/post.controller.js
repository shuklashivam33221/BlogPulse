import { Post } from "../models/post.model.js";

// ==================== CREATE A NEW POST ====================
// PROTECTED — only logged-in users can create posts

export const createPost = async (req, res) => {
    try {
        const {title , content, tags} = req.body || {};

        if(!title || !content) 
        {
            return res.status(401).json({messgage : "Title and content are requird "});
        }

        // req.user._id comes from the auth middleware (the JWT wristband!)
        // We automatically set the author to whoever is logged in

        const newPost = await Post.create({
            title, 
            content,
            author : req.user._id, // The logged in user is automatically the author 
            tags : tags || [],
        });

        res.status(200).json({
            message : "Post created Succesfully",
            post : newPost
        });
    } catch(error) {
        console.error("Error in createPost:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// ==================== GET ALL POSTS ====================
// PUBLIC — anyone can read blog posts (no wristband needed)

export const getAllPosts = async (req, res) => {
    try{

        // .populate('author', 'name email bio') replaces the author ID
        // with the actual user's name, email, and bio
        // .sort({ createdAt: -1 }) puts newest posts first

        const posts = await Post.find().populate("author", "name email bio").sort({createdAt : -1});

        res.status(200).json({
            count : posts.length,
            posts
        });
    } catch(error){
        console.error("Error in getAllPosts:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ==================== GET A SINGLE POST BY ID ====================
// PUBLIC — anyone can read a specific blog post
export const getPostById = async (req, res) => {
    try 
    {
        // req.params.id grabs the :id from the URL (e.g., /api/posts/abc123)
        const post = await Post.findById(req.params.id).populate("author", "name email bio");

        if(!post) 
        {
            return res.status(404).json({
                message : "Post not found"
            });
        }

        res.status(200).json({
            post,
        });
    } catch(error){
        console.error("Error in getPostById:", error.message);
        res.status(500).json({
            message : "Internnal Server Error"
        })
    }
};

// ==================== UPDATE A POST ====================
// PROTECTED — only the AUTHOR of the post can update it
export const updatePost = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post)
        {
            return res.status(404).json({
                message : "Post not found"
            });
        }

        // AUTHORIZATION CHECK: Is the logged-in user the actual author?
        // .toString() is needed because MongoDB ObjectIds are objects, not strings
        // Without .toString(), "abc123" !== ObjectId("abc123") would always be true
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only edit your own posts" });
        }

        const { title, content, tags } = req.body || {};
        if (title) post.title = title;
        if (content) post.content = content;
        if (tags) post.tags = tags;
        const updatedPost = await post.save();
        res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost,
        });
    } catch (error) {
        console.error("Error in updatePost:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ==================== DELETE A POST ====================
// PROTECTED — only the AUTHOR of the post can delete it

export const deletePost = async (req, res) => {
    try 
    {
        const post = await Post.findById(req.params.id);

        if(!post)
        {
            return res.status(404).json({
                message : "Post Not Found"
            });
        }

        // Same authorization check — don't let users delete other people's posts!
        if(post.author.toString()!==req.user._id.toString())
        {
            return res.status(403).json({
                message : "Not aloowed"
            })
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" });
    }catch(error)
    {
        console.error("Error in deletePost", error.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
};

