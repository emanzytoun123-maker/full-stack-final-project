const express = require("express");
const router = express.Router();

const {
  getRestaurants,
  updateMyRestaurant
} = require("../controllers/restaurantController");

const authMiddleware = require("../authMiddleware");

router.get("/", getRestaurants);

router.patch("/my", authMiddleware, updateMyRestaurant);

module.exports = router;
