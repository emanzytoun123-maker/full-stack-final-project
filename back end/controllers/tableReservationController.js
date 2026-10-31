
const TableReservation = require("../models/tableReservationSchema");
const Restaurant = require("../models/restaurantSchema");
const Notification = require("../models/notificationSchema");
const createReservation = async (req, res) => {
  try {
    const consumerId = req.user.userId;
    const { restaurantId, date, time, peopleCount } = req.body;

    if (!restaurantId || !date || !time || peopleCount === undefined) {
      return res.status(400).json({
        message: "Restaurant, date, time, and people count are required"
      });
    }

    if (!Number.isInteger(Number(peopleCount)) || Number(peopleCount) < 1) {
      return res.status(400).json({
        message: "People count must be a positive integer"
      });
    }

    if (Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        message: "Invalid reservation date"
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    const reservation = await TableReservation.create({
      consumer: consumerId,
      restaurant: restaurantId,
      date: new Date(date),
      time,
      peopleCount: Number(peopleCount)
    });

    return res.status(201).json({
      message: "Reservation created successfully",
      reservation
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Could not create reservation"
    });
  }
};


const getMyReservations = async (req, res) => {
  try {
    const consumerId = req.user.userId;

    const reservations = await TableReservation.find({
      consumer: consumerId
    }).populate("restaurant", "name city");

    return res.status(200).json({
      count: reservations.length,
      reservations
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not get reservations"
    });
  }
};

const getRestaurantReservations = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurant accounts can view reservations"
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

    const reservations = await TableReservation.find({
      restaurant: restaurant._id
    })
      .populate("consumer", "name")
      .sort({ date: -1 });

    return res.status(200).json({
      count: reservations.length,
      reservations
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not get restaurant reservations"
    });
  }
};


const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const consumerId = req.user.userId;

    const reservation = await TableReservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    if (reservation.consumer.toString() !== consumerId) {
      return res.status(403).json({
        message: "You can only cancel your own reservations"
      });
    }

    if (
      reservation.status === "cancelled" ||
      reservation.status === "waiting"
    ) {
      return res.status(400).json({
        message: "This reservation cannot be cancelled"
      });
    }

    reservation.status = "cancelled";
await reservation.save();

await Notification.create({
  user: reservation.consumer,
  title: "Reservation Cancelled",
  message: "Your table reservation has been cancelled successfully.",
  reservation: reservation._id
});

    return res.status(200).json({
      message: "Reservation cancelled successfully",
      reservation
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not cancel reservation"
    });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (req.user.role !== "restaurant") {
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

console.log("Creating notification for consumer:", reservation.consumer);

await Notification.create({
  user: reservation.consumer,
  title: status === "confirmed"
    ? "Reservation Confirmed"
    : "Reservation Cancelled",
  message: status === "confirmed"
    ? "Your table reservation has been confirmed."
    : "Your table reservation has been cancelled by the restaurant.",
  reservation: reservation._id
});
console.log("Notification created successfully");

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

module.exports = {
  createReservation,
  getMyReservations,
  cancelReservation,
  getRestaurantReservations,
  updateReservationStatus
};