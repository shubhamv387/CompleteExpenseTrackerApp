const Razorpay = require("razorpay");
const Order = require("../model/order.js");
require("dotenv").config();

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

exports.updateTrnasectionStatus = (req, res, next) => {
  const { payment_id, order_id } = req.body;

  Order.findOne({ where: { orderId: order_id } })
    .then((order) => {
      order
        .update({ paymentId: payment_id, status: "SUCCESSFULL" })
        .then(() => {
          req.user
            .update({ isPremium: true })
            .then(() => {
              return res.status(200).json({
                success: true,
                message: "Transection successfull",
              });
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getAllOrders = (req, res, next) => {
  res.json({ message: "getting all orders" });
};
