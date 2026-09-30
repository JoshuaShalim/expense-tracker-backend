const User = require("../models/User");
const jwt = require("jsonwebtoken");
const connectDB = require("../config/db");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user) => ({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
});

// Generate a short-lived access token.
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//Register User 
exports.registerUser = async (req, res) => {
    const { fullName, email, password, profileImageUrl } = req.body;
    const normalizedName = fullName?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
        return res.status(400).json({ message: "Enter a valid email address" });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    try {
        // Ensure DB connection
        await connectDB();

        //Check if email already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        //Create User
        const user = await User.create({ 
            fullName: normalizedName,
            email: normalizedEmail,
            password, 
            profileImageUrl
        });

        res.status(201).json({ 
            user: publicUser(user),
            token: generateToken(user._id)
        });
    } catch (error) {
        res
        .status(500)
        .json({ message: "Error registering user", error: error.message });
    }
};

//Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        // Ensure DB connection
        await connectDB();

        const user = await User.findOne({ email: normalizedEmail }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        res.status(200).json({
            user: publicUser(user),
            token: generateToken(user._id)
        });
    } catch (error) {
        res
        .status(500)
        .json({ message: "Error logging in user", error: error.message });
    }
};

//Get User Info
exports.getUserInfo = async (req, res) => {
    try {
        // Ensure DB connection
        await connectDB();

        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res
        .status(500)
        .json({ message: "Error fetching user info", error: error.message });
    }
};
