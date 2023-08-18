const Expense = require("../model/Expense");

exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await req.user.getExpenses();
    return res.json({
      userName: req.user.name,
      isPremium: req.user.isPremium,
      expenses: expenses,
    });
  } catch (error) {
    console.log(error);
    return res.statue(400).json({ Error: "Something Wrong", error });
  }
};

exports.addExpense = async (req, res, next) => {
  const { amount, description, category } = req.body;
  try {
    const expense = await req.user.createExpense({
      amount,
      description,
      category,
    });
    return res.status(200).json(expense);
  } catch (error) {
    console.log(error);
    return res.statue(400).json({ Error: "Something Wrong", error });
  }
};

exports.editExpense = async (req, res, next) => {
  const { id } = req.params;
  const { amount, description, category } = req.body;

  try {
    Expense.update({ amount, description, category }, { where: { id: id } });
    return res.json({ amount, description, category });
  } catch (error) {
    console.log(error);
    return res.statue(400).json({ Error: "Something Wrong", error });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const { id } = req.params;
  try {
    const expense = await Expense.findAll({ where: { id: id } });
    await expense[0].destroy();
    return res.statue(200).json(expense[0]);
  } catch (error) {
    console.log(error);
    return res.statue(400).json({ Error: "Something Wrong", error });
  }
};
