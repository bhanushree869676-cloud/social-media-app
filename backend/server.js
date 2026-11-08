
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const postRoutes = require("./routes/posts");
const profileRoutes = require("./routes/profile");
const authRoutes = require("./routes/auth");
const commentRoutes = require("./routes/comments");
const followRoutes = require("./routes/followRoutes");
const userRoutes = require("./routes/userRoutes");

// Create Express application FIRST
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to Social Media Platform API!");
});

// Authentication routes
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");

       const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    });
