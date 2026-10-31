
const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  area: {
    type: String
  },

  address: {
    type: String
  },

  phone: {
    type: String
  },

  description: {
    type: String
  },

  // Restaurant Geolocation
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],
      required: false
    }
  },

  crowdLevel: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },

  waitTimeMinutes: {
    type: Number,
    default: 0
  }
});

// Geospatial index
restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);
