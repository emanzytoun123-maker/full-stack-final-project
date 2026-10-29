const mongoose = require("mongoose");
const MenuItem = require("../models/menuItemSchema");
const Restaurant = require("../models/restaurantSchema");

// إضافة صنف لمطعم المستخدم المسجل دخوله
const addMenuItem = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurant accounts can add menu items"
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

    const {
      name,
      description,
      category,
      price,
      image,
      isAvailable
    } = req.body || {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Item name is required"
      });
    }

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message: "Price must be a number greater than or equal to 0"
      });
    }

    if (
      (description !== undefined && typeof description !== "string") ||
      (category !== undefined && typeof category !== "string") ||
      (image !== undefined && typeof image !== "string")
    ) {
      return res.status(400).json({
        message: "Description, category and image must be text"
      });
    }

    if (
      isAvailable !== undefined &&
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        message: "isAvailable must be true or false"
      });
    }

    const newItem = new MenuItem({
      restaurant: restaurant._id,
      name: name.trim(),
      description,
      category,
      price,
      image,
      isAvailable
    });

    await newItem.save();

    res.status(201).json({
      message: "Menu item added successfully",
      item: newItem
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not add menu item"
    });
  }
};

// عرض أصناف مطعم محدد
const getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.isObjectIdOrHexString(restaurantId)) {
      return res.status(400).json({
        message: "Invalid restaurant ID"
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    const items = await MenuItem.find({
      restaurant: restaurantId
    });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Could not get menu"
    });
  }
};
  // modify item
const updateMenuItem = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurant accounts can update menu items"
      });
    }

    const { itemId } = req.params;

    if (!mongoose.isObjectIdOrHexString(itemId)) {
      return res.status(400).json({
        message: "Invalid item ID"
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

    const item = await MenuItem.findOne({
      _id: itemId,
      restaurant: restaurant._id
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found in your restaurant"
      });
    }

    const updates = req.body;

    if (
      !updates ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      return res.status(400).json({
        message: "Please send item data"
      });
    }

    const allowedFields = [
      "name",
      "description",
      "category",
      "price",
      "image",
      "isAvailable"
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

      if (field === "price") {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message: "Price must be a number greater than or equal to 0"
          });
        }
      } else if (field === "isAvailable") {
        if (typeof value !== "boolean") {
          return res.status(400).json({
            message: "isAvailable must be true or false"
          });
        }
      } else {
        if (typeof value !== "string") {
          return res.status(400).json({
            message: `${field} must be text`
          });
        }

        if (field === "name" && !value.trim()) {
          return res.status(400).json({
            message: "Item name cannot be empty"
          });
        }
      }
    }

    for (const field of fields) {
      item[field] =
        typeof updates[field] === "string"
          ? updates[field].trim()
          : updates[field];
    }

    await item.save();

    res.status(200).json({
      message: "Menu item updated successfully",
      item
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not update menu item"
    });
  }
};

// delete item
const deleteMenuItem = async (req, res) => {
  try {
    if (req.user.role !== "restaurant") {
      return res.status(403).json({
        message: "Only restaurant accounts can delete menu items"
      });
    }

    const { itemId } = req.params;

    if (!mongoose.isObjectIdOrHexString(itemId)) {
      return res.status(400).json({
        message: "Invalid item ID"
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

    const deletedItem = await MenuItem.findOneAndDelete({
      _id: itemId,
      restaurant: restaurant._id
    });

    if (!deletedItem) {
      return res.status(404).json({
        message: "Item not found in your restaurant"
      });
    }

    res.status(200).json({
      message: "Menu item deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not delete menu item"
    });
  }
};


module.exports = {
  addMenuItem,
  getRestaurantMenu,
  updateMenuItem,
  deleteMenuItem
};