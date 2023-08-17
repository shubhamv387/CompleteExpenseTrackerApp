const jwt = require("jsonwebtoken");

exports.generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, "abc123", { expiresIn: "30d" });

  res.cookie("jwt", token, {
    httpOnly: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};
