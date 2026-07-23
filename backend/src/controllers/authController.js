import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import LoginHistory from "../models/LoginHistory.js";

// REGISTER
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json("Name, email, password and phone are required");
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json("User already exists");

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed,
            phone,
            role
        });

        res.json("User registered successfully");

    } catch (err) {
        res.status(500).json(err.message);
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Wrong password" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Customer-க்கு login history skip பண்ணலாம் — CRM-ல் காட்ட வேண்டாம்
        if (user.role !== "customer") {
            await LoginHistory.create({
                userId: user._id,
                email: user.email,
                role: user.role
            });
        }

        // name add பண்ணினோம் — CustomerLogin.jsx-ல் customerName-க்கு use ஆகும்
        res.json({ token, role: user.role, name: user.name });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};