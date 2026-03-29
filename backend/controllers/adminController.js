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

// ==========================================
// USER MANAGEMENT ENDPOINTS
// ==========================================

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    
    // Enrich editors with live rating + reviewCount from the Review collection
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        if (user.role === 'EDITOR') {
          const reviews = await Review.find({ editorId: user._id });
          const reviewCount = reviews.length;
          const rating = reviewCount
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
            : 0;
          return { ...user, rating, reviewCount };
        }
        return user;
      })
    );

    res.json({ success: true, data: enrichedUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    // Check if email is being updated to an existing email
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: id } });
      if (existing) return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { name, email, role } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, data: updatedUser, message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating user" });
  }
};

exports.toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ 
      success: true, 
      message: `User successfully ${user.isBlocked ? 'blocked' : 'unblocked'}` 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error toggling block status" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Optionally cleanup references like Reviews, Requests if we want to be thorough,
    // but a simple delete is standard unless constrained by foreign key concepts in Mongoose.

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};
