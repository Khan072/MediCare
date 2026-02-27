import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ pg, go }) {
    const { user, logout } = useAuth();
    const [sc, setSc] = useState(false);
    const [dd, setDd] = useState(false);
    const [mob, setMob] = useState(false);
    const ref = useRef();
    useEffect(() => {
        const fn = () => setSc(window.scrollY > 20);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);
    useEffect(() => {
        const fn = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setDd(false);
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);
    useEffect(() => { setDd(false); setMob(false); }, [pg]);

    const handleLogout = () => {
        logout();
        go("home");
        setDd(false);
        setMob(false);
    };

    const links = [
        ["home", "Home"],
        ["doctors", "Doctors"],
        ["book", "Book Appointment"],
        ["blog", "Blog"],
        ...(user ? [["dash", "My Appointments"], ["feedback", "Feedback"]] : []),
        ...(user?.role === "admin" ? [["admin", "Admin"]] : []),
    ];

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 500,
                background: sc ? "rgba(255,255,255,.98)" : "rgba(255,255,255,.9)",
                backdropFilter: "blur(14px)",
                borderBottom: sc
                    ? "1px solid #eeeeee"
                    : "1px solid transparent",
                boxShadow: sc ? "0 2px 20px rgba(0,0,0,.08)" : "none",
                transition: "all var(--tr)",
            }}
        >
            <div
                className="C"
                style={{
                    display: "flex",
                    alignItems: "center",
                    height: 64,
                    gap: "1rem",
                }}
            >
                <button
                    onClick={() => go("home")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".6rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            background: "linear-gradient(135deg,var(--pd),var(--pm))",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="20"
                            height="20"
                        >
                            <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1.9,2,2,2h14c1.1,0,2-.9,2-2V5C21,3.9,20.1,3,19,3M17,13h-4v4h-2v-4H7v-2h4V7h2v4h4V13z" />
                        </svg>
                    </div>
                    <span
                        style={{
                            fontSize: "1.3rem",
                            fontWeight: 800,
                            background:
                                "linear-gradient(135deg,var(--pd),var(--pm))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        MediCare
                    </span>
                </button>

                {/* Hamburger button */}
                <button className="hamburger" onClick={() => setMob(m => !m)} style={{ marginLeft: "auto" }}>
                    <span style={mob ? { transform: "rotate(45deg) translate(4px, 4px)" } : {}} />
                    <span style={mob ? { opacity: 0 } : {}} />
                    <span style={mob ? { transform: "rotate(-45deg) translate(5px, -5px)" } : {}} />
                </button>

                <div className={`nav-links${mob ? " open" : ""}`}>
                    {links.map(([p, l]) => (
                        <button
                            key={p}
                            onClick={() => go(p)}
                            style={{
                                padding: ".4rem .75rem",
                                borderRadius: 6,
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: ".875rem",
                                fontFamily: "inherit",
                                background: pg === p ? "var(--pli)" : "transparent",
                                color: pg === p ? "var(--pm)" : "var(--g6)",
                                transition: "all var(--tr)",
                            }}
                        >
                            {l}
                        </button>
                    ))}
                </div>
                <div className="nav-actions">
                    {user ? (
                        <div ref={ref} style={{ position: "relative" }}>
                            <button
                                onClick={() => setDd((o) => !o)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: ".45rem",
                                    background: "#fafafa",
                                    border: "1.5px solid var(--g2)",
                                    borderRadius: 99,
                                    padding: ".28rem .75rem .28rem .3rem",
                                    cursor: "pointer",
                                }}
                            >
                                <div
                                    style={{
                                        width: 27,
                                        height: 27,
                                        borderRadius: "50%",
                                        background:
                                            "linear-gradient(135deg,var(--pm),var(--ac))",
                                        color: "#fff",
                                        fontSize: ".78rem",
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {user.name[0]}
                                </div>
                                <span
                                    style={{
                                        fontSize: ".85rem",
                                        fontWeight: 600,
                                        color: "var(--g7)",
                                    }}
                                >
                                    {user.name.split(" ")[0]}
                                </span>
                                <span
                                    style={{
                                        color: "var(--g4)",
                                        fontSize: ".7rem",
                                        transform: dd ? "rotate(180deg)" : "none",
                                        transition: "transform var(--tr)",
                                    }}
                                >
                                    ▼
                                </span>
                            </button>
                            {dd && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "calc(100% + 8px)",
                                        right: 0,
                                        width: 200,
                                        background: "#fff",
                                        borderRadius: "var(--rl)",
                                        boxShadow: "0 8px 30px rgba(0,0,0,.14)",
                                        border: "1px solid var(--g2)",
                                        overflow: "hidden",
                                        zIndex: 600,
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: ".75rem 1rem",
                                            background: "var(--bg2)",
                                        }}
                                    >
                                        <div
                                            style={{ fontWeight: 700, fontSize: ".875rem" }}
                                        >
                                            {user.name}
                                        </div>
                                        <div
                                            style={{ fontSize: ".7rem", color: "var(--g5)" }}
                                        >
                                            {user.email}
                                        </div>
                                    </div>
                                    {[
                                        ["profile", "👤 My Profile"],
                                        ["dash", "📅 Appointments"],
                                        ...(user.role === "admin"
                                            ? [["admin", "🛡️ Admin"]]
                                            : []),
                                    ].map(([p, l]) => (
                                        <button
                                            key={p}
                                            onClick={() => {
                                                go(p);
                                                setDd(false);
                                            }}
                                            style={{
                                                display: "block",
                                                width: "100%",
                                                padding: ".6rem 1rem",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                textAlign: "left",
                                                fontSize: ".875rem",
                                                fontWeight: 500,
                                                color: "var(--g7)",
                                                fontFamily: "inherit",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.target.style.background = "#fafafa")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.target.style.background = "none")
                                            }
                                        >
                                            {l}
                                        </button>
                                    ))}
                                    <div style={{ height: 1, background: "#f5f5f5" }} />
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            padding: ".6rem 1rem",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            fontSize: ".875rem",
                                            fontWeight: 500,
                                            color: "var(--err)",
                                            fontFamily: "inherit",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.target.style.background = "#fff5f5")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.target.style.background = "none")
                                        }
                                    >
                                        🚪 Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button className="btn bO sm" onClick={() => go("login")}>
                                Login
                            </button>
                            <button className="btn bP sm" onClick={() => go("signup")}>
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
