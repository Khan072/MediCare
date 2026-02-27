const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Generate JWT
const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// Create email transporter
const createTransporter = () =>
    nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, phone, dob, gender, blood } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        const user = await User.create({ name, email, password, phone, dob, gender, blood, role: "patient" });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            dob: user.dob,
            gender: user.gender,
            blood: user.blood,
            role: user.role,
            token: genToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                dob: user.dob,
                gender: user.gender,
                blood: user.blood,
                role: user.role,
                token: genToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        dob: req.user.dob,
        gender: req.user.gender,
        blood: req.user.blood,
        role: req.user.role,
    });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(404).json({ message: "No account found with that email" });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP and store with 10-minute expiry
        const salt = await bcrypt.genSalt(10);
        user.resetPasswordToken = await bcrypt.hash(otp, salt);
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save({ validateBeforeSave: false });

        // Send email
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"MediCare" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset OTP - MediCare",
            html: `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f8fffe;border-radius:12px;">
                    <div style="text-align:center;margin-bottom:20px;">
                        <h1 style="color:#00796b;margin:0;">🏥 MediCare</h1>
                    </div>
                    <h2 style="color:#212121;text-align:center;">Password Reset Request</h2>
                    <p style="color:#616161;text-align:center;">Use the following OTP to reset your password. This code is valid for <strong>10 minutes</strong>.</p>
                    <div style="background:linear-gradient(135deg,#00796b,#4db6ac);border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
                        <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#fff;">${otp}</span>
                    </div>
                    <p style="color:#9e9e9e;font-size:13px;text-align:center;">If you did not request this, please ignore this email.</p>
                </div>
            `,
        });

        res.json({ message: "OTP sent to your email address" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Failed to send OTP email. Please try again later." });
    }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP, and new password are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, user.resetPasswordToken);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // Set new password and clear reset fields
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: "Password reset successful. You can now login with your new password." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
