
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


// Get all offers for the logged-in restaurant
const getMyRestaurantOffers = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurant accounts can view their offers"
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

    const offers = await SurplusOffer.find({
      restaurant: restaurant._id
    })
      .populate("menuItem", "name description image category")
      .sort({ _id: -1 });

    return res.status(200).json(offers);

  } catch (error) {
    console.error("Get restaurant offers error:", error);

    return res.status(500).json({
      message: "Could not get restaurant offers"
    });
  }
};


// Delete a surplus offer
const deleteSurplusOffer = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurant accounts can delete offers"
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

    const { offerId } = req.params;

    if (!mongoose.isObjectIdOrHexString(offerId)) {
      return res.status(400).json({
        message: "Invalid offer ID"
      });
    }

    const offer = await SurplusOffer.findOneAndDelete({
      _id: offerId,
      restaurant: restaurant._id
    });

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found"
      });
    }

    return res.status(200).json({
      message: "Offer deleted successfully"
    });

  } catch (error) {
    console.error("Delete surplus offer error:", error);

    return res.status(500).json({
      message: "Could not delete surplus offer"
    });
  }
};

// Update a surplus offer
const updateSurplusOffer = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurant accounts can update offers"
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

    const { offerId } = req.params;
    const { discountedPrice, quantity, pickupUntil } = req.body || {};

    if (!mongoose.isObjectIdOrHexString(offerId)) {
      return res.status(400).json({
        message: "Invalid offer ID"
      });
    }

    const offer = await SurplusOffer.findOne({
      _id: offerId,
      restaurant: restaurant._id
    });

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found"
      });
    }

    if (
      typeof discountedPrice !== "number" ||
      !Number.isFinite(discountedPrice) ||
      discountedPrice < 0 ||
      discountedPrice >= offer.originalPrice
    ) {
      return res.status(400).json({
        message: "Discounted price must be less than the original price"
      });
    }

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive whole number"
      });
    }

    const soldQuantity = offer.quantity - offer.remainingQuantity;

    if (quantity < soldQuantity) {
      return res.status(400).json({
        message: "Quantity cannot be less than the quantity already sold"
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

    offer.discountedPrice = discountedPrice;
    offer.quantity = quantity;
    offer.remainingQuantity = quantity - soldQuantity;
    offer.pickupUntil = pickupDate;
    offer.status = offer.remainingQuantity === 0
      ? "soldOut"
      : "active";

    await offer.save();

    return res.status(200).json({
      message: "Offer updated successfully",
      offer
    });

  } catch (error) {
    console.error("Update surplus offer error:", error);

    return res.status(500).json({
      message: "Could not update surplus offer"
    });
  }
};

module.exports = {
  addSurplusOffer,
  getAvailableOffers,
  getMyRestaurantOffers,
  deleteSurplusOffer,
  updateSurplusOffer
};