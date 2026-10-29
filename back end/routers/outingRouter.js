
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createOuting,
  joinOuting,
  addOutingOption,
  voteForRestaurant,
  closeOuting
} = require("../controllers/outingController");

router.post("/", authMiddleware, createOuting);
router.post("/join", authMiddleware, joinOuting);
router.post("/:outingId/options", authMiddleware, addOutingOption);
router.post("/:outingId/vote", authMiddleware, voteForRestaurant);
router.patch("/:outingId/close", authMiddleware, closeOuting);

module.exports = router;
