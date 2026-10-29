
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createOuting } = require("../controllers/outingController");

router.post("/", authMiddleware, createOuting);

module.exports = router;
