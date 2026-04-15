const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        aptNumber: { type: String, required: true, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        patientName: { type: String, required: true },
        patientEmail: { type: String, required: true },
        patientPhone: { type: String, default: "N/A" },
        doctor: {
            id: String,
            name: String,
            spec: String,
            qual: String,
            exp: Number,
            fee: Number,
            rat: Number,
            pts: Number,
            bio: String,
        },
        date: { type: String, required: true },
        slot: { type: String, required: true },
        reason: { type: String, required: true },
        symptoms: [String],
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "confirmed",
        },
        fee: { type: Number, required: true },
        payment: {
            transactionId: { type: String },
            amount: { type: Number },
            status: {
                type: String,
                enum: ["pending", "succeeded", "failed", "refunded"],
                default: "pending",
            },
            method: { type: String, enum: ["online", "pay_later"], default: "online" },
        },
    },
    { timestamps: true }
);

// Compound index for duplicate booking prevention
appointmentSchema.index({ "doctor.id": 1, date: 1, slot: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
