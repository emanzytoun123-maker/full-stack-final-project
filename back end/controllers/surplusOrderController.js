const mongoose = require("mongoose");
const Order = require("../models/orderSchema");
const Restaurant = require("../models/restaurantSchema");
const MenuItem = require("../models/menuItemSchema");
const SurplusOffer = require("../models/surplusOfferSchema");

// إيقاف العملية برسالة ورقم خطأ محددين
const stopOrder = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const createSurplusOrder = async (req, res) => {
  try {
    if (req.user.role !== "consumer") {
      return res.status(403).json({
        message: "Only consumers can create orders"
      });
    }

    const { offerId, quantity } = req.body || {};

    if (!mongoose.isObjectIdOrHexString(offerId)) {
      return res.status(400).json({
        message: "A valid offer ID is required"
      });
    }

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive whole number"
      });
    }

    let newOrder;

    await mongoose.connection.transaction(async (session) => {
      // فحص توفر الكمية وخصمها بنفس عملية التعديل
      const offer = await SurplusOffer.findOneAndUpdate(
        {
          _id: offerId,
          status: "active",
          pickupUntil: { $gt: new Date() },
          remainingQuantity: { $gte: quantity }
        },
        {
          $inc: { remainingQuantity: -quantity }
        },
        {
          new: true,
          session
        }
      );

      if (!offer) {
        stopOrder(
          409,
          "Offer is unavailable, expired or quantity is insufficient"
        );
      }

      const restaurant = await Restaurant.findById(
        offer.restaurant
      ).session(session);

      const menuItem = await MenuItem.findOne({
        _id: offer.menuItem,
        restaurant: offer.restaurant
      }).session(session);

      if (!restaurant || !menuItem) {
        stopOrder(404, "Restaurant or menu item no longer exists");
      }

      // السعر من العرض المخزن، وليس من المستخدم
      const priceInFils = Math.round(offer.discountedPrice * 1000);
      const totalInFils = priceInFils * quantity;

      if (
        !Number.isSafeInteger(priceInFils) ||
        priceInFils < 0 ||
        !Number.isSafeInteger(totalInFils)
      ) {
        stopOrder(400, "Invalid offer price or order total");
      }

      newOrder = new Order({
        consumer: req.user.userId,
        restaurant: offer.restaurant,
        items: [
          {
            menuItem: offer.menuItem,
            offer: offer._id,
            quantity,
            priceAtOrder: priceInFils / 1000
          }
        ],
        totalPrice: totalInFils / 1000,
        status: "pending"
      });

      await newOrder.save({ session });

      if (offer.remainingQuantity === 0) {
        offer.status = "soldOut";
        await offer.save({ session });
      }
    });

    res.status(201).json({
      message: "Surplus order created successfully",
      order: newOrder
    });
  } catch (error) {
    console.error(error);

    res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Could not create surplus order"
    });
  }
};

module.exports = { createSurplusOrder };