const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  editorId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientName: { type: String, required: true },
  requestId:  { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);