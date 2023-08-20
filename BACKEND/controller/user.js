const User = require("../model/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const Brevo = require("sib-api-v3-sdk");
const ForgotPasswordRequest = require("../model/ForgotPasswordRequests");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

// @desc    Get All Users
// @route   GET /user/allusers
// @access  Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};

// @desc    Sign Up User
// @route   POST /user/signup
// @access  Public
exports.userSignup = async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  try {
    const existingUser = await User.findAll({ where: { email: email } });
    if (existingUser.length)
      return res.json({ message: "Email already exists!" });
    else {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone,
      });

      const token = generateToken.generateToken(res, user.id);
      res.status(201).json({
        message: "User Created Successfully!",
        userDetails: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token: token,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

// @desc    Login User
// @route   POST /user/login
// @access  Public
exports.userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findAll({ where: { email: email } });

    if (!existingUser.length)
      return res.json({ message: "User does not Exists!" });
    else {
      const user = existingUser[0];
      const token = generateToken.generateToken(res, user.id);
      const isCorrectPassword = bcrypt.compareSync(password, user.password);
      if (isCorrectPassword)
        return res.json({
          message: "User Logged in Successfully!",
          userDetails: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
          token: token,
        });
      else return res.json({ message: "Wrong Credentials!" });
    }
  } catch (err) {
    console.log(err);
  }
};

// @desc    Logout User
// @route   POST /user/logout
// @access  Private
exports.logoutUser = async (req, res, next) => {
  await res.cookie("jwt", "", {
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out!" });
};

// @desc    Get user profile
// @route   GET /user/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  const { id, name, email, phone } = req.user;

  res.status(200).json({ id, name, email, phone });
};

// @desc    Update user profile
// @route   PUT /user/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const users = await User.findOne({ where: { id: req.user.id } });
    let newUser;
    if (users) {
      newUser = { ...users[0] };

      newUser.name = req.body.name || newUser.name;
      newUser.email = req.body.email || newUser.email;
      newUser.phone = req.body.phone || newUser.phone;
    }
    // if (req.body.password) {
    //   const newHashedPassword = bcrypt.hashSync(req.body.password, 10);
    //   newUser.password = newHashedPassword;
    // }
    await User.update(newUser, { where: { id: req.user.id } });
    const updatedUser = await User.findOne({ where: { id: req.user.id } });
    if (updatedUser)
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });
    else
      res.json({
        message: "not found",
      });
  } catch (error) {
    console.log(error);
  }
};

// @desc    Reset Forgot Password
// @route   PUT /user/profile
// @access  Public
exports.resetForgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user)
      return res
        .status(400)
        .json({ status: "Failed", message: "email does not Exists!" });

    const id = uuidv4();
    const FPR = await ForgotPasswordRequest.create({
      id,
      isActive: true,
      userId: user.id,
    });
    console.log(FPR);

    const defaultClient = await Brevo.ApiClient.instance;

    // Configure API key authorization: api-key
    const apiKey = await defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const transEmailApi = await new Brevo.TransactionalEmailsApi();

    const path = `http://localhost:3000/user/password/resetpassword/${id}`;

    const sender = {
      email: "shubhamv387@gmail.com",
      name: "Shubhamv K",
    };
    const receivers = [req.body];

    await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "reset password mail",
      textContent: "Click here to reset your password",
      htmlContent: `<a href="${path}">Click Here</a> to reset your password!`,
    });

    res
      .status(200)
      .json({ status: "Success", message: "email sent successfully!" });
  } catch (error) {
    console.error(error);
  }
};

// @desc    Reset Forgot Password
// @route   POST /user/profile
// @access  Public
exports.createNewPassword = async (req, res, next) => {
  try {
    const FPR = await ForgotPasswordRequest.findOne({
      where: { id: req.params.id },
    });
    if (!FPR)
      return res
        .status(400)
        .json({ status: "failed", message: "invalid link" });

    return res.status(200).send(`<div
    style="
      max-width: 450px !important;
      display: flex;
      flex-direction: column;
      justify-content: center;
      justify-content: center;
      padding: 25px;
    "
  >
    <form
      id="resetPasswordNow"
      style="
        display: flex;
        flex-direction: column;
        padding: 25px;
        background: #f2f2f2;
        border: 1px solid #d0d0d0;
        border-radius: 5px;
      "
    >
      <label for="password">Password:</label>
      <input
        required
        type="password"
        id="password"
        name="password"
        id="password"
        style="margin-bottom: 8px"
      />
      <label for="confirmPassword">Confirm Password:</label>
      <input
        required
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        id="confirmPassword"
      />
      <input
        type="submit"
        value="SEND"
        style="
          width: 20%;
          margin-top: 10px;
          background: green;
          border: 0;
          color: #fff;
          padding: 8px;
          border-radius: 5px;
        "
      />
    </form>
    <p id="loginNow" style="margin-top: 8px; display:none;">
        You can
        <a
          style="font-weight: bold"
          href="http://127.0.0.1:5501/login/login.html"
          >Login Now</a
        >
      </p>
    
  </div>
  <script>
  document.getElementById("resetPasswordNow").addEventListener('submit', async(e) => {
    e.preventDefault();
    const pass = document.getElementById("password");
    const confirmPass = document.getElementById("confirmPassword");
    if (pass.value !== confirmPass.value) {
      alert("MisMatched Passwords!")
      console.log(pass, confirmPass);
      pass.value = "";
      confirmPass.value = "";
    }
    else {
      try{
        const response = await axios.post("http://localhost:3000/user/password/resetpassword/${req.params.id}",{pass: pass.value, confirmPass: confirmPass.value});

        alert(response.data.message);
        pass.value = "";
        confirmPass.value = "";
        document.getElementById("loginNow").style.display = 'block';

      } catch(error) {
        alert(error.response.data.message);
        pass.value = "";
        confirmPass.value = "";
        console.log(error.response.data.message);
      }
    }
  })
      
    </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"></script>`);
  } catch (error) {
    console.error(error);
  }
};

exports.PostCreateNewPassword = async (req, res, next) => {
  const { id } = req.params;
  const { pass, confirmPass } = req.body;
  console.log(req.body);

  if (pass !== confirmPass)
    return res
      .status(400)
      .send({ status: "Failed", message: "MisMatched Passwords!" });

  const FPR = await ForgotPasswordRequest.findOne({ where: { id: id } });
  if (!FPR.isActive)
    return res
      .status(400)
      .send({ status: "Failed", message: "This Link is Expired!" });

  await ForgotPasswordRequest.update(
    { isActive: false },
    { where: { id: id } }
  );
  res
    .status(200)
    .send({ status: "Success", message: "Password Updated Successfully" });
};
