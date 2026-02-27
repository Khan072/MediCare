import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { submitFeedback, getFeedbacks } from "../api";

const Star = ({ filled, half, onClick, onHover }) => (
    <span
        onClick={onClick}
        onMouseEnter={onHover}
        style={{ cursor: onClick ? "pointer" : "default", fontSize: "1.5rem", color: filled ? "#f59e0b" : half ? "#f59e0b" : "#e5e7eb", transition: "color .15s ease", userSelect: "none" }}
    >
        {filled ? "★" : "☆"}
    </span>
);

export default function FeedbackPage({ go }) {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });

    const fetchFeedbacks = async () => {
        try {
            const res = await getFeedbacks();
            setFeedbacks(res.data);
        } catch (err) {
            console.error("Failed to fetch feedback:", err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchFeedbacks(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ text: "", type: "" });
        if (!user) {
            setMsg({ text: "Please log in to submit feedback.", type: "err" });
            return;
        }
        if (!rating || !message.trim()) {
            setMsg({ text: "Please provide a rating and message.", type: "err" });
            return;
        }
        setSubmitting(true);
        try {
            await submitFeedback({ rating, message: message.trim() });
            setMsg({ text: "Thank you for your feedback! 🎉", type: "ok" });
            setRating(0);
            setMessage("");
            fetchFeedbacks();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || "Failed to submit feedback.", type: "err" });
        }
        setSubmitting(false);
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : "0";

    if (loading) return <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" /></div>;

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", padding: "2.5rem 0 4rem" }}>
            <div className="C">
                <div style={{ textAlign: "center", marginBottom: "2.5rem", animation: "fi .5s ease" }}>
                    <span className="tag">💬 Feedback</span>
                    <h1 style={{ fontSize: "1.85rem", marginBottom: ".5rem" }}>Patient Reviews & Feedback</h1>
                    <p style={{ color: "var(--g6)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
                        Your feedback helps us improve our services. Share your experience with us.
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="feedback-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
                    {[["⭐", "Average Rating", `${avgRating}/5`], ["💬", "Total Reviews", feedbacks.length], ["😊", "Satisfaction", feedbacks.length > 0 ? `${Math.round((feedbacks.filter(f => f.rating >= 4).length / feedbacks.length) * 100)}%` : "—"]].map(([ic, l, v]) => (
                        <div key={l} className="card" style={{ padding: "1.1rem 1.25rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
                            <div style={{ fontSize: "1.3rem" }}>{ic}</div>
                            <div><div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--pm)" }}>{v}</div><div style={{ fontSize: ".72rem", color: "var(--g5)", fontWeight: 500 }}>{l}</div></div>
                        </div>
                    ))}
                </div>

                <div className="feedback-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    {/* Submit Form */}
                    <div className="card" style={{ padding: "1.75rem", alignSelf: "start" }}>
                        <h3 style={{ fontSize: "1.05rem", marginBottom: "1.25rem" }}>✍️ Submit Your Feedback</h3>
                        {!user && (
                            <div className="ae aI" style={{ marginBottom: "1rem" }}>
                                Please <button onClick={() => go("login")} style={{ background: "none", border: "none", color: "#1565c0", cursor: "pointer", fontWeight: 700, textDecoration: "underline", fontFamily: "inherit", padding: 0 }}>log in</button> to submit feedback.
                            </div>
                        )}
                        {msg.text && <div className={`ae ${msg.type === "ok" ? "aS" : "aE"}`} style={{ marginBottom: "1rem" }}>{msg.text}</div>}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "1.25rem" }}>
                                <label className="lbl">Your Rating</label>
                                <div style={{ display: "flex", gap: ".15rem", marginTop: ".25rem" }}>
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <Star key={n} filled={n <= (hover || rating)} onClick={() => setRating(n)} onHover={() => setHover(n)} />
                                    ))}
                                    <span style={{ marginLeft: ".5rem", fontSize: ".85rem", color: "var(--g5)", alignSelf: "center" }}>{rating > 0 ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating] : ""}</span>
                                </div>
                            </div>
                            <div style={{ marginBottom: "1.25rem" }}>
                                <label className="lbl">Your Message</label>
                                <textarea className="inp" rows={4} placeholder="Share your experience..." value={message} onChange={e => setMessage(e.target.value)} style={{ resize: "vertical" }} />
                            </div>
                            <button type="submit" className="btn bP" disabled={submitting || !user} style={{ width: "100%" }}>
                                {submitting ? "Submitting..." : "📤 Submit Feedback"}
                            </button>
                        </form>
                    </div>

                    {/* Feedback List */}
                    <div>
                        <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>🗣️ What Patients Say</h3>
                        {feedbacks.length === 0 ? (
                            <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>💬</div>
                                <p style={{ color: "var(--g4)" }}>No feedback yet. Be the first to share!</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: ".875rem" }}>
                                {feedbacks.map(fb => (
                                    <div key={fb._id} className="card" style={{ padding: "1.25rem", animation: "fi .5s ease" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".6rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--ac))", color: "#fff", fontSize: ".8rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    {fb.name?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: ".875rem" }}>{fb.name}</div>
                                                    <div style={{ fontSize: ".72rem", color: "var(--g5)" }}>{fmtDate(fb.createdAt)}</div>
                                                </div>
                                            </div>
                                            <div style={{ color: "#f59e0b", fontSize: ".85rem", fontWeight: 700 }}>
                                                {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: ".875rem", color: "var(--g6)", lineHeight: 1.65, margin: 0 }}>{fb.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
