
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createOuting,
  joinOuting,
  addOutingOption
} = require("../controllers/outingController");
console.log("authMiddleware:", typeof authMiddleware);
console.log("createOuting:", typeof createOuting);
console.log("joinOuting:", typeof joinOuting);
console.log("addOutingOption:", typeof addOutingOption);

router.post("/", authMiddleware, createOuting);
router.post("/join", authMiddleware, joinOuting);
router.post("/:outingId/options", authMiddleware, addOutingOption);

module.exports = router;
