const express = require("express");
const router = express.Router();


const { registerUser, loginUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
const authMiddleware = require("../authMiddleware");
const { getMyProfile } = require("../controllers/userController");

router.get("/profile", authMiddleware, getMyProfile);
module.exports = router;