const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const loginLimiter = require("../middlewares/rateLimiter");

router.post("/login", adminController.login);

module.exports = router;
