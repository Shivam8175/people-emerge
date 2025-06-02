const express = require("express");
const connectDB = require("./configs/mongodb.config");
const UserRouter = require("./routes/user.routes");
const app = express();
require("dotenv").config();
app.use(express.json());
app.use("/user", UserRouter);
connectDB();
const PORT = 4003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
