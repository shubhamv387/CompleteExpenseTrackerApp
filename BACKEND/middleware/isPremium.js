exports.isPremiumUser = (req, res, next) => {
  if (req.user.isPremium) next();
  else
    return res
      .status(400)
      .send({ status: "Failed", message: "Not a premium user" });
};
