const Users = require("../models/usersSchema");
const Role = require("../models/roleSchema");
const Restaurant = require("../models/restaurantSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, restaurantInfo } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Please fill in all required fields"
      });
    }

    if (role !== "consumer" && role !== "restaurant") {
      return res.status(400).json({
        message: "Role must be consumer or restaurant"
      });
    }

    if (role === "restaurant" && (!restaurantInfo?.name || !restaurantInfo?.city)) {
      return res.status(400).json({
        message: "Restaurant name and city are required"
      });
    }

    const existingUser = await Users.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "This email is already registered"
      });
    }

    const roleDocument = await Role.findOne({ role });

    if (!roleDocument) {
      return res.status(404).json({
        message: "Role was not found in the database"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      name,
      email,
      password: hashedPassword,
      role: roleDocument._id
    });

    let restaurantId = null;

    if (role === "restaurant") {
      const newRestaurant = await Restaurant.create({
        owner: newUser._id,
        name: restaurantInfo.name,
        city: restaurantInfo.city,
        area: restaurantInfo.area,
        address: restaurantInfo.address,
        phone: restaurantInfo.phone,
        description: restaurantInfo.description
      });

      restaurantId = newRestaurant._id;
    }

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      role,
      restaurantId
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
};
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    const roleData = await Role.findById(user.role);
    const token = jwt.sign(
  { userId: user._id, role: roleData.role },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      role: roleData.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { registerUser, loginUser };