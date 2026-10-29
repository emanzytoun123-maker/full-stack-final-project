
const express = require("express");
const router = express.Router();

const authMiddleware = require("../authMiddleware");

const {
  getMyNotifications,
  markNotificationAsRead
} = require("../controllers/notificationController");

router.get("/my", authMiddleware, getMyNotifications);

router.patch("/:notificationId/read", authMiddleware, markNotificationAsRead);

module.exports = router;
