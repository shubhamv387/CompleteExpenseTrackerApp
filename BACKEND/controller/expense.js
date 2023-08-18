const Expense = require("../model/Expense");
const User = require("../model/User");

exports.getAllExpenses = (req, res, next) => {
  req.user
    .getExpenses()
    .then((expenses) => {
      res.json({
        userName: req.user.name,
        isPremium: req.user.isPremium,
        expenses: expenses,
      });
    })
    .catch((err) => console.log(err));
};

exports.addExpense = (req, res, next) => {
  const { amount, description, category } = req.body;
  req.user
    .createExpense({ amount, description, category })
    .then((expense) => {
      res.json(expense);
    })
    .catch((err) => console.log(err));
};

exports.editExpense = (req, res, next) => {
  const { id } = req.params;
  const { amount, description, category } = req.body;

  Expense.update({ amount, description, category }, { where: { id: id } })
    .then((expense) => {
      res.json({ amount, description, category });
    })
    .catch((err) => console.log(err));
};

exports.deleteExpense = (req, res, next) => {
  const { id } = req.params;
  Expense.findAll({ where: { id: id } })
    .then((expense) => {
      expense[0]
        .destroy()
        .then(() => res.json(expense[0]))
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
