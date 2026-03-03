import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAppointments, updateAppointmentStatus, getDoctors, getPatientCount, uploadReport, getAllReports, getDoctorPerformance, getAdminBlogs, createBlog, updateBlog, deleteBlog, getAllFeedbacks, deleteFeedback, addDoctor, deleteDoctor, updateDoctor, getAdminChatbotQAs, createChatbotQA, updateChatbotQA, deleteChatbotQA } from "../api";

const API_BASE = "http://localhost:5000";

const fshort = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function Admin() {
    const { user } = useAuth();
    const [tab, st] = useState("overview");
    const [flt, sflt] = useState("all");
    const [apts, setApts] = useState([]);
    const [docs, setDocs] = useState([]);
    const [ptCount, setPtCount] = useState(0);
    const [reports, setReports] = useState([]);
    const [perfData, setPerfData] = useState([]);
    const [blogList, setBlogList] = useState([]);
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({ appointmentId: "", title: "", file: null });
    const [uploadMsg, setUploadMsg] = useState({ text: "", type: "" });
    const [blogForm, setBlogForm] = useState({ title: "", content: "", tags: "", published: true });
    const [blogMsg, setBlogMsg] = useState({ text: "", type: "" });
    const [editBlogId, setEditBlogId] = useState(null);
    const [docForm, setDocForm] = useState({ name: "", spec: "", qual: "", exp: "", fee: "", rat: "", pts: "", bio: "", photo: null });
    const [docAv, setDocAv] = useState([{ day: "Monday", sl: "09:00, 10:00" }]);
    const [docMsg, setDocMsg] = useState({ text: "", type: "" });
    const [addingDoc, setAddingDoc] = useState(false);
    const [showDocForm, setShowDocForm] = useState(false);
    const [editDocId, setEditDocId] = useState(null);
    const [chatQAs, setChatQAs] = useState([]);
    const [chatForm, setChatForm] = useState({ question: "", keywords: "", answer: "", enabled: true });
    const [chatMsg, setChatMsg] = useState({ text: "", type: "" });
    const [editChatId, setEditChatId] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [aptRes, docRes, ptRes] = await Promise.all([
                getAppointments(),
                getDoctors(),
                getPatientCount(),
            ]);
            setApts(aptRes.data);
            setDocs(docRes.data);
            setPtCount(ptRes.data.count);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
        }
        // Fetch reports, performance, blogs, feedback separately
        try { const rptRes = await getAllReports(); setReports(rptRes.data); } catch (err) { console.error("Failed to fetch reports:", err); }
        try { const perfRes = await getDoctorPerformance(); setPerfData(perfRes.data); } catch (err) { console.error("Failed to fetch performance:", err); }
        try { const blogRes = await getAdminBlogs(); setBlogList(blogRes.data); } catch (err) { console.error("Failed to fetch blogs:", err); }
        try { const fbRes = await getAllFeedbacks(); setFeedbackList(fbRes.data); } catch (err) { console.error("Failed to fetch feedback:", err); }
        try { const chatRes = await getAdminChatbotQAs(); setChatQAs(chatRes.data); } catch (err) { console.error("Failed to fetch chatbot QAs:", err); }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const stats = {
        tot: apts.length,
        c: apts.filter(a => a.status === "confirmed").length,
        d: apts.filter(a => a.status === "completed").length,
        x: apts.filter(a => a.status === "cancelled").length,
        docs: docs.length,
        pts: ptCount
    };
    const rev = apts.reduce((s, a) => s + (a.fee || 0), 0);
    const fa = flt === "all" ? apts : apts.filter(a => a.status === flt);

    const upd = async (id, status) => {
        try {
            await updateAppointmentStatus(id, status);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || "Update failed.");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploadMsg({ text: "", type: "" });
        if (!uploadForm.appointmentId || !uploadForm.title || !uploadForm.file) {
            setUploadMsg({ text: "Please fill all fields and select a file.", type: "err" });
            return;
        }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("appointmentId", uploadForm.appointmentId);
            fd.append("title", uploadForm.title);
            fd.append("file", uploadForm.file);
            await uploadReport(fd);
            setUploadMsg({ text: "Report uploaded successfully!", type: "ok" });
            setUploadForm({ appointmentId: "", title: "", file: null });
            fetchAll();
        } catch (err) {
            setUploadMsg({ text: err.response?.data?.message || "Upload failed.", type: "err" });
        }
        setUploading(false);
    };

    const handleBlogSubmit = async (e) => {
        e.preventDefault();
        setBlogMsg({ text: "", type: "" });
        if (!blogForm.title || !blogForm.content) {
            setBlogMsg({ text: "Title and content are required.", type: "err" });
            return;
        }
        try {
            const data = { title: blogForm.title, content: blogForm.content, tags: blogForm.tags.split(",").map(t => t.trim()).filter(Boolean), published: blogForm.published };
            if (editBlogId) {
                await updateBlog(editBlogId, data);
                setBlogMsg({ text: "Blog updated successfully!", type: "ok" });
                setEditBlogId(null);
            } else {
                await createBlog(data);
                setBlogMsg({ text: "Blog published successfully!", type: "ok" });
            }
            setBlogForm({ title: "", content: "", tags: "", published: true });
            fetchAll();
        } catch (err) {
            setBlogMsg({ text: err.response?.data?.message || "Failed.", type: "err" });
        }
    };

    const editBlog = (b) => {
        setEditBlogId(b._id);
        setBlogForm({ title: b.title, content: b.content, tags: (b.tags || []).join(", "), published: b.published });
        setBlogMsg({ text: "", type: "" });
    };

    const removeBlog = async (id) => {
        if (!confirm("Delete this blog?")) return;
        try { await deleteBlog(id); fetchAll(); } catch (err) { alert("Failed to delete."); }
    };

    const removeFeedback = async (id) => {
        if (!confirm("Delete this feedback?")) return;
        try { await deleteFeedback(id); fetchAll(); } catch (err) { alert("Failed to delete."); }
    };

    const handleDoctorSubmit = async (e) => {
        e.preventDefault();
        setDocMsg({ text: "", type: "" });
        if (!docForm.name || !docForm.spec || !docForm.qual || !docForm.exp || !docForm.fee) {
            setDocMsg({ text: "Name, specialization, qualification, experience, and fee are required.", type: "err" });
            return;
        }
        setAddingDoc(true);
        try {
            const fd = new FormData();
            fd.append("name", docForm.name);
            fd.append("spec", docForm.spec);
            fd.append("qual", docForm.qual);
            fd.append("exp", docForm.exp);
            fd.append("fee", docForm.fee);
            fd.append("rat", docForm.rat || "4.5");
            fd.append("pts", docForm.pts || "0");
            fd.append("bio", docForm.bio);
            if (docForm.photo) fd.append("photo", docForm.photo);
            const avParsed = docAv.map(a => ({ day: a.day, sl: a.sl.split(",").map(s => s.trim()).filter(Boolean) }));
            fd.append("av", JSON.stringify(avParsed));
            if (editDocId) {
                await updateDoctor(editDocId, fd);
                setDocMsg({ text: "Doctor updated successfully!", type: "ok" });
                setEditDocId(null);
            } else {
                await addDoctor(fd);
                setDocMsg({ text: "Doctor added successfully!", type: "ok" });
            }
            setDocForm({ name: "", spec: "", qual: "", exp: "", fee: "", rat: "", pts: "", bio: "", photo: null });
            setDocAv([{ day: "Monday", sl: "09:00, 10:00" }]);
            setShowDocForm(false);
            fetchAll();
        } catch (err) {
            setDocMsg({ text: err.response?.data?.message || (editDocId ? "Failed to update doctor." : "Failed to add doctor."), type: "err" });
        }
        setAddingDoc(false);
    };

    const editDoctor = (doc) => {
        setEditDocId(doc._id || doc.id);
        setDocForm({
            name: doc.name || "",
            spec: doc.spec || "",
            qual: doc.qual || "",
            exp: doc.exp?.toString() || "",
            fee: doc.fee?.toString() || "",
            rat: doc.rat?.toString() || "",
            pts: doc.pts?.toString() || "",
            bio: doc.bio || "",
            photo: null,
        });
        setDocAv(
            doc.av && doc.av.length > 0
                ? doc.av.map(a => ({ day: a.day, sl: (a.sl || []).join(", ") }))
                : [{ day: "Monday", sl: "09:00, 10:00" }]
        );
        setShowDocForm(true);
        setDocMsg({ text: "", type: "" });
    };

    const removeDoctor = async (id) => {
        if (!confirm("Delete this doctor? This cannot be undone.")) return;
        try { await deleteDoctor(id); fetchAll(); } catch (err) { alert(err.response?.data?.message || "Failed to delete."); }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        setChatMsg({ text: "", type: "" });
        if (!chatForm.question || !chatForm.answer) {
            setChatMsg({ text: "Question and answer are required.", type: "err" });
            return;
        }
        try {
            const data = {
                question: chatForm.question,
                keywords: chatForm.keywords.split(",").map(k => k.trim().toLowerCase()).filter(Boolean),
                answer: chatForm.answer,
                enabled: chatForm.enabled,
            };
            if (editChatId) {
                await updateChatbotQA(editChatId, data);
                setChatMsg({ text: "Q&A updated successfully!", type: "ok" });
                setEditChatId(null);
            } else {
                await createChatbotQA(data);
                setChatMsg({ text: "Q&A added successfully!", type: "ok" });
            }
            setChatForm({ question: "", keywords: "", answer: "", enabled: true });
            fetchAll();
        } catch (err) {
            setChatMsg({ text: err.response?.data?.message || "Failed.", type: "err" });
        }
    };

    const editChat = (qa) => {
        setEditChatId(qa._id);
        setChatForm({ question: qa.question, keywords: (qa.keywords || []).join(", "), answer: qa.answer, enabled: qa.enabled });
        setChatMsg({ text: "", type: "" });
    };

    const removeChat = async (id) => {
        if (!confirm("Delete this Q&A?")) return;
        try { await deleteChatbotQA(id); fetchAll(); } catch (err) { alert("Failed to delete."); }
    };

    const toggleChat = async (qa) => {
        try { await updateChatbotQA(qa._id, { enabled: !qa.enabled }); fetchAll(); } catch (err) { alert("Failed to update."); }
    };

    const fmtSize = (b) => b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : (b / 1024).toFixed(0) + " KB";
    const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const deadlineStatus = (r) => {
        const now = new Date();
        const dl = new Date(r.deadline);
        const up = new Date(r.uploadedAt);
        if (now <= dl) {
            const hrsLeft = Math.max(0, Math.round((dl - now) / 3600000));
            const hrsUsed = Math.round((up - (dl - 48 * 3600000)) / 3600000);
            return { label: `✅ On Time (${hrsLeft}h left)`, color: "#065f46", bg: "#d1fae5" };
        }
        const hrsOver = Math.round((now - dl) / 3600000);
        return { label: `⚠️ Overdue (${hrsOver}h)`, color: "#991b1b", bg: "#fee2e2" };
    };

    if (loading) return <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" /></div>;

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", padding: "2.25rem 0 4rem" }}>
            <div className="C">
                <div style={{ marginBottom: "1.75rem" }}><h1 style={{ fontSize: "1.6rem", marginBottom: ".3rem" }}>🛡️ Admin Dashboard</h1><p style={{ color: "var(--g5)", margin: 0 }}>Manage hospital appointments and doctors</p></div>

                <div className="admin-stats" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: ".875rem", marginBottom: "1.75rem" }}>
                    {[["📋", "Appointments", stats.tot, "#3b82f6"], ["✅", "Confirmed", stats.c, "#10b981"], ["🏁", "Completed", stats.d, "#6366f1"], ["❌", "Cancelled", stats.x, "#ef4444"], ["👨⚕️", "Doctors", stats.docs, "#f59e0b"], ["👥", "Patients", stats.pts, "#8b5cf6"]].map(([ic, l, v, c]) => (
                        <div key={l} className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: ".6rem" }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: `${c}18`, fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ic}</div>
                            <div><div style={{ fontSize: "1.45rem", fontWeight: 800, lineHeight: 1 }}>{v}</div><div style={{ fontSize: ".66rem", color: "var(--g5)", fontWeight: 500 }}>{l}</div></div>
                        </div>
                    ))}
                </div>

                <div className="admin-tabs" style={{ display: "flex", gap: ".25rem", marginBottom: "1.75rem", borderBottom: "2px solid var(--g2)" }}>
                    {[["overview", "📊 Overview"], ["appointments", "📅 Appointments"], ["doctors", "👨⚕️ Doctors"], ["performance", "📈 Performance"], ["reports", "📄 Reports"], ["blog", "📝 Blog"], ["feedback", "💬 Feedback"], ["chatbot", "🤖 Chatbot"]].map(([t, l]) => (
                        <button key={t} onClick={() => st(t)} style={{ padding: ".6rem 1.2rem", background: "none", border: "none", fontWeight: 600, fontSize: ".875rem", color: tab === t ? "var(--pm)" : "var(--g5)", cursor: "pointer", borderBottom: `3px solid ${tab === t ? "var(--pm)" : "transparent"}`, marginBottom: -2, fontFamily: "inherit" }}>{l}</button>
                    ))}
                </div>

                {tab === "overview" && (
                    <div className="admin-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div className="card" style={{ padding: "1.5rem" }}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "1.25rem" }}>📈 Appointment Distribution</h3>
                            {[["Confirmed", stats.c, "#10b981"], ["Completed", stats.d, "#6366f1"], ["Cancelled", stats.x, "#ef4444"]].map(([l, v, c]) => (
                                <div key={l} style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".875rem" }}>
                                    <span style={{ width: 70, fontSize: ".82rem", color: "var(--g6)" }}>{l}</span>
                                    <div style={{ flex: 1, height: 9, background: "#f5f5f5", borderRadius: 99, overflow: "hidden" }}>
                                        <div style={{ height: "100%", background: c, borderRadius: 99, width: stats.tot > 0 ? `${(v / stats.tot) * 100}%` : "0%", transition: "width .6s ease" }} />
                                    </div>
                                    <span style={{ width: 22, fontWeight: 700, fontSize: ".82rem", textAlign: "right" }}>{v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="card" style={{ padding: "1.5rem" }}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "1.25rem" }}>💰 Revenue Summary</h3>
                            {[["Total Revenue", `₹${rev.toLocaleString()}`], ["Appointments", stats.tot], ["Avg. Fee per Apt.", stats.tot ? `₹${Math.round(rev / stats.tot).toLocaleString()}` : "₹0"], ["Active Doctors", stats.docs]].map(([l, v]) => (
                                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: ".55rem 0", borderBottom: "1px dashed var(--g2)", fontSize: ".875rem" }}>
                                    <span style={{ color: "var(--g6)" }}>{l}</span><strong style={{ color: "var(--pm)" }}>{v}</strong>
                                </div>
                            ))}
                        </div>
                        <div className="card" style={{ padding: "1.5rem" }}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "1.1rem" }}>🕐 Recent Appointments</h3>
                            {apts.length === 0 ? <p style={{ color: "var(--g4)" }}>No appointments yet.</p> : apts.slice(0, 5).map(a => {
                                const doc = a.doctor || a.doc;
                                return (
                                    <div key={a._id} style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".75rem" }}>
                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontWeight: 700, fontSize: ".8rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{(a.patientName || a.pname)[0]}</div>
                                        <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: ".85rem" }}>{a.patientName || a.pname}</div><div style={{ fontSize: ".75rem", color: "var(--g5)" }}>{doc.spec} · {fshort(a.date || a.dt)}</div></div>
                                        <span style={{ padding: ".18rem .6rem", borderRadius: 99, fontSize: ".7rem", fontWeight: 700, ...(a.status === "confirmed" ? { background: "#d1fae5", color: "#065f46" } : a.status === "cancelled" ? { background: "#fee2e2", color: "#991b1b" } : { background: "#dbeafe", color: "#1e40af" }) }}>{a.status}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="card" style={{ padding: "1.5rem" }}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "1.1rem" }}>🏥 Specializations</h3>
                            {(() => {
                                const c = {}; apts.forEach(a => { const doc = a.doctor || a.doc; c[doc.spec] = (c[doc.spec] || 0) + 1; });
                                return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([s, n]) => (
                                    <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: ".48rem 0", borderBottom: "1px dashed var(--g2)", fontSize: ".875rem" }}>
                                        <span>{s}</span><span style={{ background: "#dbeafe", color: "#1e40af", padding: ".14rem .5rem", borderRadius: 99, fontSize: ".7rem", fontWeight: 700 }}>{n}</span>
                                    </div>
                                ));
                            })()}
                            {apts.length === 0 && <p style={{ color: "var(--g4)" }}>No data yet.</p>}
                        </div>
                    </div>
                )}

                {tab === "appointments" && (
                    <div>
                        <div style={{ display: "flex", gap: ".4rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                            {[["all", "All"], ["confirmed", "Confirmed"], ["completed", "Completed"], ["cancelled", "Cancelled"]].map(([f, l]) => (
                                <button key={f} onClick={() => sflt(f)} style={{ padding: ".33rem .8rem", borderRadius: 99, border: `1.5px solid ${flt === f ? "var(--pm)" : "var(--g2)"}`, background: flt === f ? "var(--pm)" : "#fff", color: flt === f ? "#fff" : "var(--g7)", fontWeight: 600, cursor: "pointer", fontSize: ".8rem", fontFamily: "inherit" }}>{l}</button>
                            ))}
                        </div>
                        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                            {fa.length === 0 ? <p style={{ padding: "3rem", textAlign: "center", color: "var(--g4)" }}>No appointments found.</p> : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead><tr style={{ background: "#fafafa" }}>
                                            {["Apt #", "Patient", "Doctor", "Date", "Fee", "Status", "Action"].map(h => <th key={h} style={{ padding: ".7rem 1rem", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: "var(--g5)", textTransform: "uppercase", letterSpacing: ".4px", borderBottom: "1.5px solid var(--g2)" }}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>
                                            {fa.map(apt => {
                                                const doc = apt.doctor || apt.doc;
                                                const num = apt.aptNumber || apt.num;
                                                return (
                                                    <tr key={apt._id} onMouseEnter={e => e.currentTarget.style.background = "#fafafa"} onMouseLeave={e => e.currentTarget.style.background = "none"} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                                        <td style={{ padding: ".875rem 1rem", fontSize: ".8rem" }}><code style={{ background: "#f5f5f5", padding: ".12rem .42rem", borderRadius: 4 }}>#{num}</code></td>
                                                        <td style={{ padding: ".875rem 1rem" }}><div style={{ fontWeight: 600, fontSize: ".875rem" }}>{apt.patientName || apt.pname}</div><div style={{ fontSize: ".74rem", color: "var(--g5)" }}>{apt.patientPhone || apt.pphone}</div></td>
                                                        <td style={{ padding: ".875rem 1rem" }}><div style={{ fontWeight: 600, fontSize: ".875rem" }}>{doc.name}</div><div style={{ fontSize: ".74rem", color: "var(--g5)" }}>{doc.spec}</div></td>
                                                        <td style={{ padding: ".875rem 1rem" }}><div style={{ fontSize: ".84rem" }}>{fshort(apt.date || apt.dt)}</div><div style={{ fontSize: ".74rem", color: "var(--g5)" }}>{apt.slot}</div></td>
                                                        <td style={{ padding: ".875rem 1rem", fontWeight: 700 }}>₹{apt.fee}</td>
                                                        <td style={{ padding: ".875rem 1rem" }}><span style={{ padding: ".22rem .65rem", borderRadius: 99, fontSize: ".72rem", fontWeight: 700, ...(apt.status === "confirmed" ? { background: "#d1fae5", color: "#065f46" } : apt.status === "cancelled" ? { background: "#fee2e2", color: "#991b1b" } : { background: "#dbeafe", color: "#1e40af" }) }}>{apt.status}</span></td>
                                                        <td style={{ padding: ".875rem 1rem" }}>
                                                            <select value={apt.status} onChange={e => upd(apt._id, e.target.value)} style={{ padding: ".28rem .6rem", border: "1.5px solid var(--g3)", borderRadius: 6, fontSize: ".8rem", cursor: "pointer", background: "#fff", fontFamily: "inherit" }}>
                                                                <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === "doctors" && (
                    <div>
                        {/* Add Doctor Toggle & Message */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>👨‍⚕️ Manage Doctors ({docs.length})</h3>
                            <button className="btn bP" onClick={() => { setShowDocForm(!showDocForm); setDocMsg({ text: "", type: "" }); if (showDocForm) { setEditDocId(null); setDocForm({ name: "", spec: "", qual: "", exp: "", fee: "", rat: "", pts: "", bio: "", photo: null }); setDocAv([{ day: "Monday", sl: "09:00, 10:00" }]); } }}>{showDocForm ? "✕ Close" : "➕ Add Doctor"}</button>
                        </div>
                        {docMsg.text && <div className={`ae ${docMsg.type === "ok" ? "aS" : "aE"}`} style={{ marginBottom: "1rem" }}>{docMsg.text}</div>}

                        {/* Add Doctor Form */}
                        {showDocForm && (
                            <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                                <h3 style={{ fontSize: "1rem", marginBottom: "1.1rem" }}>{editDocId ? "✏️ Edit Doctor" : "📋 Add New Doctor"}</h3>
                                <form onSubmit={handleDoctorSubmit}>
                                    <div className="admin-form-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                                        <div><label className="lbl">Full Name *</label><input className="inp" placeholder="Dr. John Doe" value={docForm.name} onChange={e => setDocForm(p => ({ ...p, name: e.target.value }))} /></div>
                                        <div><label className="lbl">Specialization *</label><input className="inp" placeholder="Cardiology" value={docForm.spec} onChange={e => setDocForm(p => ({ ...p, spec: e.target.value }))} /></div>
                                        <div><label className="lbl">Qualification *</label><input className="inp" placeholder="MBBS, MD" value={docForm.qual} onChange={e => setDocForm(p => ({ ...p, qual: e.target.value }))} /></div>
                                    </div>
                                    <div className="admin-form-4col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                                        <div><label className="lbl">Experience (yrs) *</label><input className="inp" type="number" min="0" placeholder="10" value={docForm.exp} onChange={e => setDocForm(p => ({ ...p, exp: e.target.value }))} /></div>
                                        <div><label className="lbl">Consultation Fee (₹) *</label><input className="inp" type="number" min="0" placeholder="1500" value={docForm.fee} onChange={e => setDocForm(p => ({ ...p, fee: e.target.value }))} /></div>
                                        <div><label className="lbl">Rating</label><input className="inp" type="number" step="0.1" min="0" max="5" placeholder="4.5" value={docForm.rat} onChange={e => setDocForm(p => ({ ...p, rat: e.target.value }))} /></div>
                                        <div><label className="lbl">Patients Seen</label><input className="inp" type="number" min="0" placeholder="500" value={docForm.pts} onChange={e => setDocForm(p => ({ ...p, pts: e.target.value }))} /></div>
                                    </div>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <label className="lbl">Bio</label>
                                        <textarea className="inp" rows={2} placeholder="Brief description about the doctor..." value={docForm.bio} onChange={e => setDocForm(p => ({ ...p, bio: e.target.value }))} style={{ resize: "vertical" }} />
                                    </div>
                                    <div className="admin-form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                                        <div>
                                            <label className="lbl">Doctor Photo (JPG / PNG — max 5MB)</label>
                                            <input type="file" accept=".jpg,.jpeg,.png,.webp" className="inp" style={{ padding: ".4rem .6rem" }} onChange={e => setDocForm(p => ({ ...p, photo: e.target.files[0] || null }))} />
                                        </div>
                                    </div>
                                    {/* Availability Schedule */}
                                    <div style={{ marginBottom: "1rem" }}>
                                        <label className="lbl">Availability Schedule</label>
                                        {docAv.map((row, i) => (
                                            <div key={i} style={{ display: "flex", gap: ".6rem", alignItems: "center", marginBottom: ".5rem" }}>
                                                <select className="inp" style={{ width: 140 }} value={row.day} onChange={e => { const n = [...docAv]; n[i].day = e.target.value; setDocAv(n); }}>
                                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                                <input className="inp" style={{ flex: 1 }} placeholder="09:00, 10:00, 11:00" value={row.sl} onChange={e => { const n = [...docAv]; n[i].sl = e.target.value; setDocAv(n); }} />
                                                <button type="button" onClick={() => setDocAv(docAv.filter((_, j) => j !== i))} style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid #ef4444", background: "#fee2e2", color: "#991b1b", cursor: "pointer", fontSize: ".8rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
                                            </div>
                                        ))}
                                        <button type="button" className="btn bO sm" onClick={() => setDocAv([...docAv, { day: "Monday", sl: "" }])} style={{ marginTop: ".25rem" }}>+ Add Day</button>
                                    </div>
                                    <div style={{ display: "flex", gap: ".5rem" }}>
                                        {editDocId && <button type="button" className="btn bS" onClick={() => { setEditDocId(null); setDocForm({ name: "", spec: "", qual: "", exp: "", fee: "", rat: "", pts: "", bio: "", photo: null }); setDocAv([{ day: "Monday", sl: "09:00, 10:00" }]); setDocMsg({ text: "", type: "" }); }}>Cancel</button>}
                                        <button type="submit" className="btn bP" disabled={addingDoc}>{addingDoc ? (editDocId ? "Updating..." : "Adding...") : (editDocId ? "✏️ Update Doctor" : "➕ Add Doctor")}</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Doctor Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.1rem" }}>
                            {docs.map(doc => (
                                <div key={doc._id || doc.id} className="card" style={{ padding: "1.25rem" }}>
                                    <div style={{ display: "flex", gap: ".75rem", alignItems: "center", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1.5px solid var(--g2)" }}>
                                        {doc.photo ? (
                                            <img src={`${API_BASE}/uploads/doctors/${doc.photo}`} alt={doc.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--pm)" }} />
                                        ) : (
                                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontSize: "1.15rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{doc.name.charAt(4)?.toUpperCase() || "D"}</div>
                                        )}
                                        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: ".875rem" }}>{doc.name}</div><span className="pill">{doc.spec}</span></div>
                                    </div>
                                    {doc.bio && <p style={{ fontSize: ".78rem", color: "var(--g6)", lineHeight: 1.5, margin: "0 0 .75rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{doc.bio}</p>}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".5rem", marginBottom: ".75rem" }}>
                                        {[[`${doc.exp}yr`, "Experience"], [`⭐ ${doc.rat}`, "Rating"], [doc.pts.toLocaleString(), "Patients"], [`₹${doc.fee}`, "Fee"]].map(([v, l]) => (
                                            <div key={l} style={{ background: "#fafafa", borderRadius: 6, padding: ".45rem .6rem" }}>
                                                <div style={{ fontWeight: 700, fontSize: ".875rem", color: "var(--pm)" }}>{v}</div>
                                                <div style={{ fontSize: ".65rem", color: "var(--g5)" }}>{l}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", gap: ".5rem" }}>
                                        <button className="btn sm" style={{ flex: 1, background: "#dbeafe", color: "#1e40af", border: "none", fontWeight: 600 }} onClick={() => editDoctor(doc)}>✏️ Edit</button>
                                        <button className="btn sm" style={{ flex: 1, background: "#fee2e2", color: "#991b1b", border: "none", fontWeight: 600 }} onClick={() => removeDoctor(doc._id || doc.id)}>🗑️ Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === "reports" && (
                    <div>
                        {/* Upload Form */}
                        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "1.1rem" }}>📤 Upload Medical Report</h3>
                            {uploadMsg.text && <div className={`ae ${uploadMsg.type === "ok" ? "aS" : "aE"}`} style={{ marginBottom: "1rem" }}>{uploadMsg.text}</div>}
                            <form onSubmit={handleUpload}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                                    <div>
                                        <label className="lbl">Select Appointment</label>
                                        <select className="inp" value={uploadForm.appointmentId} onChange={e => setUploadForm(p => ({ ...p, appointmentId: e.target.value }))}>
                                            <option value="">-- Choose appointment --</option>
                                            {apts.filter(a => a.status === "completed" || a.status === "confirmed").map(a => {
                                                const doc = a.doctor || a.doc;
                                                return <option key={a._id} value={a._id}>{a.patientName} — {doc.name} ({fshort(a.date || a.dt)})</option>;
                                            })}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="lbl">Report Title</label>
                                        <input className="inp" placeholder="e.g. Blood Test Report" value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))} />
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="lbl">Attach File (PDF, Image, Doc — max 10MB)</label>
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" className="inp" style={{ padding: ".4rem .6rem" }} onChange={e => setUploadForm(p => ({ ...p, file: e.target.files[0] || null }))} />
                                    </div>
                                    <button type="submit" className="btn bP" disabled={uploading} style={{ marginTop: "1.2rem" }}>
                                        {uploading ? "Uploading..." : "📤 Upload Report"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Reports Table */}
                        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                            <div style={{ padding: "1rem 1.25rem", borderBottom: "1.5px solid var(--g2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h3 style={{ fontSize: "1rem", margin: 0 }}>📋 All Uploaded Reports</h3>
                                <span style={{ fontSize: ".8rem", color: "var(--g5)" }}>{reports.length} report{reports.length !== 1 ? "s" : ""}</span>
                            </div>
                            {reports.length === 0 ? (
                                <p style={{ padding: "3rem", textAlign: "center", color: "var(--g4)" }}>No reports uploaded yet.</p>
                            ) : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead><tr style={{ background: "#fafafa" }}>
                                            {["Patient", "Doctor", "Title", "File", "Uploaded", "48h Deadline"].map(h => <th key={h} style={{ padding: ".7rem 1rem", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: "var(--g5)", textTransform: "uppercase", letterSpacing: ".4px", borderBottom: "1.5px solid var(--g2)" }}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>
                                            {reports.map(r => {
                                                const ds = deadlineStatus(r);
                                                return (
                                                    <tr key={r._id} onMouseEnter={e => e.currentTarget.style.background = "#fafafa"} onMouseLeave={e => e.currentTarget.style.background = "none"} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                                        <td style={{ padding: ".875rem 1rem" }}><div style={{ fontWeight: 600, fontSize: ".875rem" }}>{r.patientName}</div><div style={{ fontSize: ".74rem", color: "var(--g5)" }}>{r.patientEmail}</div></td>
                                                        <td style={{ padding: ".875rem 1rem", fontSize: ".875rem" }}>{r.doctorName || "—"}</td>
                                                        <td style={{ padding: ".875rem 1rem", fontWeight: 600, fontSize: ".875rem" }}>{r.title}</td>
                                                        <td style={{ padding: ".875rem 1rem" }}><div style={{ fontSize: ".8rem" }}>{r.originalName}</div><div style={{ fontSize: ".7rem", color: "var(--g5)" }}>{fmtSize(r.fileSize)}</div></td>
                                                        <td style={{ padding: ".875rem 1rem", fontSize: ".8rem" }}>{fmtDate(r.uploadedAt)}</td>
                                                        <td style={{ padding: ".875rem 1rem" }}><span style={{ padding: ".22rem .65rem", borderRadius: 99, fontSize: ".72rem", fontWeight: 700, background: ds.bg, color: ds.color }}>{ds.label}</span></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ PERFORMANCE TAB ═══ */}
                {tab === "performance" && (
                    <div>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1.25rem" }}>📈 Doctor Performance Overview</h3>
                        {perfData.length === 0 ? (
                            <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                                <p style={{ color: "var(--g4)" }}>No performance data yet. Appointments will generate doctor stats.</p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.1rem" }}>
                                {perfData.map(d => (
                                    <div key={d.doctorId} className="card" style={{ padding: "1.5rem" }}>
                                        <div style={{ display: "flex", gap: ".75rem", alignItems: "center", marginBottom: "1.1rem", paddingBottom: "1rem", borderBottom: "1.5px solid var(--g2)" }}>
                                            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontSize: "1.15rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{d.doctorName?.charAt(4)?.toUpperCase() || "D"}</div>
                                            <div><div style={{ fontWeight: 700, fontSize: ".92rem" }}>{d.doctorName}</div><span className="pill">{d.specialization}</span></div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".5rem", marginBottom: "1rem" }}>
                                            {[[d.today, "Today", "#3b82f6"], [d.thisMonth, "This Month", "#10b981"], [d.total, "Total", "#6366f1"]].map(([v, l, c]) => (
                                                <div key={l} style={{ background: `${c}10`, borderRadius: 8, padding: ".55rem .6rem", textAlign: "center" }}>
                                                    <div style={{ fontWeight: 800, fontSize: "1.2rem", color: c }}>{v}</div>
                                                    <div style={{ fontSize: ".65rem", color: "var(--g5)", fontWeight: 500 }}>{l}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".5rem", marginBottom: "1rem" }}>
                                            {[[d.completed, "Completed", "#10b981"], [d.cancelled, "Cancelled", "#ef4444"]].map(([v, l, c]) => (
                                                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: ".4rem .6rem", background: "#fafafa", borderRadius: 6, fontSize: ".82rem" }}>
                                                    <span style={{ color: "var(--g6)" }}>{l}</span><span style={{ fontWeight: 700, color: c }}>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginBottom: ".5rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", marginBottom: ".3rem" }}>
                                                <span style={{ color: "var(--g6)" }}>Completion Rate</span>
                                                <span style={{ fontWeight: 700, color: d.completionRate >= 70 ? "#10b981" : d.completionRate >= 40 ? "#f59e0b" : "#ef4444" }}>{d.completionRate}%</span>
                                            </div>
                                            <div style={{ height: 8, background: "#f5f5f5", borderRadius: 99, overflow: "hidden" }}>
                                                <div style={{ height: "100%", borderRadius: 99, width: `${d.completionRate}%`, background: d.completionRate >= 70 ? "#10b981" : d.completionRate >= 40 ? "#f59e0b" : "#ef4444", transition: "width .6s ease" }} />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", paddingTop: ".6rem", borderTop: "1px dashed var(--g2)" }}>
                                            <span style={{ color: "var(--g6)" }}>Revenue</span><strong style={{ color: "var(--pm)" }}>₹{(d.revenue || 0).toLocaleString()}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ BLOG TAB ═══ */}
                {tab === "blog" && (
                    <div>
                        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "1.1rem" }}>{editBlogId ? "✏️ Edit Article" : "📰 Create New Article"}</h3>
                            {blogMsg.text && <div className={`ae ${blogMsg.type === "ok" ? "aS" : "aE"}`} style={{ marginBottom: "1rem" }}>{blogMsg.text}</div>}
                            <form onSubmit={handleBlogSubmit}>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label className="lbl">Title</label>
                                    <input className="inp" placeholder="Article title" value={blogForm.title} onChange={e => setBlogForm(p => ({ ...p, title: e.target.value }))} />
                                </div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label className="lbl">Content</label>
                                    <textarea className="inp" rows={6} placeholder="Write your article content..." value={blogForm.content} onChange={e => setBlogForm(p => ({ ...p, content: e.target.value }))} style={{ resize: "vertical" }} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", alignItems: "end" }}>
                                    <div>
                                        <label className="lbl">Tags (comma separated)</label>
                                        <input className="inp" placeholder="e.g. health, tips, cardiology" value={blogForm.tags} onChange={e => setBlogForm(p => ({ ...p, tags: e.target.value }))} />
                                    </div>
                                    <label style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer", fontSize: ".85rem", fontWeight: 600, color: "var(--g6)", paddingBottom: ".65rem" }}>
                                        <input type="checkbox" checked={blogForm.published} onChange={e => setBlogForm(p => ({ ...p, published: e.target.checked }))} /> Published
                                    </label>
                                    <div style={{ display: "flex", gap: ".5rem" }}>
                                        {editBlogId && <button type="button" className="btn bS" onClick={() => { setEditBlogId(null); setBlogForm({ title: "", content: "", tags: "", published: true }); setBlogMsg({ text: "", type: "" }); }}>Cancel</button>}
                                        <button type="submit" className="btn bP">{editBlogId ? "Update" : "📤 Publish"}</button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                            <div style={{ padding: "1rem 1.25rem", borderBottom: "1.5px solid var(--g2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h3 style={{ fontSize: "1rem", margin: 0 }}>📋 All Articles</h3>
                                <span style={{ fontSize: ".8rem", color: "var(--g5)" }}>{blogList.length} article{blogList.length !== 1 ? "s" : ""}</span>
                            </div>
                            {blogList.length === 0 ? <p style={{ padding: "3rem", textAlign: "center", color: "var(--g4)" }}>No articles yet.</p> : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead><tr style={{ background: "#fafafa" }}>
                                            {["Title", "Tags", "Status", "Date", "Actions"].map(h => <th key={h} style={{ padding: ".7rem 1rem", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: "var(--g5)", textTransform: "uppercase", letterSpacing: ".4px", borderBottom: "1.5px solid var(--g2)" }}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>
                                            {blogList.map(b => (
                                                <tr key={b._id} style={{ borderBottom: "1px solid #f5f5f5" }} onMouseEnter={e => e.currentTarget.style.background = "#fafafa"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                                    <td style={{ padding: ".875rem 1rem", fontWeight: 600, fontSize: ".875rem", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</td>
                                                    <td style={{ padding: ".875rem 1rem" }}>{(b.tags || []).slice(0, 2).map((t, i) => <span key={i} className="pill" style={{ marginRight: ".25rem" }}>{t}</span>)}</td>
                                                    <td style={{ padding: ".875rem 1rem" }}><span style={{ padding: ".2rem .6rem", borderRadius: 99, fontSize: ".72rem", fontWeight: 700, background: b.published ? "#d1fae5" : "#fee2e2", color: b.published ? "#065f46" : "#991b1b" }}>{b.published ? "Published" : "Draft"}</span></td>
                                                    <td style={{ padding: ".875rem 1rem", fontSize: ".8rem", color: "var(--g5)" }}>{fshort(b.createdAt?.split("T")[0] || "")}</td>
                                                    <td style={{ padding: ".875rem 1rem" }}>
                                                        <div style={{ display: "flex", gap: ".35rem" }}>
                                                            <button className="btn bO sm" onClick={() => editBlog(b)}>Edit</button>
                                                            <button className="btn sm" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }} onClick={() => removeBlog(b._id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ FEEDBACK TAB ═══ */}
                {tab === "feedback" && (
                    <div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".875rem", marginBottom: "1.5rem" }}>
                            {[["💬", "Total Feedback", feedbackList.length, "#3b82f6"], ["⭐", "Avg Rating", feedbackList.length > 0 ? (feedbackList.reduce((s, f) => s + f.rating, 0) / feedbackList.length).toFixed(1) : "—", "#f59e0b"], ["😊", "Satisfaction", feedbackList.length > 0 ? `${Math.round((feedbackList.filter(f => f.rating >= 4).length / feedbackList.length) * 100)}%` : "—", "#10b981"]].map(([ic, l, v, c]) => (
                                <div key={l} className="card" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: ".6rem" }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 8, background: `${c}18`, fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ic}</div>
                                    <div><div style={{ fontSize: "1.3rem", fontWeight: 800 }}>{v}</div><div style={{ fontSize: ".66rem", color: "var(--g5)", fontWeight: 500 }}>{l}</div></div>
                                </div>
                            ))}
                        </div>

                        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                            <div style={{ padding: "1rem 1.25rem", borderBottom: "1.5px solid var(--g2)" }}>
                                <h3 style={{ fontSize: "1rem", margin: 0 }}>🗣️ All Patient Feedback</h3>
                            </div>
                            {feedbackList.length === 0 ? <p style={{ padding: "3rem", textAlign: "center", color: "var(--g4)" }}>No feedback received yet.</p> : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead><tr style={{ background: "#fafafa" }}>
                                            {["Patient", "Rating", "Message", "Date", "Action"].map(h => <th key={h} style={{ padding: ".7rem 1rem", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: "var(--g5)", textTransform: "uppercase", letterSpacing: ".4px", borderBottom: "1.5px solid var(--g2)" }}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>
                                            {feedbackList.map(fb => (
                                                <tr key={fb._id} style={{ borderBottom: "1px solid #f5f5f5" }} onMouseEnter={e => e.currentTarget.style.background = "#fafafa"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                                    <td style={{ padding: ".875rem 1rem" }}><div style={{ fontWeight: 600, fontSize: ".875rem" }}>{fb.name}</div><div style={{ fontSize: ".74rem", color: "var(--g5)" }}>{fb.email}</div></td>
                                                    <td style={{ padding: ".875rem 1rem", color: "#f59e0b", fontWeight: 700, fontSize: ".85rem" }}>{"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}</td>
                                                    <td style={{ padding: ".875rem 1rem", fontSize: ".84rem", color: "var(--g6)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fb.message}</td>
                                                    <td style={{ padding: ".875rem 1rem", fontSize: ".8rem", color: "var(--g5)" }}>{new Date(fb.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                                                    <td style={{ padding: ".875rem 1rem" }}><button className="btn sm" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }} onClick={() => removeFeedback(fb._id)}>Delete</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ CHATBOT TAB ═══ */}
                {tab === "chatbot" && (
                    <div>
                        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "1rem", marginBottom: "1.1rem" }}>{editChatId ? "✏️ Edit Q&A" : "🤖 Add Chatbot Q&A"}</h3>
                            {chatMsg.text && <div className={`ae ${chatMsg.type === "ok" ? "aS" : "aE"}`} style={{ marginBottom: "1rem" }}>{chatMsg.text}</div>}
                            <form onSubmit={handleChatSubmit}>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label className="lbl">Question / Menu Label *</label>
                                    <input className="inp" placeholder="e.g. What are the visiting hours?" value={chatForm.question} onChange={e => setChatForm(p => ({ ...p, question: e.target.value }))} />
                                </div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label className="lbl">Keywords (comma separated — used to match user queries)</label>
                                    <input className="inp" placeholder="e.g. visiting, hours, visit, timing" value={chatForm.keywords} onChange={e => setChatForm(p => ({ ...p, keywords: e.target.value }))} />
                                </div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label className="lbl">Answer * (use **bold** for emphasis, \n for new lines)</label>
                                    <textarea className="inp" rows={4} placeholder="The answer the chatbot will give..." value={chatForm.answer} onChange={e => setChatForm(p => ({ ...p, answer: e.target.value }))} style={{ resize: "vertical" }} />
                                </div>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer", fontSize: ".85rem", fontWeight: 600, color: "var(--g6)" }}>
                                        <input type="checkbox" checked={chatForm.enabled} onChange={e => setChatForm(p => ({ ...p, enabled: e.target.checked }))} /> Enabled
                                    </label>
                                    <div style={{ flex: 1 }} />
                                    {editChatId && <button type="button" className="btn bS" onClick={() => { setEditChatId(null); setChatForm({ question: "", keywords: "", answer: "", enabled: true }); setChatMsg({ text: "", type: "" }); }}>Cancel</button>}
                                    <button type="submit" className="btn bP">{editChatId ? "Update Q&A" : "➕ Add Q&A"}</button>
                                </div>
                            </form>
                        </div>

                        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                            <div style={{ padding: "1rem 1.25rem", borderBottom: "1.5px solid var(--g2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h3 style={{ fontSize: "1rem", margin: 0 }}>📋 All Chatbot Q&As</h3>
                                <span style={{ fontSize: ".8rem", color: "var(--g5)" }}>{chatQAs.length} item{chatQAs.length !== 1 ? "s" : ""}</span>
                            </div>
                            {chatQAs.length === 0 ? <p style={{ padding: "3rem", textAlign: "center", color: "var(--g4)" }}>No custom Q&As yet. The chatbot will use default responses.</p> : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead><tr style={{ background: "#fafafa" }}>
                                            {["Question", "Keywords", "Answer", "Status", "Actions"].map(h => <th key={h} style={{ padding: ".7rem 1rem", textAlign: "left", fontSize: ".72rem", fontWeight: 700, color: "var(--g5)", textTransform: "uppercase", letterSpacing: ".4px", borderBottom: "1.5px solid var(--g2)" }}>{h}</th>)}
                                        </tr></thead>
                                        <tbody>
                                            {chatQAs.map(qa => (
                                                <tr key={qa._id} style={{ borderBottom: "1px solid #f5f5f5" }} onMouseEnter={e => e.currentTarget.style.background = "#fafafa"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                                    <td style={{ padding: ".875rem 1rem", fontWeight: 600, fontSize: ".875rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{qa.question}</td>
                                                    <td style={{ padding: ".875rem 1rem" }}>{(qa.keywords || []).slice(0, 3).map((k, i) => <span key={i} className="pill" style={{ marginRight: ".25rem" }}>{k}</span>)}{(qa.keywords || []).length > 3 && <span style={{ fontSize: ".7rem", color: "var(--g5)" }}>+{qa.keywords.length - 3}</span>}</td>
                                                    <td style={{ padding: ".875rem 1rem", fontSize: ".8rem", color: "var(--g6)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{qa.answer}</td>
                                                    <td style={{ padding: ".875rem 1rem" }}>
                                                        <button onClick={() => toggleChat(qa)} style={{ padding: ".2rem .6rem", borderRadius: 99, fontSize: ".72rem", fontWeight: 700, border: "none", cursor: "pointer", background: qa.enabled ? "#d1fae5" : "#fee2e2", color: qa.enabled ? "#065f46" : "#991b1b" }}>{qa.enabled ? "Active" : "Disabled"}</button>
                                                    </td>
                                                    <td style={{ padding: ".875rem 1rem" }}>
                                                        <div style={{ display: "flex", gap: ".35rem" }}>
                                                            <button className="btn bO sm" onClick={() => editChat(qa)}>Edit</button>
                                                            <button className="btn sm" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }} onClick={() => removeChat(qa._id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
