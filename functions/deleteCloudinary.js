const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const cloudinary = require("cloudinary").v2;

// ================= CONFIG (USE ENV VARIABLES) =================
cloudinary.config({
  cloud_name: functions.config().cloudinary.cloud_name,
  api_key: functions.config().cloudinary.api_key,
  api_secret: functions.config().cloudinary.api_secret,
});

// ================= DELETE FUNCTION =================
exports.deleteCloudinary = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // 🔒 ONLY ALLOW POST
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          message: "Method not allowed",
        });
      }

      const { public_id } = req.body;

      if (!public_id) {
        return res.status(400).json({
          success: false,
          message: "Missing public_id",
        });
      }

      // 🔥 DELETE IMAGE
      const result = await cloudinary.uploader.destroy(public_id);

      if (result.result !== "ok" && result.result !== "not found") {
        return res.status(400).json({
          success: false,
          message: "Delete failed",
          result,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        result,
      });

    } catch (error) {
      console.error("Cloudinary delete error:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  });
});