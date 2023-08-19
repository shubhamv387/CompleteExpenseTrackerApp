require("dotenv").config();
const Razorpay = require("razorpay");
const Order = require("../model/order.js");

exports.purchasepremium = async (req, res) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 2500;

    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      req.user
        .createOrder({ orderId: order.id, status: "PENDING" })
        .then(() => {
          return res.status(201).json({ order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(err);
        });
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

  try {
    const order = await Order.findOne({ where: { orderId: order_id } });

    if (req.body.error) {
      await order.update({ paymentId: payment_id, status: "FAILED" });
      return res
        .status(200)
        .json({ success: false, message: "Transection Failed" });
    }

    const updatedOrder = await order.update({
      paymentId: payment_id,
      status: "SUCCESSFULL",
    });
    const updatedUser = await req.user.update({ isPremium: true });

    Promise.all([updatedOrder, updatedUser])
      .then(() => {
        return res.status(200).json({
          userName: updatedUser.name,
          success: true,
          message: "Transection successfull",
        });
      })
      .catch((err) => console.log({ Error: "Promise.all Failed", err }));
  } catch (error) {
    console.log(err);
  }
};

exports.getAllOrders = (req, res, next) => {
  res.json({ message: "getting all orders" });
};
