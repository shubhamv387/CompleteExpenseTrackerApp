require("dotenv").config();
const Razorpay = require("razorpay");
const Order = require("../model/order.js");
const sequelize = require("../utils/database");

exports.purchasepremium = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 2500;

    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      await req.user.createOrder({ orderId: order.id, status: "PENDING" });
      return res.status(201).json({ order, key_id: rzp.key_id });
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Something went wrong", error: err });
  }
};

exports.updateTrnasectionStatus = async (req, res, next) => {
  let payment_id = req.body.error
    ? req.body.error.metadata.payment_id
    : req.body.payment_id;

  let order_id = req.body.error
    ? req.body.error.metadata.order_id
    : req.body.order_id;

  const t = await sequelize.transaction();

  try {
    const order = await Order.findOne(
      { where: { orderId: order_id } },
      { transaction: t }
    );

    if (req.body.error) {
      await order.update(
        { paymentId: payment_id, status: "FAILED" },
        { transaction: t }
      );
      await t.commit();
      return res
        .status(200)
        .json({ success: false, message: "Transection Failed" });
    }

    await order.update(
      { paymentId: payment_id, status: "SUCCESSFULL" },
      { transaction: t }
    );
    const updatedUser = await req.user.update(
      { isPremium: true },
      { transaction: t }
    );

    await t.commit();
    return res.status(200).json({
      userName: updatedUser.name,
      success: true,
      message: "Transection successfull",
    });
  } catch (error) {
    await t.rollback();
    console.log(err);
  }
};

exports.getAllOrders = (req, res, next) => {
  res.json({ message: "getting all orders" });
};
