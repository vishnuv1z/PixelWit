const User = require("../models/User");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing =
      await User.findOne({ email });

    if (existing)
      return res.status(400).json({
        message: "Email already registered"
      });

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.json({
      message: "Account created successfully",
      user
    });

  } catch (err) {
    res.status(500).json(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (user.password !== password)
      return res.status(400).json({ message: "Invalid password" });

    res.json({
      message: "Login successful",
      user
    });

  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getEditors = async (req, res) => {
  try {
    const editors = await User.find({ role: "EDITOR" });
    res.json(editors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch editors" });
  }
};