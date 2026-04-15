const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 },
        phone: { type: String, default: "" },
        phoneVerified: { type: Boolean, default: false },
        idNumber: { type: String, unique: true, sparse: true, trim: true },
        dob: { type: String, default: "" },
        gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
        blood: { type: String, default: "" },
        role: { type: String, enum: ["patient", "admin"], default: "patient" },
        resetPasswordToken: { type: String },
        resetPasswordExpire: { type: Date },
        phoneOtp: { type: String },
        phoneOtpExpire: { type: Date },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
