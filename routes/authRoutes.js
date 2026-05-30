const express = require("express");
const router = express.Router();

router.get("/ping", (req, res) => {
    res.json({
        message: "auth route works."
    });
});

module.exports = router;
