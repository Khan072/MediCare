const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

// POST /api/payment/create-intent — Create a Stripe PaymentIntent
router.post("/create-intent", protect, async (req, res) => {
    try {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        const { amount, appointmentDetails } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid payment amount" });
        }

        // Amount in smallest currency unit (paise for INR)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: "inr",
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId: req.user._id.toString(),
                patientName: req.user.name,
                doctorName: appointmentDetails?.doctorName || "",
                appointmentDate: appointmentDetails?.date || "",
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error("Payment Intent Error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// POST /api/payment/verify — Verify payment status
router.post("/verify", protect, async (req, res) => {
    try {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ message: "Payment intent ID is required" });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        res.json({
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            paymentMethod: paymentIntent.payment_method_types?.[0] || "card",
        });
    } catch (error) {
        console.error("Payment Verify Error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/payment/config — Get publishable key for client
router.get("/config", (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

module.exports = router;
