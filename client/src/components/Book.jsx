import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getDoctors, bookAppointment } from "../api";
import Slip from "./Slip";
import Payment from "./Payment";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = () => new Date().toISOString().split("T")[0];
const maxd = () => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split("T")[0]; };
const fshort = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Stars({ r }) {
    return <span style={{ color: "#f59e0b", fontSize: ".8rem" }}>{"★".repeat(Math.floor(r))}<span style={{ color: "#757575", fontWeight: 700, marginLeft: 3 }}>{r}</span></span>;
}

export default function Book({ go }) {
    const { user } = useAuth();
    const [docs, setDocs] = useState([]);
    const [step, ss] = useState(1);
    const [q, sq] = useState(""); const [sp, ssp] = useState("All");
    const [doc, sd] = useState(null); const [dt, sdt] = useState(""); const [slot, ssl] = useState(null);
    const [rsn, sr] = useState(""); const [sym, sy] = useState("");
    const [ld, sl] = useState(false); const [done, sdn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        getDoctors()
            .then((res) => setDocs(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const fdoc = docs.filter(d => sp === "All" || d.spec === sp).filter(d => !q || d.name.toLowerCase().includes(q.toLowerCase()));
    const slots = () => {
        if (!doc || !dt) return [];
        const day = DAYS[new Date(dt + "T12:00:00").getDay()];
        const dd = doc.av.find(a => a.day === day);
        return dd ? dd.sl : [];
    };
    const sl2 = slots();

    const handlePayNow = () => {
        if (!user) { go("login"); return; }
        setShowPayment(true);
    };

    const handlePayLater = async () => {
        if (!user) { go("login"); return; }
        sl(true);
        try {
            const res = await bookAppointment({
                doctor: doc,
                date: dt,
                slot,
                reason: rsn,
                symptoms: sym.split(",").map(s => s.trim()).filter(Boolean),
                paymentMethod: "pay_later",
            });
            sdn(res.data);
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed. Please try again.");
        } finally {
            sl(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntentId) => {
        setShowPayment(false);
        sl(true);
        try {
            const res = await bookAppointment({
                doctor: doc,
                date: dt,
                slot,
                reason: rsn,
                symptoms: sym.split(",").map(s => s.trim()).filter(Boolean),
                paymentIntentId,
            });
            sdn(res.data);
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed. Please try again.");
        } finally {
            sl(false);
        }
    };

    if (done) return <Slip apt={done} onBack={() => { sdn(null); go("dash"); }} onNew={() => { sdn(null); ss(1); sd(null); sdt(""); ssl(null); sr(""); sy(""); }} />;
    if (loading) return <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" /></div>;

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", paddingBottom: "5rem" }}>
            <div style={{ background: "#fff", borderBottom: "1px solid var(--g2)", padding: ".7rem 0" }}>
                <div className="C" style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    {[["1. Choose Doctor", 1], ["2. Date & Slot", 2], ["3. Confirm", 3]].map(([l, s], i, arr) => (
                        <span key={s} style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                            <span onClick={() => s < step && ss(s)} style={{ fontSize: ".85rem", fontWeight: 600, color: step >= s ? "var(--pm)" : "var(--g4)", cursor: s < step ? "pointer" : "default" }}>{l}</span>
                            {i < arr.length - 1 && <span style={{ color: "var(--g3)" }}>›</span>}
                        </span>
                    ))}
                </div>
            </div>
            <div className="C" style={{ paddingTop: "1.5rem" }}>
                {step === 1 && (
                    <div style={{ animation: "fi .3s ease" }}>
                        <h1 style={{ fontSize: "1.6rem", marginBottom: ".4rem" }}>Find Your Doctor</h1>
                        <p style={{ color: "var(--g5)", marginBottom: "1.4rem", fontSize: ".9rem" }}>Browse our verified specialists</p>
                        <div style={{ display: "flex", gap: ".875rem", marginBottom: "1.1rem", flexWrap: "wrap" }}>
                            <input className="inp" style={{ flex: 1, minWidth: 200 }} placeholder="🔍 Search doctors..." value={q} onChange={e => sq(e.target.value)} />
                            <select className="inp" style={{ width: "auto", minWidth: 160 }} value={sp} onChange={e => ssp(e.target.value)}>
                                {["All", "Cardiology", "Pediatrics", "Dermatology", "Orthopedics", "Neurology", "General Medicine", "Gynecology", "ENT"].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
                            {fdoc.map(d => (
                                <div key={d.id} className="card" style={{ padding: "1.2rem", cursor: "pointer", border: `1.5px solid ${doc?.id === d.id ? "var(--pm)" : "var(--g2)"}` }} onClick={() => sd(d)}>
                                    <div style={{ display: "flex", gap: ".7rem", alignItems: "center", marginBottom: ".7rem" }}>
                                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{d.name.charAt(4)?.toUpperCase() || "D"}</div>
                                        <div><div style={{ fontWeight: 700, fontSize: ".9rem" }}>{d.name}</div><span className="pill">{d.spec}</span><div style={{ fontSize: ".72rem", color: "var(--g5)", marginTop: ".1rem" }}>{d.qual}</div></div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: ".55rem", borderTop: "1px solid var(--g2)" }}>
                                        <div style={{ fontSize: ".75rem", color: "var(--g5)" }}><Stars r={d.rat} /> · {d.exp}yr exp</div>
                                        <div style={{ fontWeight: 700, fontSize: ".95rem" }}>₹{d.fee}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {doc && (
                            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1.5px solid var(--g2)", padding: ".875rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 400, boxShadow: "0 -4px 20px rgba(0,0,0,.1)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{doc.name.charAt(4)?.toUpperCase() || "D"}</div>
                                    <div><div style={{ fontWeight: 700, fontSize: ".875rem" }}>{doc.name}</div><div style={{ fontSize: ".78rem", color: "var(--g5)" }}>₹{doc.fee} consultation</div></div>
                                </div>
                                <button className="btn bP" onClick={() => ss(2)}>Select Date & Time →</button>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && doc && (
                    <div style={{ animation: "fi .3s ease" }}>
                        <button onClick={() => ss(1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 600, fontSize: ".875rem", marginBottom: "1.4rem", padding: 0, fontFamily: "inherit" }}>← Back</button>
                        {!user && <div className="ae aI" style={{ marginBottom: "1.1rem" }}>Please <button onClick={() => go("login")} style={{ background: "none", border: "none", color: "var(--pm)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>login</button> to book.</div>}
                        <div className="book-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>
                            <div className="card" style={{ padding: "1.3rem", position: "sticky", top: 76 }}>
                                <div style={{ display: "flex", gap: ".7rem", alignItems: "center", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "2px solid var(--g2)" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{doc.name.charAt(4)?.toUpperCase() || "D"}</div>
                                    <div><div style={{ fontWeight: 700, fontSize: ".875rem" }}>{doc.name}</div><span className="pill">{doc.spec}</span></div>
                                </div>
                                {[["Qual.", doc.qual], ["Exp.", `${doc.exp} years`], ["Rating", `⭐ ${doc.rat}/5`]].map(([l, v]) => (
                                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: ".42rem 0", borderBottom: "1px dashed var(--g2)", fontSize: ".82rem" }}><span style={{ color: "var(--g5)" }}>{l}</span><strong style={{ textAlign: "right", maxWidth: "60%" }}>{v}</strong></div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: ".5rem 0", fontSize: ".9rem" }}><span style={{ color: "var(--g5)" }}>Fee</span><strong style={{ color: "var(--pm)", fontSize: "1rem" }}>₹{doc.fee}</strong></div>
                            </div>
                            <div>
                                <div className="card" style={{ padding: "1.3rem", marginBottom: "1.1rem" }}>
                                    <h3 style={{ fontSize: ".95rem", marginBottom: "1rem" }}>📅 Select Date</h3>
                                    <div style={{ marginBottom: ".875rem" }}><label className="lbl">Appointment Date</label><input className="inp" type="date" value={dt} onChange={e => { sdt(e.target.value); ssl(null); }} min={today()} max={maxd()} required /></div>
                                    {dt && (sl2.length === 0
                                        ? <p style={{ color: "var(--g5)", fontSize: ".85rem", background: "#fafafa", padding: ".875rem", borderRadius: 8 }}>No slots on {fshort(dt)}. Please try another date.</p>
                                        : <div>
                                            <label className="lbl">Available Time Slots</label>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: ".42rem" }}>
                                                {sl2.map(s => (
                                                    <button key={s} onClick={() => ssl(s)} style={{ padding: ".5rem .3rem", border: `2px solid ${slot === s ? "var(--pm)" : "var(--g2)"}`, borderRadius: 8, background: slot === s ? "var(--pm)" : "#fff", color: slot === s ? "#fff" : "var(--g7)", fontWeight: 600, fontSize: ".82rem", cursor: "pointer", transition: "all var(--tr)", fontFamily: "inherit" }}>{s}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {slot && (
                                    <div className="card" style={{ padding: "1.3rem" }}>
                                        <h3 style={{ fontSize: ".95rem", marginBottom: "1rem" }}>📝 Visit Details</h3>
                                        <div style={{ marginBottom: ".875rem" }}><label className="lbl">Reason for Visit *</label><textarea className="inp" value={rsn} onChange={e => sr(e.target.value)} rows={3} required placeholder="Describe your health concern..." style={{ resize: "vertical" }} /></div>
                                        <div style={{ marginBottom: "1.1rem" }}><label className="lbl">Symptoms (comma-separated, optional)</label><input className="inp" value={sym} onChange={e => sy(e.target.value)} placeholder="fever, headache, fatigue" /></div>
                                        <div style={{ background: "var(--bg2)", borderRadius: 8, padding: ".9rem", marginBottom: "1.1rem" }}>
                                            <div style={{ fontSize: ".72rem", textTransform: "uppercase", color: "var(--g5)", fontWeight: 700, letterSpacing: ".5px", marginBottom: ".55rem" }}>Booking Summary</div>
                                            {[["Doctor", doc.name], ["Date", fshort(dt)], ["Time", slot], ["Fee", `₹${doc.fee}`]].map(([l, v]) => (
                                                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: ".35rem 0", borderBottom: "1px dashed var(--g2)", fontSize: ".85rem" }}><span style={{ color: "var(--g5)" }}>{l}</span><strong>{v}</strong></div>
                                            ))}
                                        </div>
                                        <div style={{ display: "flex", gap: ".75rem", alignItems: "stretch" }}>
                                            <button className="btn bP" style={{ flex: 1, padding: ".8rem" }} onClick={handlePayNow} disabled={ld || !rsn.trim() || !user}>
                                                {!user ? "Login to Book" : ld ? "Booking..." : "💳 Pay Now ₹" + doc.fee}
                                            </button>
                                            <div style={{ display: "flex", alignItems: "center", color: "var(--g4)", fontSize: ".75rem", fontWeight: 600 }}>or</div>
                                            <button style={{ flex: 1, padding: ".8rem", border: "2px solid #f59e0b", borderRadius: 10, background: "#fffbeb", color: "#92400e", fontWeight: 700, fontSize: ".875rem", cursor: "pointer", fontFamily: "inherit", transition: "all var(--tr)" }} onClick={handlePayLater} disabled={ld || !rsn.trim() || !user}
                                                onMouseEnter={e => { e.currentTarget.style.background = "#fef3c7"; e.currentTarget.style.borderColor = "#d97706"; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "#fffbeb"; e.currentTarget.style.borderColor = "#f59e0b"; }}>
                                                {ld ? "Booking..." : "🏥 Pay Later"}
                                            </button>
                                        </div>
                                        <p style={{ fontSize: ".72rem", color: "var(--g5)", textAlign: "center", marginTop: ".5rem", marginBottom: 0 }}>Pay Later — pay at the hospital reception on your visit day</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showPayment && doc && (
                <Payment
                    amount={doc.fee}
                    doctorName={doc.name}
                    date={fshort(dt)}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setShowPayment(false)}
                />
            )}
        </div>
    );
}
