const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    branchName: { type: String, required: true },
    reviewerName: { type: String, default: "Anonymous" },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, required: true },

    // Populated by NLP/AI layer or manually tagged
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      required: true,
    },

    // e.g. ["service", "food", "cleanliness", "ambiance", "wait_time"]
    category: [{ type: String }],

    // Staff names mentioned in review
    staffMentioned: [{ type: String }],

    // Time context
    visitTime: {
      dayOfWeek: { type: String }, // "Monday", "Saturday", etc.
      timeSlot: { type: String },  // "morning", "afternoon", "evening", "night"
      date: { type: Date },
    },

    // Keywords extracted from review text
    keywords: [{ type: String }],

    source: { type: String, default: "manual" }, // "google", "zomato", "manual"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);