const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const cloudinary = require("../config/cloudinary");

const {
  registerUser,
  loginUser,
  getUserInfo,
} = require("../controllers/authController");

const { upload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/getUser", protect, getUserInfo);

router.post("/upload-img", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image file provided",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "expense-tracker",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    res.status(200).json({
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Image upload failed",
    });
  }
});

module.exports = router;
