import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    title:{
        type : String,
        required : true,
        trim: true // it will trim leading and trailing whitespaces
    },

    content : {
        type : String,
        required : true
    },
    coverImage : {
        type : String, // We just store the URL string
        default : ""
    },
    // okay how we link a post to a specific user 
    author : {
        type : mongoose.Schema.Types.ObjectId, // this specifically stores a mongoDb id
        ref : "User", // this is for ref take from user 
        required : true
    },

    tags : {
        type : [String], // an array of string like ["Tech", "Coding", Nodejs]

        default : [],
    }, 
    likes :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }]
},
{
        timestamps : true,
}
);

const Post = mongoose.model("Post", postSchema);

export {Post};