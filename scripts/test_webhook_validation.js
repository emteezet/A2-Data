
import mongoose from "mongoose";
import dotenv from "dotenv";
import WebhookLog from "../models/WebhookLog.js";

dotenv.config({ path: ".env.local" });

async function testValidation() {
    console.log("Testing WebhookLog validation...");

    // We don't need a real DB connection for validation testing if we just create the document
    // but Mongoose might complain about it. Let's try to just use the schema logic.

    const validSources = ["paystack", "vtpass", "mobilenig", "provider"];
    const invalidSources = ["unknown", "test", "vtu"];

    console.log("\nTesting valid sources:");
    for (const source of validSources) {
        try {
            const log = new WebhookLog({
                event: "test",
                source,
                payload: { key: "value" }
            });
            const error = log.validateSync();
            if (error) {
                console.log(`❌ ${source}: Validation failed: ${error.message}`);
            } else {
                console.log(`✅ ${source}: Valid`);
            }
        } catch (e) {
            console.log(`❌ ${source}: Error: ${e.message}`);
        }
    }

    console.log("\nTesting invalid sources:");
    for (const source of invalidSources) {
        try {
            const log = new WebhookLog({
                event: "test",
                source,
                payload: { key: "value" }
            });
            const error = log.validateSync();
            if (error && error.errors.source) {
                console.log(`✅ ${source}: Correctly rejected with error: ${error.errors.source.message}`);
            } else {
                console.log(`❌ ${source}: Should have been invalid but passed!`);
            }
        } catch (e) {
            console.log(`✅ ${source}: Correctly rejected with error: ${e.message}`);
        }
    }
}

testValidation();
