import { response } from "express";
import { Post } from "../models/post.model.js";
import { createClient } from 'redis';

// 2. Connect to the Upstash Redis Database
let redisClient;
if(process.env.REDIS_URI){
    redisClient = createClient({ url : process.env.REDIS_URI });

    redisClient.on('error', (err) => console.log('❌ Redis Client Error:', err));

    redisClient.connect()
    .then(() => console.log("✅ Connected to Upstash Redis!"))
    .catch(console.error);
}

// ==================== CREATE A NEW POST ====================
// PROTECTED — only logged-in users can create posts

export const createPost = async (req, res) => {
    try {
        const {title , content, tags} = req.body || {};

        if(!title || !content) 
        {
            return res.status(401).json({messgage : "Title and content are requird "});
        }

        // If an image was uploaded, Multer puts its info in req.file
        // req.file.path contains the secure Cloudinary URL

        const imageUrl = req.file ? req.file.path : "";

        // req.user._id comes from the auth middleware (the JWT wristband!)
        // We automatically set the author to whoever is logged in

        const newPost = await Post.create({
            title, 
            content,
            coverImage : imageUrl, // Save the URL to DB
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

        // We grab all the query parameters first
        const page  = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const tag = req.query.tag || "";

        // ==========================================
        // REDIS STEP 1: Create a unique "Cache Key"
        // Every unique search needs its own unique save slot in Redis!
        // ==========================================


        const cacheKey = `posts:page=${limit} : search=${search}:tag=${tag}`;

        // ==========================================
        // REDIS STEP 2: The "Cache Hit" Scenario
        // Check if Redis already has this exact data in RAM
        // ==========================================
        if(redisClient){ 
            const cachedData = await redisClient.get(cacheKey);
            if(cachedData) {
                conslole.log("Cache hit : Serving from redis RAM!!");
                // Data comes out of Redis as a String, so we parse it back to JSON
                return res.status(200).json(JSON.parse(cachedData)); 
            }
        }

         // ==========================================
        // REDIS STEP 3: The "Cache Miss" Scenario
        // If we get here, Redis didn't have it. We MUST ask MongoDB.
        // ==========================================
        console.log("🐢 CACHE MISS: Serving from MongoDB...");


        // .populate('author', 'name email bio') replaces the author ID
        // with the actual user's name, email, and bio
        // .sort({ createdAt: -1 }) puts newest posts first

        // ==================== GET ALL POSTS ====================
        // PUBLIC — anyone can read blog posts
        // Supports: ?search=keyword  ?tag=Tech  ?page=2  ?limit=5
        
        const filter = {};
        // An empty object {} in MongoDB means "match everything." If we don't add anything to this object, MongoDB will return every single post. 

        if(req.query.serach){
            filter.$or = [
                {
                    title : {$regex : req.query.serach, $options: "i"}
                },
                {
                    content : {$regex : req.query.serach, $options:"i"}
                }
            ]
        }
        // req.query.search checks if the user typed ?search=something in the URL.
        // If they did, we add an $or array to our filter object.
        // $or tells MongoDB: "Find posts where CONDITION A or CONDITION B is true."
        // $regex: req.query.search means "search for this exact text inside the string".
        // $options: "i" means "case-insensitive" (so "react" matches "React" and "REACT").

        if(req.query.tag){
            filter.tags = {$in : [req.query.tag]};
        }

        //Checks if ?tag=Backend is in the URL.
        // filter.tags = { $in: [...] } tells MongoDB: "Look at the tags array in the database. Return this post only if that array contains the value we provided." If it wasn't there: Users couldn't click on a "Backend" tag to see only backend-related posts.

        // The Pagination Math
        
        const skip = (page - 1) * limit;

        // parseInt: Query parameters from URLs always come in as strings (e.g., "2"). parseInt turns "2" into a math number 2.
        // || 1 (Logical OR): This is a fallback. If the user doesn't provide ?page=..., req.query.page is undefined. parseInt(undefined) is NaN (Not a Number). If the left side is NaN, it defaults to 1 (Page 1).
        // skip Math: If you want page 3, and limit is 10 per page. (3 - 1) * 10 = 20. This tells the database to "skip the first 20 posts and give me the next 10."

        const total = await Post.countDocuments(filter);
        // Asks the database, "How many posts match this filter exactly?" How it works: MongoDB counts the matches without actually downloading the post data. This is extremely fast. If it wasn't there: The frontend wouldn't know how many pages exist. It wouldn't be able to render buttons like [Page 1] [Page 2] [Page 3] [Next >].

        const posts = await Post.find(filter)
        .populate("author", "name email bio")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const responseData = {
        count: posts.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        posts
    }

    // ==========================================
    // REDIS STEP 4: Save to Redis for next time!
    // We save the responseData into Redis and tell it to expire after 5 minutes (300 seconds)
    // ==========================================
    if(redisClient){
        // .setEx(key, time, value): This stands for "Set with Expiration". It tells Redis: "Save this data under this key, but automatically delete it from your memory after 300 seconds (5 minutes)."
        await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
    }
    // Finally, send the data to the user
    res.status(200).json(responseData);
        
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


// ==================== LIKE / UNLIKE A POST ====================
// PROTECTED — must be logged in to like
// Toggle behavior: if already liked → unlike, if not liked → like
export const toggleLike = async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        if(!post) 
        {
            return res.status(404).json({
                message : "Post not found"
            })
        }

        const userId = req.user._id.toString();

        // Check if this user already liked this post
        //.some() loops through the array and returns true if any element passes the test

        // 3. Why we use .some() instead of .includes()
        // This is directly related to the .toString() problem above!

        // .includes() is a great JavaScript feature. It looks at an array and says, "Is this exact value in here?" Behind the scenes, it uses === to check.

        // If our likes array was just an array of plain strings ["userId1", "userId2"], we could easily use .includes("userId1").

        // But our likes array is an array of MongoDB ObjectIds: [ObjectId("..."), ObjectId("...")].

        // If we tried to do this:

        // javascript
        // post.likes.includes(req.user._id)
        // It would return false every time, because includes() is trying to compare Objects in memory using === and failing.

        // Why .some() is the fix: .some() is more powerful. Instead of just searching for an exact value, it lets us write a custom "test" function. It loops through the array, and we can convert the ID to a string inside the loop before checking it:

        // javascript
        // // Loop through every 'id' in the array
        // post.likes.some((id) => {
        //     // Convert it to a string, THEN check if it matches
        //     return id.toString() === userId; 
        // });

        const alreadyLiked = post.likes.some((id) => id.toString() === userId);

        if(alreadyLiked) {
            // UNLIKE — remove user's ID from the likes array
            // .filter dont remove the element directly but it creates a brand new array and stores the element other than id which likes it for example initally person with id 1, 2, 3, 4 liked the post but now 2 wants to dislike it so how id.toString !== userId means other than 2!=2 ie 1, 3, 4 will be stored in the other one

            post.likes = post.likes.filter(
                (id) => id.toString() !== userId
            );
        }
        else {
            // LIKE — add user's ID to the likes array
            post.likes.push(req.user._id);
        }

        await post.save();
        res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            likesCount: post.likes.length,
        });
    }
    catch(error) {
        console.error("Error in toggleLike", error.message);
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

// ==================== GET BLOG ANALYTICS (AGGREGATION PIPELINE) ====================
// PUBLIC — anyone can see the stats
// Uses MongoDB Aggregation to process data on the database level

// ==================== GET BLOG ANALYTICS (AGGREGATION PIPELINE) ====================
// PUBLIC — anyone can see the stats
// Uses MongoDB Aggregation to process data on the database level

export const getPostAnalytics = async (req, res) => {
    try {
        // We pass an array of "stages" to the aggregate function
        // Each stage takes the output of the previous stage and processes it
        const stats = await Post.aggregate([
            {
                // Stage 1: Group EVERYTHING together (id: null)
                $group: {
                    _id: null,
                    totalPosts: { $sum: 1 }, // Count every document
                    // Calculate total likes by measuring the size of the likes array
                    totalLikes: { $sum: { $size: "$likes" } } 
                }
            },
            {
                // Stage 2: Clean up the output, hide the _id field
                $project: {
                    _id: 0,
                    totalPosts: 1,
                    totalLikes: 1
                }
            }
        ]);

        // Tag Analytics: Find the most used tags
        const tagStats = await Post.aggregate([
            { $unwind: "$tags" }, // Deconstruct the tags array (1 post with 3 tags becomes 3 separate items)
            {
                $group: {
                    _id: "$tags", // Group by the tag name
                    count: { $sum: 1 } // Count how many times it appears
                }
            },
            { $sort: { count: -1 } }, // Sort by most popular first
            { $limit: 5 } // Only get the top 5
        ]);

        res.status(200).json({
            // aggregate always returns an array. If no posts exist, default to 0
            generalStats: stats.length > 0 ? stats[0] : { totalPosts: 0, totalLikes: 0 },
            popularTags: tagStats
        });
    } catch (error) {
        console.error("Error in getPostAnalytics:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
