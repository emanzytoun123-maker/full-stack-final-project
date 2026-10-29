const mongoose = require("mongoose");
const Order = require("../models/orderSchema");
const Restaurant = require("../models/restaurantSchema");
const SurplusOffer = require("../models/surplusOfferSchema");

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, role } = req.user;

    if (!["consumer", "restaurant"].includes(role)) {
      return res.status(403).json({
        message: "You cannot cancel orders"
      });
    }

    if (!mongoose.isObjectIdOrHexString(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const filter = {
      _id: orderId,
      status: "pending"
    };

    if (role === "consumer") {
      filter.consumer = userId;
    } else {
      const restaurant = await Restaurant.findOne({
        owner: userId
      });

      if (!restaurant) {
        return res.status(404).json({
          message: "Restaurant not found"
        });
      }

      filter.restaurant = restaurant._id;
    }

    let cancelledOrder;

    await mongoose.connection.transaction(async (session) => {
      // تغيير الحالة بشرط أن الطلب ما زال pending
      cancelledOrder = await Order.findOneAndUpdate(
        filter,
        { $set: { status: "cancelled" } },
        { new: true, runValidators: true, session }
      );

      if (!cancelledOrder) {
        const error = new Error(
          "Order not found or it can no longer be cancelled"
        );
        error.statusCode = 409;
        throw error;
      }

      for (const item of cancelledOrder.items) {
        // الأكل العادي ما إله كمية في عروض الفائض
        if (!item.offer) continue;

        const offer = await SurplusOffer.findOne({
          _id: item.offer,
          restaurant: cancelledOrder.restaurant,
          menuItem: item.menuItem
        }).session(session);

        if (!offer) {
          const error = new Error(
            "Cannot restore quantity: surplus offer is missing"
          );
          error.statusCode = 409;
          throw error;
        }

        const restoredQuantity =
          offer.remainingQuantity + item.quantity;

        if (
          !Number.isSafeInteger(restoredQuantity) ||
          restoredQuantity > offer.quantity
        ) {
          const error = new Error("Invalid surplus quantity");
          error.statusCode = 409;
          throw error;
        }

        offer.remainingQuantity = restoredQuantity;

        if (offer.pickupUntil <= new Date()) {
          offer.status = "expired";
        } else if (offer.status === "soldOut") {
          offer.status = "active";
        }

        await offer.save({ session });
      }
    });

    return res.status(200).json({
      message: "Order cancelled successfully",
      order: cancelledOrder
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Could not cancel order"
    });
  }
};

module.exports = { cancelOrder };