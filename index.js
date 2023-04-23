require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
mongoose.connect(process.env.MONGODB_URL);
const jwt = require("jsonwebtoken");

const app = express();
const mongo_db_url = process.env.MONGODB_URL;

console.log("mongodb:", mongo_db_url);
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const createUser = await User.create({ username, password });
  jwt.sign(
    { userId: createUser._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
    (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({ message: "success" });
    }
  );
});

app.listen(3000, () => {
  console.log("Server started on port 3000 🚦");
});
