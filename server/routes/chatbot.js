const express = require("express");
const ChatbotQA = require("../models/ChatbotQA");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// GET /api/chatbot — Public: get all enabled Q&A pairs (for chatbot widget)
router.get("/", async (req, res) => {
    try {
        const qas = await ChatbotQA.find({ enabled: true }).sort({ order: 1, createdAt: -1 });
        res.json(qas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/chatbot/admin — Admin: get all Q&A pairs (including disabled)
router.get("/admin", protect, admin, async (req, res) => {
    try {
        const qas = await ChatbotQA.find().sort({ order: 1, createdAt: -1 });
        res.json(qas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/chatbot — Admin: create a new Q&A
router.post("/", protect, admin, async (req, res) => {
    try {
        const { question, keywords, answer, enabled, order } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ message: "Question and answer are required" });
        }
        const qa = await ChatbotQA.create({
            question,
            keywords: keywords || [],
            answer,
            enabled: enabled !== undefined ? enabled : true,
            order: order || 0,
        });
        res.status(201).json(qa);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/chatbot/:id — Admin: update a Q&A
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const qa = await ChatbotQA.findById(req.params.id);
        if (!qa) return res.status(404).json({ message: "Q&A not found" });

        const { question, keywords, answer, enabled, order } = req.body;
        if (question !== undefined) qa.question = question;
        if (keywords !== undefined) qa.keywords = keywords;
        if (answer !== undefined) qa.answer = answer;
        if (enabled !== undefined) qa.enabled = enabled;
        if (order !== undefined) qa.order = order;

        await qa.save();
        res.json(qa);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/chatbot/:id — Admin: delete a Q&A
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const qa = await ChatbotQA.findById(req.params.id);
        if (!qa) return res.status(404).json({ message: "Q&A not found" });
        await ChatbotQA.findByIdAndDelete(req.params.id);
        res.json({ message: "Q&A deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
