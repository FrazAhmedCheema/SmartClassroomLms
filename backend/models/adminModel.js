const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
  // ...other fields...
});

module.exports = mongoose.model("Admin", AdminSchema);

