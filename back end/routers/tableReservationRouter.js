
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createReservation
} = require("../controllers/tableReservationController");

router.post("/", authMiddleware, createReservation);

module.exports = router;
