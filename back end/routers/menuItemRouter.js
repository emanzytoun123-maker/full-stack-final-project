const express = require("express");
const router = express.Router();

const authMiddleware = require("../authMiddleware");

const {
  addMenuItem,
  getRestaurantMenu,
  updateMenuItem,
  deleteMenuItem
} = require("../controllers/menuItemController");

router.post("/", authMiddleware, addMenuItem);

router.get("/restaurant/:restaurantId", getRestaurantMenu);

router.patch("/:itemId", authMiddleware, updateMenuItem);

router.delete("/:itemId", authMiddleware, deleteMenuItem);

module.exports = router;