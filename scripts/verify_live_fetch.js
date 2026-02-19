
import mongoose from "mongoose";
import dotenv from "dotenv";
import { dataProvider } from "../services/dataProvider.js";
import Network from "../models/Network.js";
import DataPlan from "../models/DataPlan.js";

dotenv.config({ path: ".env.local" });

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // 1. Verify that DataPlans are indeed empty (or only contains what we just fetched)
        const planCount = await DataPlan.countDocuments();
        console.log(`Current DataPlan count: ${planCount}`);

        // 2. Test getAirtimeServiceId with mtn-data (from seed)
        const mtn = await Network.findOne({ code: "mtn" });
        if (mtn) {
            console.log(`Network MTN providerCode: ${mtn.providerCode}`);
            const serviceId = dataProvider.getAirtimeServiceId(mtn.providerCode);
            console.log(`MTN Airtime Service ID: ${serviceId} (Expected: ABA)`);
            if (serviceId === "ABA") {
                console.log("✅ Airtime Service ID Mapping Success");
            } else {
                console.log("❌ Airtime Service ID Mapping Failed");
            }

            // 3. Test Live Fetching for MTN
            console.log("\nAttempting live fetch for MTN plans...");
            const liveResult = await dataProvider.getLiveDataPlans(mtn.providerCode);
            if (liveResult.success && liveResult.plans.length > 0) {
                console.log(`✅ Success: Fetched ${liveResult.plans.length} live plans for MTN`);
                console.log(`Sample Plan: ${liveResult.plans[0].name} - ${liveResult.plans[0].price}`);
            } else {
                console.log(`❌ Failed to fetch live plans: ${liveResult.error}`);
            }
        } else {
            console.log("❌ MTN network not found in DB");
        }

        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verify();
