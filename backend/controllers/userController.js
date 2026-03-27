const User   = require("../models/User");
const Review = require("../models/Review");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password, role });
    res.json({ message: "Account created successfully", user });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.password !== password) return res.status(400).json({ message: "Invalid password" });
    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getEditors = async (req, res) => {
  try {
    const editors = await User.find({ role: "EDITOR" }).lean();

    // Enrich each editor with live rating + reviewCount from the Review collection
    const enriched = await Promise.all(
      editors.map(async (editor) => {
        const reviews = await Review.find({ editorId: editor._id });
        const reviewCount = reviews.length;
        const rating = reviewCount
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
          : 0;
        return { ...editor, rating, reviewCount };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch editors" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let id = req.params.id;
    if (id && typeof id === 'object' && id.$oid) id = id.$oid;
    id = String(id).trim();

    const allowed = ['name','about','description','hourlyRate','availability','profilePhoto','skills','isProfileComplete'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: false });
    if (!user) return res.status(404).json({ message: `User not found (id: ${id})` });

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed" });
  }
};
