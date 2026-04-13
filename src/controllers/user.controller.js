import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js"; // JWT token generator

// Register user 
export const registerUser = async (req, res) => {
     try {

        // grab what the frontend send
        const { name, email, password} = req.body || {}; // crash happens here if the fields are empty means the user have'nt entered details properly ,,,, solution is take an empty ds and check 
        
        // check if any entry is not entered 
        if (!email || !password || !name) {
            return res.status(400).json({
            message: "All fields are required"
        });
        }

        // check whether this user exists in db or not
        const existingUser = await User.findOne({ email });
        if(existingUser)
            return res.status(400).json({message : "User already exist with this email"});

        // if user do not exist then bcrypt the password and store in the database (10 is the "salt rounds" — how many times it scrambles)
        const hashedPassword = await bcrypt.hash(password, 10);

        // create the new user in DB
        const newUser = await User.create({
            name, 
            email, 
            password : hashedPassword
        });

        // send success status along with JWT token
        // The token is what the frontend will store and send back with every future request
        // to prove that this user is logged in
        res.status(201).json({
            message: "User registered successfully",
            user : {
                id : newUser._id,
                name : newUser.name,
                email : newUser.email,
            },
            token: generateToken(newUser._id), // Generate a JWT token using the new user's ID
        });
     } catch(error){
        console.error("Error in register User : ", error.message);
        res.status(500).json({ message : "Internal Server Error" });
     }
};


// Login User 

export const loginUser = async(req, res) => {

    try {
        // 1 . Find email and password
        const {email, password} = req.body || {};

        if(!email || !password) 
            return res.status(400).json({message : "All fields are required"});

        // 2. Find the user by email
        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({message: "Invalid Email or Password"});
        }

        // 3. Compare the password they typed with the hashed password in the DB
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect) {
            return res.status(401).json({message : "Invalid Email or Password"});
        }
        // if password is also correct, send back user data + JWT token
        // The frontend stores this token and includes it in every future request header
        // Format: Authorization: Bearer <token>
        return res.status(200).json({
            message : "Login Successful",
            user : {
                id : user._id,
                name : user.name,
                email : user.email
            },
            token: generateToken(user._id), // Generate a JWT token using the existing user's ID
        });
    } catch(error){
        console.error("Error in loginUser", error.message);
        res.status(500).json({message : "Internal Server Error"});
    }
    // "If an account exists with this email, we've sent a password reset link." in forgot password 
};


// now Get profile and update profile 
// ==================== GET USER PROFILE ====================
// This is a PROTECTED route — the auth middleware already verified the token
// and attached the user's data to req.user BEFORE this function runs

export const getUserProfile = async (req, res) =>{
    try {
        // req.user was set by protectRoute middleware
        // It already contains the full user object (minus the password)
        // So we don't need to query the database again!
        res.status(200).json({
            user : req.user,
            // This came from the middleware, not from the frontend
        });
    } catch (error){
        console.error("Error in getUserProfile:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ==================== UPDATE USER PROFILE ====================
// Also PROTECTED — only logged-in users can update their own profile

export const updateProfile = async (req, res) => {
    try {
        const {name, bio} = req.body || {};

        // req.user._id comes from the JWT token — we know exactly WHO this is
        const user = await User.findById(req.user._id);

        if(!user) return res.status(404).json({ message: "User not found" });

        // Only update fields that were actually sent
        if (name) user.name = name;
        if (bio) user.bio = bio;

        // Save the updated user to the database
        const updatedUser = await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                bio: updatedUser.bio,
            },
        });
    } catch (error) {
        console.error("Error in updateUserProfile:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
