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
    console.log({ Error: "Something Wrong", error });
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

exports.getLbUsersExpenses = async (req, res, next) => {
  try {
    // let allUsers = await User.findAll({ attributes: ["id", "name"] });
    // console.log(allUsers[0].id, allUsers[0].name);

    const users = await User.findAll({
      attributes: ["id", "name", "allExpenses"],
      order: [["allExpenses", "DESC"]],
    });

    return res.json({
      status: "Success",
      users: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

exports.updatedLbUsers = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ["id", "name", "allExpenses"],
      order: [["allExpenses", "DESC"]],
    });

    return res.json({
      status: "Success",
      user: user,
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
    const user = await User.findOne({ where: { id: req.user.id } });
    let newTotal = user.allExpenses + amount;
    await user.update({ allExpenses: newTotal });
    // console.log(user.allExpenses);
    Promise.all([expense, user]).then(() =>
      res.status(200).json({ expense, isPremium: user.isPremium })
    );
  } catch (error) {
    console.log(error);
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

exports.editExpense = async (req, res, next) => {
  const { id } = req.params;
  const { amount, description, category } = req.body;

  try {
    const exp = await Expense.findOne({ where: { id } });
    const user = await User.findOne({ where: { id: req.user.id } });

    let newTotal = user.allExpenses - exp.amount + +amount;
    // console.log(newTotal);
    const updateUser = await User.update(
      { allExpenses: newTotal },
      { where: { id: req.user.id } }
    );

    const updateExpense = await Expense.update(
      { amount, description, category },
      { where: { id: id } }
    );

    Promise.all([exp, user, updateUser, updateExpense]).then(async () => {
      return res.status(200).json({
        id,
        amount,
        description,
        category,
        isPremium: user.isPremium,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const { id } = req.params;
  try {
    const expense = await Expense.findOne({ where: { id } });
    const user = await User.findOne({ where: { id: req.user.id } });

    let newTotal = user.allExpenses - expense.amount;
    const updateUser = await user.update({ allExpenses: newTotal });
    const deleteExpense = await expense.destroy();
    Promise.all([expense, user, updateUser, deleteExpense]).then(() => {
      return res.status(200).json({ expense, isPremium: updateUser.isPremium });
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};
