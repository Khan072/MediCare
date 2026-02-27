import { useState, useEffect, useRef } from "react";

const WELCOME = `Welcome to **Medicare Hospital Assistant** 👨‍⚕️🏥\nPlease select an option by typing the number:\n\n1️⃣ Book an Appointment\n2️⃣ Doctor Availability\n3️⃣ Departments & Services\n4️⃣ Emergency Contact\n5️⃣ Hospital Timings\n6️⃣ Lab Tests & Reports\n7️⃣ Insurance & Billing\n8️⃣ Talk to Support`;

const MENU_OPTIONS = [
    "Book Appointment",
    "Doctor Availability",
    "Departments",
    "Emergency",
    "Timings",
    "Lab & Reports",
    "Insurance",
    "Support"
];

// Serious symptom keywords
const SERIOUS = ["chest pain", "breathing", "unconscious", "bleeding", "heart attack", "stroke", "seizure", "faint", "collapse", "not breathing", "severe pain", "accident"];

function getReply(msg) {
    const m = msg.trim();
    const lo = m.toLowerCase();

    // ── Number-based menu selection ──
    if (/^1$/.test(m)) {
        return "Sure! I'd be happy to help you **book an appointment** 📅\n\nPlease provide the following details:\n\n1. **Your Name**\n2. **Preferred Doctor / Department**\n3. **Preferred Date**\n4. **Preferred Time Slot**\n\nOr you can directly go to the **Book Appointment** page from the navigation bar for instant booking!";
    }
    if (/^2$/.test(m)) {
        return "Here are our **available doctors** 👨‍⚕️\n\n🔹 **Dr. Sarah Johnson** — Cardiology (Mon–Fri, 9AM–3PM)\n🔹 **Dr. Michael Chen** — Orthopedics (Mon–Sat, 10AM–5PM)\n🔹 **Dr. Emily Williams** — Neurology (Tue–Sat, 9AM–4PM)\n🔹 **Dr. James Brown** — Pediatrics (Mon–Fri, 10AM–6PM)\n🔹 **Dr. Lisa Anderson** — Dermatology (Mon–Sat, 9AM–2PM)\n🔹 **Dr. David Wilson** — General Medicine (Mon–Sat, 9AM–8PM)\n\nVisit the **Doctors** page for real-time availability and booking.";
    }
    if (/^3$/.test(m)) {
        return "Our **Departments & Services** 🏥\n\n❤️ **Cardiology** — Heart & cardiovascular care\n🦴 **Orthopedics** — Bone & joint treatment\n🧠 **Neurology** — Brain & nervous system\n👶 **Pediatrics** — Children's healthcare\n🩺 **General Medicine** — Primary care\n🧬 **Dermatology** — Skin specialist\n👩‍⚕️ **Gynecology** — Women's health\n🦷 **Dental** — Oral health care\n👀 **Ophthalmology** — Eye care\n🧪 **Pathology** — Lab & diagnostics\n\nWould you like to know more about any department?";
    }
    if (/^4$/.test(m)) {
        return "🚨 **Emergency Contact Information**\n\n📞 **Emergency Helpline:** +91-911-000-000\n🚑 **Ambulance Service:** +91-102\n🏥 **Emergency Department:** Open **24/7**\n\n⚠️ In case of a medical emergency, please call immediately or visit our emergency department. Do not delay!";
    }
    if (/^5$/.test(m)) {
        return "🕐 **Hospital Working Hours**\n\n🏥 **OPD (Outpatient):** Mon–Sat, **9:00 AM – 8:00 PM**\n🚑 **Emergency:** **24/7** (All days)\n💊 **Pharmacy:** Mon–Sat, **9:00 AM – 10:00 PM**\n🧪 **Lab & Diagnostics:** Mon–Sat, **8:00 AM – 6:00 PM**\n📋 **Reception/Registration:** Mon–Sat, **8:00 AM – 7:00 PM**\n\n🔴 **Sunday:** Only Emergency services available.";
    }
    if (/^6$/.test(m)) {
        return "🧪 **Lab Tests & Reports**\n\n**To Book a Lab Test:**\n1. Visit the hospital **Lab Counter** or call reception\n2. Get a doctor's prescription if required\n3. Walk-in tests available for basic checkups\n\n**To Download Reports:**\n1. Go to your **Patient Dashboard**\n2. Navigate to **Reports Section**\n3. Click **Download** on available reports\n\n📌 Reports are typically ready within **24–48 hours** after the test.\n\nNeed help with something specific?";
    }
    if (/^7$/.test(m)) {
        return "💳 **Insurance & Billing Information**\n\n✅ We accept all **major insurance providers**\n✅ **Cashless facility** available at reception\n✅ Bring your **insurance card & ID proof**\n\n**Billing Enquiry:**\n📞 Call: +91-911-000-111\n📧 Email: billing@medicare.com\n\n**Accepted Insurers:** Star Health, HDFC Ergo, ICICI Lombard, Max Bupa, New India Assurance & more.\n\nFor detailed billing, please visit the **Billing Counter** on Ground Floor.";
    }
    if (/^8$/.test(m)) {
        return "📞 **Talk to Support**\n\n🔹 **Phone:** +91-911-000-000\n🔹 **Email:** support@medicare.com\n🔹 **WhatsApp:** +91-911-000-222\n🔹 **Working Hours:** Mon–Sat, 9AM–7PM\n\nOur support team will assist you with appointments, billing, reports, and any other queries.\n\nWould you like help with anything else?";
    }

    // ── Serious symptoms detection ──
    if (SERIOUS.some(s => lo.includes(s))) {
        return "🚨 **This seems serious.** Please contact our emergency number immediately or visit the nearest hospital.\n\n📞 **Emergency:** +91-911-000-000\n🚑 **Ambulance:** +91-102\n\nDo not delay seeking medical help!";
    }

    // ── Medicine / diagnosis requests ──
    if (lo.includes("prescri") || lo.includes("diagnos") || lo.includes("what medicine") || lo.includes("which tablet") || lo.includes("what drug")) {
        return "I'm sorry, I'm unable to prescribe medicines or provide a medical diagnosis. Please consult with a qualified doctor. 👨‍⚕️\n\nWould you like me to help you **book an appointment**? Type **1** to get started!";
    }

    // ── Keyword-based fallback for hospital topics ──
    if (lo.includes("book") || lo.includes("appoint")) {
        return "To book an appointment, you can:\n1. Type **1** for guided booking\n2. Go to the **Book Appointment** page in the navigation bar\n\nBoth options let you choose your preferred doctor, date, and time! 📅";
    }
    if (lo.includes("doctor") || lo.includes("available")) {
        return "Type **2** to see our available doctors and their timings, or visit the **Doctors** page for real-time availability. 👨‍⚕️";
    }
    if (lo.includes("department") || lo.includes("special") || lo.includes("service")) {
        return "Type **3** to see all our departments and services. We offer Cardiology, Orthopedics, Neurology, Pediatrics, and many more! 🏥";
    }
    if (lo.includes("emergency") || lo.includes("ambulance") || lo.includes("urgent")) {
        return "For emergencies, call **+91-911-000-000** or dial **102** for ambulance. Emergency department is open **24/7**. 🚨";
    }
    if (lo.includes("timing") || lo.includes("hour") || lo.includes("open") || lo.includes("opd")) {
        return "Type **5** for detailed hospital timings. OPD runs **Mon–Sat 9AM–8PM**, Emergency is **24/7**. 🕐";
    }
    if (lo.includes("lab") || lo.includes("report") || lo.includes("test")) {
        return "Type **6** for information on lab tests and how to download your reports from the Patient Dashboard. 🧪";
    }
    if (lo.includes("insurance") || lo.includes("billing") || lo.includes("payment") || lo.includes("cashless")) {
        return "Type **7** for insurance and billing details. We accept major insurance providers with cashless facility. 💳";
    }
    if (lo.includes("support") || lo.includes("contact") || lo.includes("help") || lo.includes("call") || lo.includes("email")) {
        return "Type **8** to get our support team's contact details including phone, email, and WhatsApp. 📞";
    }
    if (lo.includes("address") || lo.includes("location") || lo.includes("where")) {
        return "📍 We are located near **City Center Road, Main Market**. You can find our location on the Contact page.";
    }
    if (lo.includes("pharmacy") || lo.includes("medicine shop")) {
        return "💊 Our in-house pharmacy is open **Mon–Sat 9AM–10PM**. All prescribed medicines are available here.";
    }
    if (lo.includes("hello") || lo.includes("hi") || lo === "hey" || lo.includes("good morning") || lo.includes("good evening")) {
        return "Hello! 👋 Welcome to **Medicare Hospital Assistant**. How can I help you today?\n\nType a number (1-8) to explore our services, or simply type your question!";
    }
    if (lo.includes("thank")) {
        return "You're welcome! 😊 Stay healthy and take care. If you need anything else, I'm here to help!";
    }
    if (lo.includes("bye") || lo.includes("goodbye")) {
        return "Goodbye! 👋 Take care and stay healthy. Feel free to come back anytime you need help!";
    }
    if (lo.includes("menu") || lo.includes("option") || lo.includes("start")) {
        return WELCOME;
    }

    // ── Unrelated / unrecognized ──
    return "I'm here to help with **Medicare hospital services**. Please select an option from the menu or ask a hospital-related question. 🏥\n\nType **menu** to see all options again.";
}

