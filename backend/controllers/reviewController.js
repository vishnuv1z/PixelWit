const Review  = require("../models/Review");
const Request = require("../models/Request");
const User    = require("../models/User");

/* POST /api/reviews */
exports.createReview = async (req, res) => {
  try {
    const { clientId, clientName, requestId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    const workRequest = await Request.findById(requestId);
    if (!workRequest)
      return res.status(404).json({ message: "Request not found" });
    if (workRequest.status !== "COMPLETED")
      return res.status(400).json({ message: "Can only review completed projects" });
    if (workRequest.clientId.toString() !== clientId.toString())
      return res.status(403).json({ message: "Not authorized to review this request" });
    if (workRequest.reviewed)
      return res.status(400).json({ message: "You have already reviewed this project" });

    // editorId comes from the request itself — no mismatch possible
    const editorId = workRequest.editorId;

    const review = await Review.create({ editorId, clientId, clientName, requestId, rating, comment });

    // Recalculate avg rating + count from reviews collection
    const allReviews = await Review.find({ editorId });
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(editorId, {
      rating:      Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    workRequest.reviewed = true;
    await workRequest.save();

    res.json({ message: "Review submitted successfully", review });
  } catch (err) {
    console.error("createReview error:", err);
    res.status(500).json({ message: err.message || "Failed to submit review" });
  }
};

/* GET /api/reviews/editor/:editorId */
exports.getEditorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ editorId: req.params.editorId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};