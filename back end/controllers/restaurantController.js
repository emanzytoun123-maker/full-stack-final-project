const Restaurant = require("../models/restaurantSchema");
//
const getRestaurants = async (req, res) => {
  try {
    const { city } = req.query;
    const filter = {};

    if (city !== undefined) {
      if (typeof city !== "string" || !city.trim()) {
        return res.status(400).json({
          message: "City must be a non-empty text"
        });
      }

      filter.city = city.trim();
    }

    const restaurants = await Restaurant.find(filter);

    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({
      message: "Could not get restaurants"
    });
  }
};

// تعديل المطعم الخاص بالمستخدم المسجل دخوله
const updateMyRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurant accounts can update a restaurant"
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

    const updates = req.body;

    if (
      !updates ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      return res.status(400).json({
        message: "Please send restaurant data"
      });
    }

    const allowedFields = [
      "name",
      "city",
      "area",
      "address",
      "phone",
      "description",
      "crowdLevel",
      "waitTimeMinutes"
    ];

    const fields = Object.keys(updates);

    if (fields.length === 0) {
      return res.status(400).json({
        message: "Please send at least one field"
      });
    }

    for (const field of fields) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({
          message: `Cannot update field: ${field}`
        });
      }

      const value = updates[field];

      if (field === "waitTimeMinutes") {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message: "Wait time must be a number greater than or equal to 0"
          });
        }
      } else {
        if (typeof value !== "string") {
          return res.status(400).json({
            message: `${field} must be text`
          });
        }

        if (
          (field === "name" || field === "city") &&
          !value.trim()
        ) {
          return res.status(400).json({
            message: `${field} cannot be empty`
          });
        }

        if (
          field === "crowdLevel" &&
          !["low", "medium", "high"].includes(value)
        ) {
          return res.status(400).json({
            message: "Crowd level must be low, medium or high"
          });
        }
      }
    }

    for (const field of fields) {
      restaurant[field] =
        typeof updates[field] === "string"
          ? updates[field].trim()
          : updates[field];
    }

    await restaurant.save();

    res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check restaurant data"
      });
    }

    res.status(500).json({
      message: "Could not update restaurant"
    });
  }
};

module.exports = {
  getRestaurants,
  updateMyRestaurant
};