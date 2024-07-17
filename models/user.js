import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/blog")

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId, ref:"post"
        }
    ]
})

const userModel = mongoose.model("user",userSchema);
export default  userModel;