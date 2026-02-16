import { dataProvider } from "../services/dataProvider.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyProvider() {
    console.log("Verifying DataProvider airtime logic...");

    const networks = [
        { code: "1", name: "MTN (ABA)" },
        { code: "2", name: "Airtel (ABC)" },
        { code: "3", name: "Glo (ABB)" },
        { code: "4", name: "9mobile (ABD)" }
    ];

    for (const net of networks) {
        console.log(`\nTesting ${net.name}...`);
        try {
            const result = await dataProvider.buyAirtime(net.code, "08031234567", 100, "V" + Date.now().toString().slice(-6));

            if (result.error && result.error.includes("Invalid service ID")) {
                console.log(`  FAILED: Still got Invalid service ID for ${net.name}`);
            } else {
                console.log(`  PASSED: ${net.name} is recognized (Error: ${result.error || "None"})`);
            }
        } catch (e) {
            console.log(`  CRASH: ${e.message}`);
        }
    }

    // Test MTN AWUF
    console.log("\nTesting MTN AWUF (BAD)...");
    try {
        const awufResult = await dataProvider.buyAirtime("1", "08031234567", 100, "V" + Date.now().toString().slice(-6), "AWUF");
        if (awufResult.error && awufResult.error.includes("Invalid service ID")) {
            console.log("  FAILED: Got Invalid service ID for MTN AWUF");
        } else {
            console.log(`  PASSED: MTN AWUF is recognized (Error: ${awufResult.error || "None"})`);
        }
    } catch (e) {
        console.log(`  CRASH AWUF: ${e.message}`);
    }
}

verifyProvider();
