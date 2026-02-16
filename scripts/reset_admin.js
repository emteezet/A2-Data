import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import crypto from "crypto";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function resetAdminPassword() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const email = "admin@datavault.com";
        const newPassword = "admin123456";

        const hashedPassword = crypto
            .createHash("sha256")
            .update(newPassword)
            .digest("hex");

        const user = await User.findOne({ email: email });

        if (!user) {
            console.log(`User ${email} not found.`);
            process.exit(1);
        }

        user.password = hashedPassword;
        user.role = "admin"; // Ensure it's lowercase 'admin' as per model enum
        await user.save();

        console.log(`✅ Password reset successfully for ${email}`);
        console.log(`New Password: ${newPassword}`);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

resetAdminPassword();
