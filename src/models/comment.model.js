import mongoose from "mongoose";

const commentSchema = mongoose.model({
    content : {
        type : String,
        required : true
    },

    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    post : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Post",
        required : true
    }
}, {
    timeStamp : true
})

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;