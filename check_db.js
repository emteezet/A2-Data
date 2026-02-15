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
            for (const n of networks) {
                console.log(`\n--- ${n.name} (${n._id}) ---`);
                const plans = await DataPlan.find({ networkId: n._id });
                plans.forEach(p => console.log(`  - ${p.name}: Price=${p.price}, Code=${p.providerCode}, Type=${p.type}`));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

check();
