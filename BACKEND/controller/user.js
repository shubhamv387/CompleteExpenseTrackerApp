const User = require("../model/User");

exports.getAllUsers = (req, res, next) => {
  User.findAll()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => console.log(err));
};

exports.addUser = (req, res, next) => {
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
