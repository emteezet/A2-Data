
import mongoose from "mongoose";
import dotenv from "dotenv";
import DataPlan from "../models/DataPlan.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function fix() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const mtnSmePlans = {
            "mtn-sme-1gb": "1000",
            "mtn-sme-2gb": "2000",
            "mtn-sme-3gb": "3000",
            "mtn-sme-5gb": "5000",
            "mtn-sme-10gb": "10000"
        };

        for (const [oldCode, newCode] of Object.entries(mtnSmePlans)) {
            const result = await DataPlan.updateMany(
                { providerCode: oldCode },
                { $set: { providerCode: newCode } }
            );
            console.log(`Updated ${oldCode} to ${newCode}: ${result.modifiedCount} documents`);
        }

        console.log("\nDone!");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

fix();
