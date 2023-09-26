const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

// Schema for Session
const Session = new Schema({
  refreshToken: {
    type: String,
    default: "",
  },
});

const User = new Schema({
  // storing email in username and passport providing addons and func chek
  displayName: {
    type: String,
    required: true,
  },
  authStrategy: {
    type: String,
    default: "local",
  },
  // populate with all the fields for user
  points: {
    type: Number,
    default: 50,
  },
  photos: {
    type: [String],
  },
  refreshToken: {
    type: [Session],
  },
});

// //Remove refreshToken from the response
// User.set("toJSON", {
//   transform: function (doc, ret, options) {
//     delete ret.refreshToken;
//     return ret;
//   },
// });

// will provide a username and password
User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
