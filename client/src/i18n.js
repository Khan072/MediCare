// Lightweight i18n system for MediCare
// Supports English (en) and Arabic (ar)

const translations = {
    en: {
        // Navbar
        "nav.home": "Home",
        "nav.doctors": "Doctors",
        "nav.book": "Book Appointment",
        "nav.blog": "Health Blog",
        "nav.feedback": "Feedback",
        "nav.chat": "AI Assistant",
        "nav.dash": "Dashboard",
        "nav.admin": "Admin",
        "nav.profile": "Profile",
        "nav.login": "Login",
        "nav.signup": "Sign Up",
        "nav.logout": "Logout",

        // Login
        "login.title": "Login",
        "login.welcome": "Welcome Back!",
        "login.subtitle": "Enter your credentials to continue",
        "login.identifier": "Email / Mobile / ID Number",
        "login.identifier_placeholder": "Email, phone, or ID number",
        "login.password": "Password",
        "login.password_placeholder": "Your password",
        "login.forgot": "Forgot Password?",
        "login.submit": "Login",
        "login.logging_in": "Logging in...",
        "login.no_account": "No account?",
        "login.signup_link": "Sign Up",
        "login.back": "← Back to Home",
        "login.demo": "Demo Admin:",
        "login.manage": "Manage appointments and get 24/7 AI health support.",
        "login.secure": "✅ Secure Health Records",
        "login.manage_apt": "📅 Manage Appointments",
        "login.ai": "🤖 24/7 AI Assistant",
        "login.error_credentials": "Invalid credentials. Please check your email/phone/ID and password.",

        // Signup
        "signup.title": "Create Account",
        "signup.join": "Join MediCare!",
        "signup.subtitle_free": "Free account · 500+ specialists · 24/7 AI support.",
        "signup.step1": "Step 1: Account credentials",
        "signup.step2": "Step 2: Personal information",
        "signup.name": "Full Name",
        "signup.name_placeholder": "John Doe",
        "signup.email": "Email",
        "signup.email_placeholder": "john@example.com",
        "signup.password": "Password",
        "signup.password_min": "Min 6 chars",
        "signup.confirm": "Confirm",
        "signup.confirm_placeholder": "Repeat",
        "signup.next": "Next Step →",
        "signup.phone": "Phone (10 digits)",
        "signup.phone_placeholder": "9876543210",
        "signup.dob": "Date of Birth",
        "signup.gender": "Gender",
        "signup.gender_select": "Select",
        "signup.gender_male": "Male",
        "signup.gender_female": "Female",
        "signup.gender_other": "Other",
        "signup.blood": "Blood Group",
        "signup.blood_optional": "Optional",
        "signup.id_number": "ID Number (Optional)",
        "signup.id_placeholder": "National/Iqama ID",
        "signup.back": "← Back",
        "signup.submit": "Create Account",
        "signup.creating": "Creating...",
        "signup.have_account": "Have account?",
        "signup.login_link": "Login",
        "signup.send_otp": "Send OTP",
        "signup.sending_otp": "Sending...",
        "signup.verify_otp": "Verify",
        "signup.verifying": "Verifying...",
        "signup.enter_otp": "Enter OTP",
        "signup.otp_sent": "OTP sent to your email",
        "signup.phone_verified": "✅ Phone verified",
        "signup.access": "🏥 Access Top Specialists",
        "signup.records": "📱 Digital Health Records",
        "signup.secure": "🔒 Secure & Private",

        // Validation messages
        "val.name_required": "Full name is required",
        "val.email_invalid": "Please enter a valid email address (e.g. name@example.com)",
        "val.password_min": "Password must be at least 6 characters",
        "val.password_match": "Passwords don't match",
        "val.phone_invalid": "Please enter a valid 10-digit mobile number",
        "val.dob_required": "Date of birth is required",
        "val.gender_required": "Please select your gender",
        "val.reason_required": "Please describe your reason for visit",
        "val.slot_required": "Please select a time slot",
        "val.date_required": "Please select a date",

        // Book
        "book.step1": "1. Choose Doctor",
        "book.step2": "2. Date & Slot",
        "book.step3": "3. Confirm",
        "book.find_doctor": "Find Your Doctor",
        "book.browse": "Browse our verified specialists",
        "book.search": "🔍 Search doctors...",
        "book.all": "All",
        "book.select_date_time": "Select Date & Time →",
        "book.consultation": "consultation",
        "book.back": "← Back",
        "book.login_to_book": "Please",
        "book.login_link": "login",
        "book.to_book": "to book.",
        "book.select_date": "📅 Select Date",
        "book.apt_date": "Appointment Date",
        "book.no_slots": "No slots on",
        "book.try_another": ". Please try another date.",
        "book.available_slots": "Available Time Slots",
        "book.morning": "🌅 Morning",
        "book.evening": "🌙 Evening",
        "book.visit_details": "📝 Visit Details",
        "book.reason": "Reason for Visit *",
        "book.reason_placeholder": "Describe your health concern...",
        "book.symptoms": "Symptoms (comma-separated, optional)",
        "book.symptoms_placeholder": "fever, headache, fatigue",
        "book.summary": "Booking Summary",
        "book.doctor": "Doctor",
        "book.date": "Date",
        "book.time": "Time",
        "book.fee": "Fee",
        "book.pay_now": "💳 Pay Now",
        "book.pay_later": "🏥 Pay Later",
        "book.or": "or",
        "book.booking": "Booking...",
        "book.login_btn": "Login to Book",
        "book.pay_later_info": "Pay Later — pay at the hospital reception on your visit day",
        "book.booked": "Booked",
        "book.qual": "Qual.",
        "book.exp": "Exp.",
        "book.rating": "Rating",
        "book.years": "years",
        "book.yr_exp": "yr exp",
        "book.available": "Available",
        "book.unavailable": "Unavailable",

        // Home
        "home.hero_title": "Your Health, Our Priority",
        "home.hero_sub": "Book appointments with top specialists in seconds",

        // Dashboard
        "dash.title": "My Dashboard",
        "dash.appointments": "My Appointments",

        // Common
        "common.loading": "Loading...",
        "common.error": "Something went wrong",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.delete": "Delete",
        "common.edit": "Edit",
        "common.confirm": "Confirm",
        "common.currency_symbol": "₹",
    },
    ar: {
        // Navbar
        "nav.home": "الرئيسية",
        "nav.doctors": "الأطباء",
        "nav.book": "حجز موعد",
        "nav.blog": "المدونة الصحية",
        "nav.feedback": "التقييم",
        "nav.chat": "المساعد الذكي",
        "nav.dash": "لوحة التحكم",
        "nav.admin": "الإدارة",
        "nav.profile": "الملف الشخصي",
        "nav.login": "تسجيل الدخول",
        "nav.signup": "إنشاء حساب",
        "nav.logout": "تسجيل الخروج",

        // Login
        "login.title": "تسجيل الدخول",
        "login.welcome": "!مرحباً بعودتك",
        "login.subtitle": "أدخل بياناتك للمتابعة",
        "login.identifier": "البريد / الجوال / رقم الهوية",
        "login.identifier_placeholder": "البريد أو الجوال أو رقم الهوية",
        "login.password": "كلمة المرور",
        "login.password_placeholder": "كلمة المرور الخاصة بك",
        "login.forgot": "نسيت كلمة المرور؟",
        "login.submit": "تسجيل الدخول",
        "login.logging_in": "جاري الدخول...",
        "login.no_account": "ليس لديك حساب؟",
        "login.signup_link": "إنشاء حساب",
        "login.back": "→ العودة للرئيسية",
        "login.demo": ":حساب تجريبي",
        "login.manage": "إدارة المواعيد والحصول على دعم صحي بالذكاء الاصطناعي على مدار الساعة.",
        "login.secure": "✅ سجلات صحية آمنة",
        "login.manage_apt": "📅 إدارة المواعيد",
        "login.ai": "🤖 مساعد ذكي على مدار الساعة",
        "login.error_credentials": "بيانات غير صحيحة. يرجى التحقق من البريد/الجوال/الهوية وكلمة المرور.",

        // Signup
        "signup.title": "إنشاء حساب",
        "signup.join": "!انضم إلى ميدي كير",
        "signup.subtitle_free": "حساب مجاني · +500 متخصص · دعم ذكي على مدار الساعة.",
        "signup.step1": "الخطوة 1: بيانات الحساب",
        "signup.step2": "الخطوة 2: المعلومات الشخصية",
        "signup.name": "الاسم الكامل",
        "signup.name_placeholder": "محمد أحمد",
        "signup.email": "البريد الإلكتروني",
        "signup.email_placeholder": "ahmed@example.com",
        "signup.password": "كلمة المرور",
        "signup.password_min": "٦ أحرف على الأقل",
        "signup.confirm": "تأكيد",
        "signup.confirm_placeholder": "أعد كتابتها",
        "signup.next": "← الخطوة التالية",
        "signup.phone": "الجوال (١٠ أرقام)",
        "signup.phone_placeholder": "9876543210",
        "signup.dob": "تاريخ الميلاد",
        "signup.gender": "الجنس",
        "signup.gender_select": "اختر",
        "signup.gender_male": "ذكر",
        "signup.gender_female": "أنثى",
        "signup.gender_other": "آخر",
        "signup.blood": "فصيلة الدم",
        "signup.blood_optional": "اختياري",
        "signup.id_number": "رقم الهوية (اختياري)",
        "signup.id_placeholder": "الهوية الوطنية / الإقامة",
        "signup.back": "→ رجوع",
        "signup.submit": "إنشاء الحساب",
        "signup.creating": "جاري الإنشاء...",
        "signup.have_account": "لديك حساب؟",
        "signup.login_link": "تسجيل الدخول",
        "signup.send_otp": "إرسال رمز",
        "signup.sending_otp": "جاري الإرسال...",
        "signup.verify_otp": "تحقق",
        "signup.verifying": "جاري التحقق...",
        "signup.enter_otp": "أدخل الرمز",
        "signup.otp_sent": "تم إرسال الرمز إلى بريدك",
        "signup.phone_verified": "✅ تم التحقق من الجوال",
        "signup.access": "🏥 أفضل المتخصصين",
        "signup.records": "📱 سجلات صحية رقمية",
        "signup.secure": "🔒 آمن وخاص",

        // Validation
        "val.name_required": "الاسم الكامل مطلوب",
        "val.email_invalid": "يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)",
        "val.password_min": "كلمة المرور يجب أن تتكون من ٦ أحرف على الأقل",
        "val.password_match": "كلمتا المرور غير متطابقتين",
        "val.phone_invalid": "يرجى إدخال رقم جوال صحيح من ١٠ أرقام",
        "val.dob_required": "تاريخ الميلاد مطلوب",
        "val.gender_required": "يرجى اختيار الجنس",
        "val.reason_required": "يرجى وصف سبب الزيارة",
        "val.slot_required": "يرجى اختيار وقت",
        "val.date_required": "يرجى اختيار تاريخ",

        // Book
        "book.step1": "١. اختيار الطبيب",
        "book.step2": "٢. التاريخ والوقت",
        "book.step3": "٣. التأكيد",
        "book.find_doctor": "ابحث عن طبيبك",
        "book.browse": "تصفح أطباءنا المعتمدين",
        "book.search": "🔍 ابحث عن طبيب...",
        "book.all": "الكل",
        "book.select_date_time": "← اختر التاريخ والوقت",
        "book.consultation": "استشارة",
        "book.back": "→ رجوع",
        "book.login_to_book": "يرجى",
        "book.login_link": "تسجيل الدخول",
        "book.to_book": "للحجز.",
        "book.select_date": "📅 اختر التاريخ",
        "book.apt_date": "تاريخ الموعد",
        "book.no_slots": "لا توجد مواعيد في",
        "book.try_another": ". يرجى تجربة تاريخ آخر.",
        "book.available_slots": "المواعيد المتاحة",
        "book.morning": "🌅 صباحاً",
        "book.evening": "🌙 مساءً",
        "book.visit_details": "📝 تفاصيل الزيارة",
        "book.reason": "سبب الزيارة *",
        "book.reason_placeholder": "صِف مشكلتك الصحية...",
        "book.symptoms": "الأعراض (مفصولة بفواصل، اختياري)",
        "book.symptoms_placeholder": "حمى، صداع، إرهاق",
        "book.summary": "ملخص الحجز",
        "book.doctor": "الطبيب",
        "book.date": "التاريخ",
        "book.time": "الوقت",
        "book.fee": "الرسوم",
        "book.pay_now": "💳 ادفع الآن",
        "book.pay_later": "🏥 الدفع لاحقاً",
        "book.or": "أو",
        "book.booking": "جاري الحجز...",
        "book.login_btn": "سجل الدخول للحجز",
        "book.pay_later_info": "الدفع لاحقاً — ادفع في استقبال المستشفى يوم الزيارة",
        "book.booked": "محجوز",
        "book.qual": "المؤهل",
        "book.exp": "الخبرة",
        "book.rating": "التقييم",
        "book.years": "سنوات",
        "book.yr_exp": "سنة خبرة",
        "book.available": "متاح",
        "book.unavailable": "غير متاح",

        // Home
        "home.hero_title": "صحتك أولويتنا",
        "home.hero_sub": "احجز مواعيد مع أفضل المتخصصين في ثوانٍ",

        // Dashboard
        "dash.title": "لوحة التحكم",
        "dash.appointments": "مواعيدي",

        // Common
        "common.loading": "جاري التحميل...",
        "common.error": "حدث خطأ",
        "common.save": "حفظ",
        "common.cancel": "إلغاء",
        "common.delete": "حذف",
        "common.edit": "تعديل",
        "common.confirm": "تأكيد",
        "common.currency_symbol": "₹",
    },
};

