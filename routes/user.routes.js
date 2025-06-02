const express = require("express");
const {
  signup,
  login,
  getMe,
  updateDetails,
  sendMail,
  forgatePassword,
  resetPassword,
} = require("../controllers/user.controller");
const UserRouter = express.Router();

UserRouter.post("/signup", signup);
UserRouter.post("/login", login);
UserRouter.get("/get", getMe);
UserRouter.put("/updates/:id", updateDetails);
UserRouter.post("/sendmail", sendMail);
UserRouter.post("/forgatepass", forgatePassword);
UserRouter.post("/resetpass", resetPassword);
module.exports = UserRouter;
