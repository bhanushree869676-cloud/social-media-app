
const express = require("express");
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ADD COMMENT
router.post("/:postId", authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        const { postId } = req.params;

        if (!mongoose.isValidObjectId(postId)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = new Comment({
            post: postId,
            user: req.user.id,
            text: text.trim()
        });

        await comment.save();

        post.comments.push(comment._id);
        await post.save();

        res.status(201).json({
            message: "Comment added successfully!",
            comment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Could not add comment"
        });
    }
});

// GET COMMENTS FOR A POST
router.get("/:postId", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.postId)) {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        const comments = await Comment.find({
            post: req.params.postId
        })
        .populate("user", "username profilePicture")
        .sort({ createdAt: -1 });

        res.json(comments);

    } catch (error) {
        res.status(500).json({
            message: "Could not fetch comments"
        });
    }
});

// DELETE MY COMMENT
router.delete("/:postId/:commentId", authMiddleware, async (req, res) => {
    try {
        const { postId, commentId } = req.params;

        if (
            !mongoose.isValidObjectId(postId) ||
            !mongoose.isValidObjectId(commentId)
        ) {
            return res.status(400).json({
                message: "Invalid ID"
            });
        }

        const comment = await Comment.findOneAndDelete({
            _id: commentId,
            post: postId,
            user: req.user.id
        });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found or unauthorized"
            });
        }

        await Post.findByIdAndUpdate(postId, {
            $pull: { comments: commentId }
        });

        res.json({
            message: "Comment deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Could not delete comment"
        });
    }
});

module.exports = router;
