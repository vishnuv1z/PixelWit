const User = require("../models/User");
const Request = require("../models/Request");
const Review = require("../models/Review");

exports.getAnalytics = async (req, res) => {
  try {
    const [
      , // ignoring first result to avoid 'unused' lint error
      totalEditors,
      totalClients,
      completedRequests,
      activeRequests,
      reviews
    ] = await Promise.all([
      User.countDocuments({ role: "USER" }), // Assuming normal users or default
      User.countDocuments({ role: "EDITOR" }),
      User.countDocuments({ role: "CLIENT" }),
      Request.find({ status: "COMPLETED" }).populate("editorId", "name"),
      Request.find({ status: { $in: ["ACCEPTED", "NEGOTIATED", "IN_PROGRESS", "DELIVERED"] } }),
      Review.find()
    ]);

    // Alternatively, if "USER" role isn't used and they are just EDITORS/CLIENTS:
    const allUsersCount = await User.countDocuments();

    // 1. Calculations from Completed Requests
    let totalRevenue = 0;
    const editorProjectCount = {};

    // Mock category counters since category isn't in Schema
    const projectCategories = {
      photoEditing: 0,
      videoEditing: 0,
      thumbnails: 0,
      reels: 0
    };

    completedRequests.forEach(req => {
      // Revenue
      const price = req.negotiatedBudget || req.proposedBudget || 0;
      totalRevenue += price;

      // Editor Project Count for top editors
      if (req.editorId) {
        const edIdStr = req.editorId._id.toString();
        if (!editorProjectCount[edIdStr]) {
          editorProjectCount[edIdStr] = {
            _id: edIdStr,
            name: req.editorId.name,
            projects: 0
          };
        }
        editorProjectCount[edIdStr].projects += 1;
      }

      // Infer categories loosely from title (fallback to general distribution if not obvious).
      // We do this to replace the mock data with somewhat dynamic data.
      const title = (req.title || "").toLowerCase();
      if (title.includes("photo") || title.includes("image") || title.includes("pic")) {
        projectCategories.photoEditing += 1;
      } else if (title.includes("thumbnail") || title.includes("thumb")) {
        projectCategories.thumbnails += 1;
      } else if (title.includes("reel") || title.includes("short") || title.includes("tiktok")) {
        projectCategories.reels += 1;
      } else {
        projectCategories.videoEditing += 1; // Default fallback category
      }
    });

    const platformProfit = totalRevenue * 0.10;
    const editorEarnings = totalRevenue * 0.90;

    // Sort Top Editors
    const topEditors = Object.values(editorProjectCount)
      .sort((a, b) => b.projects - a.projects)
      .slice(0, 3);

    // 2. Reviews Average
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0);
      averageRating = (totalRating / reviews.length).toFixed(1);
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers: allUsersCount,
        totalEditors,
        totalClients,
        completedProjects: completedRequests.length,
        projectCategories,
        totalRevenue,
        editorEarnings,
        platformProfit,
        topEditors,
        activeProjects: activeRequests.length,
        averageRating: Number(averageRating)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error fetching analytics" });
  }
};
