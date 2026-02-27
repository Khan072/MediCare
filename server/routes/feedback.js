const express = require("express");
const Feedback = require("../models/Feedback");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// POST /api/feedback — Auth required, submit feedback
router.post("/", protect, async (req, res) => {
    try {
        const { rating, message } = req.body;
        if (!rating || !message) {
            return res.status(400).json({ message: "Rating and message are required" });
        }
        const feedback = await Feedback.create({
            user: req.user._id,
            name: req.user.name,
            email: req.user.email,
            rating: Math.min(5, Math.max(1, Number(rating))),
            message,
        });
        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/feedback — Public, list all feedback
router.get("/", async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/feedback/admin — Admin, list all feedback with details
router.get("/admin", protect, admin, async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/feedback/:id — Admin, delete feedback
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: "Feedback not found" });
        await feedback.deleteOne();
        res.json({ message: "Feedback deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
