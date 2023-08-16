const express = require("express");
const expenseController = require("../controller/expense");

const router = express.Router();

router.get("/", expenseController.getAllExpenses);

router.post("/add-expense", expenseController.addExpense);

router.put("/edit-expense/:id", expenseController.editExpense);

router.delete("/delete-expense/:id", expenseController.deleteExpense);

module.exports = router;
