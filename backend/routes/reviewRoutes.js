const router = require("express").Router();
const ctrl   = require("../controllers/reviewController");

router.post("/",                    ctrl.createReview);
router.get("/editor/:editorId",     ctrl.getEditorReviews);

module.exports = router;