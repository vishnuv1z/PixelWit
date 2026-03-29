const express = require("express");
const router = express.Router();
const { 
  getAnalytics, 
  getAllUsers, 
  updateUser, 
  toggleBlockUser, 
  deleteUser 
} = require("../controllers/adminController");

router.get("/analytics", getAnalytics);

// User Management Routes
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser); // update basic details/role
router.patch("/users/:id/block", toggleBlockUser); // block/unblock toggler
router.delete("/users/:id", deleteUser); // delete user

module.exports = router;
