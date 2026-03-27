const router = require("express").Router();
const { getSignature } = require("../controllers/uploadController");

// GET /api/upload/sign  — returns { signature, timestamp, folder, cloudName, apiKey }
router.get("/sign", getSignature);

module.exports = router;
