if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  require("dotenv").config();
}
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const oauthRoute = require("./routes/oauth");
const corsOptions = require("./conifg/corsOptions"); // cors options
const dbConn = require("./conifg/dbConn");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/users");

const PORT = process.env.PORT || 5000;

// connected to mongoDB
dbConn();

const app = express();

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: true }));

// built in middleware for json
app.use(express.json());

// Cross Origin Resource Sharing
app.use(cors(corsOptions));
// app.use(cors()); - use it for dev mode

// OAuth Startegys
require("./strategies/OAuthStrategy");

////////////////Local Strategys
require("./strategies/jwtStrategy");
require("./strategies/localStrategy");
require("./authenticate");
////////////////

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

// middleware for cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// routes
app.use("/auth", oauthRoute);
app.use("/users", userRoute);

// Local Routes
app.get("/", function (req, res) {
  res.send({ status: "success" });
});

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to mongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
