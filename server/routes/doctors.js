const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Doctor = require("../models/Doctor");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// Ensure uploads/doctors directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "doctors");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage for doctor photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpg|jpeg|png|webp|gif/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext || mime) cb(null, true);
        else cb(new Error("Only image files (jpg, png, webp, gif) are allowed"));
    },
});

// GET /api/doctors — All doctors
router.get("/", async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/doctors/:id — Single doctor
router.get("/:id", async (req, res) => {
    try {
        const doc = await Doctor.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: "Doctor not found" });
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/doctors — Admin adds a doctor (with optional photo)
router.post("/", protect, admin, upload.single("photo"), async (req, res) => {
    try {
        const { name, spec, qual, exp, fee, rat, pts, bio, av } = req.body;

        if (!name || !spec || !qual || !exp || !fee) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Name, specialization, qualification, experience, and fee are required" });
        }

        const doctorData = {
            name,
            spec,
            qual,
            exp: Number(exp),
            fee: Number(fee),
            rat: Number(rat) || 4.5,
            pts: Number(pts) || 0,
            bio: bio || "",
            av: av ? JSON.parse(av) : [],
            photo: req.file ? req.file.filename : "",
        };

        const doctor = await Doctor.create(doctorData);
        res.status(201).json(doctor);
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/doctors/:id — Admin updates a doctor
router.put("/:id", protect, admin, upload.single("photo"), async (req, res) => {
    try {
        const doc = await Doctor.findById(req.params.id);
        if (!doc) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "Doctor not found" });
        }

        const { name, spec, qual, exp, fee, rat, pts, bio, av } = req.body;

        if (name) doc.name = name;
        if (spec) doc.spec = spec;
        if (qual) doc.qual = qual;
        if (exp) doc.exp = Number(exp);
        if (fee) doc.fee = Number(fee);
        if (rat !== undefined) doc.rat = Number(rat);
        if (pts !== undefined) doc.pts = Number(pts);
        if (bio !== undefined) doc.bio = bio;
        if (av) doc.av = JSON.parse(av);

        // Handle photo update
        if (req.file) {
            // Delete old photo if it exists
            if (doc.photo) {
                const oldPhotoPath = path.join(uploadDir, doc.photo);
                if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
            }
            doc.photo = req.file.filename;
        }

        await doc.save();
        res.json(doc);
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/doctors/:id — Admin deletes a doctor
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const doc = await Doctor.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: "Doctor not found" });

        // Remove photo file if exists
        if (doc.photo) {
            const photoPath = path.join(uploadDir, doc.photo);
            if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
        }

        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ message: "Doctor deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
