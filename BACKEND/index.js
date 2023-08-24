const express = require("express");
const fs = require("fs");
const path = require("path");
const sequelize = require("./utils/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const conpression = require("compression");
// const morgan = require("morgan");
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

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flag: "a",
  }
);

app.use(helmet());
app.use(conpression());
// app.use(morgan("combined", { stream: accessLogStream }));
app.use(cors());

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/user", userRouter);
app.use("/password", userPasswordRouter);
app.use("/expense", expenseRouter);
app.use("/order", orderRouter);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, `/public/${req.url}`));
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
      console.log(`server is running on http://16.171.230.154:${PORT}`)
    );
  })
  .catch((err) => console.log(err));
