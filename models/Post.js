const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Post = new Schema(
    {
      displayName: {
        type: mongoose.ObjectId,
        ref: "User",
        required: true,
      },
      caption: {
        type: String,
        maxlength: 50,
      },
      likes: {
        type: Number,
        default: 0,
      },
      comments: [
        {
          displayName: {
            type: mongoose.ObjectId,
            ref: "User",
          },
          comment: {
            type: String,
            minlength: 1,
            maxlength: 200,
          },
        },
      ],
    },
    { timestamps: true }
  );

module.exports = mongoose.model("Post", Post);