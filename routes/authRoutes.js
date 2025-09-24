const express = require("express");
const { protect } = require("../middleware/authMiddleware");

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

router.post("/upload-img", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Image upload failed" });
    } 
    
    // Construct URL safely using path.join for the path portion
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.status(200).json({ 
        message: "Image uploaded successfully", 
        imageUrl 
    });
});

module.exports = router;
