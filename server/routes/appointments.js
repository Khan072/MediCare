const express = require("express");
const Appointment = require("../models/Appointment");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// Generate appointment number
const genAptNum = () => "APT" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 99 + 1).toString().padStart(2, "0");

// POST /api/appointments — Book a new appointment (auth required)
router.post("/", protect, async (req, res) => {
    try {
        const { doctor, date, slot, reason, symptoms, paymentIntentId, paymentMethod } = req.body;

        // --- Pay Later flow: skip Stripe, book immediately ---
        let paymentData = {
            status: "pending",
            amount: doctor.fee,
            method: "online",
        };

        if (paymentMethod === "pay_later") {
            paymentData = {
                amount: doctor.fee,
                status: "pending",
                method: "pay_later",
            };
        } else if (paymentIntentId) {
            try {
                const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

                if (paymentIntent.status === "succeeded") {
                    paymentData = {
                        transactionId: paymentIntentId,
                        amount: paymentIntent.amount / 100,
                        status: "succeeded",
                        method: paymentIntent.payment_method_types?.[0] || "card",
                    };
                } else {
                    return res.status(400).json({
                        message: "Payment not completed. Please complete payment first.",
                    });
                }
            } catch (stripeErr) {
                return res.status(400).json({ message: "Payment verification failed: " + stripeErr.message });
            }
        }

        const apt = await Appointment.create({
            aptNumber: genAptNum(),
            user: req.user._id,
            patientName: req.user.name,
            patientEmail: req.user.email,
            patientPhone: req.user.phone || "N/A",
            doctor,
            date,
            slot,
            reason,
            symptoms: symptoms || [],
            status: "confirmed",
            fee: doctor.fee,
            payment: paymentData,
        });

        res.status(201).json(apt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/appointments — Get appointments (own for patient, all for admin)
router.get("/", protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== "admin") {
            query.user = req.user._id;
        }
        const apts = await Appointment.find(query).sort({ createdAt: -1 });
        res.json(apts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/appointments/:id — Get single appointment
router.get("/:id", protect, async (req, res) => {
    try {
        const apt = await Appointment.findById(req.params.id);
        if (!apt) return res.status(404).json({ message: "Appointment not found" });

        // Only owner or admin can view
        if (apt.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(apt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/appointments/:id/status — Update appointment status
router.put("/:id/status", protect, async (req, res) => {
    try {
        const apt = await Appointment.findById(req.params.id);
        if (!apt) return res.status(404).json({ message: "Appointment not found" });

        // Patient can only cancel their own; admin can change to anything
        if (req.user.role !== "admin") {
            if (apt.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Not authorized" });
            }
            if (req.body.status !== "cancelled") {
                return res.status(403).json({ message: "Patients can only cancel appointments" });
            }
        }

        apt.status = req.body.status;
        const updated = await apt.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/appointments/stats/overview — Admin stats
router.get("/stats/overview", protect, admin, async (req, res) => {
    try {
        const total = await Appointment.countDocuments();
        const confirmed = await Appointment.countDocuments({ status: "confirmed" });
        const completed = await Appointment.countDocuments({ status: "completed" });
        const cancelled = await Appointment.countDocuments({ status: "cancelled" });

        const apts = await Appointment.find();
        const revenue = apts.reduce((s, a) => s + (a.fee || 0), 0);

        res.json({ total, confirmed, completed, cancelled, revenue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/appointments/doctor-performance — Per-doctor performance stats (admin)
router.get("/doctor-performance", protect, admin, async (req, res) => {
    try {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
        const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

        const apts = await Appointment.find();

        // Group by doctor id
        const docMap = {};
        apts.forEach((a) => {
            const doc = a.doctor || a.doc;
            const did = doc.id || doc._id || "unknown";
            if (!docMap[did]) {
                docMap[did] = {
                    doctorId: did,
                    doctorName: doc.name,
                    specialization: doc.spec,
                    total: 0,
                    today: 0,
                    thisMonth: 0,
                    confirmed: 0,
                    completed: 0,
                    cancelled: 0,
                    pending: 0,
                    revenue: 0,
                };
            }
            const m = docMap[did];
            m.total++;
            m.revenue += a.fee || 0;
            if (a.status) m[a.status] = (m[a.status] || 0) + 1;
            const aptDate = (a.date || a.dt || "").split("T")[0];
            if (aptDate === todayStr) m.today++;
            if (aptDate >= monthStart) m.thisMonth++;
        });

        const result = Object.values(docMap).map((d) => ({
            ...d,
            completionRate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
