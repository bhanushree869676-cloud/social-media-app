
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },

    image: {
        type: String,
        default: ""
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]

}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
