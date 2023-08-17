const User = require("../model/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// @desc    Get All Users
// @route   GET /user/allusers
// @access  Admin
exports.getAllUsers = (req, res, next) => {
  User.findAll()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => console.log(err));
};

// @desc    Sign Up User
// @route   POST /user/signup
// @access  Public
exports.userSignup = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  User.findAll({ where: { email: email } })
    .then((existingUser) => {
      if (existingUser.length)
        return res.json({ message: "Email already exists!" });
      else {
        const hashedPassword = bcrypt.hashSync(password, 10);

        User.create({
          name: name,
          email: email,
          password: hashedPassword,
          phone: phone,
        })
          .then((user) => {
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
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};

// @desc    Login User
// @route   POST /user/login
// @access  Public
exports.userLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findAll({ where: { email: email } })
    .then((existingUser) => {
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
        else return res.json({ message: "Wrong Password!" });
      }
    })
    .catch((err) => console.log(err));
};

// @desc    Logout User
// @route   POST /user/logout
// @access  Private
exports.logoutUser = (req, res, next) => {
  res.cookie("jwt", "", {
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out!" });
};

// @desc    Get user profile
// @route   GET /user/profile
// @access  Private
exports.getUserProfile = (req, res, next) => {
  const { id, name, email, phone } = req.user;

  res.status(200).json({ id, name, email, phone });
};

// @desc    Update user profile
// @route   PUT /user/profile
// @access  Private
exports.updateUserProfile = (req, res, next) => {
  User.findAll({ where: { id: req.user.id } }).then((users) => {
    let newUser;
    if (users.length) {
      newUser = { ...users[0] };

      newUser.name = req.body.name || newUser.name;
      newUser.email = req.body.email || newUser.email;
      newUser.phone = req.body.phone || newUser.phone;
    }
    if (req.body.password) {
      const newHashedPassword = bcrypt.hashSync(req.body.password, 10);
      newUser.password = newHashedPassword;
    }

    User.update(newUser, { where: { id: req.user.id } })
      .then(() => {
        User.findAll({ where: { id: req.user.id } }).then((updatedUser) => {
          if (updatedUser.length)
            res.json({
              id: updatedUser[0].id,
              name: updatedUser[0].name,
              email: updatedUser[0].email,
              phone: updatedUser[0].phone,
            });
          else
            res.json({
              message: "not found",
            });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
