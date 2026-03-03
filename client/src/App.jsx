import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Doctors from "./components/Doctors";
import Book from "./components/Book";
import Dash from "./components/Dash";
import Profile from "./components/Profile";
import Admin from "./components/Admin";
import Chatbot from "./components/Chatbot";
import BlogPage from "./components/BlogPage";
import FeedbackPage from "./components/FeedbackPage";
import ForgotPassword from "./components/ForgotPassword";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
:root{--pd:#004d4d;--pm:#00796b;--pl:#4db6ac;--pli:#b2dfdb;--ac:#ff6b6b;
  --g2:#eeeeee;--g3:#e0e0e0;--g4:#bdbdbd;--g5:#9e9e9e;--g6:#757575;--g7:#616161;--g8:#424242;--g9:#212121;
  --ok:#4caf50;--err:#f44336;--info:#2196f3;--bg:#f8fffe;--bg2:#f0f9f8;
  --s1:0 1px 3px rgba(0,0,0,.1);--s2:0 4px 12px rgba(0,0,0,.1);--s3:0 10px 30px rgba(0,0,0,.13);--s4:0 20px 50px rgba(0,0,0,.18);
  --rm:8px;--rl:12px;--rx:16px;--rf:9999px;--tr:220ms ease;}
body{font-family:'Plus Jakarta Sans',sans-serif;color:var(--g8);background:var(--bg);-webkit-font-smoothing:antialiased;}
h1,h2,h3,h4{font-weight:700;line-height:1.2;color:var(--g9);margin-bottom:.5rem;}
.C{width:100%;max-width:1160px;margin:0 auto;padding:0 1.25rem;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.3rem;padding:.6rem 1.25rem;font-size:.875rem;font-weight:600;border:2px solid transparent;border-radius:var(--rm);cursor:pointer;transition:all var(--tr);font-family:inherit;white-space:nowrap;}
.bP{background:linear-gradient(135deg,var(--pm),var(--pl));color:#fff;box-shadow:var(--s2);} .bP:hover{transform:translateY(-2px);box-shadow:var(--s3);}
.bO{border-color:var(--pm);color:var(--pm);background:transparent;} .bO:hover{background:var(--pm);color:#fff;}
.bA{background:linear-gradient(135deg,var(--ac),#ff8787);color:#fff;} .bA:hover{transform:translateY(-2px);}
.bS{background:#f5f5f5;color:var(--g8);border-color:var(--g3);} .bS:hover{background:var(--g2);}
.sm{padding:.35rem .8rem;font-size:.8rem;} .lg{padding:.85rem 1.8rem;font-size:1rem;}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important;}
.card{background:#fff;border-radius:var(--rl);box-shadow:var(--s2);border:1.5px solid var(--g2);transition:box-shadow var(--tr);} .card:hover{box-shadow:var(--s3);}
.inp{width:100%;padding:.6rem .875rem;font-size:.875rem;border:2px solid var(--g3);border-radius:var(--rm);background:#fff;color:var(--g8);font-family:inherit;transition:border-color var(--tr);}
.inp:focus{outline:none;border-color:var(--pm);box-shadow:0 0 0 3px rgba(0,121,107,.1);}
.lbl{display:block;margin-bottom:.3rem;font-weight:600;color:var(--g7);font-size:.82rem;}
.ae{padding:.7rem 1rem;border-radius:var(--rm);font-size:.85rem;border-left:4px solid;}
.aE{background:#ffebee;border-color:var(--err);color:#c62828;}
.aS{background:#e8f5e9;border-color:var(--ok);color:#2e7d32;}
.aI{background:#e3f2fd;border-color:var(--info);color:#1565c0;}
.spin{border:3px solid var(--g2);border-top-color:var(--pm);border-radius:50%;width:32px;height:32px;animation:spin .8s linear infinite;margin:0 auto;}
.pill{display:inline-block;background:var(--pli);color:var(--pd);font-size:.68rem;font-weight:700;padding:.15rem .55rem;border-radius:var(--rf);}
.tag{display:inline-block;background:var(--pli);color:var(--pd);font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1.3px;padding:.24rem .8rem;border-radius:var(--rf);margin-bottom:.625rem;}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:900;padding:1rem;}
.box{background:#fff;border-radius:var(--rx);max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:var(--s4);position:relative;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}

/* ── Navbar mobile classes ── */
.nav-links{display:flex;align-items:center;gap:.1rem;flex:1;}
.nav-actions{display:flex;align-items:center;gap:.625rem;}
.hamburger{display:none;background:none;border:none;cursor:pointer;padding:.3rem;flex-direction:column;gap:4px;}
.hamburger span{display:block;width:22px;height:2.5px;background:var(--g7);border-radius:2px;transition:all .3s ease;}

/* ── Mobile responsive ── */
@media(max-width:768px){
  .hamburger{display:flex;}
  .nav-links{display:none;position:absolute;top:64px;left:0;right:0;background:#fff;flex-direction:column;align-items:stretch;padding:.5rem 0;box-shadow:0 8px 30px rgba(0,0,0,.12);border-bottom:1px solid var(--g2);gap:0;}
  .nav-links.open{display:flex;}
  .nav-links button{text-align:left!important;padding:.75rem 1.25rem!important;border-radius:0!important;font-size:.9rem!important;}
  .nav-actions{gap:.4rem;}
  .nav-actions .btn{font-size:.72rem;padding:.28rem .55rem;}
  .auth-shell{grid-template-columns:1fr!important;min-height:auto!important;}
  .auth-left{display:none!important;}
  .auth-right{padding:2rem 1.25rem!important;}
  .hero-grid{grid-template-columns:1fr!important;gap:1.5rem!important;}
  .hero-visual{display:none!important;}
  .stats-row{grid-template-columns:repeat(3,1fr)!important;}
  .admin-stats{grid-template-columns:repeat(2,1fr)!important;}
  .dash-stats{grid-template-columns:repeat(2,1fr)!important;}
  .profile-layout{grid-template-columns:1fr!important;}
  .book-layout{grid-template-columns:1fr!important;}
  .feedback-stats{grid-template-columns:1fr!important;}
  .feedback-layout{grid-template-columns:1fr!important;}
  .admin-layout{grid-template-columns:1fr!important;}
  section{padding:2.5rem 0!important;}
  h1{font-size:1.6rem!important;}
  h2{font-size:1.4rem!important;}
  .box{width:95vw!important;padding:1rem!important;}
  .ov{padding:.5rem!important;}

  /* ── Admin Dashboard Mobile ── */
  .admin-tabs{overflow-x:auto!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;flex-wrap:nowrap!important;}
  .admin-tabs::-webkit-scrollbar{display:none;}
  .admin-tabs button{flex-shrink:0!important;padding:.5rem .75rem!important;font-size:.78rem!important;white-space:nowrap!important;}
  .admin-form-3col{grid-template-columns:1fr!important;}
  .admin-form-4col{grid-template-columns:1fr 1fr!important;}
  .admin-form-2col{grid-template-columns:1fr!important;}
  .admin-form-row{flex-direction:column!important;align-items:stretch!important;}
  .admin-form-row .btn{width:100%!important;}
}

@media(max-width:480px){
  .admin-stats{grid-template-columns:1fr!important;}
  .admin-form-4col{grid-template-columns:1fr!important;}
  .stats-row{grid-template-columns:repeat(2,1fr)!important;}
  .dash-stats{grid-template-columns:1fr!important;}
}
`;

export default function App() {
    const { user, loading } = useAuth();
    const [pg, go] = useState("home");
    const setPage = (p) => {
        go(p);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <>
                <style>{css}</style>
                <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="spin" />
                </div>
            </>
        );
    }

    const pages = {
        home: <Home go={setPage} />,
        login: <Login go={setPage} />,
        signup: <Signup go={setPage} />,
        doctors: <Doctors go={setPage} />,
        book: <Book go={setPage} />,
        dash: user ? <Dash go={setPage} /> : <Login go={setPage} />,
        profile: user ? <Profile /> : <Login go={setPage} />,
        admin: user?.role === "admin" ? <Admin /> : <Home go={setPage} />,
        blog: <BlogPage />,
        feedback: <FeedbackPage go={setPage} />,
        "forgot-password": <ForgotPassword go={setPage} />,
    };

    return (
        <>
            <style>{css}</style>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navbar pg={pg} go={setPage} />
                <main style={{ flex: 1, paddingTop: 64 }}>
                    {pages[pg] || pages.home}
                </main>
            </div>
            <Chatbot />
        </>
    );
}
