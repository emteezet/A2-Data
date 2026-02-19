import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Load service and logger after env is initialized
const { vtpassService } = await import("../services/vtpassService.js");
const { logger } = await import("../lib/logger.js");

const SCENARIOS = [
    { name: "Successful Purchase", phone: "08011111111", amount: 100 },
    { name: "Pending Response", phone: "201000000000", amount: 100 },
    { name: "Unexpected Response", phone: "500000000000", amount: 100 },
    { name: "No Response", phone: "400000000000", amount: 100 },
    { name: "Timeout (Delay)", phone: "300000000000", amount: 100 },
    { name: "Failed Purchase", phone: "08123456789", amount: 100 },
];

async function runTests() {
    logger.info("=== VTpass Sandbox Verification ===");

    // Verify Request ID generation
    const reqId = vtpassService.generateRequestId();
    logger.debug(`Generated Request ID: ${reqId}`);
    if (reqId.length >= 12 && /^\d{12}/.test(reqId)) {
        logger.success("Request ID format is valid (numeric prefix, 12+ chars)");
    } else {
        logger.error("Request ID format is invalid");
    }

    // Check if credentials are set
    if (!process.env.VTPASS_API_KEY || !process.env.VTPASS_SECRET_KEY) {
        logger.warn("VTPASS_API_KEY or VTPASS_SECRET_KEY not set in .env.local");
        logger.warn("Tests may fail due to authentication.\n");
    }

    for (const scenario of SCENARIOS) {
        logger.info(`Testing Scenario: ${scenario.name}`, { phone: scenario.phone });
        try {
            const result = await vtpassService.purchaseAirtime("mtn", scenario.amount, scenario.phone);
            if (result.success) {
                logger.success(`Result: ${result.status.toUpperCase()}`);
            } else {
                logger.error(`Result: FAILED`, result.error);
            }
        } catch (error) {
            logger.error(`Caught Exception in ${scenario.name}`, error);
        }
        console.log("-".repeat(60));
    }

    // Test Data Variations
    logger.info("Testing Data Variations Fetch (mtn-data)...");
    try {
        const variations = await vtpassService.getDataVariations("mtn-data");
        if (variations.success) {
            logger.success(`Found ${variations.data.variations.length} variations.`);
        } else {
            logger.error("Failed to fetch variations", variations.error);
        }
    } catch (error) {
        logger.error(`Data Variation Fetch Failed`, error);
    }

    logger.info("=== Verification Complete ===");
}

runTests();
