const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SurplusOffer"
    },
    quantity: { type: Number, required: true, min: 1 },
    priceAtOrder: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    consumer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "accepted", "ready", "completed", "cancelled"],
        default: "pending"
    }
});

module.exports = mongoose.model("Order", orderSchema);