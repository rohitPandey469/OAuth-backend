const express = require("express");
const app = express();
const path = require("path");
const passport = require("passport");
const session = require("express-session");
// const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
// const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
// const LinkedInStrategy = require("passport-linkedin").Strategy;

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

const GOOGLE_CLIENT_ID =
  "223732438389-r3qt4ge6ie30ku620ie04i8lsiu1r2dr.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const LINKEDIN_CLIENT_ID = "77hsbebmnh61oc";
const LINKEDIN_CLIENT_SECRET = "OIYPsYhY6BA9MOgv";

var userProfile;
// passports configuration
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// google
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

// linkedIn
passport.use(
  new LinkedInStrategy(
    {
      // clientID: config.linkedinAuth.clientID,
      clientID: LINKEDIN_CLIENT_ID,
      // clientSecret: config.linkedinAuth.clientSecret,
      clientSecret: LINKEDIN_CLIENT_SECRET,
      // callbackURL: config.linkedinAuth.callbackURL,
      callbackURL: "http://localhost:5000/auth/linkedin/callback",
      scope: ["email", "profile"],
    },
    // verify callback
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        userProfile = profile;
        return done(null, profile);
      });
    }
  )
);

// google api's
app.get("/", function (req, res) {
  res.render("pages/auth");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "r_emailaddress"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  function (req, res) {
    // Successful authentication, redirect success.
    res.redirect("/success");
  }
);

// linkedin api's
// app.get(
//   "/auth/linkedin",
//   passport.authenticate("linkedin", {
//     scope: ["r_emailaddress", "profile"],
//   })
// );
app.get(
  "/auth/linkedin",
  passport.authenticate("linkedin", { state: "SOME STATE" }),
  function (req, res) {
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  }
);

app.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin", {
    // successRedirect: "/profile",
    successRedirect: "/success",
    // failureRedirect: "/login",
    failureRedirect: "/error",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/success");
  }
);

// router.get('/logout', function (req, res) {
//   req.logout();
//   res.redirect('/');
// });

// app.get('/profile', isLoggedIn, function (req, res) {
//   res.render('pages/profile.ejs', {
//     user: req.user // get the user out of session and pass to template
//   });
// });
app.get("/success", (req, res) => res.send(userProfile));
app.get("/error", (req, res) => res.send("error logging in"));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log("App listening on port " + port));


