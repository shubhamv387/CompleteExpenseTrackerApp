const express = require("express");
const sequelize = require("./utils/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//Routers
const userRouter = require("./router/user");
const expenseRouter = require("./router/expense");
const orderRouter = require("./router/order");

// Models
const User = require("./model/User");
const Expenses = require("./model/Expense");
const Order = require("./model/Order");

const app = express();

app.use(cors());

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/user", userRouter);
app.use("/expense", expenseRouter);
app.use("/order", orderRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: "Page Not Found!" });
});

User.hasMany(Expenses);
Expenses.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

User.hasMany(Order);
Order.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(3000, () =>
      console.log("server is running on http://localhost:3000")
    );
  })
  .catch((err) => console.log(err));
