import mongoose from "mongoose";
import dotenv from "dotenv";
import Network from "./models/Network.js";
import DataPlan from "./models/DataPlan.js";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const networkCount = await Network.countDocuments();
        console.log(`Networks: ${networkCount}`);

        const planCount = await DataPlan.countDocuments();
        console.log(`Plans: ${planCount}`);

        if (networkCount > 0) {
            const networks = await Network.find();
            networks.forEach(n => console.log(`- ${n.name} (${n._id})`));
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

check();
