const router = require("express").Router();
const ctrl   = require("../controllers/requestController");

router.post("/",                 ctrl.createRequest);
router.get("/client/:clientId",  ctrl.getClientRequests);
router.get("/editor/:editorId",  ctrl.getEditorRequests);
router.get("/:id",               ctrl.getRequest);
router.put("/:id",               ctrl.updateStatus);
router.patch("/:id/edit",        ctrl.editRequest);
router.delete("/:id",            ctrl.deleteRequest);

router.post("/:id/deliverables", ctrl.saveDeliverable);
router.get("/:id/deliverables",  ctrl.getDeliverables);

module.exports = router;
