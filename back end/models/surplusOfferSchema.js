const mongoose = require("mongoose");

const surplusOfferSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true
    },
    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    pickupUntil: { type: Date, required: true },
    status: {
        type: String,
        enum: ["active", "soldOut", "expired"],
        default: "active"
    }
});

module.exports = mongoose.model("SurplusOffer", surplusOfferSchema);