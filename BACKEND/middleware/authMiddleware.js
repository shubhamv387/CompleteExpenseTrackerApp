const jwt = require("jsonwebtoken");
const User = require("../model/User");
require("dotenv").config();

exports.authUser = async (req, res, next) => {
  // console.log(req.headers.authorization);
  let token = req.headers.authorization;
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findAll({
        where: { id: decoded.userId },
        attributes: [
          "id",
          "name",
          "email",
          "phone",
          "isPremium",
          "allExpenses",
        ],
      });
      req.user = user[0];
      next();
    } else {
      res
        .status(401)
        .json({ status: "Failed", message: "Not authorized, no token" });
    }
  } catch (error) {
    res
      .status(401)
      .json({ status: "Failed", message: "Not authorized, invalid token" });
  }
};
