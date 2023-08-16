const User = require("../model/User");
const bcrypt = require("bcryptjs");

exports.getAllUsers = (req, res, next) => {
  User.findAll()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => console.log(err));
};

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
            res.json({ message: "User Created Successfully!", user });
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};

exports.userLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findAll({ where: { email: email } })
    .then((existingUser) => {
      if (!existingUser.length)
        return res.json({ message: "User does not Exists!" });
      else {
        const isCorrectPassword = bcrypt.compareSync(
          password,
          existingUser[0].password
        );
        if (isCorrectPassword)
          return res.json({
            message: "User Logged in Successfully!",
            user: existingUser[0],
          });
        else return res.json({ message: "Wrong Password!" });
      }
    })
    .catch((err) => console.log(err));
};
