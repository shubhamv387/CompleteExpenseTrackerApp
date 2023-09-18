const express = require("express");
const sequelize = require("./utils/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const conpression = require("compression");

require("dotenv");
const PORT = process.env.PORT || 3000;

//Routers
const userRouter = require("./router/user");
const userPasswordRouter = require("./router/userPassword");
const expenseRouter = require("./router/expense");
const orderRouter = require("./router/order");

// Models
const User = require("./model/User");
const Expenses = require("./model/Expense");
const Order = require("./model/Order");
const ForgotPasswordRequest = require("./model/ForgotPasswordRequests");
const DownloadExpensesList = require("./model/DownloadedExpenseList");

const app = express();

app.use(conpression());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/user", userRouter);
app.use("/password", userPasswordRouter);
app.use("/expense", expenseRouter);
app.use("/order", orderRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: "Page Not Found!" });
});

User.hasMany(Expenses);
Expenses.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

User.hasMany(Order);
Order.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
});

User.hasMany(DownloadExpensesList);
DownloadExpensesList.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
});

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`server is running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(err));
