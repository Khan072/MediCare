import { useState, useEffect } from "react";
import { getBlogs, getBlog } from "../api";

export default function BlogPage() {
    const [blogs, setBlogs] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await getBlogs();
                setBlogs(res.data);
            } catch (err) {
                console.error("Failed to fetch blogs:", err);
            }
            setLoading(false);
        })();
    }, []);

    const openBlog = async (id) => {
        try {
            const res = await getBlog(id);
            setSelected(res.data);
        } catch (err) {
            console.error("Failed to fetch blog:", err);
        }
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    if (loading) return <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" /></div>;

    // Detail view
    if (selected) {
        return (
            <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", padding: "2.5rem 0 4rem" }}>
                <div className="C" style={{ maxWidth: 780 }}>
                    <button onClick={() => setSelected(null)} className="btn bS sm" style={{ marginBottom: "1.5rem" }}>← Back to Articles</button>
                    <article className="card" style={{ padding: "2.5rem", animation: "fi .5s ease" }}>
                        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                            {selected.tags?.map((t, i) => <span key={i} className="pill">{t}</span>)}
                        </div>
                        <h1 style={{ fontSize: "1.85rem", marginBottom: ".75rem", lineHeight: 1.2 }}>{selected.title}</h1>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", paddingBottom: "1.25rem", borderBottom: "2px solid var(--g2)" }}>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--pl))", color: "#fff", fontWeight: 700, fontSize: ".9rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {selected.authorName?.[0] || "A"}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: ".875rem" }}>{selected.authorName}</div>
                                <div style={{ fontSize: ".78rem", color: "var(--g5)" }}>{fmtDate(selected.createdAt)}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: ".95rem", lineHeight: 1.9, color: "var(--g7)", whiteSpace: "pre-wrap" }}>
                            {selected.content}
                        </div>
                    </article>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg)", padding: "2.5rem 0 4rem" }}>
            <div className="C">
                <div style={{ textAlign: "center", marginBottom: "2.5rem", animation: "fi .5s ease" }}>
                    <span className="tag">📰 Blog</span>
                    <h1 style={{ fontSize: "1.85rem", marginBottom: ".5rem" }}>Health Articles & News</h1>
                    <p style={{ color: "var(--g6)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
                        Stay informed with latest health tips, medical breakthroughs, and wellness advice from our experts.
                    </p>
                </div>

                {blogs.length === 0 ? (
                    <div className="card" style={{ padding: "4rem", textAlign: "center" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
                        <h3 style={{ color: "var(--g5)", fontWeight: 500 }}>No articles published yet</h3>
                        <p style={{ color: "var(--g4)", fontSize: ".875rem" }}>Check back soon for health tips and news.</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.25rem" }}>
                        {blogs.map((blog) => (
                            <div key={blog._id} className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer", animation: "fi .5s ease" }} onClick={() => openBlog(blog._id)}>
                                <div style={{ height: 6, background: "linear-gradient(90deg,var(--pm),var(--pl),var(--ac))" }} />
                                <div style={{ padding: "1.5rem" }}>
                                    <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", marginBottom: ".75rem" }}>
                                        {blog.tags?.slice(0, 3).map((t, i) => <span key={i} className="pill">{t}</span>)}
                                    </div>
                                    <h3 style={{ fontSize: "1.05rem", marginBottom: ".5rem", lineHeight: 1.35 }}>{blog.title}</h3>
                                    <p style={{ color: "var(--g5)", fontSize: ".84rem", lineHeight: 1.6, marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {blog.content}
                                    </p>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: ".75rem", borderTop: "1.5px solid var(--g2)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,var(--pm),var(--ac))", color: "#fff", fontSize: ".7rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {blog.authorName?.[0] || "A"}
                                            </div>
                                            <span style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--g6)" }}>{blog.authorName}</span>
                                        </div>
                                        <span style={{ fontSize: ".75rem", color: "var(--g4)" }}>{fmtDate(blog.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
