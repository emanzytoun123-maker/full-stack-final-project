
const Users = require("../models/usersSchema");
const Role = require("../models/roleSchema");
const Restaurant = require("../models/restaurantSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, restaurantInfo } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields"
      });
    }

    if (!["consumer", "restaurant"].includes(role)) {
      return res.status(400).json({
        message: "Role must be consumer or restaurant"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (role === "restaurant") {
      if (
        typeof restaurantInfo?.name !== "string" ||
        !restaurantInfo.name.trim() ||
        typeof restaurantInfo?.city !== "string" ||
        !restaurantInfo.city.trim()
      ) {
        return res.status(400).json({
          message: "Restaurant name and city are required"
        });
      }

      const { latitude, longitude } = restaurantInfo || {};

      if (
        typeof latitude !== "number" ||
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        typeof longitude !== "number" ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          message: "Valid latitude and longitude are required"
        });
      }
    }

    const existingUser = await Users.findOne({
      email: normalizedEmail
    });

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
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: roleDocument._id
    });

    let restaurantId = null;

    if (role === "restaurant") {
      const newRestaurant = await Restaurant.create({
        owner: newUser._id,
        name: restaurantInfo.name.trim(),
        city: restaurantInfo.city.trim(),
        area: restaurantInfo.area,
        address: restaurantInfo.address,
        phone: restaurantInfo.phone,
        description: restaurantInfo.description,
        location: {
          type: "Point",
          coordinates: [
            restaurantInfo.longitude,
            restaurantInfo.latitude
          ]
        }
      });

      restaurantId = newRestaurant._id;
    }

    return res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      role,
      restaurantId
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered"
      });
    }

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await Users.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        message: "Email or password is incorrect"
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Email or password is incorrect"
      });
    }

    const roleData = await Role.findById(user.role);

    if (!roleData) {
      return res.status(500).json({
        message: "User role was not found"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables");

      return res.status(500).json({
        message: "Authentication configuration error"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: roleData.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
      role: roleData.role,
      token
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};
