
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import Network from "./models/Network.js";
import DataPlan from "./models/DataPlan.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function dump() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const networks = await Network.find().lean();
        const plans = await DataPlan.find().lean();

        const data = {
            networks,
            plans
        };

        fs.writeFileSync("db_dump.json", JSON.stringify(data, null, 2));
        console.log("Dumped to db_dump.json");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

dump();
