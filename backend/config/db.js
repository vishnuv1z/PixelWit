const mongoose = require("mongoose");

const connectDB = async () => {
  try {

    await mongoose.connect("mongodb://127.0.0.1:27017/pixelwit");

    console.log("MongoDB connected");

  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;