const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/userController");

// ✅ Register a new user (admin or worker)
router.post("/register", registerUser);

// ✅ Login route for all users
router.post("/login", loginUser);

module.exports = router;
