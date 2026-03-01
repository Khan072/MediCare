import axios from "axios";

const API = axios.create({
    baseURL: "https://medicare-m3a0.onrender.com/api",
});

// Attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("medicare_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Auth ──
export const loginUser = (data) => API.post("/auth/login", data);
export const signupUser = (data) => API.post("/auth/signup", data);
export const getMe = () => API.get("/auth/me");
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);

// ── Doctors ──
export const getDoctors = () => API.get("/doctors");
export const getDoctor = (id) => API.get(`/doctors/${id}`);

// ── Appointments ──
export const getAppointments = () => API.get("/appointments");
export const getAppointment = (id) => API.get(`/appointments/${id}`);
export const bookAppointment = (data) => API.post("/appointments", data);
export const updateAppointmentStatus = (id, status) =>
    API.put(`/appointments/${id}/status`, { status });

// ── Users ──
export const getProfile = () => API.get("/users/profile");
export const updateProfile = (data) => API.put("/users/profile", data);
export const getPatientCount = () => API.get("/users/count");

// ── Payment ──
export const createPaymentIntent = (data) => API.post("/payment/create-intent", data);
export const verifyPayment = (data) => API.post("/payment/verify", data);
export const getStripeConfig = () => API.get("/payment/config");

// ── Reports ──
export const uploadReport = (formData) =>
    API.post("/reports/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const getMyReports = () => API.get("/reports");
export const getAllReports = () => API.get("/reports/admin");
export const downloadReport = (id) =>
    API.get(`/reports/download/${id}`, { responseType: "blob" });

// ── Doctor Performance ──
export const getDoctorPerformance = () => API.get("/appointments/doctor-performance");

// ── Blogs ──
export const getBlogs = () => API.get("/blogs");
export const getBlog = (id) => API.get(`/blogs/${id}`);
export const getAdminBlogs = () => API.get("/blogs/admin");
export const createBlog = (data) => API.post("/blogs", data);
export const updateBlog = (id, data) => API.put(`/blogs/${id}`, data);
export const deleteBlog = (id) => API.delete(`/blogs/${id}`);

// ── Feedback ──
export const submitFeedback = (data) => API.post("/feedback", data);
export const getFeedbacks = () => API.get("/feedback");
export const getAllFeedbacks = () => API.get("/feedback/admin");
export const deleteFeedback = (id) => API.delete(`/feedback/${id}`);

export default API;
