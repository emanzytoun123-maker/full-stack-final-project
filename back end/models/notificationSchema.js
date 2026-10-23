const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TableReservation"
    }
});

module.exports = mongoose.model("Notification", notificationSchema);