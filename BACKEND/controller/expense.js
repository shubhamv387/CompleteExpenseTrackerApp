const Expense = require("../model/Expense");
const User = require("../model/User");

exports.getAllExpenses = (req, res, next) => {
  console.log(req.body);
  Expense.findAll({ where: { userId: req.user.id } })
    .then((expenses) => {
      res.json(expenses);
    })
    .catch((err) => console.log(err));
};

exports.addExpense = (req, res, next) => {
  const { amount, description, category } = req.body;
  Expense.create({ amount, description, category, userId: req.user.id })
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
