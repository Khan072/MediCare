const express = require("express");
const User = require("../models/User");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/profile — Get own profile
router.get("/profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/users/profile — Update own profile
router.put("/profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { name, phone, gender, blood } = req.body;
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (gender !== undefined) user.gender = gender;
        if (blood !== undefined) user.blood = blood;

        const updated = await user.save();
        res.json({
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            dob: updated.dob,
            gender: updated.gender,
            blood: updated.blood,
            role: updated.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/users/count — Patient count for admin
router.get("/count", protect, admin, async (req, res) => {
    try {
        const count = await User.countDocuments({ role: "patient" });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
