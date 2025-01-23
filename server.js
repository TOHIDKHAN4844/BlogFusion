require("dotenv").config();

const { render } = require("ejs");
const express = require("express");
const path =require("path");
const mongoose= require("mongoose");
const cookiePaser= require("cookie-parser");

const Blog = require('./models/blog')

const userRoute = require("./routes/user");
const blogRoute= require("./routes/blog");

const {checkForAuthenticationCookie}= require("./middlewares/authentication");

const attachUser = require("./middlewares/attachUser");

const app = express();
const PORT = process.env.PORT || 8000; 

mongoose
  .connect(process.env.MONGO_URL  )
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('Database connection error:', err));


app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({extended: false})); 
app.use(cookiePaser());

// Attach user to res.locals
app.use(attachUser);
// Other routes
app.use("/user", require("./routes/user"));

app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve('./public')));

app.get("/", async(req, res) =>{
  const allBlogs = await Blog.find({}) ;
res.render("home", {
  user: res.locals.user,
  blogs: allBlogs,
});
});



app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));


