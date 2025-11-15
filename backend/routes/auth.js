const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware: handle validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ---------------- AUTH ROUTES ----------------

// Register
router.post(
  "/register",
  [
    body("firstName").isString().trim().notEmpty(),
    body("lastName").isString().trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, skills } = req.body;

      // Check if user already exists
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user

      const newUser = new User({
        firstName,
        lastName,
        email,
        password_hash: hashedPassword,
        skills: skills ? skills.split(",").map(s => s.trim()) : [],
        skillsWanted: [], // Initialize empty
        matches: []  // Initialize empty
      });

      await newUser.save();
      res.json({ message: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().notEmpty(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ message: "Invalid password" });

      // --- START: NEW TOKEN LOGIC ---
      const payload = {
        user: {
          id: user.id,
          email: user.email,
        },
      };
      jwt.sign(
        payload,
        "aIOkoIH,30U93@#%$.dkDt", // Replace with a long, random secret key
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            message: "Login successful",
            token: token,
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              skills: user.skills,
            },
          });
        }
      );
      // --- END: NEW TOKEN LOGIC ---
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete Account
router.delete(
  "/delete",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().notEmpty(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ message: "Invalid password" });

      await User.deleteOne({ _id: user._id });
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Change Password
router.put(
  "/change-password",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().notEmpty(),
    body("new_pass").isLength({ min: 6 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, new_pass } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ message: "Invalid current password" });

      const newHashed = await bcrypt.hash(new_pass, 10);
      user.password_hash = newHashed;
      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
