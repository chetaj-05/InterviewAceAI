import User from "../models/User.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import generateToken from "../utils/generateToken.js";

export const register = async ({ name, email, password }) => {
  // Check if all fields are present
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  // Validate email
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  // Password length
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Generate JWT
  const token = generateToken(user._id);

  return {
    success: true,
    message: "User registered successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};
export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and Password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid Credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid Credentials");
  }

  const token = generateToken(user._id);

  return {
    success: true,
    message: "Login Successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};
