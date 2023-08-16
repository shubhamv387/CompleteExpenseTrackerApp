const User = require("../model/User");

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
        User.create({
          name: name,
          email: email,
          password: password,
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
  console.log(req.body);
  const { email, password } = req.body;

  User.findAll({ where: { email: email } })
    .then((existingUser) => {
      if (!existingUser.length)
        return res.json({ message: "User does not Exists!" });
      else {
        if (existingUser[0].password === password)
          return res.json({
            message: "User Logged in Successfully!",
            user: existingUser[0],
          });
        else return res.json({ message: "Wrong Password!" });
      }
    })
    .catch((err) => console.log(err));
};
