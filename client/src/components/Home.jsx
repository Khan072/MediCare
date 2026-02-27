import { useState, useEffect } from "react";
import { getFeedbacks } from "../api";

export default function Home({ go }) {
    const [feedbacks, setFeedbacks] = useState([]);
    useEffect(() => {
        (async () => {
            try { const res = await getFeedbacks(); setFeedbacks(res.data.slice(0, 4)); } catch (e) { }
        })();
    }, []);
    const svcs = [
        ["❤️", "Cardiology", "Expert heart & cardiovascular care"],
        ["🧠", "Neurology", "Advanced neurological diagnosis & treatment"],
        ["👶", "Pediatrics", "Specialized healthcare for children"],
        ["🦴", "Orthopedics", "Bone, joint & sports injury treatment"],
        ["🔬", "Dermatology", "Skin, hair & nail specialist care"],
        ["💊", "General Medicine", "Comprehensive primary healthcare"],
    ];
    return (
        <div>
            {/* Hero */}
            <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: "7rem 0 4rem", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#f0f9f8,#fff 55%,#fff5f5)", zIndex: -1 }} />
                <div style={{ position: "absolute", top: -180, right: -80, width: 350, height: 350, background: "var(--pl)", borderRadius: "50%", filter: "blur(80px)", opacity: .17, zIndex: -1 }} />
                <div style={{ position: "absolute", bottom: -120, left: -80, width: 260, height: 260, background: "var(--ac)", borderRadius: "50%", filter: "blur(80px)", opacity: .13, zIndex: -1 }} />
                <div className="C">
                    <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
                        <div style={{ animation: "fi .8s ease" }}>
                            <span className="tag">🏥 Trusted Healthcare</span>
                            <h1 style={{ fontSize: "clamp(1.9rem,3.8vw,3.2rem)", fontWeight: 800, lineHeight: 1.08, marginBottom: "1rem" }}>
                                Your Health,<br />
                                <span style={{ background: "linear-gradient(135deg,var(--pm),var(--ac))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Our Priority</span>
                            </h1>
                            <p style={{ fontSize: "1.05rem", color: "var(--g6)", lineHeight: 1.8, marginBottom: "1.6rem", maxWidth: 440 }}>
                                Seamless healthcare with 24/7 AI-powered support, easy booking, and expert medical care at your fingertips.
                            </p>
                            <div style={{ display: "flex", gap: ".875rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                                <button className="btn bP lg" onClick={() => go("book")}>📅 Book Appointment</button>
                                <button className="btn bO lg" onClick={() => go("doctors")}>👨⚕️ Our Doctors</button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", paddingTop: "1.4rem", borderTop: "2px solid var(--g2)" }}>
                                {[["500+", "Doctors"], ["50K+", "Patients"], ["24/7", "AI Support"]].map(([n, l]) => (
                                    <div key={l} style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "1.65rem", fontWeight: 800, background: "linear-gradient(135deg,var(--pm),var(--ac))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{n}</div>
                                        <div style={{ fontSize: ".78rem", color: "var(--g6)", fontWeight: 500 }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="hero-visual" style={{ position: "relative", height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: 185, height: 185, borderRadius: "50%", background: "linear-gradient(135deg,var(--pli),#fff5f5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(0,121,107,.18)", border: "3px solid var(--pli)" }}>
                                <span style={{ fontSize: "5rem" }}>🏥</span>
                            </div>
                            {[{ s: { top: "12%", left: "0" }, ico: "❤️", l: "Health Score", v: "98% Excellent", d: 3 }, { s: { bottom: "18%", right: "0" }, ico: "🤖", l: "AI Assistant", v: "Always Online", d: 4.5 }].map(({ s, ico, l, v, d }, i) => (
                                <div key={i} style={{ position: "absolute", ...s, background: "#fff", borderRadius: 12, padding: ".875rem 1.1rem", boxShadow: "0 8px 30px rgba(0,0,0,.12)", display: "flex", alignItems: "center", gap: ".7rem", animation: `fl ${d}s ease-in-out infinite` }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 8, background: "linear-gradient(135deg,var(--pm),var(--pl))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem" }}>{ico}</div>
                                    <div><div style={{ fontSize: ".68rem", color: "var(--g5)" }}>{l}</div><div style={{ fontWeight: 700, fontSize: ".875rem" }}>{v}</div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section style={{ padding: "4.5rem 0", background: "var(--bg2)" }}>
                <div className="C">
                    <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                        <span className="tag">Our Services</span>
                        <h2 style={{ fontSize: "1.9rem" }}>Comprehensive Medical Care</h2>
                        <p style={{ color: "var(--g6)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>World-class specializations with experienced doctors and state-of-the-art facilities.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "1.1rem" }}>
                        {svcs.map(([icon, title, desc]) => (
                            <div key={title} className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                                <div style={{ fontSize: "2rem", marginBottom: ".7rem" }}>{icon}</div>
                                <h3 style={{ fontSize: "1rem", marginBottom: ".4rem" }}>{title}</h3>
                                <p style={{ color: "var(--g6)", fontSize: ".85rem", lineHeight: 1.6, marginBottom: ".875rem" }}>{desc}</p>
                                <button className="btn bO sm" onClick={() => go("book")}>Book Now →</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section style={{ padding: "4.5rem 0" }}>
                <div className="C">
                    <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
                        <span className="tag">How It Works</span>
                        <h2>Book in 3 Simple Steps</h2>
                    </div>
                    <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", flexWrap: "wrap" }}>
                        {[["01", "👤", "Create Account", "Sign up free in minutes."], ["02", "👨⚕️", "Choose Doctor", "Browse by specialization."], ["03", "📋", "Get Confirmation", "Instant printable slip."]].map(([n, ico, t, d], i) => (
                            <div key={i} style={{ flex: 1, minWidth: 200, maxWidth: 235, textAlign: "center", padding: "1.6rem 1.2rem", background: "#fff", borderRadius: "var(--rx)", border: "2px solid var(--g2)", position: "relative", boxShadow: "var(--s1)", transition: "all var(--tr)" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--pm)"; e.currentTarget.style.transform = "translateY(-5px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--g2)"; e.currentTarget.style.transform = "none"; }}>
                                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", width: 26, height: 26, background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", borderRadius: "50%", fontSize: ".68rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
                                <div style={{ fontSize: "1.9rem", marginTop: ".4rem", marginBottom: ".625rem" }}>{ico}</div>
                                <h3 style={{ fontSize: ".95rem", marginBottom: ".35rem" }}>{t}</h3>
                                <p style={{ fontSize: ".82rem", color: "var(--g6)", lineHeight: 1.6, margin: 0 }}>{d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Patient Testimonials */}
            {feedbacks.length > 0 && (
                <section style={{ padding: "4.5rem 0", background: "var(--bg2)" }}>
                    <div className="C">
                        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                            <span className="tag">Patient Reviews</span>
                            <h2 style={{ fontSize: "1.9rem" }}>What Our Patients Say</h2>
                            <p style={{ color: "var(--g6)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>Real experiences from our valued patients.</p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "1.1rem", marginBottom: "1.5rem" }}>
                            {feedbacks.map(fb => (
                                <div key={fb._id} className="card" style={{ padding: "1.5rem" }}>
                                    <div style={{ color: "#f59e0b", fontSize: ".95rem", marginBottom: ".6rem" }}>{"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}</div>
                                    <p style={{ fontSize: ".875rem", color: "var(--g6)", lineHeight: 1.65, marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>"{fb.message}"</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", paddingTop: ".75rem", borderTop: "1.5px solid var(--g2)" }}>
                                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--ac))", color: "#fff", fontSize: ".75rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{fb.name?.[0] || "?"}</div>
                                        <div style={{ fontWeight: 600, fontSize: ".82rem" }}>{fb.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <button className="btn bO sm" onClick={() => go("feedback")}>See All Reviews →</button>
                        </div>
                    </div>
                </section>
            )}
            {/* CTA */}
            <section style={{ padding: "4rem 0", background: "linear-gradient(135deg,var(--pd),var(--pm))" }}>
                <div className="C" style={{ textAlign: "center" }}>
                    <h2 style={{ color: "#fff", fontSize: "1.85rem", marginBottom: ".6rem" }}>Ready to Take Care of Your Health?</h2>
                    <p style={{ color: "rgba(255,255,255,.8)", marginBottom: "1.75rem", lineHeight: 1.7 }}>Join thousands who trust MediCare for expert care.</p>
                    <div style={{ display: "flex", gap: ".875rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button className="btn bA lg" onClick={() => go("signup")}>Get Started Free</button>
                        <button className="btn lg" onClick={() => go("book")} style={{ background: "rgba(255,255,255,.13)", color: "#fff", border: "2px solid rgba(255,255,255,.35)" }}>Book Appointment</button>
                    </div>
                </div>
            </section>

            <footer style={{ background: "#1a2332", color: "#fff", padding: "2.5rem 0 1.5rem" }}>
                <div className="C">
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem", marginBottom: "2rem" }}>
                        <div><h3 style={{ color: "#fff", fontSize: "1.3rem", marginBottom: ".5rem" }}>MediCare</h3><p style={{ color: "var(--g4)", fontSize: ".82rem", lineHeight: 1.7, maxWidth: 230 }}>Your health, our priority. Quality care with compassion.</p></div>
                        <div><h4 style={{ color: "#fff", fontSize: ".9rem", marginBottom: ".6rem" }}>Quick Links</h4>{[["home", "Home"], ["doctors", "Doctors"], ["book", "Book Appointment"]].map(([p, l]) => <div key={p} style={{ marginBottom: ".35rem" }}><button onClick={() => go(p)} style={{ background: "none", border: "none", color: "var(--g4)", cursor: "pointer", fontSize: ".82rem", padding: 0, fontFamily: "inherit" }}>{l}</button></div>)}</div>
                        <div><h4 style={{ color: "#fff", fontSize: ".9rem", marginBottom: ".6rem" }}>Contact</h4><p style={{ color: "var(--g4)", fontSize: ".82rem", lineHeight: 2, margin: 0 }}>123 Medical Center<br />📞 +1 (555) 123-4567<br />✉️ care@medicare.com</p></div>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: "1rem", textAlign: "center" }}>
                        <p style={{ color: "var(--g5)", fontSize: ".75rem", margin: 0 }}>© {new Date().getFullYear()} MediCare Hospital. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
