const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    name: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String },
    address: { type: String },
    phone: { type: String },
    description: { type: String },
    crowdLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low"
    },
    waitTimeMinutes: { type: Number, default: 0 }
});


const updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurant owners can update reservation status"
      });
    }

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Status must be confirmed or cancelled"
      });
    }

    const reservation = await TableReservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    const restaurant = await Restaurant.findById(reservation.restaurant);

    if (!restaurant || restaurant.owner.toString() !== userId) {
      return res.status(403).json({
        message: "You can only update reservations for your restaurant"
      });
    }

    if (reservation.status !== "pending") {
      return res.status(400).json({
        message: "Only pending reservations can be updated"
      });
    }

    reservation.status = status;
    await reservation.save();

    return res.status(200).json({
      message: "Reservation status updated successfully",
      reservation
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not update reservation status"
    });
  }
};


module.exports = mongoose.model("Restaurant", restaurantSchema);