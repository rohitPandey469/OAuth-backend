const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    googleId: String,
    displayName: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    profilePicture: {
      type: String,
      default: "https://www.gravatar.com/avatar/?d=identicon",
    },
    points: {
      type: Number,
      default: 50,
    },
    description: {
      type: String,
      maxlength: 50,
    },
    star: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },
    rank: {
      type: Number,
    },
    competetion: {
      participated: {
        type: Number,
      },
      streak: {
        type: Number,
      },
      maxStreak: {
        type: Number,
      },
    },
    tools: [
      {
        name: {
          type: String,
        },
        slug: {
          type: String,
        },
      },
    ],
    links: {
      instagram: {
        type: String,
      },
      behance: {
        type: String,
      },
      dribble: {
        type: String,
      },
      linkedin: {
        type: String,
      },
      facebook: {
        type: String,
      },
    },
    quote: {
      type: String,
      maxlength: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", User);
