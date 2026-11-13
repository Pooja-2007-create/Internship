const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const LoginHistory = require("../models/login");
const User = require("../models/user");

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).select(
            "+passwordHash"
        );

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({
                message: "Email or password is incorrect",
            });
        }

        await LoginHistory.create({ email: user.email });
        return res.status(200).json({
            message: "Login successful",
        });
    } catch (error) {
        console.error("Login request failed:", error.message);
        return res.status(500).json({
            message: "Unable to process login right now",
        });
    }
});

router.put("/update-password", async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof oldPassword !== "string" ||
            !oldPassword ||
            typeof newPassword !== "string" ||
            !newPassword
        ) {
            return res.status(400).json({
                message: "Email, old password, and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).select(
            "+passwordHash"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isOldPasswordValid = await bcrypt.compare(
            oldPassword,
            user.passwordHash
        );

        if (!isOldPasswordValid) {
            return res.status(401).json({
                message: "Old password is incorrect",
            });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("Password update failed:", error.message);
        return res.status(500).json({
            message: "Unable to update password right now",
        });
    }
});

router.get("/total-logins", async (req, res) => {
    try {
        const loginsByEmail = await LoginHistory.aggregate([
            {
                $group: {
                    _id: "$email",
                    loginCount: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    email: "$_id",
                    loginCount: 1,
                },
            },
        ]);
        const totalLogins = loginsByEmail.reduce(
            (total, user) => total + user.loginCount,
            0
        );

        return res.json({
            totalLogins,
            loginsByEmail,
        });
    } catch (error) {
        console.error("Could not retrieve total login count:", error.message);
        return res.status(500).json({
            message: "Unable to retrieve login count",
        });
    }
});

router.get("/user-logins/:email", async (req, res) => {
    try {
        const email = req.params.email.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const loginCount = await LoginHistory.countDocuments({ email });
        return res.json({
            email,
            loginCount,
        });
    } catch (error) {
        console.error("Could not retrieve user login count:", error.message);
        return res.status(500).json({
            message: "Unable to retrieve user login count",
        });
    }
});

module.exports = router;