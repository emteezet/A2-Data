import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function listUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const users = await User.find({});
        if (users.length === 0) {
            console.log("No users found.");
        } else {
            console.log("Found users:");
            users.forEach(user => {
                console.log(`- Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

listUsers();
