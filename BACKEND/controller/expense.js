const Expense = require("../model/Expense");
const User = require("../model/User");
const sequelize = require("../utils/database");

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
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

exports.getLbUsersExpenses = async (req, res, next) => {
  try {
    // let allUsers = await User.findAll({ attributes: ["id", "name"] });
    // console.log(allUsers[0].id, allUsers[0].name);

    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        [sequelize.fn("sum", sequelize.col("expenses.amount")), "totalCost"],
      ],
      include: {
        model: Expense,
        attributes: [],
      },
      group: ["user.id"],
    });

    let userTotalExpenses = [];

    for (const user of users) {
      userTotalExpenses.push({
        name: user.name,
        totalExpense: user.dataValues.totalCost,
      });
    }

    userTotalExpenses.sort((a, b) => b.totalExpense - a.totalExpense);

    return res.json({
      status: "Success",
      users: userTotalExpenses,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ Error: "Something Wrong", error });
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
    return res.status(400).json({ Error: "Something Wrong", error });
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
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const { id } = req.params;
  try {
    const expense = await Expense.findAll({ where: { id: id } });
    await expense[0].destroy();
    return res.status(200).json(expense[0]);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};
