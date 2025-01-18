const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminModel = require("../models/AdminModel");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  console.log("Reached here?");
  console.log("Username:", username);
  console.log("Password:", password);

  // Basic Input Validation
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    // Find Admin by Username
    const admin = await AdminModel.findOne({ username: username });
    console.log("Admin:", admin);

    if (!admin) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    // Password Comparison (plain text)
    if (password !== admin.password) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: admin._id, role: "admin" }, "SECRET_KEY", { expiresIn: "1h" });
    res.json({ token });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
