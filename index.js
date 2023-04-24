require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const User = require("./models/User");
mongoose.connect(process.env.MONGODB_URL);
const jwt = require("jsonwebtoken");

const app = express();
const mongo_db_url = process.env.MONGODB_URL;
const cors = require("cors");
app.use(cors());
app.use(express.json());

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World");
  console.log("Hello World");
});
console.log("mongodb:", mongo_db_url);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const createUser = await User.create({ username, password });
    jwt.sign(
      { userId: createUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({ message: "success" });
        console.log("token:", token);
      }
    );
    res.json(createUser);
  } catch (error) {
    res.json({ message: error.message });
  }
});

app.listen(3000, () => {
  console.log(`Server started on port ${process.env.SERVER_URL} 🚦`);
});
