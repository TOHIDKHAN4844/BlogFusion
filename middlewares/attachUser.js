const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to decode token and attach user
const attachUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.locals.user = null; // No user logged in
    return next();
  }

  try {
    const decoded = jwt.verify(token, "$uperMan@123"); // Use the same secret key as in `sign()`
    const user = await User.findById(decoded._id); // Find user by ID from the token
    //console.log("User retrieved in attachUser:", user);
    res.locals.user = user; // Attach user to res.locals
    next();
  } catch (err) {
   // console.error("Error decoding token:", err.message);
    res.locals.user = null; // Invalid token
    next();
  }
};

module.exports = attachUser;
