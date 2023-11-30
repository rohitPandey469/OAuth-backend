const allowedOrigins = require("../config/allowedOrigins");

const CLIENT_URL = "https://shimmering-biscochitos-012b6c.netlify.app";
const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", CLIENT_URL);
  }
  next();
};

module.exports = credentials;
