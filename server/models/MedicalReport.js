const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
    {
        appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        patientName: { type: String, required: true },
        patientEmail: { type: String, required: true },
        doctorName: { type: String, default: "" },
        title: { type: String, required: true, trim: true },
        fileName: { type: String, required: true },
        originalName: { type: String, required: true },
        fileSize: { type: Number, default: 0 },
        deadline: { type: Date, required: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MedicalReport", medicalReportSchema);
