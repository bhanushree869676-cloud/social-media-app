
const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE POST
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { content, image } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        const post = new Post({
            user: req.user.id,
            content: content.trim(),
            image: image || ""
        });

        await post.save();

        res.status(201).json({
            message: "Post created successfully!",
            post
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Could not create post"
        });
    }
});

// GET ALL POSTS
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (error) {
        res.status(500).json({
            message: "Could not fetch posts"
        });
    }
});

// GET MY POSTS
router.get("/my-posts", authMiddleware, async (req, res) => {
    try {
        const posts = await Post.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.json(posts);

    } catch (error) {
        res.status(500).json({
            message: "Could not fetch your posts"
        });
    }
});

// DELETE MY POST
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!post) {
            return res.status(404).json({
                message: "Post not found or unauthorized"
            });
        }

        res.json({
            message: "Post deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Could not delete post"
        });
    }
});

const mongoose = require("mongoose");

// LIKE A POST
router.post("/:id/like", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: { likes: req.user.id }
            },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.json({
            message: "Post liked successfully!",
            likesCount: post.likes.length
        });

    } catch (error) {
        res.status(500).json({
            message: "Could not like post"
        });
    }
});

// UNLIKE A POST
router.delete("/:id/like", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likes: req.user.id }
            },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.json({
            message: "Post unliked successfully!",
            likesCount: post.likes.length
        });

    } catch (error) {
        res.status(500).json({
            message: "Could not unlike post"
        });
    }
});

module.exports = router;
