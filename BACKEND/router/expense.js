const express = require("express");
const expenseController = require("../controller/expense");
const authMiddleware = require("../middleware/authMiddleware");
const isPremium = require("../middleware/isPremium");

const router = express.Router();

router.get("/", authMiddleware.authUser, expenseController.getAllExpenses);

router.get(
  "/lb-users-expenses",
  authMiddleware.authUser,
  isPremium.isPremiumUser,
  expenseController.getLbUsersExpenses
);

router.post(
  "/add-expense",
  authMiddleware.authUser,
  expenseController.addExpense
);

router.put(
  "/edit-expense/:id",
  authMiddleware.authUser,
  expenseController.editExpense
);

router.delete(
  "/delete-expense/:id",
  authMiddleware.authUser,
  expenseController.deleteExpense
);

module.exports = router;
