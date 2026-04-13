import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// This middleware sits BETWEEN the route and the controller
// It checks if the user has a valid JWT token before letting them access protected routes
//
// FLOW:
// Request comes in → auth middleware intercepts → checks token → if valid, attaches user to req.user → controller runs
// If token is missing or invalid → immediately returns 401 and controller NEVER runs

const protectRoute = async (req, res, next) => {
    try 
    {
        // 1. Get the token from the request header
        // Frontend sends it as: Authorization: Bearer eyJhbGciOi...
        // We split by space and take the second part (the actual token)

        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({message : "No token provided, access denied"});
        }

        const token = authHeader.split(" ")[1]; // ["Bearer", "eyJhbG..."] → grab index 1
        
        // 2. Verify the token using our secret key
        // jwt.verify() does two things:
        //   a) Recalculates the signature and checks if it matches (was it tampered with?)
        //   b) Checks if the token has expired (is it past the 15 day limit?)
        // If either check fails, it throws an error → caught by our catch block

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find the user in the database using the ID hidden inside the token
        // .select("-password") means "give me everything EXCEPT the password field"
        // We don't want the hashed password floating around in req.user

        const user = await User.findById(decoded.id).select("-password");

        if(!user) return res.status(401).json({message : "User not found, token is invalid"});

        // 4. Attach the user to the request object
        // Now ANY controller that runs after this middleware can access req.user
        // This is how the controller knows WHO is making the request

        req.user = user;

        // 5. Call next() to pass control to the next middleware or the controller
        // Without next(), the request gets stuck here forever
        next();
    }
catch(error) {
    console.error("Error in auth middleware:", error.message);

    res.status(401).json({message : "TOken is invalid or expired"});
}
};

export default protectRoute;