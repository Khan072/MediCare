const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Remove any old admin entries (with typos) and re-create
        await User.deleteMany({ email: { $in: ["admin@medicare.com", "admin@medicaree.com"] } });

        await User.create({
            name: "Admin User",
            email: "admin@medicare.com",
            password: "admin123",
            phone: "9999999999",
            gender: "other",
            dob: "",
            blood: "",
            role: "admin",
        });
        console.log("Admin user created: admin@medicare.com / admin123");

        await mongoose.disconnect();
        console.log("Seed complete.");
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error.message);
        process.exit(1);
    }
}

seed();
