// Isolated test for Service ID mapping logic
const getAirtimeServiceId = (networkCode, serviceType = "PREMIUM") => {
    const code = String(networkCode).toLowerCase();

    // Special handling for MTN AWUF
    if ((code === "1" || code.includes("mtn")) && serviceType === "AWUF") {
        return "BAD";
    }

    // Map network codes (providerCode from our DB or numeric ID) to MobileNig service_id
    const map = {
        "1": "ABA",
        "mtn": "ABA",
        "mtn-data": "ABA",

        "2": "ABC",
        "airtel": "ABC",
        "airtel-data": "ABC",

        "3": "ABB",
        "glo": "ABB",
        "glo-data": "ABB",

        "4": "ABD",
        "9mobile": "ABD",
        "9mobile-data": "ABD",
        "etisalat": "ABD",
    };

    return map[code] || null;
};

const getDataServiceId = (networkCode) => {
    const code = String(networkCode).toLowerCase();
    const map = {
        "1": "BCA",
        "mtn": "BCA",
        "mtn-data": "BCA",

        "2": "BCD",
        "airtel": "BCD",
        "airtel-data": "BCD",

        "3": "BCC",
        "glo": "BCC",
        "glo-data": "BCC",

        "4": "BCB",
        "9mobile": "BCB",
        "9mobile-data": "BCB",
        "etisalat": "BCB",
    };
    return map[code] || null;
};

const tests = [
    { fn: getAirtimeServiceId, input: ["1"], expected: "ABA", name: "Airtime MTN (1)" },
    { fn: getAirtimeServiceId, input: ["mtn-data"], expected: "ABA", name: "Airtime MTN (mtn-data)" },
    { fn: getAirtimeServiceId, input: ["airtel-data"], expected: "ABC", name: "Airtime Airtel (airtel-data)" },
    { fn: getAirtimeServiceId, input: ["glo-data"], expected: "ABB", name: "Airtime Glo (glo-data)" },
    { fn: getAirtimeServiceId, input: ["9mobile-data"], expected: "ABD", name: "Airtime 9mobile (9mobile-data)" },
    { fn: getAirtimeServiceId, input: ["etisalat"], expected: "ABD", name: "Airtime Etisalat" },
    { fn: getAirtimeServiceId, input: ["mtn", "AWUF"], expected: "BAD", name: "Airtime MTN AWUF" },
    { fn: getAirtimeServiceId, input: ["9mobile", "PREMIUM"], expected: "ABD", name: "Airtime 9mobile PREMIUM" },

    { fn: getDataServiceId, input: ["1"], expected: "BCA", name: "Data MTN (1)" },
    { fn: getDataServiceId, input: ["mtn-data"], expected: "BCA", name: "Data MTN (mtn-data)" },
    { fn: getDataServiceId, input: ["airtel-data"], expected: "BCD", name: "Data Airtel (airtel-data)" },
    { fn: getDataServiceId, input: ["glo-data"], expected: "BCC", name: "Data Glo (glo-data)" },
    { fn: getDataServiceId, input: ["etisalat"], expected: "BCB", name: "Data Etisalat" },
];

let failed = 0;
tests.forEach(test => {
    const result = test.fn(...test.input);
    if (result === test.expected) {
        console.log(`✅ PASSED: ${test.name}`);
    } else {
        console.log(`❌ FAILED: ${test.name} (Expected: ${test.expected}, Got: ${result})`);
        failed++;
    }
});

if (failed === 0) {
    console.log("\nAll mapping tests passed! ✨");
} else {
    console.log(`\n${failed} tests failed! 🛑`);
    process.exit(1);
}
