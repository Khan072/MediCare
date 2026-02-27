const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Check if admin already exists
        const existing = await User.findOne({ email: "admin@medicare.com" });
        if (existing) {
            console.log("Admin user already exists, skipping seed.");
        } else {
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
        }

        await mongoose.disconnect();
        console.log("Seed complete.");
        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error.message);
        process.exit(1);
    }
}

seed();
