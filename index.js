require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const User = require("./models/User");
mongoose.connect(process.env.MONGODB_URL);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(cookieParser());
const mongo_db_url = process.env.MONGODB_URL;
const cors = require("cors");
app.use(cors());
app.use(express.json());

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("connexion ok ✅");
  console.log("connexion ok ✅");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  console.log("cookies:", req.cookies);
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        res.status(401).json({ message: "Unauthorized" });
      } else {
        res.json({ message: "success" });
      }
    });
  } else {
    res.status(422).json({ message: "no token" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  console.log("passwordHash:", passwordHash);
  try {
    const createUser = await User.create({ username, password: passwordHash });
    jwt.sign(
      { userId: createUser._id, username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { httpOnly: true })
          .json({ message: `Welcome ${username}`, token });
        console.log("token:", token);
      }
    );
  } catch (error) {
    res.json({ error });
  }
});

app.listen(3000, () => {
  console.log(`Server started on port ${process.env.SERVER_URL} 🚦`);
});
