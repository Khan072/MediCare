import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getDoctors, bookAppointment, getBookedSlots } from "../api";
import { t, formatPrice, getConvertedAmount, getCurrency } from "../i18n";
import Slip from "./Slip";
import Payment from "./Payment";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = () => new Date().toISOString().split("T")[0];
const fshort = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Convert 24h time to 12h with AM/PM
function to12h(t) {
    const [h, m] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}

function isMorning(timeStr) {
    const h = parseInt(timeStr.split(":")[0], 10);
    return h < 12;
}

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
    const [ld, sl2] = useState(false); const [done, sdn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        getDoctors()
            .then((res) => setDocs(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Fetch booked slots when doctor and date change
    useEffect(() => {
        if (doc && dt) {
            getBookedSlots(doc.id || doc._id, dt)
                .then(res => setBookedSlots(res.data))
                .catch(() => setBookedSlots([]));
        } else {
            setBookedSlots([]);
        }
    }, [doc, dt]);

    const fdoc = docs.filter(d => sp === "All" || d.spec === sp).filter(d => !q || d.name.toLowerCase().includes(q.toLowerCase()));

    // Get available slots for the selected date
    const getSlots = () => {
        if (!doc || !dt) return [];
        const day = DAYS[new Date(dt + "T12:00:00").getDay()];
        const dd = doc.av.find(a => a.day === day);
        return dd ? dd.sl : [];
    };
    const allSlots = getSlots();

    // Split slots into morning and evening, mark booked ones
    const morningSlots = allSlots.filter(s => isMorning(s));
    const eveningSlots = allSlots.filter(s => !isMorning(s));

    // ─── Calendar logic ───
    const calendarMonths = useMemo(() => {
        if (!doc) return [];
        const months = [];
        const now = new Date();
        const availDays = new Set((doc.av || []).map(a => a.day));

        for (let m = 0; m < 3; m++) {
            const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
            const month = d.toLocaleString("en-US", { month: "long", year: "numeric" });
            const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            const firstDay = d.getDay();
            const cells = [];

            // Empty cells for days before the 1st
            for (let i = 0; i < firstDay; i++) cells.push(null);

            for (let day = 1; day <= daysInMonth; day++) {
                const dd = new Date(d.getFullYear(), d.getMonth(), day);
                const dateStr = dd.toISOString().split("T")[0];
                const dayName = DAYS[dd.getDay()];
                const isPast = dateStr < today();
                const hasSlots = availDays.has(dayName);
                cells.push({ day, dateStr, available: hasSlots && !isPast, isPast });
            }
            months.push({ month, cells });
        }
        return months;
    }, [doc]);

    const handlePayNow = () => {
        if (!user) { go("login"); return; }
        // Validate
        if (!rsn.trim()) {
            setFieldErrors({ reason: t("val.reason_required") });
            return;
        }
        setFieldErrors({});
        setShowPayment(true);
    };

    const handlePayLater = async () => {
        if (!user) { go("login"); return; }
        if (!rsn.trim()) {
            setFieldErrors({ reason: t("val.reason_required") });
            return;
        }
        setFieldErrors({});
        sl2(true);
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
            sl2(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntentId) => {
        setShowPayment(false);
        sl2(true);
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
            sl2(false);
        }
    };

    const handleDateSelect = (dateStr) => {
        sdt(dateStr);
        ssl(null);
    };

    const handleStep2Next = () => {
        if (!dt) {
            setFieldErrors({ date: t("val.date_required") });
            return;
        }
        if (!slot) {
            setFieldErrors({ slot: t("val.slot_required") });
            return;
        }
        setFieldErrors({});
        ss(3);
    };

    if (done) return <Slip apt={done} onBack={() => { sdn(null); go("dash"); }} onNew={() => { sdn(null); ss(1); sd(null); sdt(""); ssl(null); sr(""); sy(""); }} />;
    if (loading) return <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" /></div>;

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", paddingBottom: "5rem" }}>
            <div style={{ background: "#fff", borderBottom: "1px solid var(--g2)", padding: ".7rem 0" }}>
                <div className="C" style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    {[[t("book.step1"), 1], [t("book.step2"), 2], [t("book.step3"), 3]].map(([l, s], i, arr) => (
                        <span key={s} style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                            <span onClick={() => s < step && ss(s)} style={{ fontSize: ".85rem", fontWeight: 600, color: step >= s ? "var(--pm)" : "var(--g4)", cursor: s < step ? "pointer" : "default" }}>{l}</span>
                            {i < arr.length - 1 && <span style={{ color: "var(--g3)" }}>›</span>}
                        </span>
                    ))}
                </div>
            </div>
            <div className="C" style={{ paddingTop: "1.5rem" }}>
                {/* STEP 1: Choose Doctor */}
                {step === 1 && (
                    <div style={{ animation: "fi .3s ease" }}>
                        <h1 style={{ fontSize: "1.6rem", marginBottom: ".4rem" }}>{t("book.find_doctor")}</h1>
                        <p style={{ color: "var(--g5)", marginBottom: "1.4rem", fontSize: ".9rem" }}>{t("book.browse")}</p>
                        <div style={{ display: "flex", gap: ".875rem", marginBottom: "1.1rem", flexWrap: "wrap" }}>
                            <input className="inp" style={{ flex: 1, minWidth: 200 }} placeholder={t("book.search")} value={q} onChange={e => sq(e.target.value)} />
                            <select className="inp" style={{ width: "auto", minWidth: 160 }} value={sp} onChange={e => ssp(e.target.value)}>
                                {[t("book.all"), "Cardiology", "Pediatrics", "Dermatology", "Orthopedics", "Neurology", "General Medicine", "Gynecology", "ENT"].map(s => <option key={s} value={s === t("book.all") ? "All" : s}>{s}</option>)}
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
                                        <div style={{ fontSize: ".75rem", color: "var(--g5)" }}><Stars r={d.rat} /> · {d.exp}{t("book.yr_exp")}</div>
                                        <div style={{ fontWeight: 700, fontSize: ".95rem" }}>{formatPrice(d.fee)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {doc && (
                            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1.5px solid var(--g2)", padding: ".875rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 400, boxShadow: "0 -4px 20px rgba(0,0,0,.1)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{doc.name.charAt(4)?.toUpperCase() || "D"}</div>
                                    <div><div style={{ fontWeight: 700, fontSize: ".875rem" }}>{doc.name}</div><div style={{ fontSize: ".78rem", color: "var(--g5)" }}>{formatPrice(doc.fee)} {t("book.consultation")}</div></div>
                                </div>
                                <button className="btn bP" onClick={() => ss(2)}>{t("book.select_date_time")}</button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: Date & Slot */}
                {step === 2 && doc && (
                    <div style={{ animation: "fi .3s ease" }}>
                        <button onClick={() => ss(1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 600, fontSize: ".875rem", marginBottom: "1.4rem", padding: 0, fontFamily: "inherit" }}>{t("book.back")}</button>
                        {!user && <div className="ae aI" style={{ marginBottom: "1.1rem" }}>{t("book.login_to_book")} <button onClick={() => go("login")} style={{ background: "none", border: "none", color: "var(--pm)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{t("book.login_link")}</button> {t("book.to_book")}</div>}
                        <div className="book-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>
                            {/* Doctor info sidebar */}
                            <div className="card" style={{ padding: "1.3rem", position: "sticky", top: 76 }}>
                                <div style={{ display: "flex", gap: ".7rem", alignItems: "center", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "2px solid var(--g2)" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{doc.name.charAt(4)?.toUpperCase() || "D"}</div>
                                    <div><div style={{ fontWeight: 700, fontSize: ".875rem" }}>{doc.name}</div><span className="pill">{doc.spec}</span></div>
                                </div>
                                {[[t("book.qual"), doc.qual], [t("book.exp"), `${doc.exp} ${t("book.years")}`], [t("book.rating"), `⭐ ${doc.rat}/5`]].map(([l, v]) => (
                                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: ".42rem 0", borderBottom: "1px dashed var(--g2)", fontSize: ".82rem" }}><span style={{ color: "var(--g5)" }}>{l}</span><strong style={{ textAlign: "right", maxWidth: "60%" }}>{v}</strong></div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: ".5rem 0", fontSize: ".9rem" }}><span style={{ color: "var(--g5)" }}>{t("book.fee")}</span><strong style={{ color: "var(--pm)", fontSize: "1rem" }}>{formatPrice(doc.fee)}</strong></div>
                            </div>

                            {/* Calendar + Slots */}
                            <div>
                                <div className="card" style={{ padding: "1.3rem", marginBottom: "1.1rem" }}>
                                    <h3 style={{ fontSize: ".95rem", marginBottom: "1rem" }}>{t("book.select_date")}</h3>

                                    {/* Visual Calendar Grid */}
                                    {calendarMonths.map((cm) => (
                                        <div key={cm.month} style={{ marginBottom: "1.2rem" }}>
                                            <div style={{ fontWeight: 700, fontSize: ".85rem", color: "var(--g7)", marginBottom: ".5rem", textAlign: "center" }}>{cm.month}</div>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", fontSize: ".75rem" }}>
                                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                                                    <div key={d} style={{ textAlign: "center", fontWeight: 700, color: "var(--g5)", padding: ".25rem 0", fontSize: ".68rem" }}>{d}</div>
                                                ))}
                                                {cm.cells.map((cell, i) => {
                                                    if (!cell) return <div key={`e${i}`} />;
                                                    const isSelected = dt === cell.dateStr;
                                                    return (
                                                        <button
                                                            key={cell.dateStr}
                                                            onClick={() => cell.available && handleDateSelect(cell.dateStr)}
                                                            disabled={!cell.available}
                                                            style={{
                                                                width: "100%", aspectRatio: "1", border: isSelected ? "2px solid var(--pm)" : "1px solid transparent",
                                                                borderRadius: 8,
                                                                background: isSelected ? "var(--pm)" : cell.available ? "#e8f5e9" : cell.isPast ? "#f5f5f5" : "#fafafa",
                                                                color: isSelected ? "#fff" : cell.available ? "#2e7d32" : "#bdbdbd",
                                                                fontWeight: isSelected ? 800 : cell.available ? 600 : 400,
                                                                cursor: cell.available ? "pointer" : "default",
                                                                fontSize: ".78rem", fontFamily: "inherit",
                                                                transition: "all .15s",
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                            }}
                                                        >
                                                            {cell.day}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                    {fieldErrors.date && <div style={{ color: "#ef4444", fontSize: ".75rem", marginTop: ".3rem" }}>{fieldErrors.date}</div>}

                                    {/* Legend */}
                                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", fontSize: ".72rem", color: "var(--g5)", marginTop: ".5rem" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: ".3rem" }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#e8f5e9", border: "1px solid #c8e6c9" }} /> {t("book.available")}</span>
                                        <span style={{ display: "flex", alignItems: "center", gap: ".3rem" }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "#f5f5f5", border: "1px solid #e0e0e0" }} /> {t("book.unavailable")}</span>
                                    </div>
                                </div>

                                {/* Time Slots grouped by Morning / Evening */}
                                {dt && allSlots.length === 0 && (
                                    <p style={{ color: "var(--g5)", fontSize: ".85rem", background: "#fafafa", padding: ".875rem", borderRadius: 8 }}>{t("book.no_slots")} {fshort(dt)}{t("book.try_another")}</p>
                                )}
                                {dt && allSlots.length > 0 && (
                                    <div className="card" style={{ padding: "1.3rem", marginBottom: "1.1rem" }}>
                                        <label className="lbl">{t("book.available_slots")}</label>

                                        {morningSlots.length > 0 && (
                                            <div style={{ marginBottom: "1rem" }}>
                                                <div style={{ fontSize: ".8rem", fontWeight: 700, color: "#f59e0b", marginBottom: ".45rem" }}>{t("book.morning")}</div>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: ".42rem" }}>
                                                    {morningSlots.map(s => {
                                                        const isBooked = bookedSlots.includes(s);
                                                        return (
                                                            <button key={s} onClick={() => !isBooked && ssl(s)} disabled={isBooked}
                                                                style={{
                                                                    padding: ".5rem .3rem",
                                                                    border: `2px solid ${isBooked ? "#e0e0e0" : slot === s ? "var(--pm)" : "var(--g2)"}`,
                                                                    borderRadius: 8,
                                                                    background: isBooked ? "#f5f5f5" : slot === s ? "var(--pm)" : "#fff",
                                                                    color: isBooked ? "#bdbdbd" : slot === s ? "#fff" : "var(--g7)",
                                                                    fontWeight: 600, fontSize: ".78rem", cursor: isBooked ? "not-allowed" : "pointer",
                                                                    transition: "all var(--tr)", fontFamily: "inherit",
                                                                    textDecoration: isBooked ? "line-through" : "none",
                                                                    position: "relative",
                                                                }}>
                                                                {to12h(s)}
                                                                {isBooked && <div style={{ fontSize: ".58rem", color: "#ef4444", fontWeight: 700 }}>{t("book.booked")}</div>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {eveningSlots.length > 0 && (
                                            <div>
                                                <div style={{ fontSize: ".8rem", fontWeight: 700, color: "#7c3aed", marginBottom: ".45rem" }}>{t("book.evening")}</div>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: ".42rem" }}>
                                                    {eveningSlots.map(s => {
                                                        const isBooked = bookedSlots.includes(s);
                                                        return (
                                                            <button key={s} onClick={() => !isBooked && ssl(s)} disabled={isBooked}
                                                                style={{
                                                                    padding: ".5rem .3rem",
                                                                    border: `2px solid ${isBooked ? "#e0e0e0" : slot === s ? "var(--pm)" : "var(--g2)"}`,
                                                                    borderRadius: 8,
                                                                    background: isBooked ? "#f5f5f5" : slot === s ? "var(--pm)" : "#fff",
                                                                    color: isBooked ? "#bdbdbd" : slot === s ? "#fff" : "var(--g7)",
                                                                    fontWeight: 600, fontSize: ".78rem", cursor: isBooked ? "not-allowed" : "pointer",
                                                                    transition: "all var(--tr)", fontFamily: "inherit",
                                                                    textDecoration: isBooked ? "line-through" : "none",
                                                                    position: "relative",
                                                                }}>
                                                                {to12h(s)}
                                                                {isBooked && <div style={{ fontSize: ".58rem", color: "#ef4444", fontWeight: 700 }}>{t("book.booked")}</div>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {fieldErrors.slot && <div style={{ color: "#ef4444", fontSize: ".75rem", marginTop: ".5rem" }}>{fieldErrors.slot}</div>}
                                    </div>
                                )}

                                {/* Next button */}
                                {dt && allSlots.length > 0 && (
                                    <button className="btn bP" onClick={handleStep2Next} style={{ width: "100%", padding: ".8rem", marginTop: ".5rem" }}>
                                        {slot ? `${t("book.step3")} →` : t("val.slot_required")}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Confirm & Pay */}
                {step === 3 && doc && slot && (
                    <div style={{ animation: "fi .3s ease" }}>
                        <button onClick={() => ss(2)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 600, fontSize: ".875rem", marginBottom: "1.4rem", padding: 0, fontFamily: "inherit" }}>{t("book.back")}</button>
                        <div className="book-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>
                            {/* Doctor sidebar */}
                            <div className="card" style={{ padding: "1.3rem", position: "sticky", top: 76 }}>
                                <div style={{ display: "flex", gap: ".7rem", alignItems: "center", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "2px solid var(--g2)" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{doc.name.charAt(4)?.toUpperCase() || "D"}</div>
                                    <div><div style={{ fontWeight: 700, fontSize: ".875rem" }}>{doc.name}</div><span className="pill">{doc.spec}</span></div>
                                </div>
                                {[[t("book.qual"), doc.qual], [t("book.exp"), `${doc.exp} ${t("book.years")}`], [t("book.rating"), `⭐ ${doc.rat}/5`]].map(([l, v]) => (
                                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: ".42rem 0", borderBottom: "1px dashed var(--g2)", fontSize: ".82rem" }}><span style={{ color: "var(--g5)" }}>{l}</span><strong style={{ textAlign: "right", maxWidth: "60%" }}>{v}</strong></div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: ".5rem 0", fontSize: ".9rem" }}><span style={{ color: "var(--g5)" }}>{t("book.fee")}</span><strong style={{ color: "var(--pm)", fontSize: "1rem" }}>{formatPrice(doc.fee)}</strong></div>
                            </div>

                            {/* Visit details + Pay */}
                            <div className="card" style={{ padding: "1.3rem" }}>
                                <h3 style={{ fontSize: ".95rem", marginBottom: "1rem" }}>{t("book.visit_details")}</h3>
                                <div style={{ marginBottom: ".875rem" }}>
                                    <label className="lbl">{t("book.reason")}</label>
                                    <textarea className="inp" value={rsn} onChange={e => { sr(e.target.value); if (fieldErrors.reason) setFieldErrors({}); }} rows={3} required placeholder={t("book.reason_placeholder")} style={{ resize: "vertical", ...(fieldErrors.reason ? { borderColor: "#ef4444" } : {}) }} />
                                    {fieldErrors.reason && <div style={{ color: "#ef4444", fontSize: ".72rem", marginTop: ".2rem" }}>{fieldErrors.reason}</div>}
                                </div>
                                <div style={{ marginBottom: "1.1rem" }}><label className="lbl">{t("book.symptoms")}</label><input className="inp" value={sym} onChange={e => sy(e.target.value)} placeholder={t("book.symptoms_placeholder")} /></div>
                                <div style={{ background: "var(--bg2)", borderRadius: 8, padding: ".9rem", marginBottom: "1.1rem" }}>
                                    <div style={{ fontSize: ".72rem", textTransform: "uppercase", color: "var(--g5)", fontWeight: 700, letterSpacing: ".5px", marginBottom: ".55rem" }}>{t("book.summary")}</div>
                                    {[[t("book.doctor"), doc.name], [t("book.date"), fshort(dt)], [t("book.time"), to12h(slot)], [t("book.fee"), formatPrice(doc.fee)]].map(([l, v]) => (
                                        <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: ".35rem 0", borderBottom: "1px dashed var(--g2)", fontSize: ".85rem" }}><span style={{ color: "var(--g5)" }}>{l}</span><strong>{v}</strong></div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: ".75rem", alignItems: "stretch" }}>
                                    <button className="btn bP" style={{ flex: 1, padding: ".8rem" }} onClick={handlePayNow} disabled={ld || !rsn.trim() || !user}>
                                        {!user ? t("book.login_btn") : ld ? t("book.booking") : `${t("book.pay_now")} ${formatPrice(doc.fee)}`}
                                    </button>
                                    <div style={{ display: "flex", alignItems: "center", color: "var(--g4)", fontSize: ".75rem", fontWeight: 600 }}>{t("book.or")}</div>
                                    <button style={{ flex: 1, padding: ".8rem", border: "2px solid #f59e0b", borderRadius: 10, background: "#fffbeb", color: "#92400e", fontWeight: 700, fontSize: ".875rem", cursor: "pointer", fontFamily: "inherit", transition: "all var(--tr)" }} onClick={handlePayLater} disabled={ld || !rsn.trim() || !user}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#fef3c7"; e.currentTarget.style.borderColor = "#d97706"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "#fffbeb"; e.currentTarget.style.borderColor = "#f59e0b"; }}>
                                        {ld ? t("book.booking") : t("book.pay_later")}
                                    </button>
                                </div>
                                <p style={{ fontSize: ".72rem", color: "var(--g5)", textAlign: "center", marginTop: ".5rem", marginBottom: 0 }}>{t("book.pay_later_info")}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showPayment && doc && (
                <Payment
                    amount={getConvertedAmount(doc.fee)}
                    currency={getCurrency()}
                    doctorName={doc.name}
                    date={fshort(dt)}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setShowPayment(false)}
                />
            )}
        </div>
    );
}
