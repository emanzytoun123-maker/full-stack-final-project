const Users = require("../models/usersSchema");

const getMyProfile = async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId)
      .select("-password")
      .populate("role", "role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getMyProfile };