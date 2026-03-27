const mongoose = require("mongoose");

const editorSchema = new mongoose.Schema({

  name: String,
  email: String,
  password: String,
  role: String,

  about: String,
  description: String,

  hourlyRate: Number,
  availability: String,

  skills: [String],

  profilePhoto: String,

  rating: {
    type: Number,
    default: 0
  },

  reviews: [
    {
      clientName: String,
      rating: Number,
      comment: String
    }
  ],

  portfolio: [
    {
      type: {
        type: String
      },
      src: String
    }
  ]

});

module.exports = mongoose.model("Editor", editorSchema);