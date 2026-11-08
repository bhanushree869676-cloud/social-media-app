
const express = require("express");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// VIEW MY PROFILE
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile fetched successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Could not fetch profile"
        });
    }
});

// UPDATE MY PROFILE
router.put("/update", authMiddleware, async (req, res) => {
    try {
        const { username, bio, profilePicture } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                username,
                bio,
                profilePicture
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile updated successfully!",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Profile update failed"
        });
    }
});

module.exports = router;
