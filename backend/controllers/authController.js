const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ message: "User Created" });
  } catch (err) {
    res.status(400).json({ message: "User Already Exists" });
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