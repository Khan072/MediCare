import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile, getAppointments } from "../api";

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [ed, sed] = useState(false);
    const [f, sf] = useState({ name: user.name, phone: user.phone || "", gender: user.gender || "", blood: user.blood || "" });
    const [msg, sm] = useState("");
    const [aptCount, setAptCount] = useState({ total: 0, confirmed: 0 });

    useEffect(() => {
        getAppointments().then(res => {
            const apts = res.data;
            setAptCount({ total: apts.length, confirmed: apts.filter(a => a.status === "confirmed").length });
        }).catch(() => { });
    }, []);

    const save = async (e) => {
        e.preventDefault();
        try {
            const res = await updateProfile(f);
            updateUser(res.data);
            sm("✅ Profile updated!");
            sed(false);
            setTimeout(() => sm(""), 2500);
        } catch (err) {
            sm("❌ " + (err.response?.data?.message || "Update failed."));
        }
    };

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", padding: "2.25rem 0 4rem" }}>
            <div className="C">
                <div className="profile-layout" style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: "1.75rem", alignItems: "start" }}>
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center", position: "sticky", top: 76 }}>
                        <div style={{ width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--ac))", color: "#fff", fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto .875rem" }}>{user.name[0]}</div>
                        <h2 style={{ fontSize: "1rem", marginBottom: ".2rem" }}>{user.name}</h2>
                        <p style={{ fontSize: ".76rem", color: "var(--g5)", marginBottom: ".6rem", wordBreak: "break-word" }}>{user.email}</p>
                        <span style={{ display: "inline-block", background: "var(--pli)", color: "var(--pd)", fontSize: ".68rem", fontWeight: 700, padding: ".2rem .65rem", borderRadius: 99 }}>{user.role === "admin" ? "🛡️ Admin" : "🩺 Patient"}</span>
                        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1.5px solid var(--g2)" }}>
                            {[["Appointments", aptCount.total], ["Confirmed", aptCount.confirmed]].map(([l, v]) => (
                                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: ".33rem 0", fontSize: ".82rem" }}><span style={{ color: "var(--g5)" }}>{l}</span><strong>{v}</strong></div>
                            ))}
                            {user.blood && <div style={{ marginTop: ".4rem" }}><span style={{ background: "#fee2e2", color: "#991b1b", padding: ".16rem .6rem", borderRadius: 99, fontSize: ".7rem", fontWeight: 700 }}>{user.blood}</span></div>}
                        </div>
                        {!ed && <button className="btn bP" style={{ width: "100%", marginTop: "1rem", fontSize: ".85rem" }} onClick={() => sed(true)}>✏️ Edit Profile</button>}
                    </div>
                    <div>
                        {msg && <div className={`ae ${msg.startsWith("✅") ? "aS" : "aE"}`} style={{ marginBottom: "1.1rem" }}>{msg}</div>}
                        {!ed ? (
                            <div className="card" style={{ padding: "1.5rem" }}>
                                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", paddingBottom: ".875rem", borderBottom: "2px solid var(--g2)" }}>👤 Personal Information</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    {[["Full Name", user.name], ["Email", user.email], ["Phone", user.phone || "—"], ["Date of Birth", user.dob || "—"], ["Gender", user.gender ? user.gender[0].toUpperCase() + user.gender.slice(1) : "—"], ["Blood Group", user.blood || "—"]].map(([l, v]) => (
                                        <div key={l}><label style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".5px", color: "var(--g5)", fontWeight: 600, display: "block", marginBottom: ".25rem" }}>{l}</label><p style={{ fontSize: ".9rem", fontWeight: 500, margin: 0 }}>{v}</p></div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="card" style={{ padding: "1.5rem" }}>
                                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", paddingBottom: ".875rem", borderBottom: "2px solid var(--g2)" }}>✏️ Edit Profile</h3>
                                <form onSubmit={save}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".875rem", marginBottom: ".875rem" }}>
                                        <div><label className="lbl">Full Name</label><input className="inp" value={f.name} onChange={e => sf({ ...f, name: e.target.value })} required /></div>
                                        <div><label className="lbl">Phone</label><input className="inp" type="tel" value={f.phone} onChange={e => sf({ ...f, phone: e.target.value })} /></div>
                                        <div><label className="lbl">Gender</label>
                                            <select className="inp" value={f.gender} onChange={e => sf({ ...f, gender: e.target.value })}>
                                                <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div><label className="lbl">Blood Group</label>
                                            <select className="inp" value={f.blood} onChange={e => sf({ ...f, blood: e.target.value })}>
                                                <option value="">None</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <option key={b}>{b}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: ".625rem" }}>
                                        <button type="button" className="btn bS" onClick={() => { sed(false); sf({ name: user.name, phone: user.phone || "", gender: user.gender || "", blood: user.blood || "" }); }}>Cancel</button>
                                        <button type="submit" className="btn bP">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
