
const express = require("express");
const router = express.Router();

const {
  getRestaurants,
  getRestaurantById,
  getNearbyRestaurants,
  updateMyRestaurant
} = require("../controllers/restaurantController");

const authMiddleware = require("../authMiddleware");

// Get all restaurants
router.get("/", getRestaurants);

// Get nearby restaurants
router.get("/nearby", getNearbyRestaurants);

// Get one restaurant by ID
router.get("/:id", getRestaurantById);

// Update my restaurant
router.patch("/my", authMiddleware, updateMyRestaurant);

module.exports = router;
