const router   = require("express").Router();
const userCtrl = require("../controllers/userController");

router.post("/signup",   userCtrl.signup);
router.post("/login",    userCtrl.login);
router.put("/:id",       userCtrl.updateProfile);
router.delete("/:id",    userCtrl.deleteAccount);

/* GET ALL EDITORS — rating/reviewCount enriched live from Review collection */
router.get("/editors", userCtrl.getEditors);

/* GET ONE EDITOR */
const User = require("../models/User");
const Review = require("../models/Review");

router.get("/editors/:id", async (req, res) => {
  try {
    const editor = await User.findById(req.params.id).lean();
    if (!editor) return res.status(404).json({ message: "Editor not found" });

    // Enrich with live rating + reviewCount
    const reviews = await Review.find({ editorId: editor._id });
    const reviewCount = reviews.length;
    const rating = reviewCount
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

    res.json({ ...editor, rating, reviewCount });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