export default function Chatbot() {
    const [open, so] = useState(false);
    const [msgs, sm] = useState([{ r: "a", c: WELCOME }]);
    const [inp, si] = useState("");
    const [ld, sl] = useState(false);
    const [unread, su] = useState(0);

    const endRef = useRef();
    const inpRef = useRef();

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs]);

    useEffect(() => {
        if (open) {
            su(0);
            setTimeout(() => inpRef.current?.focus(), 200);
        }
    }, [open]);

    const send = async (text) => {
        const msg = (text || inp).trim();
        if (!msg || ld) return;

        sm(m => [...m, { r: "u", c: msg }]);
        si("");
        sl(true);

        const reply = getReply(msg);

        // Typing delay for realism
        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));

        sm(m => [...m, { r: "a", c: reply }]);
        if (!open) su(u => u + 1);
        sl(false);
    };

    const fmt = c => c.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");

    return (
        <>
            {/* Floating Button */}
            <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 800 }}>
                {!open && unread > 0 && (
                    <div style={{
                        position: "absolute", top: -6, right: -6, width: 19, height: 19,
                        background: "#ef4444", borderRadius: "50%", color: "#fff",
                        fontSize: ".65rem", fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>{unread}</div>
                )}

                <button onClick={() => so(o => !o)}
                    style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: open ? "#424242" : "linear-gradient(135deg,var(--pm),var(--pl))",
                        color: "#fff", border: "none", cursor: "pointer",
                        boxShadow: "0 4px 20px rgba(0,0,0,.25)", fontSize: "1.45rem"
                    }}>
                    {open ? "✕" : "🤖"}
                </button>
            </div>

            {/* Chat Window */}
            {open && (
                <div style={{
                    position: "fixed", bottom: "5.5rem", right: "1.5rem", zIndex: 800,
                    width: 370, background: "#fff", borderRadius: 16,
                    boxShadow: "0 20px 60px rgba(0,0,0,.2)", border: "1.5px solid var(--g2)",
                    display: "flex", flexDirection: "column", height: 520
                }}>
                    {/* Header */}
                    <div style={{
                        padding: ".8rem 1rem", borderBottom: "1px solid #eee",
                        background: "linear-gradient(135deg,var(--pm),var(--pl))",
                        borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", gap: ".6rem"
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "rgba(255,255,255,.2)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem"
                        }}>👨‍⚕️</div>
                        <div>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: ".9rem" }}>Medicare Assistant</div>
                            <div style={{ color: "rgba(255,255,255,.8)", fontSize: ".7rem" }}>● Online — 24/7 Available</div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: ".875rem", display: "flex", flexDirection: "column", gap: ".6rem" }}>
                        {msgs.map((m, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: m.r === "u" ? "flex-end" : "flex-start" }}>
                                <div style={{
                                    maxWidth: "85%", padding: ".6rem .875rem",
                                    borderRadius: m.r === "u" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                                    background: m.r === "u" ? "linear-gradient(135deg,var(--pm),var(--pl))" : "#f5f5f5",
                                    color: m.r === "u" ? "#fff" : "#333",
                                    fontSize: ".83rem", lineHeight: 1.6
                                }}
                                    dangerouslySetInnerHTML={{ __html: fmt(m.c) }} />
                            </div>
                        ))}
                        {ld && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div style={{ padding: ".6rem .875rem", borderRadius: "14px 14px 14px 4px", background: "#f5f5f5", color: "#999", fontSize: ".83rem" }}>
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Quick Menu Buttons */}
                    <div style={{ padding: ".45rem .75rem", borderTop: "1px solid #eee", display: "flex", gap: ".3rem", overflowX: "auto" }}>
                        {MENU_OPTIONS.map((q, i) => (
                            <button key={q} onClick={() => send(String(i + 1))}
                                style={{
                                    flexShrink: 0, padding: ".25rem .6rem",
                                    background: "var(--pli)", color: "var(--pd)", border: "none",
                                    borderRadius: 99, fontSize: ".68rem", fontWeight: 600, cursor: "pointer"
                                }}>{q}</button>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{ padding: ".625rem .75rem", borderTop: "1px solid #eee", display: "flex", gap: ".5rem" }}>
                        <input
                            ref={inpRef}
                            style={{ flex: 1, padding: ".55rem .8rem", borderRadius: 99, border: "1px solid #ccc", fontFamily: "inherit", fontSize: ".85rem" }}
                            placeholder="Type a number or your question..."
                            value={inp}
                            onChange={e => si(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") send(); }}
                        />
                        <button onClick={() => send()}
                            style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: "linear-gradient(135deg,var(--pm),var(--pl))",
                                color: "#fff", border: "none", cursor: "pointer", fontSize: ".9rem"
                            }}>➤</button>
                    </div>
                </div>
            )}
        </>
    );
}
