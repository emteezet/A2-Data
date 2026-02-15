
// Standalone airtime logic verification
function getAirtimeServiceId(networkCode) {
    const map = {
        "1": "ABA", // MTN
        "2": "ABC", // Airtel
        "3": "ABB", // Glo
        "4": "ABD", // 9mobile
    };
    return map[String(networkCode)] || null;
}

function runTests() {
    console.log("Verifying Airtime Payload Mapping...");

    const testCases = [
        { name: "MTN", networkCode: "1", expected: "ABA" },
        { name: "Airtel", networkCode: "2", expected: "ABC" },
        { name: "Glo", networkCode: "3", expected: "ABB" },
        { name: "9mobile", networkCode: "4", expected: "ABD" },
        { name: "Unknown", networkCode: "99", expected: null },
    ];

    testCases.forEach(tc => {
        const result = getAirtimeServiceId(tc.networkCode);
        console.log(`\nTest: ${tc.name}`);
        console.log(`Input: NetworkCode=${tc.networkCode}`);
        console.log(`Result: ${result}`);
        if (result === tc.expected) {
            console.log("✅ PASSED");
        } else {
            console.log(`❌ FAILED (Expected ${tc.expected})`);
        }
    });
}

runTests();
