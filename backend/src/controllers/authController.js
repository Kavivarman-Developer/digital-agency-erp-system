const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const LoginHistory = require("../models/LoginHistory");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // ✅ VALIDATION: phone is required for WhatsApp notifications
        if (!name || !email || !password || !phone) {
            return res.status(400).json("Name, email, password and phone are required");
        }

        // check existing user
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json("User already exists");

        // hash password
        const hashed = await bcrypt.hash(password, 10);

        // create user with phone field included
        const user = await User.create({
            name,
            email,
            password: hashed,
            phone, // ✅ SAVE: Store user phone for WhatsApp
            role
        });

        res.json("User registered successfully");

    } catch (err) {
        res.status(500).json(err.message);
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json("User not found");

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json("Wrong password");

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        await LoginHistory.create({
            userId: user._id,
            email: user.email,
            role: user.role
        });

        res.json({
            token,
            role: user.role
        });

    } catch (err) {
        res.status(500).json(err.message);
    }
};