const express = require("express");
const userController = require("../controller/user");

const router = express.Router();

router.get("/", userController.getAllUsers);

router.post("/signup", userController.addUser);

module.exports = router;
