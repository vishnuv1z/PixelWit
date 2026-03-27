const mongoose = require("mongoose");

const DeliverableSchema = new mongoose.Schema({
  url:          { type: String, required: true },
  publicId:     String,
  originalName: String,
  fileType:     String,
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadedAt:   { type: Date, default: Date.now }
});

const RequestSchema = new mongoose.Schema({
  title:       String,
  description: String,

  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  editorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  proposedBudget:   Number,
  negotiatedBudget: Number,
  editorNote:       String,

  status: {
    type: String,
    enum: ["PENDING_QUOTE","ACCEPTED","NEGOTIATED","IN_PROGRESS","REJECTED","DELIVERED","COMPLETED"],
    default: "PENDING_QUOTE"
  },

  attachments:  [String],
  deadline:     String,
  deliverables: [DeliverableSchema],

  reviewed: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("Request", RequestSchema);