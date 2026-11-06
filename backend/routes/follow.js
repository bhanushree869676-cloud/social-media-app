
const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// FOLLOW A USER
router.post("/:userId", authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params.userId;

        if (!mongoose.isValidObjectId(targetUserId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (currentUserId === targetUserId) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            });
        }

        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { following: targetUserId }
        });

        await User.findByIdAndUpdate(targetUserId, {
            $addToSet: { followers: currentUserId }
        });

        res.json({
            message: "User followed successfully!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Follow failed"
        });
    }
});

// UNFOLLOW A USER
router.delete("/:userId", authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params.userId;

        if (!mongoose.isValidObjectId(targetUserId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        await User.findByIdAndUpdate(currentUserId, {
            $pull: { following: targetUserId }
        });

        await User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: currentUserId }
        });

        res.json({
            message: "User unfollowed successfully!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unfollow failed"
        });
    }
});

// VIEW FOLLOWERS AND FOLLOWING
router.get("/:userId", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(req.params.userId)
            .select("username followers following");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            username: user.username,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            followers: user.followers,
            following: user.following
        });

    } catch (error) {
        res.status(500).json({
            message: "Could not fetch follow details"
        });
    }
});

module.exports = router;
