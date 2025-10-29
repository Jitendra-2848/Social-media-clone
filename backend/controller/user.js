const jwt = require("jsonwebtoken");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const generatetoken = require("../middleware/jwt");

const reg = async (req, res) => {
  try {
    const { firstname, surname, email, password } = req.body;

    if (!firstname || !surname || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      firstname,
      surname,
      email,
      password: hashed,
    });

    await user.save();
    generatetoken(user._id, res);

    return res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Registration failed: " + error.message });
  }
};

const log = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    generatetoken(user._id, res);

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Login failed: " + error.message });
  }
};

const check = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user" });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

module.exports = { reg, log, check, logout, getUserDetail, getAllUsers };