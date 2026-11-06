
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET ALL USERS EXCEPT LOGGED-IN USER
router.get("/", authMiddleware, async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.user.id }
        }).select("username bio followers following");

        res.json(users);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
