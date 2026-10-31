
const Restaurant = require("../models/restaurantSchema");

// Get all restaurants (optionally filter by city)
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

    return res.status(200).json(restaurants);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not get restaurants"
    });
  }
};


// Get nearby restaurants
const getNearbyRestaurants = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;

    const lat = Number(latitude);
    const lng = Number(longitude);
    const distance = Number(maxDistance);

    if (
      latitude === undefined ||
      longitude === undefined ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        message: "Please provide valid latitude and longitude"
      });
    }

    if (
      !Number.isFinite(distance) ||
      distance <= 0 ||
      distance > 50000
    ) {
      return res.status(400).json({
        message: "Maximum distance must be between 1 and 50000 meters"
      });
    }

    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: distance
        }
      }
    });

    return res.status(200).json(restaurants);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not get nearby restaurants"
    });
  }
};


// Update restaurant location and information
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
      "waitTimeMinutes",
      "location"
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
      } else if (field === "location") {
        if (
          !value ||
          typeof value !== "object" ||
          value.type !== "Point" ||
          !Array.isArray(value.coordinates) ||
          value.coordinates.length !== 2
        ) {
          return res.status(400).json({
            message: "Location must be a valid GeoJSON Point"
          });
        }

        const [lng, lat] = value.coordinates;

        if (
          typeof lng !== "number" ||
          typeof lat !== "number" ||
          !Number.isFinite(lng) ||
          !Number.isFinite(lat) ||
          lng < -180 ||
          lng > 180 ||
          lat < -90 ||
          lat > 90
        ) {
          return res.status(400).json({
            message: "Please provide valid longitude and latitude"
          });
        }

        restaurant.location = {
          type: "Point",
          coordinates: [lng, lat]
        };
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
      if (field === "location") continue;

      restaurant[field] =
        typeof updates[field] === "string"
          ? updates[field].trim()
          : updates[field];
    }

    await restaurant.save();

    return res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant
    });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check restaurant data"
      });
    }

    return res.status(500).json({
      message: "Could not update restaurant"
    });
  }
};

// Get one restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!require("mongoose").Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid restaurant ID"
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    return res.status(200).json(restaurant);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not get restaurant"
    });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  getNearbyRestaurants,
  updateMyRestaurant
};