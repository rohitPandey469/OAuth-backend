const router = require("express").Router();
const User = require("../models/User");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// helpers
const {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
  verifyUser,
} = require("../authenticate");

router.post("/signup", (req, res, next) => {
  // Verify that displayName is not empty

  // search for duplication needs to implement
  if (!req.body.displayName) {
    res.statusCode = 500;
    res.send({
      name: "NameError",
      message: "The name is required",
    });
  } else {
    User.register(
      //////// make sure to send all the required fields along with username
      //////// registering through passport
      // PASSING EMAIL IN THE USERNAME FIELD
      new User({
        username: req.body.username,
        displayName: req.body.displayName,
      }),
      req.body.password,
      async (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.send(err);
        } else {
          // extra fields addons to the User model here
          user.displayName = req.body.displayName;
          const token = getToken({ _id: user._id });
          const refreshToken = getRefreshToken({ _id: user._id });
          user.refreshToken.push({ refreshToken });
          // send the user data to frontend
          const result = await user.save();
          if (!result) {
            res.statusCode = 500;
            res.send(err);
          } else {
            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
            res.send({ success: true, token });
          }
        }
      }
    );
  }
});

// login
router.post("/login", passport.authenticate("local"), (req, res, next) => {
  const token = getToken({ _id: req.user._id });
  const refreshToken = getRefreshToken({ _id: req.user._id });
  User.findById(req.user._id).then(
    async (user) => {
      user.refreshToken.push({ refreshToken });
      const result = await user.save();
      if (!result) {
        res.statusCode = 500;
        res.send(err);
      } else {
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
        res.send({ success: true, token });
      }
    },
    (err) => next(err)
  );
});

// refreshroute - silent refresh every 15 mins
// will run only if the user is hovering on the webpage
router.post("/refreshToken", async (req, res, next) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;

  if (refreshToken) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const userId = payload._id;
      const user = await User.findOne({ _id: userId });
      // User.findOne({ _id: userId }).then(
      //   async (user) => {
      if (user) {
        // Find the refresh token against the user record in database
        const tokenIndex = user.refreshToken.findIndex(
          (item) => item.refreshToken === refreshToken
        );

        if (tokenIndex === -1) {
          res.statusCode = 401;
          res.send("Unauthorized");
        } else {
          const token = getToken({ _id: userId });
          // If the refresh token exists, then create new one and replace it.
          const newRefreshToken = getRefreshToken({ _id: userId });
          user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
          const result = await user.save();
          if (!result) {
            res.statusCode = 500;
            res.send(err);
          } else {
            res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
            res.send({ success: true, token });
          }
        }
      } else {
        res.statusCode = 401;
        res.send("Unauthorized");
      }
    } catch (err) {
      res.statusCode = 401;
      res.send("Unauthorized");
    }
  } else {
    res.statusCode = 401;
    res.send("Unauthorized");
  }
});

// endpoints to fetch user details
router.get("/me", verifyUser, (req, res, next) => {
  res.send(req.user);
});

// logout
router.get("/logout", verifyUser, (req, res, next) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  User.findById(req.user._id).then(
    async (user) => {
      const tokenIndex = user.refreshToken.findIndex(
        (item) => item.refreshToken === refreshToken
      );

      if (tokenIndex !== -1) {
        // user.refreshToken.id(user.refreshToken[tokenIndex]._id).deleteMany({});
        user.refreshToken = []; // brute force to delete everything in db
      }
      const result = await user.save();
      if (!result) {
        res.statusCode = 500;
        res.send("Unauthorized");
      } else {
        res.clearCookie("refreshToken", COOKIE_OPTIONS);
        res.send({ success: true });
      }
    },
    (err) => next(err)
  );
});

module.exports = router;
