import { useState } from "react";
import { useAuth } from "../context/AuthContext";
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

export default function Login({ go }) {
    const { login } = useAuth();
    const [f, sf] = useState({ identifier: "", pw: "" });
    const [err, se] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [ld, sl] = useState(false);

    const validateField = (name, value) => {
        const errors = { ...fieldErrors };
        if (name === "identifier") {
            if (!value.trim()) {
                errors.identifier = t("login.error_credentials");
            } else {
                delete errors.identifier;
            }
        }
        if (name === "pw") {
            if (value.length < 6) {
                errors.pw = t("val.password_min");
            } else {
                delete errors.pw;
            }
        }
        setFieldErrors(errors);
    };

    const sub = async (e) => {
        e.preventDefault();
        se("");
        // Validate
        const errors = {};
        if (!f.identifier.trim()) errors.identifier = t("login.error_credentials");
        if (f.pw.length < 6) errors.pw = t("val.password_min");
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});
        sl(true);
        try {
            await login(f.identifier, f.pw);
            go("dash");
        } catch (error) {
            se(error.response?.data?.message || t("login.error_credentials"));
        } finally {
            sl(false);
        }
    };

    return (
        <AuthShell
            left={
                <>
                    <div style={{ width: 64, height: 64, background: "rgba(255,255,255,.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.4rem", fontSize: "1.75rem" }}>🏥</div>
                    <h2 style={{ color: "#fff", fontSize: "1.55rem", marginBottom: ".6rem" }}>{t("login.welcome")}</h2>
                    <p style={{ color: "rgba(255,255,255,.8)", lineHeight: 1.7, marginBottom: "1.4rem" }}>{t("login.manage")}</p>
                    {[t("login.secure"), t("login.manage_apt"), t("login.ai")].map(x => <div key={x} style={{ background: "rgba(255,255,255,.12)", borderRadius: 8, padding: ".55rem .9rem", color: "#fff", fontSize: ".82rem", fontWeight: 500, textAlign: "left", marginBottom: ".4rem" }}>{x}</div>)}
                </>
            }
            right={
                <div style={{ width: "100%", maxWidth: 390 }}>
                    <button onClick={() => go("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--g5)", fontSize: ".82rem", marginBottom: "1.4rem", padding: 0, fontFamily: "inherit" }}>{t("login.back")}</button>
                    <h1 style={{ fontSize: "1.55rem", marginBottom: ".35rem" }}>{t("login.title")}</h1>
                    <p style={{ color: "var(--g5)", marginBottom: "1.4rem", fontSize: ".875rem" }}>{t("login.subtitle")}</p>
                    {err && <div className="ae aE" style={{ marginBottom: "1rem" }}>{err}</div>}
                    <form onSubmit={sub}>
                        <div style={{ marginBottom: ".875rem" }}>
                            <label className="lbl">{t("login.identifier")}</label>
                            <input className="inp" type="text" value={f.identifier} onChange={e => sf({ ...f, identifier: e.target.value })} onBlur={e => validateField("identifier", e.target.value)} required placeholder={t("login.identifier_placeholder")} style={fieldErrors.identifier ? { borderColor: "#ef4444" } : {}} />
                            {fieldErrors.identifier && <div style={{ color: "#ef4444", fontSize: ".75rem", marginTop: ".25rem" }}>{fieldErrors.identifier}</div>}
                        </div>
                        <div style={{ marginBottom: "1.4rem" }}>
                            <label className="lbl">{t("login.password")}</label>
                            <input className="inp" type="password" value={f.pw} onChange={e => sf({ ...f, pw: e.target.value })} onBlur={e => validateField("pw", e.target.value)} required placeholder={t("login.password_placeholder")} style={fieldErrors.pw ? { borderColor: "#ef4444" } : {}} />
                            {fieldErrors.pw && <div style={{ color: "#ef4444", fontSize: ".75rem", marginTop: ".25rem" }}>{fieldErrors.pw}</div>}
                        </div>
                        <div style={{ textAlign: "right", marginBottom: "1rem", marginTop: "-.8rem" }}><button type="button" onClick={() => go("forgot-password")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 600, fontFamily: "inherit", fontSize: ".8rem" }}>{t("login.forgot")}</button></div>
                        <button className="btn bP" type="submit" disabled={ld} style={{ width: "100%", padding: ".78rem" }}>{ld ? t("login.logging_in") : t("login.submit")}</button>
                    </form>
                    <p style={{ textAlign: "center", marginTop: "1.2rem", color: "var(--g5)", fontSize: ".875rem" }}>{t("login.no_account")} <button onClick={() => go("signup")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pm)", fontWeight: 700, fontFamily: "inherit", fontSize: "inherit" }}>{t("login.signup_link")}</button></p>
                    <div style={{ marginTop: "1rem", padding: ".75rem", background: "var(--bg2)", borderRadius: 8, fontSize: ".78rem", color: "var(--g6)" }}><strong>{t("login.demo")}</strong> admin@medicare.com / admin123</div>
                </div>
            }
        />
    );
}
