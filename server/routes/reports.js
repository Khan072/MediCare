const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const MedicalReport = require("../models/MedicalReport");
const Appointment = require("../models/Appointment");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "reports");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|jpg|jpeg|png|webp|doc|docx/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext || mime) cb(null, true);
        else cb(new Error("Only PDF, images, and document files are allowed"));
    },
});

// POST /api/reports/upload — Admin uploads a report for a patient
router.post("/upload", protect, admin, upload.single("file"), async (req, res) => {
    try {
        const { appointmentId, title } = req.body;
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        if (!appointmentId || !title) {
            // Remove uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Appointment ID and title are required" });
        }

        const apt = await Appointment.findById(appointmentId).populate("user", "name email");
        if (!apt) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Deadline = 48 hours from now (upload time)
        const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

        const report = await MedicalReport.create({
            appointment: apt._id,
            patient: apt.user._id || apt.user,
            patientName: apt.patientName,
            patientEmail: apt.patientEmail,
            doctorName: apt.doctor?.name || "",
            title,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileSize: req.file.size,
            deadline,
        });

        res.status(201).json(report);
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/reports — Patient gets own reports
router.get("/", protect, async (req, res) => {
    try {
        const reports = await MedicalReport.find({ patient: req.user._id })
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/reports/admin — Admin gets all reports
router.get("/admin", protect, admin, async (req, res) => {
    try {
        const reports = await MedicalReport.find()
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/reports/download/:id — Download report file
router.get("/download/:id", protect, async (req, res) => {
    try {
        const report = await MedicalReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        // Only the patient or an admin can download
        if (report.patient.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const filePath = path.join(uploadDir, report.fileName);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File not found on server" });
        }

        res.download(filePath, report.originalName);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
