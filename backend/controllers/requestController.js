const Request = require("../models/Request");

exports.createRequest = async (req, res) => {
  try {
    const request = await Request.create(req.body);
    res.json(request);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getClientRequests = async (req, res) => {
  try {
    const requests = await Request.find({ clientId: req.params.clientId })
      .populate("editorId", "name profilePhoto");
    res.json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getEditorRequests = async (req, res) => {
  try {
    // Populate clientId so frontend can display client name
    const requests = await Request.find({ editorId: req.params.editorId })
      .populate("clientId", "name");
    res.json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("editorId", "name profilePhoto");
    res.json(request);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(request);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.editRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "PENDING_QUOTE") {
      return res.status(400).json({ message: "Only pending requests can be edited." });
    }

    const allowed = ['title', 'description', 'proposedBudget', 'deadline', 'attachments'];
    allowed.forEach(k => { if (req.body[k] !== undefined) request[k] = req.body[k]; });

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.saveDeliverable = async (req, res) => {
  try {
    const { url, publicId, originalName, fileType, uploadedBy } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.deliverables.push({ url, publicId, originalName, fileType, uploadedBy });
    if (request.status === "IN_PROGRESS") request.status = "DELIVERED";

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

exports.getDeliverables = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("deliverables.uploadedBy", "name role");
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request.deliverables);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
