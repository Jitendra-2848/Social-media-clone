const cloudinary = require("../middleware/cloudinary");

const uploadImage = async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Upload base64 image to Cloudinary
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "linkedin-clone",
      resource_type: "auto",
    });

    res.status(200).json({
      message: "Image uploaded successfully",
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};

module.exports = { uploadImage };