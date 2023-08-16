const Sequlize = require("sequelize");

const sequelize = new Sequlize("expense-full-app", "root", "Shubham@@387", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
