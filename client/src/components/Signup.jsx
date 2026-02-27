import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function AuthShell({ left, right }) {
    return (
        <div className="auth-shell" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 64px)" }}>
            <div className="auth-left" style={{ background: "linear-gradient(135deg,var(--pd),var(--pm))", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -90, right: -90, width: 220, height: 220, background: "rgba(255,255,255,.06)", borderRadius: "50%" }} />
                <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 330 }}>{left}</div>
            </div>
            <div className="auth-right" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", background: "#fff", overflowY: "auto" }}>{right}</div>
        </div>
    );
}

const today = () => new Date().toISOString().split("T")[0];

export default function Signup({ go }) {
    const { signup } = useAuth();
    const [step, ss] = useState(1);
    const [f, sf] = useState({ name: "", email: "", pw: "", pw2: "", phone: "", dob: "", gender: "", blood: "" });
    const [err, se] = useState("");
    const [ld, sl] = useState(false);

    const next = (e) => {
        e.preventDefault(); se("");
        if (!f.name.trim()) return se("Full name required.");
        if (!f.email.includes("@")) return se("Valid email required.");
        if (f.pw.length < 6) return se("Password must be 6+ characters.");
        if (f.pw !== f.pw2) return se("Passwords don't match.");
        ss(2);
    };

    const sub = async (e) => {
        e.preventDefault(); se("");
        if (!/^\d{10}$/.test(f.phone)) return se("Valid 10-digit phone required.");
        if (!f.dob) return se("Date of birth required.");
        if (!f.gender) return se("Please select gender.");
        sl(true);
        try {
            await signup({
                name: f.name,
                email: f.email,
                password: f.pw,
                phone: f.phone,
                dob: f.dob,
                gender: f.gender,
                blood: f.blood,
            });
            go("dash");
        } catch (error) {
            se(error.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            sl(false);
        }
    };

    return (
        <AuthShell
            left={
                <>
                    <div style={{ width: 64, height: 64, background: "rgba(255,255,255,.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.4rem", fontSize: "1.75rem" }}>🏥</div>
                    <h2 style={{ color: "#fff", fontSize: "1.55rem", marginBottom: ".6rem" }}>Join MediCare!</h2>
                    <p style={{ color: "rgba(255,255,255,.8)", lineHeight: 1.7, marginBottom: "1.4rem" }}>Free account · 500+ specialists · 24/7 AI support.</p>
                    {["🏥 Access Top Specialists", "📱 Digital Health Records", "🔒 Secure & Private"].map(x => <div key={x} style={{ background: "rgba(255,255,255,.12)", borderRadius: 8, padding: ".55rem .9rem", color: "#fff", fontSize: ".82rem", fontWeight: 500, textAlign: "left", marginBottom: ".4rem" }}>{x}</div>)}
                </>
            }
            right={
                <div style={{ width: "100%", maxWidth: 420 }}>
                    <button onClick={() => go("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--g5)", fontSize: ".82rem", marginBottom: "1.4rem", padding: 0, fontFamily: "inherit" }}>← Back</button>
                    <h1 style={{ fontSize: "1.55rem", marginBottom: ".35rem" }}>Create Account</h1>
                    <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".35rem" }}>
                        {[1, 2].map(s => (
                            <span key={s} style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                                <span style={{ width: 25, height: 25, borderRadius: "50%", border: `2px solid ${step >= s ? "var(--pm)" : "var(--g3)"}`, background: step >= s ? "var(--pm)" : "transparent", color: step >= s ? "#fff" : "var(--g4)", fontSize: ".7rem", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s}</span>
                                {s === 1 && <span style={{ width: 35, height: 2, background: step >= 2 ? "var(--pm)" : "var(--g3)", borderRadius: 2, display: "inline-block" }} />}
                            </span>
                        ))}
                    </div>
                    <p style={{ color: "var(--g5)", marginBottom: "1.2rem", fontSize: ".82rem" }}>{step === 1 ? "Step 1: Account credentials" : "Step 2: Personal information"}</p>
                    {err && <div className="ae aE" style={{ marginBottom: ".875rem" }}>{err}</div>}
                    {step === 1 ? (
                        <form onSubmit={next}>
                            <div style={{ marginBottom: ".875rem" }}><label className="lbl">Full Name</label><input className="inp" value={f.name} onChange={e => sf({ ...f, name: e.target.value })} required placeholder="John Doe" /></div>
                            <div style={{ marginBottom: ".875rem" }}><label className="lbl">Email</label><input className="inp" type="email" value={f.email} onChange={e => sf({ ...f, email: e.target.value })} required placeholder="john@example.com" /></div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem", marginBottom: "1.4rem" }}>
                                <div><label className="lbl">Password</label><input className="inp" type="password" value={f.pw} onChange={e => sf({ ...f, pw: e.target.value })} required placeholder="Min 6 chars" minLength={6} /></div>
                                <div><label className="lbl">Confirm</label><input className="inp" type="password" value={f.pw2} onChange={e => sf({ ...f, pw2: e.target.value })} required placeholder="Repeat" /></div>
                            </div>
                            <button className="btn bP" type="submit" style={{ width: "100%", padding: ".78rem" }}>Next Step →</button>
                        </form>
                    ) : (
                        <form onSubmit={sub}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem", marginBottom: ".875rem" }}>
                                <div><label className="lbl">Phone (10 digits)</label><input className="inp" type="tel" value={f.phone} onChange={e => sf({ ...f, phone: e.target.value })} required placeholder="9876543210" /></div>
                                <div><label className="lbl">Date of Birth</label><input className="inp" type="date" value={f.dob} onChange={e => sf({ ...f, dob: e.target.value })} required max={today()} /></div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem", marginBottom: "1.4rem" }}>
                                <div><label className="lbl">Gender</label>
                                    <select className="inp" value={f.gender} onChange={e => sf({ ...f, gender: e.target.value })} required>
                                        <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                                    </select>
                                </div>
                                <div><label className="lbl">Blood Group</label>
                                    <select className="inp" value={f.blood} onChange={e => sf({ ...f, blood: e.target.value })}>
                                        <option value="">Optional</option>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: ".625rem" }}>
                                <button type="button" className="btn bS" onClick={() => { ss(1); se(""); }}>← Back</button>
                                <button className="btn bP" type="submit" disabled={ld} style={{ padding: ".78rem" }}>{ld ? "Creating..." : "Create Account"}</button>
                            </div>
                        </form>
                    )}
                    <p style={{ textAlign: "center", marginTop: "1.2rem", color: "var(--g5)", fontSize: ".875rem" }}>Have account? <button onClick={() => go("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 700, fontFamily: "inherit", fontSize: "inherit" }}>Login</button></p>
                </div>
            }
        />
    );
}