// Get/set language
export function getLang() {
    return localStorage.getItem("medicare_lang") || "en";
}

export function setLang(lang) {
    localStorage.setItem("medicare_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
}

// Translate function
export function t(key) {
    const lang = getLang();
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
}

// Currency helper — keeps fees in INR, displays with appropriate symbol
const CURRENCY_RATES = { inr: 1, usd: 0.012, sar: 0.045, aed: 0.044, egp: 0.37, eur: 0.011, gbp: 0.0095 };
const CURRENCY_SYMBOLS = { inr: "₹", usd: "$", sar: "﷼", aed: "د.إ", egp: "ج.م", eur: "€", gbp: "£" };

export function getCurrency() {
    return localStorage.getItem("medicare_currency") || "inr";
}

export function setCurrency(cur) {
    localStorage.setItem("medicare_currency", cur);
}

export function formatPrice(amountInINR) {
    const cur = getCurrency();
    const rate = CURRENCY_RATES[cur] || 1;
    const symbol = CURRENCY_SYMBOLS[cur] || "₹";
    const converted = Math.round(amountInINR * rate * 100) / 100;
    return `${symbol}${converted}`;
}

export function getConvertedAmount(amountInINR) {
    const cur = getCurrency();
    const rate = CURRENCY_RATES[cur] || 1;
    return Math.round(amountInINR * rate * 100) / 100;
}

// Initialize direction on load
if (typeof window !== "undefined") {
    const lang = getLang();
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
}
