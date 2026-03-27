const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name:     String,
  email:    { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["CLIENT", "EDITOR", "ADMIN"]
  },

  about:        String,
  description:  String,
  skills:       [String],
  hourlyRate:   Number,
  availability: String,
  profilePhoto: String,

  portfolio: [
    {
      type: { type: String },
      src:  String
    }
  ],

  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  isProfileComplete: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);