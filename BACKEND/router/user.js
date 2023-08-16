const express = require("express");
const userController = require("../controller/user");

const router = express.Router();

router.get("/", userController.getAllUsers);

router.post("/signup", userController.userSignup);

router.post("/login", userController.userLogin);

module.exports = router;
