/*
 * Author: John Hershey, Collin Donnan
 * Creation Date: 2025-11-11
 * Last Edit Date: 2025-11-25
 * Class: CMSC 421 Web Development
 * Description: code for mongodb login schema part of website, based on Dr X's example
 */
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://db_user_1:dIv4stk44rAE1CCs@cluster0.j2fdqzg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);
const Schema = mongoose.Schema;

const User = new Schema({
  name: String,
  email: String,
  username: String,
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("userinfos", User);
