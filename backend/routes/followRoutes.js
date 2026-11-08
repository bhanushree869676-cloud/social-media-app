
const express = require("express");
const router = express.Router();

const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

// FOLLOW OR UNFOLLOW USER
router.post("/:userId", authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params.userId;

        if (currentUserId === targetUserId) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            });
        }

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const alreadyFollowing =
            currentUser.following.some(
                id => id.toString() === targetUserId
            );

        if (alreadyFollowing) {
            currentUser.following.pull(targetUserId);
            targetUser.followers.pull(currentUserId);
        } else {
            currentUser.following.addToSet(targetUserId);
            targetUser.followers.addToSet(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.json({
            message: alreadyFollowing
                ? "Unfollowed successfully"
                : "Followed successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
