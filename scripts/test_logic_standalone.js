
// Standalone logic verification
function calculateNumericAmount(dataPlanCode, dataPlanPrice, networkCode, serviceType) {
    const isMtnSme = String(networkCode) === "1" && (serviceType === "SME" || !serviceType);
    const numericAmount = isMtnSme
        ? parseFloat(dataPlanCode)
        : parseFloat(dataPlanPrice || dataPlanCode);
    return numericAmount;
}

function runTests() {
    console.log("Verifying Purchase Payload Logic...");

    const testCases = [
        { name: "MTN SME 1GB", code: "1000", price: 250, network: "1", type: "SME", expected: 1000 },
        { name: "MTN SME 2GB", code: "2000", price: 500, network: "1", type: "SME", expected: 2000 },
        { name: "MTN Coupon (Non-SME)", code: "MTN-C1", price: 300, network: "1", type: "Coupon", expected: 300 },
        { name: "Airtel SME 1GB", code: "1000", price: 300, network: "2", type: "SME", expected: 300 },
        { name: "Glo Data 1GB", code: "BCC1", price: 400, network: "3", type: "Gifting", expected: 400 },
    ];

    testCases.forEach(tc => {
        const result = calculateNumericAmount(tc.code, tc.price, tc.network, tc.type);
        console.log(`\nTest: ${tc.name}`);
        console.log(`Input: Code=${tc.code}, Price=${tc.price}, Network=${tc.network}, Type=${tc.type}`);
        console.log(`Result: ${result}`);
        if (result === tc.expected) {
            console.log("✅ PASSED");
        } else {
            console.log(`❌ FAILED (Expected ${tc.expected})`);
        }
    });
}

runTests();
