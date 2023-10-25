const express = require('express');
const path = require('path');
const sequelize = require('./utils/database');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;

//Routers
const userRouter = require('./router/user');
const userPasswordRouter = require('./router/userPassword');
const expenseRouter = require('./router/expense');
const orderRouter = require('./router/order');

// Models
const User = require('./model/User');
const Expenses = require('./model/Expense');
const Order = require('./model/Order');
const ForgotPasswordRequest = require('./model/ForgotPasswordRequests');
const DownloadExpensesList = require('./model/DownloadedExpenseList');

const app = express();
app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/users', userRouter);
app.use('/password', userPasswordRouter);
app.use('/expenses', expenseRouter);
app.use('/orders', orderRouter);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

User.hasMany(Expenses);
Expenses.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });

User.hasMany(Order);
Order.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE',
});

User.hasMany(DownloadExpensesList);
DownloadExpensesList.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE',
});

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`server is running on http://13.51.79.59:${PORT}`)
    );
  })
  .catch((err) => console.log(err));
