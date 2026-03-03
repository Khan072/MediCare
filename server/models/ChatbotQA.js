const mongoose = require("mongoose");

const chatbotQASchema = new mongoose.Schema(
    {
        question: { type: String, required: true, trim: true },
        keywords: [{ type: String, trim: true, lowercase: true }],
        answer: { type: String, required: true },
        enabled: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ChatbotQA", chatbotQASchema);
