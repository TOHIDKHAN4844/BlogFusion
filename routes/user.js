const {Router } = require("express");
const User = require("../models/user");

const router= Router();

router.get('/signin', (req, res)=>{
    return res.render("signin");
});

router.get('/signup', (req, res)=>{
    return res.render("signup");
});


router.post("/signup", async (req, res) => {
    try {
         // console.log(req.body);
        const { fullName, email, password } = req.body;

        // Create a new user in the database
        await User.create({
            fullName,
            email,
            password,
        });

        // Redirect to the home page after signup
        return res.redirect("/");
    } catch (err) {
        console.error("Error creating user:", err.message);
        return res.status(500).send("Error during signup!");
    }
});

router.post("/signin", async (req, res) =>{
    const {email, password} = req.body;
   try{
    
    const token = await User.matchPasswordAndGenerateToken(email, password);

  //  console.log('token', token);
   
    return res.cookie('token', token).redirect("/");
   }
   catch(error){
      return res.render('signin',{ error: "Incorrect Email and Password"});
   }
}); 

router.get("/logout", (req, res) =>{
    res.clearCookie("token").redirect("/");
});


module.exports= router;