const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  { username: { type: String, unique: true }, password: String },
  { timestamps: true }
);
export const UserModel = mongoose.model("User", userSchema);
