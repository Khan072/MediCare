import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { t } from "../i18n";

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
    const [f, sf] = useState({ name: "", email: "", pw: "", pw2: "", phone: "", dob: "", gender: "", blood: "", idNumber: "" });
    const [err, se] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [ld, sl] = useState(false);

    // Phone OTP state
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpMsg, setOtpMsg] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const confirmationResultRef = useRef(null);
    const recaptchaVerifierRef = useRef(null);
    const recaptchaWidgetIdRef = useRef(null);

    // Cleanup reCAPTCHA on unmount
    useEffect(() => {
        return () => {
            if (recaptchaVerifierRef.current) {
                try { recaptchaVerifierRef.current.clear(); } catch (_) {}
                recaptchaVerifierRef.current = null;
            }
        };
    }, []);

    // Resend countdown timer
    useEffect(() => {
        if (resendTimer <= 0) return;
        const id = setTimeout(() => setResendTimer(t => t - 1), 1000);
        return () => clearTimeout(id);
    }, [resendTimer]);

    const validateFieldBlur = (name, value) => {
        const errors = { ...fieldErrors };
        switch (name) {
            case "name":
                if (!value.trim()) errors.name = t("val.name_required");
                else delete errors.name;
                break;
            case "email":
                if (!value.includes("@") || !value.includes(".")) errors.email = t("val.email_invalid");
                else delete errors.email;
                break;
            case "pw":
                if (value.length < 6) errors.pw = t("val.password_min");
                else delete errors.pw;
                break;
            case "pw2":
                if (value !== f.pw) errors.pw2 = t("val.password_match");
                else delete errors.pw2;
                break;
            case "phone":
                if (!/^\d{10}$/.test(value)) errors.phone = t("val.phone_invalid");
                else delete errors.phone;
                break;
        }
        setFieldErrors(errors);
    };

    const next = (e) => {
        e.preventDefault(); se("");
        const errors = {};
        if (!f.name.trim()) errors.name = t("val.name_required");
        if (!f.email.includes("@") || !f.email.includes(".")) errors.email = t("val.email_invalid");
        if (f.pw.length < 6) errors.pw = t("val.password_min");
        if (f.pw !== f.pw2) errors.pw2 = t("val.password_match");
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});
        ss(2);
    };

    const clearRecaptcha = () => {
        if (recaptchaVerifierRef.current) {
            try { recaptchaVerifierRef.current.clear(); } catch (_) {}
            recaptchaVerifierRef.current = null;
        }
        // Also clear any leftover reCAPTCHA DOM elements
        const container = document.getElementById("recaptcha-container");
        if (container) container.innerHTML = "";
    };

    const setupRecaptcha = () => {
        // Always clear old one first if it exists
        clearRecaptcha();
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
            callback: () => {},
            "expired-callback": () => {
                clearRecaptcha();
            },
        });
    };

    const getFirebaseErrorMessage = (err) => {
        const code = err.code || "";
        switch (code) {
            case "auth/too-many-requests":
                return "⏳ Too many attempts. Please wait a few minutes and try again.";
            case "auth/invalid-phone-number":
                return "❌ Invalid phone number. Please check and try again.";
            case "auth/quota-exceeded":
                return "📱 SMS quota exceeded. Please try again later.";
            case "auth/captcha-check-failed":
                return "🔒 reCAPTCHA verification failed. Please refresh the page and try again.";
            case "auth/missing-phone-number":
                return "📞 Please enter a valid phone number.";
            case "auth/user-disabled":
                return "🚫 This phone number has been disabled. Contact support.";
            case "auth/operation-not-allowed":
                return "⚙️ Phone authentication is not enabled. Please contact the administrator.";
            case "auth/invalid-app-credential":
                return "🔧 App configuration error. Please refresh the page and try again.";
            case "auth/network-request-failed":
                return "🌐 Network error. Please check your internet connection and try again.";
            default:
                return err.message || "Failed to send OTP. Please try again.";
        }
    };

    const handleSendOtp = async () => {
        if (!/^\d{10}$/.test(f.phone)) {
            setFieldErrors(p => ({ ...p, phone: t("val.phone_invalid") }));
            return;
        }
        setOtpLoading(true); setOtpMsg("");
        try {
            setupRecaptcha();
            const phoneNumber = "+91" + f.phone;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
            confirmationResultRef.current = confirmation;
            setOtpSent(true);
            setOtpMsg("✅ OTP sent to +91" + f.phone + ". Check your SMS!");
            setResendTimer(60); // 60-second cooldown
        } catch (err) {
            console.error("Firebase Phone OTP Error:", err);
            clearRecaptcha();
            setOtpMsg(getFirebaseErrorMessage(err));
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) return;
        setOtpLoading(true); setOtpMsg("");
        try {
            await confirmationResultRef.current.confirm(otp);
            setPhoneVerified(true);
            setOtpMsg("✅ " + t("signup.phone_verified"));
            // Sign out from Firebase auth since we only use it for phone verification,
            // not for session management (our backend handles that)
            await auth.signOut();
        } catch (err) {
            console.error("OTP verification error:", err);
            if (err.code === "auth/invalid-verification-code") {
                setOtpMsg("❌ Invalid OTP. Please check the code and try again.");
            } else if (err.code === "auth/code-expired") {
                setOtpMsg("⏰ OTP has expired. Please request a new one.");
                setOtpSent(false);
                setOtp("");
            } else {
                setOtpMsg("❌ " + (err.message || "Verification failed. Please try again."));
            }
        } finally {
            setOtpLoading(false);
        }
    };

    const sub = async (e) => {
        e.preventDefault(); se("");
        const errors = {};
        if (!/^\d{10}$/.test(f.phone)) errors.phone = t("val.phone_invalid");
        if (!f.dob) errors.dob = t("val.dob_required");
        if (!f.gender) errors.gender = t("val.gender_required");
        if (!phoneVerified) errors.phone = "Please verify your phone number first";
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});
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
                idNumber: f.idNumber || undefined,
                phoneVerified: true,
            });
            go("dash");
        } catch (error) {
            se(error.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            sl(false);
        }
    };

    const fieldStyle = (name) => fieldErrors[name] ? { borderColor: "#ef4444" } : {};
    const errEl = (name) => fieldErrors[name] ? <div style={{ color: "#ef4444", fontSize: ".72rem", marginTop: ".2rem" }}>{fieldErrors[name]}</div> : null;

    return (
        <AuthShell
            left={
                <>
                    <div style={{ width: 64, height: 64, background: "rgba(255,255,255,.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.4rem", fontSize: "1.75rem" }}>🏥</div>
                    <h2 style={{ color: "#fff", fontSize: "1.55rem", marginBottom: ".6rem" }}>{t("signup.join")}</h2>
                    <p style={{ color: "rgba(255,255,255,.8)", lineHeight: 1.7, marginBottom: "1.4rem" }}>{t("signup.subtitle_free")}</p>
                    {[t("signup.access"), t("signup.records"), t("signup.secure")].map(x => <div key={x} style={{ background: "rgba(255,255,255,.12)", borderRadius: 8, padding: ".55rem .9rem", color: "#fff", fontSize: ".82rem", fontWeight: 500, textAlign: "left", marginBottom: ".4rem" }}>{x}</div>)}
                </>
            }
            right={
                <div style={{ width: "100%", maxWidth: 420 }}>
                    <button onClick={() => go("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--g5)", fontSize: ".82rem", marginBottom: "1.4rem", padding: 0, fontFamily: "inherit" }}>{t("signup.back")}</button>
                    <h1 style={{ fontSize: "1.55rem", marginBottom: ".35rem" }}>{t("signup.title")}</h1>
                    <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".35rem" }}>
                        {[1, 2].map(s => (
                            <span key={s} style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                                <span style={{ width: 25, height: 25, borderRadius: "50%", border: `2px solid ${step >= s ? "var(--pm)" : "var(--g3)"}`, background: step >= s ? "var(--pm)" : "transparent", color: step >= s ? "#fff" : "var(--g4)", fontSize: ".7rem", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s}</span>
                                {s === 1 && <span style={{ width: 35, height: 2, background: step >= 2 ? "var(--pm)" : "var(--g3)", borderRadius: 2, display: "inline-block" }} />}
                            </span>
                        ))}
                    </div>
                    <p style={{ color: "var(--g5)", marginBottom: "1.2rem", fontSize: ".82rem" }}>{step === 1 ? t("signup.step1") : t("signup.step2")}</p>
                    {err && <div className="ae aE" style={{ marginBottom: ".875rem" }}>{err}</div>}
                    {step === 1 ? (
                        <form onSubmit={next}>
                            <div style={{ marginBottom: ".875rem" }}><label className="lbl">{t("signup.name")}</label><input className="inp" value={f.name} onChange={e => sf({ ...f, name: e.target.value })} onBlur={e => validateFieldBlur("name", e.target.value)} required placeholder={t("signup.name_placeholder")} style={fieldStyle("name")} />{errEl("name")}</div>
                            <div style={{ marginBottom: ".875rem" }}><label className="lbl">{t("signup.email")}</label><input className="inp" type="email" value={f.email} onChange={e => sf({ ...f, email: e.target.value })} onBlur={e => validateFieldBlur("email", e.target.value)} required placeholder={t("signup.email_placeholder")} style={fieldStyle("email")} />{errEl("email")}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem", marginBottom: "1.4rem" }}>
                                <div><label className="lbl">{t("signup.password")}</label><input className="inp" type="password" value={f.pw} onChange={e => sf({ ...f, pw: e.target.value })} onBlur={e => validateFieldBlur("pw", e.target.value)} required placeholder={t("signup.password_min")} minLength={6} style={fieldStyle("pw")} />{errEl("pw")}
                                    {f.pw && <div style={{ marginTop: ".3rem" }}><div style={{ height: 4, borderRadius: 2, background: "#e5e7eb", overflow: "hidden" }}><div style={{ height: "100%", width: f.pw.length >= 10 ? "100%" : f.pw.length >= 6 ? "60%" : "30%", background: f.pw.length >= 10 ? "#22c55e" : f.pw.length >= 6 ? "#f59e0b" : "#ef4444", transition: "all .3s" }} /></div><div style={{ fontSize: ".68rem", marginTop: ".15rem", color: f.pw.length >= 10 ? "#22c55e" : f.pw.length >= 6 ? "#f59e0b" : "#ef4444" }}>{f.pw.length >= 10 ? "Strong" : f.pw.length >= 6 ? "Medium" : "Weak"}</div></div>}
                                </div>
                                <div><label className="lbl">{t("signup.confirm")}</label><input className="inp" type="password" value={f.pw2} onChange={e => sf({ ...f, pw2: e.target.value })} onBlur={e => validateFieldBlur("pw2", e.target.value)} required placeholder={t("signup.confirm_placeholder")} style={fieldStyle("pw2")} />{errEl("pw2")}</div>
                            </div>
                            <button className="btn bP" type="submit" style={{ width: "100%", padding: ".78rem" }}>{t("signup.next")}</button>
                        </form>
                    ) : (
                        <form onSubmit={sub}>
                            <div id="recaptcha-container"></div>
                            {/* Phone + OTP verification */}
                            <div style={{ marginBottom: ".875rem" }}>
                                <label className="lbl">{t("signup.phone")} <span style={{ fontSize: ".7rem", color: "var(--g5)", fontWeight: 400 }}>(OTP will be sent via SMS)</span></label>
                                <div style={{ display: "flex", gap: ".5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                                        <span style={{ padding: ".6rem .5rem", background: "#f1f5f9", border: "2px solid var(--g3)", borderRight: "none", borderRadius: "var(--rm) 0 0 var(--rm)", fontSize: ".85rem", color: "var(--g6)", fontWeight: 600, whiteSpace: "nowrap" }}>+91</span>
                                        <input className="inp" type="tel" value={f.phone} onChange={e => { sf({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }); setPhoneVerified(false); setOtpSent(false); setOtp(""); setOtpMsg(""); confirmationResultRef.current = null; }} onBlur={e => validateFieldBlur("phone", e.target.value)} required placeholder={t("signup.phone_placeholder")} style={{ flex: 1, borderRadius: "0 var(--rm) var(--rm) 0", ...fieldStyle("phone") }} disabled={phoneVerified} />
                                    </div>
                                    {!phoneVerified && <button type="button" className="btn bP" onClick={handleSendOtp} disabled={otpLoading || !/^\d{10}$/.test(f.phone) || resendTimer > 0} style={{ padding: ".45rem .8rem", fontSize: ".78rem", whiteSpace: "nowrap" }}>
                                        {otpLoading && !otpSent ? t("signup.sending_otp") : resendTimer > 0 ? `Resend (${resendTimer}s)` : otpSent ? "Resend OTP" : t("signup.send_otp")}
                                    </button>}
                                </div>
                                {errEl("phone")}
                                {phoneVerified && <div style={{ color: "#22c55e", fontSize: ".78rem", marginTop: ".25rem", fontWeight: 600, display: "flex", alignItems: "center", gap: ".3rem" }}>✅ {t("signup.phone_verified")}</div>}
                                {otpMsg && !otpSent && !phoneVerified && <div style={{ fontSize: ".75rem", marginTop: ".3rem", color: "#dc2626" }}>{otpMsg}</div>}
                            </div>

                            {otpSent && !phoneVerified && (
                                <div style={{ marginBottom: ".875rem", background: "#f0fdf4", padding: ".75rem", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                                    <label className="lbl" style={{ color: "#15803d" }}>{t("signup.enter_otp")}</label>
                                    <div style={{ display: "flex", gap: ".5rem" }}>
                                        <input className="inp" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" style={{ flex: 1, letterSpacing: "4px", fontWeight: 700, textAlign: "center" }} maxLength={6} autoFocus />
                                        <button type="button" className="btn bP" onClick={handleVerifyOtp} disabled={otpLoading || otp.length !== 6} style={{ padding: ".45rem .8rem", fontSize: ".78rem" }}>{otpLoading ? t("signup.verifying") : t("signup.verify_otp")}</button>
                                    </div>
                                    {otpMsg && <div style={{ fontSize: ".75rem", marginTop: ".3rem", color: otpMsg.includes("✅") ? "#22c55e" : "#00796b" }}>{otpMsg}</div>}
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem", marginBottom: ".875rem" }}>
                                <div><label className="lbl">{t("signup.dob")}</label><input className="inp" type="date" value={f.dob} onChange={e => sf({ ...f, dob: e.target.value })} required max={today()} style={fieldStyle("dob")} />{errEl("dob")}</div>
                                <div><label className="lbl">{t("signup.id_number")}</label><input className="inp" value={f.idNumber} onChange={e => sf({ ...f, idNumber: e.target.value })} placeholder={t("signup.id_placeholder")} /></div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem", marginBottom: "1.4rem" }}>
                                <div><label className="lbl">{t("signup.gender")}</label>
                                    <select className="inp" value={f.gender} onChange={e => sf({ ...f, gender: e.target.value })} required style={fieldStyle("gender")}>
                                        <option value="">{t("signup.gender_select")}</option><option value="male">{t("signup.gender_male")}</option><option value="female">{t("signup.gender_female")}</option><option value="other">{t("signup.gender_other")}</option>
                                    </select>{errEl("gender")}
                                </div>
                                <div><label className="lbl">{t("signup.blood")}</label>
                                    <select className="inp" value={f.blood} onChange={e => sf({ ...f, blood: e.target.value })}>
                                        <option value="">{t("signup.blood_optional")}</option>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: ".625rem" }}>
                                <button type="button" className="btn bS" onClick={() => { ss(1); se(""); setFieldErrors({}); }}>{t("signup.back")}</button>
                                <button className="btn bP" type="submit" disabled={ld || !phoneVerified} style={{ padding: ".78rem" }}>{ld ? t("signup.creating") : t("signup.submit")}</button>
                            </div>
                            {!phoneVerified && <p style={{ fontSize: ".72rem", color: "#f59e0b", textAlign: "center", marginTop: ".5rem" }}>⚠️ Please verify your phone number to create your account</p>}
                        </form>
                    )}
                    <p style={{ textAlign: "center", marginTop: "1.2rem", color: "var(--g5)", fontSize: ".875rem" }}>{t("signup.have_account")} <button onClick={() => go("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 700, fontFamily: "inherit", fontSize: "inherit" }}>{t("signup.login_link")}</button></p>
                </div>
            }
        />
    );
}
