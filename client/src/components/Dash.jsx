import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAppointments, updateAppointmentStatus, getMyReports, downloadReport } from "../api";
import Slip from "./Slip";

const fshort = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function Dash({ go }) {
    const { user } = useAuth();
    const [apts, setApts] = useState([]);
    const [flt, sflt] = useState("all");
    const [vw, svw] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashTab, setDashTab] = useState("appointments");
    const [reports, setReports] = useState([]);
    const [rptLoading, setRptLoading] = useState(false);

    const fetchApts = () => {
        setLoading(true);
        getAppointments()
            .then((res) => setApts(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchApts(); }, []);

    const fetchReports = () => {
        setRptLoading(true);
        getMyReports()
            .then((res) => setReports(res.data))
            .catch(() => { })
            .finally(() => setRptLoading(false));
    };

    useEffect(() => { if (dashTab === "reports") fetchReports(); }, [dashTab]);

    const handleDownload = async (r) => {
        try {
            const res = await downloadReport(r._id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = r.originalName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert("Download failed.");
        }
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const fmtSize = (b) => b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : (b / 1024).toFixed(0) + " KB";
    const rptStatus = (r) => {
        const now = new Date();
        const dl = new Date(r.deadline);
        const up = new Date(r.uploadedAt);
        const hrsUsed = Math.round((now - up) / 3600000);
        if (now <= dl) {
            const hrsLeft = Math.max(0, Math.round((dl - now) / 3600000));
            return { label: `✅ Delivered (${hrsLeft}h remaining)`, color: "#065f46", bg: "#d1fae5" };
        }
        return { label: `⚠️ Overdue`, color: "#991b1b", bg: "#fee2e2" };
    };

    const fa = flt === "all" ? apts : apts.filter(a => a.status === flt);
    const st = { tot: apts.length, c: apts.filter(a => a.status === "confirmed").length, d: apts.filter(a => a.status === "completed").length, x: apts.filter(a => a.status === "cancelled").length };

    const cancel = async (id) => {
        if (window.confirm("Cancel this appointment?")) {
            try {
                await updateAppointmentStatus(id, "cancelled");
                fetchApts();
            } catch (err) {
                alert(err.response?.data?.message || "Failed to cancel.");
            }
        }
    };

    if (vw) return <Slip apt={vw} onBack={() => svw(null)} />;
    if (loading) return <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" /></div>;

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", padding: "2.25rem 0 4rem" }}>
            <div className="C">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".875rem" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--ac))", color: "#fff", fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{user.name[0]}</div>
                        <div><h1 style={{ fontSize: "1.45rem", marginBottom: ".12rem" }}>Welcome, {user.name.split(" ")[0]}!</h1><p style={{ color: "var(--g5)", margin: 0, fontSize: ".85rem" }}>{user.email}</p></div>
                    </div>
                    <button className="btn bP" onClick={() => go("book")}>+ New Appointment</button>
                </div>

                {/* Tab Toggle */}
                <div style={{ display: "flex", gap: ".25rem", marginBottom: "1.75rem", borderBottom: "2px solid var(--g2)" }}>
                    {[["appointments", "📅 My Appointments"], ["reports", "📄 My Reports"]].map(([t, l]) => (
                        <button key={t} onClick={() => setDashTab(t)} style={{ padding: ".6rem 1.2rem", background: "none", border: "none", fontWeight: 600, fontSize: ".875rem", color: dashTab === t ? "var(--pm)" : "var(--g5)", cursor: "pointer", borderBottom: `3px solid ${dashTab === t ? "var(--pm)" : "transparent"}`, marginBottom: -2, fontFamily: "inherit" }}>{l}</button>
                    ))}
                </div>

                {dashTab === "reports" ? (
                    <div>
                        {rptLoading ? <div style={{ textAlign: "center", padding: "3rem" }}><div className="spin" /></div> : reports.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "5rem 2rem", color: "var(--g5)" }}>
                                <div style={{ fontSize: "3rem", marginBottom: ".875rem" }}>📄</div>
                                <h3 style={{ fontSize: "1.3rem", color: "var(--g7)", marginBottom: ".4rem" }}>No Reports Yet</h3>
                                <p style={{ fontSize: ".9rem" }}>Your medical reports will appear here once uploaded by the hospital.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: ".875rem" }}>
                                {reports.map(r => {
                                    const st = rptStatus(r);
                                    return (
                                        <div key={r._id} className="card" style={{ padding: 0, overflow: "hidden", borderLeft: `4px solid ${st.color}` }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.25rem", flexWrap: "wrap", gap: ".875rem" }}>
                                                <div style={{ display: "flex", gap: ".875rem", alignItems: "flex-start", flex: 1 }}>
                                                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#818cf8)", color: "#fff", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📄</div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, marginBottom: ".18rem", fontSize: ".9rem" }}>{r.title}</div>
                                                        <span className="pill">{r.doctorName || "Doctor"}</span>
                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem", marginTop: ".32rem", fontSize: ".76rem", color: "var(--g6)" }}>
                                                            <span>📅 {fmtDate(r.uploadedAt)}</span>
                                                            <span>📀 {fmtSize(r.fileSize)}</span>
                                                            <span>📁 {r.originalName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ".6rem" }}>
                                                    <span style={{ padding: ".24rem .7rem", borderRadius: 99, fontSize: ".7rem", fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                                                    <button className="btn bP sm" onClick={() => handleDownload(r)}>⬇️ Download</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <>

                        <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: ".875rem", marginBottom: "1.75rem" }}>
                            {[["📋", "Total", st.tot, "#3b82f6"], ["✅", "Confirmed", st.c, "#10b981"], ["🏁", "Completed", st.d, "#6366f1"], ["❌", "Cancelled", st.x, "#ef4444"]].map(([ic, l, v, c]) => (
                                <div key={l} className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${c}18`, fontSize: "1.15rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ic}</div>
                                    <div><div style={{ fontSize: "1.55rem", fontWeight: 800, lineHeight: 1 }}>{v}</div><div style={{ fontSize: ".7rem", color: "var(--g5)", fontWeight: 500 }}>{l}</div></div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: ".3rem", marginBottom: "1.4rem", borderBottom: "2px solid var(--g2)" }}>
                            {[["all", "All", st.tot], ["confirmed", "Confirmed", st.c], ["completed", "Completed", st.d], ["cancelled", "Cancelled", st.x]].map(([f, l, n]) => (
                                <button key={f} onClick={() => sflt(f)} style={{ padding: ".48rem 1rem", background: "none", border: "none", fontWeight: 600, fontSize: ".875rem", color: flt === f ? "var(--pm)" : "var(--g5)", cursor: "pointer", borderBottom: `3px solid ${flt === f ? "var(--pm)" : "transparent"}`, marginBottom: -2, fontFamily: "inherit" }}>
                                    {l} <span style={{ background: flt === f ? "var(--pli)" : "#f5f5f5", color: flt === f ? "var(--pd)" : "var(--g6)", borderRadius: 99, padding: ".08rem .42rem", fontSize: ".68rem", fontWeight: 700 }}>{n}</span>
                                </button>
                            ))}
                        </div>
                        {fa.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "5rem 2rem", color: "var(--g5)" }}>
                                <div style={{ fontSize: "3rem", marginBottom: ".875rem" }}>📅</div>
                                <h3 style={{ fontSize: "1.3rem", color: "var(--g7)", marginBottom: ".4rem" }}>{flt === "all" ? "No Appointments Yet" : `No ${flt} appointments`}</h3>
                                <p style={{ marginBottom: "1.4rem", fontSize: ".9rem" }}>{flt === "all" ? "Book your first appointment with an expert doctor." : "Try a different filter."}</p>
                                {flt === "all" && <button className="btn bP" onClick={() => go("book")}>Book Appointment</button>}
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: ".875rem" }}>
                                {fa.map(apt => {
                                    const doc = apt.doctor || apt.doc;
                                    const num = apt.aptNumber || apt.num;
                                    const isc = apt.status === "confirmed"; const isx = apt.status === "cancelled";
                                    const col = isc ? "var(--ok)" : isx ? "var(--err)" : "var(--info)";
                                    return (
                                        <div key={apt._id || apt.id} className="card" style={{ padding: 0, overflow: "hidden", borderLeft: `4px solid ${col}` }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.25rem", flexWrap: "wrap", gap: ".875rem" }}>
                                                <div style={{ display: "flex", gap: ".875rem", alignItems: "flex-start", flex: 1 }}>
                                                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{doc.name.charAt(4)?.toUpperCase() || "D"}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, marginBottom: ".18rem", fontSize: ".9rem" }}>{doc.name}</div>
                                                        <span className="pill">{doc.spec}</span>
                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem", marginTop: ".32rem", fontSize: ".76rem", color: "var(--g6)" }}><span>📅 {fshort(apt.date || apt.dt)}</span><span>🕐 {apt.slot}</span><span>🔖 #{num}</span></div>
                                                        <p style={{ fontSize: ".8rem", color: "var(--g6)", margin: ".28rem 0 0", lineHeight: 1.4 }}>{apt.reason || apt.rsn}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ".6rem" }}>
                                                    <span style={{ padding: ".24rem .7rem", borderRadius: 99, fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".3px", ...(isc ? { background: "#d1fae5", color: "#065f46" } : isx ? { background: "#fee2e2", color: "#991b1b" } : { background: "#dbeafe", color: "#1e40af" }) }}>{isc ? "✅ Confirmed" : isx ? "❌ Cancelled" : "🏁 Completed"}</span>
                                                    <div style={{ fontWeight: 700, color: "var(--pm)", fontSize: ".9rem", display: "flex", alignItems: "center", gap: ".4rem" }}>
                                                        ₹{apt.fee}
                                                        {apt.payment?.method === "pay_later" && apt.payment?.status !== "succeeded" && (
                                                            <span style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", padding: ".12rem .45rem", borderRadius: 99, fontSize: ".6rem", fontWeight: 700 }}>💰 Pay Later</span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", gap: ".4rem" }}>
                                                        <button className="btn bP sm" onClick={() => svw(apt)}>View Slip</button>
                                                        {isc && <button onClick={() => cancel(apt._id || apt.id)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", fontWeight: 600, padding: ".35rem .7rem", borderRadius: 6, cursor: "pointer", fontSize: ".78rem", fontFamily: "inherit" }}>Cancel</button>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
