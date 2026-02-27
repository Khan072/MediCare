const fdate = (d) =>
    new Date(d + "T12:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
const fshort = (d) =>
    new Date(d + "T12:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

export default function Slip({ apt, onBack, onNew }) {
    const doc = apt.doctor || apt.doc;
    const num = apt.aptNumber || apt.num;
    const pname = apt.patientName || apt.pname;
    const pemail = apt.patientEmail || apt.pemail;
    const pphone = apt.patientPhone || apt.pphone;
    const rsn = apt.reason || apt.rsn;
    const sym = apt.symptoms || apt.sym || [];
    const dt = apt.date || apt.dt;
    const slot = apt.slot;
    const fee = apt.fee;

    const print = () => {
        const w = window.open("", "_blank");
        w.document.write(`<!DOCTYPE html><html><head><title>Appointment Slip</title>
    <style>body{font-family:sans-serif;padding:24px;max-width:680px;margin:0 auto}h1{color:#00796b}hr{border:none;border-top:1px solid #eee;margin:16px 0}.badge{background:#d1fae5;color:#065f46;padding:3px 12px;border-radius:99px;font-size:12px;font-weight:700}table{width:100%;border-collapse:collapse}td{padding:8px 4px;border-bottom:1px dashed #eee;font-size:14px}td:first-child{color:#9e9e9e;width:38%}.note{background:#fffbeb;border:1px solid #fde68a;padding:12px;border-radius:8px;font-size:13px;margin-top:16px}</style>
    </head><body>
    <h1>🏥 MediCare Hospital</h1><p style="color:#9e9e9e;margin-top:0">Advanced Healthcare · Compassionate Care</p><hr/>
    <h2>Appointment Slip &nbsp; <span class="badge">CONFIRMED</span></h2>
    <p style="color:#9e9e9e;font-size:14px">#${num}</p>
    <table>
      <tr><td>Patient Name</td><td><strong>${pname}</strong></td></tr>
      <tr><td>Doctor</td><td><strong>${doc.name}</strong></td></tr>
      <tr><td>Specialization</td><td>${doc.spec}</td></tr>
      <tr><td>Date</td><td>${fdate(dt)}</td></tr>
      <tr><td>Time</td><td>${slot}</td></tr>
      <tr><td>Reason</td><td>${rsn}</td></tr>
      ${sym.length ? `<tr><td>Symptoms</td><td>${sym.join(", ")}</td></tr>` : ""}
      <tr><td>Consultation Fee</td><td><strong>₹${fee}</strong></td></tr>
    </table>
    <div class="note">⏰ Arrive 15 min early &nbsp;|&nbsp; 🪪 Carry this slip + valid ID &nbsp;|&nbsp; 📁 Bring prior prescriptions</div>
    <p style="color:#9e9e9e;font-size:12px;margin-top:16px">Generated: ${new Date().toLocaleString()} · MediCare Hospital</p>
    </body></html>`);
        w.document.close();
        w.print();
    };

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", padding: "1.75rem 0 4rem" }}>
            <div className="C" style={{ maxWidth: 740 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.1rem" }}>
                    <button className="btn bS sm" onClick={onBack}>← Dashboard</button>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                        <button className="btn bO sm" onClick={print}>🖨️ Print / Save PDF</button>
                        {onNew && <button className="btn bP sm" onClick={onNew}>+ New Appointment</button>}
                    </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.12)", padding: "1.875rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                            <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,var(--pd),var(--pm))", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>🏥</div>
                            <div>
                                <div style={{ fontSize: "1.45rem", fontWeight: 800, background: "linear-gradient(135deg,var(--pd),var(--pm))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MediCare Hospital</div>
                                <div style={{ fontSize: ".7rem", color: "var(--g5)" }}>Advanced Healthcare · Compassionate Care</div>
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: ".3rem" }}>#{num}</div>
                            <span style={{ background: "#d1fae5", color: "#065f46", padding: ".22rem .75rem", borderRadius: 99, fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px" }}>CONFIRMED</span>
                        </div>
                    </div>
                    <div style={{ height: 3, background: "linear-gradient(90deg,var(--pd),var(--pl),var(--ac))", borderRadius: 2, marginBottom: "1.25rem" }} />
                    <div style={{ display: "flex", alignItems: "center", background: "linear-gradient(135deg,#e0f7f4,#f0fff4)", border: "1.5px solid var(--pli)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.25rem", gap: "1.4rem", flexWrap: "wrap" }}>
                        {[["📅", "Date", fdate(dt)], ["🕐", "Time", slot], ["💰", "Fee", `₹${fee}`]].map(([ic, l, v]) => (
                            <div key={l} style={{ display: "flex", alignItems: "center", gap: ".6rem", flex: 1 }}>
                                <span style={{ fontSize: "1.25rem" }}>{ic}</span>
                                <div><div style={{ fontSize: ".67rem", color: "var(--g5)", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 1 }}>{l}</div><div style={{ fontWeight: 700, fontSize: ".875rem" }}>{v}</div></div>
                            </div>
                        ))}
                    </div>
                    {/* Payment Status */}
                    {apt.payment && (
                        <div style={{ background: apt.payment.status === "succeeded" ? "#e8f5e9" : "#fff8e1", border: `1.5px solid ${apt.payment.status === "succeeded" ? "#a5d6a7" : "#ffe082"}`, borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                                <span style={{ fontSize: "1.25rem" }}>{apt.payment.status === "succeeded" ? "✅" : "⏳"}</span>
                                <div>
                                    <div style={{ fontSize: ".67rem", color: "var(--g5)", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 1 }}>Payment Status</div>
                                    <div style={{ fontWeight: 700, fontSize: ".875rem", color: apt.payment.status === "succeeded" ? "#2e7d32" : "#f57f17" }}>
                                        {apt.payment.status === "succeeded" ? "PAID" : apt.payment.status?.toUpperCase() || "PENDING"}
                                    </div>
                                </div>
                            </div>
                            {apt.payment.transactionId && (
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: ".67rem", color: "var(--g5)", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 1 }}>Transaction ID</div>
                                    <div style={{ fontWeight: 600, fontSize: ".75rem", color: "var(--g7)", fontFamily: "monospace" }}>{apt.payment.transactionId.slice(-12)}</div>
                                </div>
                            )}
                        </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        {[["🧑⚕️ Patient", [["Name", pname], ["Email", pemail], ["Phone", pphone]]], ["👨⚕️ Doctor", [["Name", doc.name], ["Specialization", doc.spec], ["Qualification", doc.qual]]]].map(([tit, rows]) => (
                            <div key={tit} style={{ border: "1.5px solid var(--g2)", borderRadius: 10, overflow: "hidden" }}>
                                <div style={{ background: "#fafafa", padding: ".6rem 1rem", borderBottom: "1px solid var(--g2)", fontWeight: 700, fontSize: ".875rem" }}>{tit}</div>
                                <div style={{ padding: ".6rem 1rem" }}>
                                    {rows.map(([l, v]) => (
                                        <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: ".33rem 0", borderBottom: "1px dashed var(--g2)", fontSize: ".82rem" }}>
                                            <span style={{ color: "var(--g5)" }}>{l}</span>
                                            <strong style={{ textAlign: "right", maxWidth: "55%", wordBreak: "break-word" }}>{v}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ border: "1.5px solid var(--g2)", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
                        <div style={{ fontSize: ".68rem", textTransform: "uppercase", color: "var(--g5)", fontWeight: 700, marginBottom: ".4rem" }}>Reason for Visit</div>
                        <p style={{ fontSize: ".875rem", margin: 0, lineHeight: 1.6 }}>{rsn}</p>
                        {sym.length > 0 && <div style={{ marginTop: ".6rem", display: "flex", flexWrap: "wrap", gap: ".3rem" }}>{sym.map(s => <span key={s} style={{ background: "var(--pli)", color: "var(--pd)", padding: ".14rem .5rem", borderRadius: 99, fontSize: ".7rem", fontWeight: 600 }}>{s}</span>)}</div>}
                    </div>
                    <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, padding: "1rem", marginBottom: "1.25rem" }}>
                        <div style={{ fontWeight: 700, color: "#92400e", marginBottom: ".5rem", fontSize: ".875rem" }}>📋 Important Instructions</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".4rem" }}>
                            {["⏰ Arrive 15 min before your appointment", "🪪 Carry this slip and a valid government ID", "📁 Bring previous prescriptions and reports", "❌ Cancel 24+ hours in advance if unable to attend"].map(x => <div key={x} style={{ fontSize: ".78rem", color: "var(--g7)", lineHeight: 1.5 }}>{x}</div>)}
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "1rem", borderTop: "2px solid var(--g2)" }}>
                        <div><p style={{ fontSize: ".76rem", color: "var(--g6)", margin: "0 0 .18rem" }}><strong>MediCare Hospital</strong></p><p style={{ fontSize: ".73rem", color: "var(--g5)", margin: 0 }}>123 Medical Center · 📞 +1 (555) 123-4567 · ✉️ care@medicare.com</p></div>
                        <p style={{ fontSize: ".68rem", color: "var(--g4)", margin: 0 }}>Generated: {new Date().toLocaleString("en-IN")}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
