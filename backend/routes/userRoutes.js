const router = require("express").Router();
const userCtrl =
require("../controllers/userController");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.get("/editors", userCtrl.getEditors);

module.exports = router;