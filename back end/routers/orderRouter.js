const express = require("express");
const router = express.Router();

const authMiddleware = require("../authMiddleware");
const {
  cancelOrder
} = require("../controllers/orderCancellationController");
const {
  createSurplusOrder
} = require("../controllers/surplusOrderController");

const {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus
} = require("../controllers/orderController");

router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getMyOrders);
router.get("/restaurant", authMiddleware, getRestaurantOrders);
router.patch("/:orderId/status", authMiddleware, updateOrderStatus);
router.post("/surplus", authMiddleware, createSurplusOrder);
router.patch("/:orderId/cancel", authMiddleware, cancelOrder);
module.exports = router;