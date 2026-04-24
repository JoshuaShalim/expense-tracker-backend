const multer = require("multer");

// Use Memory Storage (Serverless Friendly)
const storage = multer.memoryStorage();

// File Filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only jpeg, jpg and png format are allowed"), false);
    }
};

// Serverless-compatible upload config (4MB limit to stay under Vercel's 4.5MB)
const upload = multer({ 
    storage, 
    fileFilter,
    limits: {
        fileSize: 4 * 1024 * 1024 // 4MB limit
    }
});

module.exports = { upload };
