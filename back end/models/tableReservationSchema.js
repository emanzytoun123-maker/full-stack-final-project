const mongoose = require("mongoose");

const tableReservationSchema = new mongoose.Schema({
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
    date: { type: Date, required: true },
    time: { type: String, required: true },
    peopleCount: { type: Number, required: true, min: 1 },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "waiting"],
        default: "pending"
    }
});

module.exports = mongoose.model("TableReservation", tableReservationSchema);