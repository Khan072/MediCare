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

export default function Login({ go }) {
    const { login } = useAuth();
    const [f, sf] = useState({ email: "", pw: "" });
    const [err, se] = useState("");
    const [ld, sl] = useState(false);

    const sub = async (e) => {
        e.preventDefault();
        se("");
        sl(true);
        try {
            await login(f.email, f.pw);
            go("dash");
        } catch (error) {
            se(error.response?.data?.message || "Invalid email or password.");
        } finally {
            sl(false);
        }
    };

    return (
        <AuthShell
            left={
                <>
                    <div style={{ width: 64, height: 64, background: "rgba(255,255,255,.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.4rem", fontSize: "1.75rem" }}>🏥</div>
                    <h2 style={{ color: "#fff", fontSize: "1.55rem", marginBottom: ".6rem" }}>Welcome Back!</h2>
                    <p style={{ color: "rgba(255,255,255,.8)", lineHeight: 1.7, marginBottom: "1.4rem" }}>Manage appointments and get 24/7 AI health support.</p>
                    {["✅ Secure Health Records", "📅 Manage Appointments", "🤖 24/7 AI Assistant"].map(x => <div key={x} style={{ background: "rgba(255,255,255,.12)", borderRadius: 8, padding: ".55rem .9rem", color: "#fff", fontSize: ".82rem", fontWeight: 500, textAlign: "left", marginBottom: ".4rem" }}>{x}</div>)}
                </>
            }
            right={
                <div style={{ width: "100%", maxWidth: 390 }}>
                    <button onClick={() => go("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--g5)", fontSize: ".82rem", marginBottom: "1.4rem", padding: 0, fontFamily: "inherit" }}>← Back to Home</button>
                    <h1 style={{ fontSize: "1.55rem", marginBottom: ".35rem" }}>Login</h1>
                    <p style={{ color: "var(--g5)", marginBottom: "1.4rem", fontSize: ".875rem" }}>Enter your credentials to continue</p>
                    {err && <div className="ae aE" style={{ marginBottom: "1rem" }}>{err}</div>}
                    <form onSubmit={sub}>
                        <div style={{ marginBottom: ".875rem" }}><label className="lbl">Email</label><input className="inp" type="email" value={f.email} onChange={e => sf({ ...f, email: e.target.value })} required placeholder="you@example.com" /></div>
                        <div style={{ marginBottom: "1.4rem" }}><label className="lbl">Password</label><input className="inp" type="password" value={f.pw} onChange={e => sf({ ...f, pw: e.target.value })} required placeholder="Your password" /></div>
                        <div style={{ textAlign: "right", marginBottom: "1rem", marginTop: "-.8rem" }}><button type="button" onClick={() => go("forgot-password")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 600, fontFamily: "inherit", fontSize: ".8rem" }}>Forgot Password?</button></div>
                        <button className="btn bP" type="submit" disabled={ld} style={{ width: "100%", padding: ".78rem" }}>{ld ? "Logging in..." : "Login"}</button>
                    </form>
                    <p style={{ textAlign: "center", marginTop: "1.2rem", color: "var(--g5)", fontSize: ".875rem" }}>No account? <button onClick={() => go("signup")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 700, fontFamily: "inherit", fontSize: "inherit" }}>Sign Up</button></p>
                    <div style={{ marginTop: "1rem", padding: ".75rem", background: "var(--bg2)", borderRadius: 8, fontSize: ".78rem", color: "var(--g6)" }}><strong>Demo Admin:</strong> admin@medicare.com / admin123</div>
                </div>
            }
        />
    );
}
