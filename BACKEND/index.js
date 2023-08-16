const express = require("express");
const sequelize = require("./utils/database");
const userRouter = require("./router/user");
const cors = require("cors");
const bodyParser = require("body-parser");

// const sequelize

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/user", userRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: "Page Not Found!" });
});

sequelize
  //   .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(3000, () =>
      console.log("server is running on http://localhost:3000")
    );
  })
  .catch((err) => console.log(err));