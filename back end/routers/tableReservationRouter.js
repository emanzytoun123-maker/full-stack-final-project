const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createReservation,
  getMyReservations,
  getRestaurantReservations,
  cancelReservation,
  updateReservationStatus
} = require("../controllers/tableReservationController");

router.post("/", authMiddleware, createReservation);
router.get("/my", authMiddleware, getMyReservations);
router.patch("/:reservationId/cancel", authMiddleware, cancelReservation);
router.patch("/:reservationId/status", authMiddleware, updateReservationStatus);
router.get("/restaurant", authMiddleware, getRestaurantReservations);

module.exports = router;