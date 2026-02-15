
import { dataProvider } from "../services/dataProvider.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyPayload() {
    console.log("Verifying Data Provider Payload Logic...");

    // Mock the client.post to see what it would send
    const originalPost = dataProvider.client.post;
    let capturedPayload = null;

    dataProvider.client.post = async (url, data, config) => {
        capturedPayload = data;
        return { data: { message: "success", trans_id: "mock-123" } };
    };

    try {
        // Test case 1: MTN SME (Network "1")
        console.log("\nScenario 1: MTN SME (1GB, Code 1000, Price 250)");
        await dataProvider.buyData("1000", "08012345678", "TEST-REF", "1", 250, "SME");
        console.log("Captured Amount:", capturedPayload.amount);
        if (capturedPayload.amount === 1000) {
            console.log("✅ Correct: Sent nominal amount 1000");
        } else {
            console.log("❌ Incorrect: Sent", capturedPayload.amount);
        }

        // Test case 2: Airtel SME (Network "2")
        console.log("\nScenario 2: Airtel SME (1GB, Code 1000, Price 300)");
        await dataProvider.buyData("1000", "08012345678", "TEST-REF", "2", 300, "SME");
        console.log("Captured Amount:", capturedPayload.amount);
        if (capturedPayload.amount === 300) {
            console.log("✅ Correct: Sent actual price 300 for non-MTN");
        } else {
            console.log("❌ Incorrect: Sent", capturedPayload.amount);
        }

    } catch (error) {
        console.error("Test failed:", error.message);
    } finally {
        dataProvider.client.post = originalPost;
    }
}

verifyPayload();
