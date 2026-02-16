import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const secretKey = process.env.MOBILENIG_SECRET_KEY?.trim();
const baseURL = "https://enterprise.mobilenig.com/api/v2/";

async function testDataPurchaseParams() {
    const tests = [
        { id: "BCA", type: "SME", name: "MTN SME (BCA)", code: "1000" },
        { id: "BCD", type: "SME", name: "Airtel SME (BCD)", code: "MBAS300" },
        { id: "BCC", type: "SME", name: "Glo (BCC)", code: "500" },
        { id: "BCB", type: "SME", name: "9mobile SME (BCB)", code: "500" }
    ];

    for (const test of tests) {
        console.log(`\nTesting ${test.name}...`);

        // Try service_type
        try {
            const res1 = await axios.post(`${baseURL}services/`, {
                service_id: test.id,
                service_type: test.type,
                beneficiary: "08031234567",
                code: test.code,
                amount: "100", // dummy amount
                trans_id: "D1" + Date.now().toString().slice(-6)
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
                beneficiary: "08031234567",
                code: test.code,
                amount: "100",
                trans_id: "D2" + Date.now().toString().slice(-6)
            }, { headers: { "Authorization": `Bearer ${secretKey}` } });
            console.log(`  [requestType] Result:`, JSON.stringify(res2.data));
        } catch (e) {
            console.log(`  [requestType] Error:`, JSON.stringify(e.response?.data || e.message));
        }
    }
}

testDataPurchaseParams();
