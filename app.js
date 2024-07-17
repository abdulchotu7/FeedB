import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "./models/user.js";
import postModel from "./models/post.js";

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function islogged(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        res.redirect("/");
    } else {
        try {
            const data = jwt.verify(token, "shhh");
            req.user = data;
            next();
        } catch (err) {
            res.redirect("/");
        }
    }
}

function isloggedOut(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        res.redirect("/profile");
    } else {
        next();
    }
}

app.get("/", (req, res) => {
    res.render('app');
});

app.get("/feed",islogged,async (req,res)=>{
    const allposts = await  postModel.find().populate('username','username')
    console.log(allposts[0]);
    res.render("feed",{allposts});
})

app.get("/like/:pid",islogged,async (req,res)=>{
    const p = await postModel.findOne({_id:req.params.pid})
    console.log(req.user)
    p.likes.push(req.user.id)
    p.save()
    res.redirect("/feed")

})

app.get("/register",isloggedOut,(req,res)=>{
    res.render("index");
})

app.get("/logout", islogged, (req, res) => {
    res.cookie("token", "");
    res.redirect("/");
});

app.get("/login", isloggedOut, (req, res) => {
    res.render("login");
});

app.get("/post", islogged, (req, res) => {
    res.render("add");
});

app.post("/post", islogged, async (req, res) => {
    const { content } = req.body;
    const postedpost = await postModel.create({
        username: req.user.id,
        content
    });

    const get_user_to_update = await userModel.findOne({ _id: req.user.id });
    get_user_to_update.posts.push(postedpost._id);
    await get_user_to_update.save();

    res.redirect("/post");
});

app.get("/profile", islogged, (req, res) => {
    res.send("You are already logged in");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        res.redirect("/");
    } else {
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                const token = jwt.sign({ email, id: user._id }, "shhh");
                res.cookie("token", token);
                res.redirect("/profile");
            } else {
                res.redirect("/");
            }
        });
    }
});

app.post("/register", (req, res) => {
    const { username, name, email, password } = req.body;
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            const user = await userModel.create({
                username,
                name,
                email,
                password: hash
            });
            console.log(user);
            res.redirect("/login");
        });
    });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
