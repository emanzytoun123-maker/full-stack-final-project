const mongoose = require("mongoose");
const Order = require("../models/orderSchema");
const Restaurant = require("../models/restaurantSchema");
const MenuItem = require("../models/menuItemSchema");

// إنشاء طلب أكل عادي
const createOrder = async (req, res) => {
  try {
    if (req.user.role !== "consumer") {
      return res.status(403).json({
        message: "Only consumers can create orders"
      });
    }

    const { restaurant, items } = req.body || {};

    if (!mongoose.isObjectIdOrHexString(restaurant)) {
      return res.status(400).json({
        message: "A valid restaurant ID is required"
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one item"
      });
    }

    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    const orderItems = [];
    let totalInFils = 0;

    for (const requestedItem of items) {
      if (
        !requestedItem ||
        typeof requestedItem !== "object" ||
        Array.isArray(requestedItem)
      ) {
        return res.status(400).json({
          message: "Invalid order item"
        });
      }

      // سنضيف دعم عروض الفائض في الخطوة التالية
      if (requestedItem.offer !== undefined) {
        return res.status(400).json({
          message: "Surplus orders are not supported yet"
        });
      }

      const { menuItem, quantity } = requestedItem;

      if (!mongoose.isObjectIdOrHexString(menuItem)) {
        return res.status(400).json({
          message: "Invalid menu item ID"
        });
      }

      if (!Number.isSafeInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: "Quantity must be a positive whole number"
        });
      }

      const item = await MenuItem.findOne({
        _id: menuItem,
        restaurant,
        isAvailable: true
      });

      if (!item) {
        return res.status(400).json({
          message: "Item is unavailable or does not belong to this restaurant"
        });
      }

      const priceInFils = Math.round(item.price * 1000);
      const lineTotal = priceInFils * quantity;

      if (
        !Number.isSafeInteger(priceInFils) ||
        priceInFils < 0 ||
        !Number.isSafeInteger(lineTotal) ||
        !Number.isSafeInteger(totalInFils + lineTotal)
      ) {
        return res.status(400).json({
          message: "Invalid price or order total"
        });
      }

      orderItems.push({
        menuItem: item._id,
        quantity,
        priceAtOrder: priceInFils / 1000
      });

      totalInFils += lineTotal;
    }

    const newOrder = new Order({
      consumer: req.user.userId,
      restaurant,
      items: orderItems,
      totalPrice: totalInFils / 1000,
      status: "pending"
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not create order"
    });
  }
};

// عرض طلبات المستهلك المسجل دخوله
const getMyOrders = async (req, res) => {
  try {
    if (req.user.role !== "consumer") {
      return res.status(403).json({
        message: "Only consumers can access this route"
      });
    }

    const orders = await Order.find({
      consumer: req.user.userId
    })
      .populate("restaurant", "name city")
      .populate("items.menuItem", "name image")
      .sort({ _id: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Could not get your orders"
    });
  }
};
const getRestaurantOrders = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurants can access this route"
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user.userId
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    const orders = await Order.find({
      restaurant: restaurant._id
    })
      .populate("consumer", "name")
      .populate("items.menuItem", "name")
      .sort({ _id: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Could not get restaurant orders"
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurants can update order status"
      });
    }

    const { orderId } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isObjectIdOrHexString(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    if (!["accepted", "ready", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be accepted, ready or completed"
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user.userId
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    // الحالة المطلوبة قبل الانتقال للحالة الجديدة
    const previousStatus = {
      accepted: "pending",
      ready: "accepted",
      completed: "ready"
    };

    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        restaurant: restaurant._id,
        status: previousStatus[status]
      },
      {
        $set: { status }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!order) {
      return res.status(409).json({
        message: "Order not found in your restaurant or status change is not allowed"
      });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not update order status"
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus
};