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
            return res.status(400).json({ message: "No image file provided" });
        }

        // Validate file size (double-check)
        const maxSize = 4 * 1024 * 1024; // 4MB
        if (req.file.size > maxSize) {
            return res.status(413).json({ message: "File too large. Max 4MB allowed" });
        }

        // Create upload promise with timeout
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "expense-tracker",
                    resource_type: "auto",
                    timeout: 10000, // 10s timeout for Cloudinary
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            // Handle stream errors
            uploadStream.on("error", reject);
            
            // End the stream with the buffer
            uploadStream.end(req.file.buffer);
        });

        // Race between upload and timeout
        const result = await Promise.race([
            uploadPromise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Upload timeout")), 8000)
            )
        ]);

        res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url,
        });
    } catch (error) {
        console.error("Upload error:", error.message);
        
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ message: "File too large. Max 4MB allowed" });
        }
        
        if (error.message === "Upload timeout") {
            return res.status(504).json({ message: "Upload timed out. Please try again" });
        }
        
        res.status(500).json({ message: "Image upload failed" });
    }
});

module.exports = router;
