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
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
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
      {},
      (err, token) => {
        if (err) {
          throw err;
        }

        res
          .cookie("token", token, {
            strict: false,
            httpOnly: true,
            sameSite: "none",
            secure: true,
          })
          .json(createUser);
        console.log("token:", token);
      }
    );
    console.log("createUser:", createUser);
  } catch (error) {
    res.json({ message: error });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("password:", password);

  try {
    const userFound = await User.findOne({ username });
    console.log("userFound:", userFound);

    if (userFound) {
      const validPassword = bcrypt.compare(password, userFound.password);
      if (validPassword) {
        jwt.sign(
          { userId: userFound._id, username },
          process.env.JWT_SECRET,
          { expiresIn: "1h" },
          (err, token) => {
            res
              .cookie("token", token, {
                httpOnly: true,
                sameSite: "none",
                secure: true,
              })
              .json({
                id: userFound._id,
                username: userFound.username,
              });
          }
        );
      } else {
        res.status(422).json({ message: "Invalid password" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(3000, () => {
  console.log(`Server started on port ${process.env.SERVER_URL} 🚦`);
});
