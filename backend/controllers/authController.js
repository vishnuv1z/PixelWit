const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ message: "User Created" });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email already exists. Please login instead."
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Please fill all required fields correctly."
      });
    }

    res.status(500).json({
      message: "Something went wrong. Try again later."
    });
  }
};

exports.login = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password
  });

  if (!user)
    return res.status(400).json({ message: "Invalid Credentials" });

  res.json({ message: "Login Successful" });
};