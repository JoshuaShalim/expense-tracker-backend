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

const upload = multer({ storage, fileFilter });

module.exports = { upload };
