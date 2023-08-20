const express = require("express");
const userController = require("../controller/user");
const authMiddleware = require("../middleware/authMiddleware");
const isAdminMiddleware = require("../middleware/isAdmin");

const router = express.Router();

router.get(
  "/allusers",
  authMiddleware.authUser,
  isAdminMiddleware.isAdmin,
  userController.getAllUsers
);

router.post("/signup", userController.userSignup);

router.post("/login", userController.userLogin);

router.post("/logout", userController.logoutUser);

router
  .route("/profile")
  .get(authMiddleware.authUser, userController.getUserProfile)
  .put(authMiddleware.authUser, userController.updateUserProfile);

router.post("/password/forgotpassword", userController.resetForgotPassword);

router.get("/password/resetpassword/:id", userController.createNewPassword);

router.post(
  "/password/resetpassword/:id",
  userController.PostCreateNewPassword
);

module.exports = router;
