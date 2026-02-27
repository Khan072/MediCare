import { useState } from "react";
import { forgotPassword, resetPassword } from "../api";

function AuthShell({ left, right }) {
    return (
        <div className="auth-shell" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 64px)" }}>
            <div className="auth-left" style={{ background: "linear-gradient(135deg,var(--pd),var(--pm))", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -90, right: -90, width: 220, height: 220, background: "rgba(255,255,255,.06)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: -60, left: -60, width: 160, height: 160, background: "rgba(255,255,255,.04)", borderRadius: "50%" }} />
                <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 330 }}>{left}</div>
            </div>
            <div className="auth-right" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", background: "#fff", overflowY: "auto" }}>{right}</div>
        </div>
    );
}

const steps = [
    { icon: "📧", title: "Enter Email", desc: "We'll send a 6-digit OTP to your registered email" },
    { icon: "🔑", title: "Verify OTP", desc: "Enter the OTP code sent to your email" },
    { icon: "🔒", title: "New Password", desc: "Set a new secure password for your account" },
];

export default function ForgotPassword({ go }) {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [pw, setPw] = useState("");
    const [cpw, setCpw] = useState("");
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [ld, setLd] = useState(false);

    const sendOtp = async (e) => {
        e.preventDefault();
        setErr(""); setMsg(""); setLd(true);
        try {
            const res = await forgotPassword({ email });
            setMsg(res.data.message);
            setStep(1);
        } catch (error) {
            setErr(error.response?.data?.message || "Failed to send OTP.");
        } finally {
            setLd(false);
        }
    };

    const verifyOtp = (e) => {
        e.preventDefault();
        setErr("");
        if (otp.length !== 6) { setErr("Please enter a valid 6-digit OTP."); return; }
        setStep(2);
    };

    const doReset = async (e) => {
        e.preventDefault();
        setErr(""); setMsg(""); setLd(true);
        if (pw.length < 6) { setErr("Password must be at least 6 characters."); setLd(false); return; }
        if (pw !== cpw) { setErr("Passwords do not match."); setLd(false); return; }
        try {
            const res = await resetPassword({ email, otp, newPassword: pw });
            setMsg(res.data.message);
            setTimeout(() => go("login"), 2000);
        } catch (error) {
            setErr(error.response?.data?.message || "Failed to reset password.");
        } finally {
            setLd(false);
        }
    };

    return (
        <AuthShell
            left={
                <>
                    <div style={{ width: 64, height: 64, background: "rgba(255,255,255,.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.4rem", fontSize: "1.75rem" }}>🔐</div>
                    <h2 style={{ color: "#fff", fontSize: "1.55rem", marginBottom: ".6rem" }}>Reset Password</h2>
                    <p style={{ color: "rgba(255,255,255,.8)", lineHeight: 1.7, marginBottom: "1.4rem" }}>Don't worry! It happens. We'll help you reset your password securely.</p>

                    {/* Step indicator */}
                    <div style={{ display: "flex", gap: ".5rem", justifyContent: "center", marginBottom: "1rem" }}>
                        {steps.map((s, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    background: i <= step ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: ".7rem", color: "#fff", fontWeight: 700,
                                    border: i === step ? "2px solid #fff" : "2px solid transparent",
                                    transition: "all 300ms ease",
                                }}>{i + 1}</div>
                                {i < 2 && <div style={{ width: 20, height: 2, background: i < step ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.1)" }} />}
                            </div>
                        ))}
                    </div>
                    <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 8, padding: ".55rem .9rem", color: "#fff", fontSize: ".82rem", fontWeight: 500, textAlign: "center" }}>
                        {steps[step].icon} {steps[step].title}
                    </div>
                </>
            }
            right={
                <div style={{ width: "100%", maxWidth: 390 }}>
                    <button onClick={() => go("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--g5)", fontSize: ".82rem", marginBottom: "1.4rem", padding: 0, fontFamily: "inherit" }}>← Back to Login</button>
                    <h1 style={{ fontSize: "1.55rem", marginBottom: ".35rem" }}>Forgot Password</h1>
                    <p style={{ color: "var(--g5)", marginBottom: "1.4rem", fontSize: ".875rem" }}>{steps[step].desc}</p>

                    {err && <div className="ae aE" style={{ marginBottom: "1rem" }}>{err}</div>}
                    {msg && <div className="ae aS" style={{ marginBottom: "1rem" }}>{msg}</div>}

                    {/* Step 1: Email */}
                    {step === 0 && (
                        <form onSubmit={sendOtp}>
                            <div style={{ marginBottom: "1.2rem" }}>
                                <label className="lbl">Email Address</label>
                                <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your registered email" />
                            </div>
                            <button className="btn bP" type="submit" disabled={ld} style={{ width: "100%", padding: ".78rem" }}>
                                {ld ? "Sending OTP..." : "Send OTP"}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP */}
                    {step === 1 && (
                        <form onSubmit={verifyOtp}>
                            <div style={{ marginBottom: ".5rem" }}>
                                <label className="lbl">Enter 6-Digit OTP</label>
                                <input
                                    className="inp"
                                    type="text"
                                    value={otp}
                                    onChange={e => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 6) setOtp(v); }}
                                    required
                                    placeholder="● ● ● ● ● ●"
                                    style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: "8px", fontWeight: 700 }}
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                            <p style={{ fontSize: ".78rem", color: "var(--g5)", marginBottom: "1.2rem", textAlign: "center" }}>
                                Check your inbox for the OTP.{" "}
                                <button type="button" onClick={sendOtp} disabled={ld} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 700, fontFamily: "inherit", fontSize: "inherit" }}>
                                    Resend OTP
                                </button>
                            </p>
                            <button className="btn bP" type="submit" style={{ width: "100%", padding: ".78rem" }}>
                                Verify OTP
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 2 && (
                        <form onSubmit={doReset}>
                            <div style={{ marginBottom: ".875rem" }}>
                                <label className="lbl">New Password</label>
                                <input className="inp" type="password" value={pw} onChange={e => setPw(e.target.value)} required placeholder="Minimum 6 characters" minLength={6} />
                            </div>
                            <div style={{ marginBottom: "1.4rem" }}>
                                <label className="lbl">Confirm Password</label>
                                <input className="inp" type="password" value={cpw} onChange={e => setCpw(e.target.value)} required placeholder="Re-enter your password" minLength={6} />
                            </div>
                            <button className="btn bP" type="submit" disabled={ld} style={{ width: "100%", padding: ".78rem" }}>
                                {ld ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    <p style={{ textAlign: "center", marginTop: "1.2rem", color: "var(--g5)", fontSize: ".875rem" }}>
                        Remember your password?{" "}
                        <button onClick={() => go("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 700, fontFamily: "inherit", fontSize: "inherit" }}>Login</button>
                    </p>
                </div>
            }
        />
    );
}
