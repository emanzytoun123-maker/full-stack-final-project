
const mongoose = require("mongoose");
const Outing = require("../models/outingSchema");

// إنشاء طلعة جديدة
const createOuting = async (req, res) => {
  try {
    if (req.user.role !== "consumer") {
      return res.status(403).json({
        message: "Only consumers can create outings"
      });
    }

    const { title, city, date } = req.body || {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof city !== "string" ||
      !city.trim()
    ) {
      return res.status(400).json({
        message: "Title and city are required"
      });
    }

    let outingDate;

    if (date !== undefined && date !== null && date !== "") {
      outingDate = new Date(date);

      if (Number.isNaN(outingDate.getTime())) {
        return res.status(400).json({
          message: "Invalid outing date"
        });
      }
    }

    const inviteCode = require("crypto")
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();

    const outing = new Outing({
      createdBy: req.user.userId,
      title: title.trim(),
      city: city.trim(),
      ...(outingDate && { date: outingDate }),
      inviteCode,
      members: [req.user.userId]
    });

    await outing.save();

    return res.status(201).json({
      message: "Outing created successfully",
      outing
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Could not create outing"
    });
  }
};

module.exports = {
  createOuting
};
