
const Outing = require("../models/outingSchema");
const crypto = require("crypto");
const Restaurant = require("../models/restaurantSchema");
// Create a new outing
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

    if (date && Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        message: "Invalid date"
      });
    }

    const inviteCode = crypto
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

// Join an outing using an invite code
const joinOuting = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { inviteCode } = req.body;

    if (!inviteCode || typeof inviteCode !== "string") {
      return res.status(400).json({
        message: "Invite code is required"
      });
    }

    const outing = await Outing.findOne({
      inviteCode: inviteCode.trim().toUpperCase(),
      status: "open"
    });

    if (!outing) {
      return res.status(404).json({
        message: "Outing not found or already closed"
      });
    }

    const alreadyMember = outing.members.some(
      (member) => member.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "You are already a member of this outing"
      });
    }

    outing.members.push(userId);
    await outing.save();

    return res.status(200).json({
      message: "Joined outing successfully",
      outing
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not join outing"
    });
  }
};


const addOutingOption = async (req, res) => {
  try {
    const { outingId } = req.params;
    const { restaurantId } = req.body;
    const userId = req.user.userId;

    if (!restaurantId) {
      return res.status(400).json({
        message: "Restaurant ID is required"
      });
    }

    const outing = await Outing.findById(outingId);

    if (!outing) {
      return res.status(404).json({
        message: "Outing not found"
      });
    }

    if (outing.status !== "open") {
      return res.status(400).json({
        message: "This outing is closed"
      });
    }

    const isMember = outing.members.some(
      (member) => member.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "Only outing members can add restaurants"
      });
    }

    if (!require("mongoose").isValidObjectId(restaurantId)) {
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

    const alreadyAdded = outing.options.some(
      (option) => option.restaurant.toString() === restaurantId
    );

    if (alreadyAdded) {
      return res.status(400).json({
        message: "Restaurant already added to this outing"
      });
    }

    outing.options.push({
      restaurant: restaurantId,
      votes: []
    });

    await outing.save();

    return res.status(200).json({
      message: "Restaurant added to outing successfully",
      outing
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not add restaurant to outing"
    });
  }
};



const voteForRestaurant = async (req, res) => {
  try {
    const { outingId } = req.params;
    const { restaurantId } = req.body;
    const userId = req.user.userId;

    if (!restaurantId) {
      return res.status(400).json({
        message: "Restaurant ID is required"
      });
    }

    const outing = await Outing.findById(outingId);

    if (!outing) {
      return res.status(404).json({
        message: "Outing not found"
      });
    }

    if (outing.status !== "open") {
      return res.status(400).json({
        message: "This outing is closed"
      });
    }

    const isMember = outing.members.some(
      (member) => member.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "Only outing members can vote"
      });
    }

    const selectedOption = outing.options.find(
      (option) => option.restaurant.toString() === restaurantId
    );

    if (!selectedOption) {
      return res.status(404).json({
        message: "Restaurant is not an option in this outing"
      });
    }

    // Remove this user's previous vote, if any
    outing.options.forEach((option) => {
      option.votes = option.votes.filter(
        (voter) => voter.toString() !== userId
      );
    });

    selectedOption.votes.push(userId);

    await outing.save();

    return res.status(200).json({
      message: "Vote submitted successfully",
      outing
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not submit vote"
    });
  }
};


const closeOuting = async (req, res) => {
  try {
    const { outingId } = req.params;
    const userId = req.user.userId;

    const outing = await Outing.findById(outingId);

    if (!outing) {
      return res.status(404).json({
        message: "Outing not found"
      });
    }

    if (outing.createdBy.toString() !== userId) {
      return res.status(403).json({
        message: "Only the outing creator can close it"
      });
    }

    if (outing.status === "closed") {
      return res.status(400).json({
        message: "Outing is already closed"
      });
    }

    if (outing.options.length === 0) {
      return res.status(400).json({
        message: "Add at least one restaurant before closing"
      });
    }

    const sortedOptions = [...outing.options].sort(
      (a, b) => b.votes.length - a.votes.length
    );

    outing.winner = sortedOptions[0].restaurant;
    outing.status = "closed";

    await outing.save();

    return res.status(200).json({
      message: "Outing closed successfully",
      winner: outing.winner,
      status: outing.status,
      outing
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not close outing"
    });
  }
};



module.exports = {
  createOuting,
  joinOuting,
  addOutingOption,
  voteForRestaurant,
  closeOuting
};
