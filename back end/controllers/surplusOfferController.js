
const mongoose = require("mongoose");
const SurplusOffer = require("../models/surplusOfferSchema");
const Restaurant = require("../models/restaurantSchema");
const MenuItem = require("../models/menuItemSchema");

// Add a surplus offer
const addSurplusOffer = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurant accounts can add offers"
      });
    }

    const restaurant = await Restaurant.findOne({
      owner: req.user.userId
    });

    console.log("Logged-in user:", req.user.userId);
    console.log("Found restaurant:", restaurant?._id);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    const {
      menuItem,
      discountedPrice,
      quantity,
      pickupUntil
    } = req.body || {};

    console.log("Request body:", req.body);
    console.log("menuItem value:", menuItem);

    if (!mongoose.isObjectIdOrHexString(menuItem)) {
      return res.status(400).json({
        message: "A valid menu item ID is required"
      });
    }

    const item = await MenuItem.findOne({
      _id: menuItem,
      restaurant: restaurant._id
    });
console.log("Found menu item:", item);
    if (!item) {
      return res.status(404).json({
        message: "Menu item not found in your restaurant"
      });
    }

    if (
      typeof discountedPrice !== "number" ||
      !Number.isFinite(discountedPrice) ||
      discountedPrice < 0 ||
      discountedPrice >= item.price
    ) {
      return res.status(400).json({
        message:
          "Discounted price must be at least 0 and less than the original price"
      });
    }

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive whole number"
      });
    }

    if (typeof pickupUntil !== "string") {
      return res.status(400).json({
        message: "Pickup deadline is required"
      });
    }

    const pickupDate = new Date(pickupUntil);

    if (
      Number.isNaN(pickupDate.getTime()) ||
      pickupDate.getTime() <= Date.now()
    ) {
      return res.status(400).json({
        message: "Pickup deadline must be a valid future date"
      });
    }

    const newOffer = new SurplusOffer({
      restaurant: restaurant._id,
      menuItem: item._id,
      originalPrice: item.price,
      discountedPrice,
      quantity,
      remainingQuantity: quantity,
      pickupUntil: pickupDate,
      status: "active"
    });

    await newOffer.save();

    return res.status(201).json({
      message: "Surplus offer added successfully",
      offer: newOffer
    });
  } catch (error) {
    console.error("Add surplus offer error:", error);

    return res.status(500).json({
      message: "Could not add surplus offer"
    });
  }
};

// Get available surplus offers
const getAvailableOffers = async (req, res) => {
  try {
    const offers = await SurplusOffer.find({
      status: "active",
      remainingQuantity: { $gt: 0 },
      pickupUntil: { $gt: new Date() }
    })
      .populate("restaurant", "name city area")
      .populate("menuItem", "name description image category");

    const availableOffers = offers.filter(
      (offer) =>
        offer.restaurant !== null &&
        offer.menuItem !== null
    );

    return res.status(200).json(availableOffers);
  } catch (error) {
    console.error("Get available offers error:", error);

    return res.status(500).json({
      message: "Could not get surplus offers"
    });
  }
};

module.exports = {
  addSurplusOffer,
  getAvailableOffers
};
