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

// Upload image to Cloudinary (Serverless Compatible)
router.post("/upload-img", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image upload failed" });
        }

        // Upload to Cloudinary using buffer stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "expense-tracker",
                resource_type: "auto",
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ message: "Cloudinary upload failed" });
                }

                res.status(200).json({
                    message: "Image uploaded successfully",
                    imageUrl: result.secure_url,
                });
            }
        );

        // Stream the buffer to Cloudinary
        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Image upload failed" });
    }
});

module.exports = router;
