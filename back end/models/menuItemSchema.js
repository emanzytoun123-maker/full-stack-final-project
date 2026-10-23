const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model("MenuItem", menuItemSchema);