import { useState, useEffect } from "react";
import { getDoctors } from "../api";

function Stars({ r }) {
    return (
        <span style={{ color: "#f59e0b", fontSize: ".8rem" }}>
            {"★".repeat(Math.floor(r))}
            <span style={{ color: "#757575", fontWeight: 700, marginLeft: 3 }}>
                {r}
            </span>
        </span>
    );
}

export default function Doctors({ go }) {
    const [docs, setDocs] = useState([]);
    const [q, sq] = useState("");
    const [sp, ssp] = useState("All");
    const [srt, ssrt] = useState("rat");
    const [sel, ssel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDoctors()
            .then((res) => setDocs(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const fil = docs
        .filter((d) => sp === "All" || d.spec === sp)
        .filter(
            (d) =>
                !q ||
                d.name.toLowerCase().includes(q.toLowerCase()) ||
                d.spec.toLowerCase().includes(q.toLowerCase())
        )
        .sort((a, b) =>
            srt === "rat"
                ? b.rat - a.rat
                : srt === "exp"
                    ? b.exp - a.exp
                    : srt === "flo"
                        ? a.fee - b.fee
                        : b.fee - a.fee
        );

    if (loading) return <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" /></div>;

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", paddingBottom: "4rem" }}>
            <div style={{ background: "linear-gradient(135deg,var(--pd),var(--pm))", padding: "3rem 0 2rem", textAlign: "center" }}>
                <div className="C">
                    <h1 style={{ color: "#fff", fontSize: "2rem", marginBottom: ".5rem" }}>Our Specialist Doctors</h1>
                    <p style={{ color: "rgba(255,255,255,.8)", marginBottom: "1.4rem" }}>Find the right specialist for your healthcare needs</p>
                    <div style={{ position: "relative", maxWidth: 460, margin: "0 auto" }}>
                        <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", fontSize: ".95rem" }}>🔍</span>
                        <input style={{ width: "100%", padding: ".72rem 1rem .72rem 2.7rem", borderRadius: 99, border: "none", fontSize: ".9rem", outline: "none", boxShadow: "0 4px 20px rgba(0,0,0,.15)" }} placeholder="Search name or specialization..." value={q} onChange={e => sq(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="C" style={{ paddingTop: "1.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".875rem", marginBottom: "1.1rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: ".4rem", overflow: "auto", flex: 1, paddingBottom: 4 }}>
                        {["All", "Cardiology", "Pediatrics", "Dermatology", "Orthopedics", "Neurology", "General Medicine", "Gynecology", "ENT"].map(s => (
                            <button key={s} onClick={() => ssp(s)} style={{ flexShrink: 0, padding: ".33rem .8rem", borderRadius: 99, border: `1.5px solid ${sp === s ? "var(--pm)" : "var(--g2)"}`, background: sp === s ? "var(--pm)" : "#fff", color: sp === s ? "#fff" : "var(--g7)", fontWeight: 600, cursor: "pointer", fontSize: ".8rem", fontFamily: "inherit", transition: "all var(--tr)" }}>{s}</button>
                        ))}
                    </div>
                    <select value={srt} onChange={e => ssrt(e.target.value)} className="inp" style={{ width: "auto", minWidth: 145, fontSize: ".82rem" }}>
                        <option value="rat">⭐ By Rating</option><option value="exp">🏅 Experience</option><option value="flo">💰 Fee Low→High</option><option value="fhi">💰 Fee High→Low</option>
                    </select>
                </div>
                <p style={{ color: "var(--g5)", fontSize: ".82rem", marginBottom: "1.1rem" }}>Showing <strong>{fil.length}</strong> doctor{fil.length !== 1 ? "s" : ""}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.1rem" }}>
                    {fil.map(doc => (
                        <div key={doc.id} className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: ".78rem" }}>
                            <div style={{ display: "flex", gap: ".78rem", alignItems: "flex-start" }}>
                                <div style={{ position: "relative", flexShrink: 0 }}>
                                    <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontSize: "1.2rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{doc.name.charAt(4)?.toUpperCase() || "D"}</div>
                                    <div style={{ position: "absolute", bottom: 1, right: 1, width: 12, height: 12, background: "#4ade80", borderRadius: "50%", border: "2px solid #fff" }} />
                                </div>
                                <div><h3 style={{ fontSize: ".9rem", marginBottom: ".2rem" }}>{doc.name}</h3><span className="pill">{doc.spec}</span><p style={{ fontSize: ".74rem", color: "var(--g5)", margin: ".18rem 0 0" }}>{doc.qual}</p></div>
                            </div>
                            <p style={{ fontSize: ".82rem", color: "var(--g6)", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{doc.bio}</p>
                            <div style={{ display: "flex", borderRadius: 8, border: "1.5px solid var(--g2)", overflow: "hidden" }}>
                                {[[`${doc.exp}yr`, "Exp"], [<Stars key="r" r={doc.rat} />, "Rating"], [doc.pts.toLocaleString(), "Patients"]].map(([v, l], i, arr) => (
                                    <div key={l} style={{ flex: 1, textAlign: "center", padding: ".42rem .2rem", borderRight: i < arr.length - 1 ? "1px solid var(--g2)" : "none" }}>
                                        <div style={{ fontWeight: 700, color: "var(--pm)", fontSize: ".85rem", marginBottom: ".07rem" }}>{v}</div>
                                        <div style={{ fontSize: ".63rem", color: "var(--g5)", textTransform: "uppercase", letterSpacing: ".3px" }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: ".55rem", borderTop: "1.5px solid var(--g2)" }}>
                                <div><div style={{ fontSize: ".67rem", color: "var(--g5)" }}>Consultation</div><div style={{ fontSize: "1.05rem", fontWeight: 800 }}>₹{doc.fee}</div></div>
                                <div style={{ display: "flex", gap: ".4rem" }}>
                                    <button className="btn bO sm" onClick={() => ssel(doc)}>Profile</button>
                                    <button className="btn bP sm" onClick={() => go("book")}>Book</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {sel && (
                <div className="ov" onClick={() => ssel(null)}>
                    <div className="box" style={{ width: 530, padding: "1.75rem" }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => ssel(null)} style={{ position: "absolute", top: ".875rem", right: ".875rem", width: 26, height: 26, borderRadius: "50%", background: "#f5f5f5", border: "none", cursor: "pointer", fontSize: ".8rem" }}>✕</button>
                        <div style={{ display: "flex", gap: ".875rem", alignItems: "center", marginBottom: "1.1rem", paddingBottom: "1.1rem", borderBottom: "2px solid var(--g2)" }}>
                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontSize: "1.35rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel.name.charAt(4)?.toUpperCase() || "D"}</div>
                            <div><h2 style={{ fontSize: "1.3rem", marginBottom: ".22rem" }}>{sel.name}</h2><span className="pill">{sel.spec}</span><p style={{ color: "var(--g5)", fontSize: ".8rem", margin: ".18rem 0 0" }}>{sel.qual}</p></div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: "1.5px solid var(--g2)", borderRadius: 8, overflow: "hidden", marginBottom: "1rem" }}>
                            {[[`${sel.exp}yr`, "Exp"], [`⭐ ${sel.rat}`, "Rating"], [sel.pts.toLocaleString(), "Patients"], [`₹${sel.fee}`, "Fee"]].map(([v, l], i, arr) => (
                                <div key={l} style={{ textAlign: "center", padding: ".68rem .3rem", borderRight: i < arr.length - 1 ? "1px solid var(--g2)" : "none" }}>
                                    <div style={{ fontWeight: 700, color: "var(--pm)", fontSize: ".875rem", marginBottom: ".12rem" }}>{v}</div>
                                    <div style={{ fontSize: ".63rem", color: "var(--g5)" }}>{l}</div>
                                </div>
                            ))}
                        </div>
                        <p style={{ color: "var(--g6)", lineHeight: 1.7, marginBottom: "1rem", fontSize: ".875rem" }}>{sel.bio}</p>
                        <h4 style={{ marginBottom: ".55rem", fontSize: ".9rem" }}>📅 Available Schedule</h4>
                        <div style={{ border: "1.5px solid var(--g2)", borderRadius: 8, padding: ".75rem", marginBottom: "1.25rem", maxHeight: 145, overflowY: "auto" }}>
                            {sel.av.map((av, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: ".75rem", marginBottom: i < sel.av.length - 1 ? ".5rem" : 0 }}>
                                    <div style={{ width: 78, fontWeight: 600, fontSize: ".82rem", flexShrink: 0 }}>{av.day}</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>{av.sl.map(s => <span key={s} style={{ background: "var(--pli)", color: "var(--pd)", padding: ".14rem .5rem", borderRadius: 99, fontSize: ".7rem", fontWeight: 600 }}>{s}</span>)}</div>
                                </div>
                            ))}
                        </div>
                        <button className="btn bP" style={{ width: "100%", padding: ".75rem" }} onClick={() => { go("book"); ssel(null); }}>Book with {sel.name.split(" ").slice(0, 2).join(" ")}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
