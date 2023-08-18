const jwt = require("jsonwebtoken");
const User = require("../model/User");

exports.authUser = (req, res, next) => {
  // console.log(req.headers.authorization);
  let token = req.headers.authorization;

  if (token) {
    const decoded = jwt.verify(token, "abc123");

    User.findAll({ where: { id: decoded.userId } })
      .then((user) => {
        req.user = user[0];
        // console.log(req.user);
        next();
      })
      .catch((error) => {
        res.status(401).json({ message: "Not authorized, invalid token" });
      });
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
