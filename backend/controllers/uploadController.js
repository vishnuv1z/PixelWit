const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getSignature = (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder    = req.query.folder === 'attachments'
      ? 'pixelwit_attachments'
      : 'pixelwit_deliverables';

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey:    process.env.CLOUDINARY_API_KEY
    });
  } catch (err) {
    res.status(500).json({ message: "Could not generate upload signature" });
  }
};
