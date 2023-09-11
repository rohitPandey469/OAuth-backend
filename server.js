require("dotenv").config();
// const cookieSession = require("cookie-session");
const session = require("express-session");
const express = require("express");
const passportSetup = require("./passport"); // requiring passport.js file
const passport = require("passport");
const cors = require("cors");
const authRoute = require("./routes/auth");

const app = express();

// below three steps for passport
// app.use(
//   cookieSession({
//     name: "session",
//     keys: ["openreplay"],
//     maxAge: 24 * 60 * 60 * 100,
//   })
// );
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
    // cookie: { secure: true }, // use it while deploying
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/auth", authRoute);

app.listen("5000", () => {
  console.log("server is running!");
});
