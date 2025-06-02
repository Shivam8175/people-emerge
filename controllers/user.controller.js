const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const UserModel = require("../models/user.model");
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "shhhhh"; // Move this to .env in production

// ====================== Signup ======================
const signup = async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, saltRounds);
    await UserModel.create({ ...req.body, password: hash });

    res.status(201).json({ message: "Signup success" });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// ====================== Login ======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please signup." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "20s" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "60s" }
    );

    res.status(200).json({
      message: "Login success",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// ====================== Get User Info ======================
const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    res.status(200).json({ message: "Get user information", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

// ====================== Update User ======================
const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
    };

    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ message: "Update successful", user });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// ====================== Nodemailer Transporter ======================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "st548501@gmail.com",
    pass: "zxlf aekm ojhh duxa", // move to .env for security
  },
});

// ====================== Send Test Email ======================
const sendMail = async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: '"Shivam Thakre" <st548501@gmail.com>',
      to: "shivamthakre.cse20@ggct.co.in, shivamthakur8985@gmail.com", // 🛑 FIXED: Missing comma
      subject: "Testing Email ✔",
      html: "This is a test email from Shivam.",
    });

    res.status(200).json({ message: "Email sent", info });
  } catch (error) {
    res.status(500).json({ message: "Email failed", error: error.message });
  }
};

// ====================== Forgot Password ======================
const forgatePassword = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found, please register" });
    }

    const resetPasswordToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "5m",
    });

    const resetPasswordLink = `http://localhost:5000/user/reset-pass?token=${resetPasswordToken}`;

    await transporter.sendMail({
      from: '"Shivam Thakre" <st548501@gmail.com>',
      to: user.email,
      subject: "Password Reset ✔",
      html: `<h4>This is your password reset link:</h4><h5>${resetPasswordLink}</h5>`,
    });

    res.status(200).json({
      message: "Password reset link sent to your email",
      resetPasswordLink,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending reset email", error: error.message });
  }
};

// ====================== Reset Password Route ======================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hash = await bcrypt.hash(req.body.newPassword, saltRounds);
    user.password = hash;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateDetails,
  sendMail,
  forgatePassword,
  resetPassword,
};
