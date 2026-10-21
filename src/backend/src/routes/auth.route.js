const express = require("express");
const router = express.Router();
const UserService = require("../services/user.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET } = require("../middleware/auth");

// register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await UserService.findByUsername(username);
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const _ = await UserService.register(username, password);
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// login a user and return a JWT token
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await UserService.findByUsername(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, username: user.username },
    SECRET,
    { expiresIn: "1d" },
  );
  res.json({ token, role: user.role, username: user.username });
});

module.exports = router;
