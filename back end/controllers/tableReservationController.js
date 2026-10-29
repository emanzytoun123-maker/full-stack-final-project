
const TableReservation = require("../models/tableReservationSchema");
const Restaurant = require("../models/restaurantSchema");

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

module.exports = { createReservation };
