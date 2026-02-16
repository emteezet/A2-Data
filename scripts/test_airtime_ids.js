import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2/";

async function testAirtime() {
    const tests = [
        { id: "ABA", type: "PREMIUM", name: "MTN Premium" },
        { id: "ABC", type: "PREMIUM", name: "Airtel Premium" },
        { id: "ABB", type: "PREMIUM", name: "Glo Premium" },
        { id: "ABD", type: "PREMIUM", name: "9mobile Standard(ABD)" },
        { id: "BAC", type: "PREMIUM", name: "9mobile Premium(BAC)" }
    ];

    for (const test of tests) {
        console.log(`\nTesting ${test.name}...`);

        // Try service_type
        try {
            const res1 = await axios.post(`${baseURL}services/`, {
                service_id: test.id,
                service_type: test.type,
                phoneNumber: "08031234567",
                amount: 100,
                trans_id: "T1" + Date.now().toString().slice(-6)
            }, { headers: { "Authorization": `Bearer ${secretKey}` } });
            console.log(`  [service_type] Result:`, JSON.stringify(res1.data));
        } catch (e) {
            console.log(`  [service_type] Error:`, JSON.stringify(e.response?.data || e.message));
        }

        // Try requestType
        try {
            const res2 = await axios.post(`${baseURL}services/`, {
                service_id: test.id,
                requestType: test.type,
                phoneNumber: "08031234567",
                amount: 100,
                trans_id: "T2" + Date.now().toString().slice(-6)
            }, { headers: { "Authorization": `Bearer ${secretKey}` } });
            console.log(`  [requestType] Result:`, JSON.stringify(res2.data));
        } catch (e) {
            console.log(`  [requestType] Error:`, JSON.stringify(e.response?.data || e.message));
        }
    }
}

testAirtime();
