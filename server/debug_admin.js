const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Find all users with admin-related emails
        const admins = await User.find({
            $or: [
                { email: "admin@medicare.com" },
                { email: "admin@medicaree.com" },
                { role: "admin" }
            ]
        });

        console.log(`\nFound ${admins.length} admin user(s):\n`);

        for (const admin of admins) {
            console.log(`  ID: ${admin._id}`);
            console.log(`  Name: ${admin.name}`);
            console.log(`  Email: ${admin.email}`);
            console.log(`  Role: ${admin.role}`);
            console.log(`  Password hash: ${admin.password}`);

            // Test password matching
            const match123 = await admin.matchPassword("admin123");
            const match1231 = await admin.matchPassword("admin1231");
            console.log(`  Password "admin123" matches: ${match123}`);
            console.log(`  Password "admin1231" matches: ${match1231}`);
            console.log("  ---");
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Debug error:", error.message);
        process.exit(1);
    }
}

debug();
