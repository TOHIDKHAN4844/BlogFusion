const {Router} = require("express");
const multer= require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Add to your .env file
  api_key: process.env.CLOUDINARY_API_KEY,       // Add to your .env file
  api_secret: process.env.CLOUDINARY_API_SECRET, // Add to your .env file
});

// Configure Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blogfusion", // Name of the folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Allowed file formats
  },
});



const upload = multer({storage: storage});

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
      user: req.user,
  });
});

router.get("/:id", async(req, res)=> {
const blog = await Blog.findById(req.params.id).populate("createdBy");
const comments = await Comment.find({blogId: req.params.id}).populate(
  "createdBy"
);
  

return res.render("blog", {
  user: req.user,
  blog,
  comments,
});
});

router.post('/comment/:blogId', async(req, res) =>{
  await Comment.create({
  content: req.body.content,
  blogId: req.params.blogId,
  createdBy: req.user._id,
});
return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single('coverImage'), async(req, res) => {
  try {
    const { title, body } = req.body;

    // Create the blog entry with the Cloudinary URL
    const blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id,
      coverImageURL: req.file.path, // Cloudinary URL
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Error creating blog:", err);
    return res.status(500).send("Something went wrong while creating the blog.");
  }
});

router.delete("/comment/:id", async (req, res) => {
  try {
    const commentId = req.params.id;
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({success: true, message: 
      "Comment deleted finally"
    });
    
  } catch (error) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete comment." });
  }
});


module.exports= router;