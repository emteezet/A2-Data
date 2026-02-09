import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { generateToken } from "@/lib/jwt";
import {
  validateEmail,
  validatePhoneNumber,
  normalizePhoneNumber,
} from "@/lib/helpers";
import crypto from "crypto";

export async function registerUser(email, phone, password, name) {
  const validation = validateInput(email, phone, password, name);
  if (validation.errors) {
    return validation;
  }

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return { error: "User already exists", statusCode: 400 };
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const user = await User.create({
    email,
    phone: normalizePhoneNumber(phone),
    password: hashedPassword,
    name,
  });

  await Wallet.create({
    userId: user._id,
    balance: 0,
  });

  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role,
  });

  return {
    success: true,
    data: {
      userId: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      token,
    },
  };
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email });

  if (!user) {
    return { error: "Invalid credentials", statusCode: 401 };
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  if (user.password !== hashedPassword) {
    return { error: "Invalid credentials", statusCode: 401 };
  }

  if (user.status !== "active") {
    return { error: "Account is not active", statusCode: 403 };
  }

  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role,
  });

  return {
    success: true,
    data: {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      token,
    },
  };
}

export async function updateUser(userId, updateData) {
  const { name, email, phoneNumber } = updateData;

  const user = await User.findById(userId);
  if (!user) {
    return { error: "User not found", statusCode: 404 };
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "Email already in use", statusCode: 400 };
    }
    user.email = email;
  }

  if (phoneNumber) {
    user.phone = normalizePhoneNumber(phoneNumber);
  }

  if (name) {
    user.name = name;
  }

  await user.save();

  return {
    success: true,
    data: {
      userId: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  };
}

function validateInput(email, phone, password, name) {
  if (!validateEmail(email)) {
    return { error: "Invalid email format", statusCode: 400 };
  }

  if (!validatePhoneNumber(phone)) {
    return { error: "Invalid phone number format", statusCode: 400 };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters", statusCode: 400 };
  }

  if (!name || name.trim().length === 0) {
    return { error: "Name is required", statusCode: 400 };
  }

  return { success: true };
}
