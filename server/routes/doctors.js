const express = require("express");
const router = express.Router();

// Hardcoded doctor data — same as original app
const DOCS = [
    { id: "d1", name: "Dr. Sarah Johnson", spec: "Cardiology", qual: "MD, DM (Cardiology)", exp: 15, fee: 1500, rat: 4.8, pts: 1250, bio: "Expert cardiologist specializing in preventive cardiology and heart disease management.", av: [{ day: "Monday", sl: ["09:00", "10:00", "11:00"] }, { day: "Wednesday", sl: ["14:00", "15:00"] }, { day: "Friday", sl: ["09:00", "10:00"] }] },
    { id: "d2", name: "Dr. Michael Chen", spec: "Pediatrics", qual: "MBBS, MD (Pediatrics)", exp: 12, fee: 1000, rat: 4.7, pts: 980, bio: "Dedicated pediatrician with expertise in child healthcare, vaccinations and growth monitoring.", av: [{ day: "Monday", sl: ["10:30", "11:30"] }, { day: "Tuesday", sl: ["09:00", "10:00"] }, { day: "Thursday", sl: ["15:00", "16:00"] }] },
    { id: "d3", name: "Dr. Emily Rodriguez", spec: "Dermatology", qual: "MBBS, MD (Dermatology)", exp: 10, fee: 1200, rat: 4.6, pts: 850, bio: "Skin specialist focused on cosmetic and medical dermatology including acne and psoriasis.", av: [{ day: "Tuesday", sl: ["14:00", "15:00"] }, { day: "Wednesday", sl: ["09:00", "10:00"] }, { day: "Saturday", sl: ["10:00", "11:00"] }] },
    { id: "d4", name: "Dr. James Wilson", spec: "Orthopedics", qual: "MBBS, MS (Orthopedics)", exp: 18, fee: 1800, rat: 4.9, pts: 1500, bio: "Expert orthopedic surgeon specializing in sports injuries and joint replacement.", av: [{ day: "Monday", sl: ["15:00", "16:00"] }, { day: "Thursday", sl: ["09:00", "10:00"] }, { day: "Friday", sl: ["14:00", "15:00"] }] },
    { id: "d5", name: "Dr. Priya Sharma", spec: "General Medicine", qual: "MBBS, MD (Internal Medicine)", exp: 8, fee: 800, rat: 4.5, pts: 720, bio: "General physician providing comprehensive primary healthcare for all age groups.", av: [{ day: "Monday", sl: ["09:00", "09:30", "10:00"] }, { day: "Tuesday", sl: ["09:00", "10:00"] }, { day: "Friday", sl: ["09:00", "10:00"] }] },
    { id: "d6", name: "Dr. Rajesh Kumar", spec: "Neurology", qual: "MBBS, DM (Neurology)", exp: 14, fee: 2000, rat: 4.8, pts: 1100, bio: "Expert neurologist specializing in stroke, epilepsy, headache disorders and movement conditions.", av: [{ day: "Tuesday", sl: ["10:00", "11:00"] }, { day: "Thursday", sl: ["14:00", "15:00"] }, { day: "Saturday", sl: ["09:00", "10:00"] }] },
    { id: "d7", name: "Dr. Anjali Verma", spec: "Gynecology", qual: "MBBS, MS (OBG)", exp: 11, fee: 1400, rat: 4.7, pts: 930, bio: "Experienced gynecologist specializing in women's health, prenatal care and minimally invasive surgery.", av: [{ day: "Monday", sl: ["12:00", "12:30"] }, { day: "Wednesday", sl: ["10:00", "11:00"] }, { day: "Friday", sl: ["15:00", "15:30"] }] },
    { id: "d8", name: "Dr. Samuel Okafor", spec: "ENT", qual: "MBBS, MS (ENT)", exp: 9, fee: 1100, rat: 4.5, pts: 670, bio: "ENT specialist experienced in ear, nose and throat conditions, hearing loss and sleep apnea.", av: [{ day: "Tuesday", sl: ["11:00", "11:30"] }, { day: "Thursday", sl: ["10:00", "11:00"] }, { day: "Saturday", sl: ["10:00", "10:30"] }] },
];

// GET /api/doctors
router.get("/", (req, res) => {
    res.json(DOCS);
});

// GET /api/doctors/:id
router.get("/:id", (req, res) => {
    const doc = DOCS.find((d) => d.id === req.params.id);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });
    res.json(doc);
});

module.exports = router;
