
const Outing = require("../models/outingSchema");

const createOuting = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== "consumer") {
      return res.status(403).json({
        message: "Only consumers can create outings"
      });
    }

    const { title, city, date } = req.body;

    if (!title || !city) {
      return res.status(400).json({
        message: "Title and city are required"
      });
    }

    const inviteCode = require("crypto")
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();

    const outing = await Outing.create({
      createdBy: userId,
      title: title.trim(),
      city: city.trim(),
      date: date || undefined,
      inviteCode,
      members: [userId]
    });

    return res.status(201).json({
      message: "Outing created successfully",
      outing
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Could not create outing"
    });
  }
};

module.exports = { createOuting };
