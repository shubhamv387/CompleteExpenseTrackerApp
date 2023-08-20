const User = require("../model/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const Brevo = require("sib-api-v3-sdk");
const jwt = require("jsonwebtoken");

require("dotenv").config();

// @desc    Get All Users
// @route   GET /user/allusers
// @access  Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};

// @desc    Sign Up User
// @route   POST /user/signup
// @access  Public
exports.userSignup = async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  try {
    const existingUser = await User.findAll({ where: { email: email } });
    if (existingUser.length)
      return res.json({ message: "Email already exists!" });
    else {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone,
      });

      const token = generateToken.generateToken(res, user.id);
      res.status(201).json({
        message: "User Created Successfully!",
        userDetails: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token: token,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

// @desc    Login User
// @route   POST /user/login
// @access  Public
exports.userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findAll({ where: { email: email } });

    if (!existingUser.length)
      return res.json({ message: "User does not Exists!" });
    else {
      const user = existingUser[0];
      const token = generateToken.generateToken(res, user.id);
      const isCorrectPassword = bcrypt.compareSync(password, user.password);
      if (isCorrectPassword)
        return res.json({
          message: "User Logged in Successfully!",
          userDetails: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
          token: token,
        });
      else return res.json({ message: "Wrong Credentials!" });
    }
  } catch (err) {
    console.log(err);
  }
};

// @desc    Logout User
// @route   POST /user/logout
// @access  Private
exports.logoutUser = async (req, res, next) => {
  await res.cookie("jwt", "", {
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out!" });
};

// @desc    Get user profile
// @route   GET /user/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  const { id, name, email, phone } = req.user;

  res.status(200).json({ id, name, email, phone });
};

// @desc    Update user profile
// @route   PUT /user/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const users = await User.findOne({ where: { id: req.user.id } });
    let newUser;
    if (users) {
      newUser = { ...users[0] };

      newUser.name = req.body.name || newUser.name;
      newUser.email = req.body.email || newUser.email;
      newUser.phone = req.body.phone || newUser.phone;
    }
    // if (req.body.password) {
    //   const newHashedPassword = bcrypt.hashSync(req.body.password, 10);
    //   newUser.password = newHashedPassword;
    // }
    await User.update(newUser, { where: { id: req.user.id } });
    const updatedUser = await User.findOne({ where: { id: req.user.id } });
    if (updatedUser)
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });
    else
      res.json({
        message: "not found",
      });
  } catch (error) {
    console.log(error);
  }
};

// @desc    Reset Forgot Password
// @route   PUT /user/profile
// @access  Public
exports.resetForgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user)
      return res
        .status(400)
        .json({ status: "Failed", message: "email does not Exists!" });

    const defaultClient = await Brevo.ApiClient.instance;

    // Configure API key authorization: api-key
    const apiKey = await defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const transEmailApi = await new Brevo.TransactionalEmailsApi();

    const secretKey = process.env.JWT_SECRET_KEY + user.email;

    const userId = user.id;

    const token = jwt.sign({ userId }, secretKey, {
      expiresIn: "30d",
    });

    const path = `http://127.0.0.1:5501/user/password/createnewpassword/${user.email}/${token}`;

    const sender = {
      email: "shubhamv387@gmail.com",
      name: "Shubhamv K",
    };
    const receivers = [req.body];

    await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "reset password mail",
      textContent: "Click here to reset your password",
      htmlContent: `<a href="${path}">Click Here</a> to reset your password!`,
    });

    res
      .status(200)
      .json({ status: "Success", message: "email sent successfully!" });
  } catch (error) {
    console.error(error);
  }
};

// @desc    Reset Forgot Password
// @route   POST /user/profile
// @access  Public
exports.createNewPassword = (req, res, next) => {
  console.log(req.params);
  res
    .send(200)
    .json({ status: "success", message: "password created successfully" });
};
