import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent, getStripeConfig } from "../api";

const CURRENCY_SYMBOLS = { inr: "₹", usd: "$", sar: "﷼", aed: "د.إ", egp: "ج.م", eur: "€", gbp: "£" };

/* ── Checkout Form inside Stripe Elements ── */
function CheckoutForm({ amount, currencySymbol, onSuccess, onCancel, loading, setLoading }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href, // not actually used — we handle below
            },
            redirect: "if_required",
        });

        if (result.error) {
            setError(result.error.message);
            setLoading(false);
        } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
            onSuccess(result.paymentIntent.id);
        } else {
            setError("Payment was not completed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement
                options={{
                    layout: "tabs",
                    defaultValues: { billingDetails: { address: { country: "IN" } } },
                }}
            />
            {error && (
                <div
                    className="ae aE"
                    style={{ marginTop: "1rem", fontSize: ".82rem" }}
                >
                    {error}
                </div>
            )}
            <div
                style={{
                    display: "flex",
                    gap: ".75rem",
                    marginTop: "1.25rem",
                }}
            >
                <button
                    type="button"
                    className="btn bS"
                    onClick={onCancel}
                    disabled={loading}
                    style={{ flex: 1 }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn bP"
                    disabled={!stripe || loading}
                    style={{ flex: 2 }}
                >
                    {loading ? (
                        <span style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                            <span
                                style={{
                                    width: 16,
                                    height: 16,
                                    border: "2px solid rgba(255,255,255,.3)",
                                    borderTopColor: "#fff",
                                    borderRadius: "50%",
                                    animation: "spin .7s linear infinite",
                                    display: "inline-block",
                                }}
                            />
                            Processing...
                        </span>
                    ) : (
                        `Pay ${currencySymbol}${amount}`
                    )}
                </button>
            </div>
        </form>
    );
}

/* ── Main Payment Component ── */
let stripePromise = null;
const getStripePromise = async () => {
    if (!stripePromise) {
        const res = await getStripeConfig();
        stripePromise = loadStripe(res.data.publishableKey);
    }
    return stripePromise;
};

export default function Payment({ amount, currency, doctorName, date, onSuccess, onCancel }) {
    const cur = (currency || "inr").toLowerCase();
    const currencySymbol = CURRENCY_SYMBOLS[cur] || "₹";
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentIntentId, setPaymentIntentId] = useState(null);
    const [stripeObj, setStripeObj] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initError, setInitError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    const initPayment = async () => {
        setLoading(true);
        setInitError(null);
        try {
            const sp = await getStripePromise();
            setStripeObj(sp);

            const res = await createPaymentIntent({
                amount,
                currency: cur,
                appointmentDetails: { doctorName, date },
            });
            setClientSecret(res.data.clientSecret);
            setPaymentIntentId(res.data.paymentIntentId);
            setInitialized(true);
        } catch (err) {
            setInitError(
                err.response?.data?.message || "Failed to initialize payment. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (intentId) => {
        onSuccess(intentId || paymentIntentId);
    };

    return (
        <div className="ov" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div
                className="box"
                style={{
                    width: "100%",
                    maxWidth: 500,
                    padding: 0,
                    animation: "fi .3s ease",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(135deg, var(--pd), var(--pm))",
                        padding: "1.25rem 1.5rem",
                        color: "#fff",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: ".7rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "1px",
                                    opacity: 0.8,
                                    marginBottom: ".25rem",
                                }}
                            >
                                Payment for Appointment
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                                {currencySymbol}{amount}
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            style={{
                                background: "rgba(255,255,255,.2)",
                                border: "none",
                                color: "#fff",
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                cursor: "pointer",
                                fontSize: "1.1rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    {doctorName && (
                        <div
                            style={{
                                fontSize: ".82rem",
                                opacity: 0.85,
                                marginTop: ".3rem",
                            }}
                        >
                            Dr. {doctorName} · {date}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div style={{ padding: "1.5rem" }}>
                    {/* Payment Methods Info */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".4rem",
                            marginBottom: "1rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            style={{
                                fontSize: ".72rem",
                                color: "var(--g5)",
                                fontWeight: 600,
                            }}
                        >
                            Accepted:
                        </span>
                        {["💳 Cards", "📱 UPI", "🏦 Net Banking", "💰 Wallets"].map(
                            (m) => (
                                <span
                                    key={m}
                                    style={{
                                        background: "var(--bg2)",
                                        padding: ".2rem .55rem",
                                        borderRadius: 99,
                                        fontSize: ".68rem",
                                        fontWeight: 600,
                                        color: "var(--pd)",
                                    }}
                                >
                                    {m}
                                </span>
                            )
                        )}
                    </div>

                    {!initialized ? (
                        /* Init state — prompt to start */
                        <div style={{ textAlign: "center", padding: "1rem 0" }}>
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    background:
                                        "linear-gradient(135deg, var(--pli), var(--bg2))",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.8rem",
                                    margin: "0 auto .875rem",
                                }}
                            >
                                🔒
                            </div>
                            <h3
                                style={{
                                    fontSize: "1rem",
                                    color: "var(--g8)",
                                    marginBottom: ".3rem",
                                }}
                            >
                                Secure Payment
                            </h3>
                            <p
                                style={{
                                    fontSize: ".82rem",
                                    color: "var(--g5)",
                                    marginBottom: "1.25rem",
                                    lineHeight: 1.5,
                                }}
                            >
                                Your payment is secured by Stripe. Click below to proceed.
                            </p>
                            {initError && (
                                <div
                                    className="ae aE"
                                    style={{
                                        marginBottom: "1rem",
                                        fontSize: ".82rem",
                                        textAlign: "left",
                                    }}
                                >
                                    {initError}
                                </div>
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    gap: ".75rem",
                                }}
                            >
                                <button
                                    className="btn bS"
                                    onClick={onCancel}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn bP lg"
                                    onClick={initPayment}
                                    disabled={loading}
                                    style={{ flex: 2 }}
                                >
                                    {loading ? (
                                        <span
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: ".5rem",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    border: "2px solid rgba(255,255,255,.3)",
                                                    borderTopColor: "#fff",
                                                    borderRadius: "50%",
                                                    animation: "spin .7s linear infinite",
                                                    display: "inline-block",
                                                }}
                                            />
                                            Initializing...
                                        </span>
                                    ) : (
                                        `💳 Pay ${currencySymbol}${amount}`
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Stripe Elements Form */
                        clientSecret &&
                        stripeObj && (
                            <Elements
                                stripe={stripeObj}
                                options={{
                                    clientSecret,
                                    appearance: {
                                        theme: "stripe",
                                        variables: {
                                            colorPrimary: "#00796b",
                                            borderRadius: "8px",
                                            fontFamily:
                                                "'Plus Jakarta Sans', sans-serif",
                                        },
                                    },
                                }}
                            >
                                <CheckoutForm
                                    amount={amount}
                                    currencySymbol={currencySymbol}
                                    onSuccess={handlePaymentSuccess}
                                    onCancel={onCancel}
                                    loading={loading}
                                    setLoading={setLoading}
                                />
                            </Elements>
                        )
                    )}

                    {/* Security badge */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: ".4rem",
                            marginTop: "1.25rem",
                            paddingTop: "1rem",
                            borderTop: "1px solid var(--g2)",
                        }}
                    >
                        <span style={{ fontSize: ".82rem" }}>🔒</span>
                        <span
                            style={{
                                fontSize: ".7rem",
                                color: "var(--g5)",
                            }}
                        >
                            Secured by <strong>Stripe</strong> · 256-bit SSL
                            encryption
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
