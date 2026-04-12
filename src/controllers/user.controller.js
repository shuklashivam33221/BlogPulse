import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

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

        // send success status 
        res.status(200).json({
            user : {
                id : newUser.id,
                name : newUser.name,
                email : newUser.email,
            },
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
            return res.status(400).json({message : "All fields are required "});

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
        // if password is also correct 
        return res.status(200).json({
            message : "Login Successful",
            user : {
                id : user.id,
                name : user.name,
                email : user.email
            }
        });
    } catch(error){
        console.error("Error in loginUser", error.message);
        res.status(500).json({message : "Internal Server Error"});
    }
    // "If an account exists with this email, we've sent a password reset link." in forgot password 
};