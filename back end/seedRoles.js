require("dotenv").config();

const mongoose = require("mongoose");
const Role = require("./models/roleSchema");

const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to database");

    const roles = ["consumer", "restaurant"];

    for (const role of roles) {
      await Role.updateOne(
        { role },
        { $setOnInsert: { role, permissions: [] } },
        { upsert: true }
      );
    }

    console.log("Roles added successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

seedRoles();