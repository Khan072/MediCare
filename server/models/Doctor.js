const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        spec: { type: String, required: true, trim: true },
        qual: { type: String, required: true, trim: true },
        exp: { type: Number, required: true },
        fee: { type: Number, required: true },
        rat: { type: Number, default: 4.5 },
        pts: { type: Number, default: 0 },
        bio: { type: String, default: "" },
        photo: { type: String, default: "" }, // filename in uploads/doctors/
        av: [
            {
                day: { type: String, required: true },
                sl: [String],
            },
        ],
    },
    { timestamps: true }
);

// Virtual 'id' field that maps to '_id' for backward compatibility
doctorSchema.set("toJSON", {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        return ret;
    },
});

module.exports = mongoose.model("Doctor", doctorSchema);
