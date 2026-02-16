import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkAdmins() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const admins = await User.find({ role: "admin" });
        if (admins.length === 0) {
            console.log("No admin users found.");
        } else {
            console.log("Found admins:");
            admins.forEach(admin => {
                console.log(`- Name: ${admin.name}, Email: ${admin.email}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkAdmins();
