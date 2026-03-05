const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["CLIENT", "EDITOR", "ADMIN"]
  },

  about: String,
  description: String,

  skills: [String],

  hourlyRate: Number,
  availability: String,
  profilePhoto: String,

  portfolio: [
    {
      type: {
        type: String
      },
      src: String
    }
  ],

  reviews: [
    {
      clientName: String,
      rating: Number,
      comment: String
    }
  ],

  rating: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);